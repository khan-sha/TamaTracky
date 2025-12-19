/**
 * Save System Module
 * 
 * This module handles all save/load operations:
 * - Saving pet data to slots
 * - Loading pet data from slots
 * - Deleting slots
 * - Getting slot information
 * 
 * RESPONSIBILITY: Persistent storage and save slot management
 */

import { PetData, SlotData } from './types'
// NOTE: decayStats removed from imports - decay is handled globally in useGameCore

/**
 * Saves all game data to a save slot
 * 
 * Each slot stores:
 * - Pet data
 * - Expenses history
 * - Income history
 * - Quests (future feature)
 * - Badges earned
 * - Metadata (creation date, last played)
 * 
 * @param slot - Slot number (1, 2, or 3)
 * @param pet - Pet data to save (or null to clear slot)
 * @param expenses - Expense records
 * @param income - Income records
 */
export function saveAll(
  slot: 1 | 2 | 3, 
  pet: PetData | null, 
  expenses: any[] = [], 
  income: any[] = [],
  quests: any = null,
  badges: string[] = [],
  taskState: any[] | null = null,
  demo: boolean | undefined = undefined,
  lastAllowanceClaim: number | undefined = undefined,
  lastCheckIn: string | undefined = undefined
): void {
  // Merge pet expenses with slot expenses (for cost-of-care tracking)
  const allExpenses = pet?.expenses || []
  const mergedExpenses = [...allExpenses, ...expenses]
  
  // Load existing data to preserve quests, taskState, guideChecklist, and meta.demo flag
  const existing = loadAll(slot)
  const questsToSave = quests !== null ? quests : (existing?.quests || [])
  const badgesToSave = badges.length > 0 ? badges : (pet?.badges || existing?.badges || [])
  const taskStateToSave = taskState !== null ? taskState : (existing?.taskState || [])
  const guideChecklistToSave = existing?.guideChecklist // Preserve checklist
  
  // Preserve meta.demo flag: use passed parameter, or existing value, or false
  const demoFlag = demo !== undefined ? demo : (existing?.meta?.demo === true)
  
  // Preserve demoSeedVersion if it exists
  const demoSeedVersion = existing?.meta?.demoSeedVersion
  // Use provided lastAllowanceClaim, or preserve existing if not provided
  const allowanceClaim = lastAllowanceClaim !== undefined ? lastAllowanceClaim : (existing?.meta?.lastAllowanceClaim)
  // Use provided lastCheckIn, or preserve existing if not provided
  const checkInDate = lastCheckIn !== undefined ? lastCheckIn : (existing?.meta?.lastCheckIn)
  
  const data: SlotData = {
    pet,
    expenses: mergedExpenses,
    income,
    quests: questsToSave,
    badges: badgesToSave,
    taskState: taskStateToSave,
    guideChecklist: guideChecklistToSave, // Preserve checklist
    meta: {
      createdAt: pet?.createdAt ? new Date(pet.createdAt).toISOString() : (existing?.meta?.createdAt || new Date().toISOString()),
      lastPlayed: new Date().toISOString(),
      slotNumber: slot,
      demo: demoFlag, // Preserve demo flag
      demoSeedVersion: demoSeedVersion, // Preserve seed version to prevent re-seeding
      lastAllowanceClaim: allowanceClaim, // Use provided or preserve existing allowance claim timestamp
      lastCheckIn: checkInDate // Use provided or preserve existing check-in date
    }
  }
  
  // This saves everything inside the chosen slot
  localStorage.setItem(`tama_slot_${slot}`, JSON.stringify(data))
  localStorage.setItem('tama_current_slot', slot.toString())
}

/**
 * Loads all game data from a save slot
 * 
 * When loading, applies stat decay based on time since last update.
 * This ensures the pet's stats reflect the time that has passed.
 * 
 * @param slot - Slot number (1, 2, or 3)
 * @returns Slot data or null if slot is empty
 */
export function loadAll(slot: 1 | 2 | 3): SlotData | null {
  try {
    const stored = localStorage.getItem(`tama_slot_${slot}`)
    if (!stored) return null
    
    const data = JSON.parse(stored) as SlotData
    
    // NOTE: Decay is NOT applied here - it's handled globally in useGameCore
    // This prevents double-decay. Decay should be applied:
    // 1. On slot load (in useGameCore.loadSlot)
    // 2. On global interval (in useGameCore)
    // 3. On visibility change (in useGameCore)
    
    if (data.pet) {
      // Ensure inventory exists (for backward compatibility)
      if (!data.pet.inventory) {
        data.pet.inventory = {}
      }
      
      // Ensure lastTickAt exists (for backward compatibility)
      if (!data.pet.lastTickAt) {
        data.pet.lastTickAt = data.pet.lastUpdated || data.pet.createdAt
      }
      
      // Ensure stats are numbers (never strings)
      if (data.pet.stats) {
        data.pet.stats = {
          health: typeof data.pet.stats.health === 'number' ? data.pet.stats.health : Number(data.pet.stats.health) || 100,
          hunger: typeof data.pet.stats.hunger === 'number' ? data.pet.stats.hunger : Number(data.pet.stats.hunger) || 100,
          energy: typeof data.pet.stats.energy === 'number' ? data.pet.stats.energy : Number(data.pet.stats.energy) || 100,
          cleanliness: typeof data.pet.stats.cleanliness === 'number' ? data.pet.stats.cleanliness : Number(data.pet.stats.cleanliness) || 100,
          happiness: typeof data.pet.stats.happiness === 'number' ? data.pet.stats.happiness : Number(data.pet.stats.happiness) || 100
        }
      }
      
      // Ensure expenses have IDs and types (for backward compatibility)
      data.pet.expenses = data.pet.expenses.map(exp => ({
        ...exp,
        id: exp.id || `expense_${exp.timestamp}_${Math.random().toString(36).substring(2, 9)}`,
        type: exp.type || 'care' as const
      }))
    }
    
    return data
  } catch {
    return null
  }
}

/**
 * Deletes a save slot
 * 
 * @param slot - Slot number (1, 2, or 3) to delete
 */
export function deleteSlot(slot: 1 | 2 | 3): void {
  localStorage.removeItem(`tama_slot_${slot}`)
}

/**
 * Gets information about all save slots
 * 
 * Returns an array with information about each slot:
 * - Whether the slot has data
 * - Pet name (if exists)
 * - Pet stage (if exists)
 * - Pet XP (if exists)
 * 
 * @returns Array of slot information
 */
export function getAllSlots(): Array<{
  slotNumber: 1 | 2 | 3
  exists: boolean
  petName?: string
  petStage?: string
  petXP?: number
  lastPlayed?: string
}> {
  const slots: Array<{
    slotNumber: 1 | 2 | 3
    exists: boolean
    petName?: string
    petStage?: string
    petXP?: number
    lastPlayed?: string
  }> = []
  
  for (let i = 1; i <= 3; i++) {
    const slot = i as 1 | 2 | 3
    const data = loadAll(slot)
    
    if (data && data.pet) {
      // Map ageStage to stage name for display
      const stageNames = ['Baby', 'Young', 'Adult', 'Mature']
      const stageName = data.pet.ageStage !== undefined 
        ? stageNames[data.pet.ageStage] || 'Baby'
        : (data.pet.stage || 'Baby')
      
      slots.push({
        slotNumber: slot,
        exists: true,
        petName: data.pet.name,
        petStage: stageName,
        petXP: data.pet.xp,
        lastPlayed: data.meta?.lastPlayed
      })
    } else {
      slots.push({
        slotNumber: slot,
        exists: false
      })
    }
  }
  
  return slots
}

