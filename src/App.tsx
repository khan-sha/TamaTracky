import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import CreatePet from './pages/CreatePet';
import Dashboard from './pages/Dashboard'
import Store from './pages/Store'
import Reports from './pages/Reports'
import Help from './pages/Help'
import Achievements from './pages/Achievements'
import Tasks from './pages/Tasks'
import Guide from './pages/Guide'
import StartHere from './pages/StartHere'
import PetHUD from './components/PetHUD'

/**
 * Main App component that sets up routing for the Tama Tracky application.
 * 
 * This component:
 * 1. Wraps the entire app with PetProvider to enable global pet state management
 * 2. Sets up React Router for client-side navigation
 * 3. Defines all application routes
 * 4. Includes NavBar for consistent navigation
 * 
 * Routing Structure:
 * - "/" - Home page (landing/welcome page with demo mode)
 * - "/create-pet" - Page for creating a new virtual pet
 * - "/dashboard" - Main dashboard showing pet status and activities
 * - "/store" - Virtual store for purchasing items for the pet
 * - "/reports" - Reports and statistics about pet care history
 * - "/help" - Help page with Q&A bot and instructions
 * 
 * BrowserRouter enables HTML5 history API for clean URLs without hash fragments.
 * PetProvider automatically loads the first saved pet from IndexedDB on app start.
 * NavBar provides consistent navigation across all pages (except Home which has its own navigation).
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen font-pixel" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
          {/* Pet HUD - Available on all pages except home and create-pet */}
          <PetHUD />
          
          <Routes>
            {/* Home route - landing page (no NavBar, has its own navigation) */}
            <Route path="/" element={<Home />} />

            {/* Start Here - onboarding page (no NavBar, has its own navigation) */}
            <Route path="/start-here" element={<StartHere />} />

            {/* All other routes include NavBar for consistent navigation */}
            <Route path="/create-pet" element={<><NavBar /><CreatePet /></>} />
            <Route path="/dashboard" element={<><NavBar /><Dashboard /></>} />
            <Route path="/store" element={<><NavBar /><Store /></>} />
            <Route path="/reports" element={<><NavBar /><Reports /></>} />
            <Route path="/achievements" element={<><NavBar /><Achievements /></>} />
            <Route path="/tasks" element={<><NavBar /><Tasks /></>} />
            <Route path="/help" element={<><NavBar /><Help /></>} />
            <Route path="/guide" element={<><NavBar /><Guide /></>} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

