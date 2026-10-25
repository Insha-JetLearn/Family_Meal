import React, { useRef, useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  Check,
  Plus,
  Trash2,
  Edit2,
  Search,
  UtensilsCrossed,
  X,
  RefreshCw,
  Info,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FreshnessStatus, PantryItem } from '../../types';
import { BistroNavTab } from '../common/BistroSidebar';

interface PantryScannerPageProps {
  navigateTo: (tab: BistroNavTab) => void;
}

const CATEGORIES = [
  'All',
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Grains & Pasta',
  'Canned & Jarred',
  'Baking & Spices',
  'Condiments & Sauces',
  'Snacks & Beverages',
  'Other',
];

export const PantryScannerPage: React.FC<PantryScannerPageProps> = ({ navigateTo }) => {
  const {
    pantryItems,
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    markItemUsed,
    addScannedPantryItems,
    familyProfile,
  } = useApp();

  // Scanner state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFreshness, setSelectedFreshness] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'category'>('expiry');

  // Manual Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Produce');
  const [formQuantity, setFormQuantity] = useState('');
  const [formFreshness, setFormFreshness] = useState<FreshnessStatus>('Fresh');
  const [formDaysExpiry, setFormDaysExpiry] = useState<string>('7');
  const [formNotes, setFormNotes] = useState('');

  // Handle image upload from file or drop
  const processFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScanError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setScanError('Image file is too large (max 20MB).');
      return;
    }

    setScanError(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = e => {
      setSelectedImage(e.target?.result as string);
      setDetectedItems([]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Perform AI Scan
  const handleScanPantry = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const response = await fetch('/api/pantry/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
          declaredAllergies: familyProfile.allergies,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan image.');
      }

      if (!data.items || data.items.length === 0) {
        setScanError('No food items were detected with certainty. Try another angle or closer shot.');
      } else {
        setDetectedItems(data.items);
      }
    } catch (err: any) {
      setScanError(err.message || 'Error communicating with AI vision analyzer.');
    } finally {
      setIsScanning(false);
    }
  };

  // Add all detected items to pantry
  const handleAddAllDetected = () => {
    if (detectedItems.length === 0) return;

    const formatted = detectedItems.map(item => ({
      name: item.name,
      category: item.category || 'Other',
      quantity: item.estimatedQuantity || '1 pack',
      freshnessStatus: (item.freshnessStatus as FreshnessStatus) || 'Fresh',
      confidenceScore: item.confidenceScore || 90,
      estimatedDaysUntilExpiry: item.estimatedDaysUntilExpiry || null,
      expirationDate: item.estimatedDaysUntilExpiry
        ? new Date(Date.now() + item.estimatedDaysUntilExpiry * 86400000).toISOString().split('T')[0]
        : undefined,
      notes: item.notes || 'Identified via AI Pantry Scanner',
      allergenAlert: item.allergenAlert,
    }));

    addScannedPantryItems(formatted);
    setDetectedItems([]);
    setSelectedImage(null);
  };

  // Open manual add or edit modal
  const openAddModal = () => {
    setEditingItemId(null);
    setFormName('');
    setFormCategory('Produce');
    setFormQuantity('1 pack');
    setFormFreshness('Fresh');
    setFormDaysExpiry('7');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormFreshness(item.freshnessStatus);
    setFormDaysExpiry(item.estimatedDaysUntilExpiry ? String(item.estimatedDaysUntilExpiry) : '7');
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const days = parseInt(formDaysExpiry) || null;
    const computedExpiryDate = days
      ? new Date(Date.now() + days * 86400000).toISOString().split('T')[0]
      : undefined;

    if (editingItemId) {
      updatePantryItem(editingItemId, {
        name: formName.trim(),
        category: formCategory,
        quantity: formQuantity.trim(),
        freshnessStatus: formFreshness,
        estimatedDaysUntilExpiry: days,
        expirationDate: computedExpiryDate,
        notes: formNotes.trim(),
      });
    } else {
      addPantryItem({
        name: formName.trim(),
        category: formCategory,
        quantity: formQuantity.trim(),
        freshnessStatus: formFreshness,
        estimatedDaysUntilExpiry: days,
        expirationDate: computedExpiryDate,
        notes: formNotes.trim(),
        confidenceScore: 100,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered & Sorted pantry items
  const filteredItems = pantryItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesFreshness = selectedFreshness === 'All' || item.freshnessStatus === selectedFreshness;
    return matchesSearch && matchesCategory && matchesFreshness;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'expiry') {
      const aExp = a.estimatedDaysUntilExpiry ?? 9999;
      const bExp = b.estimatedDaysUntilExpiry ?? 9999;
      return aExp - bExp;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return a.category.localeCompare(b.category);
  });

  const expiringCount = pantryItems.filter(
    i => !i.isUsed && (i.freshnessStatus === 'Use Soon' || (i.estimatedDaysUntilExpiry && i.estimatedDaysUntilExpiry <= 3))
  ).length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Pantry Stock & Vision Scanner
            </h1>
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 text-xs font-bold px-2.5 py-0.5 rounded-full font-sans-clean">
              AI Vision
            </span>
          </div>
          <p className="text-stone-400 text-xs sm:text-sm mt-1 font-serif">
            Photograph your fridge, pantry shelves, or groceries to catalog ingredients and prevent food waste.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigateTo('planner')}
            className="flex items-center space-x-2 px-4 py-2.5 gradient-bistro-btn text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md shadow-orange-500/20"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Use in Meal Plan</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#1b2030] hover:bg-[#23293e] border border-white/10 text-stone-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item Manually</span>
          </button>
        </div>
      </div>

      {/* AI Image Upload / Scan Box */}
      <div className="bg-[#141724] rounded-3xl border border-white/5 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-base font-bold text-white flex items-center space-x-2 font-display">
            <Camera className="w-5 h-5 text-orange-400" />
            <span>Photograph Pantry or Refrigerator</span>
          </h2>
          <span className="text-xs text-stone-500 font-serif">Supports drag-and-drop, camera, & files</span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Upload Dropzone */}
        {!selectedImage ? (
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
              isDragOver
                ? 'border-orange-500 bg-orange-500/5'
                : 'border-white/10 hover:border-orange-400/50 bg-[#161a28]/60'
            }`}
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#202538] text-orange-400 flex items-center justify-center mx-auto shadow-md">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base font-display">
                  Drag and drop a photo of your food, shelf, or fridge
                </h3>
                <p className="text-stone-400 text-xs mt-1 font-serif leading-relaxed">
                  Our multimodal Gemini vision model automatically recognizes fresh produce, cans, cartons, and spices.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 gradient-bistro-btn text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2 shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Image File</span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2.5 bg-[#1e2336] hover:bg-[#252c42] text-stone-200 rounded-xl text-xs font-bold flex items-center space-x-2 border border-white/10 transition-colors"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Use Device Camera</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Image Preview and Scan Action */
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden max-h-80 bg-black flex items-center justify-center border border-white/10">
              <img
                src={selectedImage}
                alt="Pantry Preview"
                className="max-h-80 w-auto object-contain"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setDetectedItems([]);
                  setScanError(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                title="Change image"
              >
                <X className="w-5 h-5" />
              </button>

              {isScanning && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
                  <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
                  <p className="text-sm font-bold text-orange-300">
                    Scanning ingredients with AI vision...
                  </p>
                  <p className="text-xs text-stone-400 font-serif">
                    Estimating freshness, quantities, and categories
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-stone-400 font-serif">
                Photo selected. Ready to extract ingredient items.
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  disabled={isScanning}
                  className="px-3.5 py-2 text-stone-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Clear Photo
                </button>
                <button
                  type="button"
                  onClick={handleScanPantry}
                  disabled={isScanning}
                  className="flex items-center space-x-2 px-5 py-2.5 gradient-bistro-btn text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Scan Pantry with AI</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {scanError && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-start space-x-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Scan Notice:</p>
              <p>{scanError}</p>
            </div>
          </div>
        )}

        {/* Detected Items Results */}
        {detectedItems.length > 0 && (
          <div className="p-5 rounded-3xl bg-[#181d2e] border border-cyan-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 font-display">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>AI Detected {detectedItems.length} Ingredients</span>
                </h3>
                <p className="text-xs text-stone-400 font-serif">
                  Review the detected items below and click "Add All to Pantry".
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddAllDetected}
                className="px-4 py-2 gradient-bistro-btn text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Add All to Pantry (+50 XP)</span>
              </button>
            </div>

            <div className="bg-[#121522] p-3 rounded-2xl border border-white/5 text-[11px] text-stone-400 flex items-start space-x-2 font-serif">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note on Shelf Life:</strong> Expiration dates and freshness are AI estimates based on visual appearance and standard food storage guidelines. They are not guaranteed manufacturer dates. Always check packaging seals before consuming.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {detectedItems.map((item, idx) => (
                <div key={idx} className="bg-[#141724] p-3.5 rounded-2xl border border-white/10 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{item.category}</span>
                    <span className="bg-cyan-950 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-800/40">
                      {item.confidenceScore}% Match
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-xs text-stone-400">Qty: <strong>{item.estimatedQuantity}</strong></p>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded-md ${
                        item.freshnessStatus === 'Use Soon'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                      }`}
                    >
                      {item.freshnessStatus}
                    </span>
                    {item.estimatedDaysUntilExpiry && (
                      <span className="text-stone-400">~{item.estimatedDaysUntilExpiry}d left</span>
                    )}
                  </div>
                  {item.allergenAlert && (
                    <p className="text-[10px] text-rose-300 bg-rose-950/60 p-1 rounded-md font-semibold mt-1">
                      ⚠️ {item.allergenAlert}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pantry Inventory List */}
      <div className="bg-[#141724] rounded-3xl border border-white/5 p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2 font-display">
              <span>Pantry Stock & Shelf Storage</span>
              <span className="bg-[#202538] text-stone-300 text-xs font-bold px-2.5 py-0.5 rounded-full font-sans-clean">
                {pantryItems.length} items
              </span>
            </h2>
            <p className="text-xs text-stone-400 font-serif mt-0.5">
              {expiringCount > 0 ? (
                <span className="text-amber-400 font-bold">
                  ⚠️ {expiringCount} item(s) marked 'Use Soon' — prioritize in your next recipe!
                </span>
              ) : (
                'All items look fresh and well stocked.'
              )}
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search ingredients..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Filter & Sort Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-stone-500 font-bold mr-1">Category:</span>
            {CATEGORIES.slice(0, 6).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-stone-950 font-bold shadow-xs'
                    : 'bg-[#1b2030] text-stone-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedFreshness}
              onChange={e => setSelectedFreshness(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#1b2030] border border-white/10 text-xs text-white focus:outline-hidden"
            >
              <option value="All">All Freshness</option>
              <option value="Use Soon">Use Soon (Urgent)</option>
              <option value="Fresh">Fresh</option>
              <option value="Check Freshness">Check Freshness</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-[#1b2030] border border-white/10 text-xs text-white focus:outline-hidden"
            >
              <option value="expiry">Sort by Expiry</option>
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>

        {/* Items Cards */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-12 text-stone-500 font-serif">
            <UtensilsCrossed className="w-12 h-12 text-stone-600 mx-auto mb-2" />
            <p className="font-bold text-stone-300">No pantry items match the filter</p>
            <p className="text-xs mt-1">Try clearing filters or scan an ingredient photo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {sortedItems.map(item => {
              const isUrgent =
                !item.isUsed &&
                (item.freshnessStatus === 'Use Soon' ||
                  (item.estimatedDaysUntilExpiry && item.estimatedDaysUntilExpiry <= 3));

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    item.isUsed
                      ? 'bg-[#161a28]/40 border-white/5 opacity-50'
                      : isUrgent
                      ? 'bg-[#1e1c28] border-amber-500/40 shadow-xs ring-1 ring-amber-500/30'
                      : 'bg-[#181c2a] border-white/5 hover:border-white/10 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans-clean">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.freshnessStatus === 'Use Soon'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                        }`}
                      >
                        {item.freshnessStatus}
                      </span>
                    </div>

                    <div>
                      <h4
                        className={`font-bold text-sm ${
                          item.isUsed ? 'line-through text-stone-500' : 'text-white'
                        }`}
                      >
                        {item.name}
                      </h4>
                      <p className="text-xs text-stone-400">{item.quantity}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      {item.estimatedDaysUntilExpiry !== undefined && item.estimatedDaysUntilExpiry !== null ? (
                        <span
                          className={`font-semibold ${
                            item.estimatedDaysUntilExpiry <= 2
                              ? 'text-rose-400 font-bold'
                              : item.estimatedDaysUntilExpiry <= 5
                              ? 'text-amber-300'
                              : 'text-stone-300'
                          }`}
                        >
                          {item.estimatedDaysUntilExpiry <= 0
                            ? 'Expires today'
                            : `Expires in ~${item.estimatedDaysUntilExpiry} days`}
                        </span>
                      ) : (
                        <span className="text-stone-500 text-[11px]">Shelf life unknown</span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-stone-400 italic bg-[#121522] p-2 rounded-lg font-serif">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => markItemUsed(item.id)}
                      className={`text-xs font-bold flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
                        item.isUsed
                          ? 'bg-[#202538] text-stone-400'
                          : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/40'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{item.isUsed ? 'Mark Unused' : 'Mark as Used'}</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-stone-400 hover:text-white transition-colors"
                        title="Edit item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePantryItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#141724] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-white">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-base font-display">
                {editingItemId ? 'Edit Pantry Item' : 'Add Item to Pantry'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs text-stone-300">
              <div>
                <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Organic Baby Spinach"
                  className="w-full px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    required
                    value={formQuantity}
                    onChange={e => setFormQuantity(e.target.value)}
                    placeholder="e.g. 1 bag (5 oz)"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Freshness
                  </label>
                  <select
                    value={formFreshness}
                    onChange={e => setFormFreshness(e.target.value as FreshnessStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
                  >
                    <option value="Fresh">Fresh</option>
                    <option value="Use Soon">Use Soon (Urgent)</option>
                    <option value="Check Freshness">Check Freshness</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Est. Days to Expiry
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={formDaysExpiry}
                    onChange={e => setFormDaysExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Crisper drawer in fridge"
                  className="w-full px-3 py-2 rounded-xl bg-[#1b2030] border border-white/10 text-white text-xs focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-bistro-btn text-white font-bold"
                >
                  {editingItemId ? 'Update Item' : 'Add to Pantry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
