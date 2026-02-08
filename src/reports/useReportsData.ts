import { useMemo, useEffect, useState } from 'react'
import { useGameCore } from '../useGameCore'
import { GameCore } from '../GameCore'
import {
  normalizeFinanceData,
  buildReportModel,
  filterIncomeByDate,
  type DateRange
} from '../utils/reporting'
import { sanitizeTransactions } from '../utils/sanitizeTransactions'
import { filterExpenses } from './reportUtils'

/**
 * Custom hook for reports data management
 */
export function useReportsData() {
  const { pet, isLoading, saveSlot } = useGameCore()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<DateRange>('all')
  const [chartType, setChartType] = useState<'line' | 'bar' | 'doughnut'>('bar')
  const [budgetLimit, setBudgetLimit] = useState<number>(100)
  
  const normalizedData = useMemo(() => {
    if (!pet || !saveSlot) return { expenses: [], income: [] }
    try {
      const slotData = GameCore.loadAll(saveSlot)
      const normalized = normalizeFinanceData(slotData)
      const sanitized = sanitizeTransactions(normalized.expenses, normalized.income)
      return sanitized
    } catch (error) {
      console.error('Error loading slot data:', error)
      return { expenses: [], income: [] }
    }
  }, [pet, saveSlot])
  
  const isDemoMode = useMemo(() => {
    if (!saveSlot) return false
    try {
      const slotData = GameCore.loadAll(saveSlot)
      return slotData?.meta?.demo === true
    } catch {
      return false
    }
  }, [saveSlot])
  
  useEffect(() => {
    if (isDemoMode && dateFilter === 'all') {
      setDateFilter('last30days')
    }
  }, [isDemoMode, dateFilter])
  
  const reportModel = useMemo(() => {
    return buildReportModel(normalizedData.expenses, normalizedData.income, dateFilter)
  }, [normalizedData.expenses, normalizedData.income, dateFilter])
  
  const filteredExpenses = useMemo(() => {
    return filterExpenses(normalizedData.expenses, dateFilter, categoryFilter)
  }, [normalizedData.expenses, dateFilter, categoryFilter])
  
  const filteredIncome = useMemo(() => {
    return filterIncomeByDate(normalizedData.income, dateFilter)
  }, [normalizedData.income, dateFilter])
  
  const insights = useMemo(() => {
    const insightsList: string[] = []
    
    if (reportModel.totalSpent === 0) {
      insightsList.push("You haven't spent any coins yet. Start caring for your pet!")
      return insightsList
    }
    
    const topCategory = Object.entries(reportModel.spentByCategory).reduce((a, b) => 
      b[1] > a[1] ? b : a, ['', 0] as [string, number]
    )
    
    if (topCategory[1] > 0) {
      insightsList.push(`Most of your spending is on ${topCategory[0]} (${Math.round(topCategory[1])} coins).`)
    }
    
    const healthSpending = reportModel.spentByCategory['Health'] || 0
    const toySpending = reportModel.spentByCategory['Toys'] || 0
    if (healthSpending > 0 || toySpending > 0) {
      insightsList.push(`You've spent ${Math.round(healthSpending)} coins on Health and ${Math.round(toySpending)} coins on Toys.`)
    }
    
    const activitySpending = reportModel.spentByCategory['Activities'] || 0
    if (activitySpending > 50) {
      const savings = Math.floor(activitySpending * 0.2)
      insightsList.push(`If you reduce activity spending by 20%, you'd save about ${savings} coins.`)
    }
    
    if (reportModel.totalSpent > budgetLimit) {
      insightsList.push(`⚠️ You've exceeded your budget of ${budgetLimit} coins by ${Math.round(reportModel.totalSpent - budgetLimit)} coins.`)
    } else {
      const remaining = budgetLimit - reportModel.totalSpent
      insightsList.push(`✅ You have ${Math.round(remaining)} coins remaining in your budget of ${budgetLimit} coins.`)
    }
    
    return insightsList
  }, [reportModel, budgetLimit])
  
  const demoInsights = useMemo(() => {
    if (!isDemoMode) return null
    
    const topCategory = Object.entries(reportModel.spentByCategory).reduce((a, b) => 
      b[1] > a[1] ? b : a, ['', 0] as [string, number]
    )
    
    const mostExpensive = reportModel.recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((a, b) => b.amount > a.amount ? b : a, { type: 'expense' as const, id: '', label: '', amount: 0, timestamp: 0 })
    
    return {
      topCategory: topCategory[0] || 'Food',
      topCategoryAmount: Math.round(topCategory[1] || 0),
      mostExpensiveEvent: mostExpensive.label || 'Vet Visit',
      mostExpensiveAmount: mostExpensive.amount || 0
    }
  }, [isDemoMode, reportModel])
  
  const top3Categories = useMemo(() => {
    return Object.entries(reportModel.spentByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount: Math.round(amount) }))
  }, [reportModel.spentByCategory])
  
  return {
    pet,
    isLoading,
    saveSlot,
    normalizedData,
    isDemoMode,
    reportModel,
    filteredExpenses,
    filteredIncome,
    insights,
    demoInsights,
    top3Categories,
    categoryFilter,
    setCategoryFilter,
    dateFilter,
    setDateFilter,
    chartType,
    setChartType,
    budgetLimit,
    setBudgetLimit
  }
}

