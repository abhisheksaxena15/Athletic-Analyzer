import express from 'express';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

export const injuryRoutes = express.Router();

// Lightweight cached summary from CSV dataset
let cachedStats: {
  count: number;
  hrMean: number;
  hrM2: number; // for variance via Welford
  accelMagSamples: number[];
} | null = null;

async function ensureStats(): Promise<void> {
  if (cachedStats) return;
  const csvPath = path.resolve(process.cwd(), '..', 'ml_assets', 'clean_pamap_5.csv');
  const exists = fs.existsSync(csvPath);
  cachedStats = { count: 0, hrMean: 0, hrM2: 0, accelMagSamples: [] };
  if (!exists) return; // operate with defaults if dataset not present

  const stream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let lineIndex = 0;
  let hrIdx = -1, axIdx = -1, ayIdx = -1, azIdx = -1;
  const maxSamples = 20000; // cap to keep memory low

  for await (const line of rl) {
    if (!line) continue;
    if (lineIndex === 0) {
      const headers = line.split(',');
      hrIdx = headers.indexOf('heart_rate');
      axIdx = headers.indexOf('hand_acc6_x');
      ayIdx = headers.indexOf('hand_acc6_y');
      azIdx = headers.indexOf('hand_acc6_z');
      lineIndex++;
      continue;
    }
    const cols = line.split(',');
    const hrRaw = cols[hrIdx];
    const ax = parseFloat(cols[axIdx]);
    const ay = parseFloat(cols[ayIdx]);
    const az = parseFloat(cols[azIdx]);

    const hr = parseFloat(hrRaw);
    if (isFinite(hr)) {
      // Welford online mean/variance
      cachedStats!.count += 1;
      const delta = hr - cachedStats!.hrMean;
      cachedStats!.hrMean += delta / cachedStats!.count;
      const delta2 = hr - cachedStats!.hrMean;
      cachedStats!.hrM2 += delta * delta2;
    }

    const mag = isFinite(ax) && isFinite(ay) && isFinite(az) ? Math.sqrt(ax*ax + ay*ay + az*az) : NaN;
    if (isFinite(mag) && cachedStats!.accelMagSamples.length < maxSamples) {
      cachedStats!.accelMagSamples.push(mag);
    }
    if (cachedStats!.accelMagSamples.length >= maxSamples) {
      // still continue to improve HR stats, but optional to break early if needed
    }
    lineIndex++;
  }
}

function percentile(samples: number[], p: number): number | null {
  if (!samples.length) return null;
  const sorted = [...samples].sort((a,b)=> a-b);
  const idx = Math.min(sorted.length-1, Math.max(0, Math.round((p/100) * (sorted.length-1))));
  return sorted[idx];
}

function classify(acwr: number, hrvChangePct: number, hrZ: number, intensityPct: number | null) {
  let score = 0;
  // ACWR contribution
  score += Math.max(0, (acwr - 1) * 40); // 0..20 for 1.5, scaled
  // HRV drop contribution (negative change increases score)
  score += hrvChangePct < 0 ? Math.min(30, Math.abs(hrvChangePct)) : 0;
  // HR z-score contribution
  score += isFinite(hrZ) ? Math.max(0, (hrZ - 0.5) * 10) : 0; // only above mean contributes
  // Intensity percentile contribution
  if (intensityPct != null) score += Math.max(0, (intensityPct - 70) * 0.5);

  const bounded = Math.max(0, Math.min(100, Math.round(score)));
  let level: 'low' | 'medium' | 'high' = 'low';
  if (bounded >= 65) level = 'high';
  else if (bounded >= 35) level = 'medium';
  return { score: bounded, level };
}

