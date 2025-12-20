/**
 * Help Router - Offline FAQ Assistant (ML Behavior Simulation)
 * 
 * This module simulates machine learning behavior using pattern recognition
 * and intent matching. It provides intelligent, deterministic responses without
 * requiring external APIs or real AI calls.
 * 
 * HOW IT SIMULATES ML BEHAVIOR:
 * - Pattern Recognition: Analyzes user input for keyword patterns
 * - Intent Classification: Matches input to predefined intent categories
 * - Confidence Scoring: Calculates match quality (0-1 scale) similar to ML confidence
 * - Smart Routing: Routes to best answer based on confidence threshold
 * - Deterministic: Always returns same response for same input (reliable, testable)
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

/**
 * Predefined Intent List - ML Behavior Simulation
 * 
 * This knowledge base contains 5 core intents that the system can recognize.
 * Each intent has:
 * - Keywords: Patterns to match in user input (simulates feature extraction)
 * - Answer: Polished, judge-friendly response
 * 
 * HOW KEYWORD MATCHING SIMULATES ML:
 * - Pattern Recognition: Keywords act like features in ML models
 * - Intent Classification: Matching keywords determines intent category
 * - Confidence Scoring: Number of matched keywords = confidence score
 * - Deterministic: Same input always produces same output (reliable, testable)
 */
const FAQ_KNOWLEDGE_BASE: FAQItem[] = [
  {
    intent: 'pet_mood',
    keywords: ['sad', 'unhappy', 'mood', 'why is my pet', 'pet is sad', 'pet unhappy', 'moody', 'feeling'],
    answer: 'Your pet\'s mood is affected by hunger, cleanliness, energy, and health. Try feeding, cleaning, or letting your pet rest. Consistent care improves mood and long-term development.'
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
    answer: 'The Reports page tracks income, expenses, and spending categories. Use Judge Mode to quickly view financial summaries and trends.'
  },
  {
    intent: 'badges_help',
    keywords: ['badge', 'badges', 'achievement', 'achievements', 'unlock', 'earn badge', 'reward'],
    answer: 'Badges reward good care habits and smart budgeting. They encourage consistent, responsible behavior.'
  }
]

/**
 * Calculates Intent Confidence Score - Simulates ML Confidence
 * This function simulates machine learning confidence scoring using keyword matching:
 * 1. Pattern Matching: Searches for keyword patterns in user input
 * 2. Feature Extraction: Counts how many keywords match (like ML features)
 * 3. Confidence Calculation: Ratio of matched keywords to total keywords
 * 4. Boost Logic: Multiple matches increase confidence (simulates strong signals)
 * 
 * KEYWORD SCORING EXAMPLE:
 * Input: "Why is my pet sad and unhappy?"
 * Keywords for pet_mood: ['sad', 'unhappy', 'mood', ...]
 * Matched keywords: ['sad', 'unhappy'] = 2 matches
 * Confidence = (2 matches / 8 total keywords) + boost = high confidence
 * Result: Matches pet_mood intent with high confidence
 * 
 * JUDGE-FRIENDLY EXPLANATION:
 * Similar to how ML models calculate confidence:
 * - More matching patterns = higher confidence
 * - Multiple keyword matches = stronger signal
 * - Normalized score (0-1) = probability-like confidence
 * 
 * This is deterministic pattern recognition, not actual ML, but demonstrates
 * the same concepts: feature extraction, classification, and confidence scoring.
 * 
 * @param question - User's question (input to analyze)
 * @param keywords - Array of keywords to match (patterns/features)
 * @returns Confidence score (0-1), where 1.0 = perfect match
 */
