/**
 * Reward System Module
 * 
 * This module handles all reward systems:
 * - Mini-game rewards (coins, stats, XP)
 * - Weekly allowance system
 * - Daily check-in rewards
 * - Income tracking for reports
 * 
 * RESPONSIBILITY: All reward processing and income tracking
 */

import { PetData, MiniGameReward } from './types'
import { giveXP } from './pet'
import { clamp } from './utils'

/**
 * Reward Application Result
 */
export interface RewardResult {
  success: boolean
  pet: PetData
  incomeRecord: {
    id: string
    timestamp: number
    amount: number
    description: string
    source: string
  } | null
}

/**
 * Applies a mini-game reward to the pet
 * 
 * This function:
 * 1. Adds coins (if reward includes coins)
 * 2. Increases stats (happiness, cleanliness)
 * 3. Adds XP (if reward includes XP)
 * 4. Logs the earning for reports
 * 
 * IMPORTANT: This only runs after user confirms the reward.
 * Mini-games should NOT modify coins/stats directly.
 * 
 * @param pet - Pet to apply reward to
 * @param reward - Reward object from mini-game
 * @returns Updated pet and income record
 */
export function applyReward(pet: PetData, reward: MiniGameReward): RewardResult {
  const newPet = { ...pet }
  let incomeRecord: RewardResult['incomeRecord'] = null
  
  // Apply coins reward and log as income
  if (reward.coins && reward.coins > 0) {
    // This checks if player can afford the item (validation)
    newPet.coins = Math.max(0, newPet.coins + reward.coins)
    newPet.lifetimeEarnings = (newPet.lifetimeEarnings || 0) + reward.coins
    
    // This logs the earning for reports (FBLA requirement)
    incomeRecord = {
      id: `income_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      amount: reward.coins,
      description: `Mini-game reward: ${reward.coins} coins`,
      source: 'Mini-Game'
    }
  }
  
  // Apply stat improvements
  newPet.stats = { ...pet.stats }
  
  // This gives the pet happiness after a purchase/reward
  if (reward.happiness && reward.happiness > 0) {
    newPet.stats.happiness = clamp(pet.stats.happiness + reward.happiness)
  }
  
  // This gives the pet cleanliness after cleaning reward
  if (reward.clean && reward.clean > 0) {
    newPet.stats.cleanliness = clamp(pet.stats.cleanliness + reward.clean)
  }
  
  // Apply XP reward
  if (reward.xp && reward.xp > 0) {
    const xpPet = giveXP(newPet, reward.xp)
    newPet.xp = xpPet.xp
    newPet.ageStage = xpPet.ageStage // Use ageStage instead of stage
    newPet.evolved = xpPet.evolved
  }
  
  newPet.lastUpdated = Date.now()
  
  return {
    success: true,
    pet: newPet,
    incomeRecord
  }
}

// ============================================================================
// === WEEKLY ALLOWANCE SYSTEM ===
// ============================================================================

/**
 * Weekly allowance amount (configurable)
 */
export const WEEKLY_ALLOWANCE_AMOUNT = 70

/**
 * Cooldown period in milliseconds (7 days)
 */
export const ALLOWANCE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Checks if the user can claim their weekly allowance
 * 
 * @param now - Current timestamp (Date.now())
 * @param lastClaim - Timestamp of last claim (undefined if never claimed)
 * @returns True if allowance can be claimed, false otherwise
 */
export function canClaimAllowance(now: number, lastClaim: number | undefined): boolean {
  if (lastClaim === undefined) {
    return true
  }
  const timeElapsed = now - lastClaim
  return timeElapsed >= ALLOWANCE_COOLDOWN_MS
}

/**
 * Calculates time remaining until next allowance can be claimed
 * 
 * @param now - Current timestamp (Date.now())
 * @param lastClaim - Timestamp of last claim (undefined if never claimed)
 * @returns Object with days, hours, minutes, and formatted string
 */
export function timeUntilAllowance(now: number, lastClaim: number | undefined): {
  days: number
  hours: number
  minutes: number
  formatted: string
  canClaim: boolean
} {
  if (lastClaim === undefined || canClaimAllowance(now, lastClaim)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      formatted: 'Available now',
      canClaim: true
    }
  }
  
  const timeElapsed = now - lastClaim
  const timeRemaining = ALLOWANCE_COOLDOWN_MS - timeElapsed
  
  const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))
  
  let formatted = ''
  if (days > 0) {
    formatted = `${days}d ${hours}h`
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m`
  } else {
    formatted = `${minutes}m`
  }
  
  return {
    days,
    hours,
    minutes,
    formatted: `Next allowance in ${formatted}`,
    canClaim: false
  }
}

/**
 * Claims the weekly allowance
 * 
 * @param pet - Pet to give allowance to
 * @param now - Current timestamp
 * @param lastClaim - Previous claim timestamp (undefined if never claimed)
 * @returns Updated pet, income record, and new lastClaim timestamp, or null if can't claim
 */
export function claimAllowance(
  pet: any,
  now: number,
  lastClaim: number | undefined
): {
  pet: any
  incomeRecord: {
    id: string
    timestamp: number
    amount: number
    description: string
    source: string
  }
  lastClaim: number
} | null {
  if (!canClaimAllowance(now, lastClaim)) {
    return null
  }
  
  const newPet = { ...pet }
  newPet.coins = (newPet.coins || 0) + WEEKLY_ALLOWANCE_AMOUNT
  newPet.lifetimeEarnings = (newPet.lifetimeEarnings || 0) + WEEKLY_ALLOWANCE_AMOUNT
  newPet.lastUpdated = now
  
  const incomeRecord = {
    id: `income_allowance_${now}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: now,
    amount: WEEKLY_ALLOWANCE_AMOUNT,
    description: `Weekly Allowance: ${WEEKLY_ALLOWANCE_AMOUNT} coins`,
    source: 'Weekly Allowance'
  }
  
  return {
    pet: newPet,
    incomeRecord,
    lastClaim: now
  }
}

// ============================================================================
// === DAILY CHECK-IN SYSTEM ===
// ============================================================================

/**
 * Daily Check-In Reward Amounts
 */
export const DAILY_CHECKIN_COINS_MIN = 12
export const DAILY_CHECKIN_COINS_MAX = 15
export const DAILY_CHECKIN_XP = 1

/**
 * Gets daily check-in coin reward (randomized between min and max)
 */
export function getDailyCheckInCoins(): number {
  return DAILY_CHECKIN_COINS_MIN + Math.floor(Math.random() * (DAILY_CHECKIN_COINS_MAX - DAILY_CHECKIN_COINS_MIN + 1))
}

/**
 * Legacy export for backward compatibility
 */
export const DAILY_CHECKIN_COINS = DAILY_CHECKIN_COINS_MIN

/**
 * Gets today's date as a string in YYYY-MM-DD format
 * 
 * @param now - Current timestamp (Date.now())
 * @returns Date string in YYYY-MM-DD format
 */
export function getTodayKey(now: number): string {
  return new Date(now).toLocaleDateString('en-CA')
}

/**
 * Checks if the daily check-in reward is available
 * 
 * @param now - Current timestamp (Date.now())
 * @param lastCheckIn - Date string (YYYY-MM-DD) of last check-in
 * @returns True if check-in is available, false otherwise
 */
export function isDailyCheckInAvailable(now: number, lastCheckIn: string | undefined): boolean {
  if (!lastCheckIn) {
    return true
  }
  const today = getTodayKey(now)
  return lastCheckIn !== today
}

/**
 * Processes the claim for the daily check-in reward
 * 
 * @param pet - The current pet data
 * @param now - Current timestamp (Date.now())
 * @param lastCheckIn - Date string (YYYY-MM-DD) of last check-in
 * @returns An object containing the updated pet, income record, and new lastCheckIn date, or null if claim failed
 */
export function claimDailyCheckIn(
  pet: any,
  now: number,
  lastCheckIn: string | undefined
): { pet: any; incomeRecord: { id: string; timestamp: number; amount: number; description: string; source: string; type: 'income' }; lastCheckIn: string } | null {
  if (!isDailyCheckInAvailable(now, lastCheckIn)) {
    return null
  }
  
  const today = getTodayKey(now)
  const coinsReward = getDailyCheckInCoins()
  
  const newPet = { ...pet }
  newPet.coins = (newPet.coins || 0) + coinsReward
  newPet.lifetimeEarnings = (newPet.lifetimeEarnings || 0) + coinsReward
  
  const incomeRecord = {
    id: `income_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    amount: coinsReward,
    description: 'Daily Check-In Reward',
    source: 'Daily Check-In',
    type: 'income' as const
  }
  
  return { pet: newPet, incomeRecord, lastCheckIn: today }
}

