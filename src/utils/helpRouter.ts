/**
 * Help Router - Offline FAQ Assistant
 * Simulates ML behavior using pattern recognition and intent matching
 */

export interface IntentResult {
  intent: string | null
  confidence: number
  localAnswer?: string
}

export interface FAQItem {
  intent: string
  keywords: string[]
  answer: string
}

const FAQ_KNOWLEDGE_BASE: FAQItem[] = [
  {
    intent: 'pet_mood',
    keywords: ['sad', 'unhappy', 'mood', 'why is my pet', 'pet is sad', 'pet unhappy', 'moody', 'feeling'],
    answer: 'Your pet\'s mood is affected by hunger, cleanliness, energy, and health. Try feeding, cleaning, or letting your pet rest. Consistent care improves mood and long-term development.'
  },
  {
    intent: 'why_pet_sad',
    keywords: ['why is my pet sad', 'why pet sad', 'pet sad why'],
    answer: 'Your pet may be sad due to low hunger, cleanliness, energy, or health stats. Check your pet\'s stats on the Dashboard and use care actions (Feed, Clean, Rest, Vet) to improve them. Low stats reduce happiness and overall mood.'
  },
  {
    intent: 'saving_money',
    keywords: ['save', 'saving', 'save money', 'budget', 'budgeting', 'afford', 'spending', 'cost'],
    answer: 'Saving coins requires balancing tasks and spending. Complete daily quests, avoid unnecessary purchases, and track expenses in the Reports section to stay within budget.'
  },
  {
    intent: 'earning_coins',
    keywords: ['earn', 'earning', 'coins', 'earn coins', 'get coins', 'make money', 'earn money', 'how to earn', 'tasks', 'quests'],
    answer: 'Coins are earned through tasks, quests, and daily rewards. This system teaches earning before spending, just like real life.'
  },
  {
    intent: 'reports_help',
    keywords: ['report', 'reports', 'expense', 'expenses', 'chart', 'charts', 'csv', 'export', 'data', 'statistics', 'tracking'],
    answer: 'The Reports page tracks income, expenses, and spending categories. Use filters to view specific time periods or categories, and export data to CSV for analysis.'
  },
  {
    intent: 'badges_help',
    keywords: ['badge', 'badges', 'achievement', 'achievements', 'unlock', 'earn badge', 'reward'],
    answer: 'Badges reward good care habits and smart budgeting. They encourage consistent, responsible behavior.'
  },
  {
    intent: 'create_pet',
    keywords: ['create pet', 'how do i create a pet', 'create a pet', 'new pet', 'make pet'],
    answer: 'Go to the Home page and click "Start New Game". Select an empty save slot (1, 2, or 3), then choose a name and pet type (Cat, Dog, or Rabbit). Your pet starts with 1000 coins and all stats at 100%.'
  },
  {
    intent: 'feed_pet',
    keywords: ['how do i feed my pet', 'feed pet', 'feeding', 'how to feed'],
    answer: 'First, purchase food from the Store. Then go to the Dashboard and click the "Feed" button. You\'ll select which food item from your inventory to use. Feeding restores hunger and provides XP.'
  },
  {
    intent: 'what_are_coins',
    keywords: ['what are coins', 'coins', 'what coins', 'currency'],
    answer: 'Coins are the currency in Tama Tracky. You spend coins on pet care actions (Feed, Play, Clean, Vet) and store purchases. You start with 1000 coins and can earn more through tasks, quests, and daily rewards.'
  },
  {
    intent: 'pet_stats',
    keywords: ['pet stats', 'what are the pet stats', 'stats', 'statistics'],
    answer: 'Your pet has 5 stats: Health (0-100%), Happiness (0-100%), Hunger (0-100%), Cleanliness (0-100%), and Energy (0-100%). Keep all stats high by regularly caring for your pet. Low stats reduce mood and can affect your pet\'s development.'
  },
  {
    intent: 'evolution',
    keywords: ['evolution', 'how does evolution work', 'age stage', 'grow up'],
    answer: 'Your pet evolves through 4 age stages: Baby, Young, Adult, and Mature. Evolution happens automatically when your pet earns enough XP (20 for Young, 60 for Adult, 120 for Mature). Complete tasks, quests, and care actions to earn XP.'
  },
  {
    intent: 'view_expenses',
    keywords: ['how do i view my expenses', 'view expenses', 'see expenses', 'expense tracking'],
    answer: 'Go to the Reports page to see all expenses. You can filter by category (Food, Health, Toys, etc.) or date range (Today, Last 7 Days, Last 30 Days, All Time). Charts and CSV export are also available.'
  },
  {
    intent: 'demo_mode',
    keywords: ['what is demo mode', 'demo mode', 'demo'],
    answer: 'Demo Mode creates a realistic 30-day pet care scenario with pre-generated expenses, income, and progress. It\'s perfect for demonstrations and shows how the financial tracking system works. Click "DEMO MODE" on the Home page to start.'
  },
  {
    intent: 'daily_quests',
    keywords: ['daily quests', 'how do daily quests work', 'quests', 'quest'],
    answer: 'Daily Quests are rotating challenges that reward coins and XP when completed. Check the Tasks page to see available quests. Complete quest objectives (like feeding your pet 3 times) to earn rewards.'
  }
]

