import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import MobileNav from '../../components/MobileNav'
import { Stethoscope, Calendar, Clock, CheckCircle, User, Star } from 'lucide-react'

const TIME_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM']

const SPECIALIZATIONS = ['General Physician','Cardiologist','Dermatologist','Orthopedic',
  'Pediatrician','Neurologist','ENT Specialist','Ophthalmologist']

export default function DoctorBooking() {
  const { profile } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [selected, setSelected] = useState(null)
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [reason, setReason] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [filterSpec, setFilterSpec] = useState('All')

  useEffect(() => { loadDoctors(); if (profile) loadMyBookings() }, [profile])
  useEffect(() => { if (selected && date) loadBookedSlots() }, [selected, date])

  async function loadDoctors() {
    const { data } = await supabase
      .from('doctor_profiles')
      .select('*, profiles(full_name, email)')
    setDoctors(data || [])
  }

  async function loadBookedSlots() {
    const { data } = await supabase
      .from('appointments')
      .select('slot_time')
      .eq('doctor_id', selected.id)
      .eq('slot_date', date)
      .neq('status', 'cancelled')
    setBookedSlots((data || []).map(d => d.slot_time))
  }

  async function loadMyBookings() {
    const { data } = await supabase
      .from('appointments')
      .select('*, doctor_profiles(specialization), profiles!doctor_id(full_name)')
      .eq('patient_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setMyBookings(data || [])
  }

  async function book() {
    if (!selected || !date || !slot || !reason) return
    setSaving(true)
    await supabase.from('appointments').insert({
      patient_id: profile.id,
      doctor_id: selected.id,
      reason, slot_date: date, slot_time: slot,
      preferred_date: date, preferred_time: slot,
      status: 'pending',
    })
    setSaving(false); setSuccess(true)
    setSlot(''); setDate(''); setReason(''); setSelected(null)
    loadMyBookings()
    setTimeout(() => setSuccess(false), 3000)
  }

  const filtered = filterSpec === 'All' ? doctors : doctors.filter(d => d.specialization === filterSpec)
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div style={{ minHeight: '100vh', background: '#020617', paddingBottom: '5rem' }}>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }} className="animate-slide-up">
          <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }}>
            <Stethoscope style={{ width: '22px', height: '22px', color: 'white' }} />
          </div>
          <div>
            <h1 className="section-title">Book a Doctor</h1>
            <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.45)' }}>View availability and book appointment slots</p>
          </div>
        </div>

        {success && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#34D399', fontSize: '14px', fontWeight: 600 }} className="animate-fade-in">
            <CheckCircle style={{ width: '18px', height: '18px' }} /> Appointment booked successfully! Awaiting confirmation.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
          {/* Doctors list */}
          <div>
            {/* Filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {['All', ...SPECIALIZATIONS].slice(0,6).map(spec => (
                <button key={spec} onClick={() => setFilterSpec(spec)}
                  style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                    background: filterSpec === spec ? '#0891B2' : 'rgba(2,26,60,0.8)',
                    color: filterSpec === spec ? 'white' : 'rgba(165,243,252,0.5)',
                    border: `1px solid ${filterSpec === spec ? '#0891B2' : 'rgba(8,145,178,0.2)'}` }}>
                  {spec}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'rgba(103,232,249,0.3)', fontSize: '13px' }}>
                No doctors available yet. Check back soon.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map(doc => (
                  <div key={doc.id} onClick={() => setSelected(selected?.id === doc.id ? null : doc)}
                    className="card" style={{ padding: '18px', cursor: 'pointer', border: `1.5px solid ${selected?.id === doc.id ? 'rgba(124,58,237,0.5)' : 'rgba(8,145,178,0.18)'}`,
                      background: selected?.id === doc.id ? 'rgba(124,58,237,0.06)' : 'rgba(2,26,60,0.85)', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User style={{ width: '22px', height: '22px', color: 'white' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#E0F7FF' }}>Dr. {doc.profiles?.full_name || 'Doctor'}</p>
                        <p style={{ fontSize: '12px', color: '#A78BFA', marginTop: '2px' }}>{doc.specialization}</p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                          {doc.experience_years && <span style={{ fontSize: '11px', color: 'rgba(103,232,249,0.4)' }}>{doc.experience_years} yrs exp</span>}
                          {doc.department && <span style={{ fontSize: '11px', color: 'rgba(103,232,249,0.4)' }}>{doc.department}</span>}
                        </div>
                      </div>
                      {selected?.id === doc.id && <CheckCircle style={{ width: '18px', height: '18px', color: '#A78BFA' }} />}
                    </div>
                    {doc.bio && <p style={{ fontSize: '12px', color: 'rgba(165,243,252,0.45)', marginTop: '10px', lineHeight: 1.6 }}>{doc.bio}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#E0F7FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar style={{ width: '16px', height: '16px', color: '#22D3EE' }} /> Book Appointment
              </h3>
              {!selected && <p style={{ fontSize: '12px', color: 'rgba(103,232,249,0.35)', marginBottom: '12px' }}>← Select a doctor first</p>}
              <div style={{ marginBottom: '14px' }}>
                <label className="label">Select Date</label>
                <input className="input" type="date" min={minDate} value={date} onChange={e => { setDate(e.target.value); setSlot('') }} disabled={!selected} />
              </div>
              {date && (
                <>
                  <label className="label">Available Slots</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px', marginBottom: '14px' }}>
                    {TIME_SLOTS.map(s => {
                      const booked = bookedSlots.includes(s)
                      return (
                        <button key={s} onClick={() => !booked && setSlot(s)} disabled={booked}
                          style={{ padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: booked ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', transition: 'all 0.15s',
                            background: booked ? 'rgba(100,116,139,0.1)' : slot === s ? '#0891B2' : 'rgba(2,26,60,0.8)',
                            color: booked ? 'rgba(100,116,139,0.4)' : slot === s ? 'white' : 'rgba(165,243,252,0.6)',
                            border: `1px solid ${booked ? 'rgba(100,116,139,0.15)' : slot === s ? '#0891B2' : 'rgba(8,145,178,0.2)'}`,
                            textDecoration: booked ? 'line-through' : 'none' }}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
              <div style={{ marginBottom: '14px' }}>
                <label className="label">Reason for Visit</label>
                <input className="input" placeholder="e.g. Fever, Follow-up checkup…" value={reason} onChange={e => setReason(e.target.value)} />
              </div>
              <button onClick={book} disabled={!selected || !date || !slot || !reason || saving} className="btn-primary" style={{ width: '100%' }}>
                {saving ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>

            {/* My bookings */}
            {myBookings.length > 0 && (
              <div className="card" style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#E0F7FF', marginBottom: '12px' }}>My Bookings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {myBookings.slice(0, 3).map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,12,35,0.5)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(8,145,178,0.1)' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#A5F3FC' }}>{b.reason}</p>
                        <p style={{ fontSize: '10px', color: 'rgba(103,232,249,0.35)', marginTop: '2px' }}>
                          {b.slot_date} · {b.slot_time}
                        </p>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                        background: b.status === 'confirmed' ? 'rgba(16,185,129,0.12)' : b.status === 'cancelled' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                        color: b.status === 'confirmed' ? '#34D399' : b.status === 'cancelled' ? '#FCA5A5' : '#FCD34D' }}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
