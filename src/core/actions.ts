/**
 * Pet Actions Module
 * 
 * PURPOSE: Handles all player actions that affect pet stats and cost coins.
 * Each action demonstrates cost-of-care concepts by logging expenses.
 * 
 * KEY FUNCTIONS:
 * - Feed (requires purchased food from inventory)
 * - Play, Rest, Clean (direct coin costs)
 * - Visit Vet (health care costs)
 * 
 * ORGANIZATION: Each action function follows the same pattern:
 * 1. Apply time decay
 * 2. Validate cost/requirements
 * 3. Update stats
 * 4. Log expense for Reports
 * This consistent structure makes the code easy to understand and maintain.
 */

import { PetData } from './types'
import { applyTimeDecay, giveXP } from './pet'
import { logExpense } from './expenses'
import { updateMood } from './pet'
import { clamp } from './utils'
import { shopItems } from './shop'

/**
 * Action Result - Return type for all actions
 */
export interface ActionResult {
  success: boolean
  pet: PetData
  message?: string
}

/**
 * Feeds the pet using food from inventory
 * 
 * FINANCIAL RESPONSIBILITY TEACHING:
 * - Feeding requires food items purchased from the Store
 * - Food must be bought BEFORE feeding (planning ahead)
 * - No direct coin subtraction - cost already paid at purchase
 * - This teaches budgeting and planning for recurring costs
 * 
 * PET CARE ACTION EFFECTS:
 * - Consumes 1 food item from inventory
 * - Applies food's hungerRestore value to hunger stat
 * - Applies food's happinessBonus (if any) to happiness
 * - cleanliness -2 (messy eating - realistic consequence)
 * - xp +2 (care actions give experience)
 * 
 * IMPORTANT: This does NOT subtract coins directly.
 * The cost was already paid when food was purchased.
 * This avoids double-charging and teaches proper accounting.
 * 
 * FBLA Alignment:
 * - Demonstrates recurring costs of pet ownership
 * - Teaches planning and budgeting (buy food before feeding)
 * - Separates purchase from consumption (proper accounting)
 * - No expense logged here (expense logged at purchase time)
 * 
 * @param pet - Pet to feed
 * @param foodItemId - ID of food item to use from inventory (1 = Basic Food, 2 = Premium Food)
 * @returns Action result with updated pet
 */
export function feed(pet: PetData, foodItemId: number = 1): ActionResult {
  // Apply decay before action (normal mode - actions don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  
  // Ensure inventory exists
  if (!pet.inventory) {
    return { 
      success: false, 
      pet,
      message: 'No inventory found. Please purchase food from the Store first.'
    }
  }
  
  // Check if food item exists in inventory
  const foodCount = pet.inventory[foodItemId] || 0
  if (foodCount === 0) {
    return { 
      success: false, 
      pet,
      message: 'No food available. Please purchase food from the Store first.'
    }
  }
  
  // Get food item properties from shop items
  const foodItem = shopItems.find(item => item.id === foodItemId)
  if (!foodItem || foodItem.category !== 'food') {
    return { 
      success: false, 
      pet,
      message: 'Invalid food item. Please use a food item from the Store.'
    }
  }
  
  const hungerRestore = foodItem.hungerRestore || 20
  const happinessBonus = foodItem.happinessBonus || 2
  
  const newPet = { ...pet }
  newPet.stats = { ...pet.stats }
  
  // Consume 1 food item from inventory
  newPet.inventory = { ...pet.inventory }
  newPet.inventory[foodItemId] = foodCount - 1
  
  // Apply food effects
  newPet.stats.hunger = clamp(pet.stats.hunger + hungerRestore)
  newPet.stats.happiness = clamp(pet.stats.happiness + happinessBonus)
  newPet.stats.cleanliness = clamp(pet.stats.cleanliness - 2) // Messy eating
  
  // Add XP
  const petWithXP = giveXP(newPet, 2)
  
  // Update mood (mood is calculated from stats, not stored)
  updateMood(petWithXP.stats)
  
  // IMPORTANT: Do NOT log expense here - expense was logged when food was purchased
  // This teaches proper accounting: cost occurs at purchase, not consumption
  
  petWithXP.lastUpdated = Date.now()
  
  return { 
    success: true, 
    pet: petWithXP,
    message: `Fed pet! Hunger +${hungerRestore}, Happiness +${happinessBonus}`
  }
}

/**
 * Plays with the pet
 * 
 * Effects:
 * - Increases happiness by 25
 * - Decreases energy by 10 (playing is tiring)
 * - Decreases cleanliness by 5 (playing gets dirty)
 * - Costs 30 coins
 * 
 * @param pet - Pet to play with
 * @param cost - Cost in coins (default: 30)
 * @returns Action result with updated pet
 */
export function play(pet: PetData, cost: number = 30): ActionResult {
  // Apply decay before action (normal mode - actions don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  if (pet.coins < cost) return { success: false, pet }
  
  const newPet = { ...pet }
  newPet.coins -= cost
  newPet.stats = { ...pet.stats }
  newPet.stats.happiness = clamp(pet.stats.happiness + 25)
  newPet.stats.energy = clamp(pet.stats.energy - 10)
  newPet.stats.cleanliness = clamp(pet.stats.cleanliness - 5)
  
  // This logs the care cost for reports (FBLA requirement)
  const petWithExpense = logExpense(newPet, 'toy', cost, 'Play with pet')
  
  return { success: true, pet: petWithExpense }
}

