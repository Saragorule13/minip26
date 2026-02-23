import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function LoginForm() {
    const navigate = useNavigate()
    const [showPw, setShowPw] = useState(false)
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const { error: err } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        })
        setLoading(false)
        if (err) {
            setError(err.message)
        } else {
            navigate('/dashboard')
        }
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

            {/* Email */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Email address
                </label>
                <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-[#10132a] border border-white/[0.08] rounded-xl px-4 py-3
            text-sm text-white placeholder-slate-600
            focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
            transition-all"
                />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Password
                    </label>
                    <button type="button"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors
              bg-transparent border-0 cursor-pointer font-medium">
                        Forgot password?
                    </button>
                </div>
                <div className="relative">
                    <input
                        type={showPw ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className="w-full bg-[#10132a] border border-white/[0.08] rounded-xl px-4 py-3 pr-11
              text-sm text-white placeholder-slate-600
              focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
              transition-all"
                    />
                    <button type="button"
                        onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
              hover:text-slate-300 transition-colors bg-transparent border-0 cursor-pointer">
                        <EyeIcon open={showPw} />
                    </button>
                </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-[#10132a] accent-blue-600 cursor-pointer" />
                <span className="text-sm text-slate-400">Remember me for 30 days</span>
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
                        Signing in…
                    </>
                ) : 'Sign In'}
            </button>
        </form>
    )
}
