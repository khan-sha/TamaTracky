import { PetData, ShopItem } from './types'
import { clamp } from './utils'
import { storeItems } from '../data/storeItems'

export { storeItems as shopItems }

export interface PurchaseResult {
  success: boolean
  pet: PetData
  message: string
}

export function buyItem(pet: PetData, item: ShopItem): PurchaseResult {
  if (pet.coins < item.price) {
    return {
      success: false,
      pet,
      message: `Not enough coins! You need ${item.price} but only have ${pet.coins}.`
    }
  }
  
  const newPet = { ...pet }
  newPet.coins -= item.price
  
  if (!newPet.inventory) {
    newPet.inventory = {}
  }
  
  newPet.inventory[item.id] = (newPet.inventory[item.id] || 0) + 1
  newPet.stats = { ...pet.stats }
  
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
    newPet.stats.happiness = clamp(pet.stats.happiness + 2)
  }
  
  let expenseType: 'food' | 'toy' | 'healthcare' | 'supplies' | 'purchase' | 'activity' = 'purchase'
  if (item.category === 'food') expenseType = 'food'
  else if (item.category === 'toys') expenseType = 'toy'
  else if (item.category === 'health') expenseType = 'healthcare'
  else if (item.category === 'supplies') expenseType = 'supplies'
  else if (item.category === 'activity') expenseType = 'activity'
  
  const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  
  newPet.expenses = [...pet.expenses, {
    id: expenseId,
    timestamp: Date.now(),
    amount: item.price,
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

