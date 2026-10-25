import React, { useState } from 'react';
import {
  ChefHat,
  LayoutDashboard,
  Package,
  CalendarDays,
  Sparkles,
  ShoppingBag,
  BarChart2,
  Heart,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Flame,
  User,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type BistroNavTab =
  | 'dashboard'
  | 'pantry'
  | 'planner'
  | 'assistant'
  | 'groceries'
  | 'analytics'
  | 'favorites';

interface BistroSidebarProps {
  currentTab: BistroNavTab;
  setCurrentTab: (tab: BistroNavTab) => void;
  openOnboarding: () => void;
  openSignIn: () => void;
}

export const BistroSidebar: React.FC<BistroSidebarProps> = ({
  currentTab,
  setCurrentTab,
  openOnboarding,
  openSignIn,
}) => {
  const { familyProfile, gamification, shoppingList } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const uncheckedShoppingCount = shoppingList.filter(i => !i.isChecked).length;

  const navItems: Array<{
    id: BistroNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pantry', label: 'PANTRY STOCK', icon: <Package className="w-4 h-4" /> },
    { id: 'planner', label: 'MEAL PLANNER', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI ASSISTANT', icon: <Sparkles className="w-4 h-4" /> },
    {
      id: 'groceries',
      label: 'GROCERY LIST',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: uncheckedShoppingCount > 0 ? uncheckedShoppingCount : undefined,
    },
    { id: 'analytics', label: 'ANALYTICS', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'favorites', label: 'SAVED FAVORITES', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 bg-[#0c0e15] border-r border-white/5 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/5">
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center space-x-3 cursor-pointer overflow-hidden"
        >
          {/* Logo container matching Image 5 */}
          <div className="w-10 h-10 rounded-2xl bg-[#1a1c29] border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-md shadow-orange-500/10 shrink-0">
            <ChefHat className="w-5 h-5 text-orange-400" />
          </div>

          {!collapsed && (
            <div className="animate-fadeIn">
              <div className="flex items-center space-x-1">
                <span className="font-display font-bold text-lg text-white tracking-tight">
                  BistroChef
                </span>
                <span className="font-display font-extrabold text-lg bg-gradient-to-r from-orange-400 to-emerald-400 bg-clip-text text-transparent">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 tracking-widest block uppercase -mt-0.5 font-sans-clean">
                COMPANION
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-stone-500 hover:text-white p-1 rounded-lg transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentTab === item.id;

          if (isActive) {
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl gradient-bistro-tab text-white font-extrabold text-xs tracking-wider shadow-lg shadow-orange-500/15 transition-all ${
                  collapsed ? 'justify-center px-2' : ''
                }`}
                title={item.label}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-white drop-shadow-xs">{item.icon}</span>
                  {!collapsed && <span className="font-sans-clean">{item.label}</span>}
                </div>
                {!collapsed && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-xs animate-pulse" />
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-stone-400 hover:text-stone-100 hover:bg-white/5 font-semibold text-xs tracking-wider transition-all ${
                collapsed ? 'justify-center px-2' : ''
              }`}
              title={item.label}
            >
              <div className="flex items-center space-x-3">
                <span className="text-stone-400">{item.icon}</span>
                {!collapsed && <span className="font-sans-clean">{item.label}</span>}
              </div>
              {!collapsed && item.badge !== undefined && (
                <span className="bg-orange-500/80 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile / Setup Trigger */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <button
          onClick={openOnboarding}
          className={`w-full flex items-center px-3.5 py-2.5 rounded-xl bg-[#161a27] hover:bg-[#1e2336] border border-white/5 text-stone-300 hover:text-white transition-all text-xs font-semibold ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
          title="Kitchen Onboarding Setup"
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
            {!collapsed && (
              <div className="text-left">
                <span className="block font-bold text-white text-xs truncate">
                  {familyProfile.familyName}
                </span>
                <span className="block text-[10px] text-stone-500 font-serif">
                  Onboarding & Setup
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <span className="bg-[#242b3d] text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Edit
            </span>
          )}
        </button>

        <button
          onClick={openSignIn}
          className={`w-full flex items-center px-3.5 py-2 rounded-xl text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-colors text-xs font-semibold ${
            collapsed ? 'justify-center' : 'justify-start space-x-2'
          }`}
          title="Sign In / Account"
        >
          <User className="w-4 h-4" />
          {!collapsed && <span>Switch Account / Sign In</span>}
        </button>
      </div>
    </aside>
  );
};
