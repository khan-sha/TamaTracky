/**
 * Game Data - Static Data Definitions
 * 
 * This file contains ALL static game data:
 * - Type definitions (PetData, ShopItem, Badge, etc.)
 * - Store items (the exact in-game items with prices)
 * - Quest templates (daily quest definitions)
 * - Badge definitions (achievement badges)
 * - Task definitions (earning tasks)
 * - Constants (allowance amounts, check-in rewards)
 * 
 * FOR JUDGES:
 * This is the single source of truth for all game data.
 * Easy to understand: one file shows all items, quests, badges, and constants.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Pet Type - Only 3 types (FBLA-safe, easy to explain)
 */
export type PetType = "cat" | "dog" | "rabbit"

/**
 * Age Stage - Numeric stages based on XP (FBLA-safe)
 */
export type AgeStage = 0 | 1 | 2 | 3

/**
 * Pet Stats - All stats are 0-100
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
 * FOR JUDGES:
 * - petType: Only 3 types (cat, dog, rabbit) - easy to explain
 * - ageStage: Numeric 0-3 based on XP thresholds - simple progression
 * - ageStage is computed from XP, not stored separately
 */
export interface PetData {
  id: string
  name: string
  petType: PetType  // Changed from "species" to "petType"
  xp: number
  ageStage: AgeStage  // Changed from "stage" to "ageStage" (computed from XP)
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
  inventory: Record<number, number>
  createdAt: number
  lastUpdated: number
  lastTickAt?: number
  evolved?: boolean  // Legacy flag for backward compatibility
  lastEvolutionAckId?: string  // Legacy flag for backward compatibility
  // Legacy fields (for migration):
  species?: string  // Old field - will be migrated to petType
  stage?: 'baby' | 'teen' | 'mature' | 'final'  // Old field - will be migrated to ageStage
}

/**
 * Shop Item - Items available for purchase
 */
export interface ShopItem {
  id: number
  name: string
  price: number
  category: string
  emoji: string
  description: string
  effect: string
  hungerRestore?: number
  happinessBonus?: number
}

/**
 * Badge - Achievement badge
 */
export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  bgColor: string
  category?: 'care' | 'evolution' | 'milestone' | 'financial' | 'expertise'
  icon?: string
}

/**
 * Earned Badge - Badge that has been awarded
 */
export interface EarnedBadge {
  id: string
  name: string
  description: string
  earnedAt: number
  icon: string
}

/**
 * Slot Data - Complete save slot information
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
  badges: string[]
  earnedBadges?: EarnedBadge[]
  taskState?: Array<{
    taskId: string
    lastCompletedAt: number | null
    inProgress: boolean
  }>
  guideChecklist?: {
    date: string
    items: {
      feed: boolean
      clean: boolean
      rest: boolean
      health: boolean
      chore: boolean
      report: boolean
    }
    streak?: number
  }
  meta: {
    createdAt: string
    lastPlayed: string
    slotNumber: 1 | 2 | 3
    demo?: boolean
    demoSeedVersion?: number
    lastAllowanceClaim?: number
    lastCheckIn?: string
  }
}

/**
 * Mini-Game Reward
 */
export interface MiniGameReward {
  coins?: number
  happiness?: number
  clean?: number
  xp?: number
}

/**
 * Game State - Current game session data
 */
export interface GameState {
  pet: PetData | null
  saveSlot: 1 | 2 | 3 | null
  mood: 'happy' | 'sad' | 'sick' | 'energetic' | 'tired' | 'angry' | 'neutral'
}

/**
 * Quest Definition
 */
export interface Quest {
  id: string
  goal: number
  progress: number
  rewardCoins: number
  rewardXp: number
  completedAt?: number
}

/**
 * Quest System
 */
export interface QuestSystem {
  daily: Quest[]
  lastReset: string
}

/**
 * Task Definition
 */
export interface Task {
  id: string
  name: string
  description: string
  emoji: string
  coins: number
  category: 'chore' | 'training' | 'checkin' | 'walking'
  cooldownSeconds: number
}

/**
 * Task State
 */
