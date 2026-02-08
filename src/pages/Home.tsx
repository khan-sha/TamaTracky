import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGameCore } from '../useGameCore'

/**
 * Home Page Component - Retro Game Start Screen
 * 
 * This is the landing page of the Tama Tracky application, designed to look
 * like a classic retro game start screen with pixel art aesthetics.
 * 
 * Game Design Features:
 * - Large retro game title with pixel panel
 * - Animated pet emoji with bounce effect
 * - Game-style menu buttons
 * - Animated background with sparkles and gradient
 * - Vignette effect for depth
 * 
 * FBLA Requirements:
 * - Clean home screen with logo
 * - Tagline display
 * - Start/Continue buttons
 * - Demo Mode for presentations
 * - Clear instructions
 */
function Home() {
  const { pet, isLoading, loadSlot, deleteSlot, getAllSlots, startDemoMode } = useGameCore()
  const navigate = useNavigate()
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [slots, setSlots] = useState<Array<{
    slotNumber: 1 | 2 | 3
    exists: boolean
    petName?: string
    petStage?: string
    petXP?: number
    lastPlayed?: string
  }>>([])
  const [deleteConfirm, setDeleteConfirm] = useState<1 | 2 | 3 | null>(null)
  const [showSlotSelector, setShowSlotSelector] = useState(false)
  
  /**
   * Loads slot information from storage.
   */
  const loadSlots = () => {
    const slotData = getAllSlots()
    setSlots(slotData)
  }
  
  /**
   * Effect hook that runs on component mount to load slot information.
   */
  useEffect(() => {
    loadSlots()
  }, [])
  
  /**
   * Handles demo mode activation.
   * Uses the robust startDemoMode function that creates comprehensive demo data.
   */
  const handleDemoMode = async () => {
    setIsDemoLoading(true)
    
    try {
      // Use slot 1 for demo - startDemoMode:
      // 1. Sets currentSlot FIRST
      // 2. Wipes slot clean
      // 3. Creates comprehensive demo data (pet + expenses + income + badges + quests)
      // 4. Saves everything
      startDemoMode(1)
      
      // Load the slot to update UI state (this loads into memory)
      loadSlot(1)
      
      // Navigate to dashboard ONLY AFTER load completes
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to start demo mode:', error)
      alert('Failed to start demo mode. Please try again.')
    } finally {
      setIsDemoLoading(false)
    }
  }
  
  /**
   * Handles starting a new game - shows slot selector or highlights empty slots.
   */
  const handleStartNewGameClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Show slot selector modal or highlight empty slots
    setShowSlotSelector(true)
  }
  
  /**
   * Handles starting a new game in a slot.
   * 
   * @param slotNumber - The slot number to start in
   */
  const handleStartNewGame = (slotNumber: 1 | 2 | 3) => {
    // Load the slot (will be empty)
    loadSlot(slotNumber)
    
    // Reload slots to update UI
    loadSlots()
    
    // Close selector and navigate to create pet
    setShowSlotSelector(false)
    navigate('/create-pet')
  }
  
  /**
   * Handles continuing an existing game in a slot.
   * 
   * @param slotNumber - The slot number to continue
   */
  const handleContinue = (slotNumber: 1 | 2 | 3) => {
    // Load the slot
    loadSlot(slotNumber)
    
    // Reload slots to update UI
    loadSlots()
    
    // Navigate to dashboard
    navigate('/dashboard')
  }
  
  /**
   * Handles deleting a save slot.
   * 
   * @param slotNumber - The slot number to delete
   */
  const handleDelete = (slotNumber: 1 | 2 | 3) => {
    try {
      deleteSlot(slotNumber)
      
      // Reload slots to update UI
      loadSlots()
      
      // Clear delete confirmation
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete slot:', error)
      alert('Failed to delete save slot. Please try again.')
    }
  }

  /**
   * Optional: Play sound effect on button click
   * This can be implemented with Web Audio API or HTML5 Audio
   */
  const playSelectSound = () => {
    // Optional: Add sound effect here
    // const audio = new Audio('/sounds/select.mp3')
    // audio.play().catch(() => {}) // Ignore errors if sound fails
  }
  
  return (
    <div className="game-start-screen">
      {/* Animated Background with Gradient and Sparkles */}
      <div className="animated-background">
        <div className="sparkle sparkle-1"></div>
        <div className="sparkle sparkle-2"></div>
        <div className="sparkle sparkle-3"></div>
        <div className="sparkle sparkle-4"></div>
        <div className="sparkle sparkle-5"></div>
        <div className="sparkle sparkle-6"></div>
      </div>
      
      {/* Vignette Effect */}
      <div className="vignette"></div>
      
      {/* Main Content Container - Centered */}
      <div className="home-container">
        <div className="home-inner">
          {/* Game Title Panel */}
          <div className="game-title-panel">
            <h1 className="game-title">TAMA TRACKY</h1>
            <p className="game-subtitle">Virtual Pet Care</p>
            <p className="text-xs pixel-body mt-2" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              💡 New? Click "START NEW GAME" → Choose a slot → Create your pet
            </p>
          </div>
          
          {/* Animated Pet Emoji */}
          <div className="pet-emoji-container">
            <div className="pixel-wrapper-large">
              <span className="pixel-emoji-large animate-bounce">🐾</span>
            </div>
          </div>
          
          {/* Game Menu Buttons */}
          <div className="game-menu-buttons">
            {/* Start New Game Button */}
            <button
              onClick={handleStartNewGameClick}
              className="game-menu-btn"
            >
              <span className="btn-icon">▶️</span>
              <span className="btn-text">START NEW GAME</span>
            </button>
            
            {/* Continue Button - Only show if pet exists */}
            {pet && !isLoading ? (
              <Link
                to="/dashboard"
                className="game-menu-btn"
                onClick={playSelectSound}
              >
                <span className="btn-icon">⏯️</span>
                <span className="btn-text">CONTINUE</span>
              </Link>
            ) : null}
            
            {/* Demo Mode Button */}
            <button
              onClick={() => {
                playSelectSound()
                handleDemoMode()
              }}
              className="game-menu-btn game-menu-btn-demo"
              disabled={isDemoLoading}
            >
              <span className="btn-icon">🎮</span>
              <span className="btn-text">
                {isDemoLoading ? 'LOADING...' : 'DEMO MODE'}
              </span>
            </button>
          </div>
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="loading-indicator">
              <p className="pixel-body" style={{ color: 'var(--text)' }}>
                Loading...
              </p>
            </div>
          )}
          
          {/* Save Slots Panel - Below buttons */}
          <div className="save-slots-panel">
            <div className="retro-panel p-6">
              <h2 className="text-2xl font-bold mb-6 text-center pixel-heading" style={{ color: 'var(--text-main)' }}>
                SAVE SLOTS
              </h2>
              <p className="text-sm text-center mb-6 pixel-body" style={{ color: 'var(--text-muted)' }}>
                Choose a save slot to manage multiple pets or playthroughs
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slots.map((slot) => (
                  <div 
                    key={slot.slotNumber} 
                    className={`retro-panel p-4 ${showSlotSelector && !slot.exists ? 'ring-4 ring-yellow-400' : ''}`}
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold pixel-heading mb-2" style={{ color: 'var(--text-main)' }}>
                        SLOT {slot.slotNumber}
                      </h3>
                      
                      {slot.exists ? (
                        <div className="space-y-2">
                          <p className="text-sm pixel-body" style={{ color: 'var(--text-main)' }}>
                            <span className="font-bold">Pet:</span> {slot.petName}
                          </p>
                          <p className="text-sm pixel-body" style={{ color: 'var(--text-main)' }}>
                            <span className="font-bold">Stage:</span> {slot.petStage?.toUpperCase()}
                          </p>
                          <p className="text-sm pixel-body" style={{ color: 'var(--text-main)' }}>
                            <span className="font-bold">XP:</span> {slot.petXP || 0}
                          </p>
                          {slot.lastPlayed && (
                            <p className="text-xs pixel-body opacity-75" style={{ color: 'var(--text-muted)' }}>
                              Last played: {new Date(slot.lastPlayed).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm pixel-body" style={{ color: 'var(--text-muted)' }}>
                          Empty Slot
                        </p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {slot.exists ? (
                        <>
                          <button
                            onClick={() => handleContinue(slot.slotNumber)}
                            className="w-full retro-btn"
                          >
                            CONTINUE
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(slot.slotNumber)}
                            className="w-full retro-btn"
                            style={{ 
                              backgroundColor: 'var(--bg-alt)',
                              color: 'var(--text-main)',
                              borderColor: '#F44336'
                            }}
                          >
                            DELETE SLOT
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartNewGame(slot.slotNumber)}
                          className="w-full retro-btn"
                        >
                          START NEW GAME HERE
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slot Selector Modal */}
      {showSlotSelector && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowSlotSelector(false)}
        >
          <div 
            className="retro-panel p-8 max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 pixel-heading" style={{ color: 'var(--text-main)' }}>
              SELECT A SAVE SLOT
            </h3>
            <p className="mb-6 pixel-body" style={{ color: 'var(--text-main)' }}>
              Choose an empty slot to start a new game:
            </p>
            <div className="space-y-2">
              {slots.filter(s => !s.exists).map((slot) => (
                <button
                  key={slot.slotNumber}
                  onClick={() => handleStartNewGame(slot.slotNumber)}
                  className="w-full retro-btn"
                >
                  SLOT {slot.slotNumber} - START NEW GAME
                </button>
              ))}
              {slots.filter(s => !s.exists).length === 0 && (
                <p className="text-sm pixel-body" style={{ color: 'var(--text-muted)' }}>
                  All slots are full. Delete a slot to create a new game.
                </p>
              )}
            </div>
            <button
              onClick={() => setShowSlotSelector(false)}
              className="w-full mt-4 retro-btn"
              style={{ backgroundColor: 'var(--bg-alt)' }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="retro-panel p-8 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4 pixel-heading" style={{ color: 'var(--text-main)' }}>
              DELETE SAVE SLOT?
            </h3>
            <p className="mb-6 pixel-body" style={{ color: 'var(--text-main)' }}>
              Are you sure you want to delete Slot {deleteConfirm}? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 retro-btn"
                style={{ 
                  backgroundColor: '#F44336',
                  color: 'var(--bg)'
                }}
              >
                DELETE
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 retro-btn"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
