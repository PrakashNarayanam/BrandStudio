import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';
import { Sparkles, ArrowRight, Zap, Image, FileText, BarChart3, MessageSquare, Star, Check, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import bsLogo from '../assets/bs-logo.png';

interface Props {
    onGetStarted: () => void;
}

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const mv = useMotionValue(0);
    const spring = useSpring(mv, { duration: 1800, bounce: 0 });

    useEffect(() => {
        if (inView) mv.set(to);
    }, [inView, to, mv]);

    useEffect(() => {
        return spring.on('change', (v) => {
            if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + suffix;
        });
    }, [spring, suffix]);

    return <span ref={ref}>0{suffix}</span>;
}

const features = [
    { icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: 'Brand Name Generator', desc: 'AI-crafted names that are catchy, unique, and domain-ready for your industry.' },
    { icon: Image, color: 'text-blue-500', bg: 'bg-blue-500/10', title: 'Logo Designer', desc: 'Generate stunning logos with FLUX Stable Diffusion in seconds.' },
    { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10', title: 'Content Lab', desc: 'Auto-generate taglines, bios, and social captions tailored to your brand.' },
    { icon: BarChart3, color: 'text-orange-500', bg: 'bg-orange-500/10', title: 'Sentiment AI', desc: 'Analyze how your brand copy is emotionally perceived by your audience.' },
    { icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10', title: 'AI Consultant', desc: 'Chat with an expert AI branding consultant available 24/7.' },
    { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', title: 'Lightning Fast', desc: 'Powered by Groq\'s ultra-fast LPU inference — results in under 2 seconds.' },
];

const stats = [
    { value: 50000, suffix: '+', label: 'Brands Created' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate' },
    { value: 2, suffix: 's', label: 'Avg. Response Time' },
    { value: 10, suffix: 'x', label: 'Faster than Agencies' },
];

export const LandingPage: React.FC<Props> = ({ onGetStarted }) => {
    const { isDark, toggle } = useTheme();

    const bg = isDark ? 'bg-black' : 'bg-slate-50';
    const text = isDark ? 'text-zinc-100' : 'text-zinc-900';
    const textMuted = isDark ? 'text-zinc-400' : 'text-zinc-500';
    const navBg = isDark ? 'bg-black/80 border-zinc-800' : 'bg-white/80 border-zinc-200';
    const cardBg = isDark ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-md';
    const statBg = isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm';

    return (
        <div className={cn('min-h-screen transition-colors duration-300', bg, text)}>
            {/* ── Navbar ── */}
            <nav className={cn('fixed top-0 inset-x-0 z-50 border-b backdrop-blur-md', navBg)}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <img src={bsLogo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
                        <span className="font-bold text-xl tracking-tight">BrandStudio</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Pricing', 'About'].map(item => (
                            <a key={item} href="#" className={cn('text-sm font-medium transition-colors hover:text-emerald-500', textMuted)}>{item}</a>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggle}
                            className={cn(
                                'p-2.5 rounded-xl border transition-all',
                                isDark
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-yellow-400 hover:border-zinc-700'
                                    : 'bg-white border-zinc-200 text-zinc-500 hover:text-indigo-600 hover:border-zinc-300 shadow-sm'
                            )}
                        >
                            {isDark ? <Sun size={15} /> : <Moon size={15} />}
                        </button>
                        <button onClick={onGetStarted} className={cn('text-sm font-medium px-4 py-2 rounded-lg transition-colors', isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900')}>
                            Sign In
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                        >
                            Get Started Free
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                {/* BG blobs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-40 right-1/4 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                {/* Grid */}
                <div className={cn('absolute inset-0 pointer-events-none', isDark
                    ? '[background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:64px_64px]'
                    : '[background-image:linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:64px_64px]'
                )} />

                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <span className={cn('inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-8', isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')}>
                            <Zap size={12} /> Powered by Groq LPU + FLUX Stable Diffusion
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                    >
                        Build Your Brand
                        <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
                            with Intelligence
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                        className={cn('text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed', textMuted)}
                    >
                        BrandStudio is the all-in-one AI branding platform. Generate brand names, logos, copy, and strategy — in seconds, not weeks.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button
                            onClick={onGetStarted}
                            className="group bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-emerald-900/30"
                        >
                            Start Building for Free
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className={cn('font-semibold px-8 py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 text-lg', isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-900' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100')}>
                            Watch Demo
                        </button>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
                        className={cn('mt-12 flex flex-wrap items-center justify-center gap-6 text-sm', textMuted)}
                    >
                        {['No credit card required', 'Free forever plan', '5 second setup'].map(t => (
                            <span key={t} className="flex items-center gap-1.5">
                                <Check size={14} className="text-emerald-500" /> {t}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* Hero visual */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative max-w-5xl mx-auto mt-20"
                >
                    <div className={cn('rounded-2xl border overflow-hidden shadow-2xl', isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white')}>
                        <div className={cn('flex items-center gap-2 px-4 py-3 border-b', isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-100 bg-zinc-50')}>
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className={cn('ml-3 text-xs', textMuted)}>localhost:3000 — BrandStudio Dashboard</span>
                        </div>
                        <div className={cn('p-8 grid grid-cols-3 gap-4', isDark ? 'bg-zinc-900' : 'bg-slate-50')}>
                            {['Brand Names', 'Logo Designer', 'Content Lab', 'Sentiment AI', 'AI Consultant', 'Analytics'].map((item, i) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + i * 0.07 }}
                                    className={cn('p-4 rounded-xl border text-sm font-medium flex items-center gap-2', cardBg,
                                        i === 0 ? 'border-emerald-500/50 bg-emerald-500/5' : ''
                                    )}
                                >
                                    <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center',
                                        ['bg-emerald-500/20', 'bg-blue-500/20', 'bg-purple-500/20', 'bg-orange-500/20', 'bg-indigo-500/20', 'bg-pink-500/20'][i]
                                    )}>
                                        <div className={cn('w-2 h-2 rounded-full',
                                            ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-indigo-500', 'bg-pink-500'][i]
                                        )} />
                                    </div>
                                    {item}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    {/* Glow under mockup */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-emerald-500/20 blur-3xl" />
                </motion.div>
            </section>

            {/* ── Stats ── */}
            <section className={cn('py-16 border-y', isDark ? 'border-zinc-800' : 'border-zinc-200')}>
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={cn('text-center p-6 rounded-2xl border', statBg)}
                        >
                            <div className="text-4xl font-bold text-emerald-500 mb-1">
                                <Counter to={s.value} suffix={s.suffix} />
                            </div>
                            <div className={cn('text-sm', textMuted)}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">Everything your brand needs</h2>
                        <p className={cn('text-lg max-w-xl mx-auto', textMuted)}>Six powerful AI tools in one platform. No juggling between apps.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -4 }}
                                className={cn('group p-6 rounded-2xl border transition-all cursor-pointer', cardBg)}
                            >
                                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform', f.bg)}>
                                    <f.icon size={22} className={f.color} />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                                <p className={cn('text-sm leading-relaxed', textMuted)}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-12"
                >
                    <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />
                    <div className="relative z-10">
                        <div className="flex justify-center mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">Ready to build your brand?</h2>
                        <p className="text-emerald-100 mb-8 text-lg">Join thousands of founders who launched their brand with BrandStudio.</p>
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-emerald-700 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all flex items-center gap-2 mx-auto text-lg"
                        >
                            Get Started for Free <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ── Footer ── */}
            <footer className={cn('border-t pt-14 pb-8 px-6', isDark ? 'border-zinc-800 bg-zinc-950/60' : 'border-zinc-200 bg-zinc-50/80')}>
                <div className="max-w-6xl mx-auto">

                    {/* Top row: 4 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

                        {/* Brand column */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center gap-2.5 mb-4">
                                <img src={bsLogo} alt="BrandStudio" className="w-9 h-9 object-contain rounded-lg" />
                                <span className="font-bold text-lg">BrandStudio</span>
                            </div>
                            <p className={cn('text-sm leading-relaxed mb-5', textMuted)}>
                                The all-in-one AI branding platform. Build your brand identity in seconds, not weeks.
                            </p>
                            {/* Social icons */}
                            <div className="flex items-center gap-3">
                                {[
                                    { label: 'Twitter / X', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.865L1.254 2.25H8.08l4.264 5.626 5.9-5.626Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" /></svg> },
                                    { label: 'LinkedIn', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
                                    { label: 'Instagram', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg> },
                                    { label: 'YouTube', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
                                ].map(s => (
                                    <div
                                        key={s.label}
                                        className={cn(
                                            'w-8 h-8 rounded-lg flex items-center justify-center border transition-all opacity-60',
                                            isDark ? 'border-zinc-800 text-zinc-500 bg-zinc-900' : 'border-zinc-200 text-zinc-500 bg-white'
                                        )}
                                    >
                                        {s.svg}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product names */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4">Product</h4>
                            <ul className="space-y-2.5">
                                {['Brand Names', 'Logo Designer', 'Content Lab', 'Sentiment AI', 'AI Consultant', 'Analytics'].map(l => (
                                    <li key={l} className={cn('text-sm opacity-60', textMuted)}>
                                        {l}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company names */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4">Company</h4>
                            <ul className="space-y-2.5">
                                {['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'].map(l => (
                                    <li key={l} className={cn('text-sm opacity-60', textMuted)}>
                                        {l}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal names */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2.5">
                                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'].map(l => (
                                    <li key={l} className={cn('text-sm opacity-60', textMuted)}>
                                        {l}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className={cn('border-t pt-8 flex justify-center', isDark ? 'border-zinc-800' : 'border-zinc-200')}>
                        <p className={cn('text-xs font-medium opacity-50', textMuted)}>
                            © 2026 BrandStudio · All rights reserved.
                        </p>
                    </div>

                </div>
            </footer>
        </div>
    );
};

