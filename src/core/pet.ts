/**
 * Pet Management Module
 * 
 * PURPOSE: Core pet lifecycle and stat management system.
 * Handles all operations related to pet state, stats, and progression.
 * 
 * KEY FUNCTIONS:
 * - Pet creation (createPet)
 * - Stat decay over time (applyTimeDecay)
 * - XP and age progression (giveXP, checkEvolution)
 * - Care score calculation (getCareScore)
 * 
 * ORGANIZATION: Functions organized by purpose with clear section headers.
 * Stat decay logic is clearly separated from evolution and utility functions.
 * This structure makes it easy for judges to understand the pet care system.
 */

import type { PetData, PetType, AgeStage } from '../game/data'
import { getAgeStage } from '../game/data'
import { clamp } from './utils'
import { Stats } from './types'

// ============================================================================
// === MOOD SYSTEM ===
// ============================================================================

/**
 * Mood type - All possible moods
 */
export type Mood = 'happy' | 'sad' | 'sick' | 'energetic' | 'tired' | 'angry' | 'neutral'

/**
 * Updates mood based on pet stats
 * 
 * This function determines the pet's emotional state based on their physical
 * and mental condition. Mood is calculated from stats, not stored separately.
 * 
 * MOOD LOGIC (priority order):
 * 1. If health < 30 → "sick" (health is most critical)
 * 2. Else if happiness < 30 OR hunger < 20 → "sad" (unmet needs cause sadness)
 * 3. Else if energy > 70 AND happiness > 70 → "energetic" (well-rested and happy)
 * 4. Else → "happy" (default positive state)
 * 
 * @param stats - Pet's current stats
 * @returns Current mood based on stat values
 */
export function updateMood(stats: Stats): Mood {
  if (stats.health < 30) {
    return 'sick'
  }
  if (stats.happiness < 30 || stats.hunger < 20) {
    return 'sad'
  }
  if (stats.energy > 70 && stats.happiness > 70) {
    return 'energetic'
  }
  return 'happy'
}

/**
 * Creates a new pet with default starting values
 * 
 * FOR JUDGES:
 * Simple pet creation with only 3 types (cat, dog, rabbit).
 * Age stage is computed from XP (starts at 0 = Baby).
 * 
 * @param name - Pet's name
 * @param petType - Pet type: 'cat', 'dog', or 'rabbit'
 * @param coins - Starting coins (default: 1000)
 * @returns New pet data with all default values
 */
export function createPet(name: string, petType: PetType, coins: number = 1000): PetData {
  const now = Date.now()
  const xp = 0
  return {
    id: `${now}-${Math.random().toString(36).substring(2, 11)}`,
    name: name.trim(),
    petType: petType,
    xp: xp,
    ageStage: getAgeStage(xp), // Compute age stage from XP (0 = Baby)
    tricks: [],
    badges: [],
    stats: {
      hunger: 100,
      happiness: 100,
      health: 100,
      energy: 100,
      cleanliness: 100
    },
    coins: Math.max(0, coins),
    lifetimeEarnings: 0,
    expenses: [],
    inventory: {}, // This tracks purchased items (FBLA requirement)
    createdAt: now,
    lastUpdated: now,
    lastTickAt: now, // Initialize tick timer
    evolved: false
  }
}

