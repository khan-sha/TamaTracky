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

// Maximum number of expense/income records to keep (prevents localStorage quota exceeded)
const MAX_RECORDS = 1000

/**
 * Prunes arrays to keep only the most recent N records
 * Sorts by timestamp (newest first) and keeps the most recent ones
 */
function pruneRecords<T extends { timestamp: number }>(records: T[], maxRecords: number): T[] {
  if (records.length <= maxRecords) return records
  // Sort by timestamp descending (newest first) and take the most recent
  return [...records]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxRecords)
    .reverse() // Reverse back to chronological order (oldest first)
}

/**
 * Saves all game data to a save slot
 * 
 * Each slot stores:
 * - Pet data
 * - Expenses history (pruned to prevent quota exceeded)
 * - Income history (pruned to prevent quota exceeded)
 * - Quests (future feature)
 * - Badges earned
 * - Metadata (creation date, last played)
 * 
 * IMPORTANT: This function handles localStorage quota exceeded errors gracefully
 * by automatically pruning old data when needed.
 * 
 * @param slot - Slot number (1, 2, or 3)
 * @param pet - Pet data to save (or null to clear slot)
 * @param expenses - Expense records (will be merged with existing)
 * @param income - Income records (will be merged with existing)
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
  // Load existing data to preserve quests, taskState, guideChecklist, and meta.demo flag
  const existing = loadAll(slot)
  
  // Merge expenses: combine slot-level expenses with new expenses from pet.expenses and parameter
  // Only add expenses that aren't already in the existing list (avoid duplicates)
  const existingExpenseIds = new Set((existing?.expenses || []).map(e => e.id))
  
  // Extract new expenses from pet.expenses (if pet has expenses)
  const petExpenses = pet?.expenses || []
  const petNewExpenses = petExpenses.filter(e => e.id && !existingExpenseIds.has(e.id))
  
  // Combine parameter expenses with pet expenses
  const paramNewExpenses = expenses.filter(e => e.id && !existingExpenseIds.has(e.id))
  
  // Merge all new expenses
  const allNewExpenses = [...petNewExpenses, ...paramNewExpenses]
  // Remove duplicates by ID (in case pet.expenses and expenses parameter overlap)
  const uniqueNewExpenses = Array.from(
    new Map(allNewExpenses.map(e => [e.id, e])).values()
  )
  
  const allExpenses = [...(existing?.expenses || []), ...uniqueNewExpenses]
  
  // Merge income: only add new income records
  const existingIncomeIds = new Set((existing?.income || []).map(i => i.id))
  const newIncome = income.filter(i => i.id && !existingIncomeIds.has(i.id))
  const allIncome = [...(existing?.income || []), ...newIncome]
  
  // Prune expenses and income to prevent quota exceeded errors
  const prunedExpenses = pruneRecords(allExpenses, MAX_RECORDS)
  const prunedIncome = pruneRecords(allIncome, MAX_RECORDS)
  
  // Clear pet.expenses to avoid duplication (expenses are stored at slot level)
  const petToSave = pet ? { ...pet, expenses: [] } : null
  
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
    pet: petToSave,
    expenses: prunedExpenses,
    income: prunedIncome,
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
  
  try {
    // Try to save the data
    const jsonData = JSON.stringify(data)
    localStorage.setItem(`tama_slot_${slot}`, jsonData)
    localStorage.setItem('tama_current_slot', slot.toString())
  } catch (error: any) {
    // If quota exceeded, try pruning more aggressively and retry
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('localStorage quota exceeded, attempting aggressive pruning...')
      
      // More aggressive pruning: keep only 500 records
      const aggressivePrunedExpenses = pruneRecords(allExpenses, 500)
      const aggressivePrunedIncome = pruneRecords(allIncome, 500)
      
      const smallerData: SlotData = {
        ...data,
        expenses: aggressivePrunedExpenses,
        income: aggressivePrunedIncome
      }
      
      try {
        const jsonData = JSON.stringify(smallerData)
        localStorage.setItem(`tama_slot_${slot}`, jsonData)
        localStorage.setItem('tama_current_slot', slot.toString())
        console.warn('Successfully saved with aggressive pruning')
      } catch (retryError: any) {
        // If still failing, try saving only essential data
        console.error('Failed to save even with aggressive pruning. Saving minimal data...', retryError)
        
        const minimalData: SlotData = {
          pet: petToSave,
          expenses: pruneRecords(allExpenses, 100), // Keep only 100 most recent
          income: pruneRecords(allIncome, 100), // Keep only 100 most recent
          quests: questsToSave,
          badges: badgesToSave,
          taskState: taskStateToSave,
          guideChecklist: guideChecklistToSave,
          meta: data.meta
        }
        
        try {
          localStorage.setItem(`tama_slot_${slot}`, JSON.stringify(minimalData))
          localStorage.setItem('tama_current_slot', slot.toString())
          console.warn('Saved with minimal data (100 records max)')
        } catch (finalError) {
          console.error('Failed to save even minimal data. localStorage may be full.', finalError)
          // Don't throw - allow the app to continue running
          // User can manually clear localStorage if needed
        }
      }
    } else {
      // Re-throw non-quota errors
      throw error
    }
  }
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
      
      // Populate pet.expenses from slot-level expenses (for backward compatibility and reporting)
      // This is a reference copy - expenses are stored at slot level to avoid duplication
      // Filter out "earning" type expenses as they're not valid for PetData.expenses
      if (data.expenses && data.expenses.length > 0) {
        data.pet.expenses = data.expenses
          .filter(exp => exp.type !== 'earning') // Remove "earning" type (income is tracked separately)
          .map(exp => ({
            id: exp.id || `expense_${exp.timestamp}_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: exp.timestamp,
            amount: exp.amount,
            description: exp.description,
            type: exp.type as 'food' | 'toy' | 'healthcare' | 'supplies' | 'care' | 'purchase' | 'activity',
            itemName: exp.itemName
          }))
      } else {
        // Ensure expenses array exists even if empty
        data.pet.expenses = (data.pet.expenses || [])
          .map(exp => ({
            ...exp,
            id: exp.id || `expense_${exp.timestamp}_${Math.random().toString(36).substring(2, 9)}`,
            type: (exp.type || 'care') as 'food' | 'toy' | 'healthcare' | 'supplies' | 'care' | 'purchase' | 'activity'
          }))
      }
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

