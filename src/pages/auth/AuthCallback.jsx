import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        navigate('/login')
        return
      }

      const user = session.user

      // Check if profile already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()

      if (!existing) {
        // New Google user — create profile as patient by default
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
          role: 'patient',
          avatar_url: user.user_metadata?.avatar_url || null,
        })
        navigate('/dashboard')
      } else {
        navigate(existing.role === 'admin' ? '/admin' : '/dashboard')
      }
    }

    handleCallback()
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#020617' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(8,145,178,0.15)', borderTopColor: '#22D3EE', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'rgba(103,232,249,0.45)', fontSize: '14px', fontWeight: 500 }}>Signing you in with Google…</p>
    </div>
  )
}
