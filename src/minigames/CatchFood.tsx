import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * CatchFood Mini-Game Component
 * 
 * A canvas-based falling emoji game where the player (⭐) moves left/right
 * with arrow keys to catch falling food emojis (🍎 🍗 🥕).
 * 
 * Game Mechanics:
 * - Player moves with arrow keys (or touch buttons on mobile)
 * - Food items fall from the top
 * - Each catch increases score
 * - Game ends after 30 seconds or when player misses 5 items
 * 
 * Rewards:
 * - coins: score * 5
 * - happiness: 5
 * 
 * FBLA Requirements:
 * - Interactive gameplay
 * - Score tracking
 * - Mobile-friendly controls
 * - Relates to pet feeding/care
 */
interface CatchFoodProps {
  onComplete: (reward: { coins: number; happiness: number }) => void
}

function CatchFood({ onComplete }: CatchFoodProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameOver, setGameOver] = useState(false)
  const [playerX, setPlayerX] = useState(200)
  const [isMobile, setIsMobile] = useState(false)
  
  const foodItemsRef = useRef<Array<{ x: number; y: number; emoji: string; speed: number }>>([])
  const animationFrameRef = useRef<number>()
  const scoreRef = useRef(0)
  const missedRef = useRef(0)

  // Detect mobile device
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  // Handle keyboard input
  useEffect(() => {
    if (gameOver) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && playerX > 30) {
        setPlayerX(prev => Math.max(30, prev - 20))
      } else if (e.key === 'ArrowRight' && playerX < 370) {
        setPlayerX(prev => Math.min(370, prev + 20))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [playerX, gameOver])

  const endGame = useCallback(() => {
    if (gameOver) return
    setGameOver(true)
    // Use current score from ref
    setTimeout(() => {
      const finalReward = {
        coins: scoreRef.current * 5,
        happiness: 5
      }
      onComplete(finalReward)
    }, 1500)
  }, [onComplete, gameOver])

  // Game timer
  useEffect(() => {
    if (gameOver) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, endGame])

  // Spawn food items
  useEffect(() => {
    if (gameOver) return

    const spawnInterval = setInterval(() => {
      const emojis = ['🍎', '🍗', '🥕']
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      
      foodItemsRef.current.push({
        x: Math.random() * 340 + 30,
        y: -30,
        emoji: randomEmoji,
        speed: 2 + Math.random() * 2
      })
    }, 1000)

    return () => clearInterval(spawnInterval)
  }, [gameOver])

  // Game loop
  useEffect(() => {
    if (gameOver || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = () => {
      if (gameOver) return

      // Clear canvas
      ctx.fillStyle = '#FAEEDC'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw player
      ctx.font = '30px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('⭐', playerX, canvas.height - 30)

      // Update and draw food items
      foodItemsRef.current = foodItemsRef.current.filter(item => {
        item.y += item.speed

        // Check collision with player
        if (item.y > canvas.height - 50 && item.y < canvas.height - 10) {
          if (Math.abs(item.x - playerX) < 25) {
            scoreRef.current++
            setScore(scoreRef.current)
            return false // Remove caught item
          }
        }

        // Check if missed
        if (item.y > canvas.height) {
          missedRef.current++
          if (missedRef.current >= 5) {
            endGame()
          }
          return false // Remove missed item
        }

        // Draw food item
        ctx.fillText(item.emoji, item.x, item.y)
        return true
      })

      // Draw UI - Read latest values from state
      const currentScore = scoreRef.current
      const currentMissed = missedRef.current
      const currentTime = timeLeft
      
      ctx.fillStyle = '#5A4632'
      ctx.font = '16px Pixelify Sans'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${currentScore}`, 10, 25)
      ctx.fillText(`Time: ${currentTime}s`, 10, 45)
      ctx.fillText(`Missed: ${currentMissed}/5`, 10, 65)

      if (!gameOver) {
        animationFrameRef.current = requestAnimationFrame(gameLoop)
      }
    }

    gameLoop()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [playerX, gameOver, endGame, timeLeft])


  const handleMoveLeft = () => {
    if (playerX > 30) {
      setPlayerX(prev => prev - 20)
    }
  }

  const handleMoveRight = () => {
    if (playerX < 370) {
      setPlayerX(prev => prev + 20)
    }
  }

  if (gameOver) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="retro-panel p-8 text-center max-w-md">
          <div className="pixel-wrapper inline-flex mb-4">
            <span className="pixel-emoji">🎉</span>
          </div>
          <h2 className="pixel-heading text-[#5A4632] mb-4">GAME OVER!</h2>
          <p className="pixel-body text-[#5A4632] mb-2">Final Score: {score}</p>
          <p className="pixel-body text-[#5A4632] mb-4">
            You earned {score * 5} coins and +5 happiness!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="retro-panel p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <h2 className="pixel-heading text-[#5A4632] mb-2">CATCH FOOD</h2>
          <p className="pixel-body text-sm text-[#5A4632] mb-4">
            Use arrow keys to move ⭐ and catch falling food!
          </p>
        </div>
        
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full border-3 border-[#5A4632] bg-[#FAEEDC] rounded-sm mb-4"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        {/* Mobile controls */}
        {isMobile && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handleMoveLeft}
              className="retro-btn px-8 py-4 text-2xl"
            >
              ←
            </button>
            <button
              onClick={handleMoveRight}
              className="retro-btn px-8 py-4 text-2xl"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CatchFood

