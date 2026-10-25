export type AgeGroup = 'toddler' | 'kid' | 'teen' | 'adult' | 'senior';

export interface FamilyMember {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  age?: number;
  dietPreference?: string;
  foodAllergies?: string[];
  dietaryConsiderations?: string[];
  favoriteFoods?: string;
  foodsToAvoid?: string;
  notes?: string;
}

export type BudgetLevel = 'budget-friendly' | 'moderate' | 'gourmet';
export type FreshnessStatus = 'Fresh' | 'Use Soon' | 'Check Freshness';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Advanced';

export interface FamilyProfile {
  familyName: string;
  members: FamilyMember[];
  allergies: string[];
  dietaryRestrictions: string[];
  dietaryPreferences: string[];
  nutritionGoals: {
    dailyCaloriesTarget: number;
    dailyWaterMlTarget: number;
    proteinGramsTarget: number;
    focus: string[];
  };
  preferredCuisines: string[];
  dislikedIngredients: string[];
  budgetRange: BudgetLevel;
  budgetTier?: 'Economy' | 'Standard' | 'Premium';
  targetPrepTime?: 'Under 15 mins' | 'Under 30 mins' | 'Under 1 hour';
  kitchenEquipment?: string[];
  maxCookingTimeMinutes: number;
  servings: number;
  wasteSavedDollars?: number;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  freshnessStatus: FreshnessStatus;
  confidenceScore?: number;
  estimatedDaysUntilExpiry?: number | null;
  expirationDate?: string;
  addedAt: string;
  isUsed?: boolean;
  notes?: string;
  allergenAlert?: string;
}

export interface RecipeIngredient {
  item: string;
  quantity: string;
  isPantryItem?: boolean;
  notes?: string;
}

export interface RecipeSubstitution {
  original: string;
  replacement: string;
  reason?: string;
}

export interface RecipeNutrition {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
}

export interface MealRecipe {
  id: string;
  title: string;
  description: string;
  mealType: MealType;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: DifficultyLevel;
  cuisine?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  estimatedNutrition: RecipeNutrition;
  substitutions?: RecipeSubstitution[];
  storageTips?: string;
  dietaryTags?: string[];
  allergenWarnings?: string[];
  wasteReductionNotes?: string;
  isFavorite?: boolean;
  isCompleted?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  dayName: string;
  breakfast: MealRecipe;
  lunch: MealRecipe;
  dinner: MealRecipe;
  snack?: MealRecipe;
  dailyNutritionSummary?: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  };
}

export interface WeeklyMealPlan {
  planId: string;
  summary: string;
  days: DayPlan[];
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  neededQuantity: string;
  pantryQuantity?: string;
  isChecked: boolean;
  fromMealPlan?: boolean;
  isCustom?: boolean;
}

export type MoodType = 'energized' | 'happy' | 'neutral' | 'tired' | 'stressed';

export interface LoggedMeal {
  id: string;
  mealType: MealType;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fromPlan?: boolean;
  recipeId?: string;
  completedAt: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: LoggedMeal[];
  waterIntakeMl: number;
  waterGoalMl: number;
  mood?: MoodType;
  notes?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  xpReward: number;
  unlockedAt?: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastTrackedDate: string;
  unlockedBadges: string[];
  recentRewards: Array<{
    id: string;
    title: string;
    xpAwarded: number;
    date: string;
  }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}
