export default function StatsCard({ label, value, unit, delta, up, color, spark }) {
    const max = Math.max(...spark)
    const min = Math.min(...spark)
    const w = 120, h = 40
    const pts = spark.map((v, i) => {
        const x = (i / (spark.length - 1)) * w
        const y = h - ((v - min) / (max - min || 1)) * h
        return `${x},${y}`
    }).join(' ')

    return (
        <div className="bg-[#0d0f1e] border border-white/[0.07] rounded-2xl p-5
      hover:border-white/15 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-white">{value}</span>
                        {unit && <span className="text-sm text-slate-500 mb-0.5">{unit}</span>}
                    </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1
          ${up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {up ? '↑' : '↓'} {delta}
                </span>
            </div>
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full h-10">
                <defs>
                    <linearGradient id={`fill-${label}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon
                    fill={`url(#fill-${label})`}
                    points={`0,${h} ${pts} ${w},${h}`}
                />
                <polyline fill="none" stroke={color} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" points={pts} />
                {/* last dot */}
                {(() => {
                    const lastPts = pts.split(' ')
                    const last = lastPts[lastPts.length - 1].split(',')
                    return <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
                })()}
            </svg>
        </div>
    )
}
