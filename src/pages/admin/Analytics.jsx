import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { BarChart2, TrendingUp, TrendingDown, Users, Activity, Calendar } from 'lucide-react'

function BarChart({ data, maxVal, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
      {data.map(({ label, value }) => {
        const h = maxVal > 0 ? Math.round((value / maxVal) * 100) : 0
        return (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: value > 0 ? '#E0F7FF' : 'rgba(103,232,249,0.2)' }}>{value}</span>
            <div style={{ width: '100%', height: `${h}%`, minHeight: value > 0 ? '4px' : '2px', background: value > 0 ? color : 'rgba(8,145,178,0.1)', borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease' }} />
            <span style={{ fontSize: '9px', color: 'rgba(103,232,249,0.35)', textAlign: 'center', lineHeight: 1.2, fontWeight: 600 }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Analytics() {
  const [intakes, setIntakes] = useState([])
  const [range, setRange] = useState('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('intakes').select('*').order('created_at', { ascending: false })
    setIntakes(data || [])
    setLoading(false)
  }

  function groupByDay(items, days) {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      const dateStr = d.toISOString().slice(0, 10)
      const count = items.filter(item => item.created_at?.slice(0, 10) === dateStr).length
      result.push({ label, value: count })
    }
    return result
  }

  function groupByWeek(items, weeks) {
    const result = []
    for (let i = weeks - 1; i >= 0; i--) {
      const end = new Date(); end.setDate(end.getDate() - i * 7)
      const start = new Date(end); start.setDate(start.getDate() - 6)
      const label = `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
      const count = items.filter(item => {
        const d = new Date(item.created_at)
        return d >= start && d <= end
      }).length
      result.push({ label, value: count })
    }
    return result
  }

  function groupByMonth(items, months) {
    const result = []
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
      const count = items.filter(item => {
        const id = new Date(item.created_at)
        return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear()
      }).length
      result.push({ label, value: count })
    }
    return result
  }

  const chartData = range === 'week' ? groupByDay(intakes, 7)
    : range === 'month' ? groupByDay(intakes, 30)
    : groupByMonth(intakes, 12)

  const maxVal = Math.max(...chartData.map(d => d.value), 1)

  // Risk breakdown
  const high = intakes.filter(i => i.risk_level === 'high').length
  const medium = intakes.filter(i => i.risk_level === 'medium').length
  const low = intakes.filter(i => i.risk_level === 'low').length
  const total = intakes.length

  // Recent 7 vs previous 7
  const now = new Date()
  const last7 = intakes.filter(i => new Date(i.created_at) >= new Date(now - 7 * 86400000)).length
  const prev7 = intakes.filter(i => {
    const d = new Date(i.created_at)
    return d >= new Date(now - 14 * 86400000) && d < new Date(now - 7 * 86400000)
  }).length
  const trend = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100)

  // Severity breakdown
  const severe = intakes.filter(i => i.severity === 'severe').length
  const moderate = intakes.filter(i => i.severity === 'moderate').length
  const mild = intakes.filter(i => i.severity === 'mild').length

  // Avg risk score
  const avgScore = total > 0 ? Math.round(intakes.reduce((s, i) => s + (i.risk_score || 0), 0) / total) : 0

  const statCard = (label, value, sub, color) => (
    <div className="stat-card">
      <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(103,232,249,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
      <p style={{ fontSize: '28px', fontWeight: 900, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.35)' }}>{sub}</p>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#020617' }}>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 16px' }}>

        {/* Header */}
        <div className="animate-slide-up" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#0E7490,#0891B2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.4)' }}>
              <BarChart2 style={{ width: '18px', height: '18px', color: '#67E8F9' }} />
            </div>
            <div>
              <h1 className="section-title">Intake Analytics</h1>
              <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.45)', marginTop: '2px' }}>Trends, risk distribution and patient activity</p>
            </div>
          </div>
        </div>

        {/* KPI stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }} className="animate-stagger">
          {statCard('Total Intakes', total, 'All time', '#E0F7FF')}
          {statCard('High Risk', high, `${total > 0 ? Math.round(high/total*100) : 0}% of total`, '#F87171')}
          {statCard('Avg Risk Score', avgScore, 'Out of 100', '#22D3EE')}
          {statCard('Last 7 Days', last7, trend !== null ? `${trend > 0 ? '+' : ''}${trend}% vs prev week` : 'vs prev week', trend > 0 ? '#FCA5A5' : trend < 0 ? '#6EE7B7' : '#E0F7FF')}
        </div>

        {/* Main chart */}
        <div className="card animate-fade-in" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#E0F7FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity style={{ width: '16px', height: '16px', color: '#22D3EE' }} />
              Intake Volume
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[['week','7 Days'],['month','30 Days'],['year','12 Months']].map(([key, label]) => (
                <button key={key} onClick={() => setRange(key)}
                  style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                    background: range === key ? 'rgba(34,211,238,0.2)' : 'rgba(8,145,178,0.08)',
                    color: range === key ? '#22D3EE' : 'rgba(103,232,249,0.4)',
                    outline: range === key ? '1px solid rgba(34,211,238,0.35)' : '1px solid rgba(8,145,178,0.12)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'rgba(103,232,249,0.3)', fontSize: '13px' }}>Loading…</p>
            </div>
          ) : (
            <BarChart data={chartData} maxVal={maxVal} color="linear-gradient(180deg,#22D3EE,#0891B2)" />
          )}
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }} className="animate-stagger">

          {/* Risk distribution */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#E0F7FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 style={{ width: '14px', height: '14px', color: '#22D3EE' }} /> Risk Distribution
            </h3>
            {[
              { label: 'High Risk', count: high, color: '#F87171', bg: 'rgba(248,113,113,0.15)', pct: total > 0 ? Math.round(high/total*100) : 0 },
              { label: 'Medium Risk', count: medium, color: '#22D3EE', bg: 'rgba(34,211,238,0.15)', pct: total > 0 ? Math.round(medium/total*100) : 0 },
              { label: 'Low Risk', count: low, color: '#34D399', bg: 'rgba(52,211,153,0.15)', pct: total > 0 ? Math.round(low/total*100) : 0 },
            ].map(({ label, count, color, bg, pct }) => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(165,243,252,0.65)' }}>{label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color }}>{count} <span style={{ fontWeight: 400, color: 'rgba(103,232,249,0.35)' }}>({pct}%)</span></span>
                </div>
                <div style={{ height: '6px', background: 'rgba(8,145,178,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.7s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Severity */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#E0F7FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp style={{ width: '14px', height: '14px', color: '#22D3EE' }} /> Severity Breakdown
            </h3>
            {[
              { label: 'Severe', count: severe, color: '#F87171', pct: total > 0 ? Math.round(severe/total*100) : 0 },
              { label: 'Moderate', count: moderate, color: '#FCD34D', pct: total > 0 ? Math.round(moderate/total*100) : 0 },
              { label: 'Mild', count: mild, color: '#34D399', pct: total > 0 ? Math.round(mild/total*100) : 0 },
            ].map(({ label, count, color, pct }) => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(165,243,252,0.65)' }}>{label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color }}>{count} <span style={{ fontWeight: 400, color: 'rgba(103,232,249,0.35)' }}>({pct}%)</span></span>
                </div>
                <div style={{ height: '6px', background: 'rgba(8,145,178,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.7s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Weekly trend */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#E0F7FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar style={{ width: '14px', height: '14px', color: '#22D3EE' }} /> Weekly Trend
            </h3>
            {groupByWeek(intakes, 4).map(({ label, value }, i, arr) => {
              const prev = arr[i - 1]?.value || 0
              const up = value > prev
              const down = value < prev
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(8,145,178,0.1)' : 'none' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(165,243,252,0.5)', fontWeight: 600 }}>w/o {label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#E0F7FF' }}>{value}</span>
                    {i > 0 && (up ? <TrendingUp style={{ width: '12px', height: '12px', color: '#F87171' }} /> : down ? <TrendingDown style={{ width: '12px', height: '12px', color: '#34D399' }} /> : null)}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </main>
    </div>
  )
}
