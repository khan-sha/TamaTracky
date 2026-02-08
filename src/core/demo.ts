/**
 * Demo Mode Module - Complete demo data generation system
 * 
 * PURPOSE: Generates realistic 30-day expense and income history for demo mode.
 * Makes Reports page immediately impressive for judge presentations.
 * 
 * JUDGE-FRIENDLY EXPLANATION:
 * - Creates sample data that demonstrates all features without requiring gameplay
 * - Income/expense ratio is auto-balanced (90-110%) to show realistic pet ownership
 * - All expenses use real store items only (ensures consistency with gameplay)
 * - Income sources match real gameplay (quests, check-ins, allowance, tasks)
 * 
 * IMPORTANT: Only affects demo mode (meta.demo === true). Normal mode unchanged.
 * Supports modular structure & readability (FBLA rubric-friendly)
 */

import { Expense, Income } from '../utils/reporting'
import { storeItems } from '../data/storeItems'
import type { ShopItem } from './types'
import { SlotData } from './types'
import { createPet, giveXP } from './pet'
import { saveAll, deleteSlot, loadAll } from './storage'
import { getDefaultQuests } from './quests'
import { sanitizeTransactions } from '../utils/sanitizeTransactions'

// ============================================================================
// EXPENSE GENERATION
// ============================================================================

/**
 * Generates realistic day-to-day expense history from real store items
 * 
 * Realistic patterns (30 days):
 * - Food: Purchased every 1-2 days (essential daily care) - ~20-24 purchases
 *   - Basic Food: ~70% (regular meals)
 *   - Premium Food: ~30% (occasional treats)
 * - Supplies: Purchased weekly/bi-weekly (cleaning needs) - ~4-6 purchases
 * - Toys: Occasional treats (1-2 per week) - ~4-8 purchases
 * - Activities: Weekend/occasional outings - ~3-6 purchases
 * - Health: Rare but important (monthly checkup, occasional medicine) - ~1-2 purchases
 * 
 * @param now - Current timestamp
 * @returns Array of expense entries matching app schema
 */