export interface TaskState {
  taskId: string
  lastCompletedAt: number | null
  inProgress: boolean
}

// ============================================================================
// STORE ITEMS (Single Source of Truth)
// ============================================================================

/**
 * All available store items
 * This is the SINGLE SOURCE OF TRUTH for store items.
 * Demo generator uses this list to ensure consistency.
 */
export const storeItems: ShopItem[] = [
  // Food & Supplies
  {
    id: 1,
    name: 'Basic Food',
    price: 25,
    category: 'food',
    emoji: '🍖',
    description: 'Basic nutrition for your pet',
    effect: 'Restores hunger +20 when consumed',
    hungerRestore: 20,
    happinessBonus: 2
  },
  {
    id: 2,
    name: 'Premium Food',
    price: 50,
    category: 'food',
    emoji: '🥩',
    description: 'High-quality nutrition',
    effect: 'Restores hunger +35, happiness +8 when consumed',
    hungerRestore: 35,
    happinessBonus: 8
  },
  {
    id: 3,
    name: 'Cleaning Supplies',
    price: 20,
    category: 'supplies',
    emoji: '🧴',
    description: 'Keeps pet clean',
    effect: 'Increases cleanliness +15'
  },
  {
    id: 4,
    name: 'Grooming Kit',
    price: 35,
    category: 'supplies',
    emoji: '✂️',
    description: 'Complete grooming set',
    effect: 'Increases cleanliness +25'
  },
  // Health & Vet
  {
    id: 5,
    name: 'Vet Visit',
    price: 100,
    category: 'health',
    emoji: '🏥',
    description: 'Professional health check',
    effect: 'Increases health +40'
  },
  {
    id: 6,
    name: 'Medicine',
    price: 60,
    category: 'health',
    emoji: '💊',
    description: 'Restores health',
    effect: 'Increases health +30'
  },
  {
    id: 7,
    name: 'Checkup Package',
    price: 80,
    category: 'health',
    emoji: '📋',
    description: 'Complete health checkup',
    effect: 'Increases health +25, happiness +5'
  },
  // Toys & Activity Passes
  {
    id: 8,
    name: 'Chew Toy',
    price: 15,
    category: 'toys',
    emoji: '🦴',
    description: 'Fun playtime activity',
    effect: 'Increases happiness +10'
  },
  {
    id: 9,
    name: 'Ball',
    price: 20,
    category: 'toys',
    emoji: '⚽',
    description: 'Interactive play toy',
    effect: 'Increases happiness +15'
  },
  {
    id: 10,
    name: 'Puzzle Toy',
    price: 30,
    category: 'toys',
    emoji: '🧩',
    description: 'Mental stimulation',
    effect: 'Increases happiness +20, XP +2'
  },
  {
    id: 11,
    name: 'Spa Ticket',
    price: 15,
    category: 'activity',
    emoji: '🎫',
    description: 'Ticket for spa day activity',
    effect: 'Use in Activities tab'
  },
  {
    id: 12,
    name: 'Park Ticket',
    price: 12,
    category: 'activity',
    emoji: '🎟️',
    description: 'Ticket for park trip activity',
    effect: 'Use in Activities tab'
  }
]

/**
 * Get items by category
 */
export function getItemsByCategory(category: string): ShopItem[] {
  return storeItems.filter(item => item.category === category)
}

/**
 * Get item by ID
 */
export function getItemById(id: number): ShopItem | undefined {
  return storeItems.find(item => item.id === id)
}

// ============================================================================
// QUEST TEMPLATES
// ============================================================================

/**
 * Gets default daily quests
 * 
 * Reward scaling by difficulty:
 * - Easy (1 action): 20 coins, 1 XP
 * - Medium (2-3 actions): 30 coins, 2-3 XP
 * - Hard (multi-step): 45 coins, 5 XP
 */
export function getDefaultQuests(): QuestSystem {
  const today = new Date().toISOString().split('T')[0]
  
  return {
    daily: [
      { id: 'clean_pet', goal: 1, progress: 0, rewardCoins: 20, rewardXp: 1 },
      { id: 'play_pet', goal: 2, progress: 0, rewardCoins: 30, rewardXp: 2 },
      { id: 'feed_pet', goal: 3, progress: 0, rewardCoins: 30, rewardXp: 3 },
      { id: 'health_check', goal: 1, progress: 0, rewardCoins: 45, rewardXp: 5 }
    ],
    lastReset: today
  }
}

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