/**
 * Lets the pet rest
 * 
 * PET CARE ACTION EFFECTS (standardized):
 * - energy +25 (primary effect - resting restores energy)
 * - hunger -3 (time passes while resting - realistic consequence)
 * - xp +1 (care actions give experience)
 * - Costs coins (financial responsibility)
 * 
 * All stats are clamped to 0-100 range after update.
 * Mood is recalculated from updated stats.
 * Expense is logged for cost-of-care tracking.
 * 
 * @param pet - Pet to let rest
 * @param cost - Cost in coins (default: 20)
 * @returns Action result with updated pet
 */
export function rest(pet: PetData, cost: number = 20): ActionResult {
  // Apply decay before action (normal mode - actions don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  if (pet.coins < cost) return { success: false, pet }
  
  const newPet = { ...pet }
  newPet.coins -= cost
  newPet.stats = { ...pet.stats }
  newPet.stats.energy = clamp(pet.stats.energy + 25)
  newPet.stats.hunger = clamp(pet.stats.hunger - 3)
  
  // Add XP
  const petWithXP = giveXP(newPet, 1)
  
  // Update mood (mood is calculated from stats, not stored)
  updateMood(petWithXP.stats)
  
  // This logs the care cost for reports (FBLA requirement)
  let petWithExpense = petWithXP
  if (cost > 0) {
    petWithExpense = logExpense(petWithXP, 'care', cost, 'Pet rest')
  }
  
  return { success: true, pet: petWithExpense }
}

/**
 * Health check (visits the veterinarian) - PAID SERVICE
 * 
 * FINANCIAL RESPONSIBILITY TEACHING:
 * - Health checks represent veterinary visits and MUST cost money
 * - This teaches users that health care is a recurring expense requiring budgeting
 * - Users must balance care quality vs spending (more expensive = better results)
 * - All health checks log expenses under "healthcare" category for Reports
 * 
 * PET CARE ACTION EFFECTS:
 * - Health restoration based on service level (passed as parameter)
 * - Optional happiness bonus for premium services
 * - Costs coins (financial responsibility)
 * - Logs expense for cost-of-care tracking
 * 
 * IMPORTANT: There is NO free health check. All health services cost money.
 * This reinforces that health care is a real-world expense that requires planning.
 * 
 * @param pet - Pet to take to vet
 * @param cost - Cost in coins (required - no default)
 * @param healthRestore - Amount of health to restore (e.g., 10, 25, 40)
 * @param happinessBonus - Optional happiness bonus (default: 0)
 * @returns Action result with updated pet
 */
export function visitVet(pet: PetData, cost: number, healthRestore: number = 15, happinessBonus: number = 0): ActionResult {
  // Apply decay before action (normal mode - actions don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  
  // Block if insufficient funds - health care requires payment
  if (pet.coins < cost) {
    return { 
      success: false, 
      pet,
      message: `Not enough coins for health care. You need ${cost} coins but only have ${pet.coins}.`
    }
  }
  
  const newPet = { ...pet }
  newPet.coins -= cost
  newPet.stats = { ...pet.stats }
  
  // Apply health restoration (based on service level)
  newPet.stats.health = clamp(pet.stats.health + healthRestore)
  
  // Apply happiness bonus if provided (premium services)
  if (happinessBonus > 0) {
    newPet.stats.happiness = clamp(pet.stats.happiness + happinessBonus)
  } else {
    // Basic checkups are not fun (realistic consequence)
    newPet.stats.happiness = clamp(pet.stats.happiness - 1)
  }
  
  // Add XP
  const petWithXP = giveXP(newPet, 1)
  
  // Update mood (mood is calculated from stats, not stored)
  updateMood(petWithXP.stats)
  
  // Log expense under "healthcare" category for Reports
  // This ensures all health checks appear in Reports under Health/Vet
  const petWithExpense = logExpense(petWithXP, 'healthcare', cost, 'Health care service')
  
  petWithExpense.lastUpdated = Date.now()
  
  return { success: true, pet: petWithExpense }
}

/**
 * Cleans the pet
 * 
 * PET CARE ACTION EFFECTS (standardized):
 * - cleanliness +30 (primary effect - cleaning improves cleanliness)
 * - happiness +2 (pets feel better when clean)
 * - xp +1 (care actions give experience)
 * - Costs coins (financial responsibility)
 * 
 * All stats are clamped to 0-100 range after update.
 * Mood is recalculated from updated stats.
 * Expense is logged for cost-of-care tracking.
 * 
 * @param pet - Pet to clean
 * @param cost - Cost in coins (default: 25)
 * @returns Action result with updated pet
 */
export function clean(pet: PetData, cost: number = 25): ActionResult {
  // Apply decay before action (normal mode - actions don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  if (pet.coins < cost) return { success: false, pet }
  
  const newPet = { ...pet }
  newPet.coins -= cost
  newPet.stats = { ...pet.stats }
  newPet.stats.cleanliness = clamp(pet.stats.cleanliness + 30)
  newPet.stats.happiness = clamp(pet.stats.happiness + 2)
  
  // Add XP
  const petWithXP = giveXP(newPet, 1)
  
  // Update mood (mood is calculated from stats, not stored)
  updateMood(petWithXP.stats)
  
  // This logs the care cost for reports (FBLA requirement)
  const petWithExpense = logExpense(petWithXP, 'supplies', cost, 'Clean pet')
  
  return { success: true, pet: petWithExpense }
}

