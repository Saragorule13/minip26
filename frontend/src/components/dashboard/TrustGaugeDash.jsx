/* Animated trust score ring for the dashboard */
import { useEffect, useRef } from 'react'

export default function TrustGaugeDash({ score = 89 }) {
    const ref = useRef(null)
    const circ = 2 * Math.PI * 54

    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.transition = 'none'
        el.style.strokeDashoffset = circ
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.34,1.2,0.64,1)'
            el.style.strokeDashoffset = circ * (1 - score / 100)
        }))
    }, [score, circ])

    const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171'
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Moderate' : 'At Risk'

    return (
        <div className="relative w-36 h-36 flex items-center justify-center">
            {/* spinning ring */}
            <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-spin"
                style={{ animationDuration: '25s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500
          shadow-[0_0_8px_#3b82f6]" />
            </div>
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_14px_rgba(37,106,244,0.5)]"
                viewBox="0 0 120 120">
                <defs>
                    <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1d4ed8" />
                        <stop offset="100%" stopColor={color} />
                    </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="54" fill="none"
                    stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
                <circle ref={ref} cx="60" cy="60" r="54" fill="none"
                    stroke="url(#dashGrad)" strokeWidth="9"
                    strokeDasharray={circ} strokeDashoffset={circ}
                    strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white leading-none">{score}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-1"
                    style={{ color }}>{label}</span>
            </div>
        </div>
    )
}
