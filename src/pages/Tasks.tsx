/**
 * Care & Tasks Page Component
 * 
 * Dashboard is the main hub where the user sees their pet and chooses what to do next.
 * Care & Tasks is where the user performs essential care actions and earns coins.
 * Store is where all spending happens and cost-of-care is tracked.
 * Reports show the running total of all care-related expenses.
 * This design teaches financial responsibility by separating care, spending, and analysis.
 * 
 * This page is split into FOUR SECTIONS:
 * A) Essential Care - Feed (requires purchased food), Clean, Rest
 *    - Feeding requires food items purchased from the Store (teaches financial responsibility)
 *    - If no food in inventory, shows "Go to Store" button
 *    - Clean and Rest are free and do NOT cost coins
 *    - NO expense is logged for basic care actions (food expenses logged at purchase time)
 * B) Health Care - Redirect to Store
 *    - Health care is ONLY available via Store purchases (no duplicate UI)
 *    - All health services (Vet Visit, Medicine, Checkup Package) must be purchased from Store
 *    - Health items apply effects immediately on purchase and log expenses with category "health"
 *    - This teaches that health care costs money and must be planned for
 * C) Paid Activities - Spa Day, Training Class, Park Trip
 *    - These cost coins and log expenses for reports
 * D) Earning System - Chores/Tasks + Weekly Allowance
 *    - All earnings tracked for reports
 * 
 * FBLA Requirements:
 * - Budget responsibility through activities
 * - Clear cost-of-care teaching
 * - Pet reactions (mood, stats, evolution) to treatment
 * - All expenses tracked for reports
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useGameCore } from '../useGameCore'
import MiniGameLoader from '../minigames/MiniGameLoader'
import { GameCore, PetData } from '../GameCore'
import TaskActivityModal from '../components/TaskActivityModal'
import DailyCheckInModal from '../components/DailyCheckInModal'
import { getPageTitle } from '../utils/routeTitles'

function Tasks() {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)
  
  const { 
    pet, 
    isLoading, 
    coins,
    saveSlot,
    giveCoins,
    saveAll, 
    applyReward,
    feed, // Feed action that consumes inventory items
    cleanFree,
    restFree,
    // healthCheckFree removed - health checks now require paid vet services
    // visitVet removed - health care now only available via Store purchases
    petSpaDay,
    trainingClass,
    parkTrip,
    canDoTask,
    timeRemaining,
    // Allowance system
    canClaimAllowance,
    timeUntilAllowance,
    claimAllowance,
    WEEKLY_ALLOWANCE_AMOUNT,
    // Daily check-in system
    isDailyCheckInAvailable,
    claimDailyCheckIn,
    DAILY_CHECKIN_COINS_MIN,
    DAILY_CHECKIN_COINS_MAX,
    DAILY_CHECKIN_XP,
    // Badge evaluation
    evaluateAndAwardBadges
  } = useGameCore()
  const navigate = useNavigate()
  
  // Render guard: Redirect to home if no current slot
  useEffect(() => {
    if (!isLoading && !saveSlot) {
      navigate('/')
    }
  }, [isLoading, saveSlot, navigate])
  
  // State for messages
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  
  // State for pending mini-game reward
  const [miniGameRewardPending, setMiniGameRewardPending] = useState<{ coins?: number; happiness?: number; clean?: number; xp?: number } | null>(null)
  const [showGame, setShowGame] = useState(false)
  
  // State for task activity modal
  const [activeTask, setActiveTask] = useState<{ taskId: string; name: string; emoji: string; coins: number } | null>(null)
  
  // State for task state (cooldowns)
  const [taskState, setTaskState] = useState<Array<{ taskId: string; lastCompletedAt: number | null; inProgress: boolean }>>([])
  
  // State for daily check-in modal
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false)
  
  // Guard to prevent popup from flashing twice on re-render
  const hasPromptedThisVisit = useRef(false)
  
  // Get all available tasks
  const allTasks = GameCore.getAllTasks()
  
  // Load task state from save slot and apply time decay
  useEffect(() => {
    if (saveSlot) {
      const slotData = GameCore.loadAll(saveSlot)
      
      if (pet) {
        // Apply time decay when Tasks page loads (use slot meta to determine multiplier)
        const decayMult = slotData?.meta?.demo === true ? 2.0 : 1.0
        const updatedPet = GameCore.applyTimeDecay(pet, Date.now(), decayMult)
        if (updatedPet.lastTickAt !== pet.lastTickAt || 
            updatedPet.stats.hunger !== pet.stats.hunger ||
            updatedPet.stats.energy !== pet.stats.energy) {
          // Pet was updated, save it
          const data = slotData || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
          GameCore.saveAll(saveSlot, updatedPet, data.expenses || [], data.income || [], data.quests || [], updatedPet.badges || [])
          // Trigger re-render by updating pet
          saveAll()
        }
      }
      
      // Load task state
      if (slotData?.taskState) {
        setTaskState(slotData.taskState)
      }
      
      // Check if daily check-in is available and show modal
      // Guard: Only show once per visit to prevent flashing on re-render
      if (pet && isDailyCheckInAvailable && !hasPromptedThisVisit.current) {
        const now = Date.now()
        const lastCheckIn = slotData?.meta?.lastCheckIn
        if (isDailyCheckInAvailable(now, lastCheckIn)) {
          setShowDailyCheckIn(true)
          hasPromptedThisVisit.current = true // Mark as prompted for this visit
        }
      }
    }
  }, [saveSlot, pet, saveAll, isDailyCheckInAvailable])
  
  // Reset the guard when saveSlot changes (user switches slots)
  useEffect(() => {
    hasPromptedThisVisit.current = false
  }, [saveSlot])

  // NOTE: Decay is now handled globally in useGameCore hook
  // No need for local decay intervals here - they cause double-decay
  
  // Update cooldown display every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update cooldown timers
      setTaskState(prev => [...prev])
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  /**
   * Shows a message and clears it after 3 seconds
   */
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }
  
  /**
   * Handles free essential care actions
   * 
   * NOTE: Feeding is NO LONGER FREE - it requires purchased food items from inventory.
   * NOTE: Health checks are NO LONGER FREE - they require paid vet services.
   * This teaches financial responsibility by requiring users to plan spending.
   * 
   * These update stats and mood but DO NOT cost coins directly.
   * NO expense is logged UNLESS they explicitly consume an item from inventory.
   */
  const handleFreeCare = (action: 'clean' | 'rest') => {
    if (!pet) {
      showMessage('error', 'No pet found. Please create a pet first.')
      return
    }
    
    let result
    switch (action) {
      case 'clean':
        result = cleanFree()
        if (result.success) showMessage('success', 'Pet was cleaned! Cleanliness increased.')
        break
      case 'rest':
        result = restFree()
        if (result.success) showMessage('success', 'Pet rested! Energy increased.')
        break
    }
  }
  
  /**
   * Health care is now ONLY available via Store purchases.
   * 
   * FINANCIAL RESPONSIBILITY: Health checks must be purchased from the Store.
   * This teaches that health care costs money and must be planned for.
   * Removed duplicate health care section - all health services are in Store.
   */
  
  /**
   * Handles feeding using food from inventory
   * 
   * FINANCIAL RESPONSIBILITY: Feeding requires food items purchased from Store.
   * Users must plan spending before feeding - this teaches budgeting.
   */
  const handleFeed = (foodItemId: number = 1) => {
    if (!pet) {
      showMessage('error', 'No pet found. Please create a pet first.')
      return
    }
    
    // VALIDATION: Check inventory for food
    const foodCount = pet.inventory?.[foodItemId] || 0
    if (foodCount === 0) {
      showMessage('error', 'No food available. Please purchase food from the Store first.')
      return
    }
    
    // Use the feed action (which consumes inventory)
    const result = feed(foodItemId)
    if (result) {
      const foodName = foodItemId === 1 ? 'Basic Food' : 'Premium Food'
      showMessage('success', `Fed pet with ${foodName}! Hunger restored.`)
    } else {
      showMessage('error', 'Failed to feed pet.')
    }
  }
  
  /**
   * Handles paid activities
   * 
   * These are "Toy or activity purchases" from the prompt.
   * Check if coins >= cost. If not: show "Not enough coins" message.
   * If yes: coins -= cost, logExpense("activity", cost), update stats and mood.
   */
  const handlePaidActivity = (activity: 'spa' | 'training' | 'park') => {
    if (!pet) {
      showMessage('error', 'No pet found. Please create a pet first.')
      return
    }
    
    let result
    switch (activity) {
      case 'spa':
        result = petSpaDay(15)
        break
      case 'training':
        result = trainingClass(10)
        break
      case 'park':
        result = parkTrip(12)
        break
    }
    
    if (result.success) {
      showMessage('success', result.message || 'Activity completed!')
    } else {
      showMessage('error', result.message || 'Failed to complete activity.')
    }
  }
  
  /**
   * Gets task state for a specific task
   */
  const getTaskState = (taskId: string) => {
    return taskState.find(ts => ts.taskId === taskId)
  }
  
  /**
   * Handles starting a task (opens mini-activity modal)
   * 
   * Tasks have cooldowns so users can't earn unlimited coins instantly.
   * This mimics real life chores and encourages budgeting.
   * Reward is only added when the user claims it.
   */
  const handleStartTask = (taskId: string) => {
    if (!pet) {
      showMessage('error', 'No pet found. Please create a pet first.')
      return
    }
    
    const task = GameCore.getTask(taskId)
    if (!task) {
      showMessage('error', 'Task not found.')
      return
    }
    
    const currentTaskState = getTaskState(taskId)
    
    // Check if task is on cooldown
    if (!canDoTask(task, currentTaskState)) {
      const remaining = timeRemaining(task, currentTaskState)
      const minutes = Math.floor(remaining / 60)
      const seconds = remaining % 60
      showMessage('error', `Task on cooldown! Ready in: ${minutes}:${seconds.toString().padStart(2, '0')}`)
      return
    }
    
    // Open mini-activity modal
    setActiveTask({
      taskId: task.id,
      name: task.name,
      emoji: task.emoji,
      coins: task.coins
    })
    
    // Mark task as in progress
    const updatedTaskState = [...taskState]
    const existingIndex = updatedTaskState.findIndex(ts => ts.taskId === taskId)
    if (existingIndex >= 0) {
      updatedTaskState[existingIndex].inProgress = true
    } else {
      updatedTaskState.push({ taskId, lastCompletedAt: null, inProgress: true })
    }
    setTaskState(updatedTaskState)
  }
  
  /**
   * Confirms and applies the task reward after mini-activity completion
   * 
   * Only after user clicks Claim:
   * - coins += rewardCoins
   * - xp += rewardXp (for evolution)
   * - stats += statChanges (happiness, cleanliness, etc.)
   * - logIncome("task", rewardCoins)
   * - task.lastCompletedAt = Date.now()
   * - close modal
   * - save to current slot
   */
  const confirmTaskReward = () => {
    if (!pet || !activeTask || !saveSlot) return
    
    try {
      // Get task definition to access XP and stat changes
      const taskDef = GameCore.getTask(activeTask.taskId)
      if (!taskDef) {
        showMessage('error', 'Task definition not found')
        setActiveTask(null)
        return
      }
      
      // Award coins
      const coinsResult = giveCoins(activeTask.coins, 'task')
      if (!coinsResult.pet) {
        showMessage('error', 'Failed to award coins')
        setActiveTask(null)
        return
      }
      let updatedPet: PetData = coinsResult.pet
      
      // Award XP (for evolution/age progression)
      // Use GameCore.giveXP directly to get updated pet with XP applied
      if (taskDef.xp && taskDef.xp > 0) {
        updatedPet = GameCore.giveXP(updatedPet, taskDef.xp)
      }
      
      // Apply stat changes (happiness, cleanliness, energy, health, hunger)
      if (taskDef.statChanges) {
        updatedPet = { ...updatedPet }
        updatedPet.stats = { ...updatedPet.stats }
        
        if (taskDef.statChanges.happiness !== undefined) {
          updatedPet.stats.happiness = Math.min(100, Math.max(0, updatedPet.stats.happiness + taskDef.statChanges.happiness))
        }
        if (taskDef.statChanges.cleanliness !== undefined) {
          updatedPet.stats.cleanliness = Math.min(100, Math.max(0, updatedPet.stats.cleanliness + taskDef.statChanges.cleanliness))
        }
        if (taskDef.statChanges.energy !== undefined) {
          updatedPet.stats.energy = Math.min(100, Math.max(0, updatedPet.stats.energy + taskDef.statChanges.energy))
        }
        if (taskDef.statChanges.health !== undefined) {
          updatedPet.stats.health = Math.min(100, Math.max(0, updatedPet.stats.health + taskDef.statChanges.health))
        }
        if (taskDef.statChanges.hunger !== undefined) {
          updatedPet.stats.hunger = Math.min(100, Math.max(0, updatedPet.stats.hunger + taskDef.statChanges.hunger))
        }
        
        updatedPet.lastUpdated = Date.now()
      }
      
      if (coinsResult.incomeRecord) {
        // Update task state: mark as completed, remove inProgress
        const updatedTaskState = [...taskState]
        const existingIndex = updatedTaskState.findIndex(ts => ts.taskId === activeTask.taskId)
        if (existingIndex >= 0) {
          updatedTaskState[existingIndex].lastCompletedAt = Date.now()
          updatedTaskState[existingIndex].inProgress = false
        } else {
          updatedTaskState.push({ 
            taskId: activeTask.taskId, 
            lastCompletedAt: Date.now(), 
            inProgress: false 
          })
        }
        setTaskState(updatedTaskState)
        
        // Save task state to slot
        const slotData = GameCore.loadAll(saveSlot) || { pet: null, expenses: [], income: [], quests: [], badges: [], meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot } }
        GameCore.saveAll(saveSlot, updatedPet, slotData.expenses || [], slotData.income || [], slotData.quests || [], updatedPet.badges || [], updatedTaskState)
        
        // Build reward message
        const rewardParts: string[] = [`${activeTask.coins} coins`]
        if (taskDef.xp && taskDef.xp > 0) {
          rewardParts.push(`+${taskDef.xp} XP`)
        }
        if (taskDef.statChanges) {
          if (taskDef.statChanges.happiness) rewardParts.push(`+${taskDef.statChanges.happiness} happiness`)
          if (taskDef.statChanges.cleanliness) rewardParts.push(`+${taskDef.statChanges.cleanliness} cleanliness`)
          if (taskDef.statChanges.energy && taskDef.statChanges.energy > 0) rewardParts.push(`+${taskDef.statChanges.energy} energy`)
          if (taskDef.statChanges.health) rewardParts.push(`+${taskDef.statChanges.health} health`)
        }
        
        showMessage('success', `Task completed! You earned: ${rewardParts.join(', ')}!`)
        setActiveTask(null)
      }
    } catch (error) {
      showMessage('error', `Failed to apply reward: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setActiveTask(null)
    }
  }
  
  /**
   * Cancels the task activity
   */
  const cancelTaskActivity = () => {
    if (activeTask) {
      // Remove inProgress flag
      const updatedTaskState = [...taskState]
      const existingIndex = updatedTaskState.findIndex(ts => ts.taskId === activeTask.taskId)
      if (existingIndex >= 0) {
        updatedTaskState[existingIndex].inProgress = false
        setTaskState(updatedTaskState)
      }
    }
    setActiveTask(null)
  }
  
  /**
   * Formats time remaining for display
   */
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  /**
   * Handles mini-game completion
   */
  const handleMiniGameComplete = (reward: { coins?: number; happiness?: number; clean?: number; xp?: number }) => {
    setMiniGameRewardPending(reward)
    setShowGame(false)
  }
  
  /**
   * Confirms and applies the pending mini-game reward
   */
  const confirmReward = () => {
    if (!pet || !miniGameRewardPending) return
    
    try {
      const result = applyReward(miniGameRewardPending)
      
      if (result.success) {
        saveAll()
        
        const rewardParts: string[] = []
        if (miniGameRewardPending.coins) rewardParts.push(`${miniGameRewardPending.coins} coins`)
        if (miniGameRewardPending.xp) rewardParts.push(`${miniGameRewardPending.xp} XP`)
        if (miniGameRewardPending.happiness) rewardParts.push(`+${miniGameRewardPending.happiness} happiness`)
        if (miniGameRewardPending.clean) rewardParts.push(`+${miniGameRewardPending.clean} cleanliness`)
        
        showMessage('success', `Reward collected! You earned: ${rewardParts.join(', ')}!`)
        setMiniGameRewardPending(null)
      }
    } catch (error) {
      showMessage('error', `Failed to apply rewards: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setMiniGameRewardPending(null)
    }
  }
  
  /**
   * Cancels the pending reward
   */
  const cancelReward = () => {
    setMiniGameRewardPending(null)
  }
  
  /**
   * Handles daily check-in claim
   * 
   * FBLA RUBRIC ALIGNMENT:
   * - Functions: handleDailyCheckInClaim() processes the claim
   * - Conditionals: Validates if check-in can be claimed
   * - Validation: Prevents multiple claims per day
   * - Financial responsibility: Daily check-in teaches consistent engagement
   */
  const handleDailyCheckInClaim = () => {
    if (!pet || !saveSlot) return
    
    const now = Date.now()
    const slotData = GameCore.loadAll(saveSlot) || {
      pet: null,
      expenses: [],
      income: [],
      quests: [],
      badges: [],
      meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot }
    }
    const lastCheckIn = slotData.meta?.lastCheckIn
    
    // FUNCTION: Claim daily check-in (validates eligibility and processes claim)
    const result = claimDailyCheckIn(pet, now, lastCheckIn)
    
    // CONDITIONAL: If claim failed, show error message
    if (!result) {
      setMessage({ text: 'Daily check-in already claimed today!', type: 'error' })
      setShowDailyCheckIn(false)
      return
    }
    
    // claimDailyCheckIn already added coins to pet, just apply XP
    if (!result.pet) {
      setMessage({ text: 'Error processing check-in reward', type: 'error' })
      setShowDailyCheckIn(false)
      return
    }
    
    const updatedPet = GameCore.giveXP(result.pet, DAILY_CHECKIN_XP)
    
    // Add income record
    const updatedIncome = [...(slotData.income || []), result.incomeRecord]
    
    // Save using GameCore.saveAll with updated lastCheckIn
    GameCore.saveAll(
      saveSlot,
      updatedPet,
      slotData.expenses || [],
      updatedIncome,
      slotData.quests || [],
      updatedPet.badges || [],
      slotData.taskState || null,
      slotData.meta?.demo,
      slotData.meta?.lastAllowanceClaim,
      result.lastCheckIn // Pass new lastCheckIn date
    )
    
    // Update local pet state for UI reactivity
    saveAll()
    
    // Evaluate badges after check-in claim (important event)
    setTimeout(() => evaluateAndAwardBadges(), 100)
    
    // Get actual reward amount from result
    const coinsEarned = result.incomeRecord.amount
    setMessage({ 
      text: `Daily check-in claimed! You earned ${coinsEarned}🪙 and ${DAILY_CHECKIN_XP} XP!`, 
      type: 'success' 
    })
    setShowDailyCheckIn(false)
  }
  
  /**
   * Closes daily check-in modal without claiming
   * 
   * If user closes modal without claiming, allow it to reappear next time they visit Care & Tasks
   */
  const handleCloseDailyCheckIn = () => {
    setShowDailyCheckIn(false)
  }
  
  // Safety guard: Show loading state
  // Render guard: Show loading if no slot
  if (!isLoading && !saveSlot) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="retro-panel p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6E5A47] mx-auto mb-4"></div>
          <div className="text-xl font-semibold mb-2 pixel-heading" style={{ color: 'var(--text)' }}>
            Loading...
          </div>
        </div>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAEEDC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5A4632] mx-auto mb-4"></div>
          <div className="text-2xl font-semibold text-[#5A4632]">Loading activities...</div>
        </div>
      </div>
    )
  }
  
  // Safety guard: If no pet or stats exist, show loading panel (no crash)
  if (!pet || !pet.stats) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="retro-panel p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6E5A47] mx-auto mb-4"></div>
          <div className="text-xl font-semibold mb-2 pixel-heading" style={{ color: 'var(--text)' }}>
            Loading...
          </div>
          <div className="text-sm pixel-body" style={{ color: 'var(--text)' }}>
            Please wait while we load your pet data
          </div>
        </div>
      </div>
    )
  }
  
  // Safety guard: If no pet exists, show message
  if (!pet) {
    return (
      <div className="min-h-screen bg-[#FAEEDC] flex items-center justify-center p-8 pixel-body">
        <div className="retro-panel p-8 max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="pixel-wrapper">
              <span className="pixel-emoji">📋</span>
            </div>
          </div>
          <h1 className="text-sm pixel-heading text-[#5A4632] mb-4">NO PET FOUND</h1>
          <p className="text-[#5A4632] mb-6 pixel-body">
            You need to create a pet first before accessing activities.
          </p>
          <button
            onClick={() => navigate('/create-pet')}
            className="retro-btn"
          >
            CREATE PET
          </button>
        </div>
      </div>
    )
  }
  
  // Safety guard: Ensure canDoTask and timeRemaining are available
  if (!canDoTask || !timeRemaining) {
    return (
      <div className="min-h-screen bg-[#FAEEDC] flex items-center justify-center p-8 pixel-body">
        <div className="retro-panel p-8 max-w-md text-center">
          <h1 className="text-sm pixel-heading text-[#5A4632] mb-4">Loading...</h1>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#FAEEDC] pixel-body">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" style={{ marginTop: '32px' }}>
        {/* Back to Dashboard Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="retro-btn px-4 py-2 text-sm pixel-font"
          >
            ← BACK TO HUB
          </button>
        </div>
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl mb-3 text-[#5A4632] pixel-heading">
            <div className="pixel-wrapper inline-flex mx-2">
              <span className="pixel-emoji">🎯</span>
            </div>
            {pageTitle}
          </h1>
          <p className="text-lg text-[#5A4632] pixel-body mb-2">
            Care for your pet and earn coins through activities!
          </p>
          <p className="text-sm text-[#6E5A47] pixel-body italic">
            💡 Feed requires food from Store. Other care actions are free. Complete tasks and quests to earn coins.
          </p>
        </div>
        
        {/* Message Display */}
        {message && (
          <div className={`mb-6 retro-panel p-4 text-center ${
            message.type === 'success' 
              ? 'bg-green-100 border-green-500' 
              : 'bg-red-100 border-red-500'
          }`}>
            <p className={`pixel-body text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        )}
        
        {/* SECTION A: Essential Care */}
        <div className="retro-panel p-6 mb-8">
          <h2 className="text-xl pixel-heading text-[#5A4632] mb-4 text-center">
            <span className="pixel-emoji">🏠</span> Essential Care
          </h2>
          <p className="text-sm text-[#5A4632] pixel-body mb-6 text-center">
            Feed your pet using food purchased from the Store. Other care actions are free.
            <br />
            <span className="text-xs italic">Food must be purchased before feeding - this teaches financial responsibility.</span>
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feed with Basic Food */}
            <button
              onClick={() => handleFeed(1)}
              disabled={!pet?.inventory?.[1] || pet.inventory[1] === 0}
              className={`retro-panel p-4 text-center transition-transform border-2 border-[#6E5A47] ${
                (!pet?.inventory?.[1] || pet.inventory[1] === 0) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
              }`}
            >
              <div className="text-4xl mb-2">🍖</div>
              <h3 className="pixel-heading text-sm text-[#5A4632] mb-1">Feed (Basic)</h3>
              <p className="pixel-body text-xs text-[#6E5A47]">
                {pet?.inventory?.[1] || 0} available
              </p>
              {(!pet?.inventory?.[1] || pet.inventory[1] === 0) && (
                <p className="pixel-body text-xs text-red-600 mt-1">Buy from Store</p>
              )}
            </button>
            
            {/* Feed with Premium Food */}
            <button
              onClick={() => handleFeed(2)}
              disabled={!pet?.inventory?.[2] || pet.inventory[2] === 0}
              className={`retro-panel p-4 text-center transition-transform border-2 border-[#6E5A47] ${
                (!pet?.inventory?.[2] || pet.inventory[2] === 0) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
              }`}
            >
              <div className="text-4xl mb-2">🥩</div>
              <h3 className="pixel-heading text-sm text-[#5A4632] mb-1">Feed (Premium)</h3>
              <p className="pixel-body text-xs text-[#6E5A47]">
                {pet?.inventory?.[2] || 0} available
              </p>
              {(!pet?.inventory?.[2] || pet.inventory[2] === 0) && (
                <div className="mt-2">
                  <Link
                    to="/store"
                    className="inline-block retro-btn px-3 py-1 text-xs bg-[#FFD782] hover:bg-[#FFC96B] text-[#5A4632]"
                  >
                    Go to Store
                  </Link>
                </div>
              )}
            </button>
            
            <button
              onClick={() => handleFreeCare('clean')}
              className="retro-panel p-4 text-center hover:scale-105 transition-transform border-2 border-[#6E5A47]"
            >
              <div className="text-4xl mb-2">🧼</div>
              <h3 className="pixel-heading text-sm text-[#5A4632] mb-1">Clean / Brush</h3>
              <p className="pixel-body text-xs text-[#6E5A47]">FREE</p>
            </button>
            
            <button
              onClick={() => handleFreeCare('rest')}
              className="retro-panel p-4 text-center hover:scale-105 transition-transform border-2 border-[#6E5A47]"
            >
              <div className="text-4xl mb-2">😴</div>
              <h3 className="pixel-heading text-sm text-[#5A4632] mb-1">Rest / Sleep</h3>
              <p className="pixel-body text-xs text-[#6E5A47]">FREE</p>
            </button>
          </div>
          
          {/* Health Care Section - Redirect to Store */}
          <div className="mt-6 pt-6 border-t-2 border-[#6E5A47]">
            <h3 className="text-lg pixel-heading text-[#5A4632] mb-3 text-center">
              <span className="pixel-emoji">🏥</span> Health Care
            </h3>
            <p className="text-xs text-[#5A4632] pixel-body mb-4 text-center italic">
              Health care costs money in real life. Purchase health services from the Store.
            </p>
            
            <div className="text-center">
              <Link
                to="/store"
                className="inline-block retro-btn px-6 py-3 bg-[#FFD782] hover:bg-[#FFC96B] text-[#5A4632] pixel-font"
              >
                <span className="pixel-emoji mr-2">🏥</span>
                Go to Store for Health Care
              </Link>
              <p className="text-xs text-[#6E5A47] pixel-body mt-3">
                Available services: Vet Visit (100🪙), Medicine (60🪙), Checkup Package (80🪙)
              </p>
            </div>
          </div>
        </div>
        
        {/* SECTION B: Paid Activities */}
        <div className="retro-panel p-6 mb-8">
          <h2 className="text-xl pixel-heading text-[#5A4632] mb-4 text-center">
            <span className="pixel-emoji">💰</span> Paid Activities
          </h2>
          <p className="text-sm text-[#5A4632] pixel-body mb-6 text-center">
            These are "Toy or activity purchases" from the prompt. They cost coins and log expenses for reports.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handlePaidActivity('spa')}
              disabled={coins < 15}
              className={`retro-panel p-4 text-center hover:scale-105 transition-transform border-2 ${
                coins >= 15 ? 'border-[#6E5A47]' : 'border-gray-300 opacity-60'
              }`}
            >
              <div className="text-4xl mb-2">💆</div>
              <h3 className="pixel-heading text-sm text-[#5A4632] mb-1">Pet Spa Day</h3>
              <p className="pixel-body text-xs text-[#A67C52] mb-2">💰 15 coins</p>
              <p className="pixel-body text-xs text-[#6E5A47]">Happiness + Cleanliness</p>
            </button>
            
            <button
              onClick={() => handlePaidActivity('training')}
              disabled={coins < 10}
              className={`retro-panel p-4 text-center hover:scale-105 transition-transform border-2 ${
                coins >= 10 ? 'border-[#6E5A47]' : 'border-gray-300 opacity-60'
              }`}
            >
              <div className="text-4xl mb-2">🎓</div>
              <h3 className="pixel-heading text-sm text-[#5A4632] mb-1">Training Class</h3>
              <p className="pixel-body text-xs text-[#A67C52] mb-2">💰 10 coins</p>
              <p className="pixel-body text-xs text-[#6E5A47]">Happiness + XP</p>
            </button>
            
            <button
              onClick={() => handlePaidActivity('park')}
              disabled={coins < 12}
              className={`retro-panel p-4 text-center hover:scale-105 transition-transform border-2 ${
                coins >= 12 ? 'border-[#6E5A47]' : 'border-gray-300 opacity-60'
              }`}
            >
              <div className="text-4xl mb-2">🌳</div>
              <h3 className="pixel-heading text-sm text-[#5A4632] mb-1">Park Trip</h3>
              <p className="pixel-body text-xs text-[#A67C52] mb-2">💰 12 coins</p>
              <p className="pixel-body text-xs text-[#6E5A47]">Happiness + Health</p>
            </button>
          </div>
        </div>
        
        {/* SECTION C: Earning System */}
        <div className="retro-panel p-6 mb-8">
          <h2 className="text-xl pixel-heading text-[#5A4632] mb-4 text-center">
            <span className="pixel-emoji">💵</span> Earning System
          </h2>
          <p className="text-sm text-[#5A4632] pixel-body mb-6 text-center">
            This section lets the user earn coins from tasks, not just get free money. All earnings tracked for reports.
          </p>
          
          {/* Weekly Allowance Panel */}
          {(() => {
            if (!saveSlot) return null
            const slotData = GameCore.loadAll(saveSlot)
            const lastClaim = slotData?.meta?.lastAllowanceClaim
            const now = Date.now()
            const timeInfo = timeUntilAllowance(now, lastClaim)
            const canClaim = canClaimAllowance(now, lastClaim)
            
            return (
              <div className="retro-panel p-4 mb-6 border-2 border-[#FFD782] bg-[#FFF9E6]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="pixel-wrapper">
                      <span className="pixel-emoji text-3xl">💰</span>
                    </div>
                    <div>
                      <h3 className="pixel-heading text-sm text-[#5A4632] mb-1">Weekly Allowance</h3>
                      <p className="pixel-body text-xs text-[#6E5A47]">
                        {canClaim ? 'Available now!' : timeInfo.formatted}
                      </p>
                      <p className="pixel-body text-xs text-[#5A4632] mt-1">
                        Amount: {WEEKLY_ALLOWANCE_AMOUNT} 🪙
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!pet || !saveSlot) return
                      
                      // FUNCTION: Claim allowance (validates eligibility and processes claim)
                      const result = claimAllowance(pet, now, lastClaim)
                      
                      // CONDITIONAL: If claim failed, show error message
                      if (!result) {
                        setMessage({ text: 'Allowance not available yet!', type: 'error' })
                        return
                      }
                      
                      // Load slot data
                      const data = GameCore.loadAll(saveSlot) || {
                        pet: null,
                        expenses: [],
                        income: [],
                        quests: [],
                        badges: [],
                        meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot }
                      }
                      
                      // Add income record
                      const updatedIncome = [...(data.income || []), result.incomeRecord]
                      
                      // Save using GameCore.saveAll with updated lastAllowanceClaim
                      GameCore.saveAll(
                        saveSlot,
                        result.pet,
                        data.expenses || [],
                        updatedIncome,
                        data.quests || [],
                        result.pet.badges || [],
                        data.taskState || null,
                        data.meta?.demo,
                        result.lastClaim // Pass new lastAllowanceClaim timestamp
                      )
                      
                      // Update local pet state for UI reactivity
                      saveAll()
                      
                      // Evaluate badges after allowance claim (important event)
                      setTimeout(() => evaluateAndAwardBadges(), 100)
                      
                      setMessage({ 
                        text: `Claimed ${WEEKLY_ALLOWANCE_AMOUNT} coins allowance!`, 
                        type: 'success' 
                      })
                    }}
                    disabled={!canClaim || !pet}
                    className={`retro-btn px-4 py-2 text-sm pixel-font ${
                      canClaim && pet
                        ? 'bg-[#FFD782] hover:bg-[#FFC96B] text-[#5A4632]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                    type="button"
                  >
                    {canClaim ? 'Claim Allowance' : 'Not Available'}
                  </button>
                </div>
                <p className="pixel-body text-xs text-[#6E5A47] mt-3 italic text-center">
                  Weekly allowance teaches budgeting by providing predictable income. Plan your spending around this weekly income!
                </p>
              </div>
            )
          })()}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTasks
              .filter((task) => task.id !== 'daily_checkin') // REMOVE daily check-in from earning system list
              .map((task) => {
              // Safety: Ensure task has required properties
              if (!task || !task.id) return null
              
              const currentTaskState = getTaskState(task.id)
              const canDo = canDoTask ? canDoTask(task, currentTaskState) : false
              const remaining = timeRemaining ? timeRemaining(task, currentTaskState) : 0
              
              return (
                <div key={task.id} className="retro-panel p-4 text-center border-2 border-[#6E5A47]">
                  <div className="mb-3 flex justify-center">
                    <div className="pixel-wrapper">
                      <span className="pixel-emoji text-4xl">{task.emoji}</span>
                    </div>
                  </div>
                  <h3 className="text-sm pixel-heading text-[#5A4632] mb-2">{task.name}</h3>
                  <p className="text-xs text-[#5A4632] pixel-body mb-3">{task.description}</p>
                  {/* Rewards Display - Shows coins, XP, and stat changes clearly for judges */}
                  <div className="mb-3 space-y-1">
                    <div className="text-lg pixel-font text-[#A67C52]">💰 {task.coins} coins</div>
                    <div className="text-sm pixel-body text-[#6E5A47]">
                      <div className="font-semibold text-[#5A4632] mb-1">Rewards:</div>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="text-[#4CAF50] font-semibold">+{task.xp || 0} XP</span>
                        {task.statChanges && (
                          <>
                            {task.statChanges.happiness && task.statChanges.happiness > 0 && (
                              <span className="text-[#FF9800]">+{task.statChanges.happiness} happiness</span>
                            )}
                            {task.statChanges.cleanliness && task.statChanges.cleanliness > 0 && (
                              <span className="text-[#2196F3]">+{task.statChanges.cleanliness} cleanliness</span>
                            )}
                            {task.statChanges.energy && task.statChanges.energy > 0 && (
                              <span className="text-[#9C27B0]">+{task.statChanges.energy} energy</span>
                            )}
                            {task.statChanges.health && task.statChanges.health > 0 && (
                              <span className="text-[#F44336]">+{task.statChanges.health} health</span>
                            )}
                            {task.statChanges.hunger && task.statChanges.hunger > 0 && (
                              <span className="text-[#FFC107]">+{task.statChanges.hunger} hunger</span>
                            )}
                            {/* Show negative stat changes too (e.g., energy -3 from walking) */}
                            {task.statChanges.energy && task.statChanges.energy < 0 && (
                              <span className="text-[#9C27B0] opacity-75">{task.statChanges.energy} energy</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!canDo && (
                    <div className="mb-2 text-xs pixel-body text-red-600">
                      Ready in: {formatTimeRemaining(remaining)}
                    </div>
                  )}
                  <button
                    onClick={() => handleStartTask(task.id)}
                    disabled={!canDo}
                    className={`retro-btn w-full ${
                      canDo 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {canDo ? 'Start Task' : 'On Cooldown'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* SECTION D: Mini-Games */}
        <div className="retro-panel p-6">
          <h2 className="text-xl pixel-heading text-[#5A4632] mb-4 text-center">
            <span className="pixel-emoji">🎮</span> Mini-Games
          </h2>
          <p className="text-sm text-[#5A4632] pixel-body mb-6 text-center">
            Play mini-games to earn coins, XP, and improve your pet's stats!
          </p>
          
          <div className="text-center">
            <button
              onClick={() => setShowGame(true)}
              className="retro-btn px-8 py-4 text-lg"
            >
              <span className="pixel-emoji mr-2">🎮</span>
              Play Random Mini-Game
            </button>
          </div>
        </div>
      </div>
      
      {/* Mini-Game Loader */}
      {showGame && (
        <MiniGameLoader
          onComplete={(reward) => {
            handleMiniGameComplete(reward)
          }}
        />
      )}
      
      {/* Task Activity Modal */}
      {activeTask && (
        <TaskActivityModal
          taskName={activeTask.name}
          taskEmoji={activeTask.emoji}
          rewardCoins={activeTask.coins}
          onComplete={confirmTaskReward}
          onCancel={cancelTaskActivity}
        />
      )}
      
      {/* Daily Check-In Modal */}
      {showDailyCheckIn && (
        <DailyCheckInModal
          coins={`${DAILY_CHECKIN_COINS_MIN}-${DAILY_CHECKIN_COINS_MAX}`}
          xp={DAILY_CHECKIN_XP}
          onClaim={handleDailyCheckInClaim}
          onClose={handleCloseDailyCheckIn}
        />
      )}
      
      {/* Mini-Game Reward Confirmation Popup */}
      {miniGameRewardPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="retro-panel p-8 max-w-md text-center bg-white border-4 border-[#6E5A47]">
            <div className="mb-4 flex justify-center">
              <span className="pixel-emoji-large">🎁</span>
            </div>
            <h2 className="text-xl pixel-heading text-[#6E5A47] mb-4">Game Complete!</h2>
            <div className="mb-6 pixel-body text-[#6E5A47]">
              <p className="text-lg font-bold mb-2">You earned:</p>
              <div className="space-y-2">
                {miniGameRewardPending.coins && (
                  <p className="text-base">💰 {miniGameRewardPending.coins} coins</p>
                )}
                {miniGameRewardPending.xp && (
                  <p className="text-base">⭐ {miniGameRewardPending.xp} XP</p>
                )}
                {miniGameRewardPending.happiness && (
                  <p className="text-base">😊 +{miniGameRewardPending.happiness} happiness</p>
                )}
                {miniGameRewardPending.clean && (
                  <p className="text-base">✨ +{miniGameRewardPending.clean} cleanliness</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmReward}
                className="px-6 py-3 retro-btn bg-green-500 hover:bg-green-600 text-white"
              >
                Collect Reward
              </button>
              <button
                onClick={cancelReward}
                className="px-6 py-3 retro-btn bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