/**
 * Badge definitions - All achievement badges
 */
export const badgeDefinitions: Record<string, Badge> = {
  first_purchase: {
    id: 'first_purchase',
    name: 'First Purchase',
    description: 'Spent any coins',
    emoji: '🛒',
    color: 'text-[#5A4632]',
    bgColor: 'bg-[#FFD782]',
    category: 'financial'
  },
  budget_starter: {
    id: 'budget_starter',
    name: 'Budget Starter',
    description: 'Total spend >= 100 coins',
    emoji: '💰',
    color: 'text-[#5A4632]',
    bgColor: 'bg-[#FFD782]',
    category: 'financial'
  },
  healthy_pet: {
    id: 'healthy_pet',
    name: 'Healthy Pet',
    description: 'Health >= 90 for 24h',
    emoji: '💚',
    color: 'text-[#5A4632]',
    bgColor: 'bg-[#C8E6C9]',
    category: 'care'
  },
  clean_freak: {
    id: 'clean_freak',
    name: 'Clean Freak',
    description: 'Cleanliness >= 95',
    emoji: '✨',
    color: 'text-[#5A4632]',
    bgColor: 'bg-[#E1F5FE]',
    category: 'care'
  },
  task_master: {
    id: 'task_master',
    name: 'Task Master',
    description: 'Complete 5 daily quests',
    emoji: '✅',
    color: 'text-[#5A4632]',
    bgColor: 'bg-[#FFF9C4]',
    category: 'milestone'
  },
  growing_up: {
    id: 'growing_up',
    name: 'Growing Up',
    description: 'Reach Young stage (ageStage 1)',
    emoji: '🌱',
    color: 'text-[#5A4632]',
    bgColor: 'bg-[#C8E6C9]',
    category: 'milestone'
  },
  smart_shopper: {
    id: 'smart_shopper',
    name: 'Smart Shopper',
    description: 'Buy 3 different categories',
    emoji: '🛍️',
    color: 'text-[#5A4632]',
    bgColor: 'bg-[#FFD782]',
    category: 'financial'
  }
}

// Export as "badges" for backward compatibility
export const badges = badgeDefinitions

/**
 * Get badge by ID
 */
export function getBadge(badgeId: string): Badge | undefined {
  return badgeDefinitions[badgeId]
}

/**
 * Get all badges
 */
