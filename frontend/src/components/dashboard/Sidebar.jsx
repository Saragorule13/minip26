import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const ShieldIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
)

const navItems = [
    {
        label: 'Overview', path: '/dashboard',
        icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    },
    {
        label: 'Packages', path: '/dashboard/packages',
        icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>,
    },
    {
        label: 'Vulnerabilities', path: '/dashboard/vulns',
        icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    },
    {
        label: 'Maintainers', path: '/dashboard/maintainers',
        icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
        label: 'Remediation', path: '/dashboard/remediation',
        icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 13 9 20 9" /><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" /><polygon points="18 2 22 6 12 16 8 16 8 12 18 2" /></svg>,
    },
    {
        label: 'Reports', path: '/dashboard/reports',
        icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    },
    {
        label: 'Settings', path: '/dashboard/settings',
        icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    },
]

export default function Sidebar({ user }) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    return (
        <aside className="fixed top-0 left-0 h-screen w-60 bg-[#080a18] border-r border-white/[0.07]
      flex flex-col z-40">
            {/* Logo */}
            <div className="h-[60px] flex items-center gap-2.5 px-5 border-b border-white/[0.07]">
                <span className="text-blue-400"><ShieldIcon /></span>
                <span className="text-sm font-bold">Dynamic Trust</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-3">Main</p>
                {navItems.slice(0, 5).map(item => {
                    const active = location.pathname === item.path
                    return (
                        <button key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                font-medium transition-all cursor-pointer border-0 text-left
                ${active
                                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 bg-transparent'}`}>
                            {item.icon}
                            {item.label}
                            {item.label === 'Vulnerabilities' && (
                                <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold
                  px-1.5 py-0.5 rounded-full">37</span>
                            )}
                        </button>
                    )
                })}

                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mt-5 mb-3">System</p>
                {navItems.slice(5).map(item => {
                    const active = location.pathname === item.path
                    return (
                        <button key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                font-medium transition-all cursor-pointer border-0 text-left
                ${active
                                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 bg-transparent'}`}>
                            {item.icon}
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            {/* User foot */}
            <div className="px-3 py-4 border-t border-white/[0.07]">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5
          transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30
            flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                        {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">
                            {user?.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button onClick={handleSignOut}
                        title="Sign out"
                        className="text-slate-600 hover:text-red-400 transition-colors
              bg-transparent border-0 cursor-pointer shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    )
}
