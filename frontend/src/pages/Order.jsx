import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { listPaymentMethods } from '../services/payments'
import MilkshakeSuggester from '../components/MilkshakeSuggester'

const LOCATIONS = {
  'Irene': { closes: '21:00', opens: '11:00' },
  'Pretoria': { closes: '21:00', opens: '09:00' },
  'Sandton': { closes: '22:00', opens: '11:00' }
}

export default function Order() {
  const [lookups, setLookups] = useState({})
  const [items, setItems] = useState([{ flavour: '', consistency: '', topping: '', qty: 1 }])
  const [pickupAt, setPickupAt] = useState('')
  const [restaurant, setRestaurant] = useState('Irene')
  const [pricing, setPricing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null)
  const [makePayment, setMakePayment] = useState(false)
  const [selectedAllergies, setSelectedAllergies] = useState({})
  const [filteredLookups, setFilteredLookups] = useState({})

  useEffect(() => {
    loadLookups()
    loadPaymentMethods()
  }, [])

  useEffect(() => {
    if (lookups.flavours || lookups.toppings) {
      const activeAllergies = Object.keys(selectedAllergies).filter(key => selectedAllergies[key])
      
      if (activeAllergies.length === 0) {
        setFilteredLookups(lookups)
        return
      }

      const filterItems = (items) => {
        return items.filter(item => {
          const itemAllergies = item.allergies || []
          return !activeAllergies.some(allergy => itemAllergies.includes(allergy))
        })
      }

      setFilteredLookups({
        flavours: filterItems(lookups.flavours || []),
        consistencies: lookups.consistencies || [],
        toppings: filterItems(lookups.toppings || []),
      })
    }
  }, [selectedAllergies, lookups])

  useEffect(() => {
    const hasItems = items.some(item => item.flavour && item.consistency && item.topping)
    if (hasItems) {
      calculatePricing()
    } else {
      setPricing(null)
    }
  }, [items])

  const loadPaymentMethods = async () => {
    try {
      const methods = await listPaymentMethods()
      setPaymentMethods(methods || [])
    } catch (err) {
      console.error('Failed to load payment methods:', err)
    }
  }

  async function loadLookups() {
    try {
      const res = await api.get('/lookups')
      const grouped = {
        flavours: [],
        consistencies: [],
        toppings: [],
      }
      res.data.forEach(lookup => {
        if (lookup.type === 'flavour') grouped.flavours.push(lookup)
        if (lookup.type === 'consistency') grouped.consistencies.push(lookup)
        if (lookup.type === 'topping') grouped.toppings.push(lookup)
      })
      setLookups(grouped)
    } catch (err) {
      setError('Failed to load options')
    }
  }

  async function calculatePricing() {
    try {
      const res = await api.post('/orders/preview', { items })
      const pricingObj = res.data?.pricing || res.data
      setPricing(pricingObj)
    } catch (err) {
      console.error('Pricing calculation error:', err)
    }
  }

  async function submit() {
    try {
      setError('')

      if (!pickupAt) {
        setError('❌ Order Failed: Please select a pickup time')
        return
      }

      if (!paymentMethods.length) {
        setError('❌ Order Failed: No payment methods found. Please add a payment method in your Profile before placing an order.')
        return
      }

      if (!selectedPaymentMethodId) {
        setError('❌ Order Failed: No payment method selected. Please choose a payment method to complete your order.')
        return
      }

      setLoading(true)
      const body = {
        items,
        restaurant,
        pickupAt: new Date(pickupAt),
        makePayment: true,
        paymentMethodId: selectedPaymentMethodId,
      }

      const res = await api.post('/orders', body)
      
      setSuccess('✅ Payment Successful! Order confirmed. Check your email for details.')
      setTimeout(() => {
        setSuccess('')
        setItems([{ flavour: '', consistency: '', topping: '', qty: 1 }])
        setPricing(null)
        setMakePayment(false)
        setSelectedPaymentMethodId(null)
        setPickupAt('')
      }, 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  function update(i, key, value) {
    const newItems = [...items]
    newItems[i][key] = value
    setItems(newItems)
  }

  function add() {
    setItems([...items, { flavour: '', consistency: '', topping: '', qty: 1 }])
  }

  function remove(i) {
    setItems(items.filter((_, idx) => idx !== i))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep via-paper to-deep p-2 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
       
        <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl border border-primary/40 p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-1 sm:mb-2">🥤 Build Your Perfect Shake</h1>
          <p className="text-sm sm:text-base text-gray-300">Customize your milkshake exactly how you like it</p>
        </div>

        {error && <div className="p-3 sm:p-4 bg-red-500/15 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2 text-sm sm:text-base"><span>⚠️</span><span>{error}</span></div>}
        {success && <div className="p-3 sm:p-4 bg-green-500/15 border border-green-500/50 text-green-400 rounded-lg flex items-center gap-2 text-sm sm:text-base"><span>✅</span><span>{success}</span></div>}

        
        <div className="bg-gradient-to-br from-paper to-deep rounded-xl border border-primary/30 p-4 sm:p-6">
          <MilkshakeSuggester lookups={lookups} onSuggestionsChange={(allergies, suggestions) => {
            setSelectedAllergies(allergies)
          }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
           
            <h2 className="text-lg sm:text-2xl font-bold text-primary flex items-center gap-2 mb-3 sm:mb-4">📝 Your Items</h2>

            {items.map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-paper to-deep rounded-xl border border-primary/30 p-3 sm:p-6 space-y-3 sm:space-y-4 hover:border-primary/50 transition">
                <div className="flex justify-between items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Drink #{i + 1}</h3>
                  {items.length > 1 && (
                    <button 
                      onClick={() => remove(i)} 
                      className="text-red-400 hover:text-red-300 font-semibold transition text-sm sm:text-base"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Flavour</label>
                    <select
                      value={item.flavour}
                      onChange={(e) => update(i, 'flavour', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-xs sm:text-sm"
                    >
                      <option value="">Select flavour</option>
                      {filteredLookups.flavours?.map(f => (
                        <option key={f.id} value={f.key}>
                          {f.key} - R {parseFloat(f.value).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Consistency</label>
                    <select
                      value={item.consistency}
                      onChange={(e) => update(i, 'consistency', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-xs sm:text-sm"
                    >
                      <option value="">Select consistency</option>
                      {filteredLookups.consistencies?.map(c => (
                        <option key={c.id} value={c.key}>
                          {c.key} - R {parseFloat(c.value).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Topping</label>
                    <select
                      value={item.topping}
                      onChange={(e) => update(i, 'topping', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-xs sm:text-sm"
                    >
                      <option value="">Select topping</option>
                      {filteredLookups.toppings?.map(t => (
                        <option key={t.id} value={t.key}>
                          {t.key} - R {parseFloat(t.value).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item.qty}
                      onChange={(e) => update(i, 'qty', parseInt(e.target.value))}
                      className="w-full px-2 sm:px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-xs sm:text-sm"
                    />
                  </div>
              </div>
            </div>
            ))}

            <button 
              onClick={add} 
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 transition font-semibold text-sm sm:text-base"
            >
              + Add Another Drink
            </button>
          </div>

          
          <div className="bg-gradient-to-br from-paper to-deep rounded-xl border border-primary/30 p-4 sm:p-6 lg:h-fit lg:sticky lg:top-4 space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">📋 Order Summary</h3>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">🏪 Restaurant</label>
              <select
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-xs sm:text-sm"
              >
                {Object.entries(LOCATIONS).map(([name, info]) => (
                  <option key={name} value={name}>
                    {name} (Closes {info.closes})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Hours: {LOCATIONS[restaurant].opens} - {LOCATIONS[restaurant].closes}
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">⏰ Pickup Time</label>
              <input
                type="datetime-local"
                value={pickupAt}
                onChange={(e) => setPickupAt(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-xs sm:text-sm"
              />
            </div>

            {pricing && (
              <div className="border-t border-primary/30 pt-3 sm:pt-4 space-y-2 text-xs sm:text-sm bg-gradient-to-br from-primary/5 to-blue-500/5 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal:</span>
                  <span className="text-primary font-semibold">R {pricing.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-green-400 font-semibold">
                    <span>Discount:</span>
                    <span>-R {pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-300">Tax (15%):</span>
                  <span className="text-primary font-semibold">R {pricing.vat?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between font-bold text-sm sm:text-lg bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent border-t border-primary/30 pt-2">
                  <span>Total:</span>
                  <span>R {pricing.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">💳 Payment Method</label>
              <select
                value={selectedPaymentMethodId || ''}
                onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-xs sm:text-sm"
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.brand?.toUpperCase()} •••• {method.last4 || method.cardNumber?.slice(-4)}
                  </option>
                ))}
              </select>
            </div>

            {!paymentMethods.length && makePayment && (
              <div className="p-2 sm:p-3 bg-yellow-500/15 border border-yellow-500/50 text-yellow-400 rounded-lg text-xs">
                ⚠️ Add a payment method in your Profile to pay with card
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading || !items.some(item => item.flavour && item.consistency && item.topping)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-sm sm:text-base"
            >
              {loading ? '🔄 Processing...' : '✅ Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