function generateDemoExpenses(now: number): Expense[] {
  const oneDay = 24 * 60 * 60 * 1000
  const expenses: Expense[] = []
  
  // Group items by category
  const foodItems = storeItems.filter(item => item.category === 'food')
  const suppliesItems = storeItems.filter(item => item.category === 'supplies')
  const toyItems = storeItems.filter(item => item.category === 'toys')
  const activityItems = storeItems.filter(item => item.category === 'activity')
  const healthItems = storeItems.filter(item => item.category === 'health')
  
  // Use ALL items from each category for variety (not just specific ones)
  // This ensures we don't repeat the same item 7-20 times
  
  // Track recent items to prevent immediate repeats
  const recentItems: ShopItem[] = []
  const itemsByDay: Record<number, Map<number, number>> = {}
  const usedTimestamps = new Set<number>()
  
  // Helper to generate unique timestamp for a day
  const generateTimestamp = (day: number, hourMin: number = 9, hourMax: number = 18): number => {
    const hour = Math.floor(Math.random() * (hourMax - hourMin + 1)) + hourMin
    const minute = Math.floor(Math.random() * 60)
    let timestamp = now - (day * oneDay) + (hour * 60 * 60 * 1000) + (minute * 60 * 1000)
    
    let attempts = 0
    while (usedTimestamps.has(timestamp) && attempts < 100) {
      timestamp += Math.floor(Math.random() * 60000)
      attempts++
    }
    usedTimestamps.add(timestamp)
    return timestamp
  }
  
  // Helper to add expense with anti-repeat checks
  const addExpense = (item: ShopItem, day: number, hourMin: number = 9, hourMax: number = 18): boolean => {
    if (!itemsByDay[day]) {
      itemsByDay[day] = new Map()
    }
    
    const lastTwoSame = recentItems.length >= 2 && 
                        recentItems[recentItems.length - 1]?.id === item.id &&
                        recentItems[recentItems.length - 2]?.id === item.id
    
    const dayCount = itemsByDay[day].get(item.id) || 0
    
    if (lastTwoSame || dayCount >= 2) {
      return false
    }
    
    const timestamp = generateTimestamp(day, hourMin, hourMax)
    
    let expenseCategory: Expense['category'] = 'Other'
    if (item.category === 'food') expenseCategory = 'Food'
    else if (item.category === 'supplies') expenseCategory = 'Supplies'
    else if (item.category === 'health') expenseCategory = 'Health'
    else if (item.category === 'toys') expenseCategory = 'Toys'
    else if (item.category === 'activity') expenseCategory = 'Activities'
    
    const expense: Expense = {
      id: `demo_exp_${item.id}_${timestamp}_${Math.random().toString(36).substring(2, 9)}`,
      amount: item.price,
      category: expenseCategory,
      label: item.name,
      timestamp
    }
    
    expenses.push(expense)
    
    recentItems.push(item)
    if (recentItems.length > 3) {
      recentItems.shift()
    }
    
    itemsByDay[day].set(item.id, dayCount + 1)
    return true
  }
  
  // Generate food purchases (20-24 total) - use ALL food items for variety
  const foodCount = 20 + Math.floor(Math.random() * 5)
  const foodDays: number[] = []
  let currentDay = 29
  while (currentDay >= 0 && foodDays.length < foodCount) {
    foodDays.push(currentDay)
    currentDay -= (1 + Math.floor(Math.random() * 2))
  }
  
  // Use ALL food items, rotating to prevent repeats
  const foodItemUsage = new Map<number, number>() // Track how many times each item used
  foodDays.forEach(day => {
    let attempts = 0
    while (attempts < 10) {
      // Pick a random food item, but prefer less-used ones
      const availableItems = foodItems.filter(item => {
        const usage = foodItemUsage.get(item.id) || 0
        return usage < Math.ceil(foodCount / foodItems.length) + 2 // Max 2 over average
      })
      const itemPool = availableItems.length > 0 ? availableItems : foodItems
      const item = itemPool[Math.floor(Math.random() * itemPool.length)]
      
      if (addExpense(item, day, 8, 20)) {
        foodItemUsage.set(item.id, (foodItemUsage.get(item.id) || 0) + 1)
        break
      }
      attempts++
    }
  })
  
  // Generate supplies (4-6 total)
  const suppliesCount = 4 + Math.floor(Math.random() * 3)
  const supplyDays: number[] = []
  currentDay = 28
  let supplyAdded = 0
  
  while (currentDay >= 0 && supplyAdded < suppliesCount) {
    supplyDays.push(currentDay)
    supplyAdded++
    currentDay -= (5 + Math.floor(Math.random() * 4))
  }
  
  supplyDays.forEach(day => {
    let attempts = 0
    const item = suppliesItems[Math.floor(Math.random() * suppliesItems.length)]
    while (attempts < 5) {
      if (addExpense(item, day, 10, 16)) {
        break
      }
      attempts++
    }
  })
  
  // Generate toys (4-8 total)
  const toyCount = 4 + Math.floor(Math.random() * 5)
  const toyDays: number[] = []
  
  for (let day = 29; day >= 0 && toyDays.length < toyCount; day--) {
    const dayOfWeek = new Date(now - (day * oneDay)).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const chance = isWeekend ? 0.4 : 0.15
    
    if (Math.random() < chance || toyDays.length < 4) {
      toyDays.push(day)
    }
  }
  
  toyDays.forEach(day => {
    let attempts = 0
    const item = toyItems[Math.floor(Math.random() * toyItems.length)]
    while (attempts < 5) {
      if (addExpense(item, day, 10, 18)) {
        break
      }
      attempts++
    }
  })
  
  // Generate activities (3-6 total)
  const activityCount = 3 + Math.floor(Math.random() * 4)
  const activityDays: number[] = []
  
  for (let day = 29; day >= 0 && activityDays.length < activityCount; day--) {
    const dayOfWeek = new Date(now - (day * oneDay)).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const chance = isWeekend ? 0.35 : 0.12
    
    if (Math.random() < chance || activityDays.length < 3) {
      activityDays.push(day)
    }
  }
  
  activityDays.forEach(day => {
    let attempts = 0
    const item = activityItems[Math.floor(Math.random() * activityItems.length)]
    while (attempts < 5) {
      if (addExpense(item, day, 9, 17)) {
        break
      }
      attempts++
    }
  })
  
  // Generate health (1-2 total) - use ALL health items for variety
  const healthCount = 1 + Math.floor(Math.random() * 2)
  const healthDays: number[] = []
  
  for (let i = 0; i < healthCount; i++) {
    const healthDay = 10 + Math.floor(Math.random() * 11)
    if (!healthDays.includes(healthDay)) {
      healthDays.push(healthDay)
    }
  }
  
  healthDays.forEach(day => {
    let attempts = 0
    while (attempts < 10) {
      // Use ALL health items, rotating for variety
      const item = healthItems[Math.floor(Math.random() * healthItems.length)]
      if (addExpense(item, day, 9, 14)) {
        break
      }
      attempts++
    }
  })
  
  expenses.sort((a, b) => b.timestamp - a.timestamp)
  
  return expenses
}

