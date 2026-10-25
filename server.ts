import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set user agent for telemetry as required by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Helper: safe allergen check
function detectAllergenConflicts(ingredients: string[], declaredAllergies: string[]): string[] {
  if (!declaredAllergies || declaredAllergies.length === 0) return [];
  const conflicts: string[] = [];
  const normalizedAllergies = declaredAllergies.map(a => a.toLowerCase().trim()).filter(Boolean);

  for (const ingredient of ingredients) {
    const ingLower = ingredient.toLowerCase();
    for (const allergy of normalizedAllergies) {
      if (ingLower.includes(allergy) || (allergy === 'dairy' && (ingLower.includes('milk') || ingLower.includes('cheese') || ingLower.includes('butter') || ingLower.includes('cream')))) {
        conflicts.push(`Warning: "${ingredient}" may contain allergen "${allergy}"`);
      }
    }
  }
  return Array.from(new Set(conflicts));
}

// 1. Pantry Analyzer Endpoint
app.post('/api/pantry/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', declaredAllergies = [] } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in the environment.',
      });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are a food recognition and kitchen pantry analyzer for a family cooking application.
Analyze this photo of a pantry, refrigerator, ingredients, or food packaging.
Identify all visible food items, fresh produce, packages, jars, bottles, and ingredients.
For each item:
1. "name": clear, common ingredient name (e.g. "Organic Baby Spinach", "Whole Milk", "Red Bell Pepper").
2. "category": Choose one of: "Produce", "Dairy & Eggs", "Meat & Seafood", "Grains & Pasta", "Canned & Jarred", "Baking & Spices", "Condiments & Sauces", "Snacks & Beverages", "Other".
3. "estimatedQuantity": estimated count, volume, or pack size (e.g. "1 bag (approx 5 oz)", "6 eggs", "1 jar (half full)").
4. "confidenceScore": integer 50 to 99 representing confidence percentage.
5. "freshnessStatus": visually assessable state: "Fresh", "Use Soon", or "Check Freshness".
6. "estimatedDaysUntilExpiry": estimated remaining shelf life in days based on typical visual storage condition (e.g. leafy greens 3, canned beans 180, milk 5). Use null if completely unknown.
7. "notes": short friendly kitchen observation (e.g. "Looks crisp and vibrant" or "Check seal before opening").

Never claim visually inferred expiration dates as a verified fact.
If no food is recognized, return an empty array of items.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  estimatedQuantity: { type: Type.STRING },
                  confidenceScore: { type: Type.INTEGER },
                  freshnessStatus: { type: Type.STRING },
                  estimatedDaysUntilExpiry: { type: Type.INTEGER },
                  notes: { type: Type.STRING },
                },
                required: ['name', 'category', 'estimatedQuantity', 'confidenceScore', 'freshnessStatus'],
              },
            },
            summary: { type: Type.STRING },
          },
          required: ['items'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"items":[]}');

    // Run allergy checks if user provided family allergies
    const checkedItems = (parsed.items || []).map((item: any) => {
      const conflicts = detectAllergenConflicts([item.name], declaredAllergies);
      return {
        ...item,
        allergenAlert: conflicts.length > 0 ? conflicts.join('; ') : undefined,
      };
    });

    return res.json({
      items: checkedItems,
      summary: parsed.summary || `Detected ${checkedItems.length} food items.`,
    });
  } catch (error: any) {
    console.error('Pantry analysis error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze pantry image. Please try again with a clearer photo.',
    });
  }
});

