# Tama Tracky
## FBLA Introduction to Programming (2025–2026)

**Tagline:** Virtual pet + budgeting simulator teaching cost-of-care responsibility.

---

## Team Members & Roles

- **Shayaan** (Lead Developer & Project Manager): Built core systems, debugging, integration, recording lead
- **Bryan** (Quality Testing & Setup): Feature testing, validation, helped with scripting and setup
- **CJ** (UI/Formatting & Rubric Alignment): Improved code formatting/comments, visual polish, matched rubric expectations

---

## Project Overview

### What is Tama Tracky?

Tama Tracky is an educational virtual pet game that teaches financial responsibility through hands-on pet care. Players manage a virtual pet's health, happiness, and well-being while tracking expenses, earning coins through tasks, and learning about real-world cost-of-care concepts. Every action has a cost, every purchase is tracked, and every decision affects the pet's well-being—just like caring for a real pet.

### The Problem It Solves

Many young people underestimate the financial responsibility of pet ownership. Tama Tracky addresses this by making costs visible and teaching budgeting through gameplay. Players must earn coins before spending, track expenses across categories (Food, Health, Toys, Supplies, Activities), and learn that consistent care requires financial planning. The game demonstrates that pet ownership isn't just about love—it requires money management, planning, and responsibility.

### What Makes It Above and Beyond

- **Comprehensive Financial Tracking**: Every expense is automatically logged with categories, timestamps, and descriptions. Reports show income vs. expenses, category breakdowns, and CSV export for analysis.
- **Realistic Cost-of-Care System**: Actions cost coins (feeding, playing, cleaning, vet visits), items must be purchased before use, and players learn that good care requires budgeting.
- **Educational Reports System**: Financial reports with charts, filters, and insights help players understand spending patterns and make better budgeting decisions.

---

## Rubric Mapping

### Code Quality

- **Modular Architecture**: Code is organized into clear modules (`core/`, `components/`, `pages/`) with single-responsibility functions
- **TypeScript Type Safety**: All data structures use TypeScript interfaces for compile-time error checking
- **Comprehensive Comments**: Functions include clear documentation explaining purpose, parameters, and return values
- **Consistent Code Style**: Uniform formatting and naming conventions throughout the codebase

### User Experience

- **Intuitive Navigation**: Clear navigation bar with labeled pages (Dashboard, Store, Tasks, Reports, Help)
- **Visual Feedback**: Pet mood indicators, stat bars, and animations provide immediate feedback on actions
- **Save System**: Three independent save slots allow multiple pets and easy switching
- **Responsive Design**: Works on desktop and mobile devices with adaptive layouts

### Input Validation

- **Syntactic Validation**: Pet names checked for length (1-30 characters), character format (letters, numbers, spaces only), and whitespace handling
- **Semantic Validation**: Purchase actions validate sufficient funds, numeric inputs checked for valid ranges, and stat values clamped to 0-100
- **Error Messages**: Clear, user-friendly error messages with recovery suggestions guide users to fix issues
- **Edge Case Handling**: Handles null/undefined values, empty strings, and invalid data gracefully

### Functionality

- **Pet Management**: Create pets (Cat, Dog, Rabbit), track 5 core stats (Hunger, Happiness, Health, Energy, Cleanliness), and manage pet progression through age stages
- **Financial System**: Coin economy with earning (tasks, quests, daily rewards) and spending (store purchases, care actions)
- **Expense Tracking**: Automatic expense logging for all purchases and care actions with categories and timestamps
- **Quest System**: Daily quests that reset each day, track progress, and reward coins and XP upon completion
- **Task System**: Cooldown-based tasks that earn coins, XP, and improve pet stats

### Reports

- **Financial Summary**: Total spent, total earned, net balance calculations with category breakdowns
- **Date Filtering**: Filter expenses by time period (Today, Last 7 Days, Last 30 Days, All Time)
- **Category Filtering**: Filter expenses by category (Food, Health, Toys, Supplies, Activities, Other)
- **Visual Charts**: Line, bar, and doughnut charts visualize spending patterns and trends
- **CSV Export**: Export expenses, income, and statistics to CSV files for external analysis

### Data Storage

- **localStorage Persistence**: All game data (pet stats, expenses, income, quests, badges) saved to browser localStorage
- **Save Slot System**: Three independent save slots with metadata (creation date, last played, slot number)
- **Auto-Save**: Game state automatically saves after every action to prevent data loss
- **Data Validation**: Load functions validate data structure and handle missing or corrupted data gracefully

### Documentation

- **Code Comments**: Functions include JSDoc-style comments explaining purpose, parameters, and return values
- **Architecture Documentation**: `docs/architecture.md` explains system design and module organization
- **User Guide**: Help page with offline FAQ assistant and care instructions
- **Attributions**: Complete list of third-party libraries and credits in `docs/attributions.md`

