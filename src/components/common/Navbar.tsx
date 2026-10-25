import React, { useState } from 'react';
import {
  Utensils,
  Camera,
  CalendarDays,
  ChefHat,
  MessageSquareText,
  Activity,
  Users,
  Flame,
  Award,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type NavTab = 'dashboard' | 'pantry' | 'planner' | 'recipes' | 'assistant' | 'tracker';

interface NavbarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  openProfileModal: () => void;
  openShoppingModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openProfileModal,
  openShoppingModal,
}) => {
  const { familyProfile, gamification, shoppingList } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const uncheckedShoppingCount = shoppingList.filter(i => !i.isChecked).length;

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <Utensils className="w-5 h-5" /> },
    { id: 'pantry', label: 'Pantry Scanner', icon: <Camera className="w-5 h-5" /> },
    { id: 'planner', label: 'Meal Planner', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'recipes', label: 'AI Recipes', icon: <ChefHat className="w-5 h-5" /> },
    { id: 'assistant', label: 'Chef Remy', icon: <MessageSquareText className="w-5 h-5" /> },
    { id: 'tracker', label: 'Habit Tracker', icon: <Activity className="w-5 h-5" /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const xpInCurrentLevel = gamification.xp % 200;
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 200) * 100));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabClick('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-stone-900">FamilyChef</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">Smart Nourishment for Families</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-600' : 'text-stone-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Badges: Shopping, Streak, XP, Profile */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Shopping List Button */}
            <button
              onClick={openShoppingModal}
              title="View Smart Shopping List"
              className="relative p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-stone-200 hover:border-emerald-200"
            >
              <ShoppingBag className="w-5 h-5" />
              {uncheckedShoppingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {uncheckedShoppingCount}
                </span>
              )}
            </button>

            {/* Streak Counter */}
            <div
              className="flex items-center space-x-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-lg text-amber-800 text-xs font-bold"
              title={`${gamification.streak} Day Healthy Tracking Streak!`}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{gamification.streak} d</span>
            </div>

            {/* Gamification Level & XP pill */}
            <div
              onClick={() => handleTabClick('tracker')}
              className="cursor-pointer flex items-center space-x-2 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 transition-colors"
              title={`Level ${gamification.level} (${gamification.xp} Total XP). Click to view achievements!`}
            >
              <div className="flex items-center space-x-1 text-emerald-700">
                <Award className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Lvl {gamification.level}</span>
              </div>
              <div className="w-12 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Family Profile Button */}
            <button
              onClick={openProfileModal}
              className="flex items-center space-x-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-800 transition-colors"
            >
              <Users className="w-4 h-4 text-stone-500" />
              <span className="max-w-[110px] truncate">{familyProfile.familyName}</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                {familyProfile.members.length}
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={openShoppingModal}
              className="relative p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              {uncheckedShoppingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {uncheckedShoppingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200 bg-white px-4 pt-2 pb-4 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
            <button
              onClick={() => {
                openProfileModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-sm font-semibold text-stone-800"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{familyProfile.familyName} ({familyProfile.members.length} members)</span>
            </button>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{gamification.streak} Day Streak</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-stone-500'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
            <span>Level {gamification.level} Cook ({gamification.xp} XP)</span>
            <span className="flex items-center text-emerald-600 font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Zero-Waste Active
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
