import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGameCore } from '../useGameCore'
import { validatePetName } from '../core/validation'
import type { PetType } from '../game/data'
import { getPetEmoji } from '../game/data'

/**
 * Create Pet Page Component
 * 
 * This component provides a beautiful, user-friendly form interface for users
 * to create a new virtual pet.
 * 
 * State Management:
 * - Uses React's useState hook to manage form input values
 * - petName: Stores the name entered by the user
 * - petType: Stores the selected pet type
 * - isSubmitting: Tracks form submission state to prevent double-submission
 * 
 * Integration:
 * - Uses the PetContext to access setPet and savePet functions
 * - Creates a new Pet instance using the Pet class
 * - Saves the pet to IndexedDB automatically after creation
 * 
 * Navigation:
 * - Uses React Router's useNavigate hook to programmatically navigate
 *   to the dashboard after successful pet creation
 * 
 * Form Handling:
 * - handleSubmit: Prevents default form submission, creates Pet instance,
 *   saves to database, updates context, and navigates to dashboard
 * - Includes validation and error handling
 */
function CreatePet() {
  // State variables to store form input values
  const [petName, setPetName] = useState<string>('')
  const [selectedPetType, setSelectedPetType] = useState<PetType | ''>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  
  // Get game core functions
  const { createPet, saveSlot, saveAll } = useGameCore()
  
  // Navigation hook for programmatic routing
  const navigate = useNavigate()
  
  /**
   * Pet Type Options - Only 3 types (FBLA-safe, easy to explain)
   * 
   * FOR JUDGES:
   * Simple, clear pet types that are easy to understand and explain.
   * Each type has a unique emoji and description.
   */
  const petTypes: Array<{ type: PetType; name: string; emoji: string; description: string }> = [
    {
      type: 'cat',
      name: 'Cat',
      emoji: getPetEmoji('cat', 0), // Baby cat emoji
      description: 'A playful and independent companion that loves attention.'
    },
    {
      type: 'dog',
      name: 'Dog',
      emoji: getPetEmoji('dog', 0), // Baby dog emoji
      description: 'A loyal and energetic friend that loves to play!'
    },
    {
      type: 'rabbit',
      name: 'Rabbit',
      emoji: getPetEmoji('rabbit', 0), // Baby rabbit emoji
      description: 'A gentle and curious pet that loves to explore.'
    }
  ]
  
  /**
   * Handles form submission when user creates a pet.
   * 
   * @param event - React form submission event
   * 
   * This function:
   * 1. Prevents the default form submission behavior (page reload)
   * 2. Validates that both name and type are provided
   * 3. Creates a new Pet instance with the provided name and type
   * 4. Sets the pet in the context (making it available globally)
   * 5. Saves the pet to IndexedDB for persistence
   * 6. Navigates to the dashboard to view the newly created pet
   * 
   * Error Handling:
   * - Catches and displays any errors that occur during pet creation or saving
   * - Resets isSubmitting state if an error occurs
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Prevent double-submission
    if (isSubmitting) {
      return
    }
    
    // Basic validation - ensure both fields are filled
    if (petName.trim() && selectedPetType) {
      setIsSubmitting(true)
      
      try {
        // Ensure a slot is selected
        if (!saveSlot) {
          alert('Please select a save slot first from the Save Slots section on the Home page.')
          navigate('/')
          return
        }
        
        // Create a new pet with selected pet type
        // Default starting money is 1000 coins
        // New pets start at ageStage 0 (Baby) with 0 XP
        createPet(petName.trim(), selectedPetType, 1000)
        
        // Save the pet to the current slot
        saveAll()
        
        // Navigate to dashboard after successful creation
        navigate('/dashboard')
      } catch (error) {
        // Display error to user
        console.error('Failed to create pet:', error)
        alert(`Failed to create pet: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setIsSubmitting(false)
      }
    } else {
      // Show validation error
      alert('Please fill in all fields')
    }
  }
  
  // Comprehensive validation using validation module
  const nameValidation = petName ? validatePetName(petName) : { isValid: false, error: '', recovery: '' }
  const isValid = nameValidation.isValid && selectedPetType
  const validationError = !selectedPetType 
    ? 'Please select a pet type' 
    : !petName.trim()
    ? 'Please enter a pet name'
    : nameValidation.error || ''

  return (
    <div className="min-h-screen pixel-body" style={{ backgroundColor: 'var(--bg)', paddingTop: '32px', paddingBottom: '32px' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl pixel-heading mb-2" style={{ color: 'var(--text)' }}>
            CREATE YOUR PET
          </h1>
          <p className="text-sm pixel-body" style={{ color: 'var(--text-muted)' }}>
            Start your virtual pet journey
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT COLUMN: Create Profile */}
          <div className="createContainer">
            <div className="retro-panel p-6">
              <h2 className="text-lg pixel-heading mb-6 text-center" style={{ color: 'var(--text)' }}>
                NEW PET PROFILE
              </h2>
              
              <div className="space-y-5">
                {/* Pet Name Input */}
                <div>
                  <label 
                    htmlFor="petName" 
                    className="block text-xs pixel-font mb-2 uppercase tracking-wide"
                    style={{ color: 'var(--text)' }}
                  >
                    Pet Name
                  </label>
                  <input
                    type="text"
                    id="petName"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full px-4 py-3 retro-panel pixel-font text-base"
                    style={{ 
                      backgroundColor: 'var(--panel)',
                      color: 'var(--text)',
                      border: '3px solid var(--border)'
                    }}
                    placeholder="Enter name (2-20 chars)"
                    required
                    disabled={isSubmitting}
                    minLength={2}
                    maxLength={20}
                  />
                </div>

                {/* Pet Type Selection Hint */}
                <div className="text-xs pixel-body text-center" style={{ color: 'var(--text-muted)' }}>
                  Select a pet type from the panel on the right →
                </div>

                {/* Validation Error */}
                {validationError && (
                  <div className="retro-panel p-3 bg-red-100 border-2 border-red-400">
                    <p className="text-xs pixel-font text-red-800 text-center">
                      {validationError}
                    </p>
                  </div>
                )}

                {/* Starting Info */}
                <div className="retro-panel p-4" style={{ backgroundColor: 'var(--accent-light)' }}>
                  <p className="text-xs pixel-body text-center" style={{ color: 'var(--text)' }}>
                    <span className="pixel-font font-bold">STARTING:</span> Baby (Age 0) • 1000 coins • All stats 100% • 0 XP
                  </p>
                </div>

                {/* Primary Button: START ADVENTURE */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="w-full primaryBtn retro-btn py-4 px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: isValid && !isSubmitting ? 'var(--accent-light)' : 'var(--bg-alt)',
                    color: 'var(--text)',
                    border: '3px solid var(--border)',
                    boxShadow: isValid && !isSubmitting ? '0 4px 0 var(--panel-shadow)' : '0 2px 0 var(--panel-shadow)'
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                      <span className="pixel-font text-sm font-bold">CREATING...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="pixel-emoji" style={{ fontSize: '20px' }}>✨</span>
                      <span className="pixel-font text-base font-bold">START ADVENTURE</span>
                    </span>
                  )}
                </button>

                {/* Helper Text */}
                <p className="text-xs pixel-body text-center" style={{ color: 'var(--text-muted)' }}>
                  Name: 2-20 characters. Choose a pet type to begin.
                </p>
              </div>
            </div>

            {/* Back Link */}
            <div className="mt-4 text-center">
              <Link 
                to="/" 
                className="text-xs pixel-body hover:underline transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Pet Type Select */}
          <div className="createContainer">
            <div className="retro-panel p-6">
              <h2 className="text-lg pixel-heading mb-6 text-center" style={{ color: 'var(--text)' }}>
                CHOOSE YOUR PET
              </h2>
              
              {/* Pet Type Grid - Responsive: 1 col mobile, 3 cols tablet, 1 col desktop (when in right column) */}
              <div className="starterGrid grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {petTypes.map((pet) => (
                  <button
                    key={pet.type}
                    type="button"
                    onClick={() => setSelectedPetType(pet.type)}
                    disabled={isSubmitting}
                    className={`starterCard retro-panel p-5 text-center transition-all duration-200 relative ${
                      selectedPetType === pet.type 
                        ? 'starterSelected border-4' 
                        : 'border-2 hover:scale-[1.02]'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{
                      borderColor: selectedPetType === pet.type ? 'var(--accent-dark)' : 'var(--border)',
                      backgroundColor: selectedPetType === pet.type ? 'var(--accent-light)' : 'var(--panel)',
                      boxShadow: selectedPetType === pet.type 
                        ? '0 6px 0 var(--panel-shadow), 0 0 12px rgba(255, 215, 130, 0.4)' 
                        : '0 3px 0 var(--panel-shadow)',
                      minHeight: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Selected Badge */}
                    {selectedPetType === pet.type && (
                      <div 
                        className="absolute top-2 right-2 px-2 py-1 retro-panel"
                        style={{ 
                          backgroundColor: 'var(--accent-dark)',
                          border: '2px solid var(--border)',
                          fontSize: '9px'
                        }}
                      >
                        <span className="pixel-font font-bold text-white">SELECTED</span>
                      </div>
                    )}

                    {/* Pet Icon - Large */}
                    <div className="mb-4">
                      <span className="pixel-emoji" style={{ fontSize: '56px' }}>{pet.emoji}</span>
                    </div>

                    {/* Name */}
                    <h3 className="text-lg pixel-heading mb-2" style={{ color: 'var(--text)' }}>
                      {pet.name.toUpperCase()}
                    </h3>

                    {/* Description */}
                    <p className="text-xs pixel-body mb-4 flex-grow" style={{ color: 'var(--text-muted)' }}>
                      {pet.description}
                    </p>

                    {/* Age Progression Row - Small Icons */}
                    <div className="evoRow w-full mt-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="pixel-emoji" style={{ fontSize: '16px' }}>{getPetEmoji(pet.type, 0)}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>
                        <span className="pixel-emoji" style={{ fontSize: '16px' }}>{getPetEmoji(pet.type, 1)}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>
                        <span className="pixel-emoji" style={{ fontSize: '16px' }}>{getPetEmoji(pet.type, 2)}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>
                        <span className="pixel-emoji" style={{ fontSize: '16px' }}>{getPetEmoji(pet.type, 3)}</span>
                      </div>
                      <p className="text-xs pixel-body mt-1" style={{ color: 'var(--text-muted)' }}>
                        Baby → Young → Adult → Mature
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Hidden input for form validation */}
              <input
                type="hidden"
                value={selectedPetType}
                required
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePet
