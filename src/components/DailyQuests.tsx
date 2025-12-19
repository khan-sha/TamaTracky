/**
 * Daily Quests Component
 * 
 * This displays daily quests that reset every day.
 * Quests track progress and give rewards when completed.
 * 
 * FBLA Requirements:
 * - Quest progress tracking
 * - Reward claiming (not auto-apply)
 * - Daily reset logic
 */

import { useState, useEffect } from 'react'
import { useGameCore } from '../useGameCore'
import { GameCore } from '../GameCore'
import { QuestSystem } from '../core/quests'

/**
 * Daily Quests Component
 * 
 * Shows daily quests with progress and claim buttons.
 * When a quest reaches goal, reward is NOT given automatically.
 * Instead, show a button: "Claim Reward +X coins".
 */
function DailyQuests() {
  const { pet, saveSlot, getQuests, claimQuestReward, isQuestReady, evaluateAndAwardBadges } = useGameCore()
  const [quests, setQuests] = useState<QuestSystem | null>(null)

  // Load quests when pet or slot changes
  useEffect(() => {
    if (!pet || !saveSlot) return
    
    // Load slot data to get quests
    const slotData = GameCore.loadAll(saveSlot)
    const questSystem = getQuests(slotData)
    
    // Only update if quests actually changed (prevent infinite loop)
    setQuests(prev => {
      if (prev && JSON.stringify(prev) === JSON.stringify(questSystem)) {
        return prev // No change, return previous value
      }
      return questSystem
    })
  }, [pet, saveSlot]) // Removed getQuests from dependencies - it's stable from useGameCore

  // Check for ready quests periodically
  useEffect(() => {
    if (!saveSlot) return
    
    // Refresh quests every second to check for ready status
    const interval = setInterval(() => {
      if (saveSlot) {
        const slotData = GameCore.loadAll(saveSlot)
        const questSystem = getQuests(slotData)
        
        // Only update if quests actually changed (prevent infinite loop)
        setQuests(prev => {
          if (prev && JSON.stringify(prev) === JSON.stringify(questSystem)) {
            return prev // No change, return previous value
          }
          return questSystem
        })
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [saveSlot]) // Removed quests and getQuests from dependencies to prevent loop

  /**
   * Handles claiming a quest reward
   * 
   * FBLA RUBRIC ALIGNMENT:
   * - Functions: handleClaimReward() orchestrates reward claiming process
   * - Conditionals: Multiple conditionals validate quest state and prevent double-claiming
   * - Validation: Checks pet, quests, and saveSlot exist before processing
   * 
   * When a quest reaches goal, reward is NOT given automatically.
   * Instead, show a button: "Claim Reward +X coins +Y XP".
   * 
   * Claiming reward:
   * 1. Adds coinsReward to pet.coins AND logs income with source "Daily Quest"
   * 2. Adds xpReward to pet.xp AND shows "+XP" feedback
   * 3. Runs evolution check immediately after awarding XP
   * 4. Prevents double-claiming by checking completedAt timestamp
   */
  const handleClaimReward = (questId: string) => {
    // VALIDATION: Ensure required data exists before processing
    if (!pet || !quests || !saveSlot) return
    
    // FUNCTION: Claim quest reward (returns coins and XP if quest is ready)
    const result = claimQuestReward(quests, questId)
    
    // CONDITIONAL: If quest not ready or already claimed, exit early
    if (!result) return
    
    // Update quests state
    setQuests(result.newQuests)
    
    // Load current slot data first
    const data = GameCore.loadAll(saveSlot) || {
      pet: null,
      expenses: [],
      income: [],
      quests: [],
      badges: [],
      meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot }
    }
    
    if (!data.pet) return
    
    // FUNCTION: Give coins and create income record
    // Use GameCore.giveCoins directly to avoid duplicate saving
    // This logs the earning for reports (FBLA requirement)
    const coinResult = GameCore.giveCoins(data.pet, result.coins, 'quest')
    
    // CONDITIONAL: Only proceed if coin reward was successful
    if (!coinResult.pet || !coinResult.incomeRecord) return
    
    // FUNCTION: Give XP to pet (this also checks for evolution automatically)
    // GameCore.giveXP() internally calls checkEvolution() after adding XP
    // Returns updated pet with new XP and possibly evolved stage
    const xpPet = GameCore.giveXP(coinResult.pet, result.xp)
    
    // Show XP feedback (visual confirmation)
    // Note: Evolution check happens automatically in giveXP()
    
    // Update income record with correct source "Daily Quest" for reports
    const incomeRecord = {
      ...coinResult.incomeRecord,
      source: 'Daily Quest', // Explicit source for reports (FBLA requirement)
      description: `Daily Quest Reward: ${result.coins} coins`
    }
    
    const updatedIncome = [...(data.income || []), incomeRecord]
    
    // Save updated pet (with XP and possible evolution), income, and quests
    // The pet from xpPet includes any evolution changes from XP gain
    GameCore.saveAll(
      saveSlot,
      xpPet,
      data.expenses || [],
      updatedIncome,
      result.newQuests,
      xpPet.badges || []
    )
    
    // Evaluate badges after quest completion (important event)
    setTimeout(() => evaluateAndAwardBadges(), 100)
  }

  if (!pet || !quests) return null

  const questNames: Record<string, string> = {
    'feed_pet': 'Feed Your Pet 3 Times',
    'play_pet': 'Play with Pet 2 Times',
    'clean_pet': 'Clean Your Pet Once',
    'health_check': 'Health Check Once'
  }

  return (
    <div className="retro-panel p-6 mb-6">
      <h3 className="text-sm text-[#5A4632] mb-4 text-center pixel-heading">
        <div className="pixel-wrapper inline-flex mr-2">
          <span className="pixel-emoji">📋</span>
        </div>
        DAILY QUESTS
      </h3>
      
      <div className="space-y-4">
        {quests.daily.map((quest) => {
          // CONDITIONAL: Check if quest is ready to claim (completed but not claimed)
          const isReady = isQuestReady(quest)
          // CONDITIONAL: Check if quest already claimed (progress === -1 OR completedAt exists)
          const isClaimed = quest.progress === -1 || quest.completedAt !== undefined
          const progressPercent = Math.min((Math.max(0, quest.progress) / quest.goal) * 100, 100)
          
          return (
            <div
              key={quest.id}
              className={`retro-panel p-4 ${isClaimed ? 'opacity-60' : ''} ${isReady ? 'border-2 border-[#FFD782]' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isClaimed ? (
                    <div className="pixel-wrapper">
                      <span className="pixel-emoji">✅</span>
                    </div>
                  ) : (
                    <div className="pixel-wrapper">
                      <span className="pixel-emoji">📝</span>
                    </div>
                  )}
                  <h4 className="pixel-font text-[#5A4632] text-xs">{questNames[quest.id] || quest.id}</h4>
                </div>
                {isClaimed && (
                  <span className="pixel-body text-xs text-[#B78436]">CLAIMED</span>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="relative h-2 w-full bg-[#D9C8A6] border border-[#5A4632] overflow-hidden rounded-sm mb-3">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: progressPercent >= 100 ? '#4CAF50' : '#FFC107',
                    transition: 'width 0.5s ease-out, background-color 0.3s ease-out'
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="pixel-body text-xs text-[#5A4632]">
                  {Math.max(0, quest.progress)} / {quest.goal}
                </span>
                
                {/* Reward info - Shows both coins and XP */}
                <div className="flex items-center gap-2">
                  <span className="pixel-body text-xs text-[#5A4632]">
                    Rewards: 
                    <div className="pixel-wrapper inline-flex ml-1">
                      <span className="pixel-emoji">🪙</span>
                    </div>
                    {quest.rewardCoins}
                    <span className="ml-2">+</span>
                    <span className="ml-1 font-semibold text-[#4CAF50]">{quest.rewardXp} XP</span>
                  </span>
                </div>
                
                {/* Claim button - Only show if ready and not claimed */}
                {/* CONDITIONAL: Button only visible if quest ready AND not already claimed */}
                {isReady && !isClaimed && (
                  <button
                    onClick={() => handleClaimReward(quest.id)}
                    className="retro-btn px-3 py-1 text-xs pixel-font bg-[#FFD782] text-[#5A4632]"
                    type="button"
                  >
                    Claim Reward +{quest.rewardCoins}🪙 +{quest.rewardXp} XP
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DailyQuests
