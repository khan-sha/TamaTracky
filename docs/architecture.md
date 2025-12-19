# Tama Tracky - Architecture Documentation

## Overview

Tama Tracky is a Progressive Web App (PWA) built with React, TypeScript, and Vite. It implements a virtual pet system with comprehensive cost-of-care tracking, designed to meet FBLA Introduction to Programming competition requirements.

## Technology Stack

### Core Technologies
- **React 18.2.0**: UI library for building component-based interfaces
- **TypeScript 5.2.2**: Type-safe JavaScript for better code quality and maintainability
- **Vite 5.0.0**: Fast build tool and development server
- **React Router 6.20.0**: Client-side routing for single-page application navigation

### Styling
- **Tailwind CSS 3.3.5**: Utility-first CSS framework for rapid UI development
- **PostCSS 8.4.31**: CSS processing tool
- **Autoprefixer 10.4.16**: Automatic vendor prefixing for CSS

### Data Persistence
- **localStorage**: Browser localStorage for save slot persistence (via `core/storage.ts`)

### Data Visualization
- **Chart.js 4.4.0**: Powerful charting library for data visualization
- **react-chartjs-2 5.2.0**: React wrapper for Chart.js

### PWA Support
- **vite-plugin-pwa 0.17.0**: Vite plugin for Progressive Web App features
- **workbox-window 7.0.0**: Service worker management

## Project Structure

```
TamaTracky/
├── public/                 # Static assets
│   ├── manifest.json       # PWA manifest
│   └── ICONS_README.md     # Icon documentation
├── src/
│   ├── components/         # Reusable React components
│   │   ├── NavBar.tsx      # Navigation bar component
│   │   ├── StatBar.tsx     # Pet statistic display component
│   │   ├── PetAvatar.tsx   # Pet visual representation
│   │   ├── PetHUD.tsx      # Pet status HUD (always visible)
│   │   ├── ExpenseTable.tsx # Expense history table
│   │   ├── ExpenseChart.tsx # Chart.js visualizations
│   │   ├── DailyQuests.tsx # Daily quest display
│   │   ├── DailyCheckInModal.tsx # Daily check-in modal
│   │   └── TaskActivityModal.tsx # Task completion modal
│   ├── contexts/           # React Context providers
│   │   └── ThemeContext.tsx # Theme management
│   ├── core/               # Core game logic (pure TypeScript)
│   │   ├── pet.ts          # Pet lifecycle, stats, XP, age stages
│   │   ├── actions.ts      # Pet care actions (feed, play, rest, clean, visitVet)
│   │   ├── money.ts        # Coin economy (earn, spend, chores)
│   │   ├── shop.ts         # Store system (buy items, inventory)
│   │   ├── expenses.ts     # Expense logging and cost tracking
│   │   ├── storage.ts      # Persistence (localStorage save/load)
│   │   ├── badges.ts       # Achievement system
│   │   ├── quests.ts       # Daily quest system
│   │   ├── tasks.ts        # Task system with cooldowns
│   │   ├── rewards.ts      # Mini-game rewards, allowance, daily check-in
│   │   ├── activities.ts   # Special activities (spa day, training, park trip)
│   │   ├── demo.ts         # Demo mode seed data generation
│   │   ├── expenses.ts     # Expense logging and cost tracking
│   │   ├── utils.ts         # General utilities (mood, CSV export, totals)
│   │   ├── validation.ts   # Input validation
│   │   └── types.ts        # TypeScript type definitions
│   ├── game/               # Game data definitions
│   │   └── data.ts         # Static data (types, store items, quests, badges, constants)
│   ├── data/               # Legacy static data (being migrated to game/)
│   │   └── storeItems.ts   # Store item definitions
│   ├── minigames/          # Mini-game components
│   │   ├── BudgetBlitz.tsx # Budget management mini-game
│   │   ├── CatchFood.tsx   # Food catching mini-game
│   │   ├── CleanUp.tsx     # Cleaning mini-game
│   │   └── MiniGameLoader.tsx # Mini-game loader
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page with save slots
│   │   ├── StartHere.tsx   # Onboarding page
│   │   ├── CreatePet.tsx   # Pet creation form
│   │   ├── Dashboard.tsx   # Main pet management interface
│   │   ├── Store.tsx       # Virtual store
│   │   ├── Tasks.tsx       # Tasks and daily quests
│   │   ├── Reports.tsx     # Statistics and analytics
│   │   ├── Achievements.tsx # Badges and achievements
│   │   ├── Guide.tsx       # User guide
│   │   └── Help.tsx        # Help page with Q&A bot
│   ├── utils/              # Utility functions
│   │   ├── reporting.ts    # Financial reporting utilities
│   │   ├── sanitizeTransactions.ts # Transaction sanitization
│   │   ├── helpRouter.ts   # Help system routing
│   │   └── routeTitles.ts  # Route title management
│   ├── App.tsx             # Main app component with routing
│   ├── GameCore.ts         # Game facade (unified API)
│   ├── useGameCore.ts      # React hook for game state
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles (Tailwind imports)
├── docs/                   # Documentation
│   ├── architecture.md     # This file
│   ├── design_notes.md     # Design decisions and rationale
│   └── attributions.md     # Third-party library credits
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration with PWA plugin
└── tailwind.config.js      # Tailwind CSS configuration
```

