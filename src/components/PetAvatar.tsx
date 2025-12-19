/**
 * Pet Avatar Component
 * 
 * This component displays a visual representation of the pet with its current
 * emotional state and reactions. It provides visual feedback to users about
 * how their pet is feeling.
 * 
 * Game Design Features:
 * - Mood-based animations (wiggle when happy, shake when sick)
 * - Emotional state visualization with color tints
 * - Size variations for different contexts
 * - Smooth transitions for state changes
 * 
 * FBLA Requirements:
 * - Visual feedback for user actions
 * - Intuitive representation of pet state
 * - Enhanced user experience
 */

import type { PetType, AgeStage } from '../game/data'
import { getPetEmoji, AGE_LABELS } from '../game/data'

/**
 * Props for the PetAvatar component.
 */
interface PetAvatarProps {
  /** The pet type: 'cat', 'dog', or 'rabbit' */
  petType: PetType
  /** The pet's current age stage (0-3) */
  ageStage: AgeStage
  /** The pet's name */
  petName: string
  /** The pet's current happiness level (0-100) */
  happiness: number
  /** The pet's current health level (0-100) */
  health: number
  /** The pet's current mood ('happy', 'sad', 'sick', etc.) */
  mood: 'happy' | 'sad' | 'sick' | 'energetic' | 'tired' | 'angry' | 'neutral'
  /** The pet's mood emoji */
  moodEmoji: string
  /** Optional size variant ('small', 'medium', 'large') */
  size?: 'small' | 'medium' | 'large'
  /** Optional custom className for additional styling */
  className?: string
  /** Optional flag to show evolution animation */
  isEvolving?: boolean
}

/**
 * PetAvatar Component (Retro ASCII Theme)
 * 
 * Displays a visual representation of the pet using ASCII pixel sprites.
 * Shows evolution sprite + mood sprite stacked vertically for a clean, retro appearance.
 * 
 * Retro Design Features:
 * - Evolution ASCII sprite (from pet.getPixelSprite())
 * - Mood ASCII sprite (from pet.getMoodSprite())
 * - Monospace font and blocky borders
 * - Clean, game-like appearance
 * 
 * FBLA Requirements:
 * - Visual feedback for user actions
 * - Intuitive representation of pet state
 * - Enhanced user experience
 * - ASCII placeholders for future student art replacement
 * 
 * @param props - Component props
 * @returns JSX element representing the pet avatar
 * 
 * Example usage:
 * <PetAvatar 
 *   species="fire" 
 *   evolutionStage="baby" 
 *   petName="Sparky" 
 *   happiness={85} 
 *   health={90} 
 *   moodSprite="^_^" 
 *   pixelSprite="(:> )"
 *   size="large" 
 * />
 */
function PetAvatar({ petType, ageStage, petName, happiness, health, mood, moodEmoji, size = 'medium', className = '', isEvolving = false }: PetAvatarProps) {
  // Get pet emoji based on type and age stage
  const petEmoji = getPetEmoji(petType, ageStage)
  
  // Get age stage display name
  const ageLabel = AGE_LABELS[ageStage]
  
  // Get mood description text
  const getMoodText = (): string => {
    const name = petName || 'Tama'
    switch (mood) {
      case 'happy': return `${name} is happy!`
      case 'sad': return `${name} is sad...`
      case 'sick': return `${name} feels sick...`
      case 'energetic': return `${name} is energetic!`
      case 'tired': return `${name} is tired...`
      case 'angry': return `${name} is angry!`
      case 'neutral': return `${name} is doing okay.`
      default: return `${name} is doing okay.`
    }
  }
  
  // Determine animation classes based on mood, health, and happiness
  const getAnimationClass = (): string => {
    if (isEvolving) return 'animate-spin'
    if (mood === 'happy' || (happiness > 80 && health > 60)) return 'animate-bounce'
    if (mood === 'energetic') return 'animate-bounce'
    if (mood === 'sick' || health < 20) return 'animate-pulse'
    if (mood === 'angry') return 'animate-pulse'
    // Default: gentle breathing animation when idle/happy
    if (happiness > 70) return 'animate-breathe'
    return ''
  }
  
  // Determine emoji size based on size prop
  const getEmojiSize = (): { wrapper: string; emoji: string } => {
    switch (size) {
      case 'small':
        return { wrapper: '32px', emoji: '24px' }
      case 'large':
        return { wrapper: '80px', emoji: '64px' }
      default: // medium
        return { wrapper: '64px', emoji: '48px' }
    }
  }
  
  const emojiSize = getEmojiSize()
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Pet avatar with mood-based animations */}
      <div className={`
        retro-panel
        ${getAnimationClass()}
        transform transition-all duration-300
        p-8
        text-center
        flex flex-col items-center justify-center
        mb-4
        ${health < 20 ? 'border-red-500' : ''}
      `}>
        {/* Pet emoji + mood emoji side by side */}
        <div className="flex items-center gap-4 mb-3">
          <div className="pixel-wrapper" style={{ width: emojiSize.wrapper, height: emojiSize.wrapper }}>
            <span className="pixel-emoji" style={{ fontSize: emojiSize.emoji }}>{petEmoji}</span>
          </div>
          <div className="pixel-wrapper" style={{ width: emojiSize.wrapper, height: emojiSize.wrapper }}>
            <span className="pixel-emoji" style={{ fontSize: emojiSize.emoji }}>{moodEmoji}</span>
          </div>
        </div>
        
        {/* Mood description text */}
        <p className="pixel-body text-sm text-[#5A4632] mt-2">
          {getMoodText()}
        </p>
      </div>
      
      {/* Pet name with retro styling */}
      <h3 className="text-lg pixel-font text-[#5A4632] mt-2 retro-panel px-4 py-2">
        {petName.toUpperCase()}
      </h3>
      
      {/* Pet type and age info with retro styling */}
      <div className="mt-2 px-3 py-1 retro-panel text-xs pixel-font text-[#5A4632] uppercase">
        {petType.toUpperCase()} • {ageLabel.toUpperCase()}
      </div>
    </div>
  )
}

export default PetAvatar