// 2. 7-Day Meal Plan Generator Endpoint
app.post('/api/meal-plan/generate', async (req: Request, res: Response) => {
  try {
    const { familyProfile, pantryItems = [], prioritizeExpiring = true, targetWeekLabel = 'This Week' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured.',
      });
    }

    const allergies = familyProfile?.allergies || [];
    const restrictions = familyProfile?.dietaryRestrictions || [];
    const preferences = familyProfile?.dietaryPreferences || [];
    const cuisines = familyProfile?.preferredCuisines || ['American', 'Italian', 'Mexican'];
    const disliked = familyProfile?.dislikedIngredients || [];
    const budget = familyProfile?.budgetRange || 'moderate';
    const cookingTime = familyProfile?.maxCookingTimeMinutes || 45;
    const members = familyProfile?.members || [{ name: 'Family', ageGroup: 'adult' }];
    const servings = familyProfile?.servings || 4;

    const expiringSoonPantry = pantryItems
      .filter((p: any) => p.freshnessStatus === 'Use Soon' || (p.estimatedDaysUntilExpiry && p.estimatedDaysUntilExpiry <= 4))
      .map((p: any) => `${p.name} (${p.quantity || 'available'})`);

    const availablePantry = pantryItems.map((p: any) => `${p.name} (${p.quantity || 'available'})`).slice(0, 20);

    const prompt = `You are an expert family nutrition specialist and chef.
Create a complete, delicious, well-balanced 7-Day Meal Plan for this family:
- Family Members: ${JSON.stringify(members)}
- Servings per meal: ${servings}
- STRICT ALLERGIES (MUST EXCLUDE ENTIRELY, ZERO EXCEPTIONS): ${allergies.length ? allergies.join(', ') : 'None'}
- Dietary Restrictions: ${restrictions.length ? restrictions.join(', ') : 'None'}
- Preferences: ${preferences.length ? preferences.join(', ') : 'Balanced, family-friendly'}
- Preferred Cuisines: ${cuisines.join(', ')}
- Disliked Ingredients: ${disliked.length ? disliked.join(', ') : 'None'}
- Budget Level: ${budget}
- Max Weekday Cooking Time: ${cookingTime} minutes
- Available Pantry Items: ${availablePantry.join(', ') || 'Standard pantry staples'}
- PRIORITY ITEMS (Use soonest to eliminate food waste): ${expiringSoonPantry.join(', ') || 'Use available fresh items'}

REQUIREMENTS:
1. Provide all 7 days (Monday through Sunday or Day 1 through Day 7).
2. Each day MUST have:
   - breakfast
   - lunch
   - dinner
   - snack
3. Prioritize using the priority pantry items within the first 3 days to avoid waste!
4. Strictly NO restricted allergens in ANY ingredients or instructions.
5. Provide realistic prep and cook times, complete ingredient list with quantities, step-by-step instructions (3 to 6 clear steps), and estimated nutritional information per serving.
6. Make meals kid-friendly and adaptable for mixed-age households.`;

    const mealRecipeSchema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        mealType: { type: Type.STRING },
        prepTimeMinutes: { type: Type.INTEGER },
        cookTimeMinutes: { type: Type.INTEGER },
        servings: { type: Type.INTEGER },
        difficulty: { type: Type.STRING },
        cuisine: { type: Type.STRING },
        ingredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              quantity: { type: Type.STRING },
              isPantryItem: { type: Type.BOOLEAN },
              notes: { type: Type.STRING },
            },
            required: ['item', 'quantity'],
          },
        },
        instructions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        estimatedNutrition: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.INTEGER },
            proteinGrams: { type: Type.INTEGER },
            carbsGrams: { type: Type.INTEGER },
            fatGrams: { type: Type.INTEGER },
            fiberGrams: { type: Type.INTEGER },
          },
          required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
        },
        dietaryTags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        allergenWarnings: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        wasteReductionNotes: { type: Type.STRING },
      },
      required: ['title', 'description', 'mealType', 'prepTimeMinutes', 'cookTimeMinutes', 'servings', 'ingredients', 'instructions', 'estimatedNutrition'],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planId: { type: Type.STRING },
            summary: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dayName: { type: Type.STRING },
                  breakfast: mealRecipeSchema,
                  lunch: mealRecipeSchema,
                  dinner: mealRecipeSchema,
                  snack: mealRecipeSchema,
                  dailyNutritionSummary: {
                    type: Type.OBJECT,
                    properties: {
                      totalCalories: { type: Type.INTEGER },
                      totalProtein: { type: Type.INTEGER },
                      totalCarbs: { type: Type.INTEGER },
                      totalFat: { type: Type.INTEGER },
                    },
                  },
                },
                required: ['dayNumber', 'dayName', 'breakfast', 'lunch', 'dinner'],
              },
            },
          },
          required: ['days', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Post-generation Allergy Safety Audit
    if (allergies.length > 0 && parsed.days) {
      for (const day of parsed.days) {
        for (const mType of ['breakfast', 'lunch', 'dinner', 'snack']) {
          const meal = day[mType];
          if (meal && meal.ingredients) {
            const ingNames = meal.ingredients.map((i: any) => i.item);
            const conflicts = detectAllergenConflicts(ingNames, allergies);
            if (conflicts.length > 0) {
              meal.allergenWarnings = [...(meal.allergenWarnings || []), ...conflicts];
            }
          }
        }
      }
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Meal plan generation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate 7-day meal plan. Please check inputs and try again.',
    });
  }
});