## Architecture Patterns

### Component Architecture
- **Functional Components**: All components use React functional components with hooks
- **Component Composition**: Reusable components (NavBar, StatBar, etc.) are composed into pages
- **Separation of Concerns**: UI components, business logic, and data access are clearly separated

### State Management
- **React Hook (`useGameCore`)**: Centralized game state management
- **Local State**: Component-specific state managed with useState hook
- **Derived State**: Computed values using useMemo for performance optimization
- **Auto-Save**: Automatic persistence after state changes

### Data Flow
1. User interacts with UI component
2. Component calls `useGameCore()` hook functions
3. Hook updates internal state via `GameCore` facade
4. State updates trigger React re-render
5. Changes automatically saved to localStorage via `core/storage.ts`
6. Component re-renders with updated data

### Data Persistence
- **localStorage**: Primary storage mechanism via `core/storage.ts`
- **Automatic Saving**: Pet state saved after every action
- **Save Slots**: 3 independent save slots (Slot 1, 2, 3)
- **Demo Mode**: Realistic seed data generation for presentations

## Pet System Design

### Pet Types
- **3 Types Only**: Cat, Dog, Rabbit (FBLA-safe, easy to explain)
- **Simple Selection**: Users choose from 3 clear options during pet creation

### Age Progression
- **Numeric Stages**: 0 (Baby), 1 (Young), 2 (Adult), 3 (Mature)
- **XP-Based**: Age stage determined solely by XP thresholds:
  - 0 XP = Baby (ageStage 0)
  - 20 XP = Young (ageStage 1)
  - 60 XP = Adult (ageStage 2)
  - 120 XP = Mature (ageStage 3)
- **Single Source of Truth**: `getAgeStage(xp)` function in `game/data.ts` is the ONLY function that determines age stage
- **Automatic Updates**: Age stage recalculated automatically when XP changes

### Pet Stats
- **5 Core Stats**: Hunger, Happiness, Health, Energy, Cleanliness (all 0-100)
- **Decay System**: Stats decay over time based on time elapsed
- **Care Actions**: Feed, Play, Rest, Clean, Visit Vet (free actions)
- **Mood System**: Pet mood calculated from stats (happy, sad, sick, energetic, tired, angry, neutral)

## Key Design Decisions

### Why localStorage?
- Simple and sufficient for save slot data
- No external dependencies
- Works offline
- Easy to understand for judges
- Suitable for competition scope

### Why GameCore Facade?
- Unified API to all game systems
- Single entry point for all game operations
- Easier to test and maintain
- Clear separation between UI and logic

### Why TypeScript?
- Type safety catches errors at compile time
- Better IDE support and autocomplete
- Self-documenting code through types
- Professional development practice

### Why Tailwind CSS?
- Rapid UI development
- Consistent design system
- Small bundle size (tree-shaking)
- Utility-first approach reduces custom CSS

## Module Responsibilities

### Game Core (`GameCore.ts`)
- Unified facade for all game operations
- Exports all game functions and constants as a single object
- Provides single API for components
- Delegates to specialized modules (pet, actions, shop, badges, etc.)
- Re-exports types for convenience

### Game Hook (`useGameCore.ts`)
- React hook that wraps GameCore
- Manages pet state with useState
- Loads current save slot from localStorage on mount
- Applies time decay automatically
- Auto-saves on state changes
- Provides loading states
- Exposes all GameCore functions and state to components

### Pet Module (`core/pet.ts`)
- Pet creation (`createPet`)
- XP and age stage management (`giveXP`, `checkEvolution`)
- Stat decay calculations (`applyTimeDecay`)
- Age progression logic (`acknowledgeEvolution`)
- Care score calculation (`getCareScore`)
- Mood updates (`updateMood`)

### Storage Module (`core/storage.ts`)
- Save slot management (save/load/delete)
- Slot listing and metadata
- localStorage abstraction
- Migration of old save formats

### Demo Module (`core/demo.ts`)
- Demo mode seed data generation
- Realistic 30-day scenario creation
- Demo mode initialization and reset

