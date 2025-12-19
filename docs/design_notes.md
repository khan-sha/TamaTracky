# Tama Tracky - Design Notes

## Design Philosophy

Tama Tracky is designed to be both educational and engaging. It teaches users about the real costs of pet ownership while providing an enjoyable virtual pet experience. The design prioritizes clarity, simplicity, and judge-friendly explanations.

## Pet System Design

### Pet Types (Simplified)
- **3 Types Only**: Cat, Dog, Rabbit
- **Rationale**: Easy to explain to judges, clear visual distinction, simple selection
- **Visual Representation**: Emoji-based placeholders (🐱 🐈 😺 😼 for cat, 🐶 🐕 😄 🐾 for dog, 🐰 🐇 😊 🌟 for rabbit)

### Age Progression (Numeric Stages)
- **4 Stages**: Baby (0), Young (1), Adult (2), Mature (3)
- **XP Thresholds**: 
  - 0 XP = Baby
  - 20 XP = Young
  - 60 XP = Adult
  - 120 XP = Mature
- **Single Function**: `getAgeStage(xp)` in `game/data.ts` is the ONLY function that determines age stage
- **Rationale**: Simple, predictable, easy to explain. No complex evolution trees or element systems.

### Pet Stats
- **5 Core Stats**: Hunger, Happiness, Health, Energy, Cleanliness
- **Range**: 0-100 for all stats
- **Decay**: Stats decay over time based on elapsed time
- **Care Actions**: Free actions (feed, play, rest, clean, visit vet) that restore stats

## User Experience Design

### Color Scheme
- **Primary**: Warm browns and beiges (#6E5A47, #A67C52, #FAEEDC) - Retro, friendly
- **Success**: Green - Positive actions, health
- **Warning**: Yellow/Orange - Attention needed
- **Danger**: Red - Critical states, expenses
- **Accent**: Purple/Pink - Special features, demo mode

### Typography
- **Headings**: Pixel-style font for retro aesthetic
- **Body**: Readable system fonts
- **Labels**: Clear, uppercase for emphasis
- **Consistent**: Same font family throughout

### Layout Principles
- **Card-Based**: Information grouped in retro-styled cards
- **Spacing**: Generous whitespace for clarity
- **Responsive**: Mobile-first design approach
- **Grid System**: Consistent grid layouts

### Interaction Design
- **Hover States**: All interactive elements have hover effects
- **Transitions**: Smooth animations (200ms duration)
- **Feedback**: Immediate visual feedback for actions
- **Loading States**: Clear loading indicators

## Component Design Decisions

### StatBar Component
- **Visual Progress**: Color-coded bars show status at a glance
- **Percentage Display**: Exact values for precision
- **Icons**: Emoji icons for quick recognition
- **Accessibility**: ARIA labels for screen readers

### PetAvatar Component
- **Type + Stage**: Displays pet emoji based on petType and ageStage
- **Mood Display**: Shows mood emoji alongside pet emoji
- **Size Variants**: Different sizes for different contexts (small, medium, large)
- **State Indicators**: Visual representation of pet's emotional state

### ExpenseTable Component
- **Sortable**: Default sort by most recent
- **Filterable**: Can filter by category or date
- **Formatted**: Human-readable dates and amounts
- **Export Ready**: Data formatted for CSV export

### NavBar Component
- **Sticky**: Always visible at top
- **Active State**: Highlights current page
- **Pet Name**: Shows current pet name when available
- **Responsive**: Adapts to screen size

### PetHUD Component
- **Collapsible**: Side drawer that can be toggled
- **Always Accessible**: Quick access to pet stats from any page
- **Compact**: Shows key info without taking too much space

## Page-Specific Design

### Home Page
- **Save Slots**: Clear display of 3 save slots
- **Demo Mode**: Easy access for presentations
- **Quick Links**: Visual navigation cards

### Start Here Page
- **Onboarding**: Clear introduction to the game
- **Instructions**: Step-by-step guide for new users
- **Judge-Friendly**: Explains what judges should look for

### Create Pet Page
- **Simple Selection**: 3 pet type options (Cat, Dog, Rabbit)
- **Name Validation**: Real-time validation feedback
- **Clear CTAs**: Obvious "Create Pet" button

### Dashboard
- **Status Overview**: All stats visible at once
- **Action Buttons**: Large, colorful, obvious
- **Money Display**: Prominent coin balance
- **Pet Avatar**: Visual pet representation with mood
- **Evolution Modal**: Shows when pet ages up

### Store
- **Product Cards**: Clear pricing and descriptions
- **Affordability**: Visual indication of what's affordable
- **Categories**: Organized product display
- **Expense Tracking**: Automatic expense logging

### Tasks Page
- **Daily Quests**: Rotating quest system
- **Task List**: Cooldown-based tasks
- **Rewards**: Clear coin and XP rewards
- **Daily Check-In**: Popup modal for daily rewards

### Reports
- **Summary Cards**: Total spent, earned, net, budget
- **Multiple Views**: Charts and tables
- **Filters**: Easy filtering controls (date, category)
- **Export**: One-click CSV export
- **Financial Analysis**: Category and source breakdowns

### Help Page
- **Q&A Bot**: Interactive help system with intent matching
- **FAQ Section**: Common questions answered
- **Quick Links**: Easy navigation

## FBLA-Specific Design Considerations

### Judge-Friendly Features
- **Clear Instructions**: Every screen has guidance
- **Help System**: Comprehensive help available
- **Demo Mode**: Easy demonstration capability with realistic data
- **Visual Feedback**: Clear indication of actions
- **Simple Pet System**: 3 types, 4 age stages - easy to explain

### Code Quality Indicators
- **Comments**: Extensive inline documentation
- **Modular Structure**: Clear file organization
- **Consistent Naming**: Predictable naming conventions
- **Type Safety**: TypeScript throughout
- **Single Source of Truth**: Age stage determined by one function

### User Experience Indicators
- **Intuitive Navigation**: Obvious navigation paths
- **Error Prevention**: Validation before actions
- **Error Messages**: Clear, helpful error messages
- **Loading States**: Never leave users wondering
- **Onboarding**: Start Here page guides new users

## Accessibility Considerations

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: All features keyboard accessible
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Clear focus states
- **Semantic HTML**: Proper HTML structure

## Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### Mobile Optimizations
- **Touch Targets**: Minimum 44x44px
- **Simplified Navigation**: Collapsible menus
- **Stacked Layouts**: Vertical stacking on mobile
- **Readable Text**: Appropriate font sizes

## Performance Optimizations

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive computations cached
- **Efficient Re-renders**: Minimal re-renders
- **Optimized Images**: No heavy images (using emojis)

## Brand Identity

### Logo
- **Emoji-Based**: 🐾 paw print emoji
- **Simple**: Easy to recognize
- **Memorable**: Distinctive appearance

### Tagline
"Care for your pet. Track your costs."
- **Clear Purpose**: Immediately communicates value
- **Action-Oriented**: Encourages engagement
- **Educational**: Emphasizes learning aspect

## Color Psychology

- **Brown/Beige**: Warmth, friendliness, retro aesthetic
- **Green**: Health, growth, positive actions
- **Yellow**: Energy, happiness, attention
- **Red**: Urgency, expenses, health alerts
- **Purple**: Creativity, special features, premium

## Animation and Transitions

- **Duration**: 200ms for most transitions
- **Easing**: Smooth, natural easing functions
- **Purpose**: Enhance UX, not distract
- **Performance**: GPU-accelerated transforms

## Error Handling Design

- **User-Friendly Messages**: Clear, actionable error messages
- **Visual Indicators**: Color-coded error states
- **Recovery Options**: Suggestions for fixing errors
- **Non-Blocking**: Errors don't prevent app usage

## Data Visualization Design

- **Chart Types**: Line, bar, and doughnut charts
- **Color Coding**: Consistent color scheme
- **Labels**: Clear axis labels and legends
- **Responsive**: Charts adapt to container size

## Financial System Design

### Cost-of-Care Tracking
- **Automatic Logging**: All purchases automatically logged as expenses
- **Category Tracking**: Expenses categorized (Food, Health, Toys, Supplies, Activities, Other)
- **Running Totals**: Real-time calculation of total spent
- **Income Tracking**: Separate tracking of income sources (Tasks, Quests, Allowance, Check-In)

### Economy Balance
- **Realistic Ratios**: Income and expenses balanced for realistic gameplay
- **Multiple Income Sources**: Tasks, daily quests, weekly allowance, daily check-in
- **Budget Awareness**: Budget limit feature with progress tracking
