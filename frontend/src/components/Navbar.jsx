import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ user, logout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-paper/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-2xl text-primary hover:text-primary/80 transition">
          🥤 Milky Shaky
        </Link>
        
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {user.role === "MANAGER" ? (
                <Link to="/admin" className="px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500 text-yellow-400 font-semibold hover:bg-yellow-500/30 transition">
                  👤 Admin
                </Link>
              ) : (
                <Link to="/order" className="px-4 py-2 rounded-lg bg-primary text-deep font-semibold hover:bg-primary/90 transition">
                  Order
                </Link>
              )}
              <Link to="/profile" className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition">
                Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 rounded-lg border border-red-500 text-red-400 hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-primary text-deep font-semibold hover:bg-primary/90 transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
