/**
 * Store Page Component
 * Displays virtual store with categorized items (Food, Health, Toys)
 */

import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useGameCore } from '../useGameCore'

function Store() {
  const { pet, isLoading, coins, buyItem, shopItems, saveSlot } = useGameCore()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isLoading && !saveSlot) {
      navigate('/')
    }
  }, [isLoading, saveSlot, navigate])
  
  const handlePurchase = (itemId: number) => {
    if (!pet) {
      alert('No pet found. Please create a pet first.')
      return
    }
    
    const item = shopItems.find(p => p.id === itemId)
    if (!item) return
    
    const result = buyItem(item)
    
    if (result.success) {
      alert(`✅ Successfully purchased ${item.name} for ${item.price} coins!`)
    } else {
      alert(result.message || `Failed to purchase ${item.name}`)
    }
  }
  
  const itemsByCategory = {
    food: shopItems.filter(item => item.category === 'food' || item.category === 'supplies'),
    health: shopItems.filter(item => item.category === 'health'),
    toys: shopItems.filter(item => item.category === 'toys' || item.category === 'activity')
  }
  
  if (!isLoading && !saveSlot) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="retro-panel p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6E5A47] mx-auto mb-4"></div>
          <div className="text-xl font-semibold mb-2 pixel-heading" style={{ color: 'var(--text)' }}>
            Loading...
          </div>
        </div>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAEEDC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5A4632] mx-auto mb-4"></div>
          <div className="text-2xl font-semibold text-[#5A4632]">Loading store...</div>
        </div>
      </div>
    )
  }
  
  if (!pet || !pet.stats) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="retro-panel p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6E5A47] mx-auto mb-4"></div>
          <div className="text-xl font-semibold mb-2 pixel-heading" style={{ color: 'var(--text)' }}>
            Loading...
          </div>
          <div className="text-sm pixel-body" style={{ color: 'var(--text)' }}>
            Please wait while we load your pet data
          </div>
        </div>
      </div>
    )
  }
  
  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAEEDC] p-8">
        <div className="retro-panel p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-[#5A4632] mb-4 pixel-heading">No Pet Found</h1>
          <p className="text-[#5A4632] mb-6 pixel-body">You need to create a pet first before visiting the store.</p>
          <Link
            to="/create-pet"
            className="retro-btn inline-block"
          >
            Create Pet
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#FAEEDC] pixel-body">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" style={{ marginTop: '32px' }}>
        <div className="mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="retro-btn px-4 py-2 text-sm pixel-font"
          >
            ← BACK TO HUB
          </button>
        </div>
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-[#5A4632] mb-2 pixel-heading">
            🛒 PET STORE
          </h1>
          <p className="text-xl text-[#5A4632] font-bold pixel-body mb-2">
            Purchase items to care for and customize your pet
          </p>
          <p className="text-sm text-[#6E5A47] pixel-body italic">
            💡 All purchases are tracked in Reports. Food goes to inventory - use it in Tasks page to feed your pet.
          </p>
        </div>
        
        {/* Money Balance Display */}
        <div className="retro-panel p-6 mb-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 border-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-6xl animate-bounce">🪙</span>
              <div>
                <p className="text-sm font-black text-yellow-900 uppercase tracking-wide pixel-font">
                  Your Coins
                </p>
                <p className="text-5xl font-black text-yellow-900" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 900 }}>
                  {(pet?.coins ?? coins).toLocaleString()}
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="px-6 py-3 retro-btn bg-white text-orange-600"
            >
              🏠 Dashboard
            </Link>
          </div>
        </div>
        
        {/* Category A: Food & Supplies */}
        <div className="retro-panel p-6 mb-8">
          <h2 className="text-2xl pixel-heading text-[#5A4632] mb-4 text-center">
            <span className="pixel-emoji">🍖</span> Food & Supplies
          </h2>
          <p className="text-sm text-[#5A4632] pixel-body mb-6 text-center">
            Basic food, premium food, and cleaning supplies. Category for logExpense: "food" or "supplies".
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {itemsByCategory.food.map((product) => {
              const currentCoins = pet?.coins ?? coins
              const canAfford = currentCoins >= product.price
              
              return (
                <div
                  key={product.id}
                  className={`store-card retro-panel p-4 border-4 transition-all ${
                    canAfford 
                      ? 'border-[#6E5A47] hover:scale-105' 
                      : 'border-gray-300 opacity-60'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{product.emoji}</div>
                    <h3 className="text-lg pixel-heading mb-1" style={{ color: 'var(--store-text-primary)' }}>
                      {product.name}
                    </h3>
                    <p className="text-xs pixel-body mb-2 description-text" style={{ color: 'var(--store-text-secondary)' }}>
                      {product.description}
                    </p>
                    <p className="text-xs pixel-body italic effect-text" style={{ color: 'var(--store-text-primary)' }}>
                      {product.effect}
                    </p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="inline-block retro-panel px-4 py-2 store-price-box" style={{ backgroundColor: 'var(--store-price-bg-blue)' }}>
                      <span className="text-2xl font-bold" style={{ color: 'var(--store-price-text)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 700 }}>
                        {product.price}
                      </span>
                      <span className="text-lg ml-1" style={{ color: 'var(--store-price-text)' }}>🪙</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handlePurchase(product.id)}
                    disabled={!canAfford}
                    className={`w-full retro-btn ${
                      canAfford
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? '🛒 Purchase' : '❌ Insufficient Funds'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Category B: Health & Vet */}
        <div className="retro-panel p-6 mb-8">
          <h2 className="text-2xl pixel-heading text-[#5A4632] mb-4 text-center">
            <span className="pixel-emoji">🏥</span> Health & Vet
          </h2>
          <p className="text-sm text-[#5A4632] pixel-body mb-6 text-center">
            Vet visits, medicine, and checkup packages. Category: "health".
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsByCategory.health.map((product) => {
              const currentCoins = pet?.coins ?? coins
              const canAfford = currentCoins >= product.price
              
              return (
                <div
                  key={product.id}
                  className={`store-card retro-panel p-4 border-4 transition-all ${
                    canAfford 
                      ? 'border-[#6E5A47] hover:scale-105' 
                      : 'border-gray-300 opacity-60'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{product.emoji}</div>
                    <h3 className="text-lg pixel-heading mb-1" style={{ color: 'var(--store-text-primary)' }}>
                      {product.name}
                    </h3>
                    <p className="text-xs pixel-body mb-2 description-text" style={{ color: 'var(--store-text-secondary)' }}>
                      {product.description}
                    </p>
                    <p className="text-xs pixel-body italic effect-text" style={{ color: 'var(--store-text-primary)' }}>
                      {product.effect}
                    </p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="inline-block retro-panel px-4 py-2 store-price-box" style={{ backgroundColor: 'var(--store-price-bg-red)' }}>
                      <span className="text-2xl font-bold" style={{ color: 'var(--store-price-text)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 700 }}>
                        {product.price}
                      </span>
                      <span className="text-lg ml-1" style={{ color: 'var(--store-price-text)' }}>🪙</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handlePurchase(product.id)}
                    disabled={!canAfford}
                    className={`w-full retro-btn ${
                      canAfford
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? '🛒 Purchase' : '❌ Insufficient Funds'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Category C: Toys & Activity Passes */}
        <div className="retro-panel p-6 mb-8">
          <h2 className="text-2xl pixel-heading text-[#5A4632] mb-4 text-center">
            <span className="pixel-emoji">🎮</span> Toys & Activity Passes
          </h2>
          <p className="text-sm text-[#5A4632] pixel-body mb-6 text-center">
            Toys: chew toy, ball, puzzle toy → category "toy". Activity Passes: Spa Ticket, Park Ticket → category "activity".
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {itemsByCategory.toys.map((product) => {
              const currentCoins = pet?.coins ?? coins
              const canAfford = currentCoins >= product.price
              
              return (
                <div
                  key={product.id}
                  className={`store-card retro-panel p-4 border-4 transition-all ${
                    canAfford 
                      ? 'border-[#6E5A47] hover:scale-105' 
                      : 'border-gray-300 opacity-60'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{product.emoji}</div>
                    <h3 className="text-lg pixel-heading mb-1" style={{ color: 'var(--store-text-primary)' }}>
                      {product.name}
                    </h3>
                    <p className="text-xs pixel-body mb-2 description-text" style={{ color: 'var(--store-text-secondary)' }}>
                      {product.description}
                    </p>
                    <p className="text-xs pixel-body italic effect-text" style={{ color: 'var(--store-text-primary)' }}>
                      {product.effect}
                    </p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="inline-block retro-panel px-4 py-2 store-price-box" style={{ backgroundColor: 'var(--store-price-bg-purple)' }}>
                      <span className="text-2xl font-bold" style={{ color: 'var(--store-price-text)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 700 }}>
                        {product.price}
                      </span>
                      <span className="text-lg ml-1" style={{ color: 'var(--store-price-text)' }}>🪙</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handlePurchase(product.id)}
                    disabled={!canAfford}
                    className={`w-full retro-btn ${
                      canAfford
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? '🛒 Purchase' : '❌ Insufficient Funds'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 retro-btn"
          >
            🏠 Dashboard
          </Link>
          <Link
            to="/reports"
            className="px-6 py-3 retro-btn"
          >
            📊 Reports
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Store
