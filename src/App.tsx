import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BistroSidebar, BistroNavTab } from './components/common/BistroSidebar';
import { NotificationToast } from './components/common/NotificationToast';
import { RecipeDetailModal } from './components/common/RecipeDetailModal';
import { FamilyProfileModal } from './components/common/FamilyProfileModal';
import { ShoppingListModal } from './components/common/ShoppingListModal';
import { BistroSignInModal } from './components/auth/BistroSignInModal';
import { BistroOnboardingModal } from './components/onboarding/BistroOnboardingModal';

// Pages
import { DashboardPage } from './components/pages/DashboardPage';
import { PantryScannerPage } from './components/pages/PantryScannerPage';
import { MealPlannerPage } from './components/pages/MealPlannerPage';
import { RecipeCustomizerPage } from './components/pages/RecipeCustomizerPage';
import { AIChefChatPage } from './components/pages/AIChefChatPage';
import { NutritionTrackerPage } from './components/pages/NutritionTrackerPage';

// Types & Icons
import { MealRecipe } from './types';
import {
  ChefHat,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  Sliders,
  User,
  Heart,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Package,
  Layers,
} from 'lucide-react';

function MainAppShell() {
  const {
    familyProfile,
    gamification,
    favoriteRecipes,
    toggleFavoriteRecipe,
    shoppingList,
    toggleShoppingItem,
    addShoppingItem,
    removeShoppingItem,
    clearCheckedShoppingItems,
    generateShoppingListFromPlan,
  } = useApp();

  const [currentTab, setCurrentTab] = useState<BistroNavTab>('dashboard');
  const [activeRecipeModal, setActiveRecipeModal] = useState<MealRecipe | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New grocery inline item state
  const [newGroceryItem, setNewGroceryItem] = useState('');
  const [newGroceryCat, setNewGroceryCat] = useState('Produce');

  const uncheckedShoppingCount = shoppingList.filter((i) => !i.isChecked).length;

  const handleNavClick = (tab: BistroNavTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryItem.trim()) return;
    addShoppingItem({
      name: newGroceryItem.trim(),
      category: newGroceryCat,
      neededQuantity: '1 item',
    });
    setNewGroceryItem('');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0c0e15] text-stone-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Desktop Left Sidebar (Matching Image 5) */}
      <BistroSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openOnboarding={() => setIsOnboardingOpen(true)}
        openSignIn={() => setIsSignInOpen(true)}
      />

      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0c0e15]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#1a1c29] border border-orange-500/20 flex items-center justify-center text-orange-400">
            <ChefHat className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-display font-bold text-base text-white">BistroChef</span>
              <span className="font-display font-black text-base bg-gradient-to-r from-orange-400 to-emerald-400 bg-clip-text text-transparent">
                AI
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Setup Pill */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#1b2030] text-[11px] font-bold text-stone-300 border border-white/10 hover:text-white"
          >
            <Sliders className="w-3 h-3 text-emerald-400" />
            <span className="truncate max-w-[80px]">{familyProfile.familyName}</span>
          </button>

          {/* Quick Auth Trigger */}
          <button
            onClick={() => setIsSignInOpen(true)}
            className="p-1.5 rounded-full bg-[#1b2030] text-stone-300 hover:text-white border border-white/10"
            title="Sign In"
          >
            <User className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#161a26] text-stone-300 hover:text-white border border-white/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-[#0c0e15]/98 backdrop-blur-xl p-4 overflow-y-auto space-y-2 animate-fadeIn border-b border-white/10">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 px-3 pt-2">
            Navigation Menu
          </div>

          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold tracking-wider ${
              currentTab === 'dashboard'
                ? 'gradient-bistro-tab text-white shadow-lg shadow-orange-500/20'
                : 'text-stone-300 bg-[#141724]'
            }`}
          >
            <span>DASHBOARD</span>
            {currentTab === 'dashboard' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>

          <button
            onClick={() => handleNavClick('pantry')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold tracking-wider ${
              currentTab === 'pantry'
                ? 'gradient-bistro-tab text-white shadow-lg shadow-orange-500/20'
                : 'text-stone-300 bg-[#141724]'
            }`}
          >
            <span>PANTRY STOCK</span>
            {currentTab === 'pantry' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>

          <button
            onClick={() => handleNavClick('planner')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold tracking-wider ${
              currentTab === 'planner'
                ? 'gradient-bistro-tab text-white shadow-lg shadow-orange-500/20'
                : 'text-stone-300 bg-[#141724]'
            }`}
          >
            <span>MEAL PLANNER</span>
            {currentTab === 'planner' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>

          <button
            onClick={() => handleNavClick('assistant')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold tracking-wider ${
              currentTab === 'assistant'
                ? 'gradient-bistro-tab text-white shadow-lg shadow-orange-500/20'
                : 'text-stone-300 bg-[#141724]'
            }`}
          >
            <span>AI ASSISTANT</span>
            {currentTab === 'assistant' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>

          <button
            onClick={() => handleNavClick('groceries')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold tracking-wider ${
              currentTab === 'groceries'
                ? 'gradient-bistro-tab text-white shadow-lg shadow-orange-500/20'
                : 'text-stone-300 bg-[#141724]'
            }`}
          >
            <span>GROCERY LIST</span>
            {uncheckedShoppingCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                {uncheckedShoppingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('analytics')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold tracking-wider ${
              currentTab === 'analytics'
                ? 'gradient-bistro-tab text-white shadow-lg shadow-orange-500/20'
                : 'text-stone-300 bg-[#141724]'
            }`}
          >
            <span>ANALYTICS</span>
            {currentTab === 'analytics' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>

          <button
            onClick={() => handleNavClick('favorites')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold tracking-wider ${
              currentTab === 'favorites'
                ? 'gradient-bistro-tab text-white shadow-lg shadow-orange-500/20'
                : 'text-stone-300 bg-[#141724]'
            }`}
          >
            <span>SAVED FAVORITES</span>
            {favoriteRecipes.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                {favoriteRecipes.length}
              </span>
            )}
          </button>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsOnboardingOpen(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#1b2030] hover:bg-[#252c40] text-stone-200 text-xs font-bold flex items-center justify-center space-x-2"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Family Kitchen Onboarding Setup</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSignInOpen(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#131722] hover:bg-[#1b2030] text-stone-400 text-xs font-bold flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Switch Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Subtle Ambient Glow */}
        <div className="fixed top-0 right-1/4 w-[500px] h-[300px] bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-10 w-[500px] h-[300px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top utility quick-bar (Desktop only) */}
        <div className="hidden md:flex items-center justify-between px-8 py-3.5 border-b border-white/5 bg-[#0c0e15]/60 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center space-x-3 text-xs text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-stone-300">
              Kitchen Profile: <strong className="text-white font-bold">{familyProfile.familyName}</strong>
            </span>
            <span className="text-stone-600">•</span>
            <span className="text-stone-400 font-mono text-[11px]">
              {familyProfile.members.length} members · {familyProfile.targetPrepTime} prep · {familyProfile.budgetTier} tier
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Direct reference demo buttons */}
            <div className="flex items-center space-x-1.5 bg-[#141724] border border-white/5 rounded-xl px-2 py-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider pl-1">
                Screens:
              </span>
              <button
                onClick={() => setIsSignInOpen(true)}
                className="px-2 py-0.5 rounded-lg bg-[#1f2438] hover:bg-orange-500 hover:text-white text-[11px] font-bold text-stone-300 transition-colors"
                title="Open Auth / Sign In Modal (Image 1)"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-2 py-0.5 rounded-lg bg-[#1f2438] hover:bg-emerald-500 hover:text-white text-[11px] font-bold text-stone-300 transition-colors"
                title="Open 3-Step Setup Onboarding (Images 2, 3, 4)"
              >
                Setup Steps
              </button>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-1.5 rounded-xl bg-[#141724] hover:bg-[#1c2132] border border-white/5 text-stone-300 hover:text-white transition-colors"
              title="Edit Profile"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsShoppingModalOpen(true)}
              className="relative p-1.5 rounded-xl bg-[#141724] hover:bg-[#1c2132] border border-white/5 text-stone-300 hover:text-white transition-colors"
              title="Quick Grocery List"
            >
              <ShoppingBag className="w-4 h-4" />
              {uncheckedShoppingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  {uncheckedShoppingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: DASHBOARD (Matching Image 5) */}
          {currentTab === 'dashboard' && (
            <DashboardPage
              navigateTo={setCurrentTab}
              openRecipeModal={setActiveRecipeModal}
              openProfileModal={() => setIsProfileModalOpen(true)}
              openOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {/* TAB 2: PANTRY SCANNER */}
          {currentTab === 'pantry' && (
            <PantryScannerPage navigateTo={setCurrentTab} />
          )}

          {/* TAB 3: MEAL PLANNER */}
          {currentTab === 'planner' && (
            <MealPlannerPage
              openRecipeModal={setActiveRecipeModal}
              openProfileModal={() => setIsProfileModalOpen(true)}
              openShoppingModal={() => setIsShoppingModalOpen(true)}
            />
          )}

          {/* TAB 4: AI ASSISTANT / CHAT */}
          {currentTab === 'assistant' && (
            <AIChefChatPage />
          )}

          {/* TAB 5: GROCERY LIST VIEW */}
          {currentTab === 'groceries' && (
            <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h1 className="text-3xl font-bold font-display text-white">Smart Grocery List</h1>
                  <p className="text-stone-400 text-sm mt-1">
                    Synchronized with your 7-day meal plan and current pantry inventory.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={generateShoppingListFromPlan}
                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-2 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sync from Meal Plan</span>
                  </button>
                  {shoppingList.some((i) => i.isChecked) && (
                    <button
                      onClick={clearCheckedShoppingItems}
                      className="px-3.5 py-2.5 rounded-xl bg-[#1a1f30] hover:bg-rose-500/20 hover:text-rose-400 text-stone-300 font-bold text-xs flex items-center space-x-1.5 transition-colors border border-white/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Checked</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Add item form */}
              <form onSubmit={handleAddGrocery} className="flex flex-wrap sm:flex-nowrap gap-3 bg-[#131722] p-4 rounded-2xl border border-white/5">
                <input
                  type="text"
                  value={newGroceryItem}
                  onChange={(e) => setNewGroceryItem(e.target.value)}
                  placeholder="Add item (e.g. San Marzano tomatoes, fresh basil)..."
                  className="flex-1 bg-[#1a1f30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 font-sans-clean"
                />
                <select
                  value={newGroceryCat}
                  onChange={(e) => setNewGroceryCat(e.target.value)}
                  className="bg-[#1a1f30] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none focus:border-orange-500 font-sans-clean"
                >
                  <option value="Produce">Produce</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                  <option value="Pantry Staples">Pantry Staples</option>
                  <option value="Spices & Herbs">Spices & Herbs</option>
                  <option value="Bakery">Bakery</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl gradient-bistro-btn text-white text-xs font-bold flex items-center space-x-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </form>

              {/* Shopping List Items */}
              {shoppingList.length === 0 ? (
                <div className="text-center py-16 bg-[#131722] rounded-3xl border border-white/5 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#1f2438] flex items-center justify-center text-orange-400 mx-auto mb-4">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-white mb-2">Your grocery list is empty</h3>
                  <p className="text-stone-400 text-sm max-w-md mx-auto mb-6">
                    Add custom items above or automatically populate ingredients from your 7-day meal plan.
                  </p>
                  <button
                    onClick={generateShoppingListFromPlan}
                    className="px-5 py-2.5 rounded-xl gradient-bistro-btn text-white font-bold text-xs inline-flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Populate from Active Plan</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shoppingList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleShoppingItem(item.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        item.isChecked
                          ? 'bg-[#10141e]/70 border-white/5 text-stone-500 line-through'
                          : 'bg-[#141724] border-white/10 hover:border-orange-500/40 text-stone-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                            item.isChecked
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-stone-500 hover:border-orange-400'
                          }`}
                        >
                          {item.isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className={`text-sm font-semibold block truncate ${item.isChecked ? 'line-through text-stone-500' : 'text-white'}`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-stone-500 font-sans-clean">
                            {item.neededQuantity} · {item.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeShoppingItem(item.id);
                        }}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ANALYTICS & NUTRITION TRACKER */}
          {currentTab === 'analytics' && (
            <NutritionTrackerPage />
          )}

          {/* TAB 7: SAVED FAVORITES */}
          {currentTab === 'favorites' && (
            <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h1 className="text-3xl font-bold font-display text-white">Saved Family Favorites</h1>
                  <p className="text-stone-400 text-sm mt-1">
                    Your collection of starred bistro recipes, custom dishes, and family crowd-pleasers.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('planner')}
                  className="px-4 py-2.5 rounded-xl gradient-bistro-btn text-white font-bold text-xs flex items-center space-x-1.5"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Go to Meal Planner</span>
                </button>
              </div>

              {favoriteRecipes.length === 0 ? (
                <div className="text-center py-16 bg-[#131722] rounded-3xl border border-white/5 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-white mb-2">No saved favorites yet</h3>
                  <p className="text-stone-400 text-sm max-w-md mx-auto mb-6">
                    Click the heart icon on any recipe in your 7-day plan or custom recipe studio to save it here.
                  </p>
                  <button
                    onClick={() => setCurrentTab('planner')}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs inline-flex items-center space-x-2 transition-colors"
                  >
                    <span>Browse Meal Planner</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {favoriteRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => setActiveRecipeModal(recipe)}
                      className="bg-[#141724] border border-white/10 hover:border-orange-500/50 rounded-3xl p-5 cursor-pointer transition-all hover:shadow-xl group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                            {recipe.cuisine || recipe.mealType}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteRecipe(recipe);
                            }}
                            className="p-1.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                            title="Remove from favorites"
                          >
                            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                          </button>
                        </div>

                        <h3 className="font-display font-bold text-lg text-white group-hover:text-orange-400 transition-colors mb-2">
                          {recipe.title}
                        </h3>
                        <p className="text-stone-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>

                      <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs text-stone-400 font-sans-clean">
                        <div className="flex items-center space-x-1 text-stone-400">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes}m</span>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-400 font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{recipe.estimatedNutrition.calories} kcal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}

      {/* 1. Bistro Auth / Sign In Modal (Matching Image 1) */}
      <BistroSignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignInSuccess={() => setIsSignInOpen(false)}
        onOpenOnboarding={() => {
          setIsSignInOpen(false);
          setIsOnboardingOpen(true);
        }}
      />

      {/* 2. Bistro Onboarding Setup Steps 1, 2, 3 (Matching Images 2, 3, 4) */}
      <BistroOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      {/* 3. Recipe Detail Modal */}
      {activeRecipeModal && (
        <RecipeDetailModal
          recipe={activeRecipeModal}
          onClose={() => setActiveRecipeModal(null)}
        />
      )}

      {/* 4. Family Profile Edit Modal */}
      {isProfileModalOpen && (
        <FamilyProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )}

      {/* 5. Quick Shopping List Modal */}
      {isShoppingModalOpen && (
        <ShoppingListModal onClose={() => setIsShoppingModalOpen(false)} />
      )}

      {/* Toast Notification Container */}
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