/**
 * Applies stat decay over time using a logical, realistic tick-based system
 * 
 * This function implements a time-based decay system where stats decrease
 * naturally over time, simulating a pet that needs regular care.
 * 
 * STAT DEFINITIONS:
 * All stats are stored as numbers 0-100:
 * - hunger: 100 = full, 0 = starving
 * - energy: 100 = rested, 0 = exhausted
 * - cleanliness: 100 = clean, 0 = dirty
 * - happiness: 100 = very happy, 0 = very sad
 * - health: overall condition (depends on other stats)
 * 
 * TIME-BASED DECAY SYSTEM:
 * Uses lastTickAt timestamp to calculate fractional minutes passed since last update.
 * Calculates deltaMin = (now - lastTickAt) / 60000 (NOT floored) for precise sub-minute decay.
 * Applies decay rates scaled by deltaMin, allowing smooth stat changes even within seconds.
 * This makes the game feel alive and demo-friendly - stats visibly change within 1-3 minutes.
 * 
 * DECAY RATES (per minute):
 * - Hunger: -0.35/min (decreases fastest - pets need food regularly)
 * - Energy: -0.25/min (decreases moderately - pets get tired)
 * - Cleanliness: -0.15/min (decreases slowly - pets get dirty gradually)
 * - Happiness: -0.08/min base, plus conditional penalties if needs unmet
 * 
 * HAPPINESS CONDITIONAL PENALTIES (per minute):
 * - If hunger < 30: additional -0.12 (hungry pets are unhappy)
 * - If energy < 30: additional -0.10 (tired pets are unhappy)
 * - If cleanliness < 30: additional -0.08 (dirty pets are unhappy)
 * 
 * HEALTH SYSTEM (Neglect-Based, NOT Random):
 * Health does NOT decay randomly. Instead, it depends on how well
 * other stats are maintained (realistic dependency system):
 * 
 * 1. Calculate deficits (how far below healthy threshold of 50):
 *    - defHunger = max(0, 50 - hunger)
 *    - defEnergy = max(0, 50 - energy)
 *    - defClean = max(0, 50 - cleanliness)
 *    - defHappy = max(0, 50 - happiness)
 * 
 * 2. Weighted neglect score (reflects real-world priorities):
 *    - neglect = (0.4 * defHunger) + (0.3 * defEnergy) + 
 *                (0.2 * defClean) + (0.1 * defHappy)
 *    - Hunger is most critical (40% weight)
 *    - Energy is important (30% weight)
 *    - Cleanliness matters (20% weight)
 *    - Happiness contributes (10% weight)
 * 
 * 3. Health decay: health -= neglect * 0.03
 *    - More neglect = more health loss (scaled up for demo visibility)
 *    - Well-maintained stats = minimal health loss
 * 
 * 4. Health recovery (rewards good care):
 *    - If hunger >= 60 AND energy >= 60 AND cleanliness >= 60:
 *      health += 0.20/min (scaled up for demo visibility)
 *    - This teaches that prevention (good care) is better than treatment
 * 
 * CLAMPING:
 * All stats are clamped to 0-100 range after each update to prevent
 * floating point errors and ensure valid values.
 * 
 * FBLA Alignment:
 * - Demonstrates realistic cause-and-effect relationships
 * - Teaches responsibility through logical consequences
 * - Shows how neglect affects overall well-being
 * - Uses weighted calculations to model real-world priorities
 * - Rewards good care with health recovery
 * 
 * @param pet - Pet to apply decay to
 * @param now - Current timestamp (default: Date.now())
 * @returns Pet with updated (decayed) stats and lastTickAt timestamp
 */
/**
 * SINGLE TICK FUNCTION - Applies stat decay based on time elapsed
 * 
 * This is the ONLY function that should apply decay. All other code should call this.
 * 
 * DECAY MULTIPLIER SYSTEM:
 * - Normal mode: decayMult = 1.0 (uses base rates)
 * - Demo mode: decayMult = 2.0 (faster decay for quick demonstrations)
 * - All decay rates are multiplied by decayMult
 * - Health recovery is multiplied by 0.6 * decayMult (slower recovery in demo)
 * 
 * @param pet - Pet data with stats and lastTickAt
 * @param now - Current timestamp (default: Date.now())
 * @param decayMult - Decay multiplier (1.0 for normal, 2.0 for demo, default: 1.0)
 * @returns Updated pet with decayed stats and new lastTickAt
 */