---

## Key Features

### Pet System

- **Pet Types**: Three pet types (Cat, Dog, Rabbit) with unique characteristics
- **Core Stats**: Five stats tracked (Hunger, Happiness, Health, Energy, Cleanliness), each 0-100
- **Mood System**: Pet mood calculated from stats (Happy, Sad, Sick, Energetic, Tired, Angry, Neutral)
- **Age Progression**: Four age stages (Baby, Young, Adult, Mature) based on XP thresholds (0, 20, 60, 120 XP)
- **Stat Decay**: Stats naturally decrease over time, requiring regular care
- **XP System**: Experience points earned from care actions, tasks, and quests drive age progression

### Cost-of-Care System

- **Expense Categories**: Seven categories (Food, Toys, Healthcare, Supplies, Care, Purchase, Activity)
- **Automatic Logging**: Every purchase and care action automatically logs an expense with timestamp and description
- **Realistic Costs**: Actions cost coins (feeding requires purchased food, playing costs coins, vet visits are expensive)
- **Budget Awareness**: Players must earn coins before spending, teaching financial planning

### Earning System

- **Tasks**: Four tasks (Clean Room, Training, Pet Walking, Grooming) with cooldowns, earning coins and XP
- **Daily Quests**: Four daily quests that reset each day, rewarding coins and XP upon completion
- **Daily Check-In**: Daily reward for logging in and checking pet status
- **Weekly Allowance**: Weekly coin allowance with cooldown to prevent abuse
- **Mini-Games**: Optional mini-games (Budget Blitz, Catch Food, Clean Up) that reward coins and stat improvements

**Note**: The earning system is optional in the prompt but included for budgeting realism. Players must earn coins to afford pet care, teaching that real pet ownership requires income.

### Store + Activities

- **Store Items**: Food items, toys, healthcare items, and supplies available for purchase
- **Inventory System**: Purchased items stored in inventory and consumed when used
- **Item Effects**: Items affect pet stats (food restores hunger, toys increase happiness, healthcare improves health)
- **Special Activities**: Activities like Spa Day, Training Session, and Park Trip cost coins and provide stat boosts

### Reports

- **Financial Summary Cards**: Total spent, coins earned, net balance, and budget status at a glance
- **Category Breakdown**: Spending broken down by category (Food, Health, Toys, Supplies, Activities, Other) with percentages
- **Income Sources Breakdown**: Income broken down by source (Tasks, Quests, Allowance, Check-In, Mini-Games)
- **Date Range Filters**: Filter data by time period (Today, Last 7 Days, Last 30 Days, All Time)
- **Category Filters**: Filter expenses by specific category to analyze spending patterns
- **Chart Visualizations**: Line charts (trends over time), bar charts (category comparisons), doughnut charts (proportions)
- **CSV Export**: Export expenses, income, and statistics to CSV files for external analysis
- **Financial Insights**: Automated insights highlight top spending categories, income sources, and budget status

---

## How to Run

### Prerequisites