function calculateConfidence(question: string, keywords: string[]): number {
  const lowerQuestion = question.toLowerCase()
  const normalizedQuestion = lowerQuestion
    .replace(/coins?/g, 'coin')
    .replace(/saving/g, 'save')
    .replace(/earning/g, 'earn')
  
  const singleKeywords: string[] = []
  const phraseKeywords: string[] = []
  
  keywords.forEach(keyword => {
    if (keyword.split(/\s+/).length > 1) {
      phraseKeywords.push(keyword)
    } else {
      singleKeywords.push(keyword)
    }
  })
  
  const matchedKeywords = keywords.filter(keyword => {
    const lowerKeyword = keyword.toLowerCase()
    return normalizedQuestion.includes(lowerKeyword)
  })
  
  const matchedPhrases = phraseKeywords.filter(phrase => {
    return normalizedQuestion.includes(phrase.toLowerCase())
  })
  
  const matchRatio = matchedKeywords.length / keywords.length
  let boost = 0
  if (matchedKeywords.length > 1) {
    boost = 0.2
  }
  
  if (matchedPhrases.length > 0) {
    boost += 0.3
  }
  
  if (matchedPhrases.length > 0 && matchRatio + boost < 0.6) {
    boost = Math.max(boost, 0.6 - matchRatio + 0.1)
  }
  
  return Math.min(1.0, matchRatio + boost)
}

export function routeQuestion(question: string): IntentResult {
  if (!question || question.trim().length === 0) {
    return { intent: null, confidence: 0 }
  }
  
  const trimmedQuestion = question.trim()
  let bestMatch: FAQItem | null = null
  let bestConfidence = 0
  
  for (const faq of FAQ_KNOWLEDGE_BASE) {
    const confidence = calculateConfidence(trimmedQuestion, faq.keywords)
    if (confidence > bestConfidence) {
      bestConfidence = confidence
      bestMatch = faq
    }
  }
  
  if (bestMatch && bestConfidence >= 0.6) {
    return {
      intent: bestMatch.intent,
      confidence: bestConfidence,
      localAnswer: bestMatch.answer
    }
  }
  
  return {
    intent: bestMatch?.intent || null,
    confidence: bestConfidence,
    localAnswer: undefined
  }
}

export function getFallbackResponse(): string {
  return "I'm here to help! Try asking specific questions like 'Why is my pet sad?', 'How do I create a pet?', 'What are coins?', or 'How do I view my expenses?'"
}