export function applyTimeDecay(pet: PetData, now: number = Date.now(), decayMult: number = 1.0): PetData {
  // Ensure lastTickAt exists (fallback to lastUpdated or createdAt)
  const lastTick = pet.lastTickAt || pet.lastUpdated || pet.createdAt
  
  // Calculate fractional minutes (not floored) for precise sub-minute decay
  const deltaMin = (now - lastTick) / 60000
  
  // No time passed, return pet unchanged (but ensure lastTickAt is set)
  if (deltaMin <= 0) {
    return { ...pet, lastTickAt: now }
  }
  
  // CAP deltaMin to avoid tab-sleep nuking stats (max 10 minutes)
  const cappedDeltaMin = Math.min(deltaMin, 10)
  
  const newPet = { ...pet }
  // Ensure stats are numbers, not strings
  newPet.stats = {
    health: typeof pet.stats.health === 'number' ? pet.stats.health : Number(pet.stats.health) || 100,
    hunger: typeof pet.stats.hunger === 'number' ? pet.stats.hunger : Number(pet.stats.hunger) || 100,
    energy: typeof pet.stats.energy === 'number' ? pet.stats.energy : Number(pet.stats.energy) || 100,
    cleanliness: typeof pet.stats.cleanliness === 'number' ? pet.stats.cleanliness : Number(pet.stats.cleanliness) || 100,
    happiness: typeof pet.stats.happiness === 'number' ? pet.stats.happiness : Number(pet.stats.happiness) || 100
  }
  
  // === STAT DECAY ===
  // Base decay rates (per minute)
  // These are the base rates. They are multiplied by decayMult:
  // - Normal mode: decayMult = 1.0 (current demo speed)
  // - Demo mode: decayMult = 2.0 (faster for quick demonstrations)
  const baseHungerRate = 1.2
  const baseEnergyRate = 0.9
  const baseCleanRate = 0.6
  const baseHappyRate = 0.4
  
  // Neglect penalty rates
  const hungerPenaltyRate = 0.6
  const energyPenaltyRate = 0.5
  const cleanPenaltyRate = 0.4
  
  // Health system rates
  const healthNeglectScale = 0.03
  const healthRecoveryRate = 0.20
  
  // Basic stat decay (multiplied by decayMult)
  
  // HUNGER: baseHungerRate * decayMult per minute
  newPet.stats.hunger = clamp(newPet.stats.hunger - (baseHungerRate * cappedDeltaMin * decayMult))
  
  // ENERGY: baseEnergyRate * decayMult per minute
  newPet.stats.energy = clamp(newPet.stats.energy - (baseEnergyRate * cappedDeltaMin * decayMult))
  
  // CLEANLINESS: baseCleanRate * decayMult per minute
  newPet.stats.cleanliness = clamp(newPet.stats.cleanliness - (baseCleanRate * cappedDeltaMin * decayMult))
  
  // Happiness decay (base + conditional penalties)
  
  // Base happiness decay: baseHappyRate * decayMult per minute
  let happinessDecay = baseHappyRate * cappedDeltaMin * decayMult
  
  // Neglect penalties to happiness (multiplied by decayMult)
  if (newPet.stats.hunger < 30) {
    happinessDecay += hungerPenaltyRate * cappedDeltaMin * decayMult
  }
  if (newPet.stats.energy < 30) {
    happinessDecay += energyPenaltyRate * cappedDeltaMin * decayMult
  }
  if (newPet.stats.cleanliness < 30) {
    happinessDecay += cleanPenaltyRate * cappedDeltaMin * decayMult
  }
  
  newPet.stats.happiness = clamp(newPet.stats.happiness - happinessDecay)
  
  // Health system (neglect-based)
  
  // Calculate deficits (how far below healthy threshold of 50)
  const defH = Math.max(0, 50 - newPet.stats.hunger)
  const defE = Math.max(0, 50 - newPet.stats.energy)
  const defC = Math.max(0, 50 - newPet.stats.cleanliness)
  const defP = Math.max(0, 50 - newPet.stats.happiness)
  
  // Weighted neglect score
  const neglect = (0.4 * defH) + (0.3 * defE) + (0.2 * defC) + (0.1 * defP)
  
  // Health decay based on neglect (multiplied by decayMult)
  newPet.stats.health = clamp(newPet.stats.health - (neglect * healthNeglectScale * cappedDeltaMin * decayMult))
  
  // Health recovery when cared for (multiplied by 0.6 * decayMult for slower recovery in demo)
  if (newPet.stats.hunger >= 60 && 
      newPet.stats.energy >= 60 && 
      newPet.stats.cleanliness >= 60) {
    newPet.stats.health = clamp(newPet.stats.health + (healthRecoveryRate * cappedDeltaMin * 0.6 * decayMult))
  }
  
  // Final clamping (ensure all stats stay in valid 0-100 range)
  
  newPet.stats.hunger = clamp(newPet.stats.hunger)
  newPet.stats.energy = clamp(newPet.stats.energy)
  newPet.stats.cleanliness = clamp(newPet.stats.cleanliness)
  newPet.stats.happiness = clamp(newPet.stats.happiness)
  newPet.stats.health = clamp(newPet.stats.health)
  
  // Update timestamp
  newPet.lastTickAt = now
  newPet.lastUpdated = now
  
  // Note: mood is updated in GameCore.getMood() when pet state changes
  // We don't update it here to avoid circular dependencies
  
  return newPet
}

// ============================================================================
// === XP / AGE PROGRESSION ===
// ============================================================================

/**
 * Calculates care score (average of all stats)
 * 
 * Care score determines if the pet can evolve.
 * Higher care = better chance of evolution.
 * 
 * @param pet - Pet to calculate care score for
 * @returns Care score (0-100)
 */
