import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import MobileNav from '../../components/MobileNav'
import { Calendar, Clock, Stethoscope, ChevronLeft, ChevronRight, CheckCircle, XCircle, User } from 'lucide-react'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export default function DoctorAvailability() {
  const [doctors, setDoctors] = useState([])
  const [selected, setSelected] = useState(null)
  const [availability, setAvailability] = useState([])
  const [leaves, setLeaves] = useState([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDoctors() }, [])
  useEffect(() => { if (selected) loadAvailability(selected.id) }, [selected])

  async function loadDoctors() {
    const { data: docs } = await supabase
      .from('profiles')
      .select('id, full_name, phone, doctor_profiles(specialization, department, experience_years, bio)')
      .eq('role', 'admin')
    setDoctors(docs || [])
    if (docs?.length > 0) setSelected(docs[0])
    setLoading(false)
  }

  async function loadAvailability(doctorId) {
    const [{ data: avail }, { data: leaveData }] = await Promise.all([
      supabase.from('doctor_availability').select('*').eq('doctor_id', doctorId).eq('is_active', true).order('day_of_week').order('start_time'),
      supabase.from('doctor_leaves').select('*').eq('doctor_id', doctorId).gte('leave_date', new Date().toISOString().slice(0,10)),
    ])
    setAvailability(avail || [])
    setLeaves(leaveData || [])
  }

  function getWeekDates(offset) {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  }

  function isLeave(date) {
    const ds = date.toISOString().slice(0, 10)
    return leaves.some(l => l.leave_date === ds)
  }

  function isToday(date) {
    return date.toDateString() === new Date().toDateString()
  }

  function isPast(date) {
    const today = new Date(); today.setHours(0,0,0,0)
    return date < today
  }

  function getSlotsForDate(date) {
    const dow = date.getDay()
    return availability.filter(a => a.day_of_week === dow)
  }

  function generateTimeSlots(slot) {
    const slots = []
    const [sh, sm] = slot.start_time.split(':').map(Number)
    const [eh, em] = slot.end_time.split(':').map(Number)
    let cur = sh * 60 + sm
    const end = eh * 60 + em
    while (cur + slot.slot_duration <= end) {
      const h = Math.floor(cur / 60)
      const m = cur % 60
      const label = `${h > 12 ? h-12 : h}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`
      slots.push(label)
      cur += slot.slot_duration
    }
    return slots
  }

  function fmt(time) {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hr = parseInt(h)
    return `${hr > 12 ? hr-12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
  }

  const weekDates = getWeekDates(weekOffset)
  const dp = selected?.doctor_profiles?.[0] || selected?.doctor_profiles

  const cardStyle = { background: 'rgba(2,26,60,0.85)', border: '1.5px solid rgba(8,145,178,0.22)', borderRadius: '18px', padding: '20px' }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', paddingBottom: '5rem' }}>
      <Navbar />
      <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }} className="animate-slide-up">
          <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#0E7490,#0891B2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.4)' }}>
            <Stethoscope style={{ width: '20px', height: '20px', color: '#67E8F9' }} />
          </div>
          <div>
            <h1 className="section-title">Doctor Availability</h1>
            <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.45)', marginTop: '2px' }}>View schedules and available appointment slots</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(103,232,249,0.3)', fontSize: '13px' }}>Loading doctors…</div>
        ) : doctors.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
            <Stethoscope style={{ width: '40px', height: '40px', color: 'rgba(34,211,238,0.15)', margin: '0 auto 12px' }} />
            <p style={{ color: 'rgba(103,232,249,0.5)', fontSize: '14px', fontWeight: 600 }}>No doctors have set up availability yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>

            {/* Doctor list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Select Doctor</p>
              {doctors.map(doc => {
                const dp2 = doc.doctor_profiles?.[0] || doc.doctor_profiles
                const isSelected = selected?.id === doc.id
                return (
                  <button key={doc.id} onClick={() => setSelected(doc)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '14px', border: `1.5px solid ${isSelected ? 'rgba(34,211,238,0.4)' : 'rgba(8,145,178,0.18)'}`, background: isSelected ? 'rgba(34,211,238,0.08)' : 'rgba(2,26,60,0.7)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                    <div style={{ width: '40px', height: '40px', background: isSelected ? 'rgba(34,211,238,0.15)' : 'rgba(8,145,178,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User style={{ width: '18px', height: '18px', color: isSelected ? '#22D3EE' : 'rgba(103,232,249,0.4)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#A5F3FC' : 'rgba(165,243,252,0.6)' }}>{doc.full_name}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.35)', marginTop: '1px' }}>{dp2?.specialization || 'General Medicine'}</p>
                      {dp2?.department && <p style={{ fontSize: '10px', color: 'rgba(34,211,238,0.4)', marginTop: '1px' }}>{dp2.department}</p>}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Calendar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Doctor info card */}
              {selected && (
                <div style={cardStyle} className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(34,211,238,0.12)', border: '1.5px solid rgba(34,211,238,0.25)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Stethoscope style={{ width: '22px', height: '22px', color: '#22D3EE' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#E0F7FF' }}>Dr. {selected.full_name}</p>
                      <p style={{ fontSize: '12px', color: '#67E8F9', marginTop: '2px' }}>{dp?.specialization || 'General Medicine'}{dp?.department ? ` · ${dp.department}` : ''}</p>
                      {dp?.experience_years && <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.4)', marginTop: '1px' }}>{dp.experience_years} years experience</p>}
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weekly Slots</p>
                      <p style={{ fontSize: '22px', fontWeight: 900, color: '#22D3EE' }}>{availability.length}</p>
                    </div>
                  </div>
                  {dp?.bio && <p style={{ fontSize: '12px', color: 'rgba(103,232,249,0.45)', marginTop: '12px', lineHeight: 1.6, borderTop: '1px solid rgba(8,145,178,0.15)', paddingTop: '10px' }}>{dp.bio}</p>}
                </div>
              )}

              {/* Week navigation */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <button onClick={() => setWeekOffset(w => w - 1)} disabled={weekOffset <= 0}
                    style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '8px', padding: '7px', cursor: weekOffset <= 0 ? 'not-allowed' : 'pointer', color: weekOffset <= 0 ? 'rgba(103,232,249,0.2)' : '#67E8F9', display: 'flex', opacity: weekOffset <= 0 ? 0.4 : 1 }}>
                    <ChevronLeft style={{ width: '16px', height: '16px' }} />
                  </button>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#A5F3FC' }}>
                    {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <button onClick={() => setWeekOffset(w => w + 1)}
                    style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#67E8F9', display: 'flex' }}>
                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>

                {/* Day grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px' }}>
                  {weekDates.map((date, i) => {
                    const daySlots = getSlotsForDate(date)
                    const onLeave = isLeave(date)
                    const past = isPast(date)
                    const today = isToday(date)
                    const hasSlots = daySlots.length > 0 && !onLeave && !past
                    const allSlots = daySlots.flatMap(s => generateTimeSlots(s))

                    return (
                      <div key={i} style={{ borderRadius: '12px', padding: '10px 6px', textAlign: 'center', border: `1.5px solid ${today ? 'rgba(34,211,238,0.4)' : onLeave ? 'rgba(248,113,113,0.2)' : hasSlots ? 'rgba(52,211,153,0.2)' : 'rgba(8,145,178,0.1)'}`, background: today ? 'rgba(34,211,238,0.08)' : onLeave ? 'rgba(248,113,113,0.05)' : hasSlots ? 'rgba(52,211,153,0.05)' : 'rgba(2,6,23,0.4)', opacity: past ? 0.4 : 1 }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(103,232,249,0.4)', marginBottom: '3px' }}>{DAY_SHORT[date.getDay()]}</p>
                        <p style={{ fontSize: '14px', fontWeight: 800, color: today ? '#22D3EE' : '#A5F3FC' }}>{date.getDate()}</p>
                        <div style={{ marginTop: '6px' }}>
                          {onLeave ? (
                            <div style={{ display: 'flex', justifyContent: 'center' }}><XCircle style={{ width: '14px', height: '14px', color: '#FCA5A5' }} /></div>
                          ) : hasSlots ? (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'center' }}><CheckCircle style={{ width: '13px', height: '13px', color: '#34D399' }} /></div>
                              <p style={{ fontSize: '9px', color: '#34D399', fontWeight: 700, marginTop: '2px' }}>{allSlots.length} slots</p>
                            </div>
                          ) : (
                            <p style={{ fontSize: '9px', color: 'rgba(103,232,249,0.2)' }}>—</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[['#34D399','Available'],['#FCA5A5','On Leave'],['rgba(103,232,249,0.2)','Unavailable']].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
                      <span style={{ fontSize: '10px', color: 'rgba(103,232,249,0.4)', fontWeight: 600 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time slots detail */}
              <div style={cardStyle}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(103,232,249,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>This Week's Time Slots</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {weekDates.map((date, i) => {
                    const daySlots = getSlotsForDate(date)
                    const onLeave = isLeave(date)
                    const past = isPast(date)
                    if (!daySlots.length && !onLeave) return null
                    const allTimes = daySlots.flatMap(s => generateTimeSlots(s))
                    return (
                      <div key={i} style={{ opacity: past ? 0.45 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: isToday(date) ? '#22D3EE' : '#A5F3FC' }}>
                            {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </p>
                          {onLeave && <span style={{ fontSize: '10px', background: 'rgba(248,113,113,0.15)', color: '#FCA5A5', border: '1px solid rgba(248,113,113,0.25)', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>On Leave</span>}
                        </div>
                        {onLeave ? null : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {allTimes.map((t, j) => (
                              <span key={j} style={{ fontSize: '11px', fontWeight: 600, color: '#67E8F9', background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.2)', padding: '4px 10px', borderRadius: '8px' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }).filter(Boolean)}
                  {weekDates.every(d => !getSlotsForDate(d).length && !isLeave(d)) && (
                    <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.3)', textAlign: 'center', padding: '16px 0' }}>No slots available this week</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}
