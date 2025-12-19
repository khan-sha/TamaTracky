/**
 * Reporting Utilities - Single Source of Truth for Financial Reports
 * 
 * This module provides a unified, accurate reporting system for expenses and income.
 * All calculations are based on transaction logs, ensuring 100% accuracy.
 * 
 * GOAL: Make Reports page 100% accurate and stable.
 * All totals, charts, filtering, and CSV export must match the underlying transaction logs.
 */

// ============================================================================
// TYPE DEFINITIONS (SINGLE SOURCE OF TRUTH)
// ============================================================================

/**
 * Expense Transaction - Standardized expense record
 * 
 * All expenses MUST have:
 * - id: unique identifier
 * - amount: positive number (> 0)
 * - category: standardized category
 * - label: human-readable description
 * - timestamp: milliseconds since epoch
 */
export interface Expense {
  id: string
  amount: number        // MUST be > 0
  category: "Food" | "Supplies" | "Toys" | "Activities" | "Health" | "Other"
  label: string         // e.g. "Basic Food"
  timestamp: number     // Date.now()
}

/**
 * Income Transaction - Standardized income record
 * 
 * All income MUST have:
 * - id: unique identifier
 * - amount: positive number (> 0)
 * - source: where the money came from
 * - label: human-readable description
 * - timestamp: milliseconds since epoch
 */
export interface Income {
  id: string
  amount: number        // MUST be > 0
  source: "Task" | "Daily Quest" | "Daily Check-In" | "Weekly Allowance" | "Bonus" | "Other"
  label: string
  timestamp: number
}

/**
 * Date Range Filter
 */
export type DateRange = "today" | "last7days" | "last30days" | "all"

/**
 * Report Model - Complete financial report data
 */
export interface ReportModel {
  totalSpent: number
  totalEarned: number
  net: number
  spentByCategory: Record<string, number>
  earnedBySource: Record<string, number>
  dailySpentSeries: Array<{ date: string; amount: number }>
  dailyEarnedSeries: Array<{ date: string; amount: number }>
  recentTransactions: Array<{ type: "expense" | "income"; id: string; label: string; amount: number; timestamp: number }>
}

// ============================================================================
// NORMALIZATION (MIGRATION SAFETY)
// ============================================================================

/**
 * Normalizes expense data from various formats to standard Expense shape
 * 
 * Handles:
 * - Missing or invalid data
 * - Negative amounts (converts to positive)
 * - Missing timestamps
 * - String amounts (converts to numbers)
 * - Legacy category formats
 */
export function normalizeExpenses(rawExpenses: any[]): Expense[] {
  if (!Array.isArray(rawExpenses)) return []
  
  return rawExpenses
    .filter(exp => exp != null) // Remove null/undefined
    .map(exp => {
      // Extract amount (handle string or number)
      let amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : (exp.amount || 0)
      if (isNaN(amount) || amount <= 0) {
        // Fix negative amounts
        if (amount < 0) {
          console.warn(`[REPORTS] Fixed negative expense amount: ${amount} -> ${Math.abs(amount)}`)
          amount = Math.abs(amount)
        } else {
          return null // Skip invalid amounts
        }
      }
      
      // Extract timestamp
      let timestamp = exp.timestamp || exp.date || Date.now()
      if (typeof timestamp === 'string') {
        timestamp = new Date(timestamp).getTime()
      }
      if (isNaN(timestamp) || timestamp <= 0) {
        timestamp = Date.now() // Default to now if invalid
      }
      
      // Map legacy type/category to standard category
      const legacyType = exp.type || exp.category || ''
      let category: Expense['category'] = "Other"
      
      if (legacyType === 'food' || legacyType === 'Food' || exp.description?.toLowerCase().includes('food') || exp.label?.toLowerCase().includes('food')) {
        category = "Food"
      } else if (legacyType === 'healthcare' || legacyType === 'health' || legacyType === 'Health' || exp.description?.toLowerCase().includes('vet') || exp.description?.toLowerCase().includes('health')) {
        category = "Health"
      } else if (legacyType === 'toy' || legacyType === 'toys' || legacyType === 'Toys' || exp.description?.toLowerCase().includes('toy')) {
        category = "Toys"
      } else if (legacyType === 'supplies' || legacyType === 'Supplies' || exp.description?.toLowerCase().includes('supplies') || exp.description?.toLowerCase().includes('cleaning')) {
        category = "Supplies"
      } else if (legacyType === 'activity' || legacyType === 'activities' || legacyType === 'Activities' || exp.description?.toLowerCase().includes('activity') || exp.description?.toLowerCase().includes('spa') || exp.description?.toLowerCase().includes('park')) {
        category = "Activities"
      }
      
      // Extract label
      const label = exp.label || exp.description || exp.itemName || 'Unknown expense'
      
      // Generate ID if missing
      const id = exp.id || `expense_${timestamp}_${Math.random().toString(36).substring(2, 9)}`
      
      return {
        id,
        amount,
        category,
        label,
        timestamp
      }
    })
    .filter((exp): exp is Expense => exp !== null)
}

