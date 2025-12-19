/**
 * useGameCore - ONE Hook for Everything
 * 
 * WHAT THIS IS:
 * This hook gives you access to ALL game functions and state.
 * 
 * HOW TO USE:
 * const { pet, feed, play, saveAll, shopItems } = useGameCore()
 * 
 * FOR JUDGES:
 * Instead of using many different hooks, you use ONE hook for everything.
 */

import { useState, useEffect, useCallback } from 'react'
import { GameCore, PetData, GameState, SlotData } from './GameCore'
import { getAgeStage } from './game/data'

/**
 * useGameCore Hook
 * 
 * WHAT IT DOES:
 * - Loads pet from current save slot
 * - Provides all game functions
 * - Auto-saves when pet changes
 */
// Helper to ensure stats are numbers (never strings)
function ensureStatsAreNumbers(stats: any) {
  return {
    health: typeof stats?.health === 'number' ? stats.health : Number(stats?.health) || 100,
    hunger: typeof stats?.hunger === 'number' ? stats.hunger : Number(stats?.hunger) || 100,
    energy: typeof stats?.energy === 'number' ? stats.energy : Number(stats?.energy) || 100,
    cleanliness: typeof stats?.cleanliness === 'number' ? stats.cleanliness : Number(stats?.cleanliness) || 100,
    happiness: typeof stats?.happiness === 'number' ? stats.happiness : Number(stats?.happiness) || 100
  }
}

