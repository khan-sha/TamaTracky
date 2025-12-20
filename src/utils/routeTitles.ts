/**
 * Route Title Mapping
 * 
 * This file provides a centralized mapping of routes to page titles.
 * This prevents title bugs and ensures consistency across the application.
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Functions: getPageTitle() retrieves title for a route
 * - Conditionals: Handles unknown routes with fallback
 * - Data structures: Object mapping route paths to titles
 * 
 * USAGE:
 * import { getPageTitle } from '../utils/routeTitles'
 * const title = getPageTitle('/tasks') // Returns "CARE & TASKS"
 */

/**
 * Route to title mapping
 * 
 * Maps route paths to their display titles.
 * All titles are in UPPERCASE for consistency.
 */
const ROUTE_TITLES: Record<string, string> = {
  '/': 'HOME',
  '/create-pet': 'CREATE PET',
  '/dashboard': 'GAME HUB',
  '/tasks': 'CARE & TASKS',
  '/store': 'PET STORE',
  '/reports': 'MONEY REPORTS',
  '/achievements': 'ACHIEVEMENTS',
  '/help': 'HELP & FAQ',
  '/guide': 'GUIDE'
}

/**
 * Gets the page title for a given route path
 * 
 * FBLA RUBRIC ALIGNMENT:
 * - Functions: getPageTitle() retrieves title
 * - Conditionals: Returns fallback if route not found
 * - Validation: Handles undefined/null routes safely
 * 
 * @param route - Route path (e.g., '/tasks', '/store')
 * @returns Page title string, or 'TAMA TRACKY' as fallback
 */
export function getPageTitle(route: string | null | undefined): string {
  // CONDITIONAL: If route is invalid, return fallback
  if (!route) {
    return 'TAMA TRACKY'
  }
  
  // CONDITIONAL: If route exists in mapping, return mapped title
  if (ROUTE_TITLES[route]) {
    return ROUTE_TITLES[route]
  }
  
  // CONDITIONAL: Fallback for unknown routes
  return 'TAMA TRACKY'
}











