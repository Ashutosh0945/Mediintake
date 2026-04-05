import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { FileText, Printer, ArrowLeft, CheckCircle } from 'lucide-react'

export default function DischargeSummary() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [medical, setMedical] = useState(null)
  const [intakes, setIntakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [dischargeNotes, setDischargeNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: p }, { data: m }, { data: i }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('medical_profiles').select('*').eq('patient_id', id).single(),
      supabase.from('intakes').select('*').eq('patient_id', id).order('created_at', { ascending: false }).limit(5),
    ])
    setPatient(p); setMedical(m); setIntakes(i || [])
    setLoading(false)
  }

  function printSummary() { window.print() }

  async function discharge() {
    await supabase.from('profiles').update({ is_discharged: true }).eq('id', id)
    setSaved(true)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#22D3EE' }}>Loading…</div></div>

  const today = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })

  return (
    <div style={{ minHeight: '100vh', background: '#020617' }}>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to={`/admin/patient/${id}`} style={{ color: 'rgba(103,232,249,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back
            </Link>
            <h1 className="section-title">Discharge Summary</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={printSummary} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px' }}>
              <Printer style={{ width: '14px', height: '14px' }} /> Print / Save PDF
            </button>
            {!saved && <button onClick={discharge} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px' }}>
              <CheckCircle style={{ width: '14px', height: '14px' }} /> Mark Discharged
            </button>}
            {saved && <span style={{ color: '#34D399', fontSize: '13px', fontWeight: 700 }}>✓ Discharged</span>}
          </div>
        </div>

        {/* Summary Card - print-friendly */}
        <div className="card" style={{ padding: '32px' }} id="discharge-summary">
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(8,145,178,0.2)', paddingBottom: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#E0F7FF', letterSpacing: '-0.02em' }}>DISCHARGE SUMMARY</h2>
            <p style={{ fontSize: '12px', color: 'rgba(103,232,249,0.5)', marginTop: '4px' }}>Vidyavardhini's College of Engineering & Technology Hospital</p>
            <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.4)', marginTop: '2px' }}>Date: {today}</p>
          </div>

          {/* Patient Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Patient Name', value: patient?.full_name },
              { label: 'Age / Gender', value: `${patient?.age || '—'} yrs / ${patient?.gender || '—'}` },
              { label: 'Phone', value: patient?.phone || '—' },
              { label: 'Blood Group', value: medical?.blood_group || '—' },
              { label: 'Allergies', value: medical?.allergies || 'None reported' },
              { label: 'Emergency Contact', value: medical?.emergency_contact_name ? `${medical.emergency_contact_name} (${medical.emergency_contact_phone})` : '—' },
            ].map(f => (
              <div key={f.label} style={{ background: 'rgba(2,12,35,0.5)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(8,145,178,0.12)' }}>
                <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{f.label}</p>
                <p style={{ fontSize: '13px', color: '#E0F7FF', fontWeight: 600 }}>{f.value}</p>
              </div>
            ))}
          </div>

          {/* Editable Summary Fields */}
          {[
            { label: 'Primary Diagnosis', val: diagnosis, set: setDiagnosis, placeholder: 'e.g. Acute viral fever with dehydration…' },
            { label: 'Treatment Given', val: treatment, set: setTreatment, placeholder: 'e.g. IV fluids, antipyretics, oral rehydration…' },
            { label: 'Discharge Notes', val: dischargeNotes, set: setDischargeNotes, placeholder: 'Patient condition at time of discharge, observations…' },
            { label: 'Follow-Up Instructions', val: followUp, set: setFollowUp, placeholder: 'e.g. Review in 7 days, avoid strenuous activity…' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: '16px' }}>
              <label className="label">{f.label}</label>
              <textarea className="input" rows={2} style={{ resize: 'vertical' }} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)} />
            </div>
          ))}

          {/* Last 3 Intakes */}
          {intakes.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Recent Intakes During Stay</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {intakes.slice(0, 3).map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,12,35,0.5)', borderRadius: '8px', padding: '10px 14px', border: '1px solid rgba(8,145,178,0.1)' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#A5F3FC', fontWeight: 600 }}>{Array.isArray(i.symptoms) ? i.symptoms.slice(0, 3).join(', ') : '—'}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(103,232,249,0.35)', marginTop: '2px' }}>{new Date(i.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {i.severity} severity</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '8px',
                      background: i.risk_level === 'high' ? 'rgba(239,68,68,0.12)' : i.risk_level === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                      color: i.risk_level === 'high' ? '#FCA5A5' : i.risk_level === 'medium' ? '#FCD34D' : '#6EE7B7' }}>
                      {i.risk_level?.toUpperCase()} · {i.risk_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(8,145,178,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.35)' }}>Prepared by</p>
              <p style={{ fontSize: '13px', color: '#E0F7FF', fontWeight: 700, marginTop: '4px' }}>Hospital Administration</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.35)' }}>MediIntake System</p>
              <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.35)' }}>mediintake.in</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
