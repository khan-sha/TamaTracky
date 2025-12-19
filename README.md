# Tama Tracky

# For Main Paper check TamaTracky-IntroToProgrammingFBLA25-26.PDF

**Educational Virtual Pet Game - FBLA Introduction to Programming Project**

Tama Tracky is an educational virtual pet game that teaches financial responsibility through pet care. Players manage a virtual pet's health, happiness, and well-being while tracking expenses, earning coins through tasks, and learning about real-world cost-of-care concepts.

## 🎮 Features

- **Virtual Pet Management**: 3 pet types (Cat, Dog, Rabbit) with 5 core stats (Hunger, Happiness, Health, Energy, Cleanliness)
- **Financial System**: Coin economy with store, inventory, and automatic cost-of-care tracking
- **Save System**: 3 independent save slots with IndexedDB persistence
- **Tasks & Earning**: Cooldown-based task system with coin and XP rewards
- **Daily Quests**: Rotating quest system with progress tracking and rewards
- **Badges & Achievements**: Comprehensive achievement system with 20+ badges
- **Reports & Analytics**: Financial reports with charts, filtering, and CSV export
- **Demo Mode**: Realistic 30-day seed data for presentations
- **Offline FAQ Assistant**: Intelligent intent-matching help system with curated answer bank

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── App.tsx                 # Main app with routing
├── main.tsx                # Entry point
├── GameCore.ts             # Game facade (unified API)
├── useGameCore.ts          # React hook for game state
├── index.css               # Global styles
├── components/             # UI components (9 files)
├── contexts/               # React contexts (ThemeContext)
├── core/                   # Game logic modules (15 files)
├── data/                   # Static data (storeItems)
├── game/                   # Game data definitions
├── minigames/              # Mini-game components (4 files)
├── pages/                  # Route pages (10 files)
└── utils/                  # Utility functions (4 files)
```

## 🏗️ Architecture

Tama Tracky follows a **clean, modular architecture**:

- **Core Logic** (`core/`): Pure TypeScript modules (no React dependencies)
  - `pet.ts` - Pet lifecycle, stats, XP, age progression
  - `actions.ts` - Pet care actions (feed, play, rest, clean, visitVet)
  - `money.ts` - Coin economy (earn, spend, chores)
  - `shop.ts` - Store system (buy items, inventory)
  - `expenses.ts` - Expense logging and cost tracking
  - `storage.ts` - Persistence (localStorage save/load)
  - `badges.ts` - Achievement system
  - `quests.ts` - Daily quest system
  - `tasks.ts` - Task system with cooldowns
  - `rewards.ts` - Allowance, daily check-in, reward application
  - `activities.ts` - Special activities (spa day, training, park trip)
  - `demo.ts` - Demo mode seed data generation
  - `utils.ts` - General utilities (mood, CSV export, totals)
  - `validation.ts` - Input validation
  - `types.ts` - TypeScript type definitions

- **Game Data** (`game/`): Static data and type definitions
  - `data.ts` - Type definitions, store items, quests, badges, constants, helper functions

- **UI Components** (`components/`, `pages/`): React components for rendering
  - `NavBar.tsx` - Navigation bar
  - `PetHUD.tsx` - Pet status HUD (always visible)
  - `PetAvatar.tsx` - Pet avatar display
  - `StatBar.tsx` - Stat progress bar
  - `DailyQuests.tsx` - Daily quest display
  - `DailyCheckInModal.tsx` - Daily check-in modal
  - `ExpenseChart.tsx` - Expense chart visualization
  - `ExpenseTable.tsx` - Expense table display
  - `TaskActivityModal.tsx` - Task completion modal

- **Game Facade** (`GameCore.ts`): Unified API to all game systems
- **React Hook** (`useGameCore.ts`): State management and auto-save
- **Data Layer** (`data/`, `game/`): Static game data and type definitions

## 🎯 Demo Path

1. **Start**: Home page → Click "DEMO MODE" button (creates realistic 30-day scenario)
2. **Dashboard**: View pet stats, mood, age stage (Baby/Young/Adult/Mature)
3. **Tasks**: Tasks page → Show Daily Quests (coins + XP rewards) → Complete tasks
4. **Store**: Store page → Purchase an item → See expense automatically logged
5. **Reports**: Reports page → View financial summary with charts and breakdowns
6. **Help**: Help page → Ask "Why is my pet sad?" → See intelligent offline response
7. **Achievements**: Achievements page → See badge system with retro styling

## 🛠️ Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **React Router**: Client-side routing
- **localStorage**: Browser-based storage
- **Chart.js**: Data visualization
- **Tailwind CSS**: Styling

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)**: How to run + demo in 3-5 minutes
- **[docs/architecture.md](./docs/architecture.md)**: System architecture and technical details
- **[docs/design_notes.md](./docs/design_notes.md)**: Design decisions and rationale
- **[docs/attributions.md](./docs/attributions.md)**: Third-party library credits
- **[TamaTracky-IntroToProgrammingFBLA25-26.pdf](./TamaTracky-IntroToProgrammingFBLA25-26.pdf)**: Third-party library credits


This project is created for FBLA Introduction to Programming competition.