export function useGameCore() {
  // Current pet state
  const [pet, setPetState] = useState<PetData | null>(null)
  const [saveSlot, setSaveSlotState] = useState<1 | 2 | 3 | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Load current slot from localStorage and apply decay
  useEffect(() => {
    try {
      const savedSlot = localStorage.getItem('tama_current_slot')
      if (savedSlot === '1' || savedSlot === '2' || savedSlot === '3') {
        const slot = parseInt(savedSlot) as 1 | 2 | 3
        setSaveSlotState(slot)
        const data = GameCore.loadAll(slot)
        if (data && data.pet) {
          // Ensure pet has all required fields and stats are numbers
          let pet: PetData = {
            ...data.pet,
            tricks: data.pet.tricks || [],
            badges: data.pet.badges || [],
            expenses: data.pet.expenses || [],
            stats: ensureStatsAreNumbers(data.pet.stats),
            lastTickAt: data.pet.lastTickAt || data.pet.lastUpdated || data.pet.createdAt
          }
          // Apply decay on load (use normal mode multiplier - meta.demo not yet loaded)
          // The global interval will handle mode-specific decay after load
          pet = GameCore.applyTimeDecay(pet, Date.now(), 1.0)
          setPetState(pet)
          GameCore.state.pet = pet
          GameCore.state.saveSlot = slot
          GameCore.state.mood = GameCore.getMood(pet)
          // Save after applying decay
          GameCore.saveAll(slot, pet, data.expenses || [], data.income || [], data.quests || [], pet.badges || [], data.taskState || null, data.meta?.demo)
        }
      }
    } catch (error) {
      console.error('Error loading game state:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // SINGLE GLOBAL INTERVAL - Applies decay every 10 seconds
  // This is the ONLY interval that should run decay across the entire app
  useEffect(() => {
    if (!saveSlot) return
    
    let intervalId: NodeJS.Timeout | null = null
    
    const tick = () => {
      try {
        // Always load fresh from slot to get latest state (prevents stale state issues)
        const slotData = GameCore.loadAll(saveSlot)
        if (!slotData || !slotData.pet) return
        
        const currentPet = slotData.pet
        
        // Determine decay multiplier based on mode
        // Normal mode: 1.0 (uses current demo speed as base)
        // Demo mode: 2.0 (faster for quick demonstrations)
        const decayMult = slotData.meta?.demo === true ? 2.0 : 1.0
        
        // Apply decay with multiplier
        const now = Date.now()
        const updatedPet = GameCore.applyTimeDecay(currentPet, now, decayMult)
        
        // Check if pet actually changed (avoid unnecessary saves)
        if (updatedPet.lastTickAt !== currentPet.lastTickAt ||
            updatedPet.stats.hunger !== currentPet.stats.hunger ||
            updatedPet.stats.energy !== currentPet.stats.energy ||
            updatedPet.stats.health !== currentPet.stats.health) {
          
          // Save to current slot
          GameCore.saveAll(
            saveSlot,
            updatedPet,
            slotData.expenses || [],
            slotData.income || [],
            slotData.quests || null,
            updatedPet.badges || [],
            slotData.taskState || null,
            slotData.meta?.demo
          )
          
          // Update in-memory state (force new object reference to ensure React detects change)
          setPetState({ ...updatedPet, stats: { ...updatedPet.stats } })
          GameCore.state.pet = updatedPet
          GameCore.state.mood = GameCore.getMood(updatedPet)
        }
      } catch (error) {
        console.error('Error in decay tick:', error)
      }
    }
    
    // Run tick immediately on mount
    tick()
    
    // Set up interval (every 10 seconds)
    intervalId = setInterval(tick, 10000)
    
    // Cleanup on unmount or when saveSlot changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [saveSlot]) // Only depend on saveSlot, not pet (to avoid recreating interval)
  
  // Apply decay when app becomes visible (tab returns from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && saveSlot && pet) {
        try {
          // Load slot data to get meta.demo for decay multiplier
          const slotData = GameCore.loadAll(saveSlot) || {
            pet: null,
            expenses: [],
            income: [],
            quests: [],
            badges: [],
            meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot }
          }
          
          // Determine decay multiplier based on mode
          const decayMult = slotData.meta?.demo === true ? 2.0 : 1.0
          
          const updatedPet = GameCore.applyTimeDecay(pet, Date.now(), decayMult)
          if (updatedPet.lastTickAt !== pet.lastTickAt) {
            GameCore.saveAll(
              saveSlot,
              updatedPet,
              slotData.expenses || [],
              slotData.income || [],
              slotData.quests || null,
              updatedPet.badges || [],
              slotData.taskState || null,
              slotData.meta?.demo
            )
            setPetState(updatedPet)
            GameCore.state.pet = updatedPet
            GameCore.state.mood = GameCore.getMood(updatedPet)
          }
        } catch (error) {
          console.error('Error applying decay on visibility change:', error)
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [saveSlot, pet])
  
  // Update pet and auto-save
  const setPet = useCallback((newPet: PetData | null) => {
    setPetState(newPet)
    if (newPet) {
      GameCore.state.pet = newPet
      // This updates the pet's mood based on their stats
      GameCore.state.mood = GameCore.getMood(newPet)
      if (saveSlot) {
        const data = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
        // This saves everything inside the chosen slot
        GameCore.saveAll(saveSlot, newPet, data.expenses || [], data.income || [], data.quests || [], newPet.badges || [])
      }
    }
  }, [saveSlot])
  
  // Load a slot
  const loadSlot = useCallback((slot: 1 | 2 | 3) => {
    try {
      setSaveSlotState(slot)
      localStorage.setItem('tama_current_slot', slot.toString())
      const data = GameCore.loadAll(slot)
      if (data && data.pet) {
        // Ensure pet has all required fields and stats are numbers
        let pet: PetData = {
          ...data.pet,
          tricks: data.pet.tricks || [],
          badges: data.pet.badges || [],
          expenses: data.pet.expenses || [],
          stats: ensureStatsAreNumbers(data.pet.stats),
          lastTickAt: data.pet.lastTickAt || data.pet.lastUpdated || data.pet.createdAt
        }
        // Apply time decay on load (use slot meta to determine multiplier)
        const decayMult = data.meta?.demo === true ? 2.0 : 1.0
        pet = GameCore.applyTimeDecay(pet, Date.now(), decayMult)
        setPetState(pet)
        GameCore.state.pet = pet
        GameCore.state.saveSlot = slot
        GameCore.state.mood = GameCore.getMood(pet)
        // Save updated pet after decay
        GameCore.saveAll(slot, pet, data.expenses || [], data.income || [], data.quests || [], pet.badges || [])
      } else {
        setPetState(null)
        GameCore.state.pet = null
        GameCore.state.saveSlot = slot
      }
    } catch (error) {
      console.error('Error loading slot:', error)
      setPetState(null)
      GameCore.state.pet = null
      GameCore.state.saveSlot = slot
    }
  }, [])
  
  // Delete a slot
  const deleteSlot = useCallback((slot: 1 | 2 | 3) => {
    GameCore.deleteSlot(slot)
    if (saveSlot === slot) {
      setPetState(null)
      setSaveSlotState(null)
      localStorage.removeItem('tama_current_slot')
    }
  }, [saveSlot])
  
  // ============================================================================
  // BADGE EVALUATION (Must be defined before actions that use it)
  // ============================================================================
  
  /**
   * Evaluates and awards badges after important events
   * 
   * FBLA RUBRIC ALIGNMENT:
   * - Functions: evaluateAndAwardBadges() centralizes badge logic
   * - Conditionals: Checks if badges should be awarded
   * - Validation: Idempotent - never re-adds same badge
   * 
   * This function:
   * 1. Creates evaluation state from current pet and slot data
   * 2. Evaluates all badge criteria
   * 3. Awards new badges to pet
   * 4. Saves updated pet with badges
   */
  const evaluateAndAwardBadges = useCallback(() => {
    if (!pet || !saveSlot) return
    
    // Load slot data for complete evaluation state
    const data = GameCore.loadAll(saveSlot) || {
      pet: null,
      expenses: [],
      income: [],
      quests: [],
      badges: [],
      meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot }
    }
    
    // Calculate totals for badge evaluation
    // FUNCTIONS: getTotalCareCost and getCareCostByCategory calculate financial totals
    const totalCareCost = pet ? GameCore.getTotalCareCost(pet) : 0
    const careCostByCategory = pet ? GameCore.getCareCostByCategory(pet) : {}
    
    // Count completed quests (quests with completedAt timestamp)
    const quests = GameCore.getQuests(data)
    const completedQuestsCount = quests.daily.filter(q => q.completedAt !== undefined).length
    
    // Create evaluation state
    const evaluationState = {
      pet,
      slotData: data,
      totalCareCost,
      careCostByCategory,
      completedQuestsCount,
      currentAgeStage: pet.ageStage ?? (pet.xp !== undefined ? getAgeStage(pet.xp) : 0)
    }
    
    // Evaluate badges
    const newBadgeIds = GameCore.evaluateBadges(evaluationState)
    
    // Award new badges if any
    if (newBadgeIds.length > 0) {
      const petWithBadges = GameCore.awardBadges(pet, newBadgeIds)
      setPet(petWithBadges)
      
      // Save updated pet with badges
      GameCore.saveAll(
        saveSlot,
        petWithBadges,
        data.expenses || [],
        data.income || [],
        data.quests || [],
        petWithBadges.badges || []
      )
    }
    
    return newBadgeIds
  }, [pet, saveSlot, setPet])
  
  // ============================================================================
  // PET ACTIONS (all auto-save and update quest progress)
  // ============================================================================
  
  // Feed now requires food items from inventory (not coins)
  // This teaches financial responsibility by requiring users to plan spending
  const feed = useCallback((foodItemId: number = 1) => {
    if (!pet || !saveSlot) return false
    const result = GameCore.feed(pet, foodItemId)
    if (result.success) {
      setPet(result.pet)
      // Every pet action must call updateQuestProgress(actionName)
      const data = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
      const quests = GameCore.getQuests(data)
      const updatedQuests = GameCore.updateQuestProgress(quests, 'feed')
      GameCore.saveAll(saveSlot, result.pet, data.expenses || [], data.income || [], updatedQuests, result.pet.badges || [])
      
      // Evaluate badges after care action (important event)
      setTimeout(() => evaluateAndAwardBadges(), 100)
      
      return true
    }
    return false
  }, [pet, setPet, saveSlot, evaluateAndAwardBadges])
  
  const play = useCallback((cost: number = 30) => {
    if (!pet || !saveSlot) return false
    const result = GameCore.play(pet, cost)
    if (result.success) {
      setPet(result.pet)
      // Every pet action must call updateQuestProgress(actionName)
      const data = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
      const quests = GameCore.getQuests(data)
      const updatedQuests = GameCore.updateQuestProgress(quests, 'play')
      GameCore.saveAll(saveSlot, result.pet, data.expenses || [], data.income || [], updatedQuests, result.pet.badges || [])
      return true
    }
    return false
  }, [pet, setPet, saveSlot])
  
  const rest = useCallback((cost: number = 20) => {
    if (!pet) return false
    const result = GameCore.rest(pet, cost)
    if (result.success) {
      setPet(result.pet)
      return true
    }
    return false
  }, [pet, setPet])
  
  // Health check (paid service) - requires coins
  // This teaches financial responsibility by requiring users to budget for health care
  const visitVet = useCallback((cost: number, healthRestore: number = 15, happinessBonus: number = 0) => {
    if (!pet || !saveSlot) return { success: false, pet: null, message: 'No pet found' }
    const result = GameCore.visitVet(pet, cost, healthRestore, happinessBonus)
    if (result.success) {
      setPet(result.pet)
      // Every pet action must call updateQuestProgress(actionName)
      const data = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
      const quests = GameCore.getQuests(data)
      const updatedQuests = GameCore.updateQuestProgress(quests, 'visitVet')
      GameCore.saveAll(saveSlot, result.pet, data.expenses || [], data.income || [], updatedQuests, result.pet.badges || [])
    }
    return result
  }, [pet, setPet, saveSlot])
  
  const clean = useCallback((cost: number = 25) => {
    if (!pet || !saveSlot) return false
    const result = GameCore.clean(pet, cost)
    if (result.success) {
      setPet(result.pet)
      // Every pet action must call updateQuestProgress(actionName)
      const data = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
      const quests = GameCore.getQuests(data)
      const updatedQuests = GameCore.updateQuestProgress(quests, 'clean')
      GameCore.saveAll(saveSlot, result.pet, data.expenses || [], data.income || [], updatedQuests, result.pet.badges || [])
      return true
    }
    return false
  }, [pet, setPet, saveSlot])
  
  // XP and evolution
  const giveXP = useCallback((amount: number) => {
    if (!pet) return
    const newPet = GameCore.giveXP(pet, amount)
    setPet(newPet)
  }, [pet, setPet])
  
  // Money
  const addCoins = useCallback((amount: number) => {
    if (!pet) return
    const newPet = GameCore.addCoins(pet, amount)
    setPet(newPet)
  }, [pet, setPet])
  
  const earnCoins = useCallback((amount: number, description?: string) => {
    if (!pet) return
    const newPet = GameCore.earnCoins(pet, amount, description)
    setPet(newPet)
  }, [pet, setPet])
  
  // Shop
  const buyItem = useCallback((item: any) => {
    if (!pet) return { success: false, message: 'No pet found', pet: null }
    const result = GameCore.buyItem(pet, item)
    if (result.success) {
      setPet(result.pet)
      // Save after purchase
      if (saveSlot) {
        const data = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
        GameCore.saveAll(saveSlot, result.pet, data.expenses || [], data.income || [])
        
        // Evaluate badges after purchase (important event)
        setTimeout(() => evaluateAndAwardBadges(), 100)
      }
    }
    return result
  }, [pet, setPet, saveSlot, evaluateAndAwardBadges])
  
  // Rewards (for mini-games)
  const applyReward = useCallback((reward: any) => {
    if (!pet) return { success: false, pet: null, incomeRecord: null }
    const result = GameCore.applyReward(pet, reward)
    if (result.success) {
      setPet(result.pet)
      // Save income record to slot
      if (saveSlot && result.incomeRecord) {
        const data = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
        const updatedIncome = [...(data.income || []), result.incomeRecord]
        GameCore.saveAll(saveSlot, result.pet, data.expenses || [], updatedIncome)
      }
    }
    return result
  }, [pet, setPet, saveSlot])
  
  // Save/Load
  const saveAll = useCallback((quests?: any, badges?: string[]) => {
    if (!saveSlot || !pet) return
    const data = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
    // This saves everything inside the chosen slot
    GameCore.saveAll(saveSlot, pet, data.expenses || [], data.income || [], quests || data.quests || [], badges || pet.badges || [])
  }, [saveSlot, pet])
  
  // Stats decay (legacy function - uses normal mode multiplier)
  const updateStats = useCallback(() => {
    if (!pet) return
    // Use normal mode multiplier (1.0) - the global interval handles mode-specific decay
    const newPet = GameCore.applyTimeDecay(pet, Date.now(), 1.0)
    setPet(newPet)
  }, [pet, setPet])
  
  // Legacy badge functions for backward compatibility
  const checkBadges = useCallback(() => {
    if (!pet) return []
    return GameCore.checkBadges(pet)
  }, [pet])
  
  const awardBadge = useCallback((badgeId: string) => {
    if (!pet) return pet
    const newPet = GameCore.awardBadge(pet, badgeId)
    setPet(newPet)
    return newPet
  }, [pet, setPet])
  
  // Create pet
  const createPet = useCallback((name: string, petType: "cat" | "dog" | "rabbit", coins: number = 1000) => {
    const newPet = GameCore.createPet(name, petType, coins)
    setPet(newPet)
    return newPet
  }, [setPet])
  
  // Get all slots
  const getAllSlots = useCallback(() => {
    return GameCore.getAllSlots()
  }, [])
  
  // Return everything
  return {
    // State
    pet,
    saveSlot,
    isLoading,
    mood: pet ? GameCore.getMood(pet) : 'neutral',
    // Create new stats object reference to ensure React detects changes
    stats: pet?.stats ? { ...pet.stats } : null,
    coins: pet?.coins || 0,
    xp: pet?.xp || 0,
    ageStage: pet?.ageStage ?? (pet?.xp !== undefined ? getAgeStage(pet.xp) : 0),
    
    // Actions
    feed,
    play,
    rest,
    visitVet,
    clean,
    giveXP,
    addCoins,
    earnCoins,
    buyItem,
    createPet,
    updateStats,
    checkBadges,
    awardBadge,
    
    // Save/Load
    saveAll,
    loadSlot,
    deleteSlot,
    getAllSlots,
    
    // Shop
    shopItems: GameCore.shopItems,
    
    // Badges
    badges: GameCore.badges,
    getBadge: (badgeId: string) => GameCore.getBadge(badgeId),
    evaluateAndAwardBadges, // Centralized badge evaluation
    
    // Helpers
    getMoodEmoji: (mood: GameState['mood']) => GameCore.getMoodEmoji(mood),
    getSpeciesEmoji: (species: string, stage: string) => GameCore.getSpeciesEmoji(species, stage),
    getTotalExpenses: (expenses: any[]) => GameCore.getTotalExpenses(expenses),
    getTotalIncome: (income: any[]) => GameCore.getTotalIncome(income),
    exportExpensesCSV: (expenses: any[], filename?: string) => GameCore.exportExpensesCSV(expenses, filename),
    doChore: () => GameCore.doChore(),
    dailyReward: (petId: string) => GameCore.dailyReward(petId),
    createDemoPet: (name?: string, petType?: "cat" | "dog" | "rabbit") => GameCore.createDemoPet(name, petType),
    startDemoMode: (slot?: 1 | 2 | 3) => GameCore.startDemoMode(slot),
    resetDemoMode: (slot?: 1 | 2 | 3) => GameCore.resetDemoMode(slot),
    exitDemoMode: (slot?: 1 | 2 | 3) => GameCore.exitDemoMode(slot),
    
    // Rewards
    applyReward,
    
    // Tasks
    tasks: GameCore.tasks,
    getAllTasks: () => GameCore.getAllTasks(),
    getTask: (taskId: string) => GameCore.getTask(taskId),
    completeTask: (taskId: string) => GameCore.completeTask(taskId),
    canDoTask: (task: any, taskState: any) => GameCore.canDoTask(task, taskState),
    timeRemaining: (task: any, taskState: any) => GameCore.timeRemaining(task, taskState),
    
    // Quests
    getQuests: (slotData: SlotData | null) => GameCore.getQuests(slotData),
    updateQuestProgress: (quests: any, actionName: string) => GameCore.updateQuestProgress(quests, actionName),
    claimQuestReward: (quests: any, questId: string) => GameCore.claimQuestReward(quests, questId),
    isQuestReady: (quest: any) => GameCore.isQuestReady(quest),
    getReadyQuests: (quests: any) => GameCore.getReadyQuests(quests),
    
    // Allowance system
    canClaimAllowance: (now: number, lastClaim: number | undefined) => GameCore.canClaimAllowance(now, lastClaim),
    timeUntilAllowance: (now: number, lastClaim: number | undefined) => GameCore.timeUntilAllowance(now, lastClaim),
    claimAllowance: (pet: any, now: number, lastClaim: number | undefined) => GameCore.claimAllowance(pet, now, lastClaim),
    WEEKLY_ALLOWANCE_AMOUNT: GameCore.WEEKLY_ALLOWANCE_AMOUNT,
    
    // Daily check-in system
    isDailyCheckInAvailable: (now: number, lastCheckIn: string | undefined) => GameCore.isDailyCheckInAvailable(now, lastCheckIn),
    claimDailyCheckIn: (pet: any, now: number, lastCheckIn: string | undefined) => GameCore.claimDailyCheckIn(pet, now, lastCheckIn),
    DAILY_CHECKIN_COINS: GameCore.DAILY_CHECKIN_COINS,
    DAILY_CHECKIN_COINS_MIN: GameCore.DAILY_CHECKIN_COINS_MIN,
    DAILY_CHECKIN_COINS_MAX: GameCore.DAILY_CHECKIN_COINS_MAX,
    DAILY_CHECKIN_XP: GameCore.DAILY_CHECKIN_XP,
    
    // Money (giveCoins)
    giveCoins: (amount: number, source: 'quest' | 'task' | 'minigame' | 'bonus') => {
      if (!pet) return { pet: null, incomeRecord: null }
      const result = GameCore.giveCoins(pet, amount, source)
      setPet(result.pet)
      // Save income record to slot
      if (saveSlot && result.incomeRecord) {
        const data = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
        const updatedIncome = [...(data.income || []), result.incomeRecord]
        GameCore.saveAll(saveSlot, result.pet, data.expenses || [], updatedIncome, data.quests || [], result.pet.badges || [])
      }
      return result
    },
    
    // Expenses
    getTotalCareCost: () => pet ? GameCore.getTotalCareCost(pet) : 0,
    getCareCostByCategory: () => pet ? GameCore.getCareCostByCategory(pet) : null,
    
    // Activities (Free Care)
    // feedAtHome removed - feeding now requires purchased food items from inventory
    // This teaches financial responsibility by requiring users to plan spending
    cleanFree: () => {
      if (!pet) return { success: false, pet: null }
      const result = GameCore.cleanFree(pet)
      if (result.success) {
        setPet(result.pet)
        saveAll()
      }
      return result
    },
    restFree: () => {
      if (!pet) return { success: false, pet: null }
      const result = GameCore.restFree(pet)
      if (result.success) {
        setPet(result.pet)
        saveAll()
      }
      return result
    },
    // healthCheckFree removed - health checks now require paid vet services
    // This teaches financial responsibility by requiring users to budget for health care
    
    // Activities (Paid)
    petSpaDay: (cost?: number) => {
      if (!pet) return { success: false, pet: null, message: 'No pet found' }
      const result = GameCore.petSpaDay(pet, cost)
      if (result.success) {
        setPet(result.pet)
        saveAll()
      }
      return result
    },
    trainingClass: (cost?: number) => {
      if (!pet) return { success: false, pet: null, message: 'No pet found' }
      const result = GameCore.trainingClass(pet, cost)
      if (result.success) {
        setPet(result.pet)
        saveAll()
      }
      return result
    },
    parkTrip: (cost?: number) => {
      if (!pet) return { success: false, pet: null, message: 'No pet found' }
      const result = GameCore.parkTrip(pet, cost)
      if (result.success) {
        setPet(result.pet)
        saveAll()
      }
      return result
    }
  }
}

