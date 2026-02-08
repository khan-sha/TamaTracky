import { Link } from 'react-router-dom'
import { useGameCore } from '../useGameCore'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Minimal Header Component (Info Only)
 * 
 * This component provides a minimal header with essential info only:
 * - Logo/App name
 * - Save slot indicator
 * - Coins display
 * - Theme toggle
 * 
 * NO navigation buttons - navigation happens via Dashboard hub cards.
 * 
 * FBLA Requirements:
 * - Clean, minimal interface
 * - Essential information display
 * - Accessible design
 */
function NavBar() {
  // Get pet data and coins with safety defaults
  const { pet, saveSlot, coins } = useGameCore()
  
  // Get theme context for theme toggle
  const { theme, toggleTheme } = useTheme()
  
  // Safety: Use defaults to prevent undefined errors
  const safeCoins = coins ?? 0
  const safeSlot = saveSlot ?? null
  
  return (
    <header 
      className="sticky top-0 z-50" 
      style={{ 
        borderBottom: '3px solid var(--border)',
        backgroundColor: 'var(--panel)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        minHeight: 'var(--hud-height, 68px)',
        height: 'auto'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div 
          className="flex justify-between items-center gap-3 sm:gap-4" 
          style={{ 
            minHeight: 'var(--hud-height, 68px)',
            padding: '12px 0'
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity duration-200"
              style={{ textDecoration: 'none' }}
              title="Home - Save slots and demo mode"
            >
              <span className="pixel-emoji" style={{ fontSize: '20px', lineHeight: '1' }}>🐾</span>
              <span className="pixel-font" style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text)' }}>
                TAMA TRACKY
              </span>
            </Link>
            <Link
              to="/start-here"
              className="pixel-font text-xs font-bold px-2 py-1 hover:opacity-80 transition-opacity"
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                backgroundColor: 'var(--accent-light)'
              }}
              title="Start Here - Onboarding Guide"
            >
              📖 START HERE
            </Link>
          </div>
          
          {/* Center: Slot pill */}
          <div className="flex items-center justify-center flex-1 min-w-0">
            {safeSlot && (
              <div
                className="flex items-center"
                style={{
                  backgroundColor: 'var(--accent-light)',
                  border: '2px solid var(--border)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  boxShadow: '2px 2px 0 var(--panel-shadow)',
                  height: '28px'
                }}
              >
                <span className="pixel-font" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                  SLOT {safeSlot}
                </span>
              </div>
            )}
          </div>
          
          {/* Right: Coins pill + Theme toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {pet && (
              <div
                className="flex items-center gap-1.5"
                style={{
                  backgroundColor: 'var(--accent-light)',
                  border: '2px solid var(--border)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  boxShadow: '2px 2px 0 var(--panel-shadow)',
                  height: '28px'
                }}
              >
                <span style={{ fontSize: '14px', lineHeight: '1' }}>🪙</span>
                <span className="pixel-font" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                  {safeCoins.toLocaleString()}
                </span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center"
              style={{
                backgroundColor: 'var(--accent-light)',
                border: '2px solid var(--border)',
                borderRadius: '4px',
                padding: '4px 8px',
                boxShadow: '2px 2px 0 var(--panel-shadow)',
                height: '28px',
                width: '28px',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '3px 3px 0 var(--panel-shadow)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '2px 2px 0 var(--panel-shadow)'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(1px)'
                e.currentTarget.style.boxShadow = '1px 1px 0 var(--panel-shadow)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '3px 3px 0 var(--panel-shadow)'
              }}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span style={{ fontSize: '16px', lineHeight: '1' }}>
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavBar
