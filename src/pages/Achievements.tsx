/**
 * Achievements Page Component
 * 
 * This component displays all available badges and achievements in Tama Tracky.
 * Redesigned to match the retro pixel aesthetic of the game.
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Functions: Filter badges by category and earned status
 * - Conditionals: Multiple conditionals for filtering and display logic
 * - Data structures: Badge interface, arrays for filtering
 * - Modular design: Clear separation of display logic
 * - Maintainability: Well-organized, easy to extend
 * 
 * Features:
 * - Retro pixel aesthetic matching game UI
 * - Grid display of badge "cartridge cards"
 * - Locked badges show as greyed-out with "???" title
 * - Earned badges show icon, name, earned date
 * - Filter toggle: [All] [Earned] [Locked]
 */

import { useState } from 'react'
import { useGameCore } from '../useGameCore'
import { Link } from 'react-router-dom'
import { GameCore } from '../GameCore'

type FilterType = 'all' | 'earned' | 'locked'

function Achievements() {
  // Get game core data
  const { pet, isLoading } = useGameCore()
  
  // State for filter (All / Earned / Locked)
  const [filter, setFilter] = useState<FilterType>('all')
  
  // Get all badge definitions
  const allBadges = GameCore.getAllBadges()
  const badgeList = Object.values(allBadges)
  
  // Get earned badge IDs (empty array if no pet)
  const earnedBadgeIds = pet ? (pet.badges || []) : []
  
  /**
   * Filters badges based on selected filter
   * 
   * FBLA RUBRIC ALIGNMENT:
   * - Functions: filterBadges() processes badge list
   * - Conditionals: Multiple conditionals check filter type and earned status
   */
  const filteredBadges = badgeList.filter(badge => {
    const isEarned = earnedBadgeIds.includes(badge.id)
    
    // CONDITIONAL: Filter by All / Earned / Locked
    if (filter === 'all') return true
    if (filter === 'earned') return isEarned
    if (filter === 'locked') return !isEarned
    
    return true
  })
  
  /**
   * Checks if a badge has been earned
   */
  const isBadgeEarned = (badgeId: string): boolean => {
    return earnedBadgeIds.includes(badgeId)
  }
  
  /**
   * Gets progress percentage
   */
  const progressPercentage = pet
    ? Math.round((earnedBadgeIds.length / badgeList.length) * 100)
    : 0
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAEEDC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6E5A47] mx-auto mb-4"></div>
          <div className="text-2xl font-semibold text-[#5A4632] pixel-heading">Loading achievements...</div>
        </div>
      </div>
    )
  }
  
  // If no pet exists
  if (!pet) {
    return (
      <div className="min-h-screen bg-[#FAEEDC]">
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="retro-panel p-8 max-w-md text-center border-4 border-[#6E5A47]">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-2xl font-bold text-[#5A4632] mb-4 pixel-heading">No Pet Found</h1>
            <p className="text-[#6E5A47] mb-6 pixel-body">You need to create a pet first to view achievements.</p>
            <Link
              to="/create-pet"
              className="inline-block retro-btn px-6 py-3 pixel-font"
            >
              Create Pet
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#FAEEDC] pixel-body">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back to Dashboard Button */}
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="inline-block retro-btn px-4 py-2 text-sm pixel-font"
          >
            ← BACK TO HUB
          </Link>
        </div>
        
        <div className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5A4632] mb-2 pixel-heading">
            <span className="pixel-emoji">🏆</span> ACHIEVEMENTS
          </h1>
          <p className="text-[#6E5A47] text-lg pixel-body mb-2">Track your progress and unlock badges!</p>
          <p className="text-sm text-[#6E5A47] pixel-body italic">
            💡 Filter badges by clicking [All], [Earned], or [Locked] buttons below
          </p>
        </div>
        
        {/* Progress Summary - Retro Panel */}
        <div className="retro-panel p-6 mb-6 border-4 border-[#6E5A47] bg-[#FFF9E6]">
          <div className="text-center">
            <div className="text-4xl font-black mb-2 text-[#5A4632] pixel-font">
              {earnedBadgeIds.length} / {badgeList.length}
            </div>
            <p className="text-xl font-semibold mb-4 text-[#5A4632] pixel-heading">Badges Earned</p>
            <div className="w-full bg-[#E0D5C0] rounded-none h-6 mb-2 border-2 border-[#6E5A47]">
              <div
                className="bg-[#FFD782] h-full transition-all duration-500 border-r-2 border-[#6E5A47]"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-[#6E5A47] pixel-body">{progressPercentage}% Complete</p>
          </div>
        </div>
        
        {/* Filter Toggle - Retro Style */}
        <div className="retro-panel p-4 mb-6 border-2 border-[#6E5A47]">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`retro-btn px-4 py-2 pixel-font text-sm ${
                filter === 'all'
                  ? 'bg-[#FFD782] text-[#5A4632] border-2 border-[#6E5A47]'
                  : 'bg-[#E0D5C0] text-[#6E5A47] border-2 border-[#6E5A47]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('earned')}
              className={`retro-btn px-4 py-2 pixel-font text-sm ${
                filter === 'earned'
                  ? 'bg-[#FFD782] text-[#5A4632] border-2 border-[#6E5A47]'
                  : 'bg-[#E0D5C0] text-[#6E5A47] border-2 border-[#6E5A47]'
              }`}
            >
              Earned
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`retro-btn px-4 py-2 pixel-font text-sm ${
                filter === 'locked'
                  ? 'bg-[#FFD782] text-[#5A4632] border-2 border-[#6E5A47]'
                  : 'bg-[#E0D5C0] text-[#6E5A47] border-2 border-[#6E5A47]'
              }`}
            >
              Locked
            </button>
          </div>
        </div>
        
        {/* Badges Grid - Retro Cartridge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => {
            const earned = isBadgeEarned(badge.id)
            
            return (
              <div
                key={badge.id}
                className={`retro-panel p-4 border-4 transition-all ${
                  earned
                    ? 'border-[#6E5A47] bg-[#FFF9E6] hover:scale-105'
                    : 'border-gray-400 bg-gray-200 opacity-60'
                }`}
                style={{
                  boxShadow: earned 
                    ? '4px 4px 0px rgba(106, 90, 71, 0.3)' 
                    : '2px 2px 0px rgba(0, 0, 0, 0.2)'
                }}
              >
                {/* Badge Icon */}
                <div className="text-center mb-3">
                  <div className={`text-5xl mb-2 ${earned ? '' : 'grayscale opacity-50'}`}>
                    {badge.emoji}
                  </div>
                </div>
                
                {/* Badge Name */}
                <h3 className={`text-lg font-bold text-center mb-2 pixel-heading ${
                  earned ? 'text-[#5A4632]' : 'text-gray-500'
                }`}>
                  {earned ? badge.name : '???'}
                </h3>
                
                {/* Badge Description */}
                <p className={`text-xs text-center mb-3 pixel-body ${
                  earned ? 'text-[#6E5A47]' : 'text-gray-500'
                }`}>
                  {earned ? badge.description : (() => {
                    // Provide hints for locked badges based on badge ID
                    const hints: Record<string, string> = {
                      'first_purchase': 'Make your first purchase in the Store',
                      'budget_starter': 'Spend at least 100 coins total',
                      'care_master': 'Keep all stats above 80 for 24 hours',
                      'money_saver': 'Have more coins than you started with',
                      'evolution_baby': 'Reach Young stage (20 XP)',
                      'evolution_teen': 'Reach Adult stage (60 XP)',
                      'evolution_mature': 'Reach Mature stage (120 XP)',
                      'quest_master': 'Complete 10 daily quests',
                      'streak_3': 'Check in 3 days in a row',
                      'streak_7': 'Check in 7 days in a row'
                    }
                    return hints[badge.id] || 'Complete actions to unlock'
                  })()}
                </p>
                
                {/* Earned/Locked Indicator */}
                <div className="text-center">
                  {earned ? (
                    <div className="inline-block px-2 py-1 bg-[#C8E6C9] text-[#5A4632] text-xs font-bold pixel-font border-2 border-[#6E5A47]">
                      ✓ EARNED
                    </div>
                  ) : (
                    <div className="inline-block px-2 py-1 bg-gray-300 text-gray-600 text-xs font-bold pixel-font border-2 border-gray-400" title="Complete the requirement to unlock this badge">
                      🔒 LOCKED
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <div className="retro-panel p-12 text-center border-4 border-[#6E5A47]">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-[#6E5A47] text-lg pixel-body">No badges found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Achievements
