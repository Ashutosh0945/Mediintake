import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  }

  const styles = {
    success: { bg: 'bg-emerald-500/15 border-emerald-500/40', text: 'text-emerald-300', icon: CheckCircle, iconColor: 'text-emerald-400' },
    error:   { bg: 'bg-red-500/15 border-red-500/40',         text: 'text-red-300',     icon: XCircle,     iconColor: 'text-red-400' },
    warning: { bg: 'bg-amber-500/15 border-amber-500/40',     text: 'text-amber-300',   icon: AlertCircle, iconColor: 'text-amber-400' },
    info:    { bg: 'bg-blue-500/15 border-blue-500/40',       text: 'text-blue-300',    icon: Info,        iconColor: 'text-blue-400' },
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const s = styles[t.type] || styles.info
          const Icon = s.icon
          return (
            <div key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${s.bg} animate-slide-up`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${s.iconColor}`} />
              <p className={`text-sm font-medium flex-1 ${s.text}`}>{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="text-slate-500 hover:text-slate-300 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
