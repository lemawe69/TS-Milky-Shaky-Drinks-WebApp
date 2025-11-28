import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { listPaymentMethods, addPaymentMethod, deletePaymentMethod } from '../services/payments'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [pmForm, setPmForm] = useState({ cardholderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', brand: '' })
  const [pmLoading, setPmLoading] = useState(false)
  const [pmError, setPmError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const res = await api.get('/users/profile')
      setProfile(res.data)
      setForm({ name: res.data.name, phone: res.data.phone, smtpEmail: res.data.smtpEmail || '', smtpPassword: res.data.smtpPassword || '' })
    } catch (err) {
      setError('Failed to load profile')
    }
    loadPaymentMethods()
  }

  async function loadPaymentMethods() {
    try {
      const rows = await listPaymentMethods()
      setPaymentMethods(rows)
    } catch (err) {
      setPmError('Failed to load payment methods')
    }
  }

  async function handleUpdate() {
    try {
      setError('')
      setLoading(true)
      const res = await api.put('/users/profile', form)
      setProfile(res.data)
      setSuccess('Profile updated successfully')
      setEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return <div className="min-h-screen bg-gradient-to-br from-deep via-paper to-deep p-6 text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep via-paper to-deep p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl border border-primary/40 p-6">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-2">👤 My Profile</h1>
          <p className="text-gray-300">Manage your account and payment methods</p>
        </div>

        {error && <div className="p-4 bg-red-500/15 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2"><span>⚠️</span>{error}</div>}
        {success && <div className="p-4 bg-green-500/15 border border-green-500/50 text-green-400 rounded-lg flex items-center gap-2"><span>✅</span>{success}</div>}

        {/* Profile Section */}
        <div className="bg-gradient-to-br from-paper to-deep rounded-xl border border-primary/30 p-6 space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-4">Profile Information</h2>
          
          <div>
            <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">📧 Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-2 bg-deep border border-primary/30 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">👤 Name</label>
            <input
              type="text"
              value={editing ? form.name : profile.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!editing}
              className={`w-full px-4 py-2 border border-primary/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${
                editing ? 'bg-deep' : 'bg-deep/50 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">📱 Phone</label>
            <input
              type="tel"
              value={editing ? form.phone : profile.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={!editing}
              className={`w-full px-4 py-2 border border-primary/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${
              editing ? 'bg-deep' : 'bg-deep/50 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">🎯 Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full px-4 py-2 bg-deep border border-primary/30 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-primary/30">
            {editing ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 transition"
                >
                  {loading ? '🔄 Saving...' : '✅ Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setForm({ name: profile.name, phone: profile.phone })
                  }}
                  className="flex-1 px-4 py-2 border border-primary/30 text-gray-300 font-bold rounded-lg hover:bg-primary/10 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full px-4 py-2 bg-gradient-to-r from-primary to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-gradient-to-br from-paper to-deep rounded-xl border border-primary/30 p-6 space-y-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-4">💳 Payment Methods</h2>
          {pmError && <div className="p-3 bg-red-500/15 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2"><span>⚠️</span>{pmError}</div>}
          
          <div className="bg-gradient-to-br from-deep/50 to-deep rounded-lg border border-primary/20 p-6 space-y-4">
            <h3 className="font-bold text-primary mb-4">➕ Add New Card</h3>
            
            <div>
              <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">👤 Cardholder Name</label>
              <input 
                placeholder="John Doe" 
                value={pmForm.cardholderName} 
                onChange={(e) => setPmForm({...pmForm, cardholderName: e.target.value})} 
                className="w-full px-4 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder-gray-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">🔢 Card Number</label>
              <input 
                placeholder="4111 1111 1111 1111" 
                value={pmForm.cardNumber} 
                onChange={(e) => setPmForm({...pmForm, cardNumber: e.target.value})} 
                className="w-full px-4 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder-gray-500" 
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Month</label>
                <select 
                  value={pmForm.expiryMonth} 
                  onChange={(e) => setPmForm({...pmForm, expiryMonth: e.target.value})} 
                  className="w-full px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                >
                  <option value="">MM</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Year</label>
                <select 
                  value={pmForm.expiryYear} 
                  onChange={(e) => setPmForm({...pmForm, expiryYear: e.target.value})} 
                  className="w-full px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                >
                  <option value="">YY</option>
                  {[...Array(10)].map((_, i) => {
                    const year = new Date().getFullYear() + i
                    return <option key={year} value={year}>{year}</option>
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">CVV</label>
                <input 
                  placeholder="123" 
                  type="password"
                  value={pmForm.cvv} 
                  onChange={(e) => setPmForm({...pmForm, cvv: e.target.value})} 
                  maxLength="4"
                  className="w-full px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder-gray-500 text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">🏦 Card Brand</label>
              <select 
                value={pmForm.brand} 
                onChange={(e) => setPmForm({...pmForm, brand: e.target.value})} 
                className="w-full px-4 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              >
                <option value="">Select Brand</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">American Express</option>
                <option value="Discover">Discover</option>
              </select>
            </div>

            <button onClick={async () => {
                try {
                  if (!pmForm.cardholderName || !pmForm.cardNumber || !pmForm.expiryMonth || !pmForm.expiryYear || !pmForm.cvv || !pmForm.brand) {
                    setPmError('Please fill in all card fields')
                    return
                  }
                  setPmLoading(true); setPmError('')
                  await addPaymentMethod(pmForm)
                  setPmForm({ cardholderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', brand: '' })
                  await loadPaymentMethods()
                  alert('Card added successfully')
                } catch (err) { setPmError(err.response?.data?.message || 'Failed to add payment method') }
                finally { setPmLoading(false) }
              }}
              disabled={pmLoading}
              className="w-full px-4 py-2 bg-gradient-to-r from-primary to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 transition"
            >{pmLoading ? '🔄 Saving...' : '➕ Add Card'}</button>
          </div>

          <div className="border-t border-primary/30 pt-6">
            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">💾 Saved Cards</h3>
            {paymentMethods.length === 0 ? (
              <div className="text-gray-400 text-center py-6 bg-deep/30 rounded-lg">No saved payment methods yet</div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map(pm => (
                  <div key={pm.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/30 hover:border-primary/50 transition">
                    <div>
                      <div className="font-semibold text-primary">{pm.brand} •••• {pm.last4}</div>
                      <div className="text-xs text-gray-400">{pm.cardholderName} • Expires {String(pm.expiryMonth).padStart(2, '0')}/{pm.expiryYear}</div>
                    </div>
                    <button onClick={async () => { if (!confirm('Remove this card?')) return; try { await deletePaymentMethod(pm.id); await loadPaymentMethods() } catch (e) { setPmError('Failed to delete') } }} className="text-red-400 hover:text-red-300 font-semibold transition">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Orders Section */}
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-4">📦 My Orders</h2>
          <MyOrders />
        </div>
      </div>
    </div>
  )
}

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelMessage, setCancelMessage] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const res = await api.get('/orders/mine')
      setOrders(res.data)
    } catch (err) {
      console.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelOrder(orderId) {
    if (!window.confirm('Are you sure you want to cancel this order? You will receive a refund.')) {
      return
    }
    
    try {
      setCancelling(true)
      setCancelMessage('')
      await api.post('/orders/cancel', { orderId })
      setCancelMessage('✓ Order cancelled successfully. A refund of R' + selectedOrder.total.toFixed(2) + ' will be processed within 5-7 business days.')
      setTimeout(() => {
        setSelectedOrder(null)
        loadOrders()
      }, 2000)
    } catch (err) {
      setCancelMessage('✗ Failed to cancel order: ' + (err.response?.data?.message || err.message))
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="text-gray-400 text-center py-4">Loading orders...</div>
  if (orders.length === 0) return <div className="text-gray-400 text-center py-6 bg-paper rounded-xl border border-primary/20 p-6">No orders yet</div>

  if (selectedOrder) {
    return (
      <div className="bg-gradient-to-br from-paper to-deep rounded-xl border border-primary/30 p-4 sm:p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setSelectedOrder(null)}
            className="text-primary hover:text-blue-400 font-semibold flex items-center gap-2"
          >
            ← Back to Orders
          </button>
          <button 
            onClick={() => setSelectedOrder(null)}
            className="px-4 py-2 bg-gradient-to-r from-primary to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition text-sm"
          >
            ✕ Close
          </button>
        </div>

        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-2">Order #{selectedOrder.id}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-6">
            <div>📅 <span className="text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
            <div>📍 <span className="text-white">{selectedOrder.restaurant}</span></div>
            <div>⏰ <span className="text-white">{new Date(selectedOrder.pickupAt).toLocaleString()}</span></div>
            <div>📊 <span className={`font-semibold ${selectedOrder.status === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>{selectedOrder.status}</span></div>
          </div>
        </div>

        <div className="border-t border-primary/30 pt-4">
          <h4 className="font-bold text-primary mb-3">Items</h4>
          <div className="space-y-2 bg-deep/50 rounded-lg p-4">
            {selectedOrder.items && selectedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start pb-2 border-b border-primary/20 last:border-0">
                <div>
                  <p className="font-semibold text-white">{item.qty}x {item.flavour}</p>
                  <p className="text-xs text-gray-400">{item.consistency}${item.topping ? ` • ${item.topping}` : ''}</p>
                </div>
                <p className="text-primary font-semibold">R {(item.individuallyPriced * item.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-primary/30 pt-4">
          <h4 className="font-bold text-primary mb-3">Price Breakdown</h4>
          <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Subtotal:</span>
              <span className="text-primary font-semibold">R {(selectedOrder.total - selectedOrder.vatAmount - (selectedOrder.discount || 0)).toFixed(2)}</span>
            </div>
            {selectedOrder.discount > 0 && (
              <div className="flex justify-between text-green-400 font-semibold">
                <span>Discount:</span>
                <span>-R {selectedOrder.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-300">Tax (15%):</span>
              <span className="text-primary font-semibold">R {selectedOrder.vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-primary/30 pt-2 text-white">
              <span>Total:</span>
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">R {selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {cancelMessage && (
          <div className={`p-4 rounded-lg ${cancelMessage.includes('✓') ? 'bg-green-500/15 border border-green-500/50 text-green-400' : 'bg-red-500/15 border border-red-500/50 text-red-400'}`}>
            {cancelMessage}
          </div>
        )}

        {selectedOrder.status !== 'CANCELLED' && (
          <button
            onClick={() => handleCancelOrder(selectedOrder.id)}
            disabled={cancelling}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {cancelling ? '🔄 Processing...' : '❌ Cancel Order & Get Refund'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <button 
          key={order.id}
          onClick={() => setSelectedOrder(order)}
          className="w-full bg-gradient-to-br from-paper to-deep rounded-xl border border-primary/30 p-4 hover:border-primary/50 hover:bg-primary/5 transition text-left"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">📦 Order #{order.id}</h3>
              <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
              <p className="text-sm text-gray-400">{order.restaurant} - <span className="text-primary font-semibold">{order.status}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">R {order.total.toFixed(2)}</p>
              <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
