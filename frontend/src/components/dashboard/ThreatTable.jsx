import { useState } from 'react'

const threats = [
    { id: 1, pkg: 'lodash', version: '4.17.15', severity: 'Critical', type: 'Prototype Pollution', status: 'Remediated', age: '2h ago', score: 9.8 },
    { id: 2, pkg: 'axios', version: '0.21.1', severity: 'High', type: 'SSRF', status: 'Open', age: '5h ago', score: 7.5 },
    { id: 3, pkg: 'minimist', version: '1.2.5', severity: 'High', type: 'Prototype Pollution', status: 'In Review', age: '1d ago', score: 7.1 },
    { id: 4, pkg: 'node-fetch', version: '2.6.1', severity: 'Medium', type: 'ReDoS', status: 'Open', age: '1d ago', score: 5.3 },
    { id: 5, pkg: 'json-schema', version: '0.2.3', severity: 'Medium', type: 'Injection', status: 'Remediated', age: '2d ago', score: 5.0 },
    { id: 6, pkg: 'qs', version: '6.5.2', severity: 'High', type: 'Prototype Pollution', status: 'Open', age: '2d ago', score: 7.4 },
    { id: 7, pkg: 'marked', version: '0.3.9', severity: 'Medium', type: 'XSS', status: 'In Review', age: '3d ago', score: 6.1 },
    { id: 8, pkg: 'tar', version: '4.4.13', severity: 'Critical', type: 'Path Traversal', status: 'Remediated', age: '4d ago', score: 9.1 },
]

const severityStyle = {
    Critical: 'bg-red-500/15 text-red-400 border border-red-500/25',
    High: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
    Medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
    Low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
}

const statusStyle = {
    Open: 'bg-red-500/10 text-red-400',
    'In Review': 'bg-yellow-500/10 text-yellow-400',
    Remediated: 'bg-emerald-500/10 text-emerald-400',
}

const statusDot = {
    Open: 'bg-red-500',
    'In Review': 'bg-yellow-500',
    Remediated: 'bg-emerald-500',
}

export default function ThreatTable() {
    const [filter, setFilter] = useState('All')
    const filters = ['All', 'Critical', 'High', 'Medium', 'Open', 'Remediated']
    const filtered = threats.filter(t => {
        if (filter === 'All') return true
        return t.severity === filter || t.status === filter
    })

    return (
        <div className="bg-[#0d0f1e] border border-white/[0.07] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <div>
                    <h2 className="text-sm font-bold">Recent Threats</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{filtered.length} vulnerabilities detected</p>
                </div>
                {/* Filter pills */}
                <div className="flex gap-1.5 flex-wrap">
                    {filters.map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border-0
                transition-all ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.05]">
                            {['Package', 'Version', 'Type', 'CVSS', 'Severity', 'Status', 'Detected'].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider
                  text-slate-600 px-6 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((t, i) => (
                            <tr key={t.id}
                                className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors
                  ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-white">{t.pkg}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <code className="text-xs text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">{t.version}</code>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-slate-400">{t.type}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm font-bold ${t.score >= 9 ? 'text-red-400' :
                                            t.score >= 7 ? 'text-orange-400' :
                                                t.score >= 5 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                        {t.score}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider
                    px-2 py-1 rounded-md ${severityStyle[t.severity]}`}>
                                        {t.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold
                    uppercase tracking-wider px-2 py-1 rounded-md ${statusStyle[t.status]}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[t.status]}`} />
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-slate-500">{t.age}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/[0.07] flex items-center justify-between">
                <span className="text-xs text-slate-600">Showing {filtered.length} of {threats.length} threats</span>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-semibold
          cursor-pointer bg-transparent border-0 transition-colors">
                    View all →
                </button>
            </div>
        </div>
    )
}
