import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import MobileNav from '../../components/MobileNav'
import { Activity, TrendingUp, TrendingDown, Minus, Save, Info } from 'lucide-react'

const BMI_CATEGORIES = [
  { max: 18.5, label: 'Underweight', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', advice: 'Consider increasing caloric intake with nutritious foods.' },
  { max: 25.0, label: 'Normal',      color: '#10B981', bg: 'rgba(16,185,129,0.12)', advice: 'Great! Maintain your current healthy lifestyle.' },
  { max: 30.0, label: 'Overweight',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', advice: 'Consider a balanced diet and regular physical activity.' },
  { max: Infinity, label: 'Obese',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)', advice: 'Consult a doctor for a personalised weight management plan.' },
]

function getBMICategory(bmi) {
  return BMI_CATEGORIES.find(c => bmi < c.max) || BMI_CATEGORIES[3]
}

function BMIGauge({ bmi }) {
  if (!bmi) return null
  const cat = getBMICategory(bmi)
  const pct = Math.min(Math.max((bmi - 10) / 35 * 100, 0), 100)
  return (
    <div style={{ position: 'relative', padding: '20px 0 8px' }}>
      <div style={{ height: '12px', borderRadius: '6px', background: 'linear-gradient(90deg,#3B82F6 0%,#10B981 30%,#F59E0B 65%,#EF4444 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: `${pct}%`, top: '-4px', transform: 'translateX(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: cat.color, border: '3px solid white', boxShadow: `0 0 8px ${cat.color}`, transition: 'left 0.5s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'rgba(103,232,249,0.4)' }}>
        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>45+</span>
      </div>
    </div>
  )
}

export default function BMICalculator() {
  const { profile } = useAuth()
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bmi, setBmi] = useState(null)
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (profile) loadHistory() }, [profile])

  async function loadHistory() {
    const { data } = await supabase
      .from('bmi_logs')
      .select('*')
      .eq('patient_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory(data || [])
  }

  function calculate() {
    const h = parseFloat(height) / 100
    const w = parseFloat(weight)
    if (h > 0 && w > 0) setBmi(+(w / (h * h)).toFixed(1))
  }

  async function saveBMI() {
    if (!bmi) return
    setSaving(true)
    await supabase.from('bmi_logs').insert({
      patient_id: profile.id, height_cm: parseFloat(height),
      weight_kg: parseFloat(weight), bmi_value: bmi,
    })
    setSaved(true); setTimeout(() => setSaved(false), 2500)
    loadHistory(); setSaving(false)
  }

  const cat = bmi ? getBMICategory(bmi) : null

  return (
    <div style={{ minHeight: '100vh', background: '#020617', paddingBottom: '5rem' }}>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }} className="animate-slide-up">
          <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg,#0C7B96,#0891B2)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.4)' }}>
            <Activity style={{ width: '22px', height: '22px', color: '#67E8F9' }} />
          </div>
          <div>
            <h1 className="section-title">BMI Calculator</h1>
            <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.45)' }}>Track your Body Mass Index over time</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Calculator */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#E0F7FF', marginBottom: '20px' }}>Calculate BMI</h2>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Height (cm)</label>
              <input className="input" type="number" placeholder="e.g. 170" value={height}
                onChange={e => { setHeight(e.target.value); setBmi(null) }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="label">Weight (kg)</label>
              <input className="input" type="number" placeholder="e.g. 65" value={weight}
                onChange={e => { setWeight(e.target.value); setBmi(null) }} />
            </div>
            <button onClick={calculate} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
              Calculate
            </button>

            {bmi && cat && (
              <div style={{ background: cat.bg, border: `1.5px solid ${cat.color}30`, borderRadius: '14px', padding: '18px', marginTop: '8px' }} className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(165,243,252,0.6)' }}>Your BMI</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: cat.color, background: `${cat.color}20`, padding: '3px 10px', borderRadius: '8px' }}>{cat.label}</span>
                </div>
                <div style={{ fontSize: '48px', fontWeight: 900, color: cat.color, lineHeight: 1 }}>{bmi}</div>
                <BMIGauge bmi={bmi} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '12px' }}>
                  <Info style={{ width: '14px', height: '14px', color: cat.color, flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontSize: '11.5px', color: 'rgba(165,243,252,0.6)', lineHeight: 1.6 }}>{cat.advice}</p>
                </div>
                <button onClick={saveBMI} disabled={saving || saved} className="btn-secondary"
                  style={{ width: '100%', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '13px' }}>
                  <Save style={{ width: '14px', height: '14px' }} />
                  {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save to History'}
                </button>
              </div>
            )}
          </div>

          {/* History + Mini Chart */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#E0F7FF', marginBottom: '16px' }}>BMI History</h2>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(103,232,249,0.3)', fontSize: '13px' }}>
                No records yet. Calculate and save your BMI.
              </div>
            ) : (
              <>
                {/* Sparkline */}
                <div style={{ position: 'relative', height: '80px', marginBottom: '16px' }}>
                  <svg width="100%" height="80" viewBox={`0 0 ${history.length > 1 ? 300 : 300} 80`} preserveAspectRatio="none">
                    {history.length > 1 && (() => {
                      const vals = [...history].reverse().map(h => h.bmi_value)
                      const min = Math.min(...vals) - 2; const max = Math.max(...vals) + 2
                      const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 290 + 5},${70 - ((v - min) / (max - min)) * 60}`)
                      return <>
                        <polyline fill="none" stroke="#22D3EE" strokeWidth="2" points={pts.join(' ')} />
                        {pts.map((pt, i) => {
                          const [x, y] = pt.split(',')
                          const c = getBMICategory(vals[i])
                          return <circle key={i} cx={x} cy={y} r="4" fill={c.color} />
                        })}
                      </>
                    })()}
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {history.map((h, i) => {
                    const c = getBMICategory(h.bmi_value)
                    const prev = history[i + 1]
                    const trend = prev ? (h.bmi_value > prev.bmi_value ? 'up' : h.bmi_value < prev.bmi_value ? 'down' : 'same') : null
                    return (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2,12,35,0.5)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(8,145,178,0.12)' }}>
                        <div>
                          <span style={{ fontSize: '20px', fontWeight: 900, color: c.color }}>{h.bmi_value}</span>
                          <span style={{ fontSize: '10px', color: c.color, marginLeft: '6px', fontWeight: 700 }}>{c.label}</span>
                          <p style={{ fontSize: '10px', color: 'rgba(103,232,249,0.35)', marginTop: '2px' }}>
                            {h.weight_kg}kg · {h.height_cm}cm · {new Date(h.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </p>
                        </div>
                        {trend && (
                          <div style={{ color: trend === 'up' ? '#EF4444' : trend === 'down' ? '#10B981' : '#64748B' }}>
                            {trend === 'up' ? <TrendingUp style={{ width: '16px', height: '16px' }} /> :
                             trend === 'down' ? <TrendingDown style={{ width: '16px', height: '16px' }} /> :
                             <Minus style={{ width: '16px', height: '16px' }} />}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* BMI Reference Table */}
        <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#E0F7FF', marginBottom: '12px' }}>BMI Reference Guide</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
            {BMI_CATEGORIES.map(c => (
              <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}30`, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: c.color }}>{c.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(165,243,252,0.45)', marginTop: '4px' }}>
                  {c.label === 'Underweight' ? '< 18.5' : c.label === 'Normal' ? '18.5 – 24.9' : c.label === 'Overweight' ? '25 – 29.9' : '≥ 30'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
