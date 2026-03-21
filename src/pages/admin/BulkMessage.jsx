import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import { InlineSpinner } from '../../components/LoadingSpinner'
import { Send, Users, CheckCircle, MessageSquare, Clock, Megaphone } from 'lucide-react'

export default function BulkMessage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ subject: '', body: '', targetRisk: 'all' })
  const [patients, setPatients] = useState([])
  const [broadcasts, setBroadcasts] = useState([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email').eq('role', 'patient').eq('is_discharged', false),
      supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(10),
    ])
    setPatients(p || [])
    setBroadcasts(b || [])
    setLoading(false)
  }

  async function getTargetPatients() {
    if (form.targetRisk === 'all') return patients

    // Get patients with recent intakes matching risk level
    const { data } = await supabase
      .from('intakes')
      .select('patient_id')
      .eq('risk_level', form.targetRisk)
      .order('created_at', { ascending: false })

    const ids = [...new Set((data || []).map(i => i.patient_id))]
    return patients.filter(p => ids.includes(p.id))
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!form.subject.trim() || !form.body.trim()) return
    setSending(true)

    const targets = await getTargetPatients()

    // Insert individual messages for each patient
    const messages = targets.map(p => ({
      from_id: user.id,
      to_id: p.id,
      subject: form.subject,
      body: form.body,
      read: false,
    }))

    if (messages.length > 0) {
      await supabase.from('messages').insert(messages)
    }

    // Log the broadcast
    await supabase.from('broadcasts').insert({
      from_id: user.id,
      subject: form.subject,
      body: form.body,
      sent_to: targets.length,
    })

    setSent(true)
    setSending(false)
    setForm({ subject: '', body: '', targetRisk: 'all' })
    setPreview(false)
    load()
    setTimeout(() => setSent(false), 4000)
  }

  const estimatedCount = form.targetRisk === 'all' ? patients.length : '...'

  const riskColors = {
    all:    { bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.3)',  text: '#67E8F9',  label: 'All Patients' },
    high:   { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: '#FCA5A5',  label: 'High Risk Only' },
    medium: { bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.25)', text: '#A5F3FC',  label: 'Medium Risk Only' },
    low:    { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  text: '#6EE7B7',  label: 'Low Risk Only' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617' }}>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 16px' }}>

        {/* Header */}
        <div className="animate-slide-up" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#0E7490,#0891B2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.4)' }}>
              <Megaphone style={{ width: '18px', height: '18px', color: '#67E8F9' }} />
            </div>
            <div>
              <h1 className="section-title">Broadcast Message</h1>
              <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.45)', marginTop: '2px' }}>
                Send a message to {patients.length} active patient{patients.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

          {/* Compose */}
          <div className="card animate-slide-up" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#E0F7FF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare style={{ width: '16px', height: '16px', color: '#22D3EE' }} />
              Compose Message
            </h2>

            {sent && (
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle style={{ width: '16px', height: '16px', color: '#34D399' }} />
                <span style={{ fontSize: '13px', color: '#6EE7B7', fontWeight: 600 }}>Message sent successfully!</span>
              </div>
            )}

            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Target audience */}
              <div>
                <label className="label">Target Audience</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                  {Object.entries(riskColors).map(([key, style]) => (
                    <button key={key} type="button" onClick={() => setForm(f => ({ ...f, targetRisk: key }))}
                      style={{ padding: '10px 6px', borderRadius: '10px', border: `1.5px solid ${form.targetRisk === key ? style.border : 'rgba(8,145,178,0.15)'}`, background: form.targetRisk === key ? style.bg : 'rgba(2,15,40,0.5)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: form.targetRisk === key ? style.text : 'rgba(103,232,249,0.35)', letterSpacing: '0.03em' }}>
                        {style.label}
                      </div>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.35)', marginTop: '6px' }}>
                  Estimated recipients: <span style={{ color: '#22D3EE', fontWeight: 700 }}>{estimatedCount}</span>
                </p>
              </div>

              <div>
                <label className="label">Subject <span style={{ color: '#F87171' }}>*</span></label>
                <input className="input" type="text" placeholder="e.g. Important health notice, Appointment reminder…"
                  value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>

              <div>
                <label className="label">Message Body <span style={{ color: '#F87171' }}>*</span></label>
                <textarea className="input" rows={6} style={{ resize: 'none' }}
                  placeholder="Write your message to patients here…"
                  value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required />
                <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.3)', marginTop: '4px', textAlign: 'right' }}>
                  {form.body.length} characters
                </p>
              </div>

              {/* Preview box */}
              {preview && form.subject && form.body && (
                <div style={{ background: 'rgba(2,6,23,0.7)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '12px', padding: '16px' }} className="animate-fade-in">
                  <p style={{ fontSize: '10px', color: '#22D3EE', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Preview</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#E0F7FF', marginBottom: '6px' }}>{form.subject}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(165,243,252,0.6)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{form.body}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setPreview(!preview)}
                  className="btn-secondary" style={{ flex: 1, padding: '11px' }}>
                  {preview ? 'Hide Preview' : 'Preview'}
                </button>
                <button type="submit" className="btn-primary"
                  style={{ flex: 2, padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={sending || !form.subject || !form.body}>
                  {sending ? <><InlineSpinner /> Sending…</> : <><Send style={{ width: '14px', height: '14px' }} /> Send to {form.targetRisk === 'all' ? 'All' : riskColors[form.targetRisk]?.label.split(' ')[0]} Patients</>}
                </button>
              </div>
            </form>
          </div>

          {/* Broadcast history */}
          <div>
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#E0F7FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock style={{ width: '15px', height: '15px', color: '#22D3EE' }} />
                Broadcast History
              </h2>
              {loading ? (
                <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.35)', textAlign: 'center', padding: '20px 0' }}>Loading…</p>
              ) : broadcasts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <Megaphone style={{ width: '32px', height: '32px', color: 'rgba(34,211,238,0.15)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '12px', color: 'rgba(103,232,249,0.3)' }}>No broadcasts yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {broadcasts.map(b => (
                    <div key={b.id} style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(8,145,178,0.15)', borderRadius: '12px', padding: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#A5F3FC', marginBottom: '3px' }}>{b.subject}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.4)', lineHeight: 1.5, marginBottom: '8px' }}>
                        {b.body.length > 80 ? b.body.slice(0, 80) + '…' : b.body}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', color: '#22D3EE', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users style={{ width: '10px', height: '10px' }} /> {b.sent_to} recipients
                        </span>
                        <span style={{ fontSize: '10px', color: 'rgba(103,232,249,0.3)' }}>
                          {new Date(b.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
