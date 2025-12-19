/**
 * Pet HUD Component - Collapsible Side Drawer
 * 
 * A collapsible drawer that shows pet vitals and key info on all main pages.
 * Provides quick access to pet status without navigating away.
 * 
 * Features:
 * - Toggle button (tiny square with arrow)
 * - Smooth slide-in/out animation
 * - Shows pet avatar, name, stage, mood, and 5 vitals
 * - Responsive: side drawer on desktop, bottom sheet on mobile
 * - Persists open/closed preference
 * - Safety guards for missing data
 * 
 * FBLA Requirements:
 * - Improves user experience with quick access to pet info
 * - Works across all pages consistently
 * - Responsive design for mobile devices
 * - Clear visual feedback
 */

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useGameCore } from '../useGameCore'
import PetAvatar from './PetAvatar'
import StatBar from './StatBar'
import { clamp } from '../core/utils'
import { getAgeStage, AGE_LABELS } from '../game/data'

function PetHUD() {
  const { pet, isLoading, mood, getMoodEmoji, stats } = useGameCore()
  const location = useLocation()
  
  // Force re-render when stats change by using stats directly
  // This ensures HUD updates when the global interval updates pet stats
  
  // Hide HUD on home and create-pet pages
  const hideOnRoutes = ['/', '/create-pet']
  const shouldShow = !hideOnRoutes.includes(location.pathname)
  
  // Load persisted preference
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('hud_open')
    return saved === 'true'
  })
  
  // Persist preference when toggled
  useEffect(() => {
    localStorage.setItem('hud_open', isOpen.toString())
  }, [isOpen])
  
  // Track mobile state with resize listener
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 640
  })
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Don't render on excluded routes
  if (!shouldShow) {
    return null
  }
  
  // Toggle handler
  const handleToggle = () => {
    setIsOpen(prev => !prev)
  }
  
  return (
    <>
      {/* Toggle Button - Fixed position */}
      <button
        onClick={handleToggle}
        className="hudToggleBtn"
        style={{
          position: 'fixed',
          ...(isMobile 
            ? { bottom: '16px', right: '16px' }
            : { 
                top: '50%', 
                right: isOpen ? '260px' : '16px',
                transform: 'translateY(-50%)'
              }
          ),
          zIndex: 1000,
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--panel)',
          border: '3px solid var(--border)',
          borderRadius: '4px',
          boxShadow: '2px 2px 0 var(--panel-shadow)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 200ms ease',
          padding: 0
        }}
        onMouseEnter={(e) => {
          if (isMobile) {
            e.currentTarget.style.transform = 'scale(1.1)'
          } else {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          }
          e.currentTarget.style.boxShadow = '3px 3px 0 var(--panel-shadow)'
        }}
        onMouseLeave={(e) => {
          if (isMobile) {
            e.currentTarget.style.transform = 'scale(1)'
          } else {
            e.currentTarget.style.transform = 'translateY(-50%)'
          }
          e.currentTarget.style.boxShadow = '2px 2px 0 var(--panel-shadow)'
        }}
        aria-label={isOpen ? 'Close pet HUD' : 'Open pet HUD'}
        title={isOpen ? 'Close pet HUD' : 'Open pet HUD'}
      >
        <span 
          className="pixel-font"
          style={{ 
            fontSize: '14px',
            color: 'var(--text)',
            transition: 'transform 200ms ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          {isOpen ? '◀' : '▶'}
        </span>
      </button>
      
      {/* Drawer Panel */}
      <div
        className={`hudDrawer ${isOpen ? 'hudOpen' : 'hudClosed'}`}
        style={{
          position: 'fixed',
          ...(isMobile 
            ? {
                bottom: '0',
                left: '0',
                right: '0',
                width: '100%',
                height: isOpen ? '45vh' : '0',
                borderTop: '3px solid var(--border)',
                boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'height 200ms ease',
                transform: 'none'
              }
            : {
                top: '0',
                right: '0',
                width: '260px',
                height: '100vh',
                borderLeft: '3px solid var(--border)',
                boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.2)',
                transition: 'transform 200ms ease',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
              }
          ),
          backgroundColor: 'var(--panel)',
          zIndex: 999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Drawer Content */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: 0 // Allows flex child to shrink below content size
          }}
        >
          {/* Header Row: Avatar + Name */}
          <div className="hudHeaderRow" style={{ textAlign: 'center' }}>
            {pet && pet.stats ? (
              <>
                <div className="mb-3 flex justify-center">
                  <PetAvatar
                    petType={pet.petType || 'cat'}
                    ageStage={pet.ageStage ?? getAgeStage(pet.xp)}
                    petName={pet.name}
                    happiness={pet.stats.happiness}
                    health={pet.stats.health}
                    mood={mood}
                    moodEmoji={getMoodEmoji(mood)}
                    size="medium"
                    isEvolving={false}
                  />
                </div>
                <h3 
                  className="pixel-heading mb-2"
                  style={{ 
                    color: 'var(--text)',
                    fontSize: '16px',
                    fontWeight: '700'
                  }}
                >
                  {pet.name.toUpperCase()}
                </h3>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6E5A47] mx-auto mb-4"></div>
                <p className="pixel-body text-sm" style={{ color: 'var(--text-muted)' }}>
                  {isLoading ? 'Loading...' : 'No pet loaded'}
                </p>
              </div>
            )}
          </div>
          
          {/* Sub Row: Type • Stage • Mood */}
          {pet && pet.stats && (
            <>
              <div 
                className="flex items-center justify-center gap-2 flex-wrap"
                style={{ marginBottom: '8px' }}
              >
                <span className="pixel-body capitalize text-xs" style={{ color: 'var(--text-muted)' }}>
                  {pet.petType || 'cat'}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span className="pixel-body capitalize text-xs" style={{ color: 'var(--text-muted)' }}>
                  {AGE_LABELS[pet.ageStage ?? getAgeStage(pet.xp)]}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <div 
                  className="inline-flex items-center gap-1 px-2 py-1"
                  style={{
                    backgroundColor: 'var(--accent-light)',
                    border: '2px solid var(--border)',
                    borderRadius: '12px'
                  }}
                >
                  <span className="pixel-emoji" style={{ fontSize: '12px' }}>
                    {getMoodEmoji(mood)}
                  </span>
                  <span className="pixel-font text-xs font-bold uppercase" style={{ color: 'var(--text)' }}>
                    {mood}
                  </span>
                </div>
              </div>
              
              {/* Divider */}
              <div 
                className="border-t-2"
                style={{ 
                  borderColor: 'var(--border)',
                  opacity: 0.3,
                  margin: '8px 0'
                }}
              ></div>
              
              {/* Vitals List */}
              <div className="space-y-3">
                <h4 
                  className="pixel-heading text-xs uppercase mb-3"
                  style={{ color: 'var(--text)' }}
                >
                  ⚡ VITALS
                </h4>
                
                <StatBar 
                  label="Health" 
                  value={clamp(stats?.health ?? pet?.stats?.health ?? 100)} 
                  icon="❤️"
                />
                <StatBar 
                  label="Hunger" 
                  value={clamp(stats?.hunger ?? pet?.stats?.hunger ?? 100)} 
                  icon="🍗"
                />
                <StatBar 
                  label="Energy" 
                  value={clamp(stats?.energy ?? pet?.stats?.energy ?? 100)} 
                  icon="🔋"
                />
                <StatBar 
                  label="Clean" 
                  value={clamp(stats?.cleanliness ?? pet?.stats?.cleanliness ?? 100)} 
                  icon="🧼"
                />
                <StatBar 
                  label="Happy" 
                  value={clamp(stats?.happiness ?? pet?.stats?.happiness ?? 100)} 
                  icon="😊"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default PetHUD

