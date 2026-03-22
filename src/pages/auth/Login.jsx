import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Activity, Eye, EyeOff, User, Stethoscope, Phone, Mail, ArrowLeft } from 'lucide-react'
import { InlineSpinner } from '../../components/LoadingSpinner'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(searchParams.get('role') === 'admin' ? 'admin' : 'patient')
  const [method, setMethod] = useState('email') // 'email' | 'phone'
  const [step, setStep] = useState('input') // 'input' | 'otp'
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = role === 'admin'
  const accent = isAdmin ? '#A78BFA' : '#22D3EE'
  const accentBorder = isAdmin ? 'rgba(167,139,250,0.3)' : 'rgba(34,211,238,0.28)'
  const accentBg = isAdmin ? 'rgba(167,139,250,0.08)' : 'rgba(34,211,238,0.08)'

  // Email sign in
  const handleEmailSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password
    })
    if (err) { setError(err.message); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== role) {
      await supabase.auth.signOut()
      setError(role === 'admin' ? 'This account is not registered as hospital staff.' : 'This is a hospital staff account.')
      setLoading(false); return
    }
    navigate(profile.role === 'admin' ? '/admin' : '/dashboard')
  }

  // Phone — send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    let phone = form.phone.trim()
    if (!phone.startsWith('+')) phone = '+91' + phone.replace(/^0/, '')
    const { error: err } = await supabase.auth.signInWithOtp({ phone })
    if (err) { setError(err.message); setLoading(false); return }
    setStep('otp')
    setLoading(false)
  }

  // Phone — verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    let phone = form.phone.trim()
    if (!phone.startsWith('+')) phone = '+91' + phone.replace(/^0/, '')
    const { data, error: err } = await supabase.auth.verifyOtp({
      phone, token: form.otp, type: 'sms'
    })
    if (err) { setError(err.message); setLoading(false); return }

    // Check/create profile
    const user = data.user
    const { data: existing } = await supabase.from('profiles').select('id, role').eq('id', user.id).single()
    if (!existing) {
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email || '',
        full_name: 'New User',
        phone: user.phone,
        role: role,
      })
    }
    navigate(role === 'admin' ? '/admin' : '/dashboard')
  }

  // Google
  const handleGoogle = async () => {
    setGoogleLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (err) { setError(err.message); setGoogleLoading(false) }
  }

  const inputStyle = {
    fontSize: '16px', // prevents iOS zoom on focus
    background: 'rgba(2,15,40,0.8)',
    border: '1.5px solid rgba(8,145,178,0.25)',
    borderRadius: '12px',
    padding: '13px 16px',
    color: '#E0F7FF',
    width: '100%',
    fontFamily: 'Outfit,sans-serif',
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#020617', backgroundImage: 'radial-gradient(ellipse at 30% 30%, rgba(8,145,178,0.14) 0%, transparent 55%)' }}>
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '28px', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#0E7490,#0891B2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.55)' }}>
            <Activity style={{ width: '18px', height: '18px', color: '#67E8F9' }} />
          </div>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.03em', color: '#E0F7FF' }}>
            Medi<span style={{ color: '#22D3EE' }}>Intake</span>
          </div>
        </Link>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            { r: 'patient', label: 'Patient',       Icon: User,        col: '#22D3EE', bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.28)' },
            { r: 'admin',   label: 'Hospital Staff', Icon: Stethoscope, col: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.3)' },
          ].map(({ r, label, Icon, col, bg, border }) => (
            <button key={r} type="button" onClick={() => { setRole(r); setError('') }}
              style={{ padding: '14px 10px', borderRadius: '14px', border: `2px solid ${role === r ? border : 'rgba(8,145,178,0.15)'}`, background: role === r ? bg : 'rgba(2,15,40,0.6)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: role === r ? `${col}15` : 'rgba(8,145,178,0.08)', border: `1px solid ${role === r ? border : 'rgba(8,145,178,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: '17px', height: '17px', color: role === r ? col : 'rgba(34,211,238,0.3)' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: role === r ? col : 'rgba(34,211,238,0.3)' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(2,26,60,0.9)', border: `1.5px solid ${accentBorder}`, borderRadius: '20px', padding: '28px', backdropFilter: 'blur(14px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>

          {/* Back button when in OTP step */}
          {step === 'otp' && (
            <button onClick={() => { setStep('input'); setError(''); setForm(f => ({ ...f, otp: '' })) }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'rgba(103,232,249,0.5)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '16px', padding: 0 }}>
              <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back
            </button>
          )}

          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '20px', color: '#E0F7FF', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            {step === 'otp' ? 'Enter OTP' : isAdmin ? 'Hospital Staff Sign In' : 'Patient Sign In'}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.4)', marginBottom: '22px' }}>
            {step === 'otp'
              ? `OTP sent to ${form.phone}. Check your messages.`
              : isAdmin ? 'Access the hospital triage dashboard' : 'Manage your health intake records'}
          </p>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#FCA5A5', fontSize: '13px', padding: '12px 16px', borderRadius: '10px', marginBottom: '18px' }}>
              {error}
            </div>
          )}

          {/* OTP verification step */}
          {step === 'otp' ? (
            <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">6-digit OTP</label>
                <input style={{ ...inputStyle, letterSpacing: '0.3em', textAlign: 'center', fontSize: '22px', fontWeight: 800 }}
                  type="tel" inputMode="numeric" maxLength={6} placeholder="000000"
                  value={form.otp} onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))}
                  onFocus={e => e.target.style.borderColor = '#22D3EE'}
                  onBlur={e => e.target.style.borderColor = 'rgba(8,145,178,0.25)'}
                  required autoFocus />
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" style={{ padding: '13px' }} disabled={loading || form.otp.length < 6}>
                {loading ? <><InlineSpinner /> Verifying…</> : 'Verify OTP & Sign In'}
              </button>
              <button type="button" onClick={handleSendOTP}
                style={{ background: 'none', border: 'none', color: accent, fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                Resend OTP
              </button>
            </form>
          ) : (
            <>
              {/* Google */}
              <button onClick={handleGoogle} disabled={googleLoading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '12px', fontSize: '14px', fontWeight: 700, color: '#1a1a2e', fontFamily: 'Outfit,sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                {googleLoading ? <InlineSpinner /> : <GoogleIcon />}
                {googleLoading ? 'Redirecting…' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(8,145,178,0.18)' }} />
                <span style={{ fontSize: '11px', color: 'rgba(103,232,249,0.28)', fontWeight: 600 }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(8,145,178,0.18)' }} />
              </div>

              {/* Method toggle */}
              <div style={{ display: 'flex', background: 'rgba(2,15,40,0.6)', borderRadius: '12px', padding: '4px', marginBottom: '18px' }}>
                {[
                  { id: 'email', label: 'Email', Icon: Mail },
                  { id: 'phone', label: 'Phone / OTP', Icon: Phone },
                ].map(({ id, label, Icon }) => (
                  <button key={id} type="button" onClick={() => { setMethod(id); setError('') }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px', fontWeight: 700,
                      background: method === id ? accentBg : 'transparent',
                      color: method === id ? accent : 'rgba(103,232,249,0.35)',
                      outline: method === id ? `1px solid ${accentBorder}` : 'none',
                    }}>
                    <Icon style={{ width: '13px', height: '13px' }} />{label}
                  </button>
                ))}
              </div>

              {/* Email form */}
              {method === 'email' && (
                <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="label">Email Address</label>
                    <input style={inputStyle} type="email" placeholder="you@example.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = '#22D3EE'}
                      onBlur={e => e.target.style.borderColor = 'rgba(8,145,178,0.25)'}
                      required />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inputStyle, paddingRight: '42px' }} type={showPass ? 'text' : 'password'} placeholder="••••••••"
                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = '#22D3EE'}
                        onBlur={e => e.target.style.borderColor = 'rgba(8,145,178,0.25)'}
                        required />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(103,232,249,0.4)', display: 'flex' }}>
                        {showPass ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" style={{ padding: '13px' }} disabled={loading}>
                    {loading ? <><InlineSpinner /> Signing in…</> : `Sign In as ${isAdmin ? 'Hospital Staff' : 'Patient'}`}
                  </button>
                </form>
              )}

              {/* Phone form */}
              {method === 'phone' && (
                <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="label">Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'rgba(103,232,249,0.5)', fontWeight: 700, pointerEvents: 'none' }}>+91</div>
                      <input style={{ ...inputStyle, paddingLeft: '44px' }} type="tel" inputMode="tel"
                        placeholder="9876543210" maxLength={10}
                        value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                        onFocus={e => e.target.style.borderColor = '#22D3EE'}
                        onBlur={e => e.target.style.borderColor = 'rgba(8,145,178,0.25)'}
                        required />
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.3)', marginTop: '5px' }}>
                      OTP will be sent via SMS. Standard rates apply.
                    </p>
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" style={{ padding: '13px' }} disabled={loading || form.phone.length < 10}>
                    {loading ? <><InlineSpinner /> Sending OTP…</> : <><Phone style={{ width: '14px', height: '14px' }} /> Send OTP</>}
                  </button>
                </form>
              )}

              <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(34,211,238,0.35)', marginTop: '18px' }}>
                Don't have an account?{' '}
                <Link to={`/register?role=${role}`} style={{ color: accent, fontWeight: 800, textDecoration: 'none' }}>Register</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