// 3. AI Recipe Customizer Endpoint
app.post('/api/recipe/generate', async (req: Request, res: Response) => {
  try {
    const {
      mainIngredient,
      availablePantry = [],
      cuisine = 'Any',
      dietaryRequirements = [],
      servings = 4,
      maxPrepTime = 45,
      difficulty = 'Medium',
      mealType = 'dinner',
      additionalPrompt = '',
      allergies = [],
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `You are a family recipe master chef.
Create one complete, customized, highly practical home-cooking recipe:
- Main ingredient: ${mainIngredient || 'Family choice'}
- Available pantry items to utilize: ${availablePantry.length ? availablePantry.join(', ') : 'Standard kitchen staples'}
- Desired cuisine: ${cuisine}
- Meal type: ${mealType}
- Target servings: ${servings}
- Max total time (prep + cook): ${maxPrepTime} minutes
- Cooking difficulty: ${difficulty}
- Dietary requirements: ${dietaryRequirements.length ? dietaryRequirements.join(', ') : 'None'}
- STRICT ALLERGIES (Must NEVER include): ${allergies.length ? allergies.join(', ') : 'None'}
- Specific family request: "${additionalPrompt || 'A warm, comforting, kid-approved family meal'}"

Provide clear step-by-step cooking instructions, ingredient quantities scaled for ${servings} people, estimated nutritional breakdown, smart substitutions for common allergies or missing ingredients, and food storage tips.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            mealType: { type: Type.STRING },
            prepTimeMinutes: { type: Type.INTEGER },
            cookTimeMinutes: { type: Type.INTEGER },
            servings: { type: Type.INTEGER },
            difficulty: { type: Type.STRING },
            cuisine: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  isPantryItem: { type: Type.BOOLEAN },
                  notes: { type: Type.STRING },
                },
                required: ['item', 'quantity'],
              },
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            estimatedNutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.INTEGER },
                proteinGrams: { type: Type.INTEGER },
                carbsGrams: { type: Type.INTEGER },
                fatGrams: { type: Type.INTEGER },
                fiberGrams: { type: Type.INTEGER },
              },
              required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
            },
            substitutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  replacement: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['original', 'replacement'],
              },
            },
            storageTips: { type: Type.STRING },
            dietaryTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            allergenWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'title',
            'description',
            'prepTimeMinutes',
            'cookTimeMinutes',
            'servings',
            'difficulty',
            'ingredients',
            'instructions',
            'estimatedNutrition',
          ],
        },
      },
    });

    const recipe = JSON.parse(response.text || '{}');

    // Allergen verification
    if (allergies.length > 0 && recipe.ingredients) {
      const ingNames = recipe.ingredients.map((i: any) => i.item);
      const conflicts = detectAllergenConflicts(ingNames, allergies);
      if (conflicts.length > 0) {
        recipe.allergenWarnings = [...(recipe.allergenWarnings || []), ...conflicts];
      }
    }

    return res.json(recipe);
  } catch (error: any) {
    console.error('Recipe generation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate recipe.',
    });
  }
});

// 4. Conversational AI Chef Assistant Endpoint
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], familyProfile = {}, pantryItems = [], currentMealPlanSummary = '' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const allergies = familyProfile.allergies || [];
    const restrictions = familyProfile.dietaryRestrictions || [];
    const members = familyProfile.members || [];
    const expiringPantry = pantryItems
      .filter((p: any) => p.freshnessStatus === 'Use Soon' || (p.estimatedDaysUntilExpiry && p.estimatedDaysUntilExpiry <= 3))
      .map((p: any) => p.name);
    const allPantry = pantryItems.map((p: any) => `${p.name} (${p.quantity || 'available'})`).join(', ');

    const systemInstruction = `You are "Chef Remy", the warm, intelligent, encouraging culinary assistant of FamilyChef AI.
You help families cook healthy meals, utilize pantry stock, reduce food waste, adapt recipes, and simplify dinner time.

FAMILY CONTEXT:
- Household Members: ${JSON.stringify(members)}
- STRICT ALLERGIES: ${allergies.length ? allergies.join(', ') : 'None'}. (CRITICAL: NEVER suggest ingredients containing these allergens!).
- Dietary Restrictions: ${restrictions.length ? restrictions.join(', ') : 'None'}.
- Available Pantry Items: ${allPantry || 'Standard home pantry'}.
- Items Expiring Soon (Prioritize for waste reduction!): ${expiringPantry.length ? expiringPantry.join(', ') : 'None marked urgent'}.
- Active Meal Plan Context: ${currentMealPlanSummary || 'Standard weekly plan'}.

TONE & BEHAVIOR:
- Warm, practical, encouraging, and family-oriented.
- When suggesting a meal or quick snack, clearly reference what they already have in their pantry.
- If they ask for substitutions, always respect allergies first and suggest readily accessible household alternatives.
- Offer actionable advice in bullet points or numbered steps where appropriate.
- Suggest 2-3 brief follow-up questions or next actions at the end of your answer.`;

    // Construct contents
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Include recent history (limit to last 8 turns)
    const recentHistory = history.slice(-8);
    for (const h of recentHistory) {
      contents.push({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      });
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm here to help you whip up something great for dinner! What ingredients would you like to explore?";

    return res.json({
      reply: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chef chat error:', error);
    return res.status(500).json({
      error: error.message || 'The AI Chef is momentarily resting. Please try asking again!',
    });
  }
});

// 5. Nutrition Estimator Endpoint (for custom foods/meals)
app.post('/api/nutrition/analyze', async (req: Request, res: Response) => {
  try {
    const { mealDescription, portionSize = '1 serving' } = req.body;

    if (!mealDescription) {
      return res.status(400).json({ error: 'Meal description is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Estimate the nutritional values for this meal or food item:
Meal: "${mealDescription}"
Portion size: "${portionSize}"
Provide realistic estimated calories, protein (g), carbs (g), fat (g), and dietary fiber (g), plus a brief 1-sentence health highlight. Note that these are AI estimates, not certified laboratory measurements.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            estimatedCalories: { type: Type.INTEGER },
            proteinGrams: { type: Type.INTEGER },
            carbsGrams: { type: Type.INTEGER },
            fatGrams: { type: Type.INTEGER },
            fiberGrams: { type: Type.INTEGER },
            healthyHighlight: { type: Type.STRING },
          },
          required: ['foodName', 'estimatedCalories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Nutrition estimation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to estimate nutrition.',
    });
  }
});

// Serve frontend in production or mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`FamilyChef AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
