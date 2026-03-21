import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import MobileNav from '../../components/MobileNav'
import { useToast } from '../../context/ToastContext'
import { SkeletonList } from '../../components/Skeleton'
import { InlineSpinner } from '../../components/LoadingSpinner'
import { Syringe, Plus, Trash2, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const COMMON_VACCINES = [
  'COVID-19', 'Influenza (Flu)', 'Hepatitis B', 'Hepatitis A',
  'Tetanus (Td/Tdap)', 'MMR (Measles, Mumps, Rubella)',
  'Typhoid', 'Polio', 'Chickenpox (Varicella)',
  'HPV', 'Pneumococcal', 'Meningococcal', 'Other'
]

export default function Vaccinations() {
  const { profile } = useAuth()
  const toast = useToast()
  const [vaccinations, setVaccinations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    vaccine_name: '', dose: '', date_given: '', next_due_date: '', given_by: '', notes: ''
  })

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    const { data } = await supabase
      .from('vaccinations').select('*')
      .eq('patient_id', profile.id)
      .order('date_given', { ascending: false })
    setVaccinations(data || [])
    setLoading(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('vaccinations').insert({ ...form, patient_id: profile.id })
    if (error) { toast.error('Failed to save vaccination.') }
    else {
      toast.success('Vaccination record added!')
      setForm({ vaccine_name: '', dose: '', date_given: '', next_due_date: '', given_by: '', notes: '' })
      setShowForm(false)
      load()
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    await supabase.from('vaccinations').delete().eq('id', id)
    toast.success('Record deleted.')
    setVaccinations(v => v.filter(x => x.id !== id))
  }

  const upcoming = vaccinations.filter(v => v.next_due_date && new Date(v.next_due_date) >= new Date())
  const overdue = vaccinations.filter(v => v.next_due_date && new Date(v.next_due_date) < new Date())

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="section-title flex items-center gap-3">
              <Syringe className="w-6 h-6 text-violet-400" /> Vaccination Records
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track your immunization history</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>

        {/* Due soon alerts */}
        {upcoming.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-5 animate-fade-in">
            <p className="text-amber-300 font-semibold text-sm flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" /> Upcoming Doses
            </p>
            {upcoming.map(v => (
              <p key={v.id} className="text-amber-400/80 text-xs">
                • {v.vaccine_name} {v.dose && `(${v.dose})`} — due {new Date(v.next_due_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            ))}
          </div>
        )}
        {overdue.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-5 animate-fade-in">
            <p className="text-red-300 font-semibold text-sm flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" /> Overdue
            </p>
            {overdue.map(v => (
              <p key={v.id} className="text-red-400/80 text-xs">
                • {v.vaccine_name} {v.dose && `(${v.dose})`} — was due {new Date(v.next_due_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            ))}
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="font-display font-semibold text-white mb-4">New Vaccination Record</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Vaccine Name <span className="text-red-400">*</span></label>
                  <select className="input" value={form.vaccine_name} onChange={e => setForm(f => ({ ...f, vaccine_name: e.target.value }))} required>
                    <option value="">Select vaccine</option>
                    {COMMON_VACCINES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Dose</label>
                  <input className="input" type="text" placeholder="e.g. 1st dose, Booster" value={form.dose} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Date Given <span className="text-red-400">*</span></label>
                  <input className="input" type="date" max={new Date().toISOString().split('T')[0]} value={form.date_given} onChange={e => setForm(f => ({ ...f, date_given: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Next Due Date</label>
                  <input className="input" type="date" value={form.next_due_date} onChange={e => setForm(f => ({ ...f, next_due_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Given By (Doctor / Hospital)</label>
                <input className="input" type="text" placeholder="e.g. Dr. Sharma, City Hospital" value={form.given_by} onChange={e => setForm(f => ({ ...f, given_by: e.target.value }))} />
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" type="text" placeholder="Any side effects or additional info…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5" disabled={saving}>
                  {saving ? <><InlineSpinner />Saving…</> : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records */}
        {loading ? <SkeletonList count={3} /> : vaccinations.length === 0 ? (
          <div className="card p-12 text-center">
            <Syringe className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No vaccination records yet</p>
            <p className="text-slate-600 text-sm mt-1">Add your immunization history to keep it on record.</p>
          </div>
        ) : (
          <div className="space-y-3 animate-stagger">
            {vaccinations.map(v => (
              <div key={v.id} className="card p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-violet-500/15 border border-violet-500/25 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Syringe className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{v.vaccine_name}</p>
                      {v.dose && <span className="text-xs bg-violet-500/15 text-violet-400 border border-violet-500/25 px-2 py-0.5 rounded-full">{v.dose}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(v.date_given).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                      {v.given_by && <span>by {v.given_by}</span>}
                    </div>
                    {v.next_due_date && (
                      <p className={`text-xs mt-1 flex items-center gap-1 ${new Date(v.next_due_date) < new Date() ? 'text-red-400' : 'text-amber-400'}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(v.next_due_date) < new Date() ? 'Overdue: ' : 'Next due: '}
                        {new Date(v.next_due_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                    )}
                    {!v.next_due_date && (
                      <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Complete
                      </p>
                    )}
                    {v.notes && <p className="text-xs text-slate-500 mt-1 italic">{v.notes}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}
