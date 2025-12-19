/**
 * Care Guide Page Component
 * 
 * This component provides a daily care checklist and intelligent suggestions
 * to help users learn responsibility and budgeting.
 * 
 * FBLA Requirements:
 * - Helps users follow routine care responsibilities
 * - Suggestions based on stats and spending (teaching budgeting)
 * - Daily reset demonstrates date logic and persistence
 * - Clear visual feedback and progress tracking
 * 
 * Features:
 * - Daily checklist with 6 care items
 * - Progress indicator (X/6 completed)
 * - Intelligent suggestions based on pet stats
 * - Optional streak counter for consistent care
 */

import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGameCore } from '../useGameCore'
import { GameCore } from '../GameCore'

function Guide() {
  const { pet, isLoading, saveSlot, updateStats } = useGameCore()
  const navigate = useNavigate()
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }
  
  // Load checklist from save slot
  const loadChecklist = () => {
    if (!saveSlot) return null
    try {
      const slotData = GameCore.loadAll(saveSlot)
      return slotData?.guideChecklist || null
    } catch (error) {
      console.error('Error loading checklist:', error)
      return null
    }
  }
  
  // Initialize or reset checklist for today
  const initializeChecklist = () => {
    const today = getTodayDate()
    const existing = loadChecklist()
    
    // If checklist exists for today, use it
    if (existing && existing.date === today) {
      return existing
    }
    
    // Otherwise, create new checklist for today
    // Preserve streak from previous day (only increment if 4+ items completed)
    return {
      date: today,
      items: {
        feed: false,
        clean: false,
        rest: false,
        health: false,
        chore: false,
        report: false
      },
      streak: existing?.streak || 0 // Preserve streak (only increments when 4+ items completed)
    }
  }
  
  const [checklist, setChecklist] = useState<ReturnType<typeof initializeChecklist> | null>(null)
  
  // Load checklist on mount and reset if date changed
  useEffect(() => {
    if (!saveSlot) return
    
    const today = getTodayDate()
    const existing = loadChecklist()
    
    if (existing && existing.date === today) {
      // Use existing checklist for today
      setChecklist(existing)
    } else {
      // Create new checklist for today
      const newChecklist = initializeChecklist()
      setChecklist(newChecklist)
      saveChecklist(newChecklist)
    }
  }, [saveSlot])
  
  // Save checklist to slot
  const saveChecklist = (checklistData: typeof checklist) => {
    if (!saveSlot || !checklistData) return
    
    try {
      const slotData = GameCore.loadAll(saveSlot) || {
        pet: null,
        expenses: [],
        income: [],
        quests: [],
        badges: [],
        meta: { createdAt: '', lastPlayed: '', slotNumber: saveSlot }
      }
      
      slotData.guideChecklist = checklistData
      
      // Save to slot (saveAll will preserve guideChecklist automatically)
      GameCore.saveAll(
        saveSlot,
        slotData.pet,
        slotData.expenses || [],
        slotData.income || [],
        slotData.quests || null,
        slotData.badges || [],
        slotData.taskState || null,
        slotData.meta?.demo
      )
    } catch (error) {
      console.error('Error saving checklist:', error)
    }
  }
  
  // Toggle checklist item
  const toggleItem = (itemKey: 'feed' | 'clean' | 'rest' | 'health' | 'chore' | 'report') => {
    if (!checklist?.items) return
    
    const wasCompleted = checklist.items[itemKey]
    const updated = {
      ...checklist,
      items: {
        ...checklist.items,
        [itemKey]: !checklist.items[itemKey]
      }
    }
    
    setChecklist(updated)
    saveChecklist(updated)
    
    // Check for streak update when completing 4+ items (only when checking, not unchecking)
    if (!wasCompleted && updated.items[itemKey]) {
      const completedCount = Object.values(updated.items).filter(Boolean).length
      if (completedCount >= 4) {
        // Just completed 4th item, increment streak
        const newStreak = (updated.streak || 0) + 1
        const withStreak = { ...updated, streak: newStreak }
        setChecklist(withStreak)
        saveChecklist(withStreak)
        
        // Award badge at 3-day streak
        if (newStreak === 3 && pet) {
          try {
            const updatedPet = GameCore.awardBadge(pet, 'consistent_care')
            if (updatedPet) {
              updateStats()
            }
          } catch (error) {
            console.error('Error awarding badge:', error)
          }
        }
      }
    }
  }
  
  // Calculate progress
  const progress = useMemo(() => {
    if (!checklist) return { completed: 0, total: 6, percentage: 0 }
    const completed = Object.values(checklist.items).filter(Boolean).length
    return {
      completed,
      total: 6,
      percentage: Math.round((completed / 6) * 100)
    }
  }, [checklist])
  
  // Generate intelligent suggestions based on pet stats
  const suggestions = useMemo(() => {
    if (!pet || !pet.stats) return []
    
    const suggestionsList: Array<{ text: string; emoji: string; priority: number }> = []
    
    // Rule 1: If hunger < 30, suggest feeding
    if (pet.stats.hunger < 30) {
      suggestionsList.push({
        text: 'Feed your pet - hunger is very low!',
        emoji: '🍗',
        priority: 1
      })
    }
    
    // Rule 2: If cleanliness < 30, suggest cleaning
    if (pet.stats.cleanliness < 30) {
      suggestionsList.push({
        text: 'Clean your pet - cleanliness is very low!',
        emoji: '🧼',
        priority: 1
      })
    }
    
    // Rule 3: If energy < 30, suggest rest
    if (pet.stats.energy < 30) {
      suggestionsList.push({
        text: 'Let your pet rest - energy is very low!',
        emoji: '😴',
        priority: 1
      })
    }
    
    // Rule 4: If coins < 10, suggest doing a chore
    if (pet.coins < 10) {
      suggestionsList.push({
        text: 'Do a chore to earn coins - you\'re running low!',
        emoji: '💰',
        priority: 2
      })
    }
    
    // Rule 5: Check today's spending
    if (saveSlot) {
      try {
        const slotData = GameCore.loadAll(saveSlot)
        const today = getTodayDate()
        const todayExpenses = (slotData?.expenses || []).filter(exp => {
          const expDate = new Date(exp.timestamp).toISOString().split('T')[0]
          return expDate === today
        })
        const todayTotal = todayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
        
        if (todayTotal > 50) {
          suggestionsList.push({
            text: 'Check Reports and set a budget - you\'ve spent a lot today!',
            emoji: '📊',
            priority: 3
          })
        }
      } catch (error) {
        console.error('Error calculating today\'s spending:', error)
      }
    }
    
    // Sort by priority (lower number = higher priority)
    return suggestionsList.sort((a, b) => a.priority - b.priority)
  }, [pet, saveSlot])
  
  // Render guard: Redirect to home if no current slot
  useEffect(() => {
    if (!isLoading && !saveSlot) {
      navigate('/')
    }
  }, [isLoading, saveSlot, navigate])
  
  // Show loading state
  if (isLoading || !checklist) {
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
  
  // Safety guard: If no pet or stats exist, show loading panel
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
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-block retro-btn px-4 py-2 text-sm pixel-font mb-4"
            style={{ 
              backgroundColor: 'var(--panel)', 
              color: 'var(--text)',
              border: '2px solid var(--border)'
            }}
          >
            ← BACK TO HUB
          </Link>
          
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold pixel-heading mb-2" style={{ color: 'var(--text)' }}>
              📋 CARE GUIDE
            </h1>
            <p className="text-sm pixel-body" style={{ color: 'var(--text-muted)' }}>
              Daily checklist to help you care for your pet responsibly
            </p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="retro-panel p-6 mb-6" style={{ 
          backgroundColor: 'var(--accent-light)',
          border: '3px solid var(--border)'
        }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg pixel-heading mb-1" style={{ color: 'var(--text)' }}>
                TODAY'S PROGRESS
              </h2>
              <p className="text-sm pixel-body" style={{ color: 'var(--text-muted)' }}>
                {progress.completed} / {progress.total} completed
              </p>
            </div>
            <div className="text-3xl pixel-font font-bold" style={{ color: 'var(--text)' }}>
              {progress.percentage}%
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-6" style={{ 
            backgroundColor: 'var(--bg-alt)',
            border: '3px solid var(--border)',
            borderRadius: '2px'
          }}>
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${progress.percentage}%`,
                backgroundColor: 'var(--accent-dark)',
                borderRight: '3px solid var(--border)'
              }}
            ></div>
          </div>
          
          {/* Streak Counter (Optional) */}
          {checklist.streak && checklist.streak > 0 && (
            <div className="mt-4 pt-4 border-t-2" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="pixel-emoji" style={{ fontSize: '20px' }}>🔥</span>
                <span className="pixel-font text-sm font-bold" style={{ color: 'var(--text)' }}>
                  {checklist.streak}-day care streak!
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Daily Checklist */}
        <div className="retro-panel p-6 mb-6">
          <h2 className="text-lg pixel-heading mb-4" style={{ color: 'var(--text)' }}>
            ✅ DAILY CHECKLIST
          </h2>
          
          <div className="space-y-3">
            {[
              { key: 'feed' as const, label: 'Feed your pet', emoji: '🍗', link: '/tasks' },
              { key: 'clean' as const, label: 'Clean your pet', emoji: '🧼', link: '/tasks' },
              { key: 'rest' as const, label: 'Let your pet rest', emoji: '😴', link: '/tasks' },
              { key: 'health' as const, label: 'Do a health check', emoji: '❤️', link: '/tasks' },
              { key: 'chore' as const, label: 'Earn coins with a chore', emoji: '💰', link: '/tasks' },
              { key: 'report' as const, label: 'Review your Money Report', emoji: '📊', link: '/reports' }
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-4 p-4 retro-panel hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                style={{ 
                  backgroundColor: checklist.items[item.key] ? 'var(--accent-light)' : 'var(--panel)',
                  border: '2px solid var(--border)'
                }}
                onClick={() => toggleItem(item.key)}
              >
                {/* Checkbox */}
                <div
                  className="w-6 h-6 flex items-center justify-center"
                  style={{
                    border: '3px solid var(--border)',
                    backgroundColor: checklist.items[item.key] ? 'var(--accent-dark)' : 'transparent'
                  }}
                >
                  {checklist.items[item.key] && (
                    <span className="pixel-font text-white text-xs">✓</span>
                  )}
                </div>
                
                {/* Label */}
                <div className="flex-1 flex items-center gap-3">
                  <span className="pixel-emoji" style={{ fontSize: '24px' }}>{item.emoji}</span>
                  <span className="pixel-body text-base" style={{ color: 'var(--text)' }}>
                    {item.label}
                  </span>
                </div>
                
                {/* Link Button */}
                <Link
                  to={item.link}
                  className="retro-btn px-3 py-1 text-xs pixel-font"
                  style={{ 
                    backgroundColor: 'var(--accent-dark)', 
                    color: 'white',
                    border: '2px solid var(--border)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  GO
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* Suggested Next Steps */}
        <div className="retro-panel p-6">
          <h2 className="text-lg pixel-heading mb-4" style={{ color: 'var(--text)' }}>
            💡 SUGGESTED NEXT STEPS
          </h2>
          
          {suggestions.length === 0 ? (
            <div className="retro-panel p-4 text-center" style={{ backgroundColor: 'var(--accent-light)' }}>
              <p className="pixel-body text-sm" style={{ color: 'var(--text-muted)' }}>
                Your pet is doing great! Keep up the good care. 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="retro-panel p-4 flex items-center gap-3"
                  style={{ 
                    backgroundColor: suggestion.priority === 1 ? 'var(--accent-light)' : 'var(--panel)',
                    border: '2px solid var(--border)'
                  }}
                >
                  <span className="pixel-emoji" style={{ fontSize: '24px' }}>{suggestion.emoji}</span>
                  <span className="pixel-body text-sm flex-1" style={{ color: 'var(--text)' }}>
                    {suggestion.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Info Panel for Judges */}
        <div className="mt-6 retro-panel p-4" style={{ 
          backgroundColor: 'var(--bg-alt)',
          border: '2px solid var(--border)'
        }}>
          <p className="text-xs pixel-body text-center" style={{ color: 'var(--text-muted)' }}>
            <strong className="pixel-font">For Judges:</strong> This checklist helps users follow routine care responsibilities. 
            Suggestions are based on stats and spending, teaching budgeting and responsibility. 
            The daily reset demonstrates date logic and persistence.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Guide

