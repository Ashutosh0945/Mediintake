import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Track if we're already fetching to avoid double-fetch
    let isFetching = false

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        isFetching = true
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // ✅ Always set loading=true BEFORE fetching so ProtectedRoute waits
        setLoading(true)
        isFetching = true
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
        isFetching = false
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      // Retry up to 3 times to handle trigger delay
      let data = null
      for (let i = 0; i < 3; i++) {
        const { data: row } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (row) { data = row; break }
        if (i < 2) await new Promise(r => setTimeout(r, 1000))
      }
      setProfile(data)
    } catch (err) {
      console.error('fetchProfile error:', err)
      setProfile(null)
    } finally {
      // ✅ Only set loading=false after profile fetch completes
      setLoading(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.role === 'admin'
  const isPatient = profile?.role === 'patient'

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, isAdmin, isPatient, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
