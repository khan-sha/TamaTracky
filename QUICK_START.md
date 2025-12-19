# Quick Start Guide

**How to run Tama Tracky and demo it in 3-5 minutes**

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

## Demo Path (3-5 Minutes)

### Step 1: Start Demo Mode (30 seconds)
1. Open the app
2. Click **"DEMO MODE"** button on the home page
3. Wait for demo data to load (creates realistic 30-day scenario)

### Step 2: Explore Dashboard (30 seconds)
- Navigate to **Dashboard** (Game Hub)
- Show pet stats (Hunger, Happiness, Health, Energy, Cleanliness)
- Show pet mood and evolution stage
- Point out the Pet HUD (always visible at top)

### Step 3: Show Tasks & Earning (1 minute)
- Navigate to **Care & Tasks**
- Show Daily Quests (coins + XP rewards)
- Show earning tasks with cooldowns
- Explain: "Players earn coins through tasks to afford pet care"

### Step 4: Demonstrate Store & Expense Tracking (1 minute)
- Navigate to **Pet Store**
- Purchase an item (e.g., Premium Food)
- Explain: "All purchases automatically log expenses for financial tracking"
- Show inventory after purchase

### Step 5: Show Reports & Analytics (1 minute)
- Navigate to **Money Reports**
- Click **"🎯 JUDGE MODE"** button
- Show comprehensive financial summary:
  - Total income vs expenses
  - Category breakdown (Food, Toys, Health, etc.)
  - Charts (bar chart, line chart)
  - CSV export option
- Explain: "This teaches financial responsibility through cost-of-care tracking"

### Step 6: Show Help & FAQ Assistant (30 seconds)
- Navigate to **Help & FAQ**
- Ask: "Why is my pet sad?"
- Show intelligent offline response (intent-matching system)
- Explain: "Offline FAQ Assistant provides instant answers using intent matching"

### Step 7: Show Achievements (30 seconds)
- Navigate to **Achievements**
- Show badge gallery with earned/unearned states
- Explain: "Achievement system encourages good care and budgeting"

## Key Points to Emphasize

1. **Financial Education**: All expenses tracked automatically, teaches budgeting
2. **Modular Architecture**: Clean code structure (core logic separated from UI)
3. **Data Persistence**: 3 save slots with IndexedDB (no server required)
4. **Demo Mode**: Realistic 30-day scenario perfect for presentations
5. **Code Quality**: Well-commented, organized, judge-friendly code

## Build Verification

```bash
# Verify build passes
npm run build
```

Expected: Zero errors, zero warnings

---

*Total demo time: 3-5 minutes*

