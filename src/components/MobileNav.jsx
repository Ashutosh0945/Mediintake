import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, PlusCircle, MapPin, Bell, User } from 'lucide-react'

export default function MobileNav({ unreadCount = 0 }) {
  const { isAdmin } = useAuth()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  if (isAdmin) return null

  const links = [
    { to: '/dashboard',         label: 'Home',      icon: LayoutDashboard },
    { to: '/new-intake',        label: 'Intake',    icon: PlusCircle },
    { to: '/hospitals-near-me', label: 'Hospitals', icon: MapPin },
    { to: '/notifications',     label: 'Alerts',    icon: Bell, badge: unreadCount },
    { to: '/medical-profile',   label: 'Profile',   icon: User },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ to, label, icon: Icon, badge }) => (
          <Link key={to} to={to}
            className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              isActive(to) ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{label}</span>
            {isActive(to) && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-400 rounded-full" />}
          </Link>
        ))}
      </div>
    </nav>
  )
}
