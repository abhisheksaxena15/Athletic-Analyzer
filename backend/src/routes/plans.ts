import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

export const planRoutes = express.Router();

function categorizeActivity(activity: string): string {
  const a = (activity || '').toLowerCase();
  if (/run|marathon|jog|track/.test(a)) return 'running';
  if (/cycle|bike|biking|mtb|road/.test(a)) return 'cycling';
  if (/swim|swimming|tri/.test(a)) return 'swimming';
  if (/strength|muscle|hypertrophy|weight|resistance|powerlifting/.test(a)) return 'strength';
  if (/crossfit|hiit|metcon|functional/.test(a)) return 'hiit';
  if (/yoga|pilates|mobility|flexibility/.test(a)) return 'yoga';
  if (/football|soccer/.test(a)) return 'football';
  if (/basketball|hoops/.test(a)) return 'basketball';
  if (/tennis|badminton|squash|pickleball|racket/.test(a)) return 'racket';
  if (/row|rowing|erg/.test(a)) return 'rowing';
  if (/hike|trek|trail/.test(a)) return 'hiking';
  if (/boxing|kickboxing|mma|martial/.test(a)) return 'combat';
  return 'general';
}

function makeTemplatePlan(input: {
  goal: string;
  activity_type: string;
  fitness_level: string;
  training_experience?: string;
  training_days: number;
  session_duration: number;
  program_duration: number;
  equipment?: string;
  limitations?: string;
  training_style?: string;
}): string {
  const {
    goal,
    activity_type,
    fitness_level,
    training_experience,
    training_days,
    session_duration,
    program_duration,
    equipment,
    limitations,
    training_style,
  } = input;

  const title = `${goal} ${activity_type} – ${fitness_level} Program`;
  // Build a 7-day schedule with at least 1 recovery day and spaced intensities
  // We'll decide intensity based on training_days but still output all 7 days
  const easy = 'Easy';
  const mod = 'Moderate';
  const hi = 'High';
  const rec = 'Recovery';

  // Distribute intensities: Mon Mod, Tue Easy, Wed Recovery, Thu Mod, Fri High (if level not Beginner), Sat Mod/Easy, Sun Recovery
  const isBeginner = /beginner/i.test(fitness_level);
  const friIntensity = isBeginner ? mod : hi;
  const satIntensity = isBeginner ? easy : mod;
  const dur = `${session_duration} min`;

  const lines: string[] = [];
  lines.push('-------------------------------------');
  lines.push('PROGRAM TITLE:');
  lines.push(title);
  lines.push('');
  lines.push('PROGRAM OVERVIEW:');
  lines.push(`Total Weeks: ${program_duration}`);
  lines.push(`Weekly Sessions: ${training_days}`);
  lines.push(`Avg Duration: ${session_duration} minutes/session`);
  lines.push('Current Phase: Phase 1 – Foundation Phase');
  lines.push('');
  lines.push('-------------------------------------');
  lines.push("THIS WEEK'S SCHEDULE (WEEK 1):");
  lines.push('');

  const day = (name: string, intensity: string, title: string, desc: string, duration: string) => {
    lines.push(`${name} – ${intensity}`);
    lines.push(title);
    lines.push(desc);
    lines.push(`Duration: ${duration}`);
    lines.push('');
  };

  const equip = equipment?.trim() || 'Bodyweight/Minimal Equipment';
  const limitNote = limitations?.trim() ? ' (adapted for limitations)' : '';
  const style = training_style?.trim();

  // Simple generator by activity
  const category = categorizeActivity(activity_type);
  if (category === 'running') {
    day('Monday', mod, 'Foundation Run', 'Easy aerobic run to build base', dur);
    day('Tuesday', easy, 'Mobility + Core', 'Core stability and mobility work', dur);
    day('Wednesday', rec, 'Active Recovery', 'Walk + gentle mobility', dur);
    day('Thursday', mod, 'Intervals (Light)', 'Short intervals at controlled effort', dur);
    day('Friday', friIntensity, 'Tempo Run', 'Steady tempo at comfortably hard pace', dur);
    day('Saturday', satIntensity, 'Cross-Training', `Low-impact ${equip}${limitNote}`, dur);
    day('Sunday', rec, 'Recovery Day', 'Rest or easy walk', dur);
  } else if (category === 'cycling') {
    day('Monday', mod, 'Endurance Ride', 'Steady Z2 ride to build aerobic base', dur);
    day('Tuesday', easy, 'Mobility + Core', 'Off-bike strength endurance', dur);
    day('Wednesday', rec, 'Active Recovery', 'Very easy spin', dur);
    day('Thursday', mod, 'Cadence Drills', 'High-cadence skill work', dur);
    day('Friday', friIntensity, 'Threshold Intervals', 'Sustained efforts near FTP', dur);
    day('Saturday', satIntensity, 'Endurance Ride Mixed Terrain', 'Longer Z2/low Z3', dur);
    day('Sunday', rec, 'Recovery Day', 'Rest or gentle spin', dur);
  } else if (category === 'swimming') {
    day('Monday', mod, 'Technique + Drills', 'Drill sets: catch-up, fingertip drag', dur);
    day('Tuesday', easy, 'Mobility + Band Work', 'Shoulder prehab and mobility', dur);
    day('Wednesday', rec, 'Recovery Day', 'Light kick + easy swim', dur);
    day('Thursday', mod, 'Endurance Sets', 'Long aerobic repeats with short rest', dur);
    day('Friday', friIntensity, 'Threshold Sets', 'Shorter repeats at CSS/threshold', dur);
    day('Saturday', satIntensity, 'Mixed IM or Pull', 'Variety with pull buoy/paddles as able', dur);
    day('Sunday', rec, 'Recovery Day', 'Rest or easy mobility', dur);
  } else if (category === 'strength') {
    day('Monday', mod, 'Full Body Strength', `Compound lifts + accessories (${equip})`, dur);
    day('Tuesday', easy, 'Cardio Base', 'Low-impact cardio + mobility', dur);
    day('Wednesday', rec, 'Recovery Day', 'Walk + stretching', dur);
    day('Thursday', mod, 'Upper Body Strength', 'Push + pull focus', dur);
    day('Friday', friIntensity, 'Lower Body Strength', 'Squat/hinge focus', dur);
    day('Saturday', satIntensity, 'Conditioning', `${style || 'Circuit/HIIT (low impact as needed)'}${limitNote}`, dur);
    day('Sunday', rec, 'Recovery Day', 'Restorative mobility', dur);
  } else if (category === 'hiit') {
    day('Monday', mod, 'Metcon Fundamentals', 'Intervals across bodyweight patterns', dur);
    day('Tuesday', easy, 'Mobility + Core', 'Core control and mobility reset', dur);
    day('Wednesday', rec, 'Recovery Day', 'Walk + breathwork', dur);
    day('Thursday', mod, 'EMOM/AMRAP', 'Mixed modal circuit at controlled pace', dur);
    day('Friday', friIntensity, 'High-Intensity Intervals', 'Short bursts, full recovery', dur);
    day('Saturday', satIntensity, 'Mixed Conditioning', 'Low-impact machine circuit', dur);
    day('Sunday', rec, 'Recovery Day', 'Rest day', dur);
  } else if (category === 'yoga') {
    day('Monday', easy, 'Vinyasa Flow', 'Full-body mobility and balance', dur);
    day('Tuesday', mod, 'Strength Flow', 'Slow flow with holds', dur);
    day('Wednesday', rec, 'Recovery Day', 'Restorative / Yin session', dur);
    day('Thursday', mod, 'Stability + Core', 'Balance poses and core work', dur);
    day('Friday', easy, 'Breathwork + Stretch', 'Parasympathetic focus', dur);
    day('Saturday', mod, 'Power Flow', 'Dynamic sequence with progressions', dur);
    day('Sunday', rec, 'Recovery Day', 'Gentle mobility', dur);
  } else if (category === 'football') {
    day('Monday', mod, 'Technical Drills', 'Ball control + passing patterns', dur);
    day('Tuesday', easy, 'Mobility + Recovery', 'Hips/hamstrings + light aerobic', dur);
    day('Wednesday', rec, 'Recovery Day', 'Walk + mobility', dur);
    day('Thursday', mod, 'Small-Sided Games', 'Anaerobic conditioning with skills', dur);
    day('Friday', friIntensity, 'Speed + Agility', 'Acceleration, decel, change of direction', dur);
    day('Saturday', satIntensity, 'Strength + Power', `Gym: ${equip} as available${limitNote}`, dur);
    day('Sunday', rec, 'Recovery Day', 'Rest day', dur);
  } else if (category === 'basketball') {
    day('Monday', mod, 'Shooting Mechanics', 'Form + spot-up reps', dur);
    day('Tuesday', easy, 'Mobility + Core', 'Ankle/hip/shoulder routine', dur);
    day('Wednesday', rec, 'Recovery Day', 'Light dribbling + stretch', dur);
    day('Thursday', mod, 'Skill + Conditioning', 'Ball handling + shuttle runs', dur);
    day('Friday', friIntensity, 'Plyo + Speed', 'Jumps and quickness work', dur);
    day('Saturday', satIntensity, 'Scrimmage / Game', 'Game-like scenarios', dur);
    day('Sunday', rec, 'Recovery Day', 'Rest day', dur);
  } else if (category === 'racket') {
    day('Monday', mod, 'Footwork + Agility', 'Ladders + split-step practice', dur);
    day('Tuesday', easy, 'Mobility + Prehab', 'Shoulder/elbow care', dur);
    day('Wednesday', rec, 'Recovery Day', 'Walk + stretch', dur);
    day('Thursday', mod, 'Serve/Return Practice', 'Technique blocks and drills', dur);
    day('Friday', friIntensity, 'Match Play Intervals', 'On/off court intervals', dur);
    day('Saturday', satIntensity, 'Strength + Conditioning', `Gym or bodyweight (${equip})`, dur);
    day('Sunday', rec, 'Recovery Day', 'Rest day', dur);
  } else if (category === 'rowing') {
    day('Monday', mod, 'Steady Row', 'Z2 aerobic base on erg', dur);
    day('Tuesday', easy, 'Mobility + Core', 'Posterior chain mobility', dur);
    day('Wednesday', rec, 'Recovery Day', 'Easy row + mobility', dur);
    day('Thursday', mod, 'Rate Ladder', 'Rate changes for skill + endurance', dur);
    day('Friday', friIntensity, 'Power Intervals', 'Short hard efforts, full recovery', dur);
    day('Saturday', satIntensity, 'Long Row', 'Extended steady state', dur);
    day('Sunday', rec, 'Recovery Day', 'Rest day', dur);
  } else if (category === 'hiking') {
    day('Monday', mod, 'Incline Walk', 'Treadmill or trail incline', dur);
    day('Tuesday', easy, 'Mobility + Strength', 'Ankles/knees/hips + light strength', dur);
    day('Wednesday', rec, 'Recovery Day', 'Gentle mobility', dur);
    day('Thursday', mod, 'Pack Carry', 'Load management and pacing', dur);
    day('Friday', friIntensity, 'Hill Repeats', 'Uphill efforts with recovery', dur);
    day('Saturday', satIntensity, 'Long Hike Simulation', 'Time-on-feet endurance', dur);
    day('Sunday', rec, 'Recovery Day', 'Rest day', dur);
  } else if (category === 'combat') {
    day('Monday', mod, 'Technique Rounds', 'Shadow boxing + bag work', dur);
    day('Tuesday', easy, 'Mobility + Prehab', 'Shoulder/hip/neck focus', dur);
    day('Wednesday', rec, 'Recovery Day', 'Walk + breathing', dur);
    day('Thursday', mod, 'Pad Work + Drills', 'Combinations and footwork', dur);
    day('Friday', friIntensity, 'Conditioning Rounds', 'Intervals with full recovery', dur);
    day('Saturday', satIntensity, 'Strength + Core', `Gym session (${equip})`, dur);
    day('Sunday', rec, 'Recovery Day', 'Rest day', dur);
  } else {
    // General fitness fallback
    day('Monday', mod, 'Full Body Training', `Strength + cardio blend (${equip})`, dur);
    day('Tuesday', easy, 'Cardio Base', 'Steady-state cardio', dur);
    day('Wednesday', rec, 'Recovery Day', 'Mobility and breathing', dur);
    day('Thursday', mod, 'Strength Focus', 'Compound lifts + core', dur);
    day('Friday', friIntensity, 'Intervals', 'Short bursts with full recovery', dur);
    day('Saturday', satIntensity, 'Mixed Conditioning', 'Low impact circuit', dur);
    day('Sunday', rec, 'Recovery Day', 'Rest day', dur);
  }

  lines.push('-------------------------------------');
  lines.push('TRAINING GUIDELINES:');
  lines.push(`Focus on ${goal} using ${activity_type} while matching ${fitness_level} level in this foundation phase.`);
  lines.push('Progress gradually each week by small increases in time, reps, or intensity to ensure progressive overload.');
  lines.push(`Respect recovery days to consolidate training; prioritize sleep and hydration. Equipment: ${equip}.`);
  lines.push(limitations?.trim() ? `Adapt movements to limitations: ${limitations}.` : 'Use low-impact substitutions if discomfort arises.');
  lines.push(style ? `Honor preferred style (${style}) while maintaining technique and safety.` : 'Maintain proper technique and avoid maximal efforts in week 1.');
  lines.push('');
  lines.push('-------------------------------------');
  lines.push('');
  return lines.join('\n');
}

planRoutes.post('/generate', async (req, res) => {
  try {
    const {
      goal,
      activity_type,
      fitness_level,
      training_experience,
      training_days,
      session_duration,
      program_duration,
      equipment,
      limitations,
      training_style,
    } = req.body || {};

    // Basic validation
    if (!goal || !activity_type || !fitness_level || !training_days || !session_duration || !program_duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // Build the strict prompt with the exact required structure
    const prompt = `You are an expert fitness coach and training program designer.
Generate a complete weekly workout schedule strictly based on the user inputs below.

=====================================
USER INPUT:
Goal: ${goal}
Activity Type: ${activity_type}

User Fitness Level: ${fitness_level}
Training Experience: ${training_experience || 'N/A'}

Weekly Training Days: ${training_days}
Preferred Session Duration: ${session_duration} minutes
Program Duration: ${program_duration} weeks

Equipment Available: ${equipment || 'N/A'}
Health Limitations / Injuries: ${limitations || 'None'}
Preferred Training Style (optional): ${training_style || 'N/A'}

=====================================

Generate the output in this EXACT structure and formatting:

-------------------------------------
PROGRAM TITLE:
(Create a short, relevant program name using goal + activity + level)

PROGRAM OVERVIEW:
Total Weeks: ${program_duration}
Weekly Sessions: ${training_days}
Avg Duration: ${session_duration} minutes/session
Current Phase: Phase 1 – Foundation Phase

-------------------------------------
THIS WEEK'S SCHEDULE (WEEK 1):

For each day, follow exactly this structure:

Day Name – [Intensity Badge: Easy / Moderate / High / Recovery]
Workout Title
Workout Type or Description (1 short line)
Duration: X min

Example format:
Monday – Moderate
Full Body Strength
Compound lifts + accessories
Duration: ${session_duration} min

Generate the same format for all 7 days:
Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday

Rules for generation:
- Include at least one rest or recovery day.
- Spread high-intensity days apart.
- Follow the user’s level realistically.
- If equipment is limited, adapt workouts accordingly.
- Sessions must respect the user's preferred duration.
- If user is a beginner, avoid very high-intensity stacking.
- Include strength + cardio balance based on goal.
- Adjust intensity tags accurately.

-------------------------------------
TRAINING GUIDELINES:
Give 3–5 guidelines specific to:
- the user's goal
- the user’s fitness level
- the phase of the program
- safety + progressive overload
- recovery needs

-------------------------------------

DO NOT use bullet points.
DO NOT add extra explanations.
DO NOT use markdown.
Return only the structured training plan.`;

    // Call OpenAI Chat Completions API via fetch
    // If no key, skip remote call and use template immediately
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim().length < 20) {
      const planText = makeTemplatePlan({
        goal,
        activity_type,
        fitness_level,
        training_experience,
        training_days,
        session_duration,
        program_duration,
        equipment,
        limitations,
        training_style,
      });
      return res.json({ plan: planText, source: 'fallback', category: categorizeActivity(activity_type) });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are a precise fitness program generator. Follow the requested output structure exactly.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let msg = 'Failed to generate plan.';
      let insufficient = false;
      try {
        const err = JSON.parse(text);
        msg = err?.error?.message || msg;
        insufficient = err?.error?.code === 'insufficient_quota' || /quota/i.test(msg);
      } catch {}
      console.error('OpenAI API error:', response.status, text);
      if (response.status === 429 || insufficient) {
        // Use deterministic fallback to keep UX working
        const planText = makeTemplatePlan({
          goal,
          activity_type,
          fitness_level,
          training_experience,
          training_days,
          session_duration,
          program_duration,
          equipment,
          limitations,
          training_style,
        });
        return res.json({ plan: planText, source: 'fallback', category: categorizeActivity(activity_type) });
      }
      return res.status(502).json({ error: msg, status: response.status });
    }

    const data: any = await response.json();
    const planText = data?.choices?.[0]?.message?.content?.trim();

    if (!planText) {
      return res.status(500).json({ error: 'No plan content returned from OpenAI.' });
    }

    return res.json({ plan: planText, source: 'openai', category: categorizeActivity(activity_type) });
  } catch (e: any) {
    console.error('Plan generation error:', e);
    const message = e?.message || 'Internal server error';
    // Common hints for troubleshooting
    const hint = message.includes('fetch')
      ? 'Network error calling OpenAI. Check internet connectivity, proxy/firewall, or try again.'
      : undefined;
    return res.status(500).json({ error: message, hint });
  }
});