export function getAllBadges(): Record<string, Badge> {
  return badgeDefinitions
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

/**
 * All available tasks for earning coins
 */
export const tasks: Task[] = [
  {
    id: 'clean_room',
    name: "Clean your pet's room",
    description: 'Tidy up your pet\'s living space',
    emoji: '🧹',
    coins: 15,
    category: 'chore',
    cooldownSeconds: 60
  },
  {
    id: 'training',
    name: 'Do training with your pet',
    description: 'Practice tricks and commands',
    emoji: '🎓',
    coins: 18,
    category: 'training',
    cooldownSeconds: 90
  },
  {
    id: 'pet_walking',
    name: 'Pet walking task',
    description: 'Take your pet for a walk',
    emoji: '🚶',
    coins: 20,
    category: 'walking',
    cooldownSeconds: 120
  },
  {
    id: 'grooming',
    name: 'Grooming session',
    description: 'Brush and groom your pet',
    emoji: '💇',
    coins: 15,
    category: 'chore',
    cooldownSeconds: 60
  }
]

/**
 * Get all tasks
 */
export function getAllTasks(): Task[] {
  return tasks
}

/**
 * Get task by ID
 */
export function getTask(taskId: string): Task | undefined {
  return tasks.find(t => t.id === taskId)
}

/**
 * Complete a task and return earning info
 */
export function completeTask(taskId: string): { amount: number; description: string; timestamp: number; source: string } | null {
  const task = tasks.find(t => t.id === taskId)
  if (!task) return null
  
  return {
    amount: task.coins,
    description: `Completed task: ${task.name}`,
    timestamp: Date.now(),
    source: task.name
  }
}

/**
 * Check if task can be done (cooldown expired)
 */
export function canDoTask(task: Task, taskState: TaskState | undefined): boolean {
  if (!taskState || !taskState.lastCompletedAt) {
    return true
  }
  
  const now = Date.now()
  const elapsed = (now - taskState.lastCompletedAt) / 1000
  return elapsed >= task.cooldownSeconds
}

/**
 * Get time remaining until task can be done again
 */
export function timeRemaining(task: Task, taskState: TaskState | undefined): number {
  if (!taskState || !taskState.lastCompletedAt) {
    return 0
  }
  
  const now = Date.now()
  const elapsed = (now - taskState.lastCompletedAt) / 1000
  const remaining = task.cooldownSeconds - elapsed
  return Math.max(0, Math.ceil(remaining))
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Weekly Allowance
 */
export const WEEKLY_ALLOWANCE_AMOUNT = 70
export const ALLOWANCE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Daily Check-In
 */
export const DAILY_CHECKIN_COINS_MIN = 12
export const DAILY_CHECKIN_COINS_MAX = 15
export const DAILY_CHECKIN_XP = 1
export const DAILY_CHECKIN_COINS = DAILY_CHECKIN_COINS_MIN // Legacy export

/**
 * Get daily check-in coin reward (randomized)
 */
export function getDailyCheckInCoins(): number {
  return DAILY_CHECKIN_COINS_MIN + Math.floor(Math.random() * (DAILY_CHECKIN_COINS_MAX - DAILY_CHECKIN_COINS_MIN + 1))
}

/**
 * Get today's date key (YYYY-MM-DD)
 */
export function getTodayKey(now: number): string {
  return new Date(now).toLocaleDateString('en-CA')
}

// ============================================================================
// AGE STAGE SYSTEM (FBLA-SAFE)
// ============================================================================

/**
 * Age Stage Labels - Human-readable names for each stage
 * 
 * FOR JUDGES:
 * Simple, clear progression: Baby → Young → Adult → Mature
 */
export const AGE_LABELS: Record<AgeStage, string> = {
  0: "Baby",
  1: "Young",
  2: "Adult",
  3: "Mature"
}

/**
 * Get Age Stage from XP
 * 
 * FOR JUDGES:
 * Simple numeric progression based on XP thresholds:
 * - 0 XP = Baby (ageStage 0)
 * - 20 XP = Young (ageStage 1)
 * - 60 XP = Adult (ageStage 2)
 * - 120 XP = Mature (ageStage 3)
 * 
 * This is the ONLY function that determines age stage.
 * Age stage is computed from XP, not stored separately.
 * 
 * @param xp - Pet's current XP
 * @returns Age stage (0-3)
 */
export function getAgeStage(xp: number): AgeStage {
  if (xp >= 120) return 3
  if (xp >= 60) return 2
  if (xp >= 20) return 1
  return 0
}

/**
 * Get Pet Emoji by Type and Age Stage
 * 
 * FOR JUDGES:
 * Simple emoji placeholders for each pet type and age stage.
 * Later these can be replaced with custom sprites.
 * 
 * @param petType - Pet type (cat, dog, rabbit)
 * @param ageStage - Age stage (0-3)
 * @returns Emoji for the pet
 */
export function getPetEmoji(petType: PetType, ageStage: AgeStage): string {
  if (petType === 'cat') {
    if (ageStage === 0) return '🐱'
    if (ageStage === 1) return '🐈'
    if (ageStage === 2) return '😺'
    return '😼'
  }
  if (petType === 'dog') {
    if (ageStage === 0) return '🐶'
    if (ageStage === 1) return '🐕'
    if (ageStage === 2) return '😄'
    return '🐾'
  }
  if (petType === 'rabbit') {
    if (ageStage === 0) return '🐰'
    if (ageStage === 1) return '🐇'
    if (ageStage === 2) return '😊'
    return '🌟'
  }
  return '🐾' // Default fallback
}

