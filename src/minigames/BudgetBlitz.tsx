import { useState } from 'react'

/**
 * BudgetBlitz Mini-Game Component
 * 
 * A budget comparison game where the player must select the cheapest item
 * among three options. Teaches budgeting and cost awareness.
 * 
 * Game Mechanics:
 * - Three items displayed with prices
 * - Player must select the cheapest option
 * - Correct answer rewards coins
 * - Wrong answer prompts retry
 * 
 * Rewards:
 * - coins: 15 (on correct answer)
 * 
 * FBLA Requirements:
 * - Educational gameplay about costs
 * - Clear feedback
 * - Mobile-friendly tap buttons
 * - Directly relates to pet care costs and budgeting
 */
interface BudgetBlitzProps {
  onComplete: (reward: { coins: number }) => void
}

interface Item {
  emoji: string
  name: string
  cost: number
}

function BudgetBlitz({ onComplete }: BudgetBlitzProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)

  // Game items with different prices
  const items: Item[] = [
    { emoji: '🍗', name: 'Food', cost: 5 },
    { emoji: '🧴', name: 'Shampoo', cost: 12 },
    { emoji: '🧸', name: 'Toy', cost: 20 }
  ]

  // Find the cheapest item
  const cheapestCost = Math.min(...items.map(item => item.cost))
  const cheapestIndex = items.findIndex(item => item.cost === cheapestCost)

  const handleItemSelect = (index: number) => {
    if (showResult || gameComplete) return

    setSelectedItem(index)
    const correct = index === cheapestIndex
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setTimeout(() => {
        setGameComplete(true)
        setTimeout(() => {
          onComplete({ coins: 15 })
        }, 2000)
      }, 1500)
    }
  }

  const handleRetry = () => {
    setSelectedItem(null)
    setShowResult(false)
    setIsCorrect(false)
  }

  if (gameComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="retro-panel p-8 text-center max-w-md">
          <div className="pixel-wrapper inline-flex mb-4">
            <span className="pixel-emoji">🎉</span>
          </div>
          <h2 className="pixel-heading text-[#5A4632] mb-4">CORRECT!</h2>
          <p className="pixel-body text-[#5A4632] mb-4">
            You earned 15 coins for choosing the cheapest item!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="retro-panel p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="pixel-heading text-[#5A4632] mb-2">BUDGET BLITZ</h2>
          <p className="pixel-body text-sm text-[#5A4632] mb-4">
            Select the CHEAPEST item to earn coins!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemSelect(index)}
              disabled={showResult || gameComplete}
              className={`
                w-full retro-panel p-4
                flex items-center justify-between
                transition-all
                ${showResult && selectedItem === index
                  ? isCorrect
                    ? 'bg-green-200 border-green-500'
                    : 'bg-red-200 border-red-500'
                  : 'hover:bg-[#FFD782]'
                }
                ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="pixel-wrapper">
                  <span className="pixel-emoji">{item.emoji}</span>
                </div>
                <span className="pixel-body text-[#5A4632] font-bold">{item.name}</span>
              </div>
              <div className="pixel-font text-[#5A4632]">
                {item.cost} coins
              </div>
            </button>
          ))}
        </div>

        {showResult && !isCorrect && (
          <div className="text-center">
            <p className="pixel-body text-red-600 mb-4">
              Wrong! The cheapest item was {items[cheapestIndex].name} ({items[cheapestIndex].cost} coins).
            </p>
            <button
              onClick={handleRetry}
              className="retro-btn"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {showResult && isCorrect && (
          <div className="text-center">
            <p className="pixel-body text-green-600 mb-2">
              Correct! {items[cheapestIndex].name} is the cheapest!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetBlitz

