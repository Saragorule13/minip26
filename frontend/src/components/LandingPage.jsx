import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── tiny SVG helpers ── */
const ShieldIcon = ({ className = '' }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
)

const ClockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
    </svg>
)

const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
)

const BrainIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44A2.5 2.5 0 0 1 4.5 14a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 2.54-4.54A2.5 2.5 0 0 1 9.5 2z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44A2.5 2.5 0 0 0 19.5 14a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0-2.54-4.54A2.5 2.5 0 0 0 14.5 2z" />
    </svg>
)

const UsersIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)

const ShareIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
)

const WrenchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
)

/* ── TrustGauge – animated SVG ring ── */
function TrustGauge() {
    const circleRef = useRef(null)

    useEffect(() => {
        const el = circleRef.current
        if (!el) return
        // circumference of r=70 ≈ 439.82
        const circ = 2 * Math.PI * 70
        const target = circ * (1 - 0.89)          // show 89 %
        el.style.transition = 'none'
        el.style.strokeDashoffset = circ
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)'
                el.style.strokeDashoffset = target
            })
        })
    }, [])

    const circ = 2 * Math.PI * 70

    return (
        <div className="relative flex items-center justify-center w-52 h-52 shrink-0">
            {/* outer decorative ring that spins */}
            <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-spin"
                style={{ animationDuration: '20s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
            </div>

            {/* SVG gauge */}
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_18px_rgba(37,106,244,0.65)]"
                viewBox="0 0 160 160">
                <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1d4ed8" />
                        <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                </defs>
                {/* track */}
                <circle cx="80" cy="80" r="70" fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="11"
                    strokeDasharray={circ} strokeDashoffset="0" strokeLinecap="round" />
                {/* progress */}
                <circle ref={circleRef} cx="80" cy="80" r="70" fill="none"
                    stroke="url(#gaugeGrad)" strokeWidth="11"
                    strokeDasharray={circ} strokeDashoffset={circ}
                    strokeLinecap="round" />
            </svg>

            {/* center label */}
            <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-black tracking-tighter text-white leading-none">89</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mt-1">Trust Score</span>
            </div>
        </div>
    )
}

/* ── Threat Card ── */
function ThreatCard({ icon, title, body, tag, tagColor }) {
    const colors = {
        red: 'text-red-400 bg-red-400/10',
        yellow: 'text-yellow-400 bg-yellow-400/10',
        green: 'text-emerald-400 bg-emerald-400/10',
    }
    return (
        <div className="group p-8 rounded-2xl bg-[#0d0f1e] border border-white/[0.07]
      hover:border-purple-500/40 hover:-translate-y-1
      transition-all duration-300 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20
        flex items-center justify-center mb-5 text-purple-300
        group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-base font-bold mb-3">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">{body}</p>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase
        tracking-widest px-2 py-1 rounded ${colors[tagColor]}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {tag}
            </span>
        </div>
    )
}

/* ── Feature Card for dashboard ── */
function FeatureCard({ icon, title, body, align = 'left' }) {
    return (
        <div className={`bg-[#10132a] border border-white/[0.07] rounded-2xl p-5
      hover:border-blue-500/30 transition-all duration-300
      ${align === 'left' ? 'hover:-translate-x-1' : 'hover:translate-x-1'}`}>
            <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 bg-blue-500/15 rounded-lg flex items-center
          justify-center text-blue-400 shrink-0">
                    {icon}
                </div>
                <h4 className="text-sm font-bold">{title}</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
        </div>
    )
}