injuryRoutes.post('/analyze', async (req, res) => {
  try {
    await ensureStats();
    const { activity, inputs, recentLoads, hrvEntries } = req.body || {};
    const durationMin = Number(inputs?.durationMin) || 0;
    const avgHeartRate = Number(inputs?.avgHeartRate) || NaN;
    const soreness = Number(inputs?.soreness || 0); // optional 0-10

    // Compute ACWR from provided loads
    const now = new Date();
    const byDay = new Map<string, number>();
    (Array.isArray(recentLoads) ? recentLoads : []).forEach((d: any) => {
      const day = new Date(d.date).toISOString().split('T')[0];
      byDay.set(day, (byDay.get(day) || 0) + Number(d.load || 0));
    });
    const daily = Array.from(byDay.entries()).map(([date, load])=>({ date, load }));
    const acute = daily.filter(d=> (now.getTime()-new Date(d.date).getTime())/86400000 < 7).reduce((s,d)=> s+d.load, 0);
    const chronic = daily.filter(d=> (now.getTime()-new Date(d.date).getTime())/86400000 < 28).reduce((s,d)=> s+d.load, 0);
    const chronicAvgWeekly = chronic/4 || 0;
    const acwr = chronicAvgWeekly>0 ? acute/chronicAvgWeekly : 1;

    // HRV recent change
    const hrvSorted = (Array.isArray(hrvEntries)? hrvEntries: []).slice().sort((a,b)=> new Date(a.date).getTime()-new Date(b.date).getTime());
    const cutoffPrev = new Date(now); cutoffPrev.setDate(cutoffPrev.getDate()-14);
    const cutoffLast = new Date(now); cutoffLast.setDate(cutoffLast.getDate()-7);
    const last7 = hrvSorted.filter((h:any)=> new Date(h.date) >= cutoffLast).map((h:any)=> Number(h.rMSSD)||0);
    const prev7 = hrvSorted.filter((h:any)=> new Date(h.date) >= cutoffPrev && new Date(h.date) < cutoffLast).map((h:any)=> Number(h.rMSSD)||0);
    const avg = (arr:number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
    const hrvAvgLast7 = avg(last7), hrvAvgPrev7 = avg(prev7);
    const hrvChangePct = hrvAvgPrev7>0 ? ((hrvAvgLast7-hrvAvgPrev7)/hrvAvgPrev7)*100 : 0;

    // Stats from dataset
    const count = cachedStats?.count || 0;
    const hrMean = cachedStats?.hrMean || 0;
    const hrVar = count>1 ? (cachedStats!.hrM2 / (count-1)) : 0;
    const hrStd = hrVar>0 ? Math.sqrt(hrVar) : 1;
    const hrZ = isFinite(avgHeartRate) ? (avgHeartRate - hrMean) / hrStd : NaN;

    let intensityPct: number | null = null;
    if (cachedStats && cachedStats.accelMagSamples.length) {
      // Use duration as a proxy to index into a percentile band if accel data not present in request
      // For now, map duration to a rough intensity percentile assumption
      const assumedMag = Math.min(12, Math.max(4, 4 + (durationMin/60)*6));
      // Compute percentile position for assumedMag
      const sorted = [...cachedStats.accelMagSamples].sort((a,b)=> a-b);
      const pos = sorted.findIndex(v=> v >= assumedMag);
      intensityPct = pos < 0 ? 100 : Math.round((pos/(sorted.length-1))*100);
    }

    const cls = classify(acwr, hrvChangePct, hrZ, intensityPct);

    const factors = [
      { key: 'ACWR', value: acwr, label: 'Acute:Chronic load ratio' },
      { key: 'HRVChangePct', value: hrvChangePct, label: 'HRV change vs prior week (%)' },
      { key: 'HR_Z', value: hrZ, label: 'Heart rate z-score vs dataset' },
      { key: 'IntensityPct', value: intensityPct, label: 'Estimated intensity percentile' },
      { key: 'Soreness', value: soreness, label: 'Self-reported soreness (0-10)' },
    ];

    const recs: string[] = [];
    if (cls.level === 'high') {
      recs.push('Reduce weekly volume by 25–35% for 1–2 weeks.');
      recs.push('Prioritize sleep (7.5–9h) and low-intensity aerobic sessions.');
      recs.push('Avoid back-to-back high-intensity days; add mobility and strength stability work.');
    } else if (cls.level === 'medium') {
      recs.push('Cap weekly progression to <10–15%.');
      recs.push('Add one extra rest or active recovery day.');
      recs.push('Monitor morning HRV for 7 days and reassess.');
    } else {
      recs.push('Maintain current plan; keep 80% of work in Zone 2.');
      recs.push('Keep strength work 2x/week for resilience.');
    }

    res.json({
      ok: true,
      model: 'dataset_baseline_v1',
      activity,
      acwr,
      hrvChangePct,
      hrZ,
      intensityPct,
      score: cls.score,
      level: cls.level,
      factors,
      recommendations: recs,
      dataset: {
        hrMean,
        hrStd,
        accelMagP10: percentile(cachedStats?.accelMagSamples || [], 10),
        accelMagP50: percentile(cachedStats?.accelMagSamples || [], 50),
        accelMagP90: percentile(cachedStats?.accelMagSamples || [], 90),
        samples: count,
      },
    });
  } catch (err: any) {
    console.error('injury/analyze error', err);
    res.status(500).json({ ok: false, error: err?.message || 'analysis failed' });
  }
});