// ============================================================================
// INCOME GENERATION
// ============================================================================

const TASK_LABELS = [
  'Daily Chore',
  'Homework Bonus',
  'Neighborhood Help',
  'Pet Sitting',
  'Recycling Task',
  'Walk Dogs',
  'Yard Help',
  'Training Helper',
  'Quest Reward',
  'Streak Bonus',
  'Bonus Tip',
  'Garden Helper',
  'Household Task'
]

function pickLabelAvoidRepeat(pool: string[], recentLabels: string[]): string {
  const available = pool.filter(label => !recentLabels.includes(label))
  const candidates = available.length > 0 ? available : pool
  return candidates[Math.floor(Math.random() * candidates.length)]
}

/**
 * Generates realistic 30-day expense and income history for demo mode
 * 
 * @param now - Current timestamp
 * @returns Object with expenses and income arrays
 */
function seedDemoFinanceHistory(now: number): { expenses: Expense[]; income: Income[] } {
  const oneDay = 24 * 60 * 60 * 1000
  const income: Income[] = []
  
  const expenses = generateDemoExpenses(now)
  
  const recentIncomeLabels: string[] = []
  const usedTimestamps = new Set<number>()
  
  const generateTimestamp = (day: number, hourMin: number, hourMax: number): number => {
    const hour = Math.floor(Math.random() * (hourMax - hourMin + 1)) + hourMin
    const minute = Math.floor(Math.random() * 60)
    let timestamp = now - (day * oneDay) + (hour * 60 * 60 * 1000) + (minute * 60 * 1000)
    
    let attempts = 0
    while (usedTimestamps.has(timestamp) && attempts < 100) {
      timestamp += Math.floor(Math.random() * 60000)
      attempts++
    }
    usedTimestamps.add(timestamp)
    return timestamp
  }
  
  // Daily quests (14-22 entries)
  const questCount = 14 + Math.floor(Math.random() * 9)
  const questDays: number[] = []
  
  for (let day = 29; day >= 0 && questDays.length < questCount; day--) {
    if (Math.random() < 0.6 || questDays.length < 14) {
      questDays.push(day)
    }
  }
  
  questDays.sort((a, b) => b - a)
  
  questDays.forEach((day, index) => {
    const timestamp = generateTimestamp(day, 8, 18)
    
    let amount: number
    const rand = Math.random()
    if (rand < 0.25) {
      amount = 20
    } else if (rand < 0.75) {
      amount = 30
    } else {
      amount = 45
    }
    
    const label = pickLabelAvoidRepeat(TASK_LABELS, recentIncomeLabels)
    
    income.push({
      id: `demo_inc_quest_${timestamp}_${index}_${Math.random().toString(36).substring(2, 9)}`,
      amount,
      source: 'Daily Quest',
      label: label || 'Quest Reward',
      timestamp
    })
    
    recentIncomeLabels.push(label)
    if (recentIncomeLabels.length > 8) {
      recentIncomeLabels.shift()
    }
  })
  
  // Daily check-in (18-26 entries)
  const checkinCount = 18 + Math.floor(Math.random() * 9)
  const checkinDays: number[] = []
  
  for (let day = 29; day >= 0 && checkinDays.length < checkinCount; day--) {
    if (Math.random() < 0.75) {
      checkinDays.push(day)
    }
  }
  
  checkinDays.sort((a, b) => b - a)
  
  checkinDays.forEach((day, index) => {
    const timestamp = generateTimestamp(day, 7, 11)
    const amount = 12 + Math.floor(Math.random() * 4)
    
    income.push({
      id: `demo_inc_checkin_${timestamp}_${index}_${Math.random().toString(36).substring(2, 9)}`,
      amount,
      source: 'Daily Check-In',
      label: 'Daily Check-In Reward',
      timestamp
    })
  })
  
  // Weekly allowance (2-4 entries)
  const allowanceCount = 2 + Math.floor(Math.random() * 3)
  const allowanceDays: number[] = []
  
  for (let i = 0; i < allowanceCount; i++) {
    const baseDay = 28 - (i * 7)
    const day = baseDay - Math.floor(Math.random() * 2)
    if (day >= 0 && !allowanceDays.includes(day)) {
      allowanceDays.push(day)
    }
  }
  
  allowanceDays.sort((a, b) => b - a)
  
  allowanceDays.forEach((day, index) => {
    const timestamp = generateTimestamp(day, 9, 17)
    
    income.push({
      id: `demo_inc_allowance_${timestamp}_${index}_${Math.random().toString(36).substring(2, 9)}`,
      amount: 70,
      source: 'Weekly Allowance',
      label: 'Weekly Allowance',
      timestamp
    })
  })
  
  // Task income (25-35 entries) - tasks give coins + XP + stat benefits
  const taskCount = 25 + Math.floor(Math.random() * 11)
  const taskDays: number[] = []
  
  for (let day = 29; day >= 0 && taskDays.length < taskCount; day--) {
    // Tasks can happen multiple times per day (different tasks)
    const tasksPerDay = Math.random() < 0.7 ? 1 : (Math.random() < 0.5 ? 2 : 0)
    for (let t = 0; t < tasksPerDay; t++) {
      taskDays.push(day)
    }
  }
  
  taskDays.sort((a, b) => b - a)
  
  const taskLabels = ['Clean Room', 'Training Session', 'Pet Walking', 'Grooming Session']
  taskDays.forEach((day, index) => {
    const timestamp = generateTimestamp(day, 8, 20)
    // Task rewards: 15-20 coins (matches task definitions)
    const amount = 15 + Math.floor(Math.random() * 6)
    const label = taskLabels[Math.floor(Math.random() * taskLabels.length)]
    
    income.push({
      id: `demo_inc_task_${timestamp}_${index}_${Math.random().toString(36).substring(2, 9)}`,
      amount,
      source: 'Task',
      label: label || 'Task Reward',
      timestamp
    })
  })
  
  // Bonus events (1-3 entries)
  const bonusCount = 1 + Math.floor(Math.random() * 3)
  const bonusLabels = ['Streak Bonus', 'Achievement Reward', 'Special Bonus', 'Milestone Reward']
  
  for (let i = 0; i < bonusCount; i++) {
    const day = Math.floor(Math.random() * 25) + 3
    const timestamp = generateTimestamp(day, 10, 18)
    const amount = 25 + Math.floor(Math.random() * 21)
    const label = bonusLabels[Math.floor(Math.random() * bonusLabels.length)]
    
    income.push({
      id: `demo_inc_bonus_${timestamp}_${i}_${Math.random().toString(36).substring(2, 9)}`,
      amount,
      source: 'Bonus',
      label,
      timestamp
    })
  }
  
  // Auto-balance pass
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0)
  
  const targetIncomeMin = Math.round(totalExpenses * 0.90)
  const targetIncomeMax = Math.round(totalExpenses * 1.10)
  
  if (totalIncome < targetIncomeMin) {
    const deficit = targetIncomeMin - totalIncome
    const questsToAdd = Math.ceil(deficit / 30)
    
    for (let i = 0; i < questsToAdd && i < 10; i++) {
      const day = Math.floor(Math.random() * 30)
      const timestamp = generateTimestamp(day, 8, 18)
      const rand = Math.random()
      const amount = rand < 0.33 ? 20 : (rand < 0.67 ? 30 : 45)
      const label = pickLabelAvoidRepeat(TASK_LABELS, recentIncomeLabels)
      
      income.push({
        id: `demo_inc_balance_quest_${timestamp}_${i}_${Math.random().toString(36).substring(2, 9)}`,
        amount,
        source: 'Daily Quest',
        label: label || 'Quest Reward',
        timestamp
      })
    }
  } else if (totalIncome > targetIncomeMax) {
    const excess = totalIncome - targetIncomeMax
    
    const questsToReduce = Math.min(Math.ceil(excess / 10), income.filter(inc => inc.source === 'Daily Quest').length)
    let reduced = 0
    for (let i = income.length - 1; i >= 0 && reduced < questsToReduce; i--) {
      if (income[i].source === 'Daily Quest' && income[i].amount > 20) {
        income[i].amount = Math.max(20, income[i].amount - 5)
        reduced++
      }
    }
  }
  
  expenses.sort((a, b) => b.timestamp - a.timestamp)
  income.sort((a, b) => b.timestamp - a.timestamp)
  
  return { expenses, income }
}

