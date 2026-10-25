import React, { useState } from 'react';
import {
  X,
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  Save,
  Check,
} from 'lucide-react';
import { AgeGroup, BudgetLevel, FamilyMember, FamilyProfile } from '../../types';
import { useApp } from '../../context/AppContext';

interface FamilyProfileModalProps {
  onClose: () => void;
}

const COMMON_ALLERGIES = [
  'Nuts',
  'Dairy',
  'Gluten',
  'Soy',
  'Eggs',
  'Sesame',
  'Shellfish',
  'Fish',
];

const COMMON_DIETARY_RESTRICTIONS = [
  'Vegetarian Friendly',
  'Vegan',
  'Pescatarian',
  'Gluten-Free',
  'Dairy-Free Options',
  'Low-FODMAP',
  'Keto / Low-Carb',
];

const COMMON_CUISINES = [
  'Italian (Tuscan)',
  'French (Bistro)',
  'Spanish (Tapas)',
  'Greek Mediterranean',
  'German Rustic',
  'Continental',
  'Swiss Alpine',
  'British Pub Style',
];

export const FamilyProfileModal: React.FC<FamilyProfileModalProps> = ({ onClose }) => {
  const { familyProfile, updateFamilyProfile, resetAllData } = useApp();
  const [profile, setProfile] = useState<FamilyProfile>({ ...familyProfile });
  const [customAllergy, setCustomAllergy] = useState('');
  const [customDislike, setCustomDislike] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Members management
  const handleAddMember = () => {
    const newMember: FamilyMember = {
      id: `m-${Date.now()}`,
      name: '',
      ageGroup: 'adult',
      age: 25,
      dietPreference: 'Vegetarian',
      notes: '',
    };
    setProfile(prev => ({ ...prev, members: [...prev.members, newMember] }));
  };

  const handleUpdateMember = (idx: number, updates: Partial<FamilyMember>) => {
    setProfile(prev => {
      const updated = [...prev.members];
      updated[idx] = { ...updated[idx], ...updates };
      return { ...prev, members: updated };
    });
  };

  const handleRemoveMember = (idx: number) => {
    if (profile.members.length <= 1) return;
    setProfile(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx),
    }));
  };

  const toggleArrayItem = (key: 'allergies' | 'dietaryRestrictions' | 'preferredCuisines', item: string) => {
    setProfile(prev => {
      const current = prev[key] || [];
      const exists = current.includes(item);
      const updated = exists ? current.filter(x => x !== item) : [...current, item];
      return { ...prev, [key]: updated };
    });
  };

  const addCustomAllergy = () => {
    if (!customAllergy.trim()) return;
    const item = customAllergy.trim();
    if (!profile.allergies.includes(item)) {
      setProfile(prev => ({ ...prev, allergies: [...prev.allergies, item] }));
    }
    setCustomAllergy('');
  };

  const addCustomDislike = () => {
    if (!customDislike.trim()) return;
    const item = customDislike.trim();
    if (!profile.dislikedIngredients.includes(item)) {
      setProfile(prev => ({ ...prev, dislikedIngredients: [...prev.dislikedIngredients, item] }));
    }
    setCustomDislike('');
  };

  const removeDislike = (item: string) => {
    setProfile(prev => ({
      ...prev,
      dislikedIngredients: prev.dislikedIngredients.filter(x => x !== item),
    }));
  };

  const removeAllergy = (item: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter(x => x !== item),
    }));
  };

  const handleSave = () => {
    updateFamilyProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141724] border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="bg-[#10131d] border-b border-white/5 p-5 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1b2030] text-cyan-400 flex items-center justify-center border border-white/5">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-display">Kitchen Profile & Dietary Setup</h2>
              <p className="text-stone-400 text-xs font-serif">Customizes meal plans, recipes, and allergen safety rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-stone-300 text-xs font-sans-clean">
          {/* Family Name & Servings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Kitchen / Household Title
              </label>
              <input
                type="text"
                value={profile.familyName}
                onChange={e => setProfile({ ...profile, familyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b2030] border border-white/10 text-white font-semibold text-xs focus:outline-hidden"
                placeholder="e.g. Rossi Family"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Default Servings per Meal
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={profile.servings}
                onChange={e => setProfile({ ...profile, servings: parseInt(e.target.value) || 3 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b2030] border border-white/10 text-white font-semibold text-xs focus:outline-hidden"
              />
            </div>
          </div>

          {/* Household Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider">
                Household Members ({profile.members.length})
              </label>
              <button
                type="button"
                onClick={handleAddMember}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {profile.members.map((member, idx) => (
                <div key={member.id || idx} className="flex items-center space-x-2 bg-[#1b2030] p-2.5 rounded-xl border border-white/5">
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => handleUpdateMember(idx, { name: e.target.value })}
                    placeholder="Name"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#252c40] border border-white/10 text-xs font-semibold text-white focus:outline-hidden"
                  />
                  <select
                    value={member.ageGroup}
                    onChange={e => handleUpdateMember(idx, { ageGroup: e.target.value as AgeGroup })}
                    className="px-2.5 py-1.5 rounded-lg bg-[#252c40] border border-white/10 text-xs text-white focus:outline-hidden"
                  >
                    <option value="toddler">Toddler</option>
                    <option value="kid">Kid</option>
                    <option value="teen">Teen</option>
                    <option value="adult">Adult</option>
                    <option value="senior">Senior</option>
                  </select>
                  <input
                    type="text"
                    value={member.dietPreference || member.notes || ''}
                    onChange={e => handleUpdateMember(idx, { dietPreference: e.target.value })}
                    placeholder="Diet notes"
                    className="hidden sm:block flex-1 px-3 py-1.5 rounded-lg bg-[#252c40] border border-white/10 text-xs text-white focus:outline-hidden"
                  />
                  {profile.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="p-1.5 text-stone-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Strict Food Allergies */}
          <div className="bg-rose-950/30 border border-rose-800/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Strict Food Allergies (Zero-Tolerance Exclusions)</span>
            </div>
            <p className="text-xs text-stone-400 font-serif">
              The AI recipe generator and meal planner will strictly omit these ingredients.
            </p>

            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGIES.map(allergy => {
                const isSelected = profile.allergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleArrayItem('allergies', allergy)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-[#1b2030] text-stone-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    {allergy}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={customAllergy}
                onChange={e => setCustomAllergy(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
                placeholder="Add other allergen (e.g. Strawberries, Mustard)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
              />
              <button
                type="button"
                onClick={addCustomAllergy}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Dietary Restrictions & Lifestyles
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_DIETARY_RESTRICTIONS.map(diet => {
                const isSelected = profile.dietaryRestrictions.includes(diet);
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleArrayItem('dietaryRestrictions', diet)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#1b2030] text-stone-400 hover:text-white'
                    }`}
                  >
                    {diet}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Cuisines */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Preferred Cuisines
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_CUISINES.map(cuisine => {
                const isSelected = profile.preferredCuisines.includes(cuisine);
                return (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => toggleArrayItem('preferredCuisines', cuisine)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-[#1b2030] text-stone-400 hover:text-white'
                    }`}
                  >
                    {cuisine}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disliked Ingredients */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Disliked Ingredients
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={customDislike}
                onChange={e => setCustomDislike(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomDislike())}
                placeholder="e.g. Mushroom, Spicy sauces"
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
              />
              <button
                type="button"
                onClick={addCustomDislike}
                className="px-3.5 py-1.5 bg-[#252c40] hover:bg-[#303850] text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.dislikedIngredients.map(item => (
                <span
                  key={item}
                  className="bg-[#1b2030] text-stone-300 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 border border-white/5"
                >
                  <span>{item}</span>
                  <button type="button" onClick={() => removeDislike(item)}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-white/5">
            {confirmReset ? (
              <div className="bg-rose-950/50 border border-rose-800/40 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-rose-300 font-medium">
                  Reset all data to default demo state?
                </span>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      resetAllData();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 bg-[#1b2030] text-stone-300 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-stone-500 font-serif">
                <span>Data stored locally in current browser.</span>
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="text-stone-400 hover:text-rose-400 underline font-medium"
                >
                  Reset Demo Data
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#10131d] border-t border-white/5 p-4 px-6 flex items-center justify-end space-x-3 font-sans-clean">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className="px-5 py-2.5 rounded-xl gradient-bistro-btn text-white font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-orange-500/20"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
