import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const EyeIcon = ({ open }) => open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><line x1="2" y1="2" x2="22" y2="22" />
    </svg>
)

function PasswordStrength({ pw }) {
    const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)]
    const score = checks.filter(Boolean).length
    const color = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-yellow-500' : score === 3 ? 'bg-blue-500' : 'bg-emerald-500'
    const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score]
    if (!pw) return null
    return (
        <div className="flex items-center gap-2 mt-1.5">
            <div className="flex gap-1 flex-1">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? color : 'bg-white/10'}`} />
                ))}
            </div>
            <span className={`text-xs font-semibold ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-yellow-400' : score === 3 ? 'text-blue-400' : 'text-emerald-400'}`}>
                {label}
            </span>
        </div>
    )
}

export default function SignupForm({ onSuccess }) {
    const [showPw, setShowPw] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const { error: err } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { full_name: form.name },
            },
        })
        setLoading(false)
        if (err) {
            setError(err.message)
        } else {
            setSuccess(true)
            // Supabase sends a confirmation email; switch to login tab after 2s
            setTimeout(() => onSuccess?.(), 2000)
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30
          flex items-center justify-center text-emerald-400">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <div>
                    <p className="font-bold text-white mb-1">Check your inbox</p>
                    <p className="text-sm text-slate-400">We sent a confirmation link to <span className="text-white">{form.email}</span></p>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Error banner */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3
          text-sm text-red-400 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full name</label>
                <input type="text" required placeholder="Jane Smith"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-[#10132a] border border-white/[0.08] rounded-xl px-4 py-3
            text-sm text-white placeholder-slate-600
            focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all" />
            </div>

            {/* Work email */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Work email</label>
                <input type="email" required placeholder="you@company.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-[#10132a] border border-white/[0.08] rounded-xl px-4 py-3
            text-sm text-white placeholder-slate-600
            focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all" />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                    <input type={showPw ? 'text' : 'password'} required placeholder="Create a strong password"
                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className="w-full bg-[#10132a] border border-white/[0.08] rounded-xl px-4 py-3 pr-11
              text-sm text-white placeholder-slate-600
              focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
              hover:text-slate-300 transition-colors bg-transparent border-0 cursor-pointer">
                        <EyeIcon open={showPw} />
                    </button>
                </div>
                <PasswordStrength pw={form.password} />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" required
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#10132a] accent-blue-600 cursor-pointer shrink-0" />
                <span className="text-sm text-slate-400 leading-snug">
                    I agree to the{' '}<span className="text-blue-400 hover:text-blue-300 cursor-pointer">Terms</span>
                    {' '}and{' '}<span className="text-blue-400 hover:text-blue-300 cursor-pointer">Privacy Policy</span>
                </span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading}
                className="mt-2 w-full py-3 rounded-xl text-sm font-bold text-white
          bg-blue-600 hover:bg-blue-500 transition-all
          hover:shadow-[0_0_24px_rgba(59,130,246,0.45)]
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2 cursor-pointer border-0">
                {loading ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating account…
                    </>
                ) : 'Create Account'}
            </button>
        </form>
    )
}