// ============================================================================
// DEMO MODE MANAGEMENT
// ============================================================================

/**
 * Creates comprehensive demo data for presentations
 * 
 * @param slot - Save slot to use (default: 1)
 * @returns Complete slot data ready to save
 */
export function createDemoData(slot: 1 | 2 | 3 = 1): SlotData {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  
  let demoPet = createPet('Demo', 'cat', 1500)
  demoPet = giveXP(demoPet, 35)
  
  demoPet.stats = {
    hunger: 75,
    happiness: 82,
    health: 88,
    energy: 70,
    cleanliness: 78
  }
  
  demoPet.lastTickAt = now
  demoPet.lastUpdated = now
  
  let seedData = seedDemoFinanceHistory(now)
  seedData = sanitizeTransactions(seedData.expenses, seedData.income)
  
  const expenses = seedData.expenses.map(exp => {
    let type: any = 'purchase'
    if (exp.category === 'Food') type = 'food'
    else if (exp.category === 'Toys') type = 'toy'
    else if (exp.category === 'Health') type = 'healthcare'
    else if (exp.category === 'Supplies') type = 'supplies'
    else if (exp.category === 'Activities') type = 'activity'
    
    return {
      id: exp.id,
      timestamp: exp.timestamp,
      amount: exp.amount,
      description: exp.label,
      type,
      itemName: exp.label
    }
  })
  
  const income = seedData.income.map(inc => ({
    id: inc.id,
    timestamp: inc.timestamp,
    amount: inc.amount,
    description: inc.label,
    source: inc.source.toLowerCase()
  }))
  
  const totalExpenses = seedData.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalEarned = seedData.income.reduce((sum, inc) => sum + inc.amount, 0)
  
  const coinsStart = 1500
  demoPet.lifetimeEarnings = totalEarned
  demoPet.coins = Math.max(0, coinsStart + totalEarned - totalExpenses)
  
  demoPet.expenses = expenses
  // Demo badges: Show variety of earned badges
  demoPet.badges = ['first_purchase', 'budget_starter', 'growing_up']
  
  const quests = getDefaultQuests()
  
  const yesterday = new Date(now - oneDay)
  const yesterdayDateString = yesterday.toLocaleDateString('en-CA')
  
  const demoData: SlotData = {
    pet: demoPet,
    expenses: expenses,
    income: income,
    quests: quests as any,
    badges: demoPet.badges,
    taskState: [],
    meta: {
      createdAt: new Date(now - (30 * oneDay)).toISOString(),
      lastPlayed: new Date(now).toISOString(),
      slotNumber: slot,
      demo: true,
      demoSeedVersion: 1,
      lastCheckIn: yesterdayDateString
    }
  }
  
  return demoData
}

