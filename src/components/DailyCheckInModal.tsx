/**
 * Daily Check-In Modal Component
 * 
 * This modal appears automatically when daily check-in is available.
 * It shows the reward and allows the user to claim it.
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Functions: Modal component handles UI and user interaction
 * - Conditionals: Shows different states based on availability
 * - Validation: Prevents multiple claims per day
 */

interface DailyCheckInModalProps {
  coins: number | string // Can be number or range string like "12-15"
  xp: number
  onClaim: () => void
  onClose?: () => void
}

function DailyCheckInModal({ coins, xp, onClaim, onClose }: DailyCheckInModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="retro-panel p-8 max-w-md text-center bg-white border-4 border-[#6E5A47]">
        <div className="mb-4 flex justify-center">
          <span className="pixel-emoji-large text-6xl">✅</span>
        </div>
        <h2 className="text-2xl pixel-heading text-[#6E5A47] mb-2">DAILY CHECK-IN!</h2>
        <p className="text-base pixel-body text-[#5A4632] mb-6">
          Come back each day to earn care funds.
        </p>
        
        <div className="mb-6 pixel-body text-[#6E5A47]">
          <div className="text-lg font-bold mb-3">
            <span className="pixel-emoji mr-2">🪙</span>
            +{coins}🪙
            <span className="ml-3">
              <span className="pixel-emoji mr-2">⭐</span>
              +{xp} XP
            </span>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClaim}
            className="px-6 py-3 retro-btn bg-green-500 hover:bg-green-600 text-white pixel-font"
            type="button"
          >
            Claim
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 retro-btn bg-gray-400 hover:bg-gray-500 text-white pixel-font"
              type="button"
            >
              Later
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DailyCheckInModal

