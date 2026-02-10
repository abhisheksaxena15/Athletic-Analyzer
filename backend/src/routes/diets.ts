import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

export const dietRoutes = express.Router();

function makeDietTemplate(input: {
  goal: string;
  diet_type: string;
  meals_per_day: number;
  calories?: number;
  restrictions?: string;
  preferences?: string;
}): string {
  const { goal, diet_type, meals_per_day, calories, restrictions, preferences } = input;
  const kcal = calories || 2000;
  const title = `${goal} ${diet_type} Diet – ${meals_per_day} Meals`;

  const lines: string[] = [];
  lines.push('-------------------------------------');
  lines.push('PROGRAM TITLE:');
  lines.push(title);
  lines.push('');
  lines.push('PROGRAM OVERVIEW:');
  lines.push(`Daily Calories: ${kcal}`);
  lines.push(`Meals Per Day: ${meals_per_day}`);
  lines.push('Macro Split: Balanced distribution tailored to goal');
  lines.push('Current Phase: Phase 1 – Foundation Phase');
  lines.push('');
  lines.push('-------------------------------------');
  lines.push("THIS WEEK'S SCHEDULE (WEEK 1):");
  lines.push('');

  // Produce 7 days, each with 3 parts: Breakfast / Lunch / Dinner (+ Snacks if >3 meals)
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  for (let idx = 0; idx < dayNames.length; idx++) {
    const d = dayNames[idx];
    lines.push(`${d} – Moderate`);
    lines.push('Daily Meal Plan');
    lines.push(`${diet_type} meals focusing on whole foods, lean protein, quality carbs, and healthy fats`);
    lines.push('Duration: All day');
    // Concrete labeled meals per day
    const meals = buildMealsLabeled(diet_type, meals_per_day, kcal, idx);
    meals.forEach(({ label, item }) => lines.push(`${label}: ${item}`));
    lines.push('');
  }

  lines.push('-------------------------------------');
  lines.push('TRAINING GUIDELINES:');
  lines.push(`Match portions to your ${goal} target; adjust serving sizes to stay near ${kcal} kcal/day.`);
  lines.push('Prioritize protein each meal; include vegetables and fiber to support satiety and digestion.');
  lines.push('Hydrate with water regularly; add electrolytes around workouts as needed.');
  lines.push(restrictions ? `Respect restrictions: ${restrictions}.` : 'Avoid ultra-processed foods; select minimally processed options.');
  lines.push(preferences ? `Incorporate preferences or cuisines: ${preferences}.` : 'Keep variety across the week to ensure micronutrient coverage.');
  lines.push('');
  lines.push('-------------------------------------');
  lines.push('');
  return lines.join('\n');
}

function buildMealsLabeled(dietType: string, mealsPerDay: number, kcal: number, dayIndex = 0): Array<{label: string; item: string}> {
  // Very simple template meals; later can be more granular by diet type
  const perMeal = Math.max(250, Math.round(kcal / Math.max(3, Math.min(6, mealsPerDay))));
  const baseBalanced = [
    `Oats bowl with milk or soy, berries, nuts (~${perMeal} kcal)`,
    `Greek yogurt or tofu with fruit, seeds (~${perMeal} kcal)`,
    `Grain bowl: rice/quinoa, lean protein (chicken/tofu), veggies (~${perMeal} kcal)`,
    `Fruit + handful of nuts (~${perMeal} kcal)`,
    `Salmon/legumes, potato or whole grains, salad (~${perMeal} kcal)`,
    `Cottage cheese or soy yogurt (~${perMeal} kcal)`,
    `Whole-grain toast + peanut butter + banana (~${perMeal} kcal)`,
    `Chicken/tofu burrito bowl (beans, salsa) (~${perMeal} kcal)`,
    `Pasta with tomato sauce + lean protein + salad (~${perMeal} kcal)`,
  ];
  const baseVeg = [
    `Veg omelette or tofu scramble + toast (~${perMeal} kcal)`,
    `Chana/bean salad with veggies (~${perMeal} kcal)`,
    `Dal + brown rice + veg stir-fry (~${perMeal} kcal)`,
    `Fruit + nuts (~${perMeal} kcal)`,
    `Paneer/tofu curry + roti + salad (~${perMeal} kcal)`,
    `Warm milk/soy milk + seeds (~${perMeal} kcal)`,
    `Upma/poha with peas + peanuts (~${perMeal} kcal)`,
    `Rajma/soy chunks with rice + salad (~${perMeal} kcal)`,
    `Veg pasta with legumes + olive oil (~${perMeal} kcal)`,
  ];
  const keto = [
    `Eggs/tofu + avocado + greens (~${perMeal} kcal)`,
    `Cheese/cottage cheese + olives (~${perMeal} kcal)`,
    `Chicken/tofu with non-starchy veg + olive oil (~${perMeal} kcal)`,
    `Nuts (~${perMeal} kcal)`,
    `Fish/paneer with salad + dressing (~${perMeal} kcal)`,
    `Greek yogurt/soy yogurt (~${perMeal} kcal)`,
    `Zoodles with pesto + protein (~${perMeal} kcal)`,
    `Egg muffins/tofu muffins + veg (~${perMeal} kcal)`,
  ];
  let bank = baseBalanced;
  const t = dietType.toLowerCase();
  if (t.includes('vegetarian') || t.includes('mediterranean') || t.includes('balanced') || t.includes('paleo')) {
    bank = t.includes('vegetarian') ? baseVeg : baseBalanced;
  } else if (t.includes('keto')) {
    bank = keto;
  } else if (t.includes('vegan')) {
    bank = baseVeg.map(m => m.replace(/paneer|milk|cheese|yogurt/gi, 'tofu/soy milk/plant yogurt'));
  }
  const n = Math.max(3, Math.min(6, mealsPerDay));
  // rotate bank by day index to create variety
  const rot = dayIndex % bank.length;
  const rotated = bank.slice(rot).concat(bank.slice(0, rot));
  const picked = rotated.slice(0, n);
  // Map to labels
  const labels3 = ['Breakfast','Lunch','Dinner'];
  const labels4 = ['Breakfast','Lunch','Snack','Dinner'];
  const labels5 = ['Breakfast','Snack','Lunch','Snack','Dinner'];
  const labels6 = ['Breakfast','Snack','Lunch','Snack','Dinner','Evening Snack'];
  const labels = n === 3 ? labels3 : n === 4 ? labels4 : n === 5 ? labels5 : labels6;
  return picked.map((item, idx) => ({ label: labels[idx], item }));
}

