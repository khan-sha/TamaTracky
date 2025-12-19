import { useState, useEffect, useRef } from 'react'
import { useGameCore } from '../useGameCore'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import PetAvatar from '../components/PetAvatar'
import DailyQuests from '../components/DailyQuests'
import { formatStat, clamp } from '../core/utils'
import { GameCore } from '../GameCore'
import { checkEvolution, acknowledgeEvolution } from '../core/pet'
import { getPetEmoji, getAgeStage, AGE_LABELS } from '../game/data'

/**
 * Dashboard Page Component (Game Hub)
 * 
 * Dashboard is the main hub where the user sees their pet and chooses what to do next.
 * Care & Activities is where the user performs essential care actions for free.
 * Store is where all spending happens and cost-of-care is tracked.
 * Reports show the running total of all care-related expenses.
 * This design teaches financial responsibility by separating care, spending, and analysis.
 * 
 * Game Design Features:
 * - Centered pet in a "play area" card with background
 * - HUD-style stat bars on the side (read-only overview)
 * - Big hub cards for navigation to major sections
 * - Mood-based background tints
 * - Smooth hover and click animations
 * 
 * FBLA Requirements:
 * - Intuitive game-like interface
 * - Clear visual feedback
 * - Accessible design
 * - Well-commented code
 * - Financial responsibility teaching through separation of care, spending, and analysis
 */
function Dashboard() {
  // Get game core functions
  const { 
    pet, 
    isLoading, 
    mood,
    stats, // Get stats directly to ensure reactivity
    updateStats,
    badges,
    getBadge,
    getMoodEmoji,
    getTotalCareCost,
    getCareCostByCategory,
    saveSlot,
    loadSlot,
    resetDemoMode,
    exitDemoMode,
    evaluateAndAwardBadges // Badge evaluation after important events
  } = useGameCore()
  
  // Use stats directly if available, fallback to pet.stats for reactivity
  const displayStats = stats || pet?.stats
  
  // Get theme context
  const { theme, toggleTheme } = useTheme()
  
  // State for demo mode
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)
  
  // State for pending age stage change event
  const [pendingEvolution, setPendingEvolution] = useState<{
    fromStage: number
    toStage: number
    atXp: number
    id: string
  } | null>(null)
  
  // State for trick unlock notification
  const [trickNotification, setTrickNotification] = useState<{ show: boolean, trickName?: string } | null>(null)
  
  // State for badge notification
  const [badgeNotification, setBadgeNotification] = useState<{ show: boolean, badgeId?: string } | null>(null)
  
  // State for warning toasts
  const [warnings, setWarnings] = useState<Array<{ id: string; message: string; type: string }>>([])
  
  // Track last warning time per stat to prevent spam
  const lastWarningTime = useRef<{ [key: string]: number }>({})
  
  // Navigation hook for redirecting if no pet exists
  const navigate = useNavigate()

  /**
   * Check for age stage change events when pet loads or changes.
   * Only triggers when age stage actually changes (XP reaches thresholds: 20, 60, 120).
   * 
   * IMPORTANT: This effect only sets pendingEvolution if:
   * 1. An age stage change event exists (ageStage changed)
   * 2. The change hasn't been acknowledged (lastEvolutionAckId doesn't match)
   * 3. There isn't already a pending change (to prevent re-triggering)
   */
  useEffect(() => {
    if (!pet || !saveSlot) return
    // Don't check if there's already a pending evolution (prevents re-triggering)
    if (pendingEvolution !== null) return

    try {
      // Check for evolution using the new system (only triggers on actual stage change)
      const result = checkEvolution(pet)
      
      // If evolution event exists and hasn't been acknowledged
      if (result.evolutionEvent) {
        const evolutionId = result.evolutionEvent.id
        
        // Check if this evolution has already been acknowledged
        if (pet.lastEvolutionAckId !== evolutionId) {
          // New evolution event - set as pending
          setPendingEvolution(result.evolutionEvent)
          
          // Update pet with new stage and save
          const slotData = GameCore.loadAll(saveSlot) || {
            pet: null,
            expenses: [],
            income: [],
            quests: [],
            badges: [],
            meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot }
          }
          
          if (slotData.pet) {
            const updatedPet = result.pet
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
            // Update local state
            updateStats()
          }
        }
      }
    } catch (error) {
      console.error('Error checking evolution:', error)
    }
  }, [pet, saveSlot, updateStats, pendingEvolution])
  
  /**
   * Check if demo mode is active
   */
  useEffect(() => {
    if (saveSlot) {
      try {
        const slotData = GameCore.loadAll(saveSlot)
        setIsDemoMode(slotData?.meta?.demo === true)
      } catch (error) {
        setIsDemoMode(false)
      }
    } else {
      setIsDemoMode(false)
    }
  }, [saveSlot, pet])
  
  // Render guard: Redirect to home if no current slot
  useEffect(() => {
    if (!isLoading && !saveSlot) {
      navigate('/')
    }
  }, [isLoading, saveSlot, navigate])

  // NOTE: Decay is now handled globally in useGameCore hook
  // No need for local decay intervals here - they cause double-decay

  /**
   * Warning system: Monitors pet stats and shows warnings when stats are critically low.
   * 
   * This effect:
   * 1. Watches pet stats for critical thresholds
   * 2. Shows warning toasts when stats drop below thresholds
   * 3. Prevents spam by tracking last warning time per stat
   * 4. Auto-dismisses warnings after 5 seconds
   * 
   * Warning Thresholds:
   * - Hunger < 20: "Tama is very hungry! Consider feeding soon."
   * - Health < 25: "Tama is feeling sick. A vet visit might help."
   * - Cleanliness < 20: "Tama needs cleaning!"
   * - Energy < 20: "Tama is very tired. Let them rest."
   * 
   * FBLA Alignment:
   * - Demonstrates real-time monitoring
   * - Provides proactive user feedback
   * - Enhances user experience with helpful warnings
   */
  useEffect(() => {
    if (!pet || !displayStats) return

    const now = Date.now()
    const WARNING_COOLDOWN = 30000 // 30 seconds between warnings for same stat
    const newWarnings: Array<{ id: string; message: string; type: string }> = []

    // Check hunger
    if (displayStats.hunger < 20) {
      const lastTime = lastWarningTime.current['hunger'] || 0
      if (now - lastTime > WARNING_COOLDOWN) {
        newWarnings.push({
          id: `hunger-${now}`,
          message: '⚠️ Tama is very hungry! Consider feeding soon.',
          type: 'hunger'
        })
        lastWarningTime.current['hunger'] = now
      }
    }

    // Check health
    if (displayStats.health < 25) {
      const lastTime = lastWarningTime.current['health'] || 0
      if (now - lastTime > WARNING_COOLDOWN) {
        newWarnings.push({
          id: `health-${now}`,
          message: '⚠️ Tama is feeling sick. A vet visit might help.',
          type: 'health'
        })
        lastWarningTime.current['health'] = now
      }
    }

    // Check cleanliness
    if (displayStats.cleanliness < 20) {
      const lastTime = lastWarningTime.current['cleanliness'] || 0
      if (now - lastTime > WARNING_COOLDOWN) {
        newWarnings.push({
          id: `cleanliness-${now}`,
          message: '⚠️ Tama needs cleaning!',
          type: 'cleanliness'
        })
        lastWarningTime.current['cleanliness'] = now
      }
    }

    // Check energy
    if (displayStats.energy < 20) {
      const lastTime = lastWarningTime.current['energy'] || 0
      if (now - lastTime > WARNING_COOLDOWN) {
        newWarnings.push({
          id: `energy-${now}`,
          message: '⚠️ Tama is very tired. Let them rest.',
          type: 'energy'
        })
        lastWarningTime.current['energy'] = now
      }
    }

    // Add new warnings
    if (newWarnings.length > 0) {
      setWarnings(prev => [...prev, ...newWarnings])
    }
  }, [pet, displayStats])

  /**
   * Auto-dismiss warnings after 5 seconds.
   */
  useEffect(() => {
    warnings.forEach(warning => {
      const timer = setTimeout(() => {
        setWarnings(prev => prev.filter(w => w.id !== warning.id))
      }, 5000)
      return () => clearTimeout(timer)
    })
  }, [warnings])
  
  // Render guard: Redirect to home if no current slot
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
  
  // Show loading state while pet is being loaded from database
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6E5A47] mx-auto mb-4"></div>
          <div className="text-xl font-semibold mb-2 pixel-heading" style={{ color: 'var(--text)' }}>
            Loading pet...
          </div>
          <div className="text-sm pixel-body" style={{ color: 'var(--text)' }}>
            Please wait while we load your pet from storage
          </div>
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
  
  
  return (
    <div className="min-h-screen pixel-body" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Age Stage Change Modal - Retro Pixel Style with Emoji */}
      {pendingEvolution && (() => {
        const getAgeStageEmoji = (): string => {
          const petType = pet.petType || 'cat'
          const toAgeStage = pendingEvolution.toStage as number
          return getPetEmoji(petType as any, toAgeStage as any)
        }
        
        const getAgeLabel = (ageStage: number): string => {
          return AGE_LABELS[ageStage as keyof typeof AGE_LABELS] || 'Unknown'
        }
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="retro-panel bg-purple-500 p-8 max-w-md mx-4">
              <div className="text-center">
                <div className="mb-4 animate-spin flex justify-center"><span className="pixel-emoji-large">✨</span></div>
                <h2 className="text-sm pixel-heading text-white mb-4">
                  GROWING UP!
                </h2>
                <div className="mb-4 flex justify-center"><span className="pixel-emoji-large">{getAgeStageEmoji()}</span></div>
                <p className="text-base pixel-body text-white mb-6">
                  {pet.name.toUpperCase()} GREW FROM {getAgeLabel(pendingEvolution.fromStage as number).toUpperCase()} TO {getAgeLabel(pendingEvolution.toStage as number).toUpperCase()}!
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    
                    if (!saveSlot || !pendingEvolution) return
                    
                    try {
                      // A) Acknowledge the evolution event
                      const slotData = GameCore.loadAll(saveSlot) || {
                        pet: null,
                        expenses: [],
                        income: [],
                        quests: [],
                        badges: [],
                        meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot }
                      }
                      
                      if (slotData.pet) {
                        // Write acknowledgement: pet.lastEvolutionAckId = pendingEvolution.id
                        const acknowledgedPet = acknowledgeEvolution(slotData.pet, pendingEvolution.id)
                        
                        // B) Persist immediately to the current save slot
                        GameCore.saveAll(
                          saveSlot,
                          acknowledgedPet,
                          slotData.expenses || [],
                          slotData.income || [],
                          slotData.quests || null,
                          acknowledgedPet.badges || [],
                          slotData.taskState || null,
                          slotData.meta?.demo
                        )
                        
                        // C) Clear modal state FIRST (prevents useEffect from re-triggering)
                        setPendingEvolution(null)
                        
                        // D) Reload the slot to update pet state with acknowledged evolution
                        // This ensures the pet state reflects lastEvolutionAckId, preventing re-trigger
                        loadSlot(saveSlot)
                        
                        // Evaluate badges after evolution (important event)
                        setTimeout(() => evaluateAndAwardBadges(), 200)
                      }
                    } catch (error) {
                      console.error('Error acknowledging evolution:', error)
                    }
                  }}
                  className="px-8 py-3 retro-btn bg-white text-purple-600"
                >
                  AWESOME!
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      
      {/* Trick Unlock Notification - Retro Pixel Style */}
      {trickNotification?.show && (
        <div className="fixed top-20 right-4 z-50 px-6 py-4 retro-panel bg-yellow-400 text-[#6E5A47]">
          <div className="flex items-center space-x-3">
            <span className="pixel-emoji">⭐</span>
            <div>
              <p className="pixel-font text-xs">TRICK UNLOCKED!</p>
              <p className="pixel-body text-sm">{trickNotification.trickName}</p>
            </div>
            <button
              onClick={() => setTrickNotification(null)}
              className="ml-4 text-[#6E5A47] hover:text-[#A67C52] pixel-font text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Badge Earned Notification - Retro Pixel Style */}
      {badgeNotification?.show && badgeNotification.badgeId && (() => {
        // This gets the badge info to display in the notification
        const badgeId = badgeNotification.badgeId!
        // Use getBadge function if available, otherwise fall back to badges object
        let badge = null
        try {
          if (getBadge && typeof getBadge === 'function') {
            badge = getBadge(badgeId)
          } else if (badges && typeof badges === 'object' && badges[badgeId]) {
            badge = badges[badgeId]
          }
        } catch (error) {
          console.error('Error getting badge:', error)
          // Fallback: try to get from badges object directly
          if (badges && typeof badges === 'object' && badges[badgeId]) {
            badge = badges[badgeId]
          }
        }
        if (!badge) return null
        
        return (
          <div className="fixed top-44 right-4 z-50 px-6 py-4 retro-panel bg-purple-500 text-white">
            <div className="flex items-center space-x-3">
              <span className="pixel-emoji">🏆</span>
              <div>
                <p className="pixel-font text-xs">BADGE EARNED!</p>
                <p className="pixel-body text-sm">{badge.name.toUpperCase()}</p>
                <p className="pixel-body text-xs opacity-90">{badge.description}</p>
              </div>
              <button
                onClick={() => setBadgeNotification(null)}
                className="ml-4 text-white hover:text-gray-200 pixel-font text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )
      })()}
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ============================================================
            ZONE 1: TOP HUD (Compact)
            ============================================================ */}
        <div className="mb-6" style={{ minHeight: '72px' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
            {/* Left: Title + Subtitle */}
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold pixel-heading mb-1" style={{ color: 'var(--text)', letterSpacing: '0.1em' }}>
                🎮 GAME HUB
              </h1>
              <p className="text-xs sm:text-sm pixel-body" style={{ color: 'var(--text-muted)' }}>
                View your pet and choose your next action
              </p>
            </div>
            
            {/* Right: Save Slot + Coins + Theme */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Demo Mode Banner */}
              {isDemoMode && (
                <div className="retro-panel px-3 py-2 flex items-center gap-1.5 whitespace-nowrap" style={{ 
                  backgroundColor: 'var(--accent-dark)',
                  border: '2px solid var(--border)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  <span className="pixel-emoji" style={{ fontSize: '16px' }}>🎮</span>
                  <span className="pixel-font text-xs font-bold uppercase tracking-wide text-white">
                    DEMO (FAST)
                  </span>
                </div>
              )}
              
              {/* Save Slot Indicator */}
              {saveSlot && (
                <div className="retro-panel px-3 py-2 flex items-center gap-1.5 whitespace-nowrap" style={{ 
                  backgroundColor: 'var(--panel)',
                  border: '2px solid var(--border)'
                }}>
                  <span className="pixel-font text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text)' }}>
                    SLOT {saveSlot}
                  </span>
                </div>
              )}
              
              {/* Coins Pill */}
              <div className="retro-panel px-3 sm:px-4 py-2 flex items-center gap-2 whitespace-nowrap" style={{ 
                backgroundColor: 'var(--accent-light)',
                border: '2px solid var(--border)'
              }}>
                <span className="pixel-emoji" style={{ fontSize: '20px' }}>🪙</span>
                <span className="pixel-font text-sm sm:text-base font-bold" style={{ color: 'var(--text)' }}>
                  {pet.coins.toLocaleString()}
                </span>
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="retro-btn px-3 py-2 flex items-center gap-1.5 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                style={{ 
                  backgroundColor: 'var(--panel)', 
                  color: 'var(--text)',
                  border: '2px solid var(--border)'
                }}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                <span className="pixel-emoji" style={{ fontSize: '18px' }}>{theme === 'light' ? '🌙' : '☀️'}</span>
                <span className="pixel-font text-xs sm:text-sm font-bold hidden sm:inline uppercase">{theme === 'light' ? 'DARK' : 'LIGHT'}</span>
              </button>
            </div>
          </div>
          
          {/* Divider Line */}
          <div className="border-t-2 mt-4" style={{ borderColor: 'var(--border)', opacity: 0.3 }}></div>
        </div>
        
        {/* ============================================================
            ZONE 2: PET STATUS PANEL (Centerpiece)
            ============================================================ */}
        {(() => {
          const totalCareCost = getTotalCareCost ? getTotalCareCost() : 0
          const categoryBreakdown = (pet && getCareCostByCategory) ? getCareCostByCategory() : null
          const topCategory = categoryBreakdown ? Object.entries(categoryBreakdown)
            .filter(([_, amount]) => amount > 0)
            .sort(([_, a], [__, b]) => b - a)[0] : null
          const topCategoryName = topCategory ? topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1) : 'None'
          
          return (
            <div className="retro-panel p-6 mb-6" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* A) PET CARD - Clean Single Panel */}
                  <div className="petCard flex flex-col items-center text-center">
                    {/* 1) AVATAR ROW (top) */}
                    <div className="mb-5">
                      {/* Pet Avatar - Centered */}
                      <div className="petAvatar mb-3 flex justify-center">
                        <PetAvatar
                          petType={pet.petType || 'cat'}
                          ageStage={pet.ageStage ?? getAgeStage(pet.xp || 0)}
                          petName={pet.name}
                          happiness={displayStats?.happiness ?? pet.stats.happiness}
                          health={displayStats?.health ?? pet.stats.health}
                          mood={mood}
                          moodEmoji={getMoodEmoji(mood)}
                          size="large"
                          isEvolving={pendingEvolution !== null}
                        />
                      </div>
                      {/* Mood Badge - Pill style label, not a button */}
                      <div className="petMoodPill inline-flex items-center gap-1.5 px-3 py-1.5" style={{
                        backgroundColor: 'var(--panel)',
                        border: '2px solid var(--border)',
                        borderRadius: '16px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}>
                        <span className="pixel-emoji" style={{ fontSize: '16px' }}>{getMoodEmoji(mood)}</span>
                        <span className="pixel-font text-xs font-bold uppercase" style={{ color: 'var(--text)', letterSpacing: '0.05em' }}>
                          {mood}
                        </span>
                      </div>
                    </div>
                    
                    {/* 2) IDENTITY ROW (middle) */}
                    <div className="mb-5 w-full">
                      {/* Pet Name - Large, only once */}
                      <h2 className="petName text-2xl pixel-heading mb-2" style={{ 
                        color: 'var(--text)', 
                        fontWeight: '700',
                        fontSize: '22px'
                      }}>
                        {pet.name.toUpperCase()}
                      </h2>
                      
                      {/* Pet Type + Age - Single line, only once */}
                      <div className="petMeta flex items-center justify-center gap-2">
                        <span className="pixel-body capitalize" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          {pet.petType || 'cat'}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span className="pixel-body capitalize" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          {AGE_LABELS[pet.ageStage ?? getAgeStage(pet.xp || 0)]}
                        </span>
                      </div>
                    </div>
                    
                    {/* 3) PROGRESS ROW (bottom) */}
                    <div className="petProgress w-full">
                      {/* XP: current / next threshold */}
                      <div className="mb-2 pixel-font font-semibold" style={{ color: 'var(--text)', fontSize: '14px' }}>
                        {(() => {
                          const ageStage = pet.ageStage ?? (pet.xp ? (pet.xp >= 120 ? 3 : pet.xp >= 60 ? 2 : pet.xp >= 20 ? 1 : 0) : 0)
                          if (ageStage === 0) {
                            const current = pet.xp
                            const next = 20
                            return `XP: ${current} / ${next}`
                          } else if (ageStage === 1) {
                            const current = pet.xp - 20
                            const next = 40 // 60 - 20
                            return `XP: ${current} / ${next}`
                          } else if (ageStage === 2) {
                            const current = pet.xp - 60
                            const next = 60 // 120 - 60
                            return `XP: ${current} / ${next}`
                          } else {
                            return `XP: ${pet.xp} (MAX)`
                          }
                        })()}
                      </div>
                      
                      {/* Next age stage label */}
                      <div className="mb-2 pixel-font text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                        {(() => {
                          const ageStage = pet.ageStage ?? (pet.xp ? (pet.xp >= 120 ? 3 : pet.xp >= 60 ? 2 : pet.xp >= 20 ? 1 : 0) : 0)
                          if (ageStage === 0) {
                            const remaining = 20 - pet.xp
                            return remaining > 0 ? `Next age stage in ${remaining} XP` : 'Ready to grow!'
                          }
                          if (ageStage === 1) {
                            const remaining = 60 - pet.xp
                            return remaining > 0 ? `Next age stage in ${remaining} XP` : 'Ready to grow!'
                          }
                          if (ageStage === 2) {
                            const remaining = 120 - pet.xp
                            return remaining > 0 ? `Next age stage in ${remaining} XP` : 'Ready to grow!'
                          }
                          return 'Fully grown!'
                        })()}
                      </div>
                      
                      {/* XP Progress Bar */}
                      <div className="w-full h-5" style={{ 
                        backgroundColor: 'var(--bg-alt)',
                        border: '3px solid var(--border)',
                        borderRadius: '2px'
                      }}>
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${(() => {
                              const ageStage = pet.ageStage ?? (pet.xp ? (pet.xp >= 120 ? 3 : pet.xp >= 60 ? 2 : pet.xp >= 20 ? 1 : 0) : 0)
                              if (ageStage === 0) return Math.min(100, (pet.xp / 20) * 100)
                              if (ageStage === 1) return Math.min(100, ((pet.xp - 20) / 40) * 100)
                              if (ageStage === 2) return Math.min(100, ((pet.xp - 60) / 60) * 100)
                              return 100
                            })()}%`,
                            backgroundColor: 'var(--accent-light)',
                            borderRight: '3px solid var(--border)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* B) VITALS */}
                  <div className="flex flex-col">
                    <h3 className="text-sm pixel-heading mb-4 text-center lg:text-left uppercase tracking-wide" style={{ color: 'var(--text)' }}>
                      ⚡ VITALS
                    </h3>
                    <div className="space-y-3.5">
                      {/* Health */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="pixel-font text-xs font-bold uppercase" style={{ color: 'var(--text)' }}>❤️ HEALTH</span>
                          <span className="pixel-body text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{formatStat(displayStats?.health ?? pet.stats.health)}</span>
                        </div>
                        <div className="stat-bar-track" style={{ height: '20px' }}>
                          <div className="stat-bar-fill transition-all duration-300" style={{ width: `${clamp(displayStats?.health ?? pet.stats.health)}%` }}></div>
                        </div>
                      </div>
                      
                      {/* Hunger */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="pixel-font text-xs font-bold uppercase" style={{ color: 'var(--text)' }}>🍗 HUNGER</span>
                          <span className="pixel-body text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{formatStat(displayStats?.hunger ?? pet.stats.hunger)}</span>
                        </div>
                        <div className="stat-bar-track" style={{ height: '20px' }}>
                          <div className="stat-bar-fill transition-all duration-300" style={{ width: `${clamp(displayStats?.hunger ?? pet.stats.hunger)}%` }}></div>
                        </div>
                      </div>
                      
                      {/* Energy */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="pixel-font text-xs font-bold uppercase" style={{ color: 'var(--text)' }}>🔋 ENERGY</span>
                          <span className="pixel-body text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{formatStat(displayStats?.energy ?? pet.stats.energy)}</span>
                        </div>
                        <div className="stat-bar-track" style={{ height: '20px' }}>
                          <div className="stat-bar-fill transition-all duration-300" style={{ width: `${clamp(displayStats?.energy ?? pet.stats.energy)}%` }}></div>
                        </div>
                      </div>
                      
                      {/* Cleanliness */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="pixel-font text-xs font-bold uppercase" style={{ color: 'var(--text)' }}>🧼 CLEAN</span>
                          <span className="pixel-body text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{formatStat(displayStats?.cleanliness ?? pet.stats.cleanliness)}</span>
                        </div>
                        <div className="stat-bar-track" style={{ height: '20px' }}>
                          <div className="stat-bar-fill transition-all duration-300" style={{ width: `${clamp(displayStats?.cleanliness ?? pet.stats.cleanliness)}%` }}></div>
                        </div>
                      </div>
                      
                      {/* Happiness */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="pixel-font text-xs font-bold uppercase" style={{ color: 'var(--text)' }}>😊 HAPPY</span>
                          <span className="pixel-body text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{formatStat(displayStats?.happiness ?? pet.stats.happiness)}</span>
                        </div>
                        <div className="stat-bar-track" style={{ height: '20px' }}>
                          <div className="stat-bar-fill transition-all duration-300" style={{ width: `${clamp(displayStats?.happiness ?? pet.stats.happiness)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* C) MONEY SNAPSHOT (VERY IMPORTANT - JUDGE FRIENDLY) */}
                  <div className="flex flex-col">
                    <h3 className="text-sm pixel-heading mb-4 text-center lg:text-left" style={{ color: 'var(--text)' }}>
                      💰 MONEY SNAPSHOT
                    </h3>
                    <div className="space-y-4">
                      {/* Total Care Cost - Prominent Display */}
                      <div className="retro-panel p-5 text-center" style={{ 
                        backgroundColor: 'var(--accent-light)',
                        border: '3px solid var(--border)',
                        boxShadow: '0 4px 0 var(--panel-shadow)'
                      }}>
                        <div className="pixel-body text-xs mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                          TOTAL CARE COST
                        </div>
                        <div className="pixel-font text-4xl font-bold mb-1" style={{ color: 'var(--text)' }}>
                          {totalCareCost.toLocaleString()}
                        </div>
                        <div className="pixel-body text-xs" style={{ color: 'var(--text-muted)' }}>
                          coins spent
                        </div>
                      </div>
                      
                      {/* Top Spending Category */}
                      {topCategory && (
                        <div className="retro-panel p-4" style={{ border: '2px solid var(--border)' }}>
                          <div className="pixel-body text-xs mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>
                            TOP SPENDING CATEGORY
                          </div>
                          <div className="pixel-font text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
                            {topCategoryName}
                          </div>
                          <div className="pixel-body text-sm" style={{ color: 'var(--text-muted)' }}>
                            {topCategory[1].toLocaleString()} coins
                          </div>
                        </div>
                      )}
                      
                      {/* View Reports Button - Primary CTA */}
                      <Link
                        to="/reports"
                        className="retro-btn px-6 py-4 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        style={{ 
                          backgroundColor: 'var(--accent-light)', 
                          color: 'var(--text)',
                          border: '3px solid var(--border)',
                          boxShadow: '0 4px 0 var(--panel-shadow)'
                        }}
                      >
                        <span className="pixel-font text-base font-bold">📊 VIEW MONEY REPORTS</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
          )
        })()}
        
        {/* ============================================================
            ZONE 3: MAIN MENU TILES (Big Buttons)
            ============================================================ */}
        <div className="mb-6">
          <h2 className="text-xl pixel-heading mb-6 text-center" style={{ color: 'var(--text)' }}>
            <span className="pixel-emoji mr-2">🎮</span> MAIN MENU
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tile 1: Care & Tasks */}
            <Link
              to="/tasks"
              className="retro-panel p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 border-2 border-[#6E5A47] flex flex-col items-center text-center h-full cursor-pointer"
              style={{ minHeight: '280px', borderWidth: '3px' }}
            >
              <div className="text-5xl mb-4">
                <span className="pixel-emoji">🏠</span>
              </div>
              <h3 className="text-lg pixel-heading mb-2" style={{ color: 'var(--text)' }}>
                CARE & TASKS
              </h3>
              <p className="text-xs pixel-body mb-6 flex-grow" style={{ color: 'var(--text-muted)' }}>
                Feed, clean, rest, health check + daily quests
              </p>
              <div className="retro-btn px-6 py-3 w-full bg-green-500 hover:bg-green-600 text-white transition-all duration-200">
                <span className="pixel-font text-sm font-bold">GO TO CARE</span>
              </div>
            </Link>
            
            {/* Tile 2: Pet Store */}
            <Link
              to="/store"
              className="retro-panel p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 border-2 border-[#6E5A47] flex flex-col items-center text-center h-full cursor-pointer"
              style={{ minHeight: '280px', borderWidth: '3px' }}
            >
              <div className="text-5xl mb-4">
                <span className="pixel-emoji">🛒</span>
              </div>
              <h3 className="text-lg pixel-heading mb-2" style={{ color: 'var(--text)' }}>
                PET STORE
              </h3>
              <p className="text-xs pixel-body mb-6 flex-grow" style={{ color: 'var(--text-muted)' }}>
                Buy food, toys, supplies, and health items
              </p>
              <div className="retro-btn px-6 py-3 w-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200">
                <span className="pixel-font text-sm font-bold">GO TO STORE</span>
              </div>
            </Link>
            
            {/* Tile 3: Money Reports (HIGHLIGHTED - JUDGE FRIENDLY) */}
            <Link
              to="/reports"
              className="retro-panel p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-200 border-4 border-yellow-500 flex flex-col items-center text-center h-full cursor-pointer relative overflow-hidden"
              style={{ 
                minHeight: '280px',
                backgroundColor: 'var(--accent-light)',
                boxShadow: '0 8px 16px rgba(234, 179, 8, 0.3)'
              }}
            >
              {/* Highlight Badge */}
              <div className="absolute top-2 right-2 px-2 py-1 retro-panel bg-yellow-500 text-white" style={{ fontSize: '10px' }}>
                <span className="pixel-font font-bold">⭐ FEATURED</span>
              </div>
              
              <div className="text-5xl mb-4">
                <span className="pixel-emoji">📊</span>
              </div>
              <h3 className="text-lg pixel-heading mb-2 font-bold" style={{ color: 'var(--text)' }}>
                MONEY REPORTS
              </h3>
              <p className="text-xs pixel-body mb-6 flex-grow" style={{ color: 'var(--text-muted)' }}>
                See total cost of care + spending breakdown
              </p>
              <div className="retro-btn px-6 py-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold transition-all duration-200 shadow-md">
                <span className="pixel-font text-sm font-bold">VIEW REPORTS</span>
              </div>
            </Link>
            
            {/* Tile 4: Badges */}
            <Link
              to="/achievements"
              className="retro-panel p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 border-2 border-[#6E5A47] flex flex-col items-center text-center h-full cursor-pointer"
              style={{ minHeight: '280px', borderWidth: '3px' }}
            >
              <div className="text-5xl mb-4">
                <span className="pixel-emoji">🏆</span>
              </div>
              <h3 className="text-lg pixel-heading mb-2" style={{ color: 'var(--text)' }}>
                BADGES
              </h3>
              <p className="text-xs pixel-body mb-6 flex-grow" style={{ color: 'var(--text-muted)' }}>
                Earn achievements for good care + smart spending
              </p>
              <div className="retro-btn px-6 py-3 w-full bg-purple-500 hover:bg-purple-600 text-white transition-all duration-200">
                <span className="pixel-font text-sm font-bold">VIEW BADGES</span>
              </div>
            </Link>
            
            {/* Tile 5: Help */}
            <Link
              to="/help"
              className="retro-panel p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 border-2 border-[#6E5A47] flex flex-col items-center text-center h-full cursor-pointer"
              style={{ minHeight: '280px', borderWidth: '3px' }}
            >
              <div className="text-5xl mb-4">
                <span className="pixel-emoji">❓</span>
              </div>
              <h3 className="text-lg pixel-heading mb-2" style={{ color: 'var(--text)' }}>
                HELP
              </h3>
              <p className="text-xs pixel-body mb-6 flex-grow" style={{ color: 'var(--text-muted)' }}>
                How to play + Q&A assistant
              </p>
              <div className="retro-btn px-6 py-3 w-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200">
                <span className="pixel-font text-sm font-bold">VIEW HELP</span>
              </div>
            </Link>
            
            {/* Tile 6: Care Guide */}
            <Link
              to="/guide"
              className="retro-panel p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 border-2 border-[#6E5A47] flex flex-col items-center text-center h-full cursor-pointer"
              style={{ minHeight: '280px', borderWidth: '3px' }}
            >
              <div className="text-5xl mb-4">
                <span className="pixel-emoji">📋</span>
              </div>
              <h3 className="text-lg pixel-heading mb-2" style={{ color: 'var(--text)' }}>
                CARE GUIDE
              </h3>
              <p className="text-xs pixel-body mb-6 flex-grow" style={{ color: 'var(--text-muted)' }}>
                Daily checklist + smart suggestions
              </p>
              <div className="retro-btn px-6 py-3 w-full bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-200">
                <span className="pixel-font text-sm font-bold">VIEW GUIDE</span>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Daily Quests Section */}
        <DailyQuests />
        
        {/* ============================================================
            DEMO MODE CONTROLS (Only shown in demo mode)
            ============================================================ */}
        {isDemoMode && (
          <div className="mt-8 mb-6">
            <div className="retro-panel p-6" style={{ 
              backgroundColor: 'var(--accent-light)',
              border: '3px solid var(--border)',
              boxShadow: '0 4px 0 var(--panel-shadow)'
            }}>
              <h3 className="text-lg pixel-heading mb-4 text-center" style={{ color: 'var(--text)' }}>
                🎮 DEMO MODE CONTROLS
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => {
                    if (saveSlot) {
                      // Reset demo mode (reseed same slot)
                      resetDemoMode(saveSlot)
                      // Load slot to refresh UI state
                      loadSlot(saveSlot)
                      // updateStats will be called automatically by loadSlot
                    }
                  }}
                  className="retro-btn px-6 py-3 transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--panel)', 
                    color: 'var(--text)',
                    border: '3px solid var(--border)'
                  }}
                >
                  <span className="pixel-font text-sm font-bold">🔄 RESET DEMO</span>
                </button>
                <button
                  onClick={() => {
                    if (saveSlot) {
                      // Exit demo mode (clear slot and go back to save-select/home)
                      exitDemoMode(saveSlot)
                      // Navigate to home (save-select)
                      navigate('/')
                    }
                  }}
                  className="retro-btn px-6 py-3 transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--panel)', 
                    color: 'var(--text)',
                    border: '3px solid var(--border)'
                  }}
                >
                  <span className="pixel-font text-sm font-bold">🚪 EXIT DEMO</span>
                </button>
              </div>
              <p className="text-xs pixel-body text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                Reset Demo recreates fresh demo data. Exit Demo returns to home and clears the demo slot.
              </p>
            </div>
          </div>
        )}
      </div>


      {/* Warning Toasts - Fixed position at top */}
      <div className="fixed top-20 left-4 z-50 space-y-2 max-w-sm">
        {warnings.map((warning) => (
          <div
            key={warning.id}
            className="retro-panel p-4 bg-orange-500 text-white animate-slide-in"
          >
            <div className="flex items-center justify-between">
              <p className="pixel-body text-sm">{warning.message}</p>
              <button
                onClick={() => setWarnings(prev => prev.filter(w => w.id !== warning.id))}
                className="ml-4 text-white hover:text-gray-200 pixel-font text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