/* ══ MAIN COMPONENT ══ */
export default function LandingPage() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-[#06070f] text-white font-['Inter',sans-serif]
      selection:bg-blue-500/30 overflow-x-hidden">

            {/* ambient glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px]
        bg-[radial-gradient(ellipse_at_center,rgba(37,106,244,0.09)_0%,transparent_70%)]
        pointer-events-none" />

            {/* ── NAV ── */}
            <header className="sticky top-0 z-50 border-b border-white/[0.07]
        bg-[#06070f]/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 h-15 flex items-center justify-between h-[60px]">
                    {/* logo */}
                    <a href="#" className="flex items-center gap-2 font-bold text-sm text-white no-underline">
                        <ShieldIcon className="text-blue-400" />
                        Dynamic Trust
                    </a>

                    {/* nav links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
                        {['Platform', 'Solutions', 'Intelligence', 'Docs'].map(l => (
                            <a key={l} href="#"
                                className="hover:text-white transition-colors duration-200 no-underline">{l}</a>
                        ))}
                    </nav>

                    {/* actions */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/auth')}
                            className="text-sm font-medium text-slate-400 hover:text-white
                          px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                            Log In
                        </button>
                        <button onClick={() => navigate('/auth')}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-sm
                          font-semibold px-4 py-2 rounded-lg transition-all
                          hover:shadow-[0_0_20px_rgba(59,130,246,0.45)]">
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            <main>
                {/* ── SECTION 1: THE PROBLEM ── */}
                <section className="relative py-24 px-8">
                    {/* bg blob */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
            bg-[radial-gradient(ellipse,rgba(168,85,247,0.1)_0%,transparent_70%)]
            pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        {/* heading */}
                        <div className="text-center mb-16">
                            <span className="text-[11px] font-bold uppercase tracking-[0.18em]
                text-indigo-400 mb-4 block">
                                Risk Assessment Phase
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6
                bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent
                leading-tight max-w-3xl mx-auto">
                                The Open-Source Trust Problem
                            </h1>
                            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
                                Modern software is built on thousands of invisible threads.
                                One broken link can compromise your entire infrastructure.
                            </p>
                        </div>

                        {/* cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <ThreatCard
                                icon={<ShieldIcon className="w-4.5 h-4.5" />}
                                title="Dependency Attacks"
                                body="Detect supply chain poisoning and malicious code injections targeting your upstream dependencies in real-time."
                                tag="High Risk Vector"
                                tagColor="red"
                            />
                            <ThreatCard
                                icon={<ClockIcon />}
                                title="Abandoned Packages"
                                body="Identify unmaintained code rot and high-risk legacy dependencies that have been left without security patches."
                                tag="Maintainer Fatigue"
                                tagColor="yellow"
                            />
                            <ThreatCard
                                icon={<EyeOffIcon />}
                                title="Hidden Vulnerabilities"
                                body="Surface zero-day threats and obfuscated vulnerabilities using proprietary AI pattern matching and behavioral scanning."
                                tag="Deep Scan Active"
                                tagColor="green"
                            />
                        </div>
                    </div>
                </section>

                {/* divider */}
                <div className="max-w-7xl mx-auto px-8">
                    <div className="border-t border-white/[0.07]" />
                </div>

                {/* ── SECTION 2: TRUST ENGINE ── */}
                <section className="relative py-24 px-8">
                    <div className="absolute bottom-0 right-0 w-[600px] h-[500px]
            bg-[radial-gradient(ellipse,rgba(37,106,244,0.09)_0%,transparent_70%)]
            pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        {/* heading */}
                        <div className="text-center mb-16">
                            <span className="text-[11px] font-bold uppercase tracking-[0.18em]
                text-blue-400 mb-4 block">
                                Real-Time Intelligence
                            </span>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-5">
                                Our Intelligent Trust Engine
                            </h2>
                            <p className="text-slate-400 text-base max-w-md mx-auto">
                                Quantum-grade analysis that turns uncertainty into actionable safety scores.
                            </p>
                        </div>

                        {/* dashboard */}
                        <div className="bg-[#0d0f1e] border border-white/[0.07] rounded-3xl
              p-10 md:p-14 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10
              items-center">
                            {/* left features */}
                            <div className="flex flex-col gap-4">
                                <FeatureCard
                                    icon={<BrainIcon />}
                                    title="AI Risk Analysis"
                                    body="Continuous monitoring of code commit patterns to predict future vulnerabilities before they manifest."
                                    align="left"
                                />
                                <FeatureCard
                                    icon={<UsersIcon />}
                                    title="Maintainer Monitoring"
                                    body="Behavioral analysis of repository contributors to detect account takeovers and social engineering."
                                    align="left"
                                />
                            </div>

                            {/* center gauge */}
                            <div className="flex justify-center">
                                <TrustGauge />
                            </div>

                            {/* right features */}
                            <div className="flex flex-col gap-4">
                                <FeatureCard
                                    icon={<ShareIcon />}
                                    title="Dependency Mapping"
                                    body="Full recursive graph analysis to identify transitively dangerous sub-dependencies."
                                    align="right"
                                />
                                <FeatureCard
                                    icon={<WrenchIcon />}
                                    title="Auto-Remediation"
                                    body="Integrated CI/CD patches that swap risky packages for verified alternatives automatically."
                                    align="right"
                                />
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-14">
                            <button onClick={() => navigate('/auth')}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold
                              px-8 py-4 rounded-xl text-base transition-all
                              hover:shadow-[0_0_30px_rgba(59,130,246,0.45)]
                              hover:scale-105 active:scale-95">
                                Secure Your Pipeline Now
                            </button>
                            <button className="text-slate-400 hover:text-white font-semibold
                text-base flex items-center gap-1 transition-colors bg-transparent border-0 cursor-pointer">
                                Read the Whitepaper <span className="ml-1">→</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── TRUSTED BY ── */}
                <section className="border-t border-white/[0.07] py-16 px-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-10">
                            Trusted by Global Infrastructure Leaders
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16
              opacity-30 hover:opacity-60 transition-opacity duration-500">
                            {[
                                { name: 'CLOUD-X', cls: 'italic' },
                                { name: 'SECURE.IO', cls: '' },
                                { name: 'DATACORE', cls: '' },
                                { name: 'PHOENIX', cls: 'italic tracking-widest' },
                                { name: 'NEXUS', cls: '' },
                                { name: 'VORTEX', cls: '' },
                            ].map(({ name, cls }) => (
                                <span key={name}
                                    className={`text-xl font-black tracking-tight text-white select-none ${cls}`}>
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/[0.07] px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row
          items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                        <ShieldIcon className="text-blue-500 w-4 h-4" />
                        Dynamic Trust Scoring
                    </div>
                    <span className="text-slate-500 text-xs">
                        © 2024 Dynamic Trust Scoring Engine. All rights reserved.
                    </span>
                    <div className="flex items-center gap-4 text-slate-500">
                        {/* Globe */}
                        <svg className="w-4 h-4 hover:text-slate-300 transition-colors cursor-pointer"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        {/* Code */}
                        <svg className="w-4 h-4 hover:text-slate-300 transition-colors cursor-pointer"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                        </svg>
                        {/* GitHub */}
                        <svg className="w-4 h-4 hover:text-slate-300 transition-colors cursor-pointer"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                        </svg>
                    </div>
                </div>
            </footer>
        </div>
    )
}
