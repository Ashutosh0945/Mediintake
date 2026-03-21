import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { ArrowLeft, Printer } from 'lucide-react'
import Navbar from '../../components/Navbar'

export default function PrintPatientSummary() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: p }, { data: m }, { data: i }, { data: v }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('medical_profiles').select('*').eq('patient_id', id).single(),
      supabase.from('intakes').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
      supabase.from('vaccinations').select('*').eq('patient_id', id).order('date_given', { ascending: false }),
    ])
    setData({ patient: p, med: m, intakes: i || [], vaccines: v || [] })
    setLoading(false)
  }

  const handlePrint = () => window.print()

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-slate-700 border-t-teal-500 rounded-full animate-spin" /></div></div>
  if (!data?.patient) return <div className="min-h-screen"><Navbar /><p className="p-10 text-slate-400 text-center">Patient not found.</p></div>

  const { patient, med, intakes, vaccines } = data
  const latestIntake = intakes[0]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 print:p-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link to={`/admin/patient/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print Summary
          </button>
        </div>

        {/* Print content */}
        <div className="card p-8 space-y-6 print:shadow-none print:border-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-5">
            <div>
              <p className="text-xs text-slate-500 mb-1">MEDIINTAKE — PATIENT SUMMARY REPORT</p>
              <h1 className="font-display text-3xl font-bold text-white">{patient.full_name}</h1>
              <p className="text-slate-400 text-sm mt-1">
                {patient.age && `Age ${patient.age}`}{patient.gender && ` · ${patient.gender}`}{patient.email && ` · ${patient.email}`}
              </p>
              {patient.phone && <p className="text-slate-500 text-xs mt-0.5">{patient.phone}</p>}
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Generated</p>
              <p className="text-slate-300">{new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              {patient.is_discharged && <p className="text-red-400 mt-1 font-semibold">DISCHARGED</p>}
            </div>
          </div>

          {/* Medical info */}
          {med && (
            <div>
              <h2 className="font-display font-semibold text-white mb-3 text-lg">Medical Profile</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-500 text-xs mb-0.5">Blood Group</p><p className="text-white font-semibold">{med.blood_group || 'Not specified'}</p></div>
                <div><p className="text-slate-500 text-xs mb-0.5">Allergies</p><p className="text-white">{med.allergies || 'None reported'}</p></div>
                <div><p className="text-slate-500 text-xs mb-0.5">Current Medications</p><p className="text-white">{med.current_medications || 'None reported'}</p></div>
                <div><p className="text-slate-500 text-xs mb-0.5">Chronic Conditions</p><p className="text-white">{med.chronic_conditions?.length > 0 ? med.chronic_conditions.map(c => c.replace(/_/g,' ')).join(', ') : 'None reported'}</p></div>
              </div>
              {med.emergency_contact_name && (
                <div className="mt-3 p-3 bg-teal-500/5 border border-teal-500/20 rounded-xl">
                  <p className="text-xs text-teal-400 font-semibold mb-1">Emergency Contact</p>
                  <p className="text-sm text-white">{med.emergency_contact_name} ({med.emergency_contact_relation}) — {med.emergency_contact_phone}</p>
                </div>
              )}
            </div>
          )}

          {/* Latest intake */}
          {latestIntake && (
            <div>
              <h2 className="font-display font-semibold text-white mb-3 text-lg">Latest Intake</h2>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/30 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${latestIntake.risk_level === 'high' ? 'bg-red-500/20 text-red-400' : latestIntake.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {latestIntake.risk_level?.toUpperCase()} RISK — {latestIntake.risk_score}/100
                  </span>
                  <span className="text-slate-500 text-xs">{new Date(latestIntake.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <p className="text-slate-300 capitalize">{Array.isArray(latestIntake.symptoms) ? latestIntake.symptoms.map(s => s.replace(/_/g,' ')).join(', ') : '—'}</p>
                <div className="flex gap-4 text-xs text-slate-500">
                  {latestIntake.heart_rate && <span>HR: {latestIntake.heart_rate} bpm</span>}
                  {latestIntake.temperature && <span>Temp: {latestIntake.temperature}°C</span>}
                  {latestIntake.bp_systolic && <span>BP: {latestIntake.bp_systolic}/{latestIntake.bp_diastolic}</span>}
                </div>
                {latestIntake.doctor_notes && <div className="pt-2 border-t border-slate-700"><p className="text-xs text-teal-400 font-semibold mb-0.5">Doctor's Notes</p><p className="text-slate-300">{latestIntake.doctor_notes}</p></div>}
              </div>
            </div>
          )}

          {/* Intake summary */}
          <div>
            <h2 className="font-display font-semibold text-white mb-3 text-lg">Intake History ({intakes.length} total)</h2>
            <div className="flex gap-4 text-sm">
              <span className="text-red-400 font-semibold">{intakes.filter(i=>i.risk_level==='high').length} High</span>
              <span className="text-amber-400 font-semibold">{intakes.filter(i=>i.risk_level==='medium').length} Medium</span>
              <span className="text-emerald-400 font-semibold">{intakes.filter(i=>i.risk_level==='low').length} Low</span>
              <span className="text-teal-400 font-semibold">{intakes.filter(i=>i.status==='reviewed').length} Reviewed</span>
            </div>
          </div>

          {/* Vaccinations */}
          {vaccines.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-white mb-3 text-lg">Vaccination Records ({vaccines.length})</h2>
              <div className="space-y-2">
                {vaccines.map(v => (
                  <div key={v.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800">
                    <span className="text-white">{v.vaccine_name} {v.dose && `— ${v.dose}`}</span>
                    <span className="text-slate-500 text-xs">{new Date(v.date_given).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-600 text-center pt-4 border-t border-slate-800">
            This report is generated by MediIntake and is for medical reference only. Not a substitute for clinical judgement.
          </p>
        </div>
      </main>
    </div>
  )
}
