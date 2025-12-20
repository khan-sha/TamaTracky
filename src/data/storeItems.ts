/**
 * Store Items - Single Source of Truth
 * 
 * This file contains the EXACT list of items available in the Store.
 * Both the Store UI and demo generator MUST use this list to ensure consistency.
 * 
 * IMPORTANT: Demo mode expense history is generated from these items only.
 * This ensures demo reports match real gameplay and show accurate categories/prices.
 */

import { ShopItem } from '../core/types'

/**
 * All available store items
 * 
 * This is the SINGLE SOURCE OF TRUTH for store items.
 * Demo generator imports from here to ensure consistency.
 */
export const storeItems: ShopItem[] = [
  // A) Food & Supplies
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
  
  // B) Health & Vet
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
  
  // C) Toys & Activity Passes
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