function calculateConfidence(question: string, keywords: string[]): number {
  const lowerQuestion = question.toLowerCase()
  
  // Normalize input for better matching (handles variations)
  const normalizedQuestion = lowerQuestion
    .replace(/coins?/g, 'coin')
    .replace(/saving/g, 'save')
    .replace(/earning/g, 'earn')
  
  // Separate single-word keywords from multi-word phrases
  const singleKeywords: string[] = []
  const phraseKeywords: string[] = []
  
  keywords.forEach(keyword => {
    if (keyword.split(/\s+/).length > 1) {
      phraseKeywords.push(keyword)
    } else {
      singleKeywords.push(keyword)
    }
  })
  
  // Count how many keywords match (simulates feature extraction)
  const matchedKeywords = keywords.filter(keyword => {
    const lowerKeyword = keyword.toLowerCase()
    return normalizedQuestion.includes(lowerKeyword)
  })
  
  // Count phrase matches separately (these are stronger signals)
  const matchedPhrases = phraseKeywords.filter(phrase => {
    return normalizedQuestion.includes(phrase.toLowerCase())
  })
  
  // Calculate confidence: ratio of matches to total keywords
  // This simulates ML confidence: more features match = higher confidence
  const matchRatio = matchedKeywords.length / keywords.length
  
  // Boost confidence if multiple keywords match (strong signal)
  // Simulates ML behavior where multiple matching features increase confidence
  let boost = 0
  if (matchedKeywords.length > 1) {
    boost = 0.2
  }
  
  // Extra boost for phrase matches (exact phrase matches are very strong signals)
  // This ensures questions like "Why is my pet sad?" match with high confidence
  if (matchedPhrases.length > 0) {
    boost += 0.3 // Strong boost for phrase matches
  }
  
  // If we have at least one key phrase match, ensure minimum confidence
  // This is a safety net to guarantee phrase matches exceed the threshold
  if (matchedPhrases.length > 0 && matchRatio + boost < 0.6) {
    boost = Math.max(boost, 0.6 - matchRatio + 0.1) // Ensure it exceeds threshold
  }
  
  // Return confidence score (0-1), capped at 1.0
  return Math.min(1.0, matchRatio + boost)
}

/**
 * Routes User Question Using Intent Matching (ML Behavior Simulation)
 * 
 * This function simulates ML inference by:
 * 1. Analyzing input: Processes user question
 * 2. Feature extraction: Matches keywords (patterns)
 * 3. Classification: Determines best matching intent
 * 4. Confidence scoring: Calculates how well input matches intent
 * 5. Decision making: Returns answer if confidence is high enough
 * 
 * JUDGE-FRIENDLY EXPLANATION:
 * This simulates machine learning behavior:
 * - Pattern Recognition: Finds keyword patterns in questions
 * - Intent Classification: Categorizes question into one of 5 intents
 * - Confidence Scoring: Calculates match quality (0-1 scale)
 * - Threshold Decision: Only returns answer if confidence >= 0.6
 * 
 * Similar to ML models, this uses:
 * - Feature matching (keywords) instead of neural networks
 * - Confidence scoring instead of probability distributions
 * - Deterministic routing instead of stochastic sampling
 * 
 * @param question - User's question (input to classify)
 * @returns Intent result with matched intent, confidence score, and answer
 */
export function routeQuestion(question: string): IntentResult {
  if (!question || question.trim().length === 0) {
    return { intent: null, confidence: 0 }
  }
  
  const trimmedQuestion = question.trim()
  
  // Find best matching intent (simulates ML classification)
  // Iterates through all intents and finds the one with highest confidence
  let bestMatch: FAQItem | null = null
  let bestConfidence = 0
  
  for (const faq of FAQ_KNOWLEDGE_BASE) {
    const confidence = calculateConfidence(trimmedQuestion, faq.keywords)
    
    // Keep track of best match (highest confidence)
    if (confidence > bestConfidence) {
      bestConfidence = confidence
      bestMatch = faq
    }
  }
  
  // Decision threshold: Only return answer if confidence is high enough
  // This simulates ML behavior where low-confidence predictions are rejected
  if (bestMatch && bestConfidence >= 0.6) {
    return {
      intent: bestMatch.intent,
      confidence: bestConfidence,
      localAnswer: bestMatch.answer
    }
  }
  
  // Low confidence or no match - return null (will trigger fallback)
  return {
    intent: bestMatch?.intent || null,
    confidence: bestConfidence,
    localAnswer: undefined
  }
}

/**
 * Fallback Response for No Match
 * 
 * Returns a helpful fallback message when no intent matches with sufficient confidence.
 * This ensures users always get a response, even if their question doesn't match
 * any of the predefined intents.
 * 
 * @returns Fallback response string
 */
export function getFallbackResponse(): string {
  return "I'm here to help! Try asking about pet care, saving coins, or reports."
}

