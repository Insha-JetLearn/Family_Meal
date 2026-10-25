# FamilyChef AI - Smart Family Meal Planner & Assistant

FamilyChef AI is a responsive, warm, full-stack family meal planning web application designed to help households manage their pantry inventory, generate balanced 7-day meal plans, customize recipes, converse with an AI sous-chef, and gamify daily nutrition and hydration habits.

---

## 🌟 Key Features

1. **AI Pantry Scanner & Inventory Management**
   - Drag-and-drop pantry/fridge photo upload and camera capture.
   - Multimodal Gemini AI vision identification of ingredients, categories, estimated quantities, freshness status (*Fresh*, *Use Soon*, *Check Freshness*), and shelf-life.
   - Comprehensive inventory manager: add, edit, sort by expiration, and filter by freshness.
   - Zero-waste optimization with one-click "Use These in Meal Plan".

2. **AI 7-Day Family Meal Planner**
   - Configurable family profile: members, age groups, strict food allergies, dietary restrictions, preferred cuisines, budget, and cooking time.
   - Gemini API generates a complete 7-day calendar with breakfast, lunch, dinner, and optional snacks.
   - Strictly enforces allergy exclusion rules with server-side validation.
   - Replace individual meals on the fly or mark them as completed.
   - Integrated **Smart Shopping List** that computes needed ingredients by comparing recipe requirements with existing pantry stock.

3. **AI Recipe Customizer**
   - Interactive recipe builder for main ingredients, available pantry items, and dietary tags.
   - Live scalable servings counter (1-16 people) with dynamic recalculation of ingredient quantities.
   - Step-by-step instructions, estimated nutritional breakdown, smart substitutions, and storage tips.
   - One-click "Add to Weekly Plan" and "Save to Favorites".

4. **Conversational Chef Remy AI Assistant**
   - Context-aware cooking buddy that remembers household profile, pantry items, and expiring ingredients.
   - Quick starter chips for instant meal ideas and ingredient substitutions.
   - Strict allergen safety filtering.

5. **Gamified Nutrition & Habit Tracker**
   - Daily meal logging (Breakfast, Lunch, Dinner, Snack) with automatic AI nutrition estimation.
   - Hydration tracker with one-tap +250ml and +500ml logging.
   - Interactive monthly calendar with tracking history.
   - XP leveling system, daily streaks, and 8 collectible achievement badges.
   - Confetti celebrations upon unlocking achievements.

6. **Local Persistence & Privacy**
   - Full persistence in browser LocalStorage.
   - Zero hardcoded API keys; server-side Gemini integration.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Google Gemini API key (from Google AI Studio)

### Environment Setup

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

### Installation

```bash
npm install
```

### Development Server

Runs both the Express backend and Vite middleware together on `http://localhost:3000`:

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## 🛡️ Allergen Safety & Inferred Dates Disclaimer

- **Strict Allergen Exclusions:** FamilyChef AI conducts server-side audits on all generated recipes. If an allergen is declared in the family profile, recipes will strictly omit it and suggest certified safe alternatives.
- **Visual Expiration Dates:** Visually estimated shelf life is AI-inferred guidance and should never replace manufacturer date codes or personal inspection of packaging seals.
