import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Users,
  CheckCircle2,
  Heart,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Shuffle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DayPlan, MealRecipe, MealType } from '../../types';

interface MealPlannerPageProps {
  openRecipeModal: (recipe: MealRecipe) => void;
  openProfileModal: () => void;
  openShoppingModal: () => void;
}

export const MealPlannerPage: React.FC<MealPlannerPageProps> = ({
  openRecipeModal,
  openProfileModal,
  openShoppingModal,
}) => {
  const {
    familyProfile,
    pantryItems,
    weeklyPlan,
    setWeeklyPlan,
    replaceMealInPlan,
    toggleMealCompleted,
    toggleFavoriteRecipe,
    isRecipeFavorite,
  } = useApp();

  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [replacingMealKey, setReplacingMealKey] = useState<string | null>(null);

  const activeDay: DayPlan = weeklyPlan.days[activeDayIdx] || weeklyPlan.days[0];

  // Call API to generate full 7-day plan
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/meal-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyProfile,
          pantryItems,
          prioritizeExpiring: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate weekly meal plan.');
      }

      if (!data.days || data.days.length === 0) {
        throw new Error('Meal plan format returned was incomplete.');
      }

      setWeeklyPlan({
        planId: data.planId || `plan-${Date.now()}`,
        summary: data.summary || 'Customized 7-Day Family Meal Plan',
        days: data.days,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating meal plan with AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Replace single meal via AI
  const handleReplaceMeal = async (dayNumber: number, mealType: MealType) => {
    const mealKey = `${dayNumber}-${mealType}`;
    setReplacingMealKey(mealKey);

    try {
      const response = await fetch('/api/recipe/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainIngredient: 'Chef surprise',
          availablePantry: pantryItems.map(p => p.name).slice(0, 10),
          mealType,
          servings: familyProfile.servings,
          dietaryRequirements: familyProfile.dietaryRestrictions,
          allergies: familyProfile.allergies,
          additionalPrompt: `Generate an alternative ${mealType} recipe for Day ${dayNumber} that is family-friendly and allergen safe.`,
        }),
      });

      const newRecipe = await response.json();
      if (!response.ok) throw new Error(newRecipe.error || 'Failed to generate replacement meal.');

      replaceMealInPlan(dayNumber, mealType, newRecipe);
    } catch (e: any) {
      alert(`Could not replace meal: ${e.message}`);
    } finally {
      setReplacingMealKey(null);
    }
  };

  const renderMealCard = (mealType: MealType, meal?: MealRecipe) => {
    if (!meal) return null;
    const isFav = isRecipeFavorite(meal.id || meal.title);
    const isReplacing = replacingMealKey === `${activeDay.dayNumber}-${mealType}`;

    return (
      <div
        className={`bg-[#141724] rounded-3xl border transition-all p-5 shadow-xl flex flex-col justify-between ${
          meal.isCompleted
            ? 'border-emerald-500/40 bg-[#16222b]/50'
            : 'border-white/5 hover:border-white/15 hover:bg-[#181c2d]'
        }`}
      >
        <div className="space-y-3">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-950/70 border border-cyan-800/40 px-2.5 py-0.5 rounded-full font-sans-clean">
              {mealType}
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-stone-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{meal.prepTimeMinutes + meal.cookTimeMinutes} mins</span>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h3
              onClick={() => openRecipeModal(meal)}
              className="font-bold text-base text-white hover:text-amber-400 cursor-pointer transition-colors leading-snug font-display"
            >
              {meal.title}
            </h3>
            <p className="text-xs text-stone-400 font-serif line-clamp-2 mt-1 leading-relaxed">
              {meal.description}
            </p>
          </div>

          {/* Waste reduction tag */}
          {meal.wasteReductionNotes && (
            <div className="bg-amber-950/40 border border-amber-800/40 p-2 rounded-xl text-[11px] text-amber-300 flex items-center space-x-1.5 font-serif">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{meal.wasteReductionNotes}</span>
            </div>
          )}

          {/* Allergen warnings if any */}
          {meal.allergenWarnings && meal.allergenWarnings.length > 0 && (
            <div className="bg-rose-950/50 border border-rose-800/40 p-2 rounded-xl text-[11px] text-rose-300 flex items-center space-x-1.5 font-serif">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{meal.allergenWarnings.join(', ')}</span>
            </div>
          )}

          {/* Nutrition pills */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] bg-[#1a1f30] p-2 rounded-xl border border-white/5 font-sans-clean">
            <div>
              <div className="text-stone-500">Cal</div>
              <div className="font-extrabold text-white">{meal.estimatedNutrition.calories}</div>
            </div>
            <div>
              <div className="text-stone-500">Protein</div>
              <div className="font-extrabold text-emerald-400">{meal.estimatedNutrition.proteinGrams}g</div>
            </div>
            <div>
              <div className="text-stone-500">Carbs</div>
              <div className="font-extrabold text-amber-400">{meal.estimatedNutrition.carbsGrams}g</div>
            </div>
            <div>
              <div className="text-stone-500">Fat</div>
              <div className="font-extrabold text-rose-400">{meal.estimatedNutrition.fatGrams}g</div>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleMealCompleted(activeDay.dayNumber, mealType)}
              className={`p-1.5 rounded-lg transition-colors flex items-center space-x-1 font-bold ${
                meal.isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1e2336] text-stone-400 hover:text-white'
              }`}
              title={meal.isCompleted ? 'Meal completed!' : 'Mark as cooked'}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px]">{meal.isCompleted ? 'Cooked' : 'Done'}</span>
            </button>

            <button
              onClick={() => toggleFavoriteRecipe(meal)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-stone-500 hover:text-rose-400 transition-colors"
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => handleReplaceMeal(activeDay.dayNumber, mealType)}
              disabled={isReplacing}
              className="p-1.5 rounded-lg hover:bg-white/5 text-stone-400 hover:text-white transition-colors"
              title="Replace this meal with AI alternative"
            >
              <Shuffle className={`w-4 h-4 ${isReplacing ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          </div>

          <button
            onClick={() => openRecipeModal(meal)}
            className="px-3.5 py-1.5 rounded-xl gradient-bistro-btn text-white font-extrabold text-xs shadow-xs uppercase tracking-wider"
          >
            Cook Recipe
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Bistro 7-Day Family Meal Planner
            </h1>
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-xs font-bold px-2.5 py-0.5 rounded-full font-sans-clean">
              Zero-Waste Optimized
            </span>
          </div>
          <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl font-serif">
            Personalized breakfast, lunch, and dinner plans for {familyProfile.familyName} ({familyProfile.servings} servings), factoring in pantry stock and allergies.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={openShoppingModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#1b2030] hover:bg-[#23293e] border border-white/10 text-stone-200 rounded-xl text-xs font-bold transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span>Smart Grocery List</span>
          </button>

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-5 py-2.5 gradient-bistro-btn text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md shadow-orange-500/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting 7-Day Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Regenerate 7-Day Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Plan Summary Bar */}
      <div className="bg-[#141724] border border-white/5 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1e2336] border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm font-display">{familyProfile.familyName}</span>
              <span className="text-xs text-stone-500">•</span>
              <span className="text-xs text-stone-300 font-medium">{familyProfile.servings} Servings</span>
              <span className="text-xs text-stone-500">•</span>
              <span className="text-xs text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                {familyProfile.budgetTier || familyProfile.budgetRange} budget
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 font-serif">{weeklyPlan.summary}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-stone-300 bg-[#1e2336] px-3 py-1.5 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {familyProfile.allergies.length > 0
                ? `Excluding: ${familyProfile.allergies.join(', ')}`
                : 'No strict allergens'}
            </span>
          </div>
          <button
            onClick={openProfileModal}
            className="text-xs font-bold text-cyan-400 hover:underline"
          >
            Preferences
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 7-Day Navigation Tabs */}
      <div className="grid grid-cols-7 gap-2 bg-[#10131d] p-1.5 rounded-2xl border border-white/5 overflow-x-auto">
        {weeklyPlan.days.map((day, idx) => {
          const isActive = activeDayIdx === idx;
          const completedCount = [
            day.breakfast?.isCompleted,
            day.lunch?.isCompleted,
            day.dinner?.isCompleted,
          ].filter(Boolean).length;

          return (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIdx(idx)}
              className={`p-3 rounded-xl text-center transition-all flex flex-col items-center justify-center min-w-[70px] ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md font-extrabold'
                  : 'text-stone-400 hover:text-white hover:bg-white/5 font-semibold'
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-white/80' : 'text-stone-500'}`}>
                Day {day.dayNumber}
              </span>
              <span className="text-xs font-bold truncate max-w-full font-sans-clean">{day.dayName}</span>
              {completedCount > 0 && (
                <span className={`text-[9px] font-extrabold mt-0.5 ${isActive ? 'text-emerald-100' : 'text-emerald-400'}`}>
                  {completedCount}/3 cooked
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141724] p-5 rounded-3xl border border-white/5 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2 font-display">
            <span>{activeDay.dayName} Menu</span>
            <span className="text-xs font-semibold text-stone-400 font-sans-clean">
              (Day {activeDay.dayNumber} of 7)
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5 font-serif">
            European-inspired balanced recipes with nutritional guidance.
          </p>
        </div>

        {/* Daily Total Nutrition */}
        {activeDay.dailyNutritionSummary && (
          <div className="flex items-center space-x-4 bg-[#1a1f30] px-4 py-2 rounded-2xl border border-white/5 text-xs font-sans-clean">
            <div className="text-center">
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Est. Cal</span>
              <span className="font-extrabold text-white">
                {activeDay.dailyNutritionSummary.totalCalories} kcal
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Protein</span>
              <span className="font-extrabold text-emerald-400">
                {activeDay.dailyNutritionSummary.totalProtein}g
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Carbs</span>
              <span className="font-extrabold text-amber-400">
                {activeDay.dailyNutritionSummary.totalCarbs}g
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Fat</span>
              <span className="font-extrabold text-rose-400">
                {activeDay.dailyNutritionSummary.totalFat}g
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Meals Grid for Active Day */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderMealCard('breakfast', activeDay.breakfast)}
        {renderMealCard('lunch', activeDay.lunch)}
        {renderMealCard('dinner', activeDay.dinner)}
      </div>

      {/* Afternoon Snack Card */}
      {activeDay.snack && (
        <div className="bg-[#141724] border border-white/5 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-950/70 border border-amber-800/40 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase font-sans-clean">
                Family Snack
              </span>
              <h4 className="font-bold text-white text-sm font-display">{activeDay.snack.title}</h4>
            </div>
            <p className="text-xs text-stone-400 font-serif">{activeDay.snack.description}</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-xs font-bold text-stone-300">
              {activeDay.snack.estimatedNutrition.calories} kcal
            </span>
            <button
              onClick={() => openRecipeModal(activeDay.snack!)}
              className="px-4 py-2 bg-[#1e2336] hover:bg-[#252c42] border border-white/10 rounded-xl text-xs font-bold text-white transition-colors"
            >
              View Snack
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
