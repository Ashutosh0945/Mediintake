import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import MobileNav from '../../components/MobileNav'
import { Download, FileText, CheckCircle, Loader } from 'lucide-react'

export default function ExportHealth() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [options, setOptions] = useState({
    profile: true, intakes: true, vaccinations: true,
    medications: true, appointments: true, bmi: true,
  })

  async function exportPDF() {
    setLoading(true)
    try {
      const [{ data: med }, { data: intakes }, { data: vax },
             { data: meds }, { data: appts }, { data: bmiLogs }] = await Promise.all([
        supabase.from('medical_profiles').select('*').eq('patient_id', profile.id).single(),
        options.intakes ? supabase.from('intakes').select('*').eq('patient_id', profile.id).order('created_at', { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
        options.vaccinations ? supabase.from('vaccinations').select('*').eq('patient_id', profile.id).order('date_given', { ascending: false }) : Promise.resolve({ data: [] }),
        options.medications ? supabase.from('medication_reminders').select('*').eq('patient_id', profile.id).eq('active', true) : Promise.resolve({ data: [] }),
        options.appointments ? supabase.from('appointments').select('*').eq('patient_id', profile.id).order('created_at', { ascending: false }).limit(10) : Promise.resolve({ data: [] }),
        options.bmi ? supabase.from('bmi_logs').select('*').eq('patient_id', profile.id).order('created_at', { ascending: false }).limit(10) : Promise.resolve({ data: [] }),
      ])

      // Build HTML for print
      const html = buildReportHTML({ profile, med, intakes: intakes || [], vax: vax || [], meds: meds || [], appts: appts || [], bmiLogs: bmiLogs || [], options })
      const win = window.open('', '_blank')
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => { win.print(); setDone(true); setTimeout(() => setDone(false), 3000) }, 500)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  function buildReportHTML({ profile, med, intakes, vax, meds, appts, bmiLogs, options }) {
    const today = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })
    const riskColor = r => r === 'high' ? '#DC2626' : r === 'medium' ? '#D97706' : '#059669'
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Health Report - ${profile?.full_name}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 32px; line-height: 1.5; font-size: 13px; }
      h1 { font-size: 22px; color: #0B4F6C; margin-bottom: 4px; }
      h2 { font-size: 15px; color: #0B5394; margin: 20px 0 8px; border-bottom: 2px solid #0891B2; padding-bottom: 4px; }
      .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0891B2; padding-bottom: 16px; margin-bottom: 20px; }
      .tag { font-size: 11px; color: #0891B2; font-weight: 700; }
      .grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 10px; }
      .cell { background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 8px; padding: 10px; }
      .cell-label { font-size: 10px; font-weight: 700; color: #0891B2; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
      .cell-val { font-size: 13px; font-weight: 600; color: #1a1a2e; }
      table { width: 100%; border-collapse: collapse; margin-top: 6px; }
      th { background: #0891B2; color: white; padding: 7px 10px; text-align: left; font-size: 11px; }
      td { padding: 6px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; }
      tr:nth-child(even) td { background: #F8FAFF; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
      .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #CBD5E1; display: flex; justify-content: space-between; font-size: 11px; color: #94A3B8; }
      @media print { body { padding: 20px; } }
    </style></head><body>
    <div class="header">
      <div>
        <h1>Health Export Report</h1>
        <p class="tag">MediIntake · mediintake.in</p>
        <p style="font-size:11px;color:#64748B;margin-top:4px;">Generated: ${today}</p>
      </div>
      <div style="text-align:right">
        <p style="font-size:14px;font-weight:700;color:#0B4F6C">${profile?.full_name || '—'}</p>
        <p style="font-size:12px;color:#64748B">${profile?.email || ''}</p>
        <p style="font-size:12px;color:#64748B">${profile?.phone || ''}</p>
      </div>
    </div>
    ${options.profile && med ? `
    <h2>Patient Profile</h2>
    <div class="grid">
      <div class="cell"><div class="cell-label">Age / Gender</div><div class="cell-val">${profile?.age || '—'} yrs / ${profile?.gender || '—'}</div></div>
      <div class="cell"><div class="cell-label">Blood Group</div><div class="cell-val">${med?.blood_group || '—'}</div></div>
      <div class="cell"><div class="cell-label">Allergies</div><div class="cell-val">${med?.allergies || 'None'}</div></div>
      <div class="cell"><div class="cell-label">Chronic Conditions</div><div class="cell-val">${Array.isArray(med?.chronic_conditions) ? med.chronic_conditions.join(', ') : '—'}</div></div>
      <div class="cell"><div class="cell-label">Emergency Contact</div><div class="cell-val">${med?.emergency_contact_name || '—'}</div></div>
      <div class="cell"><div class="cell-label">Emergency Phone</div><div class="cell-val">${med?.emergency_contact_phone || '—'}</div></div>
    </div>` : ''}
    ${options.intakes && intakes.length > 0 ? `
    <h2>Intake Records (Last ${intakes.length})</h2>
    <table><thead><tr><th>Date</th><th>Symptoms</th><th>Severity</th><th>Risk</th><th>Status</th></tr></thead><tbody>
    ${intakes.map(i => `<tr>
      <td>${new Date(i.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
      <td>${Array.isArray(i.symptoms) ? i.symptoms.slice(0,3).join(', ') : '—'}</td>
      <td style="text-transform:capitalize">${i.severity || '—'}</td>
      <td><span class="badge" style="background:${riskColor(i.risk_level)}20;color:${riskColor(i.risk_level)}">${(i.risk_level || '').toUpperCase()} · ${i.risk_score}</span></td>
      <td style="text-transform:capitalize">${i.status || '—'}</td>
    </tr>`).join('')}
    </tbody></table>` : ''}
    ${options.vaccinations && vax.length > 0 ? `
    <h2>Vaccination Records</h2>
    <table><thead><tr><th>Vaccine</th><th>Dose</th><th>Date Given</th><th>Next Due</th><th>Given By</th></tr></thead><tbody>
    ${vax.map(v => `<tr><td>${v.vaccine_name}</td><td>${v.dose}</td><td>${v.date_given || '—'}</td><td>${v.next_due_date || '—'}</td><td>${v.given_by || '—'}</td></tr>`).join('')}
    </tbody></table>` : ''}
    ${options.medications && meds.length > 0 ? `
    <h2>Active Medications</h2>
    <table><thead><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Time</th></tr></thead><tbody>
    ${meds.map(m => `<tr><td>${m.medication}</td><td>${m.dosage || '—'}</td><td>${m.frequency || '—'}</td><td style="text-transform:capitalize">${m.time_of_day || '—'}</td></tr>`).join('')}
    </tbody></table>` : ''}
    ${options.bmi && bmiLogs.length > 0 ? `
    <h2>BMI History</h2>
    <table><thead><tr><th>Date</th><th>Height (cm)</th><th>Weight (kg)</th><th>BMI</th></tr></thead><tbody>
    ${bmiLogs.map(b => `<tr><td>${new Date(b.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td><td>${b.height_cm}</td><td>${b.weight_kg}</td><td><strong>${b.bmi_value}</strong></td></tr>`).join('')}
    </tbody></table>` : ''}
    <div class="footer">
      <span>This report is auto-generated by MediIntake and is for personal health tracking purposes.</span>
      <span>mediintake.in</span>
    </div>
    </body></html>`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', paddingBottom: '5rem' }}>
      <Navbar />
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }} className="animate-slide-up">
          <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg,#059669,#10B981)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText style={{ width: '22px', height: '22px', color: 'white' }} />
          </div>
          <div>
            <h1 className="section-title">Export Health Data</h1>
            <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.45)' }}>Generate a full PDF report of your health records</p>
          </div>
        </div>

        <div className="card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#E0F7FF', marginBottom: '18px' }}>Select what to include:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {[
              { key: 'profile', label: 'Patient Profile & Medical History', icon: '👤' },
              { key: 'intakes', label: 'Intake Records & Risk Scores', icon: '🩺' },
              { key: 'vaccinations', label: 'Vaccination Records', icon: '💉' },
              { key: 'medications', label: 'Active Medications', icon: '💊' },
              { key: 'appointments', label: 'Appointment History', icon: '📅' },
              { key: 'bmi', label: 'BMI History', icon: '⚖️' },
            ].map(opt => (
              <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', border: `1.5px solid ${options[opt.key] ? 'rgba(16,185,129,0.4)' : 'rgba(8,145,178,0.18)'}`, background: options[opt.key] ? 'rgba(16,185,129,0.06)' : 'rgba(2,26,60,0.5)', transition: 'all 0.15s' }}>
                <input type="checkbox" checked={options[opt.key]} onChange={e => setOptions(o => ({ ...o, [opt.key]: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer' }} />
                <span style={{ fontSize: '16px' }}>{opt.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: options[opt.key] ? '#E0F7FF' : 'rgba(165,243,252,0.5)' }}>{opt.label}</span>
                {options[opt.key] && <CheckCircle style={{ width: '14px', height: '14px', color: '#34D399', marginLeft: 'auto' }} />}
              </label>
            ))}
          </div>

          <button onClick={exportPDF} disabled={loading || !Object.values(options).some(Boolean)} className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', padding: '13px' }}>
            {loading ? <><Loader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Generating…</>
              : done ? <><CheckCircle style={{ width: '16px', height: '16px' }} /> Done! Print dialog opened</>
              : <><Download style={{ width: '16px', height: '16px' }} /> Export as PDF</>}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.3)', textAlign: 'center', marginTop: '12px' }}>Opens print dialog — use "Save as PDF" to download</p>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
