import { useState, useEffect } from 'react'
import CatchFood from './CatchFood'
import CleanUp from './CleanUp'
import BudgetBlitz from './BudgetBlitz'

/**
 * MiniGameLoader Component
 * 
 * Randomly selects and loads one of three mini-games:
 * - CatchFood: Falling emoji catching game
 * - CleanUp: Click-to-clean grid game
 * - BudgetBlitz: Budget comparison game
 * 
 * FBLA Requirements:
 * - Random game selection for variety
 * - Consistent reward interface
 * - Modular game architecture
 * 
 * @param onComplete - Callback function that receives reward object when game completes
 */
interface MiniGameLoaderProps {
  onComplete: (reward: { coins?: number; happiness?: number; clean?: number; xp?: number }) => void
}

function MiniGameLoader({ onComplete }: MiniGameLoaderProps) {
  const [Game, setGame] = useState<React.ComponentType<{ onComplete: (reward: any) => void }> | null>(null)

  useEffect(() => {
    // Array of available mini-games
    const games = [CatchFood, CleanUp, BudgetBlitz]
    
    // Randomly select a game
    const RandomGame = games[Math.floor(Math.random() * games.length)]
    
    // Set the selected game component
    setGame(() => RandomGame)
  }, [])

  // Show loading state while game is being selected
  if (!Game) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="retro-panel p-8 text-center">
          <div className="pixel-wrapper inline-flex mb-4">
            <span className="pixel-emoji">🎮</span>
          </div>
          <p className="pixel-body text-[#5A4632]">Loading game...</p>
        </div>
      </div>
    )
  }

  // Render the randomly selected game
  return <Game onComplete={onComplete} />
}

export default MiniGameLoader

