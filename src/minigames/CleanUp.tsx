import { useState, useEffect } from 'react'

/**
 * CleanUp Mini-Game Component
 * 
 * A grid-based click-to-clean game where the player clicks on "dirt" emojis
 * to clean them up. When all dirt is cleaned, the game ends.
 * 
 * Game Mechanics:
 * - Grid of boxes with randomly placed dirt emojis (💩)
 * - Click each dirt to clean it
 * - Game ends when all dirt is cleaned
 * 
 * Rewards:
 * - clean: 10
 * - xp: 5
 * 
 * FBLA Requirements:
 * - Interactive click-based gameplay
 * - Visual feedback
 * - Mobile-friendly large click targets
 * - Relates to pet cleanliness/care
 */
interface CleanUpProps {
  onComplete: (reward: { clean: number; xp: number }) => void
}

function CleanUp({ onComplete }: CleanUpProps) {
  const GRID_SIZE = 4 // 4x4 grid
  const DIRT_COUNT = 8 // Number of dirt emojis to place
  
  const [grid, setGrid] = useState<Array<'dirt' | 'clean'>>([])
  const [cleaned, setCleaned] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  // Initialize grid with random dirt placement
  useEffect(() => {
    const newGrid = Array(GRID_SIZE * GRID_SIZE).fill('clean') as Array<'dirt' | 'clean'>
    const dirtPositions = new Set<number>()
    
    // Randomly place dirt
    while (dirtPositions.size < DIRT_COUNT) {
      const pos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE))
      dirtPositions.add(pos)
    }
    
    dirtPositions.forEach(pos => {
      newGrid[pos] = 'dirt'
    })
    
    setGrid(newGrid)
  }, [])

  const handleCellClick = (index: number) => {
    if (gameOver || grid[index] === 'clean') return

    const newGrid = [...grid]
    newGrid[index] = 'clean'
    setGrid(newGrid)
    
    const newCleaned = cleaned + 1
    setCleaned(newCleaned)

    // Check if all dirt is cleaned
    if (newCleaned >= DIRT_COUNT) {
      setGameOver(true)
      setTimeout(() => {
        onComplete({ clean: 10, xp: 5 })
      }, 1500)
    }
  }

  if (gameOver) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="retro-panel p-8 text-center max-w-md">
          <div className="pixel-wrapper inline-flex mb-4">
            <span className="pixel-emoji">✨</span>
          </div>
          <h2 className="pixel-heading text-[#5A4632] mb-4">ALL CLEAN!</h2>
          <p className="pixel-body text-[#5A4632] mb-4">
            You earned +10 cleanliness and +5 XP!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="retro-panel p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <h2 className="pixel-heading text-[#5A4632] mb-2">CLEAN UP</h2>
          <p className="pixel-body text-sm text-[#5A4632] mb-4">
            Click on all the dirt to clean it up!
          </p>
          <p className="pixel-body text-xs text-[#5A4632]">
            Cleaned: {cleaned} / {DIRT_COUNT}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {grid.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={cell === 'clean' || gameOver}
              className={`
                aspect-square w-full
                retro-panel
                flex items-center justify-center
                text-3xl
                transition-all
                ${cell === 'dirt' 
                  ? 'hover:bg-[#FFD782] cursor-pointer' 
                  : 'bg-[#F2D8B3] opacity-60 cursor-not-allowed'
                }
                ${cell === 'dirt' ? 'animate-pulse' : ''}
              `}
            >
              {cell === 'dirt' ? (
                <div className="pixel-wrapper">
                  <span className="pixel-emoji">💩</span>
                </div>
              ) : (
                <div className="pixel-wrapper">
                  <span className="pixel-emoji">✨</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CleanUp

