/**
 * Shop System Module
 * 
 * This module handles the in-game shop:
 * - Shop item definitions
 * - Purchasing items
 * - Applying item effects to pet stats
 * 
 * RESPONSIBILITY: Shop functionality and item management
 */

import { PetData, ShopItem } from './types'
import { clamp } from './utils'
import { storeItems } from '../data/storeItems'

/**
 * All available shop items
 * 
 * IMPORTANT: Items are imported from src/data/storeItems.ts (single source of truth).
 * This ensures Store UI and demo generator use the same items for consistency.
 */
export { storeItems as shopItems }

/**
 * Purchase Result - Return type for buyItem
 */
export interface PurchaseResult {
  success: boolean
  pet: PetData
  message: string
}

/**
 * Buys an item from the shop
 * 
 * FBLA COMPLIANT PURCHASE FLOW:
 * 1. Check balance (if coins < item.price, return error)
 * 2. Subtract coins (coins -= item.price)
 * 3. Add item to inventory (inventory[item.id]++)
 * 4. Log expense (with type and category for reports)
 * 5. Apply item effect to pet stats
 * 
 * @param pet - Pet making the purchase
 * @param item - Item to purchase
 * @returns Purchase result with updated pet and expense record
 */
export function buyItem(pet: PetData, item: ShopItem): PurchaseResult {
  // This checks if player can afford the item
  if (pet.coins < item.price) {
    return {
      success: false,
      pet,
      message: `Not enough coins! You need ${item.price} but only have ${pet.coins}.`
    }
  }
  
  const newPet = { ...pet }
  
  // This subtracts coins safely
  newPet.coins -= item.price
  
  // Ensure inventory exists
  if (!newPet.inventory) {
    newPet.inventory = {}
  }
  
  // Add item to inventory (FBLA requirement)
  // IMPORTANT: Food items are NOT consumed immediately - they go to inventory
  // The user must use the "Feed" action to consume food from inventory
  // This teaches financial responsibility by separating purchase from consumption
  newPet.inventory[item.id] = (newPet.inventory[item.id] || 0) + 1
  
  // Apply item effect to pet stats (only for non-food items)
  // Food items are NOT consumed on purchase - they must be fed separately
  // This teaches planning: users must buy food BEFORE feeding
  newPet.stats = { ...pet.stats }
  
  // Non-food items apply effects immediately
  if (item.category === 'toys') {
    if (item.name.includes('Puzzle')) {
      newPet.stats.happiness = clamp(pet.stats.happiness + 20)
    } else if (item.name.includes('Ball')) {
      newPet.stats.happiness = clamp(pet.stats.happiness + 15)
    } else {
      newPet.stats.happiness = clamp(pet.stats.happiness + 10)
    }
  } else if (item.category === 'health') {
    if (item.name.includes('Vet Visit')) {
      newPet.stats.health = clamp(pet.stats.health + 40)
    } else if (item.name.includes('Medicine')) {
      newPet.stats.health = clamp(pet.stats.health + 30)
    } else if (item.name.includes('Checkup')) {
      newPet.stats.health = clamp(pet.stats.health + 25)
      newPet.stats.happiness = clamp(pet.stats.happiness + 5)
    }
  } else if (item.category === 'supplies') {
    if (item.name.includes('Grooming')) {
      newPet.stats.cleanliness = clamp(pet.stats.cleanliness + 25)
    } else {
      newPet.stats.cleanliness = clamp(pet.stats.cleanliness + 15)
    }
  } else if (item.category === 'activity') {
    // Activity passes don't give immediate stats, they're used in Activities tab
    newPet.stats.happiness = clamp(pet.stats.happiness + 2)
  }
  
  // This logs the care cost for reports (FBLA requirement)
  // Determine expense type based on category
  let expenseType: 'food' | 'toy' | 'healthcare' | 'supplies' | 'purchase' | 'activity' = 'purchase'
  if (item.category === 'food') expenseType = 'food'
  else if (item.category === 'toys') expenseType = 'toy'
  else if (item.category === 'health') expenseType = 'healthcare'
  else if (item.category === 'supplies') expenseType = 'supplies'
  else if (item.category === 'activity') expenseType = 'activity'
  
  // This logs the expense with proper category for cost-of-care tracking
  // FBLA REQUIREMENT: All expenses must be logged with correct category for reports
  const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  
  newPet.expenses = [...pet.expenses, {
    id: expenseId,
    timestamp: Date.now(),
    amount: item.price, // Positive amount (FBLA requirement)
    description: `Purchased ${item.name}`,
    type: expenseType,
    itemName: item.name
  }]
  
  newPet.lastUpdated = Date.now()
  
  return {
    success: true,
    pet: newPet,
    message: `Successfully purchased ${item.name}!`
  }
}

