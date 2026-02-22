import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Sun, Moon, AlertCircle, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import bsLogo from '../assets/bs-logo.png';

interface Props {
    onBack: () => void;
    onSuccess: () => void;
}

const features = [
    'Generate 10 brand names in under 2 seconds',
    'Create professional logos with Stable Diffusion',
    'AI branding consultant available 24/7',
];

/* ─── Google G icon ─── */
function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

function BrandingPanel({ onBack }: { onBack: () => void }) {
    return (
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-16">
                    ← Back to home
                </button>
                <div className="flex items-center gap-3 mb-10">
                    <img src={bsLogo} alt="BrandStudio" className="w-14 h-14 object-contain rounded-xl bg-white/10 p-1" />
                    <span className="font-bold text-2xl text-white">BrandStudio</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                    Your brand.<br />Your story.<br />
                    <span className="text-emerald-300">AI-powered.</span>
                </h2>
                <p className="text-emerald-100/80 text-lg leading-relaxed max-w-sm">
                    From naming to logos to content — build a complete brand identity in minutes.
                </p>
            </div>
            <div className="space-y-4">
                {features.map((item, i) => (
                    <motion.div key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.12 }}
                        className="flex items-center gap-3 text-emerald-100">
                        <div className="w-5 h-5 rounded-full bg-emerald-400/30 flex items-center justify-center shrink-0">
                            <Check size={12} className="text-emerald-300" />
                        </div>
                        <span className="text-sm">{item}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

/* ─── FormCard is defined OUTSIDE LoginPage so it never remounts on keystroke ─── */
interface FormCardProps {
    tab: 'login' | 'signup';
    form: { name: string; email: string; password: string };
    showPass: boolean;
    loading: boolean;
    googleLoading: boolean;
    error: string;
    isConfigured: boolean;
    isDark: boolean;
    onTabSwitch: (t: 'login' | 'signup') => void;
    onFormChange: (k: 'name' | 'email' | 'password', v: string) => void;
    onShowPassToggle: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onGoogle: () => void;
    onDemo: () => void;
}

function FormCard({
    tab, form, showPass, loading, googleLoading, error, isConfigured, isDark,
    onTabSwitch, onFormChange, onShowPassToggle, onSubmit, onGoogle, onDemo,
}: FormCardProps) {
    const cardBg = isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-2xl';
    const inputCls = isDark
        ? 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500'
        : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500';
    const labelCls = isDark ? 'text-zinc-400' : 'text-zinc-600';
    const textPrimary = isDark ? 'text-zinc-100' : 'text-zinc-900';
    const textMuted = isDark ? 'text-zinc-500' : 'text-zinc-500';
    const dividerCls = isDark ? 'border-zinc-800 text-zinc-600' : 'border-zinc-200 text-zinc-400';
    const googleBtnCls = isDark
        ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
        : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={cn('w-full max-w-md rounded-3xl border p-8', cardBg)}
        >
            {/* Tab switcher */}
            <div className={cn('flex rounded-xl p-1 mb-7', isDark ? 'bg-zinc-800' : 'bg-zinc-100')}>
                {(['login', 'signup'] as const).map(t => (
                    <button key={t} onClick={() => onTabSwitch(t)}
                        className={cn('flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all',
                            tab === t
                                ? 'bg-emerald-600 text-white shadow'
                                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-700'
                        )}>
                        {t === 'login' ? 'Sign In' : 'Sign Up'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={tab}
                    initial={{ opacity: 0, y: tab === 'signup' ? 20 : -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: tab === 'signup' ? -20 : 20 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                >
                    <h2 className={cn('text-2xl font-bold mb-1', textPrimary)}>
                        {tab === 'login' ? 'Welcome back 👋' : 'Create account ✨'}
                    </h2>
                    <p className={cn('text-sm mb-6', textMuted)}>
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => onTabSwitch(tab === 'login' ? 'signup' : 'login')}
                            className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
                            {tab === 'login' ? 'Sign up free' : 'Sign in'}
                        </button>
                    </p>

                    {/* Not-configured warning */}
                    {!isConfigured && (
                        <div className="mb-5 p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-xs text-yellow-400 space-y-2">
                            <p className="font-semibold flex items-center gap-1.5"><AlertCircle size={13} /> Firebase not configured yet</p>
                            <p className="text-yellow-400/70">Add your <code className="bg-yellow-500/20 px-1 rounded">VITE_FIREBASE_*</code> keys to <code className="bg-yellow-500/20 px-1 rounded">.env</code> to enable real auth.</p>
                            <button onClick={onDemo}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all mt-1">
                                <Zap size={14} /> Continue as Demo
                            </button>
                        </div>
                    )}

                    {/* Google button */}
                    <button onClick={onGoogle} disabled={googleLoading || !isConfigured}
                        className={cn('w-full flex items-center justify-center gap-3 py-3 rounded-xl border font-medium text-sm transition-all mb-5 disabled:opacity-40', googleBtnCls)}>
                        {googleLoading
                            ? <div className="w-5 h-5 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin" />
                            : <GoogleIcon />}
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className={cn('flex items-center gap-3 mb-5 text-xs', dividerCls)}>
                        <div className={cn('flex-1 border-t', dividerCls)} />
                        <span>or {tab === 'login' ? 'sign in' : 'sign up'} with email</span>
                        <div className={cn('flex-1 border-t', dividerCls)} />
                    </div>

                    {/* Email/password form */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        {tab === 'signup' && (
                            <div className="space-y-1.5">
                                <label className={cn('text-sm font-medium', labelCls)}>Full Name</label>
                                <div className="relative">
                                    <User size={16} className={cn('absolute left-3.5 top-1/2 -translate-y-1/2', textMuted)} />
                                    <input type="text" value={form.name}
                                        onChange={e => onFormChange('name', e.target.value)}
                                        placeholder="John Smith" required
                                        className={cn('w-full border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all', inputCls)} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className={cn('text-sm font-medium', labelCls)}>Email</label>
                            <div className="relative">
                                <Mail size={16} className={cn('absolute left-3.5 top-1/2 -translate-y-1/2', textMuted)} />
                                <input type="email" value={form.email}
                                    onChange={e => onFormChange('email', e.target.value)}
                                    placeholder="you@example.com" required
                                    className={cn('w-full border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all', inputCls)} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className={cn('text-sm font-medium', labelCls)}>Password</label>
                                {tab === 'login' && (
                                    <a href="#" className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">Forgot password?</a>
                                )}
                            </div>
                            <div className="relative">
                                <Lock size={16} className={cn('absolute left-3.5 top-1/2 -translate-y-1/2', textMuted)} />
                                <input type={showPass ? 'text' : 'password'} value={form.password}
                                    onChange={e => onFormChange('password', e.target.value)}
                                    placeholder="Min. 6 characters" required minLength={6}
                                    className={cn('w-full border rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all', inputCls)} />
                                <button type="button" onClick={onShowPassToggle}
                                    className={cn('absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors', textMuted)}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl">
                                <AlertCircle size={15} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <button type="submit" disabled={loading || googleLoading || !isConfigured}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-1 group">
                            {loading
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <>{tab === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            }
                        </button>
                    </form>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}

/* ─── Main LoginPage component ─── */
export const LoginPage: React.FC<Props> = ({ onBack, onSuccess }) => {
    const { isDark, toggle } = useTheme();
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, error, clearError, user, isConfigured } = useAuth();
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    // Navigate away when Firebase confirms auth
    useEffect(() => {
        if (user) onSuccess();
    }, [user, onSuccess]);

    const handleTabSwitch = (t: 'login' | 'signup') => {
        setTab(t);
        clearError();
        setForm({ name: '', email: '', password: '' });
    };

    const handleFormChange = (k: 'name' | 'email' | 'password', v: string) =>
        setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (tab === 'signup') {
            await signUpWithEmail(form.name, form.email, form.password);
        } else {
            await signInWithEmail(form.email, form.password);
        }
        setLoading(false);
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        await signInWithGoogle();
        setGoogleLoading(false);
    };

    const isLogin = tab === 'login';
    const bg = isDark ? 'bg-[#0a0a0a]' : 'bg-slate-50';

    const brandingPanel = (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-700 to-indigo-800">
            <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="absolute top-20 -left-20 w-96 h-96 bg-emerald-400/20 blur-[80px] rounded-full" />
            <div className="absolute bottom-20 right-0 w-80 h-80 bg-indigo-400/20 blur-[80px] rounded-full" />
            <BrandingPanel onBack={onBack} />
        </div>
    );

    const formCard = (
        <div className="absolute inset-0 flex items-center justify-center p-12">
            <FormCard
                tab={tab} form={form} showPass={showPass}
                loading={loading} googleLoading={googleLoading}
                error={error} isConfigured={isConfigured} isDark={isDark}
                onTabSwitch={handleTabSwitch}
                onFormChange={handleFormChange}
                onShowPassToggle={() => setShowPass(p => !p)}
                onSubmit={handleSubmit}
                onGoogle={handleGoogle}
                onDemo={onSuccess}
            />
        </div>
    );

    return (
        <div className={cn('min-h-screen transition-colors duration-300 overflow-hidden', bg)}>
            {/* Theme toggle */}
            <button onClick={toggle}
                className={cn('absolute top-5 right-5 z-50 p-2.5 rounded-xl border transition-all',
                    isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-yellow-400 hover:border-zinc-700'
                        : 'bg-white border-zinc-200 text-zinc-500 hover:text-indigo-600 hover:border-zinc-300 shadow-sm'
                )}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* ── Desktop two-column layout ── */}
            <div className="hidden lg:flex min-h-screen">
                {/* LEFT slot */}
                <div className="w-1/2 relative overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                        {isLogin ? (
                            <motion.div key="form-left"
                                initial={{ x: '-100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-100%', opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute inset-0">
                                {formCard}
                            </motion.div>
                        ) : (
                            <motion.div key="brand-left"
                                initial={{ x: '-100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-100%', opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute inset-0">
                                {brandingPanel}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT slot */}
                <div className="w-1/2 relative overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                        {isLogin ? (
                            <motion.div key="brand-right"
                                initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute inset-0">
                                {brandingPanel}
                            </motion.div>
                        ) : (
                            <motion.div key="form-right"
                                initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute inset-0">
                                {formCard}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Mobile layout ── */}
            <div className="lg:hidden min-h-screen flex flex-col">
                <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-8 flex items-center gap-3">
                    <img src={bsLogo} alt="BrandStudio" className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1" />
                    <div>
                        <p className="font-bold text-white text-lg">BrandStudio</p>
                        <p className="text-emerald-200 text-xs">AI-powered brand platform</p>
                    </div>
                    <button onClick={onBack} className="ml-auto text-white/70 hover:text-white text-sm transition-colors">← Home</button>
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                    <FormCard
                        tab={tab} form={form} showPass={showPass}
                        loading={loading} googleLoading={googleLoading}
                        error={error} isConfigured={isConfigured} isDark={isDark}
                        onTabSwitch={handleTabSwitch}
                        onFormChange={handleFormChange}
                        onShowPassToggle={() => setShowPass(p => !p)}
                        onSubmit={handleSubmit}
                        onGoogle={handleGoogle}
                        onDemo={onSuccess}
                    />
                </div>
            </div>
        </div>
    );
};
