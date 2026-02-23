import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Sidebar from './Sidebar'
import StatsCard from './StatsCard'
import ThreatTable from './ThreatTable'
import TrustGaugeDash from './TrustGaugeDash'

/* ── tiny sparkline ── */
function Sparkline({ data, color = '#3b82f6' }) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const h = 40, w = 120
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - ((v - min) / (max - min || 1)) * h
        return `${x},${y}`
    }).join(' ')
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <defs>
                <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" points={pts} />
        </svg>
    )
}

/* ── bar chart (last 7 days) ── */
function BarChart({ data, color }) {
    const max = Math.max(...data.map(d => d.value))
    return (
        <div className="flex items-end gap-1.5 h-24">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full rounded-t-md transition-all duration-500"
                        style={{
                            height: `${(d.value / max) * 80}px`,
                            background: `${color}`,
                            opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.5,
                        }} />
                    <span className="text-[9px] text-slate-600">{d.label}</span>
                </div>
            ))}
        </div>
    )
}

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) {
                navigate('/auth')
            } else {
                setUser(data.user)
            }
            setLoading(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') navigate('/auth')
            if (session?.user) setUser(session.user)
        })
        return () => listener.subscription.unsubscribe()
    }, [navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#06070f] flex items-center justify-center">
                <svg className="w-8 h-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            </div>
        )
    }

    /* ── mock data ── */
    const stats = [
        { label: 'Trust Score', value: '89', unit: '/100', delta: '+3', up: true, color: '#3b82f6', spark: [72, 75, 78, 76, 81, 85, 89] },
        { label: 'Packages Scanned', value: '2,418', unit: '', delta: '+124', up: true, color: '#34d399', spark: [1800, 1950, 2050, 2100, 2200, 2310, 2418] },
        { label: 'Vulnerabilities Found', value: '37', unit: '', delta: '-8', up: false, color: '#f87171', spark: [60, 55, 50, 48, 45, 42, 37] },
        { label: 'Auto-Remediated', value: '29', unit: '', delta: '+6', up: true, color: '#a78bfa', spark: [12, 15, 18, 20, 22, 25, 29] },
    ]

    const weekBars = [
        { label: 'Mon', value: 12 }, { label: 'Tue', value: 19 }, { label: 'Wed', value: 8 },
        { label: 'Thu', value: 24 }, { label: 'Fri', value: 17 }, { label: 'Sat', value: 6 },
        { label: 'Sun', value: 37 },
    ]

    const severityBars = [
        { label: 'Critical', value: 4, color: '#f87171' },
        { label: 'High', value: 11, color: '#fb923c' },
        { label: 'Medium', value: 16, color: '#fbbf24' },
        { label: 'Low', value: 6, color: '#34d399' },
    ]

    return (
        <div className="min-h-screen bg-[#06070f] text-white font-['Inter',sans-serif] flex">
            {/* ambient */}
            <div className="fixed top-0 left-1/3 w-[600px] h-[400px]
        bg-[radial-gradient(ellipse_at_center,rgba(37,106,244,0.07)_0%,transparent_70%)]
        pointer-events-none z-0" />

            <Sidebar user={user} />

            {/* ── MAIN ── */}
            <div className="flex-1 flex flex-col min-w-0 ml-60">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-[60px] border-b border-white/[0.07]
          bg-[#06070f]/90 backdrop-blur-xl flex items-center justify-between px-8">
                    <div>
                        <h1 className="text-base font-bold">Dashboard</h1>
                        <p className="text-xs text-slate-500">
                            Welcome back, <span className="text-slate-300">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                            </span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Notification bell */}
                        <button className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10
              border border-white/[0.07] flex items-center justify-center text-slate-400
              hover:text-white transition-all cursor-pointer">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        </button>
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30
              flex items-center justify-center text-blue-400 text-sm font-bold">
                            {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-8 space-y-8 overflow-auto relative z-10">

                    {/* ── STATS ROW ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {stats.map(s => <StatsCard key={s.label} {...s} />)}
                    </div>

                    {/* ── ROW 2: Gauge + Bar Charts ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Trust Score Gauge */}
                        <div className="bg-[#0d0f1e] border border-white/[0.07] rounded-2xl p-6 flex flex-col">
                            <h2 className="text-sm font-bold mb-1">Trust Score</h2>
                            <p className="text-xs text-slate-500 mb-6">Live security posture</p>
                            <div className="flex-1 flex items-center justify-center">
                                <TrustGaugeDash score={89} />
                            </div>
                        </div>

                        {/* Vulnerability trend */}
                        <div className="bg-[#0d0f1e] border border-white/[0.07] rounded-2xl p-6">
                            <h2 className="text-sm font-bold mb-1">Detections This Week</h2>
                            <p className="text-xs text-slate-500 mb-4">Vulnerabilities found per day</p>
                            <BarChart data={weekBars} color="#3b82f6" />
                        </div>

                        {/* Severity breakdown */}
                        <div className="bg-[#0d0f1e] border border-white/[0.07] rounded-2xl p-6">
                            <h2 className="text-sm font-bold mb-1">Severity Breakdown</h2>
                            <p className="text-xs text-slate-500 mb-5">Open issues by level</p>
                            <div className="space-y-3">
                                {severityBars.map(b => {
                                    const pct = Math.round((b.value / 37) * 100)
                                    return (
                                        <div key={b.label}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium" style={{ color: b.color }}>{b.label}</span>
                                                <span className="text-xs text-slate-400">{b.value}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%`, background: b.color }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── ROW 3: Threat Table ── */}
                    <ThreatTable />

                </main>
            </div>
        </div>
    )
}
