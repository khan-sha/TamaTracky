/**
 * Start Here / Onboarding Page
 * 
 * This page provides a comprehensive introduction to Tama Tracky for new users
 * and judges. It explains what the program is, how to use it, and what features
 * to explore.
 * 
 * FBLA Requirements:
 * - Clear instructions on every screen
 * - Intuitive user experience
 * - Explains correlation to prompt
 * - Judge-friendly walkthrough
 */

import { Link } from 'react-router-dom'
import { useGameCore } from '../useGameCore'

function StartHere() {
  const { pet } = useGameCore()

  return (
    <div className="min-h-screen bg-[#FAEEDC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5A4632] mb-4 pixel-heading">
            🎮 Welcome to Tama Tracky
          </h1>
          <p className="text-xl text-[#6E5A47] pixel-body">
            Care for your pet. Track your costs. Learn financial responsibility.
          </p>
        </div>

        {/* Quick Start Section */}
        <div className="retro-panel p-6 mb-6 border-4 border-[#6E5A47] bg-white">
          <h2 className="text-2xl font-bold text-[#5A4632] mb-4 pixel-heading">
            🚀 Quick Start
          </h2>
          <div className="space-y-4">
            {!pet ? (
              <>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">1️⃣</div>
                  <div>
                    <h3 className="font-semibold text-[#5A4632] mb-2">Create Your Pet</h3>
                    <p className="text-[#6E5A47] mb-3">
                      Start by creating your virtual pet. Choose a name and species (Fire, Water, or Earth).
                    </p>
                    <Link
                      to="/create-pet"
                      className="inline-block retro-btn px-4 py-2 pixel-font"
                    >
                      Create Pet →
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">2️⃣</div>
                  <div>
                    <h3 className="font-semibold text-[#5A4632] mb-2">Try Demo Mode</h3>
                    <p className="text-[#6E5A47] mb-3">
                      Want to see everything quickly? Try Demo Mode for a complete 30-day experience.
                    </p>
                    <Link
                      to="/"
                      className="inline-block retro-btn px-4 py-2 pixel-font"
                    >
                      Go to Home →
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-4">
                <div className="text-3xl">✅</div>
                <div>
                  <h3 className="font-semibold text-[#5A4632] mb-2">You have a pet!</h3>
                  <p className="text-[#6E5A47] mb-3">
                    Your pet <strong>{pet.name}</strong> is ready. Continue below to learn how to care for them.
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-block retro-btn px-4 py-2 pixel-font"
                  >
                    Go to Dashboard →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What is Tama Tracky Section */}
        <div className="retro-panel p-6 mb-6 border-4 border-[#6E5A47] bg-white">
          <h2 className="text-2xl font-bold text-[#5A4632] mb-4 pixel-heading">
            📖 What is Tama Tracky?
          </h2>
          <div className="space-y-3 text-[#6E5A47] pixel-body">
            <p>
              <strong>Tama Tracky</strong> is an educational virtual pet application that teaches users about
              the real costs of pet ownership. You care for a virtual pet by feeding, playing, resting,
              cleaning, and visiting the vet—each action costs coins and is tracked for analysis.
            </p>
            <p>
              The application demonstrates responsible pet ownership while providing engaging gameplay
              and comprehensive financial tracking.
            </p>
          </div>
        </div>

        {/* How to Play Section (1 minute read) */}
        <div className="retro-panel p-6 mb-6 border-4 border-[#6E5A47] bg-white">
          <h2 className="text-2xl font-bold text-[#5A4632] mb-4 pixel-heading">
            🎮 How to Play (1 Minute Read)
          </h2>
          <div className="space-y-3 text-[#6E5A47] pixel-body">
            <p><strong>Step 1:</strong> Create your pet and choose a name and type (cat, dog, or rabbit).</p>
            <p><strong>Step 2:</strong> Your pet has 5 stats that decay over time: Health ❤️, Hunger 🍗, Energy 🔋, Cleanliness 🧼, and Happiness 😊.</p>
            <p><strong>Step 3:</strong> Care for your pet by feeding (requires purchased food), playing, resting, and cleaning. Each action costs coins.</p>
            <p><strong>Step 4:</strong> Earn coins by completing daily quests, doing tasks, claiming daily check-ins, and weekly allowance.</p>
            <p><strong>Step 5:</strong> Track all expenses in Reports to learn about the real costs of pet ownership.</p>
            <p><strong>Step 6:</strong> Watch your pet evolve through 4 stages (Baby → Young → Adult → Mature) as you gain XP through care actions.</p>
          </div>
        </div>

        {/* How Money Works Section */}
        <div className="retro-panel p-6 mb-6 border-4 border-[#6E5A47] bg-white">
          <h2 className="text-2xl font-bold text-[#5A4632] mb-4 pixel-heading">
            💰 How Money Works (Cost-of-Care Explanation)
          </h2>
          <div className="space-y-3 text-[#6E5A47] pixel-body">
            <p>
              <strong>Every pet care action costs coins:</strong> Feeding requires food from the Store (25-50 coins), 
              health care requires vet visits or medicine (60-100 coins), toys and activities cost coins too.
            </p>
            <p>
              <strong>All expenses are tracked automatically:</strong> Every purchase and care action is logged 
              in the Reports page, showing you exactly where your coins go.
            </p>
            <p>
              <strong>Earn coins responsibly:</strong> Complete daily quests (20-45 coins), do tasks (15-20 coins), 
              claim daily check-ins (12-15 coins), and weekly allowance (70 coins).
            </p>
            <p>
              <strong>Learn financial responsibility:</strong> The Reports page shows income vs expenses, 
              helping you understand that pet ownership requires budgeting and planning.
            </p>
            <p className="font-semibold text-[#5A4632] mt-4">
              💡 Key Lesson: Real pets cost money! This game teaches you to plan ahead and budget for pet care expenses.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="retro-panel p-6 mb-6 border-4 border-[#6E5A47] bg-white">
          <h2 className="text-2xl font-bold text-[#5A4632] mb-4 pixel-heading">
            🎯 How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FFF9E6] border-2 border-[#6E5A47]">
              <h3 className="font-semibold text-[#5A4632] mb-2">🐾 Virtual Pet System</h3>
              <ul className="text-sm text-[#6E5A47] space-y-1 list-disc list-inside">
                <li>Create and customize your pet</li>
                <li>Track 5 stats: Health, Hunger, Energy, Cleanliness, Happiness</li>
                <li>Watch your pet evolve through 4 stages</li>
                <li>See mood changes based on care level</li>
              </ul>
            </div>
            <div className="p-4 bg-[#E6F3FF] border-2 border-[#6E5A47]">
              <h3 className="font-semibold text-[#5A4632] mb-2">💰 Cost-of-Care System</h3>
              <ul className="text-sm text-[#6E5A47] space-y-1 list-disc list-inside">
                <li>Every action costs coins</li>
                <li>All expenses automatically tracked</li>
                <li>View detailed reports and charts</li>
                <li>Learn financial responsibility</li>
              </ul>
            </div>
            <div className="p-4 bg-[#E6FFE6] border-2 border-[#6E5A47]">
              <h3 className="font-semibold text-[#5A4632] mb-2">🎮 Earning Systems</h3>
              <ul className="text-sm text-[#6E5A47] space-y-1 list-disc list-inside">
                <li>Complete daily quests for coins + XP</li>
                <li>Do tasks and chores</li>
                <li>Daily check-in rewards</li>
                <li>Weekly allowance</li>
                <li>Play mini-games</li>
              </ul>
            </div>
            <div className="p-4 bg-[#FFE6F3] border-2 border-[#6E5A47]">
              <h3 className="font-semibold text-[#5A4632] mb-2">📊 Reports & Analytics</h3>
              <ul className="text-sm text-[#6E5A47] space-y-1 list-disc list-inside">
                <li>Filter by category and date</li>
                <li>Visual charts and graphs</li>
                <li>Export to CSV</li>
                <li>Track income vs expenses</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="retro-panel p-6 mb-6 border-4 border-[#6E5A47] bg-white">
          <h2 className="text-2xl font-bold text-[#5A4632] mb-4 pixel-heading">
            ✨ Key Features
          </h2>
          <div className="space-y-3 text-[#6E5A47] pixel-body">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏥</span>
              <div>
                <strong>Care Actions:</strong> Feed, Play, Rest, Clean, and Visit Vet. Each action
                affects your pet's stats and costs coins.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛒</span>
              <div>
                <strong>Store System:</strong> Purchase food, toys, supplies, and health items.
                Items go to inventory and can be used when needed.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <strong>Evolution System:</strong> Your pet evolves through 4 stages (Baby → Teen → Mature → Final)
                based on XP and care score.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong>Badges & Achievements:</strong> Earn badges for good care, budgeting, and milestones.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <strong>Interactive Help:</strong> Ask questions in the Help page. The Q&A bot provides
                intelligent answers about your pet and the game.
              </div>
            </div>
          </div>
        </div>

        {/* For Judges Section */}
        <div className="retro-panel p-6 mb-6 border-4 border-[#6E5A47] bg-yellow-50">
          <h2 className="text-2xl font-bold text-[#5A4632] mb-4 pixel-heading">
            👨‍⚖️ For FBLA Judges
          </h2>
          <div className="space-y-4 text-[#6E5A47] pixel-body">
            <div>
              <h3 className="font-semibold text-[#5A4632] mb-2">What to Show Judges (Clickable Path):</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Start:</strong> <Link to="/" className="text-blue-600 underline font-semibold">Home Page</Link> → Click "DEMO MODE" button to see complete 30-day scenario</li>
                <li><strong>Dashboard:</strong> <Link to="/dashboard" className="text-blue-600 underline font-semibold">View Pet Hub</Link> → See pet stats, mood, evolution stage</li>
                <li><strong>Tasks:</strong> <Link to="/tasks" className="text-blue-600 underline font-semibold">Care & Tasks</Link> → Show Daily Quests (coins + XP rewards), earning systems</li>
                <li><strong>Store:</strong> <Link to="/store" className="text-blue-600 underline font-semibold">Pet Store</Link> → Purchase an item → See expense automatically logged</li>
                <li><strong>Reports:</strong> <Link to="/reports" className="text-blue-600 underline font-semibold">Money Reports</Link> → Click "🎯 JUDGE MODE" button → See comprehensive financial summary</li>
                <li><strong>Help:</strong> <Link to="/help" className="text-blue-600 underline font-semibold">Help & FAQ</Link> → Ask "Why is my pet sad?" → See intelligent offline response</li>
                <li><strong>Achievements:</strong> <Link to="/achievements" className="text-blue-600 underline font-semibold">Badges</Link> → See achievement system with retro styling</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-[#5A4632] mb-2">Demo Mode:</h3>
              <p className="mb-3">
                Demo Mode creates a realistic 30-day pet care scenario with expenses, income, and progression.
                Perfect for presentations - shows all features without requiring gameplay.
              </p>
              <Link
                to="/"
                className="inline-block retro-btn px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold border-4 border-yellow-600 shadow-lg"
              >
                🎮 Try Demo Mode →
              </Link>
            </div>
            <div>
              <h3 className="font-semibold text-[#5A4632] mb-2">Correlation to Prompt:</h3>
              <p>
                This application directly addresses the <strong>"virtual pet with cost-of-care system"</strong> prompt:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li><strong>Virtual Pet:</strong> Name/customize pet, feed/care over time, emotions/behavior changes, evolution</li>
                <li><strong>Cost-of-Care:</strong> Food/supplies/vet/toys/activities tracked, running totals, earning systems, badges</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#5A4632] mb-2">Technical Highlights:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Modular architecture with clear separation of concerns</li>
                <li>Comprehensive input validation (syntactic + semantic)</li>
                <li>Persistent data storage (IndexedDB)</li>
                <li>Intelligent Q&A feature (rule-based + optional AI)</li>
                <li>Customizable reports with charts and CSV export</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/dashboard"
            className="retro-panel p-4 text-center border-4 border-[#6E5A47] bg-white hover:bg-[#FFF9E6] transition"
          >
            <div className="text-3xl mb-2">🏠</div>
            <div className="font-semibold text-[#5A4632]">Dashboard</div>
            <div className="text-sm text-[#6E5A47]">View your pet</div>
          </Link>
          <Link
            to="/tasks"
            className="retro-panel p-4 text-center border-4 border-[#6E5A47] bg-white hover:bg-[#E6F3FF] transition"
          >
            <div className="text-3xl mb-2">✅</div>
            <div className="font-semibold text-[#5A4632]">Tasks</div>
            <div className="text-sm text-[#6E5A47]">Care & earn coins</div>
          </Link>
          <Link
            to="/reports"
            className="retro-panel p-4 text-center border-4 border-[#6E5A47] bg-white hover:bg-[#E6FFE6] transition"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold text-[#5A4632]">Reports</div>
            <div className="text-sm text-[#6E5A47]">View expenses</div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-[#6E5A47] pixel-body">
          <p>Need help? Visit the <Link to="/help" className="text-blue-600 underline">Help page</Link> or check the <Link to="/guide" className="text-blue-600 underline">Guide</Link>.</p>
        </div>
      </div>
    </div>
  )
}

export default StartHere

