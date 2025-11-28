import { useContext } from 'react'
import AuthContext from '../contexts/AuthContext'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    return {
      user: JSON.parse(localStorage.getItem('user')),
      login: (data) => {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      },
    }
  }
  return ctx
}
