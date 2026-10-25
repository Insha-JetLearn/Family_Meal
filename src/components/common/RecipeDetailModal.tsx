import React, { useState } from 'react';
import {
  X,
  Clock,
  Flame,
  Users,
  Heart,
  Check,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  UtensilsCrossed,
  Plus,
  Minus,
  ChefHat,
  BookmarkCheck,
  Copy,
} from 'lucide-react';
import { MealRecipe } from '../../types';
import { useApp } from '../../context/AppContext';

interface RecipeDetailModalProps {
  recipe: MealRecipe | null;
  onClose: () => void;
  onLogMeal?: (recipe: MealRecipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onLogMeal,
}) => {
  const { toggleFavoriteRecipe, isRecipeFavorite, logMeal } = useApp();
  const [scaleServings, setScaleServings] = useState<number>(recipe?.servings || 3);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  if (!recipe) return null;

  const isFavorite = isRecipeFavorite(recipe.id || recipe.title);
  const baseServings = recipe.servings || 3;
  const ratio = scaleServings / baseServings;

  const getScaledQuantity = (qtyStr: string) => {
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

  const toggleCheck = (idx: number) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyRecipe = () => {
    const text = `🍽️ ${recipe.title}
${recipe.description}

Servings: ${scaleServings} | Prep: ${recipe.prepTimeMinutes}m | Cook: ${recipe.cookTimeMinutes}m
Difficulty: ${recipe.difficulty} | Cuisine: ${recipe.cuisine || 'Bistro Home Cooking'}

INGREDIENTS:
${recipe.ingredients.map(i => `- ${getScaledQuantity(i.quantity)} ${i.item}`).join('\n')}

INSTRUCTIONS:
${recipe.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

NUTRITION (per serving):
Calories: ${recipe.estimatedNutrition.calories} kcal | Protein: ${recipe.estimatedNutrition.proteinGrams}g | Carbs: ${recipe.estimatedNutrition.carbsGrams}g | Fat: ${recipe.estimatedNutrition.fatGrams}g
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLogToTracker = () => {
    if (onLogMeal) {
      onLogMeal(recipe);
    } else {
      logMeal({
        mealType: recipe.mealType || 'dinner',
        name: recipe.title,
        portion: `${scaleServings} serving(s)`,
        calories: Math.round(recipe.estimatedNutrition.calories * ratio),
        protein: Math.round(recipe.estimatedNutrition.proteinGrams * ratio),
        carbs: Math.round(recipe.estimatedNutrition.carbsGrams * ratio),
        fat: Math.round(recipe.estimatedNutrition.fatGrams * ratio),
        fromPlan: true,
        recipeId: recipe.id,
      });
    }
    setLoggedSuccess(true);
    setTimeout(() => setLoggedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141724] border border-white/10 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-white">
        {/* Header Banner */}
        <div className="gradient-bistro text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2 font-sans-clean">
            <span className="bg-black/20 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {recipe.mealType || 'Meal'}
            </span>
            <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {recipe.cuisine || 'European Bistro'}
            </span>
            <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {recipe.difficulty}
            </span>
            {recipe.wasteReductionNotes && (
              <span className="bg-amber-400 text-stone-950 text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Zero-Waste
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pr-10 font-display drop-shadow-xs">
            {recipe.title}
          </h2>
          <p className="text-white/90 text-sm mt-1 max-w-xl font-serif">
            {recipe.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/20 text-xs font-sans-clean">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-white" />
              <span>Prep: <strong>{recipe.prepTimeMinutes}m</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-200" />
              <span>Cook: <strong>{recipe.cookTimeMinutes}m</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="w-4 h-4 text-white" />
              <span>Total: <strong>{recipe.prepTimeMinutes + recipe.cookTimeMinutes}m</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4 text-white" />
              <span>Est. Cal: <strong>{recipe.estimatedNutrition.calories} kcal</strong></span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-stone-300">
          {/* Allergens & Safety Notice */}
          {recipe.allergenWarnings && recipe.allergenWarnings.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-800/40 rounded-2xl p-4 flex items-start space-x-3 text-amber-300">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs font-serif">
                <span className="font-bold">Allergen Safety Note: </span>
                {recipe.allergenWarnings.join('; ')}
                <p className="mt-0.5 text-stone-400">Always verify packaging seals and ingredient labels before cooking.</p>
              </div>
            </div>
          )}

          {/* Servings Adjuster Bar */}
          <div className="bg-[#1b2030] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="font-bold text-white text-sm font-sans-clean">Household Servings</h4>
                <p className="text-stone-400 text-xs font-serif">Ingredients recalculate automatically</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setScaleServings(Math.max(1, scaleServings - 1))}
                className="w-8 h-8 rounded-full bg-[#252c40] border border-white/10 hover:bg-[#2e374e] flex items-center justify-center font-bold text-white shadow-xs"
                aria-label="Decrease servings"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-base text-white min-w-8 text-center font-sans-clean">
                {scaleServings} {scaleServings === 1 ? 'person' : 'people'}
              </span>
              <button
                onClick={() => setScaleServings(scaleServings + 1)}
                className="w-8 h-8 rounded-full bg-[#252c40] border border-white/10 hover:bg-[#2e374e] flex items-center justify-center font-bold text-white shadow-xs"
                aria-label="Increase servings"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ingredients & Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-base font-display">
                  Ingredients ({recipe.ingredients.length})
                </h3>
                <span className="text-[11px] text-stone-500 font-serif">Click to check off</span>
              </div>

              <div className="space-y-2 bg-[#121522] p-3 rounded-2xl border border-white/5">
                {recipe.ingredients.map((ing, idx) => {
                  const isChecked = !!checkedIngredients[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`flex items-start space-x-3 p-2 rounded-xl cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#1b2030]/50 text-stone-500 line-through'
                          : 'hover:bg-[#1b2030] bg-[#161a29]/80 text-stone-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-white/20 bg-[#1e2336]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="text-xs leading-relaxed font-sans-clean">
                        <span className="font-bold text-orange-400 mr-1.5">
                          {getScaledQuantity(ing.quantity)}
                        </span>
                        <span>{ing.item}</span>
                        {ing.isPantryItem && (
                          <span className="ml-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800/50 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                            Pantry
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white text-base mb-3 font-display">
                Step-by-Step Cooking
              </h3>
              <div className="space-y-3 font-serif">
                {recipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 bg-[#121522] p-3 rounded-xl border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-sans-clean">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-stone-300 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nutrition Summary Bar */}
          <div className="bg-[#121522] border border-white/5 rounded-2xl p-4 font-sans-clean">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Estimated Nutritional Values (Per Serving)
              </h4>
              <span className="text-[10px] text-cyan-400">AI Estimated Guidance</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-[#1a1f30] p-2.5 rounded-xl border border-white/5">
                <div className="text-xs text-stone-500 font-medium">Calories</div>
                <div className="text-lg font-black text-white">
                  {recipe.estimatedNutrition.calories}
                  <span className="text-[10px] font-normal text-stone-500 ml-0.5">kcal</span>
                </div>
              </div>
              <div className="bg-[#1a1f30] p-2.5 rounded-xl border border-white/5">
                <div className="text-xs text-stone-500 font-medium">Protein</div>
                <div className="text-lg font-black text-emerald-400">
                  {recipe.estimatedNutrition.proteinGrams}g
                </div>
              </div>
              <div className="bg-[#1a1f30] p-2.5 rounded-xl border border-white/5">
                <div className="text-xs text-stone-500 font-medium">Carbs</div>
                <div className="text-lg font-black text-amber-400">
                  {recipe.estimatedNutrition.carbsGrams}g
                </div>
              </div>
              <div className="bg-[#1a1f30] p-2.5 rounded-xl border border-white/5">
                <div className="text-xs text-stone-500 font-medium">Fat</div>
                <div className="text-lg font-black text-rose-400">
                  {recipe.estimatedNutrition.fatGrams}g
                </div>
              </div>
              <div className="bg-[#1a1f30] p-2.5 rounded-xl border border-white/5">
                <div className="text-xs text-stone-500 font-medium">Fiber</div>
                <div className="text-lg font-black text-cyan-400">
                  {recipe.estimatedNutrition.fiberGrams || 4}g
                </div>
              </div>
            </div>
          </div>

          {/* Substitutions & Storage */}
          {(recipe.substitutions?.length || recipe.storageTips) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipe.substitutions && recipe.substitutions.length > 0 && (
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-4">
                  <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-2 flex items-center font-sans-clean">
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    Smart Ingredient Substitutions
                  </h4>
                  <div className="space-y-2 text-xs font-serif">
                    {recipe.substitutions.map((sub, i) => (
                      <div key={i} className="text-stone-300">
                        <span className="font-semibold text-amber-400">{sub.original}</span> →{' '}
                        <span className="font-bold text-emerald-400">{sub.replacement}</span>
                        {sub.reason && <p className="text-[10px] text-stone-500 mt-0.5">{sub.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recipe.storageTips && (
                <div className="bg-[#121522] border border-white/5 rounded-2xl p-4">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center font-sans-clean">
                    <BookmarkCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Leftover Storage & Reheating
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-serif">{recipe.storageTips}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#10131d] border-t border-white/5 p-4 px-6 flex flex-wrap items-center justify-between gap-3 font-sans-clean">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavoriteRecipe(recipe)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isFavorite
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-[#1b2030] border-white/10 text-stone-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-500'}`} />
              <span>{isFavorite ? 'Saved Favorite' : 'Save Favorite'}</span>
            </button>

            <button
              onClick={handleCopyRecipe}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1b2030] border border-white/10 text-stone-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-500" />}
              <span>{copied ? 'Copied Recipe!' : 'Copy / Share'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogToTracker}
              disabled={loggedSuccess}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md ${
                loggedSuccess
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'gradient-bistro-btn text-white shadow-orange-500/20'
              }`}
            >
              {loggedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Logged to Today! (+25 XP)</span>
                </>
              ) : (
                <>
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Log to Today's Tracker</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
