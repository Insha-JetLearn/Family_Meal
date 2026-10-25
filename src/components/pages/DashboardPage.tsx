import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Edit2,
  X,
  Calendar,
  Utensils,
  Clock,
  Plus,
  CheckCircle2,
  Camera,
  ChefHat,
  ShoppingBag,
  Activity,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MealRecipe, MealType } from '../../types';
import { BistroNavTab } from '../common/BistroSidebar';

interface DashboardPageProps {
  navigateTo: (tab: BistroNavTab) => void;
  openRecipeModal: (recipe: MealRecipe) => void;
  openProfileModal: () => void;
  openOnboarding: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  navigateTo,
  openRecipeModal,
  openProfileModal,
  openOnboarding,
}) => {
  const {
    familyProfile,
    pantryItems,
    weeklyPlan,
    gamification,
    currentDateLog,
    logMeal,
  } = useApp();

  const [showRecap, setShowRecap] = useState(true);
  const [loggedMealIds, setLoggedMealIds] = useState<Record<string, boolean>>({});

  // Today's formatted date string e.g. "THURSDAY, OCT 24, 2026"
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  // Expiring pantry items
  const expiringSoonItems = pantryItems.filter(
    item =>
      !item.isUsed &&
      (item.freshnessStatus === 'Use Soon' ||
        (item.estimatedDaysUntilExpiry !== undefined &&
          item.estimatedDaysUntilExpiry !== null &&
          item.estimatedDaysUntilExpiry <= 3))
  );

  const todayDayPlan = weeklyPlan.days[0] || weeklyPlan.days[new Date().getDay() % 7];

  const handleQuickLog = (meal: MealRecipe, mealType: MealType) => {
    logMeal({
      mealType,
      name: meal.title,
      portion: '1 serving',
      calories: meal.estimatedNutrition.calories,
      protein: meal.estimatedNutrition.proteinGrams,
      carbs: meal.estimatedNutrition.carbsGrams,
      fat: meal.estimatedNutrition.fatGrams,
      fromPlan: true,
      recipeId: meal.id,
    });
    setLoggedMealIds(prev => ({ ...prev, [meal.id]: true }));
  };

  const wasteSaved = familyProfile.wasteSavedDollars ?? 13.50;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* 1. Top Safety Notice Banner (Matching Image 5) */}
      <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-2xl">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="font-serif leading-relaxed text-[11px] sm:text-xs">
          <strong>BistroChef Safety Notice:</strong> Meal suggestions are provided for informational purposes only. This is not a substitute for professional medical, nutritional, or clinical advice.
        </p>
      </div>

      {/* 2. Welcome Hero Card (Matching Image 5) */}
      <div className="relative overflow-hidden rounded-3xl gradient-bistro p-6 sm:p-8 text-white shadow-xl">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display drop-shadow-xs">
                Welcome, {familyProfile.familyName}!
              </h1>
              <button
                onClick={openOnboarding}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Edit kitchen profile & members"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Streak Pill */}
            <div className="inline-flex items-center space-x-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{gamification.streak} DAY STREAK</span>
            </div>

            {/* Subtitle */}
            <p className="text-white/95 text-xs sm:text-sm font-serif leading-relaxed">
              {familyProfile.allergies.length > 0
                ? `${familyProfile.allergies.join(' & ')} allergen checks are active. Let's plan some delicious family meals.`
                : "Nut & Dairy allergen checks are active. Let's plan some delicious family meals."}
            </p>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            <button
              onClick={() => navigateTo('planner')}
              className="px-6 py-3.5 rounded-full bg-white hover:bg-stone-100 text-stone-900 font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center space-x-2 shadow-xl hover:scale-105 transition-all cursor-pointer font-sans-clean"
            >
              <span>PLAN FAMILY MEALS</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sunday Family Recap Card (Matching Image 5) */}
      {showRecap && (
        <div className="bg-[#141724] border border-white/5 rounded-3xl p-6 shadow-xl space-y-5 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="bg-[#202538] text-stone-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-sans-clean">
                SUNDAY FAMILY RECAP
              </span>
              <span className="text-xs text-stone-400 font-serif">
                This Week's Highlights
              </span>
            </div>
            <button
              onClick={() => setShowRecap(false)}
              className="text-stone-500 hover:text-stone-300 transition-colors p-1"
              title="Dismiss recap"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Fantastic cooking week, chef!
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 font-serif leading-relaxed">
              Your family worked together to optimize pantry inventory, prevent food waste, and hit nutritional targets.
            </p>
          </div>

          {/* 4 Stats Tiles (Matching Image 5) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#1a1f30] p-4 rounded-2xl border border-white/5 text-center space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block font-sans-clean">
                MEALS LOGGED
              </span>
              <span className="text-2xl font-black text-white font-sans-clean">
                {currentDateLog.meals.length}
              </span>
            </div>

            <div className="bg-[#1a1f30] p-4 rounded-2xl border border-white/5 text-center space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block font-sans-clean">
                CURRENT STREAK
              </span>
              <div className="flex items-center justify-center space-x-1">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span className="text-2xl font-black text-white font-sans-clean">
                  {gamification.streak}d
                </span>
              </div>
            </div>

            <div className="bg-[#1a1f30] p-4 rounded-2xl border border-white/5 text-center space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block font-sans-clean">
                POINTS EARNED
              </span>
              <span className="text-2xl font-black text-white font-sans-clean">
                +{gamification.xp}
              </span>
            </div>

            <div className="bg-[#1a1f30] p-4 rounded-2xl border border-white/5 text-center space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block font-sans-clean">
                WASTE SAVED
              </span>
              <span className="text-2xl font-black text-[#4ade80] font-sans-clean">
                ${wasteSaved.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Zero-Waste Alert Banner if items expiring */}
      {expiringSoonItems.length > 0 && (
        <div className="bg-[#181c2a] border border-amber-500/30 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Zero-Waste Alert: {expiringSoonItems.length} pantry items need attention!
              </h3>
              <p className="text-xs text-stone-400 mt-0.5 font-serif">
                {expiringSoonItems.map(i => `${i.name} (${i.freshnessStatus})`).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('planner')}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
          >
            Cook Zero-Waste Plan
          </button>
        </div>
      )}

      {/* 4. Today's Meal Calendar Section (Matching Image 5) */}
      <div className="bg-[#141724] border border-white/5 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-orange-400 font-sans-clean">
              TODAY'S MEAL CALENDAR
            </h3>
            <span className="text-stone-500">•</span>
            <span className="text-xs font-bold text-stone-300 tracking-wider">
              {formattedToday}
            </span>
          </div>

          <button
            onClick={() => navigateTo('planner')}
            className="text-xs font-bold text-stone-400 hover:text-white uppercase tracking-wider flex items-center space-x-1 font-sans-clean transition-colors"
          >
            <span>FULL SCHEDULE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Breakfast', meal: todayDayPlan?.breakfast, type: 'breakfast' as MealType },
            { label: 'Lunch', meal: todayDayPlan?.lunch, type: 'lunch' as MealType },
            { label: 'Dinner', meal: todayDayPlan?.dinner, type: 'dinner' as MealType },
          ].map(({ label, meal, type }) => {
            if (!meal) return null;
            const isLogged = loggedMealIds[meal.id] || currentDateLog.meals.some(m => m.name === meal.title);

            return (
              <div
                key={label}
                className="bg-[#181c2a] hover:bg-[#1c2234] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full font-sans-clean">
                      {label}
                    </span>
                    <div className="flex items-center space-x-1 text-[11px] text-stone-400">
                      <Clock className="w-3 h-3 text-stone-500" />
                      <span>{meal.prepTimeMinutes + meal.cookTimeMinutes}m</span>
                    </div>
                  </div>

                  <h4
                    onClick={() => openRecipeModal(meal)}
                    className="font-display font-bold text-white text-base hover:text-amber-400 cursor-pointer line-clamp-2 leading-snug"
                    title={meal.title}
                  >
                    {meal.title}
                  </h4>
                  <p className="text-xs text-stone-400 font-serif line-clamp-2 mt-1 leading-relaxed">
                    {meal.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-300">
                    {meal.estimatedNutrition.calories}{' '}
                    <span className="text-[10px] text-stone-500">kcal</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuickLog(meal, type)}
                      disabled={isLogged}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-colors ${
                        isLogged
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                          : 'text-stone-300 hover:text-white bg-[#222738] hover:bg-[#2b3248]'
                      }`}
                    >
                      {isLogged ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Logged</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Log</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => openRecipeModal(meal)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                    >
                      Cook
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Feature Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
        <button
          onClick={() => navigateTo('pantry')}
          className="flex flex-col items-start p-4 rounded-2xl bg-[#141724] hover:bg-[#1a1f30] border border-white/5 hover:border-white/10 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#202538] text-orange-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-xs sm:text-sm font-sans-clean">
            Scan Pantry Stock
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 font-serif">
            Detect items via AI vision
          </span>
        </button>

        <button
          onClick={() => navigateTo('planner')}
          className="flex flex-col items-start p-4 rounded-2xl bg-[#141724] hover:bg-[#1a1f30] border border-white/5 hover:border-white/10 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#202538] text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-xs sm:text-sm font-sans-clean">
            Weekly Meal Planner
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 font-serif">
            7-day European menus
          </span>
        </button>

        <button
          onClick={() => navigateTo('groceries')}
          className="flex flex-col items-start p-4 rounded-2xl bg-[#141724] hover:bg-[#1a1f30] border border-white/5 hover:border-white/10 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#202538] text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-xs sm:text-sm font-sans-clean">
            Smart Grocery List
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 font-serif">
            Calculates missing stock
          </span>
        </button>

        <button
          onClick={() => navigateTo('assistant')}
          className="flex flex-col items-start p-4 rounded-2xl bg-[#141724] hover:bg-[#1a1f30] border border-white/5 hover:border-white/10 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#202538] text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-xs sm:text-sm font-sans-clean">
            Ask Chef Remy
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 font-serif">
            Bistro culinary advice
          </span>
        </button>
      </div>
    </div>
  );
};
