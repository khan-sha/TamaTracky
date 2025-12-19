import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routeQuestion, getFallbackResponse } from '../utils/helpRouter'

/**
 * Help Page Component with Offline FAQ Assistant (Game Style)
 * 
 * This component provides comprehensive help and support for users, including:
 * - Frequently asked questions
 * - An offline FAQ assistant that matches user questions to curated answers
 * - Step-by-step instructions
 * - Feature explanations
 * 
 * Game Design Features:
 * - Game-style FAQ assistant interface
 * - Colorful FAQ cards
 * - Interactive help system
 * - Clear visual hierarchy
 * 
 * FBLA Requirements:
 * - Clear instructions on every screen
 * - Help menu/feature
 * - Intelligent feature (Offline FAQ Assistant with intent matching)
 * - Intuitive user experience
 */

/**
 * Offline FAQ Assistant Component
 * 
 * Intelligent intent-matching system that routes questions:
 * - High confidence intent matches → Curated local answers (fast, reliable, offline)
 * - Low confidence → Fallback to general help or FAQ list
 * 
 * How It Works:
 * - User selects a question or types their own
 * - System matches intent using keyword analysis and confidence scoring
 * - Returns best answer from curated knowledge base (8-12 strong FAQ intents)
 * - Works completely offline - no API calls required
 * - Fast, reliable, and always available
 * 
 * Why It's Intelligent:
 * - Intent matching: Analyzes question keywords to determine user intent
 * - Confidence scoring: Calculates match confidence (0-1 scale)
 * - Smart routing: Routes to best answer based on confidence threshold (0.6+)
 * - Curated knowledge: 20+ FAQ intents with comprehensive answers
 * - Spelling tolerance: Handles common spelling variations
 */
