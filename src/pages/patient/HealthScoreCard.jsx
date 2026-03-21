import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import MobileNav from '../../components/MobileNav'
import { SkeletonStat } from '../../components/Skeleton'
import { Activity, Heart, Shield, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

function ScoreRing({ score, size = 120 }) {
  const r = 45
  const circ = 2 * Math.PI * r
  const progress = (score / 100) * circ
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <p className="font-display font-bold text-2xl text-white">{score}</p>
        <p className="text-xs text-slate-500">/ 100</p>
      </div>
    </div>
  )
}

export default function HealthScoreCard() {
  const { profile } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) load()
  }, [profile])

  async function load() {
    const [{ data: intakes }, { data: medProfile }, { data: vaccinations }, { data: appointments }] = await Promise.all([
      supabase.from('intakes').select('*').eq('patient_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('medical_profiles').select('*').eq('patient_id', profile.id).single(),
      supabase.from('vaccinations').select('*').eq('patient_id', profile.id),
      supabase.from('appointments').select('*').eq('patient_id', profile.id),
    ])
    setData({ intakes: intakes || [], medProfile, vaccinations: vaccinations || [], appointments: appointments || [] })
    setLoading(false)
  }

  function calculateScore(data) {
    const { intakes, medProfile, vaccinations } = data
    let score = 100
    const breakdown = []

    // Recent high-risk intakes reduce score
    const recentHighRisk = intakes.filter(i => i.risk_level === 'high' && new Date(i.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    if (recentHighRisk.length > 0) {
      const deduct = Math.min(recentHighRisk.length * 15, 30)
      score -= deduct
      breakdown.push({ label: 'Recent high-risk intakes', impact: -deduct, icon: AlertTriangle, color: 'text-red-400' })
    }

    // Chronic conditions reduce score
    const conditions = medProfile?.chronic_conditions?.length || 0
    if (conditions > 0) {
      const deduct = Math.min(conditions * 8, 25)
      score -= deduct
      breakdown.push({ label: `${conditions} chronic condition${conditions > 1 ? 's' : ''}`, impact: -deduct, icon: Heart, color: 'text-amber-400' })
    }

    // Medical profile complete = bonus
    if (medProfile) {
      score += 5
      breakdown.push({ label: 'Medical profile complete', impact: +5, icon: CheckCircle, color: 'text-emerald-400' })
    }

    // Vaccinations = bonus
    if (vaccinations.length > 0) {
      const bonus = Math.min(vaccinations.length * 2, 10)
      score += bonus
      breakdown.push({ label: `${vaccinations.length} vaccination records`, impact: +bonus, icon: Shield, color: 'text-violet-400' })
    }

    // Overdue vaccinations reduce score
    const overdue = vaccinations.filter(v => v.next_due_date && new Date(v.next_due_date) < new Date())
    if (overdue.length > 0) {
      score -= overdue.length * 5
      breakdown.push({ label: `${overdue.length} overdue vaccine${overdue.length > 1 ? 's' : ''}`, impact: -(overdue.length * 5), icon: AlertTriangle, color: 'text-red-400' })
    }

    // Reviewed intakes = engaged with healthcare
    const reviewed = intakes.filter(i => i.status === 'reviewed').length
    if (reviewed > 0) {
      score += 3
      breakdown.push({ label: 'Intakes reviewed by doctor', impact: +3, icon: Activity, color: 'text-teal-400' })
    }

    score = Math.max(0, Math.min(100, Math.round(score)))
    const level = score >= 70 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention'
    const color = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'
    return { score, level, color, breakdown }
  }

  const result = data ? calculateScore(data) : null
  const totalIntakes = data?.intakes.length || 0
  const recentIntake = data?.intakes[0]
  const prevIntake = data?.intakes[1]
  const trend = recentIntake && prevIntake
    ? recentIntake.risk_score < prevIntake.risk_score ? 'improving'
    : recentIntake.risk_score > prevIntake.risk_score ? 'worsening' : 'stable'
    : null

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 animate-slide-up">
          <h1 className="section-title flex items-center gap-3">
            <Activity className="w-6 h-6 text-teal-400" /> Health Score Card
          </h1>
          <p className="text-slate-400 text-sm mt-1">A summary of your overall health based on your records</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <SkeletonStat key={i} />)}
          </div>
        ) : (
          <>
            {/* Main score */}
            <div className="card p-8 mb-6 animate-slide-up flex flex-col sm:flex-row items-center gap-8">
              <ScoreRing score={result.score} size={140} />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-slate-400 text-sm mb-1">Overall Health Score</p>
                <p className={`font-display text-4xl font-bold mb-2 ${result.color}`}>{result.level}</p>
                <p className="text-slate-500 text-sm">
                  Based on {totalIntakes} intake{totalIntakes !== 1 ? 's' : ''}, medical profile, and vaccination records.
                </p>
                {trend && (
                  <div className={`inline-flex items-center gap-1.5 mt-3 text-sm font-medium px-3 py-1 rounded-full ${
                    trend === 'improving' ? 'bg-emerald-500/15 text-emerald-400' :
                    trend === 'worsening' ? 'bg-red-500/15 text-red-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {trend === 'improving' ? <TrendingDown className="w-4 h-4" /> :
                     trend === 'worsening' ? <TrendingUp className="w-4 h-4" /> :
                     <Minus className="w-4 h-4" />}
                    Risk trend: {trend}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-stagger">
              <div className="stat-card">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Intakes</p>
                <p className="font-display text-3xl font-bold text-white">{totalIntakes}</p>
              </div>
              <div className="stat-card">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Vaccines</p>
                <p className="font-display text-3xl font-bold text-violet-400">{data.vaccinations.length}</p>
              </div>
              <div className="stat-card">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Conditions</p>
                <p className="font-display text-3xl font-bold text-amber-400">{data.medProfile?.chronic_conditions?.length || 0}</p>
              </div>
              <div className="stat-card">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Appointments</p>
                <p className="font-display text-3xl font-bold text-teal-400">{data.appointments.length}</p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-semibold text-white mb-4">Score Breakdown</h2>
              {result.breakdown.length === 0 ? (
                <p className="text-slate-500 text-sm">No data yet — complete your medical profile and add intakes to see your breakdown.</p>
              ) : (
                <div className="space-y-3">
                  {result.breakdown.map((item, i) => {
                    const Icon = item.icon
                    return (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                          <span className="text-sm text-slate-300">{item.label}</span>
                        </div>
                        <span className={`text-sm font-bold ${item.impact > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.impact > 0 ? '+' : ''}{item.impact}
                        </span>
                      </div>
                    )
                  })}
                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Final Score</span>
                    <span className={`text-lg font-bold font-display ${result.color}`}>{result.score} / 100</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <MobileNav />
    </div>
  )
}
