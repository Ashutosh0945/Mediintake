import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import { InlineSpinner } from '../../components/LoadingSpinner'
import { Clock, Plus, Trash2, CalendarOff, CheckCircle, Calendar, Stethoscope } from 'lucide-react'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const TIMES = []
for (let h = 6; h <= 21; h++) {
  TIMES.push(`${String(h).padStart(2,'0')}:00`)
  TIMES.push(`${String(h).padStart(2,'0')}:30`)
}

export default function DoctorSchedule() {
  const { user } = useAuth()
  const [slots, setSlots] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeDay, setActiveDay] = useState(1)
  const [form, setForm] = useState({ day_of_week: 1, start_time: '09:00', end_time: '17:00', slot_duration: 30 })
  const [leaveForm, setLeaveForm] = useState({ leave_date: '', reason: '' })
  const [tab, setTab] = useState('schedule')

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: s }, { data: l }] = await Promise.all([
      supabase.from('doctor_availability').select('*').eq('doctor_id', user.id).eq('is_active', true).order('day_of_week').order('start_time'),
      supabase.from('doctor_leaves').select('*').eq('doctor_id', user.id).gte('leave_date', new Date().toISOString().slice(0,10)).order('leave_date'),
    ])
    setSlots(s || [])
    setLeaves(l || [])
    setLoading(false)
  }

  async function addSlot(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('doctor_availability').insert({ ...form, doctor_id: user.id })
    await load()
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function removeSlot(id) {
    await supabase.from('doctor_availability').update({ is_active: false }).eq('id', id)
    setSlots(s => s.filter(x => x.id !== id))
  }

  async function addLeave(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('doctor_leaves').insert({ ...leaveForm, doctor_id: user.id })
    setLeaveForm({ leave_date: '', reason: '' })
    await load()
    setSaving(false)
  }

  async function removeLeave(id) {
    await supabase.from('doctor_leaves').delete().eq('id', id)
    setLeaves(l => l.filter(x => x.id !== id))
  }

  function fmt(time) {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hr = parseInt(h)
    return `${hr > 12 ? hr-12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
  }

  function slotsForDay(day) {
    return slots.filter(s => s.day_of_week === day)
  }

  const cardStyle = { background: 'rgba(2,26,60,0.85)', border: '1.5px solid rgba(8,145,178,0.22)', borderRadius: '18px', padding: '20px' }
  const inputStyle = { background: 'rgba(2,15,40,0.8)', border: '1.5px solid rgba(8,145,178,0.25)', borderRadius: '10px', padding: '9px 12px', color: '#E0F7FF', fontSize: '13px', fontFamily: 'Outfit,sans-serif', width: '100%', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', background: '#020617' }}>
      <Navbar />
      <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }} className="animate-slide-up">
          <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#0E7490,#0891B2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.4)' }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#67E8F9' }} />
          </div>
          <div>
            <h1 className="section-title">Doctor Schedule</h1>
            <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.45)', marginTop: '2px' }}>Set your weekly availability and manage leave dates</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(2,15,40,0.6)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
          {[['schedule','Weekly Schedule'],['leaves','Leave Dates']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'Outfit,sans-serif', transition: 'all 0.15s',
                background: tab === id ? 'rgba(34,211,238,0.15)' : 'transparent',
                color: tab === id ? '#22D3EE' : 'rgba(103,232,249,0.4)',
                outline: tab === id ? '1px solid rgba(34,211,238,0.3)' : 'none',
              }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'schedule' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

            {/* Weekly view */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#E0F7FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock style={{ width: '15px', height: '15px', color: '#22D3EE' }} />
                Weekly Availability
              </h2>

              {/* Day tabs */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {DAYS.map((day, i) => {
                  const count = slotsForDay(i).length
                  return (
                    <button key={i} onClick={() => setActiveDay(i)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'Outfit,sans-serif', transition: 'all 0.15s', position: 'relative',
                        background: activeDay === i ? 'rgba(34,211,238,0.18)' : 'rgba(2,15,40,0.5)',
                        color: activeDay === i ? '#22D3EE' : count > 0 ? 'rgba(165,243,252,0.6)' : 'rgba(103,232,249,0.3)',
                        outline: activeDay === i ? '1px solid rgba(34,211,238,0.35)' : count > 0 ? '1px solid rgba(34,211,238,0.15)' : '1px solid rgba(8,145,178,0.1)',
                      }}>
                      {DAY_SHORT[i]}
                      {count > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#0891B2', color: 'white', fontSize: '9px', fontWeight: 800, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
                    </button>
                  )
                })}
              </div>

              {/* Slots for active day */}
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(103,232,249,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>{DAYS[activeDay]}</p>
                {loading ? (
                  <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.3)', padding: '12px 0' }}>Loading…</p>
                ) : slotsForDay(activeDay).length === 0 ? (
                  <div style={{ background: 'rgba(2,6,23,0.5)', border: '1px dashed rgba(8,145,178,0.2)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <Clock style={{ width: '28px', height: '28px', color: 'rgba(34,211,238,0.15)', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '12px', color: 'rgba(103,232,249,0.3)' }}>No slots for {DAYS[activeDay]}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {slotsForDay(activeDay).map(slot => (
                      <div key={slot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#A5F3FC' }}>{fmt(slot.start_time)} — {fmt(slot.end_time)}</p>
                          <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.4)', marginTop: '2px' }}>{slot.slot_duration} min slots · {Math.floor((
                            (parseInt(slot.end_time.split(':')[0])*60 + parseInt(slot.end_time.split(':')[1])) -
                            (parseInt(slot.start_time.split(':')[0])*60 + parseInt(slot.start_time.split(':')[1]))
                          ) / slot.slot_duration)} appointments available</p>
                        </div>
                        <button onClick={() => removeSlot(slot.id)} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#FCA5A5', display: 'flex' }}>
                          <Trash2 style={{ width: '13px', height: '13px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add slot form */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#E0F7FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus style={{ width: '15px', height: '15px', color: '#22D3EE' }} />
                Add Availability Slot
              </h2>
              <form onSubmit={addSlot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Day</label>
                  <select style={inputStyle} value={form.day_of_week} onChange={e => { setForm(f => ({...f, day_of_week: parseInt(e.target.value)})); setActiveDay(parseInt(e.target.value)) }}>
                    {DAYS.map((d,i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Start Time</label>
                    <select style={inputStyle} value={form.start_time} onChange={e => setForm(f => ({...f, start_time: e.target.value}))}>
                      {TIMES.map(t => <option key={t} value={t}>{fmt(t)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>End Time</label>
                    <select style={inputStyle} value={form.end_time} onChange={e => setForm(f => ({...f, end_time: e.target.value}))}>
                      {TIMES.filter(t => t > form.start_time).map(t => <option key={t} value={t}>{fmt(t)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Slot Duration</label>
                  <select style={inputStyle} value={form.slot_duration} onChange={e => setForm(f => ({...f, slot_duration: parseInt(e.target.value)}))}>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                {/* Preview */}
                {form.start_time < form.end_time && (
                  <div style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)', borderRadius: '10px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '11px', color: '#67E8F9', fontWeight: 600 }}>
                      {Math.floor(((parseInt(form.end_time.split(':')[0])*60 + parseInt(form.end_time.split(':')[1])) - (parseInt(form.start_time.split(':')[0])*60 + parseInt(form.start_time.split(':')[1]))) / form.slot_duration)} slots of {form.slot_duration} min each on {DAYS[form.day_of_week]}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgba(103,232,249,0.4)', marginTop: '2px' }}>{fmt(form.start_time)} – {fmt(form.end_time)}</p>
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={saving || form.start_time >= form.end_time}>
                  {saving ? <><InlineSpinner /> Saving…</> : saved ? <><CheckCircle style={{width:'14px',height:'14px'}} /> Saved!</> : <><Plus style={{width:'14px',height:'14px'}} /> Add Slot</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === 'leaves' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

            {/* Leave list */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#E0F7FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarOff style={{ width: '15px', height: '15px', color: '#FCA5A5' }} />
                Upcoming Leave Dates
              </h2>
              {loading ? (
                <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.3)' }}>Loading…</p>
              ) : leaves.length === 0 ? (
                <div style={{ background: 'rgba(2,6,23,0.5)', border: '1px dashed rgba(8,145,178,0.2)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                  <CalendarOff style={{ width: '28px', height: '28px', color: 'rgba(34,211,238,0.15)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '12px', color: 'rgba(103,232,249,0.3)' }}>No upcoming leaves marked</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {leaves.map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: '10px', padding: '10px 14px' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#FCA5A5' }}>
                          {new Date(l.leave_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {l.reason && <p style={{ fontSize: '11px', color: 'rgba(252,165,165,0.5)', marginTop: '2px' }}>{l.reason}</p>}
                      </div>
                      <button onClick={() => removeLeave(l.id)} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#FCA5A5', display: 'flex' }}>
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add leave */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#E0F7FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus style={{ width: '15px', height: '15px', color: '#22D3EE' }} /> Mark Leave Date
              </h2>
              <form onSubmit={addLeave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Date</label>
                  <input style={inputStyle} type="date" min={new Date().toISOString().slice(0,10)} value={leaveForm.leave_date} onChange={e => setLeaveForm(f => ({...f, leave_date: e.target.value}))} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Reason (optional)</label>
                  <input style={inputStyle} type="text" placeholder="e.g. Conference, Personal leave…" value={leaveForm.reason} onChange={e => setLeaveForm(f => ({...f, reason: e.target.value}))} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={saving}>
                  {saving ? <><InlineSpinner /> Saving…</> : <><CalendarOff style={{width:'14px',height:'14px'}} /> Mark as Leave</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
