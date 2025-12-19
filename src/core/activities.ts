/**
 * Activities Module
 * 
 * This module handles paid activities and free care actions.
 * 
 * RESPONSIBILITY: Activity purchases and free care actions
 */

import { PetData } from './types'
import { applyTimeDecay, giveXP } from './pet'
import { logExpense } from './expenses'
import { spendCoins } from './money'
import { clamp } from './utils'
import { updateMood } from './pet'

/**
 * Free Care Action Result
 */
export interface FreeCareResult {
  success: boolean
  pet: PetData
  message?: string
}

/**
 * Feed at Home (FREE)
 * 
 * This is a free action that updates stats but does NOT cost coins.
 * NO expense is logged UNLESS they explicitly consume an item from inventory.
 * 
 * @param pet - Pet to feed
 * @returns Updated pet
 */
export function feedAtHome(pet: PetData): FreeCareResult {
  // Apply decay before action (normal mode - activities don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  
  const newPet = { ...pet }
  newPet.stats = { ...pet.stats }
  newPet.stats.hunger = clamp(pet.stats.hunger + 20)
  newPet.stats.happiness = clamp(pet.stats.happiness + 3)
  newPet.stats.cleanliness = clamp(pet.stats.cleanliness - 2)
  
  // Add XP
  const petWithXP = giveXP(newPet, 2)
  
  // Update mood (mood is calculated when needed, not stored)
  updateMood(petWithXP.stats)
  
  petWithXP.lastUpdated = Date.now()
  
  return { success: true, pet: petWithXP }
}

/**
 * Clean / Brush (FREE)
 * 
 * This is a free action that updates stats but does NOT cost coins.
 * 
 * Effects (standardized):
 * - cleanliness +30
 * - happiness +2
 * - xp +1
 * 
 * @param pet - Pet to clean
 * @returns Updated pet
 */
export function cleanFree(pet: PetData): FreeCareResult {
  // Apply decay before action (normal mode - activities don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  
  const newPet = { ...pet }
  newPet.stats = { ...pet.stats }
  newPet.stats.cleanliness = clamp(pet.stats.cleanliness + 30)
  newPet.stats.happiness = clamp(pet.stats.happiness + 2)
  
  // Add XP
  const petWithXP = giveXP(newPet, 1)
  
  // Update mood (mood is calculated when needed, not stored)
  updateMood(petWithXP.stats)
  
  petWithXP.lastUpdated = Date.now()
  
  return { success: true, pet: petWithXP }
}

/**
 * Rest / Sleep (FREE)
 * 
 * This is a free action that updates stats but does NOT cost coins.
 * 
 * @param pet - Pet to let rest
 * @returns Updated pet
 */
export function restFree(pet: PetData): FreeCareResult {
  // Apply decay before action (normal mode - activities don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  
  const newPet = { ...pet }
  newPet.stats = { ...pet.stats }
  newPet.stats.energy = clamp(pet.stats.energy + 25)
  newPet.stats.hunger = clamp(pet.stats.hunger - 3)
  
  // Add XP
  const petWithXP = giveXP(newPet, 1)
  
  // Update mood (mood is calculated when needed, not stored)
  updateMood(petWithXP.stats)
  
  petWithXP.lastUpdated = Date.now()
  
  return { success: true, pet: petWithXP }
}

/**
 * Health Check (FREE)
 * 
 * This is a free action that updates stats but does NOT cost coins.
 * 
 * Effects (standardized):
 * - if health < 70: health +15
 * - else: health +5
 * - happiness -1 (checkup is not fun)
 * - xp +1
 * 
 * @param pet - Pet to check
 * @returns Updated pet
 */
export function healthCheckFree(pet: PetData): FreeCareResult {
  // Apply decay before action (normal mode - activities don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  
  const newPet = { ...pet }
  newPet.stats = { ...pet.stats }
  
  // Health check effect
  if (pet.stats.health < 70) {
    newPet.stats.health = clamp(pet.stats.health + 15)
  } else {
    newPet.stats.health = clamp(pet.stats.health + 5)
  }
  newPet.stats.happiness = clamp(pet.stats.happiness - 1)
  
  // Add XP
  const petWithXP = giveXP(newPet, 1)
  
  // Update mood (mood is calculated when needed, not stored)
  updateMood(petWithXP.stats)
  
  petWithXP.lastUpdated = Date.now()
  
  return { success: true, pet: petWithXP }
}

/**
 * Paid Activity Result
 */
export interface PaidActivityResult {
  success: boolean
  pet: PetData
  message: string
}

/**
 * Pet Spa Day (PAID ACTIVITY)
 * 
 * This is a paid activity purchase.
 * Check if coins >= cost. If not: show "Not enough coins" message.
 * If yes: coins -= cost, logExpense("activity", cost), update stats and mood.
 * 
 * @param pet - Pet to treat
 * @param cost - Cost in coins (default: 15)
 * @returns Activity result
 */
