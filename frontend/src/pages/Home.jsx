import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Home() {
  const [lookups, setLookups] = useState({ flavours: [], toppings: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMenuItems()
  }, [])

  async function loadMenuItems() {
    try {
      const [flavours, toppings] = await Promise.all([
        api.get('/lookups?type=flavour'),
        api.get('/lookups?type=topping')
      ])
      setLookups({
        flavours: flavours.data,
        toppings: toppings.data
      })
    } catch (err) {
      console.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep via-paper to-deep">
     
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center space-y-6">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Welcome to Milky Shaky
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Craft your perfect custom milkshake with our premium selection of flavours, toppings, and consistencies
          </p>
          <div className="flex gap-4 justify-center flex-wrap pt-4">
            <Link to="/order" className="px-8 py-4 bg-gradient-to-r from-primary to-blue-500 text-deep font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition text-lg">
              🥤 Order Now
            </Link>
            <Link to="/register" className="px-8 py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/10 transition text-lg">
              ✨ Join Us
            </Link>
          </div>
        </div>
      </section>

     
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-12">Why Choose Milky Shaky?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-xl border border-primary/30 p-8 text-center hover:border-primary/60 transition">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-primary mb-3">Fast & Easy</h3>
            <p className="text-gray-300">Order online in minutes and pick up when ready. No more long lines!</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-400/30 p-8 text-center hover:border-blue-400/60 transition">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-blue-400 mb-3">Fully Customizable</h3>
            <p className="text-gray-300">Choose your flavor, consistency, and toppings to create your perfect shake.</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-primary/10 rounded-xl border border-cyan-400/30 p-8 text-center hover:border-cyan-400/60 transition">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Loyalty Rewards</h3>
            <p className="text-gray-300">Frequent customers enjoy exclusive discounts on their orders.</p>
          </div>
        </div>
      </section>

   
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-12">Our Dynamic Menu</h2>
        
        {loading ? (
          <div className="text-center text-gray-400">Loading menu...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
           
            <div className="bg-gradient-to-br from-primary/10 to-deep rounded-xl border border-primary/30 p-8 hover:border-primary/60 transition">
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <span className="text-3xl">🥤</span> Flavours
              </h3>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {lookups.flavours.slice(0, 12).map((f, i) => (
                  <div key={i} className="bg-deep/60 border border-primary/20 rounded-lg p-3 hover:bg-deep/80 transition">
                    <p className="text-gray-300 text-sm font-medium">{f.key}</p>
                    <p className="text-primary text-xs font-bold">R {parseFloat(f.value).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              {lookups.flavours.length > 12 && (
                <p className="text-gray-500 text-sm mt-4">+{lookups.flavours.length - 12} more flavours</p>
              )}
            </div>

          
            <div className="bg-gradient-to-br from-blue-500/10 to-deep rounded-xl border border-blue-400/30 p-8 hover:border-blue-400/60 transition">
              <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                <span className="text-3xl">🍫</span> Toppings
              </h3>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {lookups.toppings.slice(0, 12).map((t, i) => (
                  <div key={i} className="bg-deep/60 border border-blue-400/20 rounded-lg p-3 hover:bg-deep/80 transition">
                    <p className="text-gray-300 text-sm font-medium">{t.key}</p>
                    <p className="text-blue-400 text-xs font-bold">R {parseFloat(t.value).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              {lookups.toppings.length > 12 && (
                <p className="text-gray-500 text-sm mt-4">+{lookups.toppings.length - 12} more toppings</p>
              )}
            </div>
          </div>
        )}
      </section>

      
      <section className="max-w-7xl mx-auto px-4 py-16 mb-8">
        <div className="bg-gradient-to-r from-primary/20 via-blue-500/20 to-cyan-500/20 rounded-xl border border-primary/40 p-12 text-center hover:border-primary/60 transition">
          <h2 className="text-4xl font-bold text-primary mb-6">Ready to Treat Yourself?</h2>
          <p className="text-xl text-gray-300 mb-8">Start ordering your custom milkshake today</p>
          <Link to="/order" className="inline-block px-10 py-4 bg-gradient-to-r from-primary to-blue-500 text-deep font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition text-lg">
            🍓 Build Your Shake
          </Link>
        </div>
      </section>
    </div>
  )
}
