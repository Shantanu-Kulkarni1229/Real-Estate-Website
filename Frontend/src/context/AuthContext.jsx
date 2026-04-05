/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'

const STORAGE_KEY = 'cityploter_auth'

const AuthContext = createContext(null)

function readStoredSession() {
  if (typeof window === 'undefined') {
    return { token: null, user: null }
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { token: null, user: null }
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      token: parsed.token || null,
      user: parsed.user || null
    }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const initialSession = useMemo(() => readStoredSession(), [])
  const [session, setSession] = useState(initialSession)
  const [isReady, setIsReady] = useState(!initialSession.token)

  useEffect(() => {
    if (!session.token) {
      setIsReady(true)
      return
    }

    let isMounted = true

    const verifySession = async () => {
      try {
        const verifyResponse = await apiRequest('/auth/verify', {
          token: session.token
        })

        let profileData = null
        try {
          const profileResponse = await apiRequest('/users/me', {
            token: session.token
          })
          profileData = profileResponse?.data || null
        } catch {
          profileData = null
        }

        if (!isMounted) {
          return
        }

        setSession((current) => ({
          ...current,
          user: {
            ...(current.user || {}),
            ...(verifyResponse.data || {}),
            ...(profileData || {})
          }
        }))
      } catch {
        if (!isMounted) {
          return
        }

        setSession({ token: null, user: null })
      } finally {
        if (isMounted) {
          setIsReady(true)
        }
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [session.token])

  useEffect(() => {
    if (!isReady || typeof window === 'undefined') {
      return
    }

    if (session.token && session.user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      return
    }

    window.localStorage.removeItem(STORAGE_KEY)
  }, [isReady, session])

  const login = async ({ email, password }) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    const nextSession = {
      token: response.token,
      user: response.data
    }

    setSession(nextSession)
    setIsReady(true)
    return response
  }

  const signup = async (payload) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: payload
    })

    const nextSession = {
      token: response.token,
      user: response.data
    }

    setSession(nextSession)
    setIsReady(true)
    return response
  }

  const logout = () => {
    setSession({ token: null, user: null })
    setIsReady(true)
  }

  const value = {
    token: session.token,
    user: session.user,
    isReady,
    isAuthenticated: Boolean(session.token && session.user),
    login,
    signup,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}