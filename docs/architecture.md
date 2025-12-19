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
- **idb 8.0.0**: Promise-based wrapper for IndexedDB, providing reliable client-side storage

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
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Reusable React components
│   │   ├── NavBar.tsx      # Navigation bar component
│   │   ├── StatBar.tsx     # Pet statistic display component
│   │   ├── PetAvatar.tsx   # Pet visual representation
│   │   ├── ExpenseTable.tsx # Expense history table
│   │   └── ExpenseChart.tsx # Chart.js visualizations
│   ├── contexts/           # React Context providers
│   │   └── PetContext.tsx  # Global pet state management
│   ├── lib/                # Core business logic and utilities
│   │   ├── pet.ts          # Pet class with all pet logic
│   │   ├── db.ts           # IndexedDB wrapper functions
│   │   ├── validation.ts   # Input validation utilities
│   │   ├── csvExport.ts    # CSV export functionality
│   │   └── demoMode.ts     # Demo mode utilities
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page with demo mode
│   │   ├── CreatePet.tsx   # Pet creation form
│   │   ├── Dashboard.tsx   # Main pet management interface
│   │   ├── Store.tsx       # Virtual store
│   │   ├── Reports.tsx     # Statistics and analytics
│   │   └── Help.tsx        # Help page with Q&A bot
│   ├── App.tsx             # Main app component with routing
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
- **React Context API**: Global pet state managed through PetContext
- **Local State**: Component-specific state managed with useState hook
- **Derived State**: Computed values using useMemo for performance optimization

### Data Flow
1. User interacts with UI component
2. Component calls Pet class methods or context functions
3. Pet class updates internal state
4. Component creates new Pet instance to trigger re-render
5. Context updates with new Pet instance
6. Component re-renders with updated data
7. Changes saved to IndexedDB automatically

### Data Persistence
- **IndexedDB**: Primary storage mechanism via idb library
- **Automatic Saving**: Pet state saved after every action
- **JSON Serialization**: Pet class provides toJSON()/fromJSON() for persistence

## Key Design Decisions

### Why IndexedDB?
- Large storage capacity (unlike localStorage)
- Structured data storage (object stores, indexes)
- Asynchronous operations (non-blocking)
- Suitable for complex pet data and expense records

### Why React Context over Redux?
- Simpler for single-pet application
- Less boilerplate code
- Sufficient for application scope
- Easier for judges to understand

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

### Pet Class (`src/lib/pet.ts`)
- Manages all pet state (stats, money, expenses)
- Provides pet care action methods (feed, play, rest, clean, vet)
- Handles expense tracking automatically
- Provides serialization for persistence

### Database Module (`src/lib/db.ts`)
- Abstracts IndexedDB operations
- Provides savePetState(), loadPetState(), listPets()
- Handles database schema and migrations
- Error handling and validation

### Validation Module (`src/lib/validation.ts`)
- Input validation for pet names, numbers, purchases
- Both syntactic (format) and semantic (logical) validation
- Consistent error messages
- Reusable validation functions

### Context Provider (`src/contexts/PetContext.tsx`)
- Global pet state management
- Automatic loading of first saved pet
- Provides pet, setPet, savePet functions
- Loading state management

## Performance Considerations

- **Memoization**: useMemo for expensive computations (filtered expenses, statistics)
- **Lazy Loading**: Components loaded on-demand via React Router
- **Efficient Re-renders**: New Pet instances only created when state changes
- **Chart Optimization**: Chart.js configured for responsive rendering

## Security Considerations

- **Input Validation**: All user inputs validated before processing
- **XSS Prevention**: React automatically escapes user input
- **Client-Side Only**: No server-side data, all storage local
- **Type Safety**: TypeScript prevents type-related errors

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **PWA Support**: Installable on mobile and desktop
- **IndexedDB**: Required for data persistence
- **ES6+ Features**: Requires modern JavaScript support

## Build and Deployment

- **Development**: `npm run dev` - Vite dev server with HMR
- **Production Build**: `npm run build` - Optimized production bundle
- **Preview**: `npm run preview` - Preview production build locally
- **PWA**: Service worker and manifest generated automatically

## Future Enhancements

- Multiple pets support
- Cloud sync functionality
- Social features (share pets, compare costs)
- Advanced analytics and predictions
- Mobile app versions (React Native)

