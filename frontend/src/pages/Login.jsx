import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', form)
      login(res.data)
      if (res.data.user.role === 'MANAGER') {
        navigate('/admin')
      } else {
        navigate('/order')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 bg-gradient-to-br from-deep via-paper to-deep py-6 sm:py-0">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-paper to-deep rounded-2xl border border-primary/30 p-5 sm:p-8 shadow-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-1 sm:mb-2">Login</h1>
            <p className="text-sm sm:text-base text-gray-400">Welcome back to Milky Shaky</p>
          </div>
          
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/15 border border-red-500/50 text-red-300 rounded-lg flex gap-2 text-sm sm:text-base">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder-gray-500 text-sm sm:text-base"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder-gray-500 text-sm sm:text-base"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary cursor-pointer transition text-lg sm:text-xl"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-primary to-blue-500 text-deep font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
            >
              {loading ? '🔄 Logging in...' : '✨ Login'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary/20">
            <p className="text-center text-xs sm:text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:text-blue-400 transition">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