### Data Module (`game/data.ts`)
- Type definitions (PetData, ShopItem, Badge, PetType, AgeStage, Stats, etc.)
- Static game data (store items, quest templates, badge definitions, task definitions)
- Constants (WEEKLY_ALLOWANCE_AMOUNT, ALLOWANCE_COOLDOWN_MS, DAILY_CHECKIN_COINS_MIN/MAX, DAILY_CHECKIN_XP)
- Helper functions:
  - `getAgeStage(xp)` - Single source of truth for age stage calculation
  - `getPetEmoji(petType, ageStage)` - Pet emoji based on type and stage
  - `AGE_LABELS` - Age stage labels (Baby, Young, Adult, Mature)

### Actions Module (`core/actions.ts`)
- Pet care actions (feed, play, rest, clean, visitVet)
- Stat updates and validation
- Inventory consumption (feed requires purchased food items)

### Money Module (`core/money.ts`)
- Coin economy (addCoins, earnCoins, giveCoins, spendCoins)
- Chore system (doChore)
- Daily reward system (dailyReward, isDailyRewardClaimed)

### Shop Module (`core/shop.ts`)
- Store system (shopItems array)
- Item purchasing (buyItem)
- Inventory management
- Automatic expense logging on purchase

### Badges Module (`core/badges.ts`)
- Badge definitions (badgeDefinitions)
- Badge evaluation logic (evaluateBadges)
- Achievement tracking (awardBadges, awardBadge)
- Badge retrieval (getBadge, getAllBadges)
- Legacy compatibility (checkBadges)

### Rewards Module (`core/rewards.ts`)
- Mini-game reward application
- Weekly allowance system (canClaimAllowance, claimAllowance, timeUntilAllowance)
- Daily check-in rewards (isDailyCheckInAvailable, claimDailyCheckIn)
- Income tracking for reports
- Reward constants (WEEKLY_ALLOWANCE_AMOUNT, DAILY_CHECKIN_COINS_MIN/MAX, DAILY_CHECKIN_XP)

### Expenses Module (`core/expenses.ts`)
- Expense logging (logExpense)
- Cost tracking (getTotalCareCost, getCareCostByCategory)
- Expense categorization

### Activities Module (`core/activities.ts`)
- Free care actions (cleanFree, restFree)
- Paid special activities (petSpaDay, trainingClass, parkTrip)
- Activity expense logging

### Tasks Module (`core/tasks.ts`)
- Task definitions (tasks array)
- Task retrieval (getAllTasks, getTask)
- Task completion (completeTask)
- Cooldown system (canDoTask, timeRemaining)

### Quests Module (`core/quests.ts`)
- Quest templates (getDefaultQuests)
- Quest management (getQuests, updateQuestProgress)
- Quest rewards (claimQuestReward)
- Quest status (isQuestReady, getReadyQuests)

### Utils Module (`core/utils.ts`)
- Mood calculation (getMood, getMoodEmoji)
- Pet emoji helper (getSpeciesEmoji - legacy compatibility)
- Financial totals (getTotalExpenses, getTotalIncome)
- CSV export (exportExpensesCSV)
- Demo pet creation (createDemoPet)
- Stat clamping (clamp)

### Validation Module (`core/validation.ts`)
- Input validation for pet names, numbers, purchases
- Syntactic and semantic validation

### Types Module (`core/types.ts`)
- TypeScript type definitions (PetData, ShopItem, Badge, SlotData, GameState, Stats, MiniGameReward, etc.)
- Shared types used across modules

## Performance Considerations

- **Memoization**: useMemo for expensive computations (filtered expenses, statistics)
- **Lazy Loading**: Components loaded on-demand via React Router
- **Efficient Re-renders**: State updates only trigger necessary re-renders
- **Chart Optimization**: Chart.js configured for responsive rendering

## Security Considerations

- **Input Validation**: All user inputs validated before processing
- **XSS Prevention**: React automatically escapes user input
- **Client-Side Only**: No server-side data, all storage local
- **Type Safety**: TypeScript prevents type-related errors

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **PWA Support**: Installable on mobile and desktop
- **localStorage**: Required for data persistence
- **ES6+ Features**: Requires modern JavaScript support

## Build and Deployment

- **Development**: `npm run dev` - Vite dev server with HMR
- **Production Build**: `npm run build` - Optimized production bundle
- **Preview**: `npm run preview` - Preview production build locally
- **PWA**: Service worker and manifest generated automatically

## Future Enhancements

- Cloud sync functionality
- Social features (share pets, compare costs)
- Advanced analytics and predictions
- Mobile app versions (React Native)
