import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AchievementBadge,
  ChatMessage,
  DailyLog,
  FamilyProfile,
  GamificationState,
  LoggedMeal,
  MealRecipe,
  MealType,
  MoodType,
  PantryItem,
  ShoppingListItem,
  WeeklyMealPlan,
} from '../types';
import {
  BADGES_LIST,
  DEFAULT_FAMILY_PROFILE,
  DEFAULT_GAMIFICATION,
  DEFAULT_PANTRY_ITEMS,
  DEFAULT_WEEKLY_PLAN,
  INITIAL_TODAY_LOG,
} from '../utils/initialData';

interface AppContextType {
  // Family Profile
  familyProfile: FamilyProfile;
  updateFamilyProfile: (profile: FamilyProfile) => void;

  // Pantry
  pantryItems: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id' | 'addedAt'>) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  deletePantryItem: (id: string) => void;
  markItemUsed: (id: string) => void;
  addScannedPantryItems: (items: Array<Omit<PantryItem, 'id' | 'addedAt'>>) => void;

  // Meal Plan
  weeklyPlan: WeeklyMealPlan;
  setWeeklyPlan: (plan: WeeklyMealPlan) => void;
  replaceMealInPlan: (dayNumber: number, mealType: MealType, newMeal: MealRecipe) => void;
  toggleMealCompleted: (dayNumber: number, mealType: MealType) => void;

  // Recipes & Favorites
  favoriteRecipes: MealRecipe[];
  toggleFavoriteRecipe: (recipe: MealRecipe) => void;
  isRecipeFavorite: (recipeId: string) => boolean;

  // Smart Shopping List
  shoppingList: ShoppingListItem[];
  toggleShoppingItem: (id: string) => void;
  addShoppingItem: (item: { name: string; category?: string; neededQuantity: string }) => void;
  removeShoppingItem: (id: string) => void;
  generateShoppingListFromPlan: () => void;
  clearCheckedShoppingItems: () => void;

  // Daily Logging & Nutrition Tracker
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentDateLog: DailyLog;
  logMeal: (meal: Omit<LoggedMeal, 'id' | 'completedAt'>, date?: string) => void;
  removeLoggedMeal: (mealId: string, date?: string) => void;
  updateWaterIntake: (amountMl: number, date?: string) => void;
  setDailyMood: (mood: MoodType, date?: string) => void;
  setDailyNotes: (notes: string, date?: string) => void;
  allDailyLogs: Record<string, DailyLog>;

  // Gamification
  gamification: GamificationState;
  awardXp: (amount: number, reason: string) => void;
  checkAndUnlockBadge: (badgeId: string) => void;
  badges: AchievementBadge[];
  activeNotification: string | null;
  dismissNotification: () => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;

