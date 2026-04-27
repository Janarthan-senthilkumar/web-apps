import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('busnav_token'))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('busnav_token')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const res = await api.get('/auth/me')
          setUser(res.user)
        } catch {
          logout()
        }
      }
      setLoading(false)
    }
    init()
  }, [token, logout])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: t, user: u } = res
    localStorage.setItem('busnav_token', t)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t)
    setUser(u)
    return u
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { token: t, user: u } = res
    localStorage.setItem('busnav_token', t)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t)
    setUser(u)
    return u
  }

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data)
    setUser(res.user)
    return res.user
  }

  const isHead = user?.role === 'organisation_head'
  const isStaff = user?.role === 'staff'
  const isCustomer = user?.role === 'customer'
  const canManage = isHead || isStaff
  const canWrite = isHead

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, updateProfile, isHead, isStaff, isCustomer, canManage, canWrite }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
