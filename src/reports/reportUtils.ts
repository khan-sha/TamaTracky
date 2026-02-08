import {
  filterExpensesByDate,
  exportExpensesCSV as exportExpensesCSVUtil,
  exportIncomeCSV as exportIncomeCSVUtil,
  type Expense,
  type Income,
  type DateRange
} from '../utils/reporting'

/**
 * Formats a timestamp into a relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'just now'
  }
}

/**
 * Filters expenses by category
 */
export function filterExpensesByCategory(
  expenses: Expense[],
  categoryFilter: string
): Expense[] {
  if (categoryFilter === 'all') return expenses
  
  const categoryMap: Record<string, string[]> = {
    'food': ['Food'],
    'healthcare': ['Health'],
    'toys': ['Toys'],
    'supplies': ['Supplies'],
    'activities': ['Activities'],
    'other': ['Other']
  }
  
  const allowedCategories = categoryMap[categoryFilter] || []
  if (allowedCategories.length === 0) return expenses
  
  return expenses.filter(exp => allowedCategories.includes(exp.category))
}

/**
 * Handles CSV export of expenses
 */
export function handleExportExpenses(expenses: Expense[]): void {
  if (expenses.length === 0) {
    alert('No expenses to export.')
    return
  }
  
  const csv = exportExpensesCSVUtil(expenses)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tama-tracky-expenses-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Handles CSV export of income
 */
export function handleExportIncome(income: Income[]): void {
  if (income.length === 0) {
    alert('No income to export.')
    return
  }
  
  const csv = exportIncomeCSVUtil(income)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tama-tracky-income-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Handles CSV export of statistics
 */
export function handleExportStats(
  pet: any,
  reportModel: any,
  filename?: string
): void {
  if (!pet) {
    alert('No pet data to export.')
    return
  }
  
  const defaultFilename = `tama-tracky-stats-${new Date().toISOString().split('T')[0]}.csv`
  const ageStage = pet.ageStage ?? (pet.xp >= 120 ? 3 : pet.xp >= 60 ? 2 : pet.xp >= 20 ? 1 : 0)
  const ageLabels: Record<number, string> = { 0: 'Baby', 1: 'Young', 2: 'Adult', 3: 'Mature' }
  const csv = `Name,Pet Type,Age Stage,XP,Health,Happiness,Hunger,Cleanliness,Energy,Coins,Total Expenses,Total Income,Net\n${pet.name},${pet.petType || 'cat'},${ageLabels[ageStage] || 'Baby'},${pet.xp},${pet.stats.health},${pet.stats.happiness},${pet.stats.hunger},${pet.stats.cleanliness},${pet.stats.energy},${pet.coins},${reportModel.totalSpent},${reportModel.totalEarned},${reportModel.net}`
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || defaultFilename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Filters expenses by both date and category
 */
export function filterExpenses(
  expenses: Expense[],
  dateFilter: DateRange,
  categoryFilter: string
): Expense[] {
  let filtered = filterExpensesByDate(expenses, dateFilter)
  return filterExpensesByCategory(filtered, categoryFilter)
}

