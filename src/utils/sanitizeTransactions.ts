/**
 * Transaction Sanitizer
 * 
 * Removes duplicates, fixes invalid data, and ensures proper formatting.
 * Safety net to prevent corrupted or duplicate transaction data.
 */

import { Expense, Income } from './reporting'

/**
 * Sanitizes expenses: removes duplicates, fixes amounts, validates timestamps
 */
export function sanitizeExpenses(expenses: Expense[]): Expense[] {
  if (!Array.isArray(expenses)) return []
  
  const seen = new Set<string>()
  const sanitized: Expense[] = []
  
  for (const exp of expenses) {
    if (!exp || typeof exp !== 'object') continue
    
    // Fix amount: must be positive
    let amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : (exp.amount || 0)
    if (isNaN(amount) || amount <= 0) {
      if (amount < 0) {
        amount = Math.abs(amount) // Fix negative amounts
      } else {
        continue // Skip invalid amounts
      }
    }
    
    // Validate timestamp
    let timestamp = exp.timestamp || Date.now()
    if (typeof timestamp === 'string') {
      timestamp = new Date(timestamp).getTime()
    }
    if (isNaN(timestamp) || timestamp <= 0) {
      timestamp = Date.now() // Default to now if invalid
    }
    
    // Validate category
    const category = exp.category || 'Other'
    const label = exp.label || 'Unknown expense'
    
    // Generate dedupe key: timestamp|label|amount|category
    // Round timestamp to nearest minute to catch duplicates with slight time differences
    const timestampMinute = Math.floor(timestamp / 60000) * 60000
    const dedupeKey = `${timestampMinute}|${label}|${Math.round(amount * 100)}|${category}`
    
    // Skip if already seen
    if (seen.has(dedupeKey)) {
      continue
    }
    
    seen.add(dedupeKey)
    
    // Generate unique ID if missing
    const id = exp.id || `expense_${timestamp}_${Math.random().toString(36).substring(2, 9)}`
    
    sanitized.push({
      id,
      amount,
      category: category as Expense['category'],
      label,
      timestamp
    })
  }
  
  // Sort by timestamp descending (most recent first)
  sanitized.sort((a, b) => b.timestamp - a.timestamp)
  
  return sanitized
}

/**
 * Sanitizes income: removes duplicates, fixes amounts, validates timestamps
 */
export function sanitizeIncome(income: Income[]): Income[] {
  if (!Array.isArray(income)) return []
  
  const seen = new Set<string>()
  const sanitized: Income[] = []
  
  for (const inc of income) {
    if (!inc || typeof inc !== 'object') continue
    
    // Fix amount: must be positive
    let amount = typeof inc.amount === 'string' ? parseFloat(inc.amount) : (inc.amount || 0)
    if (isNaN(amount) || amount <= 0) {
      if (amount < 0) {
        amount = Math.abs(amount) // Fix negative amounts
      } else {
        continue // Skip invalid amounts
      }
    }
    
    // Validate timestamp
    let timestamp = inc.timestamp || Date.now()
    if (typeof timestamp === 'string') {
      timestamp = new Date(timestamp).getTime()
    }
    if (isNaN(timestamp) || timestamp <= 0) {
      timestamp = Date.now() // Default to now if invalid
    }
    
    // Validate source
    const source = inc.source || 'Other'
    const label = inc.label || 'Unknown income'
    
    // Generate dedupe key: timestamp|label|amount|source
    const timestampMinute = Math.floor(timestamp / 60000) * 60000
    const dedupeKey = `${timestampMinute}|${label}|${Math.round(amount * 100)}|${source}`
    
    // Skip if already seen
    if (seen.has(dedupeKey)) {
      continue
    }
    
    seen.add(dedupeKey)
    
    // Generate unique ID if missing
    const id = inc.id || `income_${timestamp}_${Math.random().toString(36).substring(2, 9)}`
    
    sanitized.push({
      id,
      amount,
      source: source as Income['source'],
      label,
      timestamp
    })
  }
  
  // Sort by timestamp descending (most recent first)
  sanitized.sort((a, b) => b.timestamp - a.timestamp)
  
  return sanitized
}

/**
 * Sanitizes both expenses and income
 */
export function sanitizeTransactions(
  expenses: Expense[],
  income: Income[]
): { expenses: Expense[]; income: Income[] } {
  return {
    expenses: sanitizeExpenses(expenses),
    income: sanitizeIncome(income)
  }
}










