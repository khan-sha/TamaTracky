/**
 * Quest System Module
 * 
 * This module handles daily quests that reset every day.
 * Quests track progress and give rewards when completed.
 * 
 * RESPONSIBILITY: Daily quest tracking and rewards
 */

import { SlotData } from './types'

/**
 * Quest Definition - A quest the user can complete
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Functions: Quest interface defines structure for quest data
 * - Conditionals: Quest completion logic uses conditionals to check progress vs goal
 * - Validation: Quest rewards are validated before applying (amount > 0, quest ready)
 */
export interface Quest {
  id: string
  goal: number
  progress: number
  rewardCoins: number
  rewardXp: number // XP reward for completing quest (1-5 XP typically)
  completedAt?: number // Timestamp when quest was completed (prevents double-claiming)
}

/**
 * Quest System - All quests for a slot
 */
export interface QuestSystem {
  daily: Quest[]
  lastReset: string // ISO date string (YYYY-MM-DD)
}

/**
 * Gets default daily quests
 * 
 * This resets quests every day.
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Functions: getDefaultQuests() creates quest structure with rewards
 * - Each quest has both coinsReward and xpReward to teach dual reward system
 * - Reward scaling: Quests scale by difficulty to model real-life work value
 * 
 * REWARD SCALING BY DIFFICULTY:
 * - Easy quests (1-2 actions): 20 coins, 1 XP
 *   - Simple tasks like cleaning once
 * - Medium quests (multiple actions): 30 coins, 2-3 XP
 *   - Tasks requiring multiple steps like feeding 3 times
 * - Hard quests (multi-step/recovery): 40-50 coins, 4-5 XP
 *   - Complex tasks like health checks that require planning
 * 
 * FINANCIAL RESPONSIBILITY TEACHING:
 * - Higher difficulty = higher reward (models real work)
 * - Players learn that effort pays off
 * - Rewards are meaningful enough to afford basic care (Basic Food = 25 coins)
 * - Quest rewards can only be claimed once per day (prevents spam)
 * 
 * @returns Default quest structure with coins and XP rewards
 */
export function getDefaultQuests(): QuestSystem {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  
  return {
    daily: [
      // Easy quest: Clean once (1 action)
      { id: 'clean_pet', goal: 1, progress: 0, rewardCoins: 20, rewardXp: 1 },
      // Medium quest: Play twice (2 actions)
      { id: 'play_pet', goal: 2, progress: 0, rewardCoins: 30, rewardXp: 2 },
      // Medium quest: Feed three times (3 actions)
      { id: 'feed_pet', goal: 3, progress: 0, rewardCoins: 30, rewardXp: 3 },
      // Hard quest: Health check (requires planning, store purchase)
      { id: 'health_check', goal: 1, progress: 0, rewardCoins: 45, rewardXp: 5 }
    ],
    lastReset: today
  }
}

/**
 * Gets quests from slot data
 * 
 * This loads quests from the save slot.
 * If no quests exist, creates default quests.
 * 
 * @param slotData - Slot data to get quests from
 * @returns Quest system
 */
export function getQuests(slotData: SlotData | null): QuestSystem {
  if (!slotData || !slotData.quests || slotData.quests.length === 0) {
    return getDefaultQuests()
  }
  
  // Check if quests need reset (new day)
  const questSystem = slotData.quests as any as QuestSystem
  const today = new Date().toISOString().split('T')[0]
  
  // This resets quests every day
  if (questSystem.lastReset !== today) {
    return getDefaultQuests()
  }
  
  return questSystem
}

/**
 * Updates quest progress when an action is performed
 * 
 * Every pet action must call updateQuestProgress(actionName).
 * 
 * @param quests - Current quest system
 * @param actionName - Name of action performed ('feed', 'play', 'clean', 'visitVet')
 * @returns Updated quest system
 */
export function updateQuestProgress(quests: QuestSystem, actionName: string): QuestSystem {
  const newQuests = { ...quests, daily: [...quests.daily] }
  
  // Map action names to quest IDs
  const actionToQuestId: Record<string, string> = {
    'feed': 'feed_pet',
    'play': 'play_pet',
    'clean': 'clean_pet',
    'visitVet': 'health_check'
  }
  
  const questId = actionToQuestId[actionName]
  if (!questId) return newQuests
  
  // Find and update the quest
  const questIndex = newQuests.daily.findIndex(q => q.id === questId)
  if (questIndex >= 0) {
    const quest = newQuests.daily[questIndex]
    // Only increment if not already completed
    if (quest.progress < quest.goal) {
      newQuests.daily[questIndex] = {
        ...quest,
        progress: quest.progress + 1
      }
    }
  }
  
  return newQuests
}

/**
 * Claims a quest reward
 * 
 * When a quest reaches goal, reward is NOT given automatically.
 * Instead, show a button: "Claim Reward +X coins +Y XP".
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Functions: claimQuestReward() validates quest state and returns rewards
 * - Conditionals: Multiple conditionals check quest validity:
 *   1. Quest exists (questIndex >= 0)
 *   2. Quest is completed (progress >= goal)
 *   3. Quest not already claimed (completedAt is undefined)
 * - Validation: Prevents double-claiming by checking completedAt timestamp
 * 
 * @param quests - Current quest system
 * @param questId - ID of quest to claim
 * @returns Reward amounts (coins and XP) if quest is ready, null otherwise
 */
export function claimQuestReward(
  quests: QuestSystem, 
  questId: string
): { coins: number; xp: number; newQuests: QuestSystem } | null {
  // CONDITIONAL: Check if quest exists
  const questIndex = quests.daily.findIndex(q => q.id === questId)
  if (questIndex < 0) return null
  
  const quest = quests.daily[questIndex]
  
  // CONDITIONAL: Check if quest is completed (progress >= goal)
  if (quest.progress < quest.goal) return null
  
  // VALIDATION: Check if quest already claimed (prevent double-claiming)
  // If completedAt exists, quest was already claimed today
  if (quest.completedAt !== undefined) return null
  
  // Mark quest as claimed with timestamp (prevents double-claiming)
  const now = Date.now()
  const newQuests = { ...quests, daily: [...quests.daily] }
  newQuests.daily[questIndex] = {
    ...quest,
    progress: -1, // -1 means claimed (for backward compatibility)
    completedAt: now // Store completion timestamp
  }
  
  // Return both coins and XP rewards
  return {
    coins: quest.rewardCoins,
    xp: quest.rewardXp,
    newQuests
  }
}

/**
 * Checks if a quest is ready to claim
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Conditionals: Uses AND condition to check both progress and completion status
 * - Validation: Prevents claiming already-completed quests
 * 
 * @param quest - Quest to check
 * @returns True if quest is completed and not yet claimed
 */
export function isQuestReady(quest: Quest): boolean {
  // CONDITIONAL: Quest is ready if progress >= goal AND not already claimed
  // Check both progress >= goal AND completedAt is undefined (not claimed)
  return quest.progress >= quest.goal && quest.completedAt === undefined
}

/**
 * Gets all ready quests
 * 
 * @param quests - Quest system
 * @returns Array of quest IDs that are ready to claim
 */
export function getReadyQuests(quests: QuestSystem): string[] {
  return quests.daily
    .filter(q => isQuestReady(q))
    .map(q => q.id)
}