export function petSpaDay(pet: PetData, cost: number = 15): PaidActivityResult {
  // Apply decay before action (normal mode - activities don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  
  // Validate cost is positive
  if (cost <= 0) {
    return {
      success: false,
      pet,
      message: `Invalid cost: ${cost}. Cost must be greater than 0.`
    }
  }
  
  // Spend coins safely
  const spendResult = spendCoins(pet, cost, 'Pet Spa Day')
  if (!spendResult.success) {
    return {
      success: false,
      pet: spendResult.pet,
      message: spendResult.message || 'Not enough coins!'
    }
  }
  
  let newPet = spendResult.pet
  
  // Update stats: happiness + large amount, cleanliness + medium amount
  newPet.stats = { ...pet.stats }
  newPet.stats.happiness = clamp(pet.stats.happiness + 30)
  newPet.stats.cleanliness = clamp(pet.stats.cleanliness + 25)
  newPet.stats.health = clamp(pet.stats.health + 5)
  
  // Optionally add small XP
  const petWithXP = giveXP(newPet, 2)
  
  // Log expense as "activity" type with positive amount
  const petWithExpense = logExpense(petWithXP, 'activity', cost, 'Pet Spa Day')
  
  // Mood will be recalculated from stats when needed (via updateMood)
  petWithExpense.lastUpdated = Date.now()
  
  return {
    success: true,
    pet: petWithExpense,
    message: `Pet enjoyed the spa day! Happiness and cleanliness increased.`
  }
}

/**
 * Training Class (PAID ACTIVITY)
 * 
 * This is a paid activity purchase.
 * 
 * @param pet - Pet to train
 * @param cost - Cost in coins (default: 10)
 * @returns Activity result
 */
export function trainingClass(pet: PetData, cost: number = 10): PaidActivityResult {
  // Apply decay before action (normal mode - activities don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  
  // Validate cost is positive
  if (cost <= 0) {
    return {
      success: false,
      pet,
      message: `Invalid cost: ${cost}. Cost must be greater than 0.`
    }
  }
  
  // Spend coins safely
  const spendResult = spendCoins(pet, cost, 'Training Class')
  if (!spendResult.success) {
    return {
      success: false,
      pet: spendResult.pet,
      message: spendResult.message || 'Not enough coins!'
    }
  }
  
  let newPet = spendResult.pet
  
  newPet.stats = { ...pet.stats }
  newPet.stats.happiness = clamp(pet.stats.happiness + 20)
  newPet.stats.energy = clamp(pet.stats.energy + 10)
  
  const petWithXP = giveXP(newPet, 3)
  
  // Log expense as "activity" type with positive amount
  const petWithExpense = logExpense(petWithXP, 'activity', cost, 'Training Class')
  
  // Mood will be recalculated from stats when needed (via updateMood)
  petWithExpense.lastUpdated = Date.now()
  
  return {
    success: true,
    pet: petWithExpense,
    message: `Training class completed! Pet learned new tricks.`
  }
}

/**
 * Park Trip (PAID ACTIVITY)
 * 
 * This is a paid activity purchase.
 * 
 * @param pet - Pet to take to park
 * @param cost - Cost in coins (default: 12)
 * @returns Activity result
 */
export function parkTrip(pet: PetData, cost: number = 12): PaidActivityResult {
  // Apply decay before action (normal mode - activities don't know about demo mode)
  pet = applyTimeDecay(pet, Date.now(), 1.0)
  
  // Validate cost is positive
  if (cost <= 0) {
    return {
      success: false,
      pet,
      message: `Invalid cost: ${cost}. Cost must be greater than 0.`
    }
  }
  
  // Spend coins safely
  const spendResult = spendCoins(pet, cost, 'Park Trip')
  if (!spendResult.success) {
    return {
      success: false,
      pet: spendResult.pet,
      message: spendResult.message || 'Not enough coins!'
    }
  }
  
  let newPet = spendResult.pet
  
  newPet.stats = { ...pet.stats }
  newPet.stats.happiness = clamp(pet.stats.happiness + 25)
  newPet.stats.energy = clamp(pet.stats.energy - 5)
  newPet.stats.health = clamp(pet.stats.health + 3)
  
  const petWithXP = giveXP(newPet, 2)
  
  // Log expense as "activity" type with positive amount
  const petWithExpense = logExpense(petWithXP, 'activity', cost, 'Park Trip')
  
  // Mood will be recalculated from stats when needed (via updateMood)
  petWithExpense.lastUpdated = Date.now()
  
  return {
    success: true,
    pet: petWithExpense,
    message: `Park trip was fun! Pet is happy and healthy.`
  }
}