function QABot() {
  const [question, setQuestion] = useState<string>('')
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'bot', message: string, source?: 'local' | 'fallback' }>>([])
  const [isLoading, setIsLoading] = useState(false)
  
  /**
   * Handles form submission with intent matching
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim() || isLoading) {
      return
    }
    
    const userMessage = question.trim()
    
    // Add user question to conversation
    setConversation(prev => [...prev, { type: 'user', message: userMessage }])
    setIsLoading(true)
    setQuestion('')
    
    try {
      // Route question using intent matching system
      const routingResult = routeQuestion(userMessage)
      
      // If high confidence local match, use curated local answer
      if (routingResult.confidence >= 0.6 && routingResult.localAnswer) {
        setTimeout(() => {
          setConversation(prev => [...prev, { 
            type: 'bot', 
            message: routingResult.localAnswer!,
            source: 'local'
          }])
          setIsLoading(false)
        }, 300) // Small delay for UX
        return
      }
      
      // Low confidence match - provide fallback help
      const fallbackAnswer = getFallbackResponse()
      
      setConversation(prev => [...prev, { 
        type: 'bot', 
        message: fallbackAnswer,
        source: 'fallback'
      }])
      
    } catch (error: any) {
      // Fallback to general help
      console.error('Error in FAQ assistant:', error)
      
      const fallbackAnswer = getFallbackResponse()
      
      setConversation(prev => [...prev, { 
        type: 'bot', 
        message: fallbackAnswer,
        source: 'fallback'
      }])
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Suggests a question when user asks for help.
   * Expanded list for better UX
   */
  const handleHelpRequest = () => {
    const suggestions = [
      'How do I create a pet?',
      'How do I feed my pet?',
      'What are coins?',
      'How do I view my expenses?',
      'What are the pet stats?',
      'How do I earn coins?',
      'What is demo mode?',
      'How does evolution work?',
      'How do I save my game?',
      'Why is my pet sad?',
      'What should I buy?',
      'How do daily quests work?'
    ]
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    setQuestion(randomSuggestion)
  }
  
  /**
   * Shows suggested questions list that users can click
   */
  const suggestedQuestions = [
    'How do I create a pet?',
    'How do I feed my pet?',
    'What are coins?',
    'How do I earn coins?',
    'What are the pet stats?',
    'How does evolution work?',
    'How do I view my expenses?',
    'What is demo mode?'
  ]
  
  return (
    <div className="retro-panel p-8 bg-purple-500">
      <h3 className="text-sm text-white mb-4 flex items-center pixel-heading">
        <span className="pixel-emoji mr-3">🤖</span>
        ASK ME ANYTHING
      </h3>
            <p className="text-white/90 mb-4 pixel-body text-base">
        I'm an Offline FAQ Assistant! Ask me questions about Tama Tracky, and I'll match your question to the best answer from our curated knowledge base. Works instantly and offline!
      </p>
      
      {/* Suggested Questions - Clickable list */}
      <div className="mb-6">
        <p className="text-white/90 text-sm pixel-body mb-2">💡 Suggested Questions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(q)
                // Auto-submit if question is set
                setTimeout(() => {
                  const event = new Event('submit', { bubbles: true, cancelable: true })
                  const form = document.querySelector('form')
                  if (form) form.dispatchEvent(event)
                }, 100)
              }}
              className="px-3 py-1 text-xs retro-panel bg-white/20 hover:bg-white/30 text-white pixel-body border border-white/30"
              title={`Click to ask: ${q}`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
      
      {/* Conversation display - Retro Pixel Chat */}
      <div className="retro-panel p-6 mb-6 h-80 overflow-y-auto bg-white">
        {conversation.length === 0 ? (
          <div className="text-center text-[#6E5A47] py-12">
            <div className="mb-4 flex justify-center"><span className="pixel-emoji-large">💬</span></div>
            <p className="font-bold text-base mb-2 pixel-font">Start a conversation by asking a question!</p>
            <p className="text-sm pixel-body">Try: "How do I save my pet?" or "What are coins?"</p>
            <p className="text-xs pixel-body mt-2 opacity-75">Offline FAQ Assistant - Intent Matching System</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] retro-panel p-4 ${
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#E4D5BC] text-[#6E5A47]'
                  }`}
                >
                  <p className="text-sm font-medium pixel-body whitespace-pre-line">{msg.message}</p>
                  {msg.type === 'bot' && msg.source && (
                    <p className="text-xs opacity-60 mt-2 pixel-body">
                      {msg.source === 'local' && '📚 Curated Answer (Intent Match)'}
                      {msg.source === 'fallback' && '💡 General Help'}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="retro-panel p-4 bg-[#E4D5BC] text-[#6E5A47]">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6E5A47]"></div>
                    <span className="text-sm pixel-body">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Input form - Retro Pixel Style */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about Tama Tracky..."
          className="flex-1 px-6 py-4 retro-panel text-base pixel-body bg-[#F2E9D8]"
          aria-label="Question input"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white retro-btn"
          aria-label="Submit question"
        >
          {isLoading ? '...' : 'ASK'}
        </button>
        <button
          type="button"
          onClick={handleHelpRequest}
          className="px-6 py-4 bg-yellow-400 hover:bg-yellow-500 text-white retro-btn"
          title="Get a suggested question"
          aria-label="Get suggested question"
        >
          <span className="pixel-emoji">❓</span>
        </button>
      </form>
    </div>
  )
}

/**
 * Help Page Component (Game Style)
 */
function Help() {
  return (
    <div className="min-h-screen bg-[#F2E9D8] pixel-body">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back to Dashboard Button */}
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="inline-block retro-btn px-4 py-2 text-sm pixel-font"
          >
            ← BACK TO HUB
          </Link>
        </div>
        
        {/* Retro Pixel Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl mb-3 text-[#6E5A47] pixel-heading">
            HELP & SUPPORT
          </h1>
          <p className="text-xl text-[#6E5A47] pixel-body">
            Get help with Tama Tracky and learn how to care for your virtual pet
          </p>
        </div>
        
        {/* Q&A Bot Section */}
        <div className="mb-8">
          <QABot />
        </div>
        
        {/* FAQ Section - Retro Pixel Cards */}
        <div className="retro-panel p-8 mb-6">
          <h2 className="text-sm text-[#6E5A47] mb-6 text-center pixel-heading">
            <span className="pixel-emoji">📚</span> FAQ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="retro-panel p-6 bg-blue-100">
              <h3 className="pixel-font text-[#6E5A47] mb-2 text-xs">CREATE PET?</h3>
              <p className="text-[#6E5A47] text-sm pixel-body">
                Click "Create Pet" from the home screen, enter a name (1-30 characters), select a pet type, and click "Create Pet". Your pet starts with 1000 coins and all stats at 100%.
              </p>
            </div>
            
            <div className="retro-panel p-6 bg-green-100">
              <h3 className="pixel-font text-[#6E5A47] mb-2 text-xs">CARE FOR PET?</h3>
              <p className="text-[#6E5A47] text-sm pixel-body">
                Go to the Dashboard and use the action buttons: Feed (50 coins), Play (30 coins), Rest (20 coins), Clean (25 coins), or Vet (100 coins). Each action improves different stats.
              </p>
            </div>
            
            <div className="retro-panel p-6 bg-yellow-100">
              <h3 className="pixel-font text-[#6E5A47] mb-2 text-xs">WHAT ARE COINS?</h3>
              <p className="text-[#6E5A47] text-sm pixel-body">
                Coins are the currency in Tama Tracky. You spend coins on pet care actions and store purchases. You start with 1000 coins and can track all expenses in the Reports page.
              </p>
            </div>
            
            <div className="retro-panel p-6 bg-purple-100">
              <h3 className="pixel-font text-[#6E5A47] mb-2 text-xs">VIEW EXPENSES?</h3>
              <p className="text-[#6E5A47] text-sm pixel-body">
                Go to the Reports page to see all expenses, filter by category or date, view charts, and export data to CSV. This helps you track your pet care costs over time.
              </p>
            </div>
            
            <div className="retro-panel p-6 bg-red-100">
              <h3 className="pixel-font text-[#6E5A47] mb-2 text-xs">PET STATS?</h3>
              <p className="text-[#6E5A47] text-sm pixel-body">
                Your pet has 5 stats: Health (0-100%), Happiness (0-100%), Hunger (0-100%), Cleanliness (0-100%), and Energy (0-100%). Keep all stats high by regularly caring for your pet.
              </p>
            </div>
            
            <div className="retro-panel p-6 bg-pink-100">
              <h3 className="pixel-font text-[#6E5A47] mb-2 text-xs">COST TRACKING?</h3>
              <p className="text-[#6E5A47] text-sm pixel-body">
                Every action you take costs coins and is automatically tracked. View all expenses in the Reports page, where you can filter, visualize, and export your data to understand pet care costs.
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick Links - Retro Pixel Cards */}
        <div className="retro-panel p-8">
          <h2 className="text-sm text-[#6E5A47] mb-6 text-center pixel-heading">
            <span className="pixel-emoji">🎮</span> QUICK LINKS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link
              to="/"
              className="p-6 bg-blue-500 hover:bg-blue-600 text-center retro-panel"
            >
              <div className="mb-3 flex justify-center"><span className="pixel-emoji">🏠</span></div>
              <div className="pixel-font text-white text-xs">HOME</div>
            </Link>
            <Link
              to="/dashboard"
              className="p-6 bg-green-500 hover:bg-green-600 text-center retro-panel"
            >
              <div className="mb-3 flex justify-center"><span className="pixel-emoji">📊</span></div>
              <div className="pixel-font text-white text-xs">DASH</div>
            </Link>
            <Link
              to="/store"
              className="p-6 bg-yellow-500 hover:bg-yellow-600 text-center retro-panel"
            >
              <div className="mb-3 flex justify-center"><span className="pixel-emoji">🛒</span></div>
              <div className="pixel-font text-white text-xs">STORE</div>
            </Link>
            <Link
              to="/reports"
              className="p-6 bg-purple-500 hover:bg-purple-600 text-center retro-panel"
            >
              <div className="mb-3 flex justify-center"><span className="pixel-emoji">📈</span></div>
              <div className="pixel-font text-white text-xs">REPORTS</div>
            </Link>
            <Link
              to="/guide"
              className="p-6 bg-indigo-500 hover:bg-indigo-600 text-center retro-panel"
            >
              <div className="mb-3 flex justify-center"><span className="pixel-emoji">📋</span></div>
              <div className="pixel-font text-white text-xs">GUIDE</div>
            </Link>
          </div>
        </div>
        
        {/* Care Guide Section */}
        <div className="retro-panel p-8 mt-6">
          <h2 className="text-sm text-[#6E5A47] mb-4 text-center pixel-heading">
            <span className="pixel-emoji">📋</span> CARE GUIDE
          </h2>
          <p className="text-[#6E5A47] text-sm pixel-body mb-4 text-center">
            Use the Daily Care Checklist to track your pet care routine and get intelligent suggestions based on your pet's needs.
          </p>
          <div className="text-center">
            <Link
              to="/guide"
              className="inline-block retro-btn px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <span className="pixel-font text-sm font-bold">VIEW CARE GUIDE</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
