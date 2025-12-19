/**
 * Utility Functions Module
 * 
 * This module provides helper functions used throughout the game:
 * - Stat utilities (clamp, format, round)
 * - Mood calculation
 * - Emoji helpers
 * - Data export (CSV)
 * - Statistics calculations
 * - Demo mode
 * 
 * RESPONSIBILITY: Shared utility functions and helpers
 */

import { PetData, GameState } from './types'
import { createPet } from './pet'
import { giveXP } from './pet'
import { updateMood } from './pet'

// ============================================================================
// === STAT UTILITIES ===
// ============================================================================

/**
 * Clamps a value between min and max (inclusive)
 * 
 * @param value - Value to clamp
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: 100)
 * @returns Clamped value
 */
export function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Rounds a number to 1 decimal place
 * 
 * @param value - Value to round
 * @returns Rounded value with 1 decimal
 */
export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

/**
 * Rounds a number to whole number (0 decimals)
 * 
 * @param value - Value to round
 * @returns Rounded whole number
 */
export function round0(value: number): number {
  return Math.round(value)
}

/**
 * Formats a stat value for display (rounded to whole number with %)
 * 
 * @param value - Stat value (0-100)
 * @returns Formatted string like "85%"
 */
export function formatStat(value: number): string {
  const clamped = clamp(value, 0, 100)
  const rounded = round0(clamped)
  return `${rounded}%`
}

/**
 * Formats a stat value for display (1 decimal with %)
 * 
 * @param value - Stat value (0-100)
 * @returns Formatted string like "85.5%"
 */
export function formatStatDecimal(value: number): string {
  const clamped = clamp(value, 0, 100)
  const rounded = round1(clamped)
  return `${rounded.toFixed(1)}%`
}

// ============================================================================
// === MOOD & EMOJI UTILITIES ===
// ============================================================================

/**
 * Calculates pet's mood based on current stats
 * 
 * This updates the pet's mood based on their stats values.
 * Uses the new mood system from core/mood.ts.
 * 
 * @param pet - Pet to calculate mood for
 * @returns Current mood
 */
export function getMood(pet: PetData): GameState['mood'] {
  return updateMood(pet.stats)
}

/**
 * Gets emoji for a mood
 * 
 * @param mood - Mood to get emoji for
 * @returns Emoji string
 */
export function getMoodEmoji(mood: GameState['mood']): string {
  const emojis: Record<GameState['mood'], string> = {
    happy: '😊',
    sad: '😢',
    sick: '🤒',
    energetic: '😎',
    tired: '😴',
    angry: '😡',
    neutral: '😐'
  }
  return emojis[mood] || '😐'
}

/**
 * Legacy function for backward compatibility
 * Maps old species/stage to new petType/ageStage and returns emoji
 * 
 * @deprecated Use getPetEmoji from data.ts instead
 */
export function getSpeciesEmoji(species: string, stage: string): string {
  // Import getPetEmoji from data.ts
  const { getPetEmoji } = require('../game/data')
  
  // Map old species to new pet types
  const s = species.toLowerCase()
  let petType: "cat" | "dog" | "rabbit" = 'cat'
  
  if (s === 'cat' || s === 'dog' || s === 'rabbit') {
    petType = s as any
  } else if (s === 'fire' || s === 'fireling') {
    petType = 'cat'
  } else if (s === 'water' || s === 'aquapup') {
    petType = 'dog'
  } else if (s === 'earth' || s === 'budhorn' || s === 'leafkit') {
    petType = 'rabbit'
  } else {
    petType = 'cat' // Default fallback
  }
  
  // Map old stage to new age stage
  let ageStage: 0 | 1 | 2 | 3 = 0
  if (stage === 'baby') ageStage = 0
  else if (stage === 'teen') ageStage = 1
  else if (stage === 'mature') ageStage = 2
  else if (stage === 'final') ageStage = 3
  else {
    // If stage is numeric string, parse it
    const stageNum = parseInt(stage)
    if (!isNaN(stageNum) && stageNum >= 0 && stageNum <= 3) {
      ageStage = stageNum as 0 | 1 | 2 | 3
    }
  }
  
  return getPetEmoji(petType, ageStage)
}

/**
 * Calculates total expenses
 * 
 * @param expenses - Array of expense records
 * @returns Total expense amount
 */
export function getTotalExpenses(expenses: any[]): number {
  return expenses.reduce((sum, e) => sum + Math.abs(e.amount || 0), 0)
}

/**
 * Calculates total income
 * 
 * @param income - Array of income records
 * @returns Total income amount
 */
export function getTotalIncome(income: any[]): number {
  return income.reduce((sum, i) => sum + Math.abs(i.amount || 0), 0)
}

/**
 * Exports expenses to CSV file
 * 
 * Creates a downloadable CSV file with expense data.
 * Useful for financial tracking and reports.
 * 
 * @param expenses - Array of expense records
 * @param filename - Name of file to download (default: 'tama-expenses.csv')
 */
export function exportExpensesCSV(expenses: any[], filename: string = 'tama-expenses.csv'): void {
  const headers = 'Date,Amount,Description\n'
  const rows = expenses.map(e => {
    const date = new Date(e.timestamp).toLocaleDateString()
    return `${date},${Math.abs(e.amount || 0)},${e.description.replace(/,/g, ';')}`
  }).join('\n')
  
  const csv = headers + rows
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Creates a demo pet for presentations
 * 
 * Demo pets have boosted stats and XP to showcase the game.
 * Useful for demonstrations and testing.
 * 
 * @param name - Pet name (default: 'Demo Pet')
 * @param petType - Pet type: 'cat', 'dog', or 'rabbit' (default: 'cat')
 * @returns Demo pet with boosted stats
 */
export function createDemoPet(name: string = 'Demo Pet', petType: "cat" | "dog" | "rabbit" = 'cat'): PetData {
  const pet = createPet(name, petType, 5000)
  pet.stats = {
    hunger: 85,
    happiness: 90,
    health: 95,
    energy: 80,
    cleanliness: 88
  }
  return giveXP(pet, 75) // Give some XP to show progression
}

