import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Order from './pages/Order'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-deep to-paper text-white">Loading...</div>
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-deep via-paper to-deep">
        <Navbar user={user} logout={logout} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/order" element={user ? <Order /> : <Navigate to="/login" replace state={{ from: { pathname: '/order' } }} />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace state={{ from: { pathname: '/profile' } }} />} />
            <Route path="/admin" element={
              user ? (
                user.role === "MANAGER" ? (
                  <AdminPanel />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />
              )
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