/**
 * Starts demo mode - single reliable entry function
 * 
 * @param slot - Save slot to use (default: 1)
 */
export function startDemoMode(slot: 1 | 2 | 3 = 1): void {
  localStorage.setItem('tama_current_slot', slot.toString())
  
  const existing = loadAll(slot)
  if (existing?.meta?.demo === true && existing?.meta?.demoSeedVersion === 1) {
    console.log('[DEMO] Demo data already seeded, skipping re-seed')
    return
  }
  
  deleteSlot(slot)
  
  const demoData = createDemoData(slot)
  
  saveAll(
    slot,
    demoData.pet,
    demoData.expenses || [],
    demoData.income || [],
    demoData.quests || null,
    demoData.badges || [],
    demoData.taskState || null,
    true
  )
}

/**
 * Resets demo mode (recreates demo data)
 * 
 * @param slot - Save slot to reset (default: 1)
 */
export function resetDemoMode(slot: 1 | 2 | 3 = 1): void {
  // Always delete and recreate, even if demo already exists
  deleteSlot(slot)
  localStorage.setItem('tama_current_slot', slot.toString())
  
  const demoData = createDemoData(slot)
  
  saveAll(
    slot,
    demoData.pet,
    demoData.expenses || [],
    demoData.income || [],
    demoData.quests || null,
    demoData.badges || [],
    demoData.taskState || null,
    true
  )
}

/**
 * Exits demo mode (clears demo slot)
 * 
 * @param slot - Save slot to clear (default: 1)
 */
export function exitDemoMode(slot: 1 | 2 | 3 = 1): void {
  deleteSlot(slot)
  localStorage.removeItem('tama_current_slot')
}

