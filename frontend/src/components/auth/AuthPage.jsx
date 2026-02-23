import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

const ShieldIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
)

const Spinner = () => (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
)

const providers = [
    {
        id: 'github',
        name: 'GitHub',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
        ),
    },
    {
        id: 'google',
        name: 'Google',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
        ),
    },
]

export default function AuthPage() {
    const [tab, setTab] = useState('login')
    const [oauthLoading, setOauthLoading] = useState(null) // 'github' | 'google' | null
    const [oauthError, setOauthError] = useState('')
    const navigate = useNavigate()

    const handleOAuth = async (provider) => {
        setOauthError('')
        setOauthLoading(provider)
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        })
        if (error) {
            setOauthError(error.message)
            setOauthLoading(null)
        }
        // On success Supabase redirects the browser — no need to manually navigate
    }

    return (
        <div className="min-h-screen bg-[#06070f] text-white font-['Inter',sans-serif]
      flex flex-col selection:bg-blue-500/30 overflow-hidden">

            {/* ambient glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]
        bg-[radial-gradient(ellipse_at_center,rgba(37,106,244,0.10)_0%,transparent_70%)]
        pointer-events-none z-0" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[400px]
        bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.07)_0%,transparent_70%)]
        pointer-events-none z-0" />

            {/* ── NAV ── */}
            <header className="relative z-10 border-b border-white/[0.07] bg-[#06070f]/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 h-[60px] flex items-center justify-between">
                    <button onClick={() => navigate('/')}
                        className="flex items-center gap-2 font-bold text-sm text-white
              hover:text-blue-400 transition-colors bg-transparent border-0 cursor-pointer">
                        <span className="text-blue-400"><ShieldIcon /></span>
                        Dynamic Trust
                    </button>
                    <span className="text-xs text-slate-500">
                        {tab === 'login' ? 'New here? ' : 'Already have an account? '}
                        <button onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
                            className="text-blue-400 hover:text-blue-300 font-semibold
                bg-transparent border-0 cursor-pointer transition-colors">
                            {tab === 'login' ? 'Create account' : 'Sign in'}
                        </button>
                    </span>
                </div>
            </header>

            {/* ── MAIN ── */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    <div className="bg-[#0d0f1e] border border-white/[0.08] rounded-3xl p-8
            shadow-[0_0_80px_rgba(37,106,244,0.08)]">

                        {/* Logo + heading */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12
                bg-blue-600/15 border border-blue-500/25 rounded-2xl text-blue-400 mb-5">
                                <ShieldIcon />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight mb-2">
                                {tab === 'login' ? 'Welcome back' : 'Create your account'}
                            </h1>
                            <p className="text-sm text-slate-400">
                                {tab === 'login'
                                    ? 'Sign in to your Dynamic Trust dashboard'
                                    : 'Start securing your pipeline in minutes'}
                            </p>
                        </div>

                        {/* Tab switcher */}
                        <div className="flex bg-[#10132a] rounded-xl p-1 mb-8">
                            {[{ id: 'login', label: 'Sign In' }, { id: 'signup', label: 'Sign Up' }].map(t => (
                                <button key={t.id} onClick={() => { setTab(t.id); setOauthError('') }}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-0
                    ${tab === t.id
                                            ? 'bg-blue-600 text-white shadow-[0_0_16px_rgba(37,106,244,0.4)]'
                                            : 'text-slate-400 hover:text-white bg-transparent'}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Email/password form */}
                        {tab === 'login' ? <LoginForm /> : <SignupForm onSuccess={() => setTab('login')} />}

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.07]" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#0d0f1e] px-3 text-xs text-slate-500">or continue with</span>
                            </div>
                        </div>

                        {/* OAuth error */}
                        {oauthError && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3
                text-sm text-red-400 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {oauthError}
                            </div>
                        )}

                        {/* OAuth buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {providers.map(({ id, name, icon }) => (
                                <button key={id}
                                    onClick={() => handleOAuth(id)}
                                    disabled={oauthLoading !== null}
                                    className="flex items-center justify-center gap-2 bg-[#10132a]
                    border border-white/[0.07] rounded-xl py-2.5 text-sm font-medium
                    text-slate-400 hover:text-white hover:border-white/20 hover:bg-[#161929]
                    transition-all cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed">
                                    {oauthLoading === id ? <Spinner /> : icon}
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-600 mt-6">
                        By continuing, you agree to our{' '}
                        <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Terms</span>
                        {' '}and{' '}
                        <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>.
                    </p>
                </div>
            </main>
        </div>
    )
}
