/**
 * Stat Bar Component (Game HUD Style)
 * 
 * This reusable component displays a single pet statistic with a visual progress bar
 * styled like a game HUD (Heads-Up Display). It provides clear visual feedback
 * about pet status in a game-like interface.
 * 
 * Game Design Features:
 * - HUD-style appearance with borders and shadows
 * - Color-coded status indicators
 * - Smooth animations
 * - Glowing effects for high values
 * - Percentage display with icon
 * 
 * FBLA Requirements:
 * - Clear visual representation of data
 * - Intuitive user interface
 * - Consistent design patterns
 * - Accessible design
 */

import { formatStat } from '../core/utils'

/**
 * Props for the StatBar component.
 */
interface StatBarProps {
  /** The label/name of the statistic (e.g., "Health", "Happiness") */
  label: string
  /** The current value (0-100) */
  value: number
  /** Optional icon/emoji to display before the label */
  icon?: string
  /** Optional custom color class (overrides automatic color coding) */
  customColor?: string
}

/**
 * StatBar Component (Game HUD Style)
 * 
 * Displays a single statistic with a game-style HUD progress bar.
 * 
 * @param props - Component props
 * @returns JSX element representing the stat bar
 * 
 * Example usage:
 * <StatBar label="Health" value={85} icon="❤️" />
 */
function StatBar({ label, value, icon, customColor }: StatBarProps) {
  /**
   * Calculates the background color for the progress bar based on value thresholds.
   * 
   * Color coding thresholds:
   * - > 70: Green (#4CAF50) - Good health
   * - 40-70: Yellow/Orange (#FFC107) - Warning
   * - < 40: Red (#F44336) - Critical
   * 
   * FBLA Alignment:
   * - Clear visual feedback for stat levels
   * - Intuitive color coding (green = good, red = bad)
   * - Enhances user experience
   * 
   * @param val - The value to determine color for (0-100)
   * @returns Hex color string for the stat bar
   */
  const getStatColor = (val: number): string => {
    // Use custom color if provided
    if (customColor) {
      return customColor
    }
    
    // Color thresholds based on stat value
    if (val > 70) {
      return '#4CAF50' // Green - Good
    }
    if (val >= 40) {
      return '#FFC107' // Yellow/Orange - Warning
    }
    return '#F44336' // Red - Critical
  }
  
  // Clamp and round value for display
  const clampedValue = Math.min(Math.max(value, 0), 100)
  const roundedValue = Math.round(clampedValue)
  const displayValue = formatStat(value)
  
  /**
   * Determines if the stat is critically low (< 20).
   * Used for visual feedback like blinking animations.
   */
  const isCritical = roundedValue < 20
  
  // Determine if value is high enough for glow effect
  const hasGlow = roundedValue >= 80
  
  return (
    <div className="w-full">
      {/* Label and value display with game HUD styling */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-2xl drop-shadow-sm">{icon}</span>}
          <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-bold ${hasGlow ? 'text-green-600' : 'text-gray-700'}`}>
            {displayValue}
          </span>
        </div>
      </div>
      
      {/* Smooth animated progress bar container with retro pixel styling */}
      <div 
        className={`relative h-3 w-full overflow-hidden rounded-sm ${isCritical ? 'animate-pulse' : ''}`}
        style={{ 
          backgroundColor: 'var(--panel)',
          border: `1px solid var(--border)`
        }}
      >
        {/* Smooth animated bar fill with color transitions */}
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${clampedValue}%`,
            backgroundColor: getStatColor(clampedValue),
            transition: 'width 0.5s ease-out, background-color 0.3s ease-out'
          }}
          role="progressbar"
          aria-valuenow={roundedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${displayValue}`}
        />
      </div>
    </div>
  )
}

export default StatBar