  // Reset Data
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'familychef_profile_v1',
  PANTRY: 'familychef_pantry_v1',
  PLAN: 'familychef_plan_v1',
  FAVORITES: 'familychef_favorites_v1',
  SHOPPING: 'familychef_shopping_v1',
  DAILY_LOGS: 'familychef_logs_v1',
  GAMIFICATION: 'familychef_gamification_v1',
  CHAT: 'familychef_chat_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Initialize State from LocalStorage
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return stored ? JSON.parse(stored) : DEFAULT_FAMILY_PROFILE;
    } catch {
      return DEFAULT_FAMILY_PROFILE;
    }
  });

  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PANTRY);
      return stored ? JSON.parse(stored) : DEFAULT_PANTRY_ITEMS;
    } catch {
      return DEFAULT_PANTRY_ITEMS;
    }
  });

  const [weeklyPlan, setWeeklyPlanState] = useState<WeeklyMealPlan>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAN);
      return stored ? JSON.parse(stored) : DEFAULT_WEEKLY_PLAN;
    } catch {
      return DEFAULT_WEEKLY_PLAN;
    }
  });

  const [favoriteRecipes, setFavoriteRecipes] = useState<MealRecipe[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHOPPING);
      if (stored) return JSON.parse(stored);
      // Auto build initial shopping list
      return buildShoppingListFromPlan(DEFAULT_WEEKLY_PLAN, DEFAULT_PANTRY_ITEMS);
    } catch {
      return [];
    }
  });

  const [allDailyLogs, setAllDailyLogs] = useState<Record<string, DailyLog>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      const parsed = stored ? JSON.parse(stored) : {};
      const today = getTodayStr();
      if (!parsed[today]) {
        parsed[today] = { ...INITIAL_TODAY_LOG, date: today };
      }
      return parsed;
    } catch {
      return { [getTodayStr()]: INITIAL_TODAY_LOG };
    }
  });

  const [gamification, setGamification] = useState<GamificationState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
      return stored ? JSON.parse(stored) : DEFAULT_GAMIFICATION;
    } catch {
      return DEFAULT_GAMIFICATION;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT);
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: 'init-1',
              sender: 'assistant',
              text: `Hello Miller family! I'm Chef Remy, your AI sous-chef. I see you have fresh baby spinach, bell peppers, and avocado that should be enjoyed in the next 1-3 days to minimize food waste. How can I help you cook today?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestedActions: [
                'What can I cook with ingredients expiring soon?',
                'Suggest a 20-minute kid-friendly dinner',
                'How can I substitute dairy in pasta recipes?',
                'Review our weekly meal plan nutrition',
              ],
            },
          ];
    } catch {
      return [];
    }
  });

  // Sync state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(familyProfile));
  }, [familyProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteRecipes));
  }, [favoriteRecipes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(allDailyLogs));
  }, [allDailyLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(gamification));
  }, [gamification]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899'],
      });
    } catch (e) {
      // Fallback
    }
  };

  // Gamification helpers
  const awardXp = (amount: number, reason: string) => {
    setGamification(prev => {
      const newXp = prev.xp + amount;
      // 100 XP per level
      const newLevel = Math.floor(newXp / 200) + 1;
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        triggerConfetti();
        setActiveNotification(`🎉 LEVEL UP! You reached Level ${newLevel}! (${reason}: +${amount} XP)`);
      } else {
        setActiveNotification(`✨ +${amount} XP: ${reason}`);
      }

      // Check daily streak
      const today = getTodayStr();
      let streak = prev.streak;
      let longest = prev.longestStreak;

      if (prev.lastTrackedDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (prev.lastTrackedDate === yesterday) {
          streak += 1;
          if (streak > longest) longest = streak;
        } else if (!prev.lastTrackedDate) {
          streak = 1;
        }
      }

      const rewardEntry = {
        id: `rw-${Date.now()}`,
        title: reason,
        xpAwarded: amount,
        date: today,
      };

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        streak,
        longestStreak: Math.max(streak, longest),
        lastTrackedDate: today,
        recentRewards: [rewardEntry, ...prev.recentRewards.slice(0, 9)],
      };
    });
  };

  const checkAndUnlockBadge = (badgeId: string) => {
    setGamification(prev => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;

      const badge = BADGES_LIST.find(b => b.id === badgeId);
      if (!badge) return prev;

      triggerConfetti();
      setActiveNotification(`🏆 BADGE UNLOCKED: "${badge.title}"! +${badge.xpReward} XP`);

      const newXp = prev.xp + badge.xpReward;
      const newLevel = Math.floor(newXp / 200) + 1;

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        unlockedBadges: [...prev.unlockedBadges, badgeId],
        recentRewards: [
          {
            id: `rw-b-${Date.now()}`,
            title: `Unlocked Badge: ${badge.title}`,
            xpAwarded: badge.xpReward,
            date: getTodayStr(),
          },
          ...prev.recentRewards.slice(0, 9),
        ],
      };
    });
  };

  const dismissNotification = () => setActiveNotification(null);

  // Profile
  const updateFamilyProfile = (profile: FamilyProfile) => {
    setFamilyProfile(profile);
    awardXp(30, 'Updated Family Dietary Profile');
    if (profile.allergies.length > 0) {
      checkAndUnlockBadge('allergy_guardian');
    }
  };

  // Pantry
  const addPantryItem = (itemData: Omit<PantryItem, 'id' | 'addedAt'>) => {
    const newItem: PantryItem = {
      ...itemData,
      id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      addedAt: new Date().toISOString(),
    };
    setPantryItems(prev => [newItem, ...prev]);
    awardXp(15, `Added "${newItem.name}" to Pantry`);
  };

  const updatePantryItem = (id: string, updates: Partial<PantryItem>) => {
    setPantryItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deletePantryItem = (id: string) => {
    setPantryItems(prev => prev.filter(item => item.id !== id));
  };

  const markItemUsed = (id: string) => {
    setPantryItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const willBeUsed = !item.isUsed;
          if (willBeUsed) {
            awardXp(25, `Cooked with "${item.name}"`);
            if (item.freshnessStatus === 'Use Soon' || (item.estimatedDaysUntilExpiry && item.estimatedDaysUntilExpiry <= 3)) {
              checkAndUnlockBadge('zero_waste_hero');
            }
          }
          return { ...item, isUsed: willBeUsed };
        }
        return item;
      })
    );
  };

  const addScannedPantryItems = (newItems: Array<Omit<PantryItem, 'id' | 'addedAt'>>) => {
    const formatted: PantryItem[] = newItems.map(item => ({
      ...item,
      id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      addedAt: new Date().toISOString(),
    }));
    setPantryItems(prev => [...formatted, ...prev]);
    awardXp(50, `Scanned & added ${formatted.length} pantry ingredients`);
    checkAndUnlockBadge('first_scan');
  };

  // Meal Plan
  const setWeeklyPlan = (plan: WeeklyMealPlan) => {
    setWeeklyPlanState(plan);
    awardXp(100, 'Generated 7-Day Meal Plan');
    checkAndUnlockBadge('weekly_master');
  };

  const replaceMealInPlan = (dayNumber: number, mealType: MealType, newMeal: MealRecipe) => {
    setWeeklyPlanState(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            [mealType]: newMeal,
          };
        }
        return day;
      });
      return {
        ...prev,
        days: updatedDays,
      };
    });
    awardXp(20, `Replaced ${mealType} on Day ${dayNumber}`);
  };

  const toggleMealCompleted = (dayNumber: number, mealType: MealType) => {
    setWeeklyPlanState(prev => {
      let mealTitle = '';
      const updatedDays = prev.days.map(day => {
        if (day.dayNumber === dayNumber) {
          const targetMeal = day[mealType];
          if (targetMeal) {
            mealTitle = targetMeal.title;
            const isNowCompleted = !targetMeal.isCompleted;
            return {
              ...day,
              [mealType]: {
                ...targetMeal,
                isCompleted: isNowCompleted,
              },
            };
          }
        }
        return day;
      });

      if (mealTitle) {
        awardXp(30, `Completed "${mealTitle}"`);
      }
      return { ...prev, days: updatedDays };
    });
  };

  // Recipe Favorites
  const toggleFavoriteRecipe = (recipe: MealRecipe) => {
    setFavoriteRecipes(prev => {
      const exists = prev.some(r => r.title.toLowerCase() === recipe.title.toLowerCase());
      if (exists) {
        return prev.filter(r => r.title.toLowerCase() !== recipe.title.toLowerCase());
      } else {
        awardXp(15, `Saved "${recipe.title}" to Favorites`);
        return [...prev, { ...recipe, isFavorite: true }];
      }
    });
  };

  const isRecipeFavorite = (recipeId: string) => {
    return favoriteRecipes.some(r => r.id === recipeId || r.title === recipeId);
  };

  // Shopping List
  function buildShoppingListFromPlan(plan: WeeklyMealPlan, currentPantry: PantryItem[]): ShoppingListItem[] {
    const pantryMap = new Map<string, string>();
    currentPantry.forEach(p => {
      pantryMap.set(p.name.toLowerCase().trim(), p.quantity);
    });

    const itemsMap = new Map<string, { category: string; count: number; rawUnit: string }>();

    plan.days.forEach(day => {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mKey => {
        const meal = (day as any)[mKey] as MealRecipe | undefined;
        if (meal && meal.ingredients) {
          meal.ingredients.forEach(ing => {
            const cleanName = ing.item.replace(/\(.*?\)/g, '').trim();
            const lower = cleanName.toLowerCase();
            // Don't duplicate water, salt, pepper
            if (['water', 'salt', 'black pepper', 'sea salt', 'water (filtered)'].includes(lower)) return;

            const existing = itemsMap.get(lower);
            if (existing) {
              existing.count += 1;
            } else {
              itemsMap.set(lower, {
                category: categorizeIngredient(cleanName),
                count: 1,
                rawUnit: ing.quantity,
              });
            }
          });
        }
      });
    });

    const result: ShoppingListItem[] = [];
    itemsMap.forEach((meta, name) => {
      // Capitalize first letter
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      const inPantry = pantryMap.get(name);

      result.push({
        id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: displayName,
        category: meta.category,
        neededQuantity: meta.count > 1 ? `${meta.count}x batches` : meta.rawUnit || '1 pack',
        pantryQuantity: inPantry ? `Have in pantry (${inPantry})` : undefined,
        isChecked: !!inPantry, // auto-check if already in pantry!
        fromMealPlan: true,
      });
    });

    return result.sort((a, b) => a.category.localeCompare(b.category));
  }

  function categorizeIngredient(name: string): string {
    const l = name.toLowerCase();
    if (l.includes('apple') || l.includes('spinach') || l.includes('pepper') || l.includes('lettuce') || l.includes('onion') || l.includes('avocado') || l.includes('tomato') || l.includes('broccoli') || l.includes('carrot') || l.includes('lemon') || l.includes('garlic') || l.includes('potato') || l.includes('berry') || l.includes('banana') || l.includes('zucchini') || l.includes('green bean')) {
      return 'Fruits & Vegetables';
    }
    if (l.includes('milk') || l.includes('cheese') || l.includes('yogurt') || l.includes('butter') || l.includes('egg') || l.includes('cream')) {
      return 'Dairy & Alternatives';
    }
    if (l.includes('chicken') || l.includes('turkey') || l.includes('salmon') || l.includes('beef') || l.includes('tuna') || l.includes('shrimp') || l.includes('tofu')) {
      return 'Protein';
    }
    if (l.includes('pasta') || l.includes('penne') || l.includes('rice') || l.includes('oat') || l.includes('bread') || l.includes('tortilla') || l.includes('quinoa') || l.includes('naan')) {
      return 'Grains & Bakery';
    }
    if (l.includes('bean') || l.includes('chickpea') || l.includes('lentil') || l.includes('broth') || l.includes('olive oil') || l.includes('sauce') || l.includes('hummus')) {
      return 'Pantry Staples';
    }
    if (l.includes('cinnamon') || l.includes('cumin') || l.includes('oregano') || l.includes('thyme') || l.includes('paprika') || l.includes('chili') || l.includes('yeast') || l.includes('syrup')) {
      return 'Spices & Seasonings';
    }
    return 'Other Items';
  }

  const generateShoppingListFromPlan = () => {
    const list = buildShoppingListFromPlan(weeklyPlan, pantryItems);
    setShoppingList(list);
    awardXp(30, 'Calculated Smart Shopping List');
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => {
        if (item.id === id) {
          const willCheck = !item.isChecked;
          if (willCheck) {
            awardXp(5, `Checked off ${item.name}`);
          }
          return { ...item, isChecked: willCheck };
        }
        return item;
      })
    );
  };

  const addShoppingItem = (itemData: { name: string; category?: string; neededQuantity: string }) => {
    const newItem: ShoppingListItem = {
      id: `shop-${Date.now()}`,
      name: itemData.name,
      category: itemData.category || categorizeIngredient(itemData.name),
      neededQuantity: itemData.neededQuantity || '1 item',
      isChecked: false,
      isCustom: true,
    };
    setShoppingList(prev => [newItem, ...prev]);
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearCheckedShoppingItems = () => {
    setShoppingList(prev => prev.filter(item => !item.isChecked));
  };

  // Daily Logging & Nutrition
  const getOrCreateDayLog = (date: string): DailyLog => {
    if (allDailyLogs[date]) return allDailyLogs[date];
    return {
      date,
      meals: [],
      waterIntakeMl: 0,
      waterGoalMl: familyProfile.nutritionGoals.dailyWaterMlTarget || 2500,
    };
  };

  const currentDateLog = getOrCreateDayLog(selectedDate);

  const logMeal = (mealData: Omit<LoggedMeal, 'id' | 'completedAt'>, date: string = selectedDate) => {
    const newMeal: LoggedMeal = {
      ...mealData,
      id: `log-meal-${Date.now()}`,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAllDailyLogs(prev => {
      const existing = prev[date] || {
        date,
        meals: [],
        waterIntakeMl: 0,
        waterGoalMl: familyProfile.nutritionGoals.dailyWaterMlTarget || 2500,
      };
      return {
        ...prev,
        [date]: {
          ...existing,
          meals: [...existing.meals, newMeal],
        },
      };
    });

    awardXp(25, `Logged ${mealData.name} (${mealData.mealType})`);
    checkAndUnlockBadge('three_day_streak');
  };

  const removeLoggedMeal = (mealId: string, date: string = selectedDate) => {
    setAllDailyLogs(prev => {
      const existing = prev[date];
      if (!existing) return prev;
      return {
        ...prev,
        [date]: {
          ...existing,
          meals: existing.meals.filter(m => m.id !== mealId),
        },
      };
    });
  };

  const updateWaterIntake = (amountMl: number, date: string = selectedDate) => {
    setAllDailyLogs(prev => {
      const existing = prev[date] || {
        date,
        meals: [],
        waterIntakeMl: 0,
        waterGoalMl: familyProfile.nutritionGoals.dailyWaterMlTarget || 2500,
      };
      const newWater = Math.max(0, existing.waterIntakeMl + amountMl);
      const metGoalBefore = existing.waterIntakeMl >= existing.waterGoalMl;
      const metGoalNow = newWater >= existing.waterGoalMl;

      if (!metGoalBefore && metGoalNow) {
        awardXp(50, 'Reached Daily Water Goal!');
        checkAndUnlockBadge('hydration_champion');
      }

      return {
        ...prev,
        [date]: {
          ...existing,
          waterIntakeMl: newWater,
        },
      };
    });
  };

  const setDailyMood = (mood: MoodType, date: string = selectedDate) => {
    setAllDailyLogs(prev => {
      const existing = prev[date] || {
        date,
        meals: [],
        waterIntakeMl: 0,
        waterGoalMl: familyProfile.nutritionGoals.dailyWaterMlTarget || 2500,
      };
      return {
        ...prev,
        [date]: {
          ...existing,
          mood,
        },
      };
    });
    awardXp(10, 'Tracked Daily Family Mood');
  };

  const setDailyNotes = (notes: string, date: string = selectedDate) => {
    setAllDailyLogs(prev => {
      const existing = prev[date] || {
        date,
        meals: [],
        waterIntakeMl: 0,
        waterGoalMl: familyProfile.nutritionGoals.dailyWaterMlTarget || 2500,
      };
      return {
        ...prev,
        [date]: {
          ...existing,
          notes,
        },
      };
    });
  };

  // Chat
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
    if (msg.sender === 'user') {
      awardXp(10, 'Consulted Chef Remy');
      checkAndUnlockBadge('chef_confidant');
    }
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: `chat-${Date.now()}`,
        sender: 'assistant',
        text: `Fresh chat started! How can I assist you with your family cooking, ingredients, or meal plan today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'What can I cook with ingredients expiring soon?',
          'Suggest a healthy dinner for my family',
          'How can I substitute dairy in recipes?',
        ],
      },
    ]);
  };

  // Reset Data
  const resetAllData = () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    setFamilyProfile(DEFAULT_FAMILY_PROFILE);
    setPantryItems(DEFAULT_PANTRY_ITEMS);
    setWeeklyPlanState(DEFAULT_WEEKLY_PLAN);
    setFavoriteRecipes([]);
    setShoppingList(buildShoppingListFromPlan(DEFAULT_WEEKLY_PLAN, DEFAULT_PANTRY_ITEMS));
    setAllDailyLogs({ [getTodayStr()]: INITIAL_TODAY_LOG });
    setGamification(DEFAULT_GAMIFICATION);
    setChatMessages([
      {
        id: `chat-${Date.now()}`,
        sender: 'assistant',
        text: 'Data reset to defaults. Ready for your cooking adventures!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setActiveNotification('✨ All local data reset to default demo family configuration.');
  };

  return (
    <AppContext.Provider
      value={{
        familyProfile,
        updateFamilyProfile,
        pantryItems,
        addPantryItem,
        updatePantryItem,
        deletePantryItem,
        markItemUsed,
        addScannedPantryItems,
        weeklyPlan,
        setWeeklyPlan,
        replaceMealInPlan,
        toggleMealCompleted,
        favoriteRecipes,
        toggleFavoriteRecipe,
        isRecipeFavorite,
        shoppingList,
        toggleShoppingItem,
        addShoppingItem,
        removeShoppingItem,
        generateShoppingListFromPlan,
        clearCheckedShoppingItems,
        selectedDate,
        setSelectedDate,
        currentDateLog,
        logMeal,
        removeLoggedMeal,
        updateWaterIntake,
        setDailyMood,
        setDailyNotes,
        allDailyLogs,
        gamification,
        awardXp,
        checkAndUnlockBadge,
        badges: BADGES_LIST,
        activeNotification,
        dismissNotification,
        chatMessages,
        addChatMessage,
        clearChatHistory,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