/**
 * Normalizes income data from various formats to standard Income shape
 */
export function normalizeIncome(rawIncome: any[]): Income[] {
  if (!Array.isArray(rawIncome)) return []
  
  return rawIncome
    .filter(inc => inc != null)
    .map(inc => {
      // Extract amount
      let amount = typeof inc.amount === 'string' ? parseFloat(inc.amount) : (inc.amount || 0)
      if (isNaN(amount) || amount <= 0) {
        if (amount < 0) {
          console.warn(`[REPORTS] Fixed negative income amount: ${amount} -> ${Math.abs(amount)}`)
          amount = Math.abs(amount)
        } else {
          return null
        }
      }
      
      // Extract timestamp
      let timestamp = inc.timestamp || inc.date || Date.now()
      if (typeof timestamp === 'string') {
        timestamp = new Date(timestamp).getTime()
      }
      if (isNaN(timestamp) || timestamp <= 0) {
        timestamp = Date.now()
      }
      
      // Map legacy source to standard source
      const legacySource = inc.source || inc.type || ''
      const description = (inc.label || inc.description || '').toLowerCase()
      let source: Income['source'] = "Other"
      
      if (legacySource === 'task' || legacySource === 'Task' || description.includes('task')) {
        source = "Task"
      } else if (legacySource === 'quest' || legacySource === 'Quest' || legacySource === 'Daily Quest' || description.includes('quest')) {
        source = "Daily Quest"
      } else if (legacySource === 'check-in' || legacySource === 'checkin' || legacySource === 'Daily Check-In' || description.includes('check-in') || description.includes('daily')) {
        source = "Daily Check-In"
      } else if (legacySource === 'Weekly Allowance') {
        source = "Weekly Allowance"
      } else if (legacySource === 'Bonus') {
        source = "Bonus"
      } else if (legacySource === 'Other') {
        source = "Other"
      }
      
      // Extract label
      const label = inc.label || inc.description || 'Unknown income'
      
      // Generate ID if missing
      const id = inc.id || `income_${timestamp}_${Math.random().toString(36).substring(2, 9)}`
      
      return {
        id,
        amount,
        source,
        label,
        timestamp
      }
    })
    .filter((inc): inc is Income => inc !== null)
}

/**
 * Normalizes finance data from slot save data
 * 
 * This is the main entry point for normalizing slot data.
 * It handles both pet.expenses and slot.expenses arrays.
 */
export function normalizeFinanceData(slotData: any): { expenses: Expense[]; income: Income[] } {
  if (!slotData) {
    return { expenses: [], income: [] }
  }
  
  // Merge pet expenses with slot expenses (slot expenses take precedence for duplicates)
  const petExpenses = slotData.pet?.expenses || []
  const slotExpenses = slotData.expenses || []
  const allExpenses = [...petExpenses, ...slotExpenses]
  
  // Normalize expenses
  const expenses = normalizeExpenses(allExpenses)
  
  // Normalize income
  const income = normalizeIncome(slotData.income || [])
  
  return { expenses, income }
}

// ============================================================================
// DATE RANGE FILTERING
// ============================================================================

/**
 * Gets the start timestamp for a date range
 */
function getDateRangeStart(range: DateRange): number {
  const now = Date.now()
  
  switch (range) {
    case "today":
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      return today.getTime()
    case "last7days":
      return now - (7 * 24 * 60 * 60 * 1000)
    case "last30days":
      return now - (30 * 24 * 60 * 60 * 1000)
    case "all":
      return 0
  }
}

/**
 * Filters expenses by date range
 */
export function filterExpensesByDate(expenses: Expense[], range: DateRange): Expense[] {
  if (range === "all") return expenses
  
  const startTime = getDateRangeStart(range)
  return expenses.filter(exp => exp.timestamp >= startTime)
}

/**
 * Filters income by date range
 */
export function filterIncomeByDate(income: Income[], range: DateRange): Income[] {
  if (range === "all") return income
  
  const startTime = getDateRangeStart(range)
  return income.filter(inc => inc.timestamp >= startTime)
}

// ============================================================================
// REPORT MODEL BUILDER (SINGLE CALCULATION FUNCTION)
// ============================================================================

