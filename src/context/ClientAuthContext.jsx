// src/context/ClientAuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ClientAuthContext = createContext(null)

// Helper to check if string is email or phone
const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
const isPhone = (str) => /^\+?[0-9\s\-()]{8,}$/.test(str.replace(/\s/g, ''))

export function ClientAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check existing session
    const checkSession = async () => {
      try {
        if (!supabase) {
          setLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (err) {
        console.warn('Session check failed:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen to auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })
      return () => subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (emailOrPhone, password) => {
    setError(null)
    try {
      if (!supabase) {
        throw new Error('Authentification non disponible')
      }

      const input = emailOrPhone.trim()
      
      if (!isEmail(input) && !isPhone(input)) {
        throw new Error('Veuillez entrer un email valide ou un numéro de téléphone')
      }

      // Use email if provided, otherwise use phone with +221 prefix
      const authData = isEmail(input) 
        ? {
            email: input,
            password: password,
            options: {
              emailRedirectTo: `${window.location.origin}/`
            }
          }
        : {
            phone: input.startsWith('+') ? input : `+221${input.replace(/\D/g, '').slice(-9)}`,
            password: password
          }

      const { data, error: err } = await supabase.auth.signUp(authData)

      if (err) throw err
      return data
    } catch (err) {
      const msg = err.message || 'Erreur lors de l\'inscription'
      setError(msg)
      throw err
    }
  }

  const signIn = async (emailOrPhone, password) => {
    setError(null)
    try {
      if (!supabase) {
        throw new Error('Authentification non disponible')
      }

      const input = emailOrPhone.trim()

      if (!isEmail(input) && !isPhone(input)) {
        throw new Error('Veuillez entrer un email valide ou un numéro de téléphone')
      }

      // Use email if provided, otherwise use phone
      const authData = isEmail(input)
        ? {
            email: input,
            password: password
          }
        : {
            phone: input.startsWith('+') ? input : `+221${input.replace(/\D/g, '').slice(-9)}`,
            password: password
          }

      const { data, error: err } = await supabase.auth.signInWithPassword(authData)

      if (err) throw err
      return data
    } catch (err) {
      const msg = err.message || 'Identifiants incorrects'
      setError(msg)
      throw err
    }
  }

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut()
        setUser(null)
      }
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  const resetPassword = async (emailOrPhone) => {
    setError(null)
    try {
      if (!supabase) {
        throw new Error('Authentification non disponible')
      }

      const input = emailOrPhone.trim()

      if (!isEmail(input) && !isPhone(input)) {
        throw new Error('Veuillez entrer un email valide ou un numéro de téléphone')
      }

      if (isEmail(input)) {
        const { error: err } = await supabase.auth.resetPasswordForEmail(input)
        if (err) throw err
      } else {
        throw new Error('Réinitialisation par téléphone non disponible. Utilisez votre email.')
      }
    } catch (err) {
      const msg = err.message || 'Erreur lors de la réinitialisation'
      setError(msg)
      throw err
    }
  }

  return (
    <ClientAuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut, resetPassword, setError }}>
      {children}
    </ClientAuthContext.Provider>
  )
}

export function useClientAuth() {
  return useContext(ClientAuthContext)
}
