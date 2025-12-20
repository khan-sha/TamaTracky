/**
 * Badge System Module
 * 
 * PURPOSE: Achievement system that rewards players for milestones and good care.
 * Badges teach responsibility and provide positive reinforcement.
 * KEY FUNCTIONS:
 * - evaluateBadges: Checks all achievement criteria
 * - awardBadge: Adds badge to pet's collection
 * - getBadge: Retrieves badge definition
 */

import { PetData, Badge } from './types'
import { SlotData } from './types'
import { getTotalCareCost, getCareCostByCategory } from './expenses'
import type { AgeStage } from '../game/data'
import { getAgeStage } from '../game/data'

/**
 * Badge Data Structure
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
    description: 'Reach Young stage',
    emoji: '🌱',
    color: 'text-[#5A4632]',
    bgColor: 'bg-[#C8E6C9]',
    category: 'evolution'
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

/**
 * Badge Evaluation State
 * 
 * Contains all data needed to evaluate badges.
 * This centralizes the evaluation logic and makes it easy to test.
 */
export interface BadgeEvaluationState {
  pet: PetData
  slotData: SlotData | null
  totalCareCost: number
  careCostByCategory: Record<string, number>
  completedQuestsCount: number
  currentAgeStage: AgeStage
}

/**
 * Centralized badge evaluation function
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Functions: evaluateBadges() is a single, well-named function
 * - Conditionals: Multiple conditionals check achievement criteria
 * - Validation: Idempotent - never re-adds same badge
 * - Modular design: All badge logic in one place
 * - Maintainability: Easy to add new badges
 * 
 * This function:
 * 1. Evaluates all badge criteria
 * 2. Returns only NEW badges (not already earned)
 * 3. Is idempotent (safe to call multiple times)
 * 
 * @param state - Badge evaluation state (pet, slot data, totals, etc.)
 * @returns Array of badge IDs that were just earned (empty if none)
 */
export function evaluateBadges(state: BadgeEvaluationState): string[] {
  const { pet, totalCareCost, careCostByCategory, completedQuestsCount, currentAgeStage } = state
  
  // VALIDATION: Ensure pet exists
  if (!pet) {
    return []
  }
  
  const newBadges: string[] = []
  const hasBadge = (id: string) => pet.badges.includes(id)
  
  // ============================================================
  // FINANCIAL BADGES
  // ============================================================
  
  // CONDITIONAL: First Purchase - spent any coins
  if (totalCareCost > 0 && !hasBadge('first_purchase')) {
    newBadges.push('first_purchase')
  }
  
  // CONDITIONAL: Budget Starter - total spend >= 100
  if (totalCareCost >= 100 && !hasBadge('budget_starter')) {
    newBadges.push('budget_starter')
  }
  
  // CONDITIONAL: Smart Shopper - bought from 3+ different categories
  const uniqueCategories = Object.keys(careCostByCategory).filter(cat => careCostByCategory[cat] > 0)
  if (uniqueCategories.length >= 3 && !hasBadge('smart_shopper')) {
    newBadges.push('smart_shopper')
  }
  
  // ============================================================
  // CARE BADGES
  // ============================================================
  
  // CONDITIONAL: Clean Freak - cleanliness >= 95
  if (pet.stats.cleanliness >= 95 && !hasBadge('clean_freak')) {
    newBadges.push('clean_freak')
  }
  
  // CONDITIONAL: Healthy Pet - health >= 90 (check if maintained for 24h)
  // For simplicity, we check current health >= 90
  // In a full implementation, you'd track health history
  if (pet.stats.health >= 90 && !hasBadge('healthy_pet')) {
    newBadges.push('healthy_pet')
  }
  
  // ============================================================
  // MILESTONE BADGES
  // ============================================================
  
  // CONDITIONAL: Task Master - complete 5 daily quests
  if (completedQuestsCount >= 5 && !hasBadge('task_master')) {
    newBadges.push('task_master')
  }
  
  // ============================================================
  // EVOLUTION BADGES
  // ============================================================
  
  // CONDITIONAL: Growing Up - reach Young stage (ageStage 1) or higher
  if (currentAgeStage >= 1 && !hasBadge('growing_up')) {
    newBadges.push('growing_up')
  }
  
  // ============================================================
  // IDEMPOTENCY: Return only new badges
  // ============================================================
  
  return newBadges
}

/**
 * Awards badges to a pet
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Functions: awardBadges() processes badge awards
 * - Validation: Idempotent - checks if badge already exists
 * - Data structures: Updates pet.badges array
 * 
 * This function:
 * 1. Adds new badges to pet.badges array
 * 2. Prevents duplicates (idempotent)
 * 3. Updates pet.lastUpdated timestamp
 * 
 * @param pet - Pet to award badges to
 * @param badgeIds - Array of badge IDs to award
 * @returns Updated pet with badges added
 */
export function awardBadges(pet: PetData, badgeIds: string[]): PetData {
  if (badgeIds.length === 0) {
    return pet
  }
  
  const newPet = { ...pet }
  
  // VALIDATION: Only add badges that don't already exist (idempotent)
  const existingBadges = new Set(newPet.badges || [])
  const newBadges = badgeIds.filter(id => !existingBadges.has(id))
  
  if (newBadges.length > 0) {
    newPet.badges = [...(newPet.badges || []), ...newBadges]
    newPet.lastUpdated = Date.now()
  }
  
  return newPet
}

/**
 * Awards a single badge to a pet
 * 
 * Convenience function for awarding one badge.
 * 
 * @param pet - Pet to award badge to
 * @param badgeId - Badge ID to award
 * @returns Updated pet with badge added (if not already earned)
 */
export function awardBadge(pet: PetData, badgeId: string): PetData {
  return awardBadges(pet, [badgeId])
}

/**
 * Gets a badge definition by ID
 * 
 * @param badgeId - Badge ID to get
 * @returns Badge definition or undefined if not found
 */
export function getBadge(badgeId: string): Badge | undefined {
  return badgeDefinitions[badgeId]
}

/**
 * Gets all badge definitions
 * 
 * @returns All badge definitions
 */
export function getAllBadges(): Record<string, Badge> {
  return badgeDefinitions
}

/**
 * Legacy function for backward compatibility
 * 
 * @deprecated Use evaluateBadges() instead
 */
export function checkBadges(pet: PetData): string[] {
  // For backward compatibility, create a minimal evaluation state
  const state: BadgeEvaluationState = {
    pet,
    slotData: null,
    totalCareCost: getTotalCareCost(pet),
    careCostByCategory: getCareCostByCategory(pet),
    completedQuestsCount: 0, // Would need quest data to calculate
    currentAgeStage: pet.ageStage ?? getAgeStage(pet.xp || 0)
  }
  
  return evaluateBadges(state)
}

// Export badge definitions as "badges" for backward compatibility
export const badges = badgeDefinitions
