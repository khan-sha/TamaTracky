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
- Show pet mood and age stage (Baby/Young/Adult/Mature)
- Point out the Pet HUD (always visible at top)
- Explain: "Pet ages up based on XP: 20 XP = Young, 60 XP = Adult, 120 XP = Mature"

### Step 3: Show Tasks & Earning (1 minute)
- Navigate to **Tasks**
- Show Daily Quests (coins + XP rewards)
- Show earning tasks with cooldowns
- Show Daily Check-In system
- Show Weekly Allowance system
- Explain: "Players earn coins through tasks, quests, check-ins, and allowance to afford pet care"

### Step 4: Demonstrate Store & Expense Tracking (1 minute)
- Navigate to **Store**
- Purchase an item (e.g., Premium Food)
- Explain: "All purchases automatically log expenses for financial tracking"
- Show inventory after purchase
- Navigate to **Tasks** and show feeding requires purchased food items

### Step 5: Show Reports & Analytics (1 minute)
- Navigate to **Reports**
- Show comprehensive financial summary:
  - Summary cards (Total Spent, Coins Earned, Net Balance, Budget Status)
  - Category breakdown (Food, Toys, Health, Supplies, Activities, Other)
  - Income sources breakdown (Tasks, Quests, Allowance, Check-In)
  - Charts (bar chart, line chart, doughnut chart)
  - CSV export options
- Explain: "This teaches financial responsibility through cost-of-care tracking"

### Step 6: Show Help & FAQ Assistant (30 seconds)
- Navigate to **Help**
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
3. **Data Persistence**: 3 save slots with localStorage (no server required)
4. **Demo Mode**: Realistic 30-day scenario perfect for presentations
5. **Code Quality**: Well-commented, organized, judge-friendly code
6. **Simple Pet System**: 3 pet types (Cat, Dog, Rabbit), 4 age stages based on XP
7. **Multiple Income Sources**: Tasks, Daily Quests, Weekly Allowance, Daily Check-In

## Pet System Overview

- **Pet Types**: Cat, Dog, Rabbit (simple selection)
- **Age Stages**: Baby (0 XP), Young (20 XP), Adult (60 XP), Mature (120 XP)
- **Stats**: 5 core stats (Hunger, Happiness, Health, Energy, Cleanliness)
- **Progression**: XP-based age progression (single function: `getAgeStage(xp)`)

## Build Verification

```bash
# Verify build passes
npm run build
```

Expected: Zero errors, zero warnings

---

*Total demo time: 3-5 minutes*
