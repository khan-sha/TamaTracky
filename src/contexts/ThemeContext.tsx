import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * Theme Context Interface
 * 
 * Defines the shape of the theme context value.
 */
interface ThemeContextType {
  /** Current theme: "light" or "dark" */
  theme: 'light' | 'dark'
  /** Function to toggle between light and dark themes */
  toggleTheme: () => void
  /** Function to set a specific theme */
  setTheme: (theme: 'light' | 'dark') => void
}

/**
 * Theme Context
 * 
 * React Context for managing theme state globally across the application.
 * This allows any component to access and modify the current theme.
 * 
 * Usage:
 * const { theme, toggleTheme } = useTheme();
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Storage key for theme preference in localStorage.
 */
const THEME_STORAGE_KEY = 'tamatracky_theme'

/**
 * Theme Context Provider Props
 */
interface ThemeProviderProps {
  /** Child components that will have access to the theme context */
  children: ReactNode
}

/**
 * Theme Provider Component
 * 
 * This component:
 * 1. Manages the theme state using React's useState hook
 * 2. Loads theme preference from localStorage on mount
 * 3. Saves theme preference to localStorage when it changes
 * 4. Applies theme class to document root element
 * 5. Provides functions to toggle and set theme
 * 6. Wraps child components with the ThemeContext.Provider
 * 
 * FBLA Alignment:
 * - Demonstrates state management with React Context
 * - Shows localStorage integration for persistence
 * - Enhances user experience with theme customization
 * 
 * @param props - Component props containing children
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // State for the current theme (defaults to 'light')
  // CRITICAL: Apply theme class synchronously during initialization to prevent white screen
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    // Try to load theme from localStorage on initialization
    let initialTheme: 'light' | 'dark' = 'light'
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme === 'light' || savedTheme === 'dark') {
        initialTheme = savedTheme
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error)
    }
    
    // Apply theme class IMMEDIATELY (synchronously) before React renders
    // This prevents white screen by ensuring CSS variables are available
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(initialTheme)
    }
    
    return initialTheme
  })

  /**
   * Effect hook that runs on mount and when theme changes.
   * Applies theme class to document root and saves to localStorage.
   * 
   * This runs immediately on mount (with initial theme) and whenever theme changes.
   */
  useEffect(() => {
    // Apply theme class to document root element immediately
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    // Save theme preference to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error)
    }
  }, [theme])

  /**
   * Toggles between light and dark themes.
   * 
   * This function:
   * 1. Determines the new theme (switches from current theme)
   * 2. Updates the theme state
   * 3. The useEffect hook will handle applying the class and saving
   */
  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  /**
   * Sets a specific theme.
   * 
   * @param newTheme - The theme to set ('light' or 'dark')
   */
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
  }

  /**
   * Context value object.
   * Contains all the values and functions that will be available to consuming components.
   */
  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme
  }

  // Provide the context value to all child components
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Custom hook to access the Theme Context.
 * 
 * This hook:
 * 1. Uses React's useContext to access the ThemeContext
 * 2. Throws an error if used outside of a ThemeProvider
 * 3. Returns the context value (theme, toggleTheme, setTheme)
 * 
 * @returns The ThemeContext value
 * @throws Error if used outside of ThemeProvider
 * 
 * Usage:
 * const { theme, toggleTheme } = useTheme();
 */
function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  
  // Ensure the hook is used within a ThemeProvider
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

// Export hook separately to avoid Fast Refresh compatibility issues
export { useTheme }

