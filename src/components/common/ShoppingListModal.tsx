import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Check,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShoppingListModalProps {
  onClose: () => void;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ onClose }) => {
  const {
    shoppingList,
    toggleShoppingItem,
    addShoppingItem,
    removeShoppingItem,
    clearCheckedShoppingItems,
    generateShoppingListFromPlan,
  } = useApp();

  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState('');
  const [customCategory, setCustomCategory] = useState('Produce');

  const categories = [
    'Fruits & Vegetables',
    'Dairy & Alternatives',
    'Protein',
    'Grains & Bakery',
    'Pantry Staples',
    'Spices & Seasonings',
    'Other Items',
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addShoppingItem({
      name: customName.trim(),
      category: customCategory,
      neededQuantity: customQty.trim() || '1 pack',
    });
    setCustomName('');
    setCustomQty('');
  };

  const totalItems = shoppingList.length;
  const checkedItems = shoppingList.filter(i => i.isChecked).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141724] border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="gradient-bistro text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 font-display">
                <h2 className="text-xl font-bold tracking-tight">Smart Grocery Shopping List</h2>
                <span className="bg-black/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-sans-clean">
                  Pantry-Aware
                </span>
              </div>
              <p className="text-white/80 text-xs font-serif">Calculates needed items vs existing pantry stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Quick Actions Bar */}
        <div className="bg-[#10131d] border-b border-white/5 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs font-sans-clean">
          <div className="flex items-center space-x-3 flex-1 min-w-[200px]">
            <div className="flex-1 bg-[#1e2336] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-bold text-stone-300 whitespace-nowrap">
              {checkedItems}/{totalItems} ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={generateShoppingListFromPlan}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1b2030] border border-white/10 text-stone-200 hover:text-white font-semibold transition-colors"
              title="Sync with current 7-day meal plan"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sync with Meal Plan</span>
            </button>
            {checkedItems > 0 && (
              <button
                onClick={clearCheckedShoppingItems}
                className="px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 font-semibold transition-colors"
              >
                Clear Checked
              </button>
            )}
          </div>
        </div>

        {/* Add custom item form */}
        <form onSubmit={handleAdd} className="p-4 px-6 border-b border-white/5 bg-[#141724]">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 font-sans-clean">
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="Add item (e.g. San Marzano tomatoes)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-hidden"
            />
            <input
              type="text"
              value={customQty}
              onChange={e => setCustomQty(e.target.value)}
              placeholder="Qty (e.g. 2 cans)"
              className="w-28 px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-hidden"
            />
            <select
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-xs text-white focus:outline-hidden"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl gradient-bistro-btn text-white text-xs font-bold flex items-center space-x-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Grouped Shopping List Content */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {totalItems === 0 ? (
            <div className="text-center py-12 text-stone-500 font-serif">
              <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto mb-2" />
              <p className="font-bold text-stone-300">Your shopping list is clear!</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Click "Sync with Meal Plan" to automatically compute ingredients needed for this week's recipes.
              </p>
            </div>
          ) : (
            categories.map(category => {
              const catItems = shoppingList.filter(
                i => i.category.toLowerCase() === category.toLowerCase() || (category === 'Other Items' && !categories.slice(0, 6).some(c => c.toLowerCase() === i.category.toLowerCase()))
              );

              if (catItems.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 flex items-center justify-between font-sans-clean">
                    <span>{category}</span>
                    <span className="text-[10px] text-stone-500 font-semibold">{catItems.length} items</span>
                  </h3>

                  <div className="space-y-1.5 font-sans-clean">
                    {catItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          item.isChecked
                            ? 'bg-[#121522]/50 border-white/5 opacity-50'
                            : 'bg-[#181c2a] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div
                          onClick={() => toggleShoppingItem(item.id)}
                          className="flex items-center space-x-3 cursor-pointer flex-1"
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              item.isChecked
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-white/20 bg-[#1b2030]'
                            }`}
                          >
                            {item.isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span
                              className={`text-xs font-bold ${
                                item.isChecked ? 'line-through text-stone-500' : 'text-white'
                              }`}
                            >
                              {item.name}
                            </span>
                            <div className="flex items-center space-x-2 text-[11px] text-stone-400">
                              <span>Need: {item.neededQuantity}</span>
                              {item.pantryQuantity && (
                                <span className="text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded font-semibold text-[10px] border border-cyan-800/40">
                                  {item.pantryQuantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeShoppingItem(item.id)}
                          className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#10131d] border-t border-white/5 p-4 px-6 flex items-center justify-between text-xs text-stone-400 font-sans-clean">
          <span>Items already in pantry are auto-marked.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl gradient-bistro-btn text-white font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