- **Node.js**: Version 18 or higher (download from https://nodejs.org/)
- **npm**: Comes with Node.js (version 9 or higher)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```
   Downloads all required libraries (React, TypeScript, Chart.js, etc.) listed in `package.json`.

### Development

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Starts a local development server (usually at http://localhost:5173). The app auto-reloads when you edit code.

### Build

3. **Build for production:**
   ```bash
   npm run build
   ```
   Compiles TypeScript, bundles assets, and creates an optimized production build in the `dist/` folder.

---

## Judge Demo Path (3–5 Minute Walkthrough)

### Step 1: Start at Home Page
- **Action**: Open the app and navigate to the Home page
- **What to say**: "This is the save slot selection screen. We have three independent save slots. For the demo, I'll use Demo Mode which creates realistic 30-day data."

### Step 2: Create Pet (or Use Demo Mode)
- **Action**: Click "DEMO MODE" button (or create a new pet: select slot, enter name, choose pet type)
- **What to say**: "Demo Mode seeds 30 days of realistic pet care data. Alternatively, you can create a new pet from scratch."

### Step 3: Show Dashboard Stats + Mood
- **Action**: Navigate to Dashboard page
- **What to say**: "The Dashboard shows the pet's five core stats—Hunger, Happiness, Health, Energy, and Cleanliness. The pet's mood is calculated from these stats. Notice the age stage (Baby/Young/Adult/Mature) based on XP."

### Step 4: Complete 1 Task/Quest to Earn Coins + XP
- **Action**: Navigate to Tasks page, complete a task (e.g., "Clean Room"), and claim a daily quest reward
- **What to say**: "Tasks earn coins and XP. Daily quests reset each day and reward coins and XP when completed. This teaches that earning money is necessary before spending."

### Step 5: Buy an Item in Store and Use It
- **Action**: Navigate to Store page, purchase an item (e.g., Basic Food), then use it from inventory on Dashboard
- **What to say**: "Items must be purchased before use, teaching planning ahead. Notice the expense is automatically logged. The item is consumed from inventory when used."

### Step 6: Open Reports and Highlight Features
- **Action**: Navigate to Reports page
- **What to say**: "The Reports page shows comprehensive financial tracking."

**Highlight these features:**
- **Income vs Expenses**: "This shows total earned vs total spent, with net balance. In demo mode, you'll see realistic 30-day data."
- **Category Breakdown**: "Expenses are categorized (Food, Health, Toys, Supplies, Activities). This teaches where money goes."
- **Filters**: "Date filters (Today, Last 7 Days, Last 30 Days, All Time) and category filters let you analyze spending patterns."
- **CSV Export**: "Click 'Export Expenses CSV' to download transaction data. This demonstrates data export functionality."

---

## FAQ (Offline Assistant)

**Q: How does cost-of-care work?**  
A: Every action that cares for your pet costs coins. Feeding requires purchased food, playing costs coins, cleaning costs coins, and vet visits are expensive. This teaches that real pet ownership requires money. All expenses are automatically logged in Reports.

**Q: Why do some actions cost coins?**  
A: Actions cost coins to teach financial responsibility. In real life, pet food, toys, and vet visits cost money. The game makes these costs visible so players learn to budget for pet care.

**Q: How do I earn coins?**  
A: Coins are earned through tasks (Clean Room, Training, Pet Walking, Grooming), daily quests, daily check-ins, weekly allowance, and mini-games. This teaches that earning money is necessary before spending.

**Q: What happens if I ignore my pet?**  
A: Stats decay over time. If hunger, energy, or cleanliness drop too low, the pet becomes sad or sick. Health decreases if other stats are neglected. This teaches that consistent care is essential.

**Q: How do reports help me learn budgeting?**  
A: Reports show where money is spent (Food, Health, Toys, etc.), income sources, and net balance. Category breakdowns and date filters help identify spending patterns. CSV export allows external analysis.

**Q: What does XP do?**  
A: Experience points (XP) are earned from care actions, tasks, and quests. XP determines age progression: 0 XP = Baby, 20 XP = Young, 60 XP = Adult, 120 XP = Mature. Higher age stages unlock new features.

**Q: How does the save system work?**  
A: The game uses browser localStorage to save data. Three independent save slots allow multiple pets. Data auto-saves after every action. Each slot stores pet data, expenses, income, quests, and badges.

**Q: Can I export my data?**  
A: Yes. The Reports page has CSV export buttons for expenses, income, and statistics. Exported files can be opened in Excel or Google Sheets for analysis.

**Q: What are daily quests?**  
A: Daily quests are goals that reset each day (e.g., "Feed pet 3 times", "Clean pet once"). Completing quests rewards coins and XP. This encourages daily engagement and teaches goal-setting.

**Q: How do tasks work?**  
A: Tasks are activities you can complete to earn coins and XP (e.g., Clean Room, Training, Pet Walking). Each task has a cooldown timer to prevent spam. Tasks also improve pet stats.

**Q: What are badges?**  
A: Badges are achievements earned for milestones (e.g., "First Purchase", "Savings Master", "Care Expert"). They reward good care habits and smart budgeting, encouraging consistent, responsible behavior.

**Q: How does the pet's mood work?**  
A: Mood is calculated from stats. If health < 30, pet is sick. If happiness < 30 or hunger < 20, pet is sad. If energy > 70 and happiness > 70, pet is energetic. Otherwise, pet is happy.

**Q: What happens when my pet ages?**  
A: Age progression is based on XP. At 20 XP, pet becomes Young. At 60 XP, Adult. At 120 XP, Mature. Age stages are visual indicators of progress and unlock new features.

**Q: Can I have multiple pets?**  
A: Yes. The save system has three independent slots. Each slot can have one pet. You can switch between slots from the Home page.

**Q: How do I know if I'm spending too much?**  
A: The Reports page shows net balance (income minus expenses). If net balance is negative, you're spending more than you earn. Use category breakdowns to identify where to cut costs.

---

## Credits / Attributions

All external libraries and assets are properly credited in `docs/attributions.md` in the repository. This includes React, TypeScript, Chart.js, Tailwind CSS, and other dependencies with their respective licenses and copyright notices.

The game uses original pet designs and placeholders—no copyrighted brand characters (e.g., no Tamagotchi characters). All emojis are from the Unicode Emoji Standard.

---

## Final Notes

This document accompanies our YouTube presentation video. The app demonstrates comprehensive programming concepts (functions, conditionals, validation, data storage, reports) while teaching financial responsibility through engaging gameplay.

For technical details, see `docs/architecture.md`. For design decisions, see `docs/design_notes.md`. For third-party credits, see `docs/attributions.md`.

**Thank you for judging our project!**

