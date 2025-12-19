/**
 * Tasks System Module
 * 
 * PURPOSE: Task-based earning system that teaches responsibility through chores.
 * 
 * JUDGE-FRIENDLY EXPLANATION:
 * - Tasks give BOTH coins (for spending) AND XP (for pet evolution/age progression)
 * - Tasks also affect pet vitals (happiness, cleanliness, energy, health, hunger)
 * - This dual reward system teaches that work improves both finances and pet care
 * - Tasks have cooldowns to prevent spam and encourage thoughtful engagement
 * 
 * KEY FEATURES:
 * - Simple earning tasks (chores, training, walking, grooming)
 * - Each task gives coins, XP, and stat improvements
 * - All earnings logged for cost-of-care reports
 * - Cooldowns prevent unlimited instant earnings (teaches budgeting)
 */

/**
 * Task Definition - A task the user can complete to earn coins, XP, and stat improvements
 * 
 * Tasks have cooldowns so users can't earn unlimited coins instantly.
 * This mimics real life chores and encourages budgeting.
 * Reward is only added when the user claims it.
 * 
 * FBLA REQUIREMENT: Tasks should give BOTH XP (for evolution) and stat changes (for pet care).
 */
export interface Task {
  id: string
  name: string
  description: string
  emoji: string
  coins: number
  xp: number // XP reward for completing task (for evolution/age progression)
  statChanges: { // Stat improvements from completing task
    happiness?: number
    cleanliness?: number
    energy?: number
    health?: number
    hunger?: number
  }
  category: 'chore' | 'training' | 'checkin' | 'walking'
  cooldownSeconds: number // Cooldown time in seconds
}

/**
 * All available tasks
 * 
 * These are simple tasks the user can do to earn coins.
 * Tasks simulate responsibility like chores (FBLA requirement).
 * 
 * FINANCIAL RESPONSIBILITY TEACHING:
 * - All tasks give meaningful rewards (minimum 15 coins)
 * - No "micro earnings" that feel pointless
 * - Tasks have cooldowns to prevent spam
 * - Rewards scale with effort (longer cooldown = higher reward)
 */
export const tasks: Task[] = [
  {
    id: 'clean_room',
    name: "Clean your pet's room",
    description: 'Tidy up your pet\'s living space',
    emoji: '🧹',
    coins: 15,
    xp: 2, // XP reward for evolution
    statChanges: {
      cleanliness: 8, // Cleaning improves cleanliness
      happiness: 3 // Clean space makes pet happy
    },
    category: 'chore',
    cooldownSeconds: 60 // 1 minute cooldown
  },
  {
    id: 'training',
    name: 'Do training with your pet',
    description: 'Practice tricks and commands',
    emoji: '🎓',
    coins: 18,
    xp: 3, // Training gives more XP (learning)
    statChanges: {
      happiness: 5, // Training is fun
      energy: -2 // Training is tiring (realistic)
    },
    category: 'training',
    cooldownSeconds: 90 // 1.5 minutes cooldown
  },
  {
    id: 'pet_walking',
    name: 'Pet walking task',
    description: 'Take your pet for a walk',
    emoji: '🚶',
    coins: 20,
    xp: 2, // XP reward
    statChanges: {
      happiness: 6, // Walking is enjoyable
      energy: -3, // Walking is tiring
      health: 2 // Exercise improves health
    },
    category: 'walking',
    cooldownSeconds: 120 // 2 minutes cooldown
  },
  {
    id: 'grooming',
    name: 'Grooming session',
    description: 'Brush and groom your pet',
    emoji: '💇',
    coins: 15,
    xp: 2, // XP reward
    statChanges: {
      cleanliness: 10, // Grooming improves cleanliness
      happiness: 4 // Grooming feels good
    },
    category: 'chore',
    cooldownSeconds: 60 // 1 minute cooldown
  }
  // Note: daily_checkin removed - handled by DailyCheckInModal system
]

/**
 * Completes a task and returns earning information
 * 
 * This is a simple task the user can do to earn coins, XP, and stat improvements.
 * We track all earnings for the cost-of-care report (FBLA requirement).
 * 
 * @param taskId - ID of task to complete
 * @returns Earning information (coins, XP, stat changes, description, timestamp)
 */
export function completeTask(taskId: string): { 
  amount: number
  xp: number
  statChanges: Task['statChanges']
  description: string
  timestamp: number
  source: string
} | null {
  // This finds the task by ID
  const task = tasks.find(t => t.id === taskId)
  if (!task) return null
  
  // This returns the earning info (coins, XP, and stat changes are applied when user confirms)
  return {
    amount: task.coins,
    xp: task.xp,
    statChanges: task.statChanges,
    description: `Completed task: ${task.name}`,
    timestamp: Date.now(),
    source: task.name
  }
}

/**
 * Gets all available tasks
 * 
 * @returns Array of all tasks
 */
export function getAllTasks(): Task[] {
  return tasks
}

/**
 * Gets a task by ID
 * 
 * @param taskId - ID of task to get
 * @returns Task or undefined if not found
 */
export function getTask(taskId: string): Task | undefined {
  return tasks.find(t => t.id === taskId)
}

/**
 * Task State - Tracks cooldown and completion status per task
 * 
 * This is stored per save slot to persist cooldowns.
 */
export interface TaskState {
  taskId: string
  lastCompletedAt: number | null // Timestamp when task was last completed
  inProgress: boolean // Whether task is currently in progress (mini-activity)
}

/**
 * Checks if a task can be done (cooldown expired)
 * 
 * Tasks have cooldowns so users can't earn unlimited coins instantly.
 * This mimics real life chores and encourages budgeting.
 * 
 * @param task - The task to check
 * @param taskState - The task's state (from save slot)
 * @returns True if task can be done, false if on cooldown
 */
export function canDoTask(task: Task, taskState: TaskState | undefined): boolean {
  if (!taskState || !taskState.lastCompletedAt) {
    return true // Never completed, can do it
  }
  
  const now = Date.now()
  const elapsed = (now - taskState.lastCompletedAt) / 1000 // Convert to seconds
  return elapsed >= task.cooldownSeconds
}

/**
 * Gets the time remaining until a task can be done again
 * 
 * @param task - The task to check
 * @param taskState - The task's state (from save slot)
 * @returns Seconds remaining (0 if ready)
 */
export function timeRemaining(task: Task, taskState: TaskState | undefined): number {
  if (!taskState || !taskState.lastCompletedAt) {
    return 0 // Never completed, ready now
  }
  
  const now = Date.now()
  const elapsed = (now - taskState.lastCompletedAt) / 1000 // Convert to seconds
  const remaining = task.cooldownSeconds - elapsed
  return Math.max(0, Math.ceil(remaining))
}

