import React, { useState } from 'react';
import {
  ChefHat,
  Sparkles,
  RefreshCw,
  Plus,
  Minus,
  Clock,
  Flame,
  Users,
  Heart,
  Check,
  Copy,
  UtensilsCrossed,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DifficultyLevel, MealRecipe, MealType } from '../../types';

interface RecipeCustomizerPageProps {
  openRecipeModal: (recipe: MealRecipe) => void;
}

export const RecipeCustomizerPage: React.FC<RecipeCustomizerPageProps> = ({ openRecipeModal }) => {
  const {
    familyProfile,
    pantryItems,
    replaceMealInPlan,
    toggleFavoriteRecipe,
    isRecipeFavorite,
    awardXp,
    checkAndUnlockBadge,
  } = useApp();

  // Form Inputs
  const [mainIngredient, setMainIngredient] = useState('');
  const [selectedPantry, setSelectedPantry] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState('Italian (Tuscan)');
  const [mealType, setMealType] = useState<MealType>('dinner');
  const [servings, setServings] = useState<number>(familyProfile.servings || 3);
  const [maxTime, setMaxTime] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<MealRecipe | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Scaler state for the active recipe card
  const [scaleServings, setScaleServings] = useState<number>(familyProfile.servings || 3);
  const [copied, setCopied] = useState(false);
  const [addedToPlanSuccess, setAddedToPlanSuccess] = useState(false);

  // Quick pantry chips
  const togglePantryChip = (name: string) => {
    setSelectedPantry(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const handleGenerateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError(null);
    setAddedToPlanSuccess(false);

    try {
      const response = await fetch('/api/recipe/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainIngredient: mainIngredient.trim() || 'Chef pantry choice',
          availablePantry: selectedPantry,
          cuisine,
          dietaryRequirements: familyProfile.dietaryRestrictions,
          allergies: familyProfile.allergies,
          servings,
          maxPrepTime: maxTime,
          difficulty,
          mealType,
          additionalPrompt: additionalPrompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to craft customized recipe.');
      }

      const recipeWithId: MealRecipe = {
        ...data,
        id: `custom-rec-${Date.now()}`,
        mealType,
        servings,
      };

      setGeneratedRecipe(recipeWithId);
      setScaleServings(servings);
      awardXp(35, `Generated custom "${recipeWithId.title}" recipe`);
      checkAndUnlockBadge('recipe_alchemist');
    } catch (err: any) {
      setGenError(err.message || 'Error communicating with AI recipe customizer.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Dynamic ingredient scaling
  const getScaledQuantity = (qtyStr: string) => {
    if (!generatedRecipe) return qtyStr;
    const ratio = scaleServings / (generatedRecipe.servings || 3);
    if (ratio === 1) return qtyStr;

    const match = qtyStr.match(/^(\d+(?:\.\d+)?|\d+\/\d+)\s*(.*)$/);
    if (match) {
      const numPart = match[1];
      const rest = match[2];
      let val = 0;
      if (numPart.includes('/')) {
        const [num, den] = numPart.split('/');
        val = parseFloat(num) / parseFloat(den);
      } else {
        val = parseFloat(numPart);
      }
      if (!isNaN(val)) {
        const scaledVal = val * ratio;
        const formatted = scaledVal % 1 === 0 ? scaledVal.toString() : scaledVal.toFixed(1);
        return `${formatted} ${rest}`.trim();
      }
    }
    return qtyStr;
  };

  const handleCopyRecipe = () => {
    if (!generatedRecipe) return;
    const text = `🍽️ ${generatedRecipe.title}
${generatedRecipe.description}

Servings: ${scaleServings} | Prep: ${generatedRecipe.prepTimeMinutes}m | Cook: ${generatedRecipe.cookTimeMinutes}m
Difficulty: ${generatedRecipe.difficulty} | Cuisine: ${generatedRecipe.cuisine || 'Family Cooking'}

INGREDIENTS:
${generatedRecipe.ingredients.map(i => `- ${getScaledQuantity(i.quantity)} ${i.item}`).join('\n')}

INSTRUCTIONS:
${generatedRecipe.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

NUTRITION (per serving):
Calories: ${generatedRecipe.estimatedNutrition.calories} kcal | Protein: ${generatedRecipe.estimatedNutrition.proteinGrams}g | Carbs: ${generatedRecipe.estimatedNutrition.carbsGrams}g | Fat: ${generatedRecipe.estimatedNutrition.fatGrams}g
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddToWeeklyPlan = (dayNumber: number) => {
    if (!generatedRecipe) return;
    replaceMealInPlan(dayNumber, mealType, generatedRecipe);
    setAddedToPlanSuccess(true);
    setTimeout(() => setAddedToPlanSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Bistro Recipe Customizer
          </h1>
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-xs font-bold px-2.5 py-0.5 rounded-full font-sans-clean">
            Ingredient-Driven
          </span>
        </div>
        <p className="text-stone-400 text-xs sm:text-sm mt-1 font-serif">
          Build custom, dietary-safe recipes tailored to your ingredients, cooking duration, and family size.
        </p>
      </div>

      {/* Main Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 5 cols */}
        <div className="lg:col-span-5 bg-[#141724] rounded-3xl border border-white/5 p-6 shadow-xl space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
            <ChefHat className="w-5 h-5 text-orange-400" />
            <h2 className="font-bold text-white text-base font-display">Custom Recipe Generator</h2>
          </div>

          <form onSubmit={handleGenerateRecipe} className="space-y-4 text-xs text-stone-300">
            {/* Main Ingredient */}
            <div>
              <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1.5 font-sans-clean">
                Main Ingredient or Focus
              </label>
              <input
                type="text"
                value={mainIngredient}
                onChange={e => setMainIngredient(e.target.value)}
                placeholder="e.g. Chicken breast, Gnocchi, Tofu, Penne"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs font-semibold focus:outline-hidden"
              />
            </div>

            {/* Pantry Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-sans-clean">
                <label className="block font-bold text-stone-400 uppercase tracking-wider">
                  Select Pantry Items to Use ({selectedPantry.length} selected)
                </label>
                <span className="text-[10px] text-stone-500">Click to include</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#121522] rounded-2xl border border-white/5">
                {pantryItems.map(item => {
                  const isSelected = selectedPantry.includes(item.name);
                  const isUrgent = item.freshnessStatus === 'Use Soon';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePantryChip(item.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-cyan-600 text-white border border-cyan-400 shadow-xs'
                          : isUrgent
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                          : 'bg-[#1b2030] text-stone-400 hover:text-white border border-white/5'
                      }`}
                    >
                      <span>{item.name}</span>
                      {isUrgent && <span className="text-[9px] font-bold text-amber-400">⚠️</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meal Type & Cuisine */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1 font-sans-clean">
                  Meal Type
                </label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value as MealType)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1 font-sans-clean">
                  Cuisine
                </label>
                <select
                  value={cuisine}
                  onChange={e => setCuisine(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
                >
                  <option value="Italian (Tuscan)">Italian (Tuscan)</option>
                  <option value="French (Bistro)">French (Bistro)</option>
                  <option value="Spanish (Tapas)">Spanish (Tapas)</option>
                  <option value="Greek Mediterranean">Greek Mediterranean</option>
                  <option value="Continental">Continental</option>
                  <option value="Asian-Inspired">Asian-Inspired</option>
                  <option value="American Comfort">American Comfort</option>
                </select>
              </div>
            </div>

            {/* Servings & Max Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1 font-sans-clean">
                  Servings ({servings})
                </label>
                <div className="flex items-center space-x-2 bg-[#1b2030] p-1.5 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="w-7 h-7 bg-[#252c40] rounded-lg border border-white/10 font-bold flex items-center justify-center text-stone-300 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-white">{servings}</span>
                  <button
                    type="button"
                    onClick={() => setServings(servings + 1)}
                    className="w-7 h-7 bg-[#252c40] rounded-lg border border-white/10 font-bold flex items-center justify-center text-stone-300 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1 font-sans-clean">
                  Max Time: {maxTime} mins
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={maxTime}
                  onChange={e => setMaxTime(parseInt(e.target.value))}
                  className="w-full mt-2 accent-orange-500"
                />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1 font-sans-clean">
                Cooking Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Advanced'] as DifficultyLevel[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      difficulty === d
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#1b2030] text-stone-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Prompt */}
            <div>
              <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1 font-sans-clean">
                Creative Instructions
              </label>
              <textarea
                rows={2}
                value={additionalPrompt}
                onChange={e => setAdditionalPrompt(e.target.value)}
                placeholder="e.g. 'Bistro style pan-seared meal with crispy herbs and kid-friendly mild garlic sauce'"
                className="w-full px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
              />
            </div>

            {/* Allergy banner check */}
            <div className="p-3 bg-[#121522] rounded-2xl border border-white/5 text-[11px] text-stone-400 font-serif">
              <span className="font-bold text-white">Auto-Enforced Protections: </span>
              {familyProfile.allergies.length > 0
                ? familyProfile.allergies.join(', ')
                : 'Zero strict allergens specified'}
              {familyProfile.dietaryRestrictions.length > 0 &&
                ` • ${familyProfile.dietaryRestrictions.join(', ')}`}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 gradient-bistro-btn text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cooking with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Custom Recipe</span>
                </>
              )}
            </button>
          </form>

          {genError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-xs">
              {genError}
            </div>
          )}
        </div>

        {/* Right Output: 7 cols */}
        <div className="lg:col-span-7">
          {!generatedRecipe ? (
            <div className="bg-[#141724] rounded-3xl border border-white/5 p-12 text-center shadow-xl space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#202538] text-orange-400 flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Your Recipe Canvas Awaits</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed font-serif">
                Pick a main ingredient or select items from your pantry on the left, then click "Generate Custom Recipe" to receive step-by-step instructions, nutrition, and substitutions.
              </p>
            </div>
          ) : (
            <div className="bg-[#141724] rounded-3xl border border-white/5 shadow-xl overflow-hidden animate-fadeIn">
              {/* Recipe Top Banner */}
              <div className="gradient-bistro p-6 text-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-black/20 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase font-sans-clean">
                      {generatedRecipe.mealType}
                    </span>
                    <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full font-sans-clean">
                      {generatedRecipe.cuisine}
                    </span>
                    <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full font-sans-clean">
                      {generatedRecipe.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFavoriteRecipe(generatedRecipe)}
                    className="p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
                    title="Toggle Favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isRecipeFavorite(generatedRecipe.id) ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight font-display drop-shadow-xs">
                  {generatedRecipe.title}
                </h2>
                <p className="text-white/90 text-xs max-w-xl font-serif">{generatedRecipe.description}</p>

                <div className="pt-2 border-t border-white/20 flex flex-wrap items-center gap-4 text-xs font-sans-clean">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-white" />
                    <span>Prep: {generatedRecipe.prepTimeMinutes}m</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Flame className="w-4 h-4 text-amber-200" />
                    <span>Cook: {generatedRecipe.cookTimeMinutes}m</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-white" />
                    <span>Total: {generatedRecipe.prepTimeMinutes + generatedRecipe.cookTimeMinutes}m</span>
                  </div>
                </div>
              </div>

              {/* Recipe Body */}
              <div className="p-6 space-y-6 text-stone-300 text-xs">
                {/* Servings Adjuster */}
                <div className="bg-[#1b2030] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white">Adjust Servings:</span>
                    <span className="text-stone-400 font-serif">Recalculates quantities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setScaleServings(Math.max(1, scaleServings - 1))}
                      className="w-7 h-7 bg-[#252c40] rounded-lg border border-white/10 font-bold flex items-center justify-center text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-white min-w-6 text-center">
                      {scaleServings}
                    </span>
                    <button
                      onClick={() => setScaleServings(scaleServings + 1)}
                      className="w-7 h-7 bg-[#252c40] rounded-lg border border-white/10 font-bold flex items-center justify-center text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ingredients & Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-sm text-white mb-2 font-display">Ingredients</h3>
                    <div className="space-y-1.5 bg-[#121522] p-3 rounded-2xl border border-white/5">
                      {generatedRecipe.ingredients.map((ing, i) => (
                        <div key={i} className="flex items-start justify-between py-1 border-b border-white/5 last:border-0">
                          <span className="font-bold text-orange-400 mr-2">
                            {getScaledQuantity(ing.quantity)}
                          </span>
                          <span className="flex-1 text-stone-300">{ing.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white mb-2 font-display">Cooking Instructions</h3>
                    <div className="space-y-2.5">
                      {generatedRecipe.instructions.map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 bg-[#121522] p-2.5 rounded-xl border border-white/5 font-serif">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-stone-300 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nutrition Cards */}
                <div className="bg-[#121522] p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-2 font-sans-clean">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                      Estimated Nutrition per Serving
                    </span>
                    <span className="text-[10px] text-cyan-400">AI Estimate</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center font-sans-clean">
                    <div className="bg-[#1a1f30] p-2 rounded-xl border border-white/5">
                      <div className="text-[10px] text-stone-500">Calories</div>
                      <div className="font-extrabold text-white text-sm">
                        {generatedRecipe.estimatedNutrition.calories}
                      </div>
                    </div>
                    <div className="bg-[#1a1f30] p-2 rounded-xl border border-white/5">
                      <div className="text-[10px] text-stone-500">Protein</div>
                      <div className="font-extrabold text-emerald-400 text-sm">
                        {generatedRecipe.estimatedNutrition.proteinGrams}g
                      </div>
                    </div>
                    <div className="bg-[#1a1f30] p-2 rounded-xl border border-white/5">
                      <div className="text-[10px] text-stone-500">Carbs</div>
                      <div className="font-extrabold text-amber-400 text-sm">
                        {generatedRecipe.estimatedNutrition.carbsGrams}g
                      </div>
                    </div>
                    <div className="bg-[#1a1f30] p-2 rounded-xl border border-white/5">
                      <div className="text-[10px] text-stone-500">Fat</div>
                      <div className="font-extrabold text-rose-400 text-sm">
                        {generatedRecipe.estimatedNutrition.fatGrams}g
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add to Weekly Plan selector */}
                <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 font-sans-clean">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-400">Add to Weekly Plan:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5, 6, 7].map(d => (
                        <button
                          key={d}
                          onClick={() => handleAddToWeeklyPlan(d)}
                          className="px-2 py-1 bg-[#1b2030] hover:bg-orange-500 hover:text-white rounded-lg text-xs font-bold text-stone-300 transition-colors"
                        >
                          D{d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyRecipe}
                      className="px-3.5 py-2 bg-[#1b2030] hover:bg-[#252c40] text-stone-200 rounded-xl font-bold flex items-center space-x-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Recipe'}</span>
                    </button>
                  </div>
                </div>

                {addedToPlanSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl font-bold flex items-center space-x-2 font-sans-clean">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added this recipe to your weekly meal plan! (+20 XP)</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
