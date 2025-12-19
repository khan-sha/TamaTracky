/**
 * Expense System Module
 * 
 * PURPOSE: Tracks all pet care expenses for cost-of-care education.
 * Every action that costs coins logs an expense here for Reports.
 * 
 * KEY FUNCTIONS:
 * - logExpense: Records expense with category, amount, description
 * - getTotalCareCost: Sums all expenses
 * - getCareCostByCategory: Groups expenses by type
 * 
 * ORGANIZATION: Simple, focused module with clear responsibility.
 * All expense logging goes through logExpense() for consistency.
 * This ensures Reports page shows accurate cost-of-care data.
 */

import { PetData } from './types'

/**
 * Expense type - All possible expense types
 */
export type ExpenseType = 'food' | 'toy' | 'healthcare' | 'supplies' | 'care' | 'purchase' | 'activity'

/**
 * Logs an expense to the pet's expense list
 * 
 * This adds a cost when the user takes care of the pet.
 * Stores into current slot expenses array.
 * 
 * @param pet - Pet to log expense for
 * @param type - Type of expense
 * @param amount - Amount of expense
 * @param description - Description of expense
 * @returns Pet with updated expenses
 */
export function logExpense(
  pet: PetData,
  type: ExpenseType,
  amount: number,
  description: string
): PetData {
  // Safety guard: Ensure amount is positive and valid
  if (!amount || amount <= 0) {
    console.warn(`logExpense: Invalid amount ${amount}, using 0`)
    return pet
  }
  
  const positiveAmount = Math.abs(amount)
  
  const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  
  const newPet = { ...pet }
  // Safety guard: Ensure expenses array exists
  newPet.expenses = [
    ...(pet.expenses || []),
    {
      id: expenseId,
      timestamp: Date.now(),
      amount: positiveAmount,
      description: description,
      type: type
    }
  ]
  newPet.lastUpdated = Date.now()
  
  return newPet
}

/**
 * Gets total care cost from expenses
 * 
 * This calculates the total cost of caring for the pet.
 * Used for reports and dashboard display.
 * 
 * @param pet - Pet to calculate care cost for
 * @returns Total care cost
 */
export function getTotalCareCost(pet: PetData): number {
  // Safety guard: Handle missing or empty expenses array
  if (!pet.expenses || pet.expenses.length === 0) {
    return 0
  }
  return pet.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
}

/**
 * Gets care cost by category
 * 
 * This groups expenses by type for reports.
 * 
 * @param pet - Pet to calculate care cost for
 * @returns Object with costs by category
 */
export function getCareCostByCategory(pet: PetData): Record<ExpenseType, number> {
  const categories: Record<ExpenseType, number> = {
    food: 0,
    toy: 0,
    healthcare: 0,
    supplies: 0,
    care: 0,
    purchase: 0,
    activity: 0
  }
  
  // Safety guard: Handle missing or empty expenses array
  if (!pet.expenses || pet.expenses.length === 0) {
    return categories
  }
  
  pet.expenses.forEach(exp => {
    if (exp && exp.type && exp.amount && exp.type in categories) {
      categories[exp.type] = (categories[exp.type] || 0) + (exp.amount || 0)
    }
  })
  
  return categories
}

