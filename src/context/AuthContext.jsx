// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authApi, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Identifiants admin par défaut (pour développement)
const DEFAULT_ADMIN = {
  email: 'siregaye990@gmail.com',
  password: 'Bio2026'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check existing session (Supabase or local)
    const checkSession = async () => {
      try {
        const supabaseSession = await authApi.getSession()
        if (supabaseSession) {
          setSession(supabaseSession)
        } else {
          // Check local admin session
          const localSession = localStorage.getItem('biosen_admin_session')
          if (localSession) {
            const parsed = JSON.parse(localSession)
            if (parsed.expires > Date.now()) {
              setSession({ user: { email: parsed.email }, isLocal: true })
            } else {
              localStorage.removeItem('biosen_admin_session')
            }
          }
        }
      } catch (error) {
        console.warn('Supabase auth failed, using local fallback:', error.message)
        // Check local admin session
        const localSession = localStorage.getItem('biosen_admin_session')
        if (localSession) {
          const parsed = JSON.parse(localSession)
          if (parsed.expires > Date.now()) {
            setSession({ user: { email: parsed.email }, isLocal: true })
          } else {
            localStorage.removeItem('biosen_admin_session')
          }
        }
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen to auth changes (only if Supabase is available)
    try {
      const { data: { subscription } } = authApi.onAuthChange((_event, s) => {
        setSession(s)
        setLoading(false)
      })
      return () => subscription.unsubscribe()
    } catch {
      // No Supabase, skip listener
    }
  }, [])

  const signIn = async (email, password) => {
    // Try Supabase first if configured
    if (supabase) {
      try {
        const data = await authApi.signIn(email, password)
        setSession(data.session)
        return data
      } catch (supabaseError) {
        console.warn('Supabase auth failed, trying local fallback:', supabaseError.message)
        // Continue to local auth
      }
    }

    // Local admin auth fallback
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      const sessionData = {
        email: email,
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }
      localStorage.setItem('biosen_admin_session', JSON.stringify(sessionData))
      setSession({ user: { email: email }, isLocal: true })
      // Force page reload to trigger re-render
      window.location.reload()
      return { session: { user: { email: email }, isLocal: true } }
    } else {
      throw new Error('Identifiants incorrects')
    }
  }

  const signOut = async () => {
    try {
      await authApi.signOut()
    } catch {
      // Ignore Supabase errors
    }
    localStorage.removeItem('biosen_admin_session')
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut, isAdmin: !!session }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
