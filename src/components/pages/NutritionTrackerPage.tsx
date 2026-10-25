import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Award,
  Droplet,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  Zap,
  Coffee,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MealType, MoodType } from '../../types';

export const NutritionTrackerPage: React.FC = () => {
  const {
    familyProfile,
    gamification,
    badges,
    selectedDate,
    setSelectedDate,
    currentDateLog,
    logMeal,
    removeLoggedMeal,
    updateWaterIntake,
    setDailyMood,
    setDailyNotes,
    allDailyLogs,
    weeklyPlan,
  } = useApp();

  // Custom meal logger form state
  const [mealType, setMealType] = useState<MealType>('dinner');
  const [foodDescription, setFoodDescription] = useState('');
  const [portionSize, setPortionSize] = useState('1 plate');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  // Manual nutrition inputs
  const [calInput, setCalInput] = useState('350');
  const [proteinInput, setProteinInput] = useState('20');
  const [carbsInput, setCarbsInput] = useState('40');
  const [fatInput, setFatInput] = useState('12');

  // Month navigation for interactive calendar
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // Call AI Nutrition Analyzer for custom food
  const handleEstimateWithAI = async () => {
    if (!foodDescription.trim()) return;
    setIsEstimating(true);
    setEstimateError(null);

    try {
      const response = await fetch('/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealDescription: foodDescription.trim(),
          portionSize,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to estimate nutrition.');

      setCalInput(String(data.estimatedCalories || 350));
      setProteinInput(String(data.proteinGrams || 20));
      setCarbsInput(String(data.carbsGrams || 40));
      setFatInput(String(data.fatGrams || 10));
    } catch (err: any) {
      setEstimateError(err.message || 'Error estimating nutrition.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodDescription.trim()) return;

    logMeal({
      mealType,
      name: foodDescription.trim(),
      portion: portionSize,
      calories: parseInt(calInput) || 0,
      protein: parseInt(proteinInput) || 0,
      carbs: parseInt(carbsInput) || 0,
      fat: parseInt(fatInput) || 0,
      fromPlan: false,
    });

    setFoodDescription('');
    setEstimateError(null);
  };

  // Quick-add meal from current weekly plan
  const plannedMeals = weeklyPlan.days.flatMap(d => [
    { ...d.breakfast, dayName: d.dayName },
    { ...d.lunch, dayName: d.dayName },
    { ...d.dinner, dayName: d.dayName },
  ]);

  const handleQuickAddPlannedMeal = (m: any) => {
    logMeal({
      mealType: m.mealType || 'dinner',
      name: m.title,
      portion: '1 serving',
      calories: m.estimatedNutrition.calories,
      protein: m.estimatedNutrition.proteinGrams,
      carbs: m.estimatedNutrition.carbsGrams,
      fat: m.estimatedNutrition.fatGrams,
      fromPlan: true,
      recipeId: m.id,
    });
  };

  // Totals for selected date
  const totalCalories = currentDateLog.meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = currentDateLog.meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = currentDateLog.meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = currentDateLog.meals.reduce((sum, m) => sum + m.fat, 0);

  const calTarget = familyProfile.nutritionGoals.dailyCaloriesTarget || 2150;
  const calPercent = Math.min(100, Math.round((totalCalories / calTarget) * 100));

  const proteinTarget = familyProfile.nutritionGoals.proteinGramsTarget || 95;
  const proteinPercent = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));

  const waterPercent = Math.min(
    100,
    Math.round((currentDateLog.waterIntakeMl / currentDateLog.waterGoalMl) * 100)
  );

  // Calendar generation helpers
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getCalendarDays = () => {
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push(dateStr);
    }
    return cells;
  };

  const calendarDays = getCalendarDays();

  // Mood options
  const moodIcons: Record<MoodType, { icon: React.ReactNode; label: string; color: string }> = {
    energized: { icon: <Zap className="w-4 h-4" />, label: 'Energized', color: 'text-amber-400 bg-amber-950/50 border-amber-800' },
    happy: { icon: <Smile className="w-4 h-4" />, label: 'Happy', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800' },
    neutral: { icon: <Meh className="w-4 h-4" />, label: 'Neutral', color: 'text-stone-300 bg-stone-900 border-white/10' },
    tired: { icon: <Coffee className="w-4 h-4" />, label: 'Tired', color: 'text-indigo-400 bg-indigo-950/50 border-indigo-800' },
    stressed: { icon: <Frown className="w-4 h-4" />, label: 'Stressed', color: 'text-rose-400 bg-rose-950/50 border-rose-800' },
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Droplet': return <Droplet className="w-5 h-5" />;
      case 'CalendarCheck': return <Calendar className="w-5 h-5" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Nutrition Analytics & Habit Tracker
            </h1>
            <span className="bg-amber-950/80 text-amber-300 border border-amber-800/40 text-xs font-bold px-2.5 py-0.5 rounded-full font-sans-clean">
              Streak & XP Leveling
            </span>
          </div>
          <p className="text-stone-400 text-xs sm:text-sm mt-1 font-serif">
            Build healthy daily nourishment habits with flexible guidance, water tracking, streak rewards, and unlockable achievements.
          </p>
        </div>

        {/* Date Selector Banner */}
        <div className="flex items-center space-x-2 bg-[#141724] px-4 py-2 rounded-2xl border border-white/10 shadow-xs">
          <Calendar className="w-4 h-4 text-orange-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-white focus:outline-hidden bg-transparent"
          />
        </div>
      </div>

      {/* Gamification Progress Hub Card */}
      <div className="bg-[#141724] border border-white/5 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Level & XP */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-stone-950 font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-sans-clean">
                Level {gamification.level} Family Chef
              </span>
              <span className="text-stone-400 text-xs font-serif">{gamification.xp} Lifetime XP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
              Keep the healthy streak alive!
            </h2>
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-[#1b2030] h-3 rounded-full overflow-hidden">
                <div
                  className="gradient-bistro h-full rounded-full transition-all duration-500"
                  style={{ width: `${(gamification.xp % 200) / 2}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-stone-400 font-sans-clean">
                <span>Current Level ({gamification.xp % 200} / 200 XP)</span>
                <span>Next: Level {gamification.level + 1}</span>
              </div>
            </div>
          </div>

          {/* Daily Streak Stat */}
          <div className="bg-[#1a1f30] p-4 rounded-2xl border border-white/5 text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Flame className="w-6 h-6 fill-amber-400 text-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-white font-sans-clean">{gamification.streak} Days</div>
            <p className="text-xs text-stone-400 font-serif">Daily Streak (Record: {gamification.longestStreak}d)</p>
          </div>

          {/* Badges Count Stat */}
          <div className="bg-[#1a1f30] p-4 rounded-2xl border border-white/5 text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-sans-clean">
              {gamification.unlockedBadges.length} / {badges.length}
            </div>
            <p className="text-xs text-stone-400 font-serif">Badges Unlocked</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Daily Nutrition & Meal Logger (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Daily Nutrition Target Cards */}
          <div className="bg-[#141724] rounded-3xl border border-white/5 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center space-x-2 font-display">
                  <Activity className="w-5 h-5 text-orange-400" />
                  <span>Nutrition Summary for {selectedDate}</span>
                </h3>
                <p className="text-xs text-stone-400 font-serif">Estimates based on portion sizes and meal ingredients</p>
              </div>
              <span className="text-[10px] text-stone-400 bg-[#1b2030] px-2 py-0.5 rounded-md font-semibold font-sans-clean">
                Guidance Only
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-sans-clean">
              <div className="p-3 bg-[#1a1f30] rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Calories</span>
                <span className="text-xl font-black text-white">{totalCalories}</span>
                <span className="text-[10px] text-stone-500 block">/ {calTarget} kcal</span>
                <div className="w-full bg-[#121522] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${calPercent}%` }} />
                </div>
              </div>

              <div className="p-3 bg-[#1a1f30] rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Protein</span>
                <span className="text-xl font-black text-emerald-400">{totalProtein}g</span>
                <span className="text-[10px] text-stone-500 block">/ {proteinTarget}g</span>
                <div className="w-full bg-[#121522] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${proteinPercent}%` }} />
                </div>
              </div>

              <div className="p-3 bg-[#1a1f30] rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Carbs</span>
                <span className="text-xl font-black text-amber-400">{totalCarbs}g</span>
                <span className="text-[10px] text-stone-500 block">Energy</span>
                <div className="w-full bg-[#121522] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, (totalCarbs / 250) * 100)}%` }} />
                </div>
              </div>

              <div className="p-3 bg-[#1a1f30] rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Fat</span>
                <span className="text-xl font-black text-rose-400">{totalFat}g</span>
                <span className="text-[10px] text-stone-500 block">Healthy fats</span>
                <div className="w-full bg-[#121522] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: `${Math.min(100, (totalFat / 75) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Hydration & Mood Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Water Tracker */}
            <div className="bg-[#141724] rounded-3xl border border-white/5 p-5 shadow-xl space-y-3 font-sans-clean">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider">
                  <Droplet className="w-4 h-4 text-cyan-400" />
                  <span>Hydration Target</span>
                </div>
                <span className="text-xs font-extrabold text-cyan-400">
                  {currentDateLog.waterIntakeMl} / {currentDateLog.waterGoalMl} ml
                </span>
              </div>

              <div className="w-full bg-[#1a1f30] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => updateWaterIntake(250)}
                  className="py-1.5 px-2 bg-[#1b2030] hover:bg-[#252c40] text-cyan-300 font-bold rounded-xl border border-white/10 flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+250 ml</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateWaterIntake(500)}
                  className="py-1.5 px-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center space-x-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+500 ml</span>
                </button>
              </div>
            </div>

            {/* Daily Mood */}
            <div className="bg-[#141724] rounded-3xl border border-white/5 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between font-sans-clean">
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Today's Family Energy & Mood
                </span>
                {currentDateLog.mood && (
                  <span className="text-[10px] font-bold capitalize text-cyan-300">
                    {currentDateLog.mood}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-1.5 pt-1">
                {(['energized', 'happy', 'neutral', 'tired', 'stressed'] as MoodType[]).map(m => {
                  const meta = moodIcons[m];
                  const isSelected = currentDateLog.mood === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDailyMood(m)}
                      className={`flex-1 p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? `${meta.color} font-bold ring-2 ring-emerald-400 shadow-xs`
                          : 'bg-[#1b2030] hover:bg-[#252c40] text-stone-400'
                      }`}
                      title={meta.label}
                    >
                      {meta.icon}
                      <span className="text-[9px] mt-1 hidden sm:block truncate max-w-full font-sans-clean">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={currentDateLog.notes || ''}
                onChange={e => setDailyNotes(e.target.value)}
                placeholder="Add daily note / dinner reflection..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#1b2030] border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-hidden font-serif"
              />
            </div>
          </div>

          {/* Logged Meals List for Selected Day */}
          <div className="bg-[#141724] rounded-3xl border border-white/5 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2 font-display">
                <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                <span>Logged Meals ({currentDateLog.meals.length})</span>
              </h3>
              <span className="text-xs text-stone-400 font-sans-clean">{selectedDate}</span>
            </div>

            {currentDateLog.meals.length === 0 ? (
              <div className="text-center py-8 text-stone-500 bg-[#121522] rounded-2xl border border-dashed border-white/5 font-serif">
                <p className="text-xs font-semibold text-stone-300">No meals logged for this day yet.</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Use the quick-logger below or pick from your weekly planned menu.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentDateLog.meals.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#1b2030] border border-white/5 text-xs font-sans-clean"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[10px] font-bold px-2 py-0.2 rounded-full uppercase">
                          {m.mealType}
                        </span>
                        <h4 className="font-bold text-white font-display text-sm">{m.name}</h4>
                        {m.fromPlan && (
                          <span className="text-[10px] text-stone-500">via Plan</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-stone-400">
                        <span>{m.portion}</span>
                        <span>•</span>
                        <span className="font-semibold text-white">{m.calories} cal</span>
                        <span>•</span>
                        <span>{m.protein}g protein</span>
                        <span>•</span>
                        <span>{m.carbs}g carbs</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeLoggedMeal(m.id)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors"
                      title="Remove logged entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick-Log from Planned Meals */}
          <div className="bg-[#141724] border border-white/5 rounded-3xl p-5 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5 font-sans-clean">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Log From Weekly Plan</span>
            </h4>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto font-sans-clean">
              {plannedMeals.slice(0, 9).map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAddPlannedMeal(m)}
                  className="px-2.5 py-1.5 bg-[#1b2030] hover:bg-[#252c40] border border-white/10 text-stone-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-3 h-3 text-cyan-400" />
                  <span className="truncate max-w-[150px]">{m.title}</span>
                  <span className="text-stone-500 text-[10px]">({m.estimatedNutrition.calories} cal)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Food & AI Nutrition Estimator Form */}
          <div className="bg-[#141724] rounded-3xl border border-white/5 p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-sm font-display">
              Log Custom Food or Snack with AI
            </h3>

            <form onSubmit={handleAddMeal} className="space-y-3 text-xs text-stone-300 font-sans-clean">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Food or Meal Description
                  </label>
                  <div className="flex space-x-1.5">
                    <input
                      type="text"
                      required
                      value={foodDescription}
                      onChange={e => setFoodDescription(e.target.value)}
                      placeholder="e.g. Bruschetta with fresh tomatoes & olive oil"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleEstimateWithAI}
                      disabled={isEstimating || !foodDescription.trim()}
                      className="px-3 py-2 gradient-bistro-btn text-white rounded-xl font-bold flex items-center space-x-1 shrink-0 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isEstimating ? 'Estimating...' : 'AI Estimate'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1">
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
              </div>

              {/* Nutrition Inputs */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase">Calories</label>
                  <input
                    type="number"
                    value={calInput}
                    onChange={e => setCalInput(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#1b2030] border border-white/10 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase">Protein (g)</label>
                  <input
                    type="number"
                    value={proteinInput}
                    onChange={e => setProteinInput(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#1b2030] border border-white/10 text-xs font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbsInput}
                    onChange={e => setCarbsInput(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#1b2030] border border-white/10 text-xs font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase">Fat (g)</label>
                  <input
                    type="number"
                    value={fatInput}
                    onChange={e => setFatInput(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#1b2030] border border-white/10 text-xs font-bold text-rose-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1e2336] hover:bg-[#252c42] text-white rounded-xl font-bold text-xs transition-colors border border-white/10"
              >
                + Log Meal to {selectedDate} (+25 XP)
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Monthly Calendar & Achievements Center (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Monthly Calendar */}
          <div className="bg-[#141724] rounded-3xl border border-white/5 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between font-sans-clean">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2 font-display">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span>Monthly Tracking History</span>
              </h3>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                  className="p-1 text-stone-400 hover:text-white rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-white min-w-24 text-center font-display">
                  {monthName}
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                  className="p-1 text-stone-400 hover:text-white rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-500 uppercase font-sans-clean">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 font-sans-clean">
              {calendarDays.map((dateStr, idx) => {
                if (!dateStr) {
                  return <div key={`empty-${idx}`} className="h-9" />;
                }

                const dayNum = parseInt(dateStr.split('-')[2]);
                const dayLog = allDailyLogs[dateStr];
                const isSelected = selectedDate === dateStr;
                const hasLogged = dayLog && dayLog.meals && dayLog.meals.length > 0;
                const metWater = dayLog && dayLog.waterIntakeMl >= (dayLog.waterGoalMl || 2000);

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-9 rounded-xl flex flex-col items-center justify-center text-xs font-semibold relative transition-all ${
                      isSelected
                        ? 'gradient-bistro text-white font-bold ring-2 ring-orange-400 shadow-sm'
                        : hasLogged
                        ? 'bg-[#1b263b] text-cyan-300 font-bold border border-cyan-800/40'
                        : 'bg-[#1a1f30] text-stone-400 hover:text-white hover:bg-[#232940]'
                    }`}
                  >
                    <span>{dayNum}</span>
                    <div className="flex space-x-0.5 mt-0.5">
                      {hasLogged && (
                        <div
                          className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`}
                        />
                      )}
                      {metWater && (
                        <div
                          className={`w-1 h-1 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-cyan-400'}`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-stone-400 font-sans-clean">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Meals Logged</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Hydration Met</span>
              </span>
            </div>
          </div>

          {/* Achievement Badges Showcase */}
          <div className="bg-[#141724] rounded-3xl border border-white/5 p-6 shadow-xl space-y-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center space-x-2 font-display">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Achievement Badges</span>
              </h3>
              <p className="text-xs text-stone-400 font-serif">
                {gamification.unlockedBadges.length} of {badges.length} badges earned
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {badges.map(badge => {
                const isUnlocked = gamification.unlockedBadges.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isUnlocked
                        ? 'bg-[#1b2030] border-amber-500/30 shadow-xs'
                        : 'bg-[#141724] border-white/5 opacity-40 grayscale'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-sans-clean">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-500'
                          }`}
                        >
                          {getBadgeIcon(badge.iconName)}
                        </div>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded-md">
                          +{badge.xpReward} XP
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-xs leading-snug font-display">{badge.title}</h4>
                      <p className="text-[10px] text-stone-400 leading-tight font-serif">{badge.description}</p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-white/5 text-[10px] font-bold font-sans-clean">
                      {isUnlocked ? (
                        <span className="text-emerald-400 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-stone-500">Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
