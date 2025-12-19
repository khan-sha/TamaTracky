/**
 * Task Activity Modal Component
 * 
 * Simple mini-activity that must be completed before claiming task reward.
 * This prevents spam clicking and teaches responsibility.
 * 
 * Activity: Hold button for 3 seconds (simple, consistent for all tasks)
 */

import { useState, useEffect } from 'react'

interface TaskActivityModalProps {
  taskName: string
  taskEmoji: string
  rewardCoins: number
  onComplete: () => void
  onCancel: () => void
}

export default function TaskActivityModal({
  taskName,
  taskEmoji,
  rewardCoins,
  onComplete,
  onCancel
}: TaskActivityModalProps) {
  const [progress, setProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Progress bar animation when holding
  useEffect(() => {
    if (!isHolding || isComplete) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true)
          return 100
        }
        return prev + (100 / 30) // 3 seconds = 30 intervals of 100ms
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isHolding, isComplete])

  const handleMouseDown = () => {
    setIsHolding(true)
  }

  const handleMouseUp = () => {
    if (!isComplete) {
      setIsHolding(false)
      setProgress(0)
    }
  }

  const handleClaim = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="retro-panel p-8 max-w-md text-center bg-white border-4 border-[#6E5A47]">
        {!isComplete ? (
          <>
            <div className="mb-4 flex justify-center">
              <span className="pixel-emoji-large text-6xl">{taskEmoji}</span>
            </div>
            <h2 className="text-xl pixel-heading text-[#6E5A47] mb-4">
              {taskName}
            </h2>
            <p className="pixel-body text-[#5A4632] mb-6">
              Hold the button to complete the task!
            </p>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-[#D9C8A6] border-2 border-[#5A4632] h-8 relative overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="pixel-font text-sm text-[#5A4632]">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Hold Button */}
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              className={`retro-btn px-8 py-4 text-lg mb-4 ${
                isHolding
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isHolding ? 'HOLDING...' : 'HOLD TO COMPLETE'}
            </button>

            <button
              onClick={onCancel}
              className="retro-btn px-6 py-2 text-sm bg-gray-400 hover:bg-gray-500 text-white"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <span className="pixel-emoji-large text-6xl">✅</span>
            </div>
            <h2 className="text-xl pixel-heading text-[#6E5A47] mb-4">
              Task Complete!
            </h2>
            <div className="mb-6 pixel-body text-[#5A4632]">
              <p className="text-lg font-bold mb-2">You earned:</p>
              <p className="text-base">💰 {rewardCoins} coins</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleClaim}
                className="px-6 py-3 retro-btn bg-green-500 hover:bg-green-600 text-white"
              >
                Claim Reward
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 retro-btn bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

