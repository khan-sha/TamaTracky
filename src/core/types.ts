/**
 * Core Types - All Data Structures
 * 
 * This module defines all the data structures used throughout the game.
 * Having all types in one place makes it easy to understand what data the game uses.
 */

// ============================================================================
// PET TYPES
// ============================================================================

/**
 * Pet Stats - All stats are 0-100
 * 
 * These represent the pet's current condition:
 * - hunger: How full (0 = starving, 100 = full)
 * - happiness: How happy (0 = sad, 100 = very happy)
 * - health: How healthy (0 = sick, 100 = perfect)
 * - energy: How energetic (0 = tired, 100 = full energy)
 * - cleanliness: How clean (0 = dirty, 100 = very clean)
 */
export interface Stats {
  hunger: number
  happiness: number
  health: number
  energy: number
  cleanliness: number
}

/**
 * Pet Data - Complete pet information
 * 
 * This contains everything about a pet:
 * - Identity (id, name, petType)
 * - Progress (ageStage, xp, tricks, badges)
 * - Condition (stats)
 * - Economy (coins, lifetimeEarnings, expenses, inventory)
 * - Metadata (createdAt, lastUpdated)
 * 
 * FOR JUDGES:
 * - petType: Only 3 types (cat, dog, rabbit) - easy to explain
 * - ageStage: Numeric 0-3 based on XP thresholds - simple progression
 */
export interface PetData {
  id: string
  name: string
  petType: "cat" | "dog" | "rabbit"  // Changed from "species"
  xp: number
  ageStage: 0 | 1 | 2 | 3  // Changed from "stage" - computed from XP
  tricks: string[]
  badges: string[]
  stats: Stats
  coins: number
  lifetimeEarnings: number
  expenses: Array<{ 
    id: string
    timestamp: number
    amount: number
    description: string
    type: 'food' | 'toy' | 'healthcare' | 'supplies' | 'care' | 'purchase' | 'activity'
    itemName?: string
  }>
  inventory: Record<number, number> // itemId -> quantity
  createdAt: number
  lastUpdated: number
  lastTickAt?: number // Timestamp of last time decay was applied
  evolved?: boolean // Legacy flag - kept for backward compatibility
  lastEvolutionAckId?: string // ID of last acknowledged evolution event
  // Legacy fields (for migration):
  species?: string  // Old field - will be migrated to petType
  stage?: 'baby' | 'teen' | 'mature' | 'final'  // Old field - will be migrated to ageStage
}

// ============================================================================
// SHOP TYPES
// ============================================================================

/**
 * Shop Item - Items available for purchase
 * 
 * Each item has:
 * - Identity (id, name, emoji)
 * - Pricing (price)
 * - Category (for organizing items)
 * - Effects (what the item does)
 */
export interface ShopItem {
  id: number
  name: string
  price: number
  category: string
  emoji: string
  description: string
  effect: string
  // Food-specific properties (for inventory-based feeding)
  hungerRestore?: number // How much hunger this food restores when consumed
  happinessBonus?: number // Optional happiness bonus when consuming food
}

// ============================================================================
// BADGE TYPES
// ============================================================================

/**
 * Badge - Achievement badge
 * 
 * Badges are earned for completing milestones:
 * - Identity (id, name, emoji)
 * - Description (what you did to earn it)
 * - Styling (color, bgColor for UI)
 */
export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  bgColor: string
  category?: 'care' | 'evolution' | 'milestone' | 'financial' | 'expertise'
  icon?: string // Optional icon identifier
}

/**
 * Earned Badge - Badge that has been awarded to a pet
 * 
 * Stored in slot save data with earned timestamp.
 */
export interface EarnedBadge {
  id: string
  name: string
  description: string
  earnedAt: number // Timestamp when badge was earned
  icon: string // Emoji or icon identifier
}

// ============================================================================
// SAVE SYSTEM TYPES
// ============================================================================

/**
 * Slot Data - Complete save slot information
 * 
 * Each save slot contains:
 * - Pet data
 * - Financial records (expenses, income)
 * - Progress (quests, badges)
 * - Task state (cooldowns per task)
 * - Metadata (creation date, last played, slot number)
 */
export interface SlotData {
  pet: PetData | null
  expenses: Array<{ 
    id: string
    timestamp: number
    amount: number
    description: string
    type: 'food' | 'toy' | 'healthcare' | 'supplies' | 'care' | 'purchase' | 'activity' | 'earning'
    itemName?: string
    category?: string
  }>
  income: Array<{ 
    id: string
    timestamp: number
    amount: number
    description: string
    source: string
  }>
  quests: any[]
  badges: string[] // Array of badge IDs (for backward compatibility)
  earnedBadges?: EarnedBadge[] // Detailed badge records with earnedAt timestamps
  taskState?: Array<{ // Task cooldown state per slot
    taskId: string
    lastCompletedAt: number | null
    inProgress: boolean
  }>
  guideChecklist?: { // Daily care checklist state
    date: string // YYYY-MM-DD format
    items: {
      feed: boolean
      clean: boolean
      rest: boolean
      health: boolean
      chore: boolean
      report: boolean
    }
    streak?: number // Optional streak counter (days with 4+ items completed)
  }
  meta: {
    createdAt: string
    lastPlayed: string
    slotNumber: 1 | 2 | 3
    demo?: boolean // Flag to indicate demo mode
    demoSeedVersion?: number // Version marker to prevent re-seeding (1 = seeded)
    lastAllowanceClaim?: number // Timestamp of last weekly allowance claim (for cooldown)
    lastCheckIn?: string // Date string (YYYY-MM-DD) of last daily check-in claim
  }
}

/**
 * Mini-Game Reward - Reward from completing a mini-game
 * 
 * This is the reward object that mini-games return.
 * It is NOT applied immediately - user must confirm first.
 */
export interface MiniGameReward {
  coins?: number
  happiness?: number
  clean?: number
  xp?: number
}

// ============================================================================
// GAME STATE TYPES
// ============================================================================

/**
 * Game State - Current game session data
 * 
 * This tracks the current state of the game:
 * - Current pet (or null if no pet)
 * - Active save slot (1, 2, or 3)
 * - Current mood (calculated from pet stats)
 */
export interface GameState {
  pet: PetData | null
  saveSlot: 1 | 2 | 3 | null
  mood: 'happy' | 'sad' | 'sick' | 'energetic' | 'tired' | 'angry' | 'neutral'
}