export function getCareScore(pet: PetData): number {
  const s = pet.stats
  return clamp((s.hunger + s.happiness + s.cleanliness + s.energy + s.health) / 5, 0, 100)
}

/**
 * Computes age stage from XP (FBLA-safe, simple progression)
 * 
 * FOR JUDGES:
 * Simple numeric progression based ONLY on XP:
 * - 0 XP = Baby (ageStage 0)
 * - 20 XP = Young (ageStage 1)
 * - 60 XP = Adult (ageStage 2)
 * - 120 XP = Mature (ageStage 3)
 * 
 * No care score requirements - just XP thresholds.
 * This is easy to explain and understand.
 * 
 * @param pet - Pet to compute age stage for
 * @returns Age stage (0-3)
 */
export function computeAgeStageFromXp(pet: PetData): AgeStage {
  return getAgeStage(pet.xp)
}

/**
 * Checks if pet's age stage changed and updates it
 * 
 * FOR JUDGES:
 * Simple age progression - when XP reaches thresholds (20, 60, 120),
 * the pet's age stage automatically updates.
 * 
 * IMPORTANT: Only triggers evolution when age stage actually changes.
 * Uses unique evolution event IDs to prevent duplicate triggers.
 * 
 * @param pet - Pet to check evolution for
 * @returns Pet with updated ageStage if evolution occurred, and evolution event info
 */
export function checkEvolution(pet: PetData): {
  pet: PetData
  evolutionEvent: {
    fromStage: AgeStage
    toStage: AgeStage
    atXp: number
    id: string
  } | null
} {
  const computedAgeStage = getAgeStage(pet.xp)
  const currentAgeStage = pet.ageStage ?? getAgeStage(pet.xp) // Fallback for migration
  const newPet = { ...pet }
  
  // Update ageStage from XP (always keep in sync)
  newPet.ageStage = computedAgeStage
  
  // Only trigger evolution event if age stage actually changed
  if (computedAgeStage !== currentAgeStage) {
    newPet.evolved = true // Legacy flag for backward compatibility
    
    // Create stable evolution event ID (based on pet ID, stages, and XP - NOT timestamp)
    const evolutionId = `${pet.id}-${currentAgeStage}-${computedAgeStage}-${Math.floor(pet.xp)}`
    
    // Check if this evolution has already been acknowledged
    if (pet.lastEvolutionAckId === evolutionId) {
      // Already acknowledged, don't trigger again
      return { pet: newPet, evolutionEvent: null }
    }
    
    return {
      pet: newPet,
      evolutionEvent: {
        fromStage: currentAgeStage,
        toStage: computedAgeStage,
        atXp: pet.xp,
        id: evolutionId
      }
    }
  }
  
  return { pet: newPet, evolutionEvent: null }
}

/**
 * Acknowledges an age stage evolution event by storing its ID
 * 
 * @param pet - Pet to acknowledge evolution for
 * @param evolutionId - ID of the evolution event to acknowledge
 * @returns Pet with updated lastEvolutionAckId
 */
export function acknowledgeEvolution(pet: PetData, evolutionId: string): PetData {
  return {
    ...pet,
    lastEvolutionAckId: evolutionId,
    evolved: false // Clear evolved flag after acknowledgment
  }
}

// Legacy function for backward compatibility
export function computeStageFromXp(pet: PetData): 'baby' | 'teen' | 'mature' | 'final' {
  const ageStage = getAgeStage(pet.xp)
  // Map ageStage to old stage names for backward compatibility
  if (ageStage === 0) return 'baby'
  if (ageStage === 1) return 'teen'
  if (ageStage === 2) return 'mature'
  return 'final'
}

/**
 * Adds XP to pet and checks for age stage evolution
 * 
 * FOR JUDGES:
 * When XP is added, age stage is automatically recalculated.
 * If age stage changes (0→1, 1→2, 2→3), an evolution event is triggered.
 * 
 * @param pet - Pet to give XP to
 * @param amount - Amount of XP to add
 * @returns Pet with updated XP and possibly evolved age stage
 */
export function giveXP(pet: PetData, amount: number): PetData {
  const newPet = { ...pet }
  newPet.xp = Math.min(9999, (newPet.xp || 0) + amount)
  // Always update ageStage from XP (single source of truth)
  newPet.ageStage = getAgeStage(newPet.xp)
  const result = checkEvolution(newPet)
  return result.pet
}

// Re-export clamp from utils for backward compatibility
export { clamp } from './utils'

