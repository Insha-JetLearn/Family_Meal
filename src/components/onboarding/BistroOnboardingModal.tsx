import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  UserPlus,
  Trash2,
  Check,
  AlertTriangle,
  Heart,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FamilyMember } from '../../types';

interface BistroOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ALLERGY_OPTIONS = ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Sesame', 'Shellfish', 'Fish'];

const HEALTH_CONSIDERATIONS = [
  'Low sugar',
  'Low sodium',
  'High protein',
  'High fiber',
  'Keto friendly',
  'Heart healthy',
];

const CUISINE_OPTIONS = [
  'Italian (Tuscan)',
  'French (Bistro)',
  'Spanish (Tapas)',
  'Greek Mediterranean',
  'German Rustic',
  'Continental',
  'Swiss Alpine',
  'British Pub Style',
  'Scandinavian Modern',
];

const EQUIPMENT_OPTIONS = [
  'Hob',
  'Oven',
  'Air Fryer',
  'Microwave',
  'Dutch Oven / Cocotte',
  'Blender',
  'Toaster',
];

export const BistroOnboardingModal: React.FC<BistroOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { familyProfile, updateFamilyProfile, awardXp } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State
  const [kitchenTitle, setKitchenTitle] = useState(familyProfile.familyName || 'Rossi Family');
  const [memberCount, setMemberCount] = useState<number>(familyProfile.members.length || 3);

  // Step 2 State (Family Members)
  const [members, setMembers] = useState<FamilyMember[]>(familyProfile.members || []);
  const [memberName, setMemberName] = useState('');
  const [memberAge, setMemberAge] = useState('28');
  const [memberDiet, setMemberDiet] = useState('Vegetarian');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['Nuts', 'Dairy']);
  const [selectedConsiderations, setSelectedConsiderations] = useState<string[]>([
    'High protein',
    'Low sugar',
  ]);
  const [favoriteFoods, setFavoriteFoods] = useState('Pasta, Dosa, Mango');
  const [foodsToAvoid, setFoodsToAvoid] = useState('Mushroom, Spicy sauces');

  // Step 3 State (Household Preferences)
  const [budgetTier, setBudgetTier] = useState<'Economy' | 'Standard' | 'Premium'>(
    familyProfile.budgetTier || 'Standard'
  );
  const [prepTime, setPrepTime] = useState<'Under 15 mins' | 'Under 30 mins' | 'Under 1 hour'>(
    familyProfile.targetPrepTime || 'Under 30 mins'
  );
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    familyProfile.preferredCuisines.length > 0
      ? familyProfile.preferredCuisines
      : ['Italian (Tuscan)', 'French (Bistro)', 'Spanish (Tapas)']
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    familyProfile.kitchenEquipment && familyProfile.kitchenEquipment.length > 0
      ? familyProfile.kitchenEquipment
      : ['Hob', 'Oven', 'Air Fryer', 'Dutch Oven / Cocotte']
  );

  if (!isOpen) return null;

  // Toggle helpers
  const toggleAllergy = (item: string) => {
    setSelectedAllergies(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const toggleConsideration = (item: string) => {
    setSelectedConsiderations(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const toggleCuisine = (item: string) => {
    setSelectedCuisines(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    const ageNum = parseInt(memberAge) || 25;
    const ageGroup = ageNum <= 3 ? 'toddler' : ageNum <= 12 ? 'kid' : ageNum <= 18 ? 'teen' : 'adult';

    const newMember: FamilyMember = {
      id: `m-${Date.now()}`,
      name: memberName.trim(),
      age: ageNum,
      ageGroup,
      dietPreference: memberDiet,
      foodAllergies: [...selectedAllergies],
      dietaryConsiderations: [...selectedConsiderations],
      favoriteFoods: favoriteFoods.trim(),
      foodsToAvoid: foodsToAvoid.trim(),
      notes: `${memberDiet}; avoids ${foodsToAvoid}`,
    };

    setMembers(prev => [...prev, newMember]);
    setMemberName('');
    setFavoriteFoods('');
    setFoodsToAvoid('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // Finish Onboarding
  const handleComplete = () => {
    // Collect all aggregated allergies from members
    const allAggregatedAllergies = Array.from(
      new Set(members.flatMap(m => m.foodAllergies || []))
    );

    const updatedProfile = {
      ...familyProfile,
      familyName: kitchenTitle.trim() || 'Rossi Family',
      members: members.length > 0 ? members : familyProfile.members,
      servings: members.length || memberCount,
      allergies: allAggregatedAllergies.length > 0 ? allAggregatedAllergies : ['Nuts', 'Dairy'],
      preferredCuisines: selectedCuisines,
      budgetTier,
      targetPrepTime: prepTime,
      kitchenEquipment: selectedEquipment,
      maxCookingTimeMinutes: prepTime === 'Under 15 mins' ? 15 : prepTime === 'Under 30 mins' ? 30 : 60,
    };

    updateFamilyProfile(updatedProfile);
    awardXp(50, 'Completed Family Kitchen Onboarding');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#111420] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl text-left my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>ONBOARDING SETUP</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* 3 Step Pill Indicators */}
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === s
                      ? 'w-8 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                      : step > s
                      ? 'w-4 bg-emerald-500'
                      : 'w-4 bg-[#1e2336]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-3"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STEP 1: Let's set up your Family Kitchen */}
        {step === 1 && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                Let's set up your <span className="text-[#ff6b4a]">Family</span>{' '}
                <span className="text-[#4ade80]">Kitchen</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-2xl font-serif leading-relaxed">
                BistroChef AI plans meals based on the exact structure and preferences of your household. Give your kitchen profile a warm name!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-2">
                  FAMILY NAME OR KITCHEN TITLE
                </label>
                <input
                  type="text"
                  value={kitchenTitle}
                  onChange={e => setKitchenTitle(e.target.value)}
                  placeholder="e.g. Rossi Family"
                  className="w-full px-4 py-3 rounded-xl bg-[#171b29] border border-white/10 text-white text-sm focus:outline-hidden focus:border-cyan-400/50"
                />
                <p className="text-[11px] text-stone-500 mt-1.5 font-serif">
                  We'll customize your dashboard greeting with this name.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-2">
                  NUMBER OF MEMBERS
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, '5+'].map((num, idx) => {
                    const val = idx + 1;
                    const isSelected = memberCount === val || (num === '5+' && memberCount >= 5);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMemberCount(typeof num === 'number' ? num : 5)}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                          isSelected
                            ? 'bg-[#1e2538] border-cyan-400 text-white ring-1 ring-cyan-400/40 shadow-xs'
                            : 'bg-[#171b29] border-white/10 text-stone-400 hover:text-white hover:bg-[#1e2336]'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5 font-serif">
                  We will add detail cards for each member in the next step.
                </p>
              </div>
            </div>

            {/* Smart Nutritional Guidance Callout Box */}
            <div className="p-5 rounded-2xl bg-[#171b29]/80 border border-white/10 flex items-start space-x-4 mt-6">
              <div className="w-10 h-10 rounded-xl bg-[#23293d] text-cyan-400 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  SMART NUTRITIONAL GUIDANCE
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed font-serif">
                  Our advanced AI profiles balance calories, dietary fibers, and macronutrients across your family setup so kids get proper fiber and parents receive protein-rich optimizations.
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-stone-500 hover:text-stone-300 uppercase tracking-widest"
              >
                SKIP FOR NOW
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl gradient-bistro-btn text-white font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-orange-500/20"
              >
                <span>CONTINUE &gt;</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Add Family Members */}
        {step === 2 && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                Add <span className="text-[#4ade80]">Family Members</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-2xl font-serif leading-relaxed">
                Provide dietary specifications for each household member so our meal engine avoids allergy items and caters to individual health goals.
              </p>
            </div>

            {/* Added Members List */}
            {members.length === 0 ? (
              <div className="p-5 rounded-2xl border border-dashed border-white/10 text-center text-xs text-stone-500 font-serif">
                No members added yet. Add at least one family member below.
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Added Household Members ({members.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {members.map(m => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-[#171b29] border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{m.name}</span>
                          <span className="text-[11px] text-stone-400">({m.age || 25} yrs)</span>
                          <span className="bg-[#242b3d] text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {m.dietPreference || 'Standard'}
                          </span>
                        </div>
                        {m.foodAllergies && m.foodAllergies.length > 0 && (
                          <div className="text-[10px] text-rose-300 mt-1">
                            Allergies: {m.foodAllergies.join(', ')}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1 text-stone-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADD MEMBER FORM */}
            <form onSubmit={handleAddMember} className="p-5 rounded-2xl bg-[#171b29]/90 border border-white/10 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                <span>ADD MEMBER FORM</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    placeholder="e.g. Emily"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e2336] border border-white/10 text-white text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={memberAge}
                    onChange={e => setMemberAge(e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e2336] border border-white/10 text-white text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">Diet Preference</label>
                  <select
                    value={memberDiet}
                    onChange={e => setMemberDiet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e2336] border border-white/10 text-white text-xs focus:outline-hidden"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Omnivore">Omnivore / Any</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Pescatarian">Pescatarian</option>
                    <option value="Keto">Keto</option>
                    <option value="Kid-Friendly">Kid-Friendly</option>
                  </select>
                </div>
              </div>

              {/* Food Allergies Multi-select */}
              <div>
                <label className="block text-[11px] font-bold text-rose-400 mb-1.5 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Food Allergies</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGY_OPTIONS.map(allergy => {
                    const isSelected = selectedAllergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#1a2d3b] text-cyan-300 border border-cyan-400 shadow-2xs'
                            : 'bg-[#1e2336] text-stone-400 border border-white/5 hover:text-white'
                        }`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary & Health Considerations */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-400 mb-1.5 flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Dietary & Health-Related Considerations</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HEALTH_CONSIDERATIONS.map(item => {
                    const isSelected = selectedConsiderations.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleConsideration(item)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#1a2d3b] text-cyan-300 border border-cyan-400 shadow-2xs'
                            : 'bg-[#1e2336] text-stone-400 border border-white/5 hover:text-white'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorites & Dislikes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Favorite Foods (comma separated)
                  </label>
                  <input
                    type="text"
                    value={favoriteFoods}
                    onChange={e => setFavoriteFoods(e.target.value)}
                    placeholder="e.g. Pasta, Dosa, Mango"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e2336] border border-white/10 text-white text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Foods to Avoid
                  </label>
                  <input
                    type="text"
                    value={foodsToAvoid}
                    onChange={e => setFoodsToAvoid(e.target.value)}
                    placeholder="e.g. Mushroom, Spicy sauces"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e2336] border border-white/10 text-white text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!memberName.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Save and Add Member</span>
              </button>
            </form>

            {/* Navigation */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-stone-400 hover:text-white uppercase tracking-wider flex items-center space-x-1"
              >
                <span>&lt; PREVIOUS</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl gradient-bistro-btn text-white font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-orange-500/20"
              >
                <span>CONTINUE &gt;</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Household Preferences */}
        {step === 3 && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                Household <span className="text-[#4ade80]">Preferences</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-2xl font-serif leading-relaxed">
                Configure your general pantry budget constraints, preferred cooking duration, kitchen gear, and family cuisines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Budget Level */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  $ Meal Plan Budget Level
                </label>
                <div className="flex items-center space-x-2">
                  {(['Economy', 'Standard', 'Premium'] as const).map(b => {
                    const isSelected = budgetTier === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudgetTier(b)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-[#171b29] border-white/10 text-stone-300 hover:bg-[#1e2336]'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cooking Duration */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  ⏱ Target Prep/Cooking Time
                </label>
                <div className="flex items-center space-x-2">
                  {(['Under 15 mins', 'Under 30 mins', 'Under 1 hour'] as const).map(t => {
                    const isSelected = prepTime === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPrepTime(t)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-[#171b29] border-white/10 text-stone-300 hover:bg-[#1e2336]'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Preferred Family Cuisines */}
            <div>
              <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
                🍴 Preferred Family Cuisines
              </label>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map(c => {
                  const isSelected = selectedCuisines.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCuisine(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                          : 'bg-[#171b29] border-white/10 text-stone-400 hover:text-white hover:bg-[#1e2336]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Kitchen Equipment */}
            <div>
              <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2">
                🍳 Available Kitchen Equipment
              </label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map(eq => {
                  const isSelected = selectedEquipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 border ${
                        isSelected
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                          : 'bg-[#171b29] border-white/10 text-stone-400 hover:text-white hover:bg-[#1e2336]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-stone-500'}`} />
                      <span>{eq}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-stone-400 hover:text-white uppercase tracking-wider flex items-center space-x-1"
              >
                <span>&lt; PREVIOUS</span>
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="px-6 py-3 rounded-xl gradient-bistro-btn text-white font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-orange-500/20"
              >
                <span>COMPLETE PROFILE &gt;</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
