import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ role }) {
  const { user, profile, loading, fetchProfile } = useAuth()
  const [retrying, setRetrying] = useState(false)

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', background:'#020617' }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid rgba(8,145,178,0.15)', borderTopColor:'#22D3EE', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:'rgba(103,232,249,0.45)', fontSize:'14px', fontWeight:500, fontFamily:'Outfit,sans-serif' }}>Loading your profile…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!profile) {
    const handleRetry = async () => {
      setRetrying(true)
      await fetchProfile(user.id)
      setRetrying(false)
    }

    const handleSignOut = async () => {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }

    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', padding:'16px', background:'#020617', backgroundImage:'radial-gradient(ellipse at 30% 30%, rgba(8,145,178,0.1) 0%, transparent 55%)' }}>
        <div style={{ background:'rgba(2,26,60,0.9)', border:'1.5px solid rgba(248,113,113,0.3)', borderRadius:'20px', padding:'36px', maxWidth:'480px', width:'100%', textAlign:'center', backdropFilter:'blur(14px)', fontFamily:'Outfit,sans-serif' }}>
          <div style={{ width:'52px', height:'52px', background:'rgba(248,113,113,0.12)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'26px' }}>⚠️</div>
          <p style={{ color:'#FCA5A5', fontWeight:800, fontSize:'18px', marginBottom:'8px' }}>Profile Not Found</p>
          <p style={{ color:'rgba(165,243,252,0.5)', fontSize:'13px', marginBottom:'8px', lineHeight:1.6 }}>
            User ID shown below. Run the SQL fix first, then click Retry.
          </p>
          <p style={{ color:'rgba(103,232,249,0.4)', fontSize:'11px', marginBottom:'20px', wordBreak:'break-all', fontFamily:'monospace' }}>
            {user?.id}
          </p>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap', marginBottom:'20px' }}>
            <button onClick={handleRetry} disabled={retrying}
              style={{ background:'linear-gradient(135deg,#0C7B96,#0891B2)', color:'white', border:'none', borderRadius:'10px', padding:'11px 24px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'Outfit,sans-serif', opacity:retrying?0.6:1, display:'flex', alignItems:'center', gap:'8px' }}>
              {retrying ? '⏳ Retrying…' : '🔄 Retry'}
            </button>
            <button onClick={handleSignOut}
              style={{ background:'rgba(8,145,178,0.1)', border:'1px solid rgba(8,145,178,0.3)', color:'#67E8F9', borderRadius:'10px', padding:'11px 24px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'Outfit,sans-serif', display:'flex', alignItems:'center', gap:'8px' }}>
              ← Sign Out
            </button>
          </div>
          <div style={{ background:'rgba(2,6,23,0.6)', border:'1px solid rgba(8,145,178,0.2)', borderRadius:'12px', padding:'14px', textAlign:'left' }}>
            <p style={{ fontSize:'10px', color:'rgba(34,211,238,0.5)', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' }}>Run this in Supabase SQL Editor:</p>
            <pre style={{ fontSize:'11px', color:'#67E8F9', overflowX:'auto', fontFamily:'IBM Plex Mono,monospace', lineHeight:1.7, margin:0, whiteSpace:'pre-wrap', wordBreak:'break-all' }}>
{`INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '${user?.id}',
  '${user?.email}',
  'Ashutosh Singh',
  'patient'
) ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = 'patient';`}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  if (role && profile.role !== role) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return <Outlet />
}