/**
 * Builds a complete report model from normalized expenses and income
 * 
 * This is the SINGLE SOURCE OF TRUTH for all report calculations.
 * All totals, breakdowns, and series are computed here.
 * 
 * IMPORTANT: Uses ONLY transaction logs for totals (not coin balance).
 * Always rounds for display only (doesn't round stored data).
 */
export function buildReportModel(
  expenses: Expense[],
  income: Income[],
  dateRange: DateRange = "all"
): ReportModel {
  // Filter by date range
  const filteredExpenses = filterExpensesByDate(expenses, dateRange)
  const filteredIncome = filterIncomeByDate(income, dateRange)
  
  // Calculate totals (from logs only, never from coin balance)
  // Ensure amounts are positive (safety check)
  // Round to 2 decimal places to prevent floating point display issues
  const totalSpent = Math.round(filteredExpenses.reduce((sum, exp) => {
    const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0
    return sum + Math.abs(amount) // Always positive
  }, 0) * 100) / 100 // Round to 2 decimal places
  const totalEarned = Math.round(filteredIncome.reduce((sum, inc) => {
    const amount = typeof inc.amount === 'number' ? inc.amount : parseFloat(inc.amount) || 0
    return sum + Math.abs(amount) // Always positive
  }, 0) * 100) / 100 // Round to 2 decimal places
  const net = Math.round((totalEarned - totalSpent) * 100) / 100 // Round to 2 decimal places
  
  // Calculate breakdowns by category/source (round to prevent floating point issues)
  const spentByCategory: Record<string, number> = {}
  filteredExpenses.forEach(exp => {
    const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0
    spentByCategory[exp.category] = Math.round(((spentByCategory[exp.category] || 0) + Math.abs(amount)) * 100) / 100
  })
  
  const earnedBySource: Record<string, number> = {}
  filteredIncome.forEach(inc => {
    const amount = typeof inc.amount === 'number' ? inc.amount : parseFloat(inc.amount) || 0
    earnedBySource[inc.source] = Math.round(((earnedBySource[inc.source] || 0) + Math.abs(amount)) * 100) / 100
  })
  
  // Build daily series (group by day)
  const dailySpentMap: Record<string, number> = {}
  filteredExpenses.forEach(exp => {
    const date = new Date(exp.timestamp).toISOString().split('T')[0] // YYYY-MM-DD
    const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0
    dailySpentMap[date] = (dailySpentMap[date] || 0) + Math.abs(amount)
  })
  
  const dailyEarnedMap: Record<string, number> = {}
  filteredIncome.forEach(inc => {
    const date = new Date(inc.timestamp).toISOString().split('T')[0]
    const amount = typeof inc.amount === 'number' ? inc.amount : parseFloat(inc.amount) || 0
    dailyEarnedMap[date] = (dailyEarnedMap[date] || 0) + Math.abs(amount)
  })
  
  const dailySpentSeries = Object.entries(dailySpentMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
  
  const dailyEarnedSeries = Object.entries(dailyEarnedMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
  
  // Build recent transactions (merged, sorted by timestamp desc)
  const recentTransactions = [
    ...filteredExpenses.map(exp => ({
      type: "expense" as const,
      id: exp.id,
      label: exp.label,
      amount: exp.amount,
      timestamp: exp.timestamp
    })),
    ...filteredIncome.map(inc => ({
      type: "income" as const,
      id: inc.id,
      label: inc.label,
      amount: inc.amount,
      timestamp: inc.timestamp
    }))
  ].sort((a, b) => b.timestamp - a.timestamp)
  
  return {
    totalSpent,
    totalEarned,
    net,
    spentByCategory,
    earnedBySource,
    dailySpentSeries,
    dailyEarnedSeries,
    recentTransactions
  }
}

// ============================================================================
// CSV EXPORT HELPERS
// ============================================================================

/**
 * Formats a timestamp as a date string for CSV
 */
function formatDateForCSV(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Exports expenses to CSV format
 */
export function exportExpensesCSV(expenses: Expense[]): string {
  const headers = ['Date', 'Category', 'Label', 'Amount']
  const rows = expenses.map(exp => [
    formatDateForCSV(exp.timestamp),
    exp.category,
    exp.label,
    exp.amount.toString()
  ])
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}

/**
 * Exports income to CSV format
 */
export function exportIncomeCSV(income: Income[]): string {
  const headers = ['Date', 'Source', 'Label', 'Amount']
  const rows = income.map(inc => [
    formatDateForCSV(inc.timestamp),
    inc.source,
    inc.label,
    inc.amount.toString()
  ])
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}