// POST /api/diets/generate
// Uses OpenAI when available; falls back to template when key is missing or quota exceeded

dietRoutes.post('/generate', async (req, res) => {
  try {
    const { goal, diet_type, meals_per_day, calories, restrictions, preferences } = req.body || {};

    if (!goal || !diet_type || !meals_per_day) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const prompt = `You are an expert nutrition coach. Create a 7-day diet plan strictly formatted as below.\n\nUSER INPUT:\nGoal: ${goal}\nDiet Type: ${diet_type}\nMeals per Day: ${meals_per_day}\nCalories: ${calories || 'N/A'}\nRestrictions: ${restrictions || 'None'}\nPreferences: ${preferences || 'N/A'}\n\nFollow this EXACT structure and formatting (no bullets, no markdown):\n\n-------------------------------------\nPROGRAM TITLE:\n(Create a short, relevant program name using goal + diet type)\n\nPROGRAM OVERVIEW:\nDaily Calories: ${calories || 'target per goal'}\nMeals Per Day: ${meals_per_day}\nMacro Split: Align to goal and diet type\nCurrent Phase: Phase 1 – Foundation Phase\n\n-------------------------------------\nTHIS WEEK'S SCHEDULE (WEEK 1):\n\nFor each day, output exactly:\nDay Name – [Intensity Badge: Easy / Moderate / High / Recovery]\nMeal Plan Title\nOne-line description\nDuration: All day\nAfter the duration line, output exactly ${Math.max(3, Math.min(6, meals_per_day))} lines using these labels where applicable: Breakfast:, Lunch:, Dinner:, Snack:, Evening Snack:. Each line must be in the form\n<Label>: <foods and portions>\nEnsure day-to-day variety: avoid repeating the same main dish across days; rotate proteins, grains, and cuisines.\nDo not include bullets; one meal per line.\n\nDays: Monday through Sunday in order.\n\n-------------------------------------\nTRAINING GUIDELINES:\nGive 3–5 concise diet guidelines tailored to the inputs.\n\n-------------------------------------\n\nDO NOT use bullet points.\nDO NOT add extra explanations.\nDO NOT use markdown.\nReturn only the structured plan text.`;

    // Fallback if no key
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim().length < 20) {
      return res.json({ plan: makeDietTemplate({ goal, diet_type, meals_per_day, calories, restrictions, preferences }) });
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
          { role: 'system', content: 'You produce strictly formatted diet plans.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let msg = 'Failed to generate diet plan.';
      let insufficient = false;
      try {
        const err = JSON.parse(text);
        msg = err?.error?.message || msg;
        insufficient = err?.error?.code === 'insufficient_quota' || /quota/i.test(msg);
      } catch {}
      if (response.status === 429 || insufficient) {
        return res.json({ plan: makeDietTemplate({ goal, diet_type, meals_per_day, calories, restrictions, preferences }) });
      }
      return res.status(502).json({ error: msg, status: response.status });
    }

    const data: any = await response.json();
    const planText = data?.choices?.[0]?.message?.content?.trim();
    if (!planText) {
      return res.status(500).json({ error: 'No plan content returned from OpenAI.' });
    }

    return res.json({ plan: planText });
  } catch (e: any) {
    const message = e?.message || 'Internal server error';
    return res.status(500).json({ error: message });
  }
});
