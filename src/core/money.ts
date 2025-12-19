/**
 * Money System Module
 * 
 * PURPOSE: Manages all coin operations (earning, spending, tracking).
 * Separates income tracking from expense tracking for Reports.
 * 
 * KEY FUNCTIONS:
 * - earnCoins: Adds coins and tracks lifetime earnings
 * - spendCoins: Validates and subtracts coins safely
 * - giveCoins: Records income for Reports
 * 
 * ORGANIZATION: Functions grouped by operation type (earn, spend, validate).
 * Income tracking is separate from expenses to enable Reports analysis.
 * This structure demonstrates proper financial data organization.
 */

import { PetData } from './types'

// ============================================================================
// === INCOME / EARNING SYSTEMS ===
// ============================================================================

/**
 * Adds coins to pet (simple addition, no tracking)
 * 
 * @param pet - Pet to add coins to
 * @param amount - Amount of coins to add
 * @returns Pet with updated coins
 */
export function addCoins(pet: PetData, amount: number): PetData {
  const newPet = { ...pet }
  newPet.coins = Math.max(0, newPet.coins + amount)
  newPet.lastUpdated = Date.now()
  return newPet
}

/**
 * Earns coins and tracks lifetime earnings
 * 
 * This is used for income that should be tracked separately from expenses.
 * Lifetime earnings are used for achievements and reports.
 * 
 * @param pet - Pet earning coins
 * @param amount - Amount of coins earned
 * @param description - Description of earnings (optional)
 * @returns Pet with updated coins and lifetime earnings
 */
export function earnCoins(pet: PetData, amount: number, _description: string = 'Earned coins'): PetData {
  const newPet = { ...pet }
  newPet.coins = Math.max(0, newPet.coins + amount)
  newPet.lifetimeEarnings = (newPet.lifetimeEarnings || 0) + amount
  newPet.lastUpdated = Date.now()
  return newPet
}

/**
 * Gives coins with a source for tracking
 * 
 * This lets the user earn coins from chores, quests, or mini-games.
 * All earnings MUST show "Collect Reward" button before applying.
 * 
 * @param pet - Pet to give coins to
 * @param amount - Amount of coins to give
 * @param source - Source of coins: "quest", "task", "minigame", "bonus"
 * @returns Pet with updated coins and income record
 */
export function giveCoins(pet: PetData, amount: number, source: 'quest' | 'task' | 'minigame' | 'bonus'): { pet: PetData; incomeRecord: { id: string; timestamp: number; amount: number; description: string; source: string } } {
  // Enforce amount > 0 (REPORTS FIX: ensure all income is positive)
  if (!amount || amount <= 0) {
    console.warn(`giveCoins: Invalid amount ${amount}, using 0`)
    return { pet, incomeRecord: null as any }
  }
  
  const positiveAmount = Math.abs(amount)
  const newPet = earnCoins(pet, positiveAmount, `Earned ${positiveAmount} coins from ${source}`)
  
  const incomeRecord = {
    id: `income_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    amount: positiveAmount,
    description: `Earned ${positiveAmount} coins from ${source}`,
    source: source
  }
  
  return { pet: newPet, incomeRecord }
}

/**
 * Does a chore to earn coins
 * 
 * Chores are a way to earn small amounts of money.
 * Returns the earning information (not the pet directly).
 * 
 * @returns Chore earning information
 */
export function doChore(): { amount: number; description: string; timestamp: number } {
  const amount = Math.floor(Math.random() * 5) + 1 // 1-5 coins
  const chores = ['doing chores', 'helping around the house', 'completing tasks']
  const desc = chores[Math.floor(Math.random() * chores.length)]
  return {
    amount,
    description: `Earned ${amount} coins by ${desc}`,
    timestamp: Date.now()
  }
}

/**
 * Gets daily reward (once per day per pet)
 * 
 * Daily rewards give 10-20 coins but can only be claimed once per day.
 * Uses localStorage to track if reward was already claimed today.
 * 
 * @param petId - Pet's unique ID
 * @returns Reward information if available, null if already claimed
 */
export function dailyReward(petId: string): { amount: number; description: string; timestamp: number } | null {
  const today = new Date().toLocaleDateString('en-CA')
  const key = `dailyReward_${petId}_${today}`
  
  // Check if already claimed today
  if (localStorage.getItem(key)) return null
  
  // Generate reward
  const amount = Math.floor(Math.random() * 11) + 10 // 10-20 coins
  localStorage.setItem(key, 'claimed')
  
  return {
    amount,
    description: `Daily reward: ${amount} coins`,
    timestamp: Date.now()
  }
}

/**
 * Checks if daily reward was already claimed today
 * 
 * @param petId - Pet's unique ID
 * @returns True if reward was already claimed today
 */
export function isDailyRewardClaimed(petId: string): boolean {
  const today = new Date().toLocaleDateString('en-CA')
  const key = `dailyReward_${petId}_${today}`
  return localStorage.getItem(key) !== null
}

// ============================================================================
// === COST OF CARE / EXPENSE LOG ===
// ============================================================================

/**
 * Spends coins safely (subtracts coins from pet)
 * 
 * This function validates the cost and ensures coins never go negative.
 * Use this instead of directly subtracting coins.
 * 
 * @param pet - Pet to spend coins from
 * @param cost - Cost in coins (must be > 0)
 * @param reason - Reason for spending (for error messages)
 * @returns Object with success flag and updated pet (or original pet if failed)
 */
export function spendCoins(pet: PetData, cost: number, _reason: string): { success: boolean; pet: PetData; message?: string } {
  // Validate cost is positive
  if (cost <= 0) {
    return {
      success: false,
      pet,
      message: `Invalid cost: ${cost}. Cost must be greater than 0.`
    }
  }
  
  // Check if pet has enough coins
  if (pet.coins < cost) {
    return {
      success: false,
      pet,
      message: `Not enough coins! You need ${cost} but only have ${pet.coins}.`
    }
  }
  
  // Subtract coins safely (never negative)
  const newPet = { ...pet }
  newPet.coins = Math.max(0, pet.coins - cost)
  newPet.lastUpdated = Date.now()
  
  return {
    success: true,
    pet: newPet
  }
}

