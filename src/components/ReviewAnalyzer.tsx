import React, { useState, useRef } from 'react';
import {
    Star, Loader2, AlertCircle, TrendingUp, TrendingDown,
    Minus, Sparkles, ChevronDown, Bookmark, Check, Download
} from 'lucide-react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { geminiService } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { useBrand } from '../contexts/BrandContext';
import { cn } from '../lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ── Score bar ──────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
    const pct = ((score + 1) / 2) * 100;
    const color = score >= 0.3 ? '#10b981' : score <= -0.3 ? '#ef4444' : '#f59e0b';
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                />
            </div>
            <span className="text-xs font-mono w-10 text-right shrink-0" style={{ color, opacity: 0.8 }}>
                {score > 0 ? '+' : ''}{score.toFixed(2)}
            </span>
        </div>
    );
}

// ── Sample reviews ─────────────────────────────────────────────────────────
const SAMPLE_REVIEWS = [
    'Absolutely love this product! The quality is outstanding and exceeded my expectations.',
    'The packaging was damaged when it arrived, very disappointing experience.',
    "It's okay, nothing special but gets the job done for everyday use.",
    'Incredible customer service and fast shipping, will definitely buy again!',
    'Terrible experience, the product stopped working after just 2 days.',
    'Decent quality for the price, I expected a bit more premium feel.',
    'My favorite purchase this year! Highly recommend to everyone I know.',
    'The color was completely different from the photos, felt misled by the listing.',
    'Great value for money, delivery was prompt and packaging was secure.',
    'Average product, customer support was unresponsive when I had questions.',
].join('\n');

// ── Types ──────────────────────────────────────────────────────────────────
type ReviewResult = {
    review: string;
    score: number;
    label: string;
    emoji: string;
    keyPhrase: string;
};

type AnalysisResult = {
    results: ReviewResult[];
    summary: {
        positive: number;
        neutral: number;
        negative: number;
        avgScore: number;
        overallLabel: string;
        topInsight: string;
    };
};

const COLORS = {
    positive: { bg: 'rgba(16,185,129,0.85)', border: '#10b981', hover: 'rgba(16,185,129,1)' },
    neutral: { bg: 'rgba(245,158,11,0.85)', border: '#f59e0b', hover: 'rgba(245,158,11,1)' },
    negative: { bg: 'rgba(239,68,68,0.85)', border: '#ef4444', hover: 'rgba(239,68,68,1)' },
};

// ── Main Component ─────────────────────────────────────────────────────────
export const ReviewAnalyzer: React.FC = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { selectedBrand } = useBrand();
    const { saveItem } = useCollections();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const saveAnalysis = async () => {
        if (!result) return;
        setIsSaving(true);
        try {
            await saveItem({
                type: 'sentiment',
                label: `Reviews: ${selectedBrand || 'Analysis'}`,
                data: result
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            console.error("Save analysis error", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Theme tokens
    const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
    const inputCls = isDark
        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-pink-500/20'
        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-pink-400/30';
    const heading = isDark ? 'text-white' : 'text-slate-900';
    const subText = isDark ? 'text-zinc-500' : 'text-slate-400';
    const labelCls = isDark ? 'text-zinc-400' : 'text-slate-600';
    const rowHover = isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50';
    const divider = isDark ? 'divide-zinc-800' : 'divide-slate-100';

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        if (!lines.length) { setError('Please enter at least one review.'); return; }
        if (lines.length > 30) { setError('Please limit to 30 reviews at a time.'); return; }
        setLoading(true); setError(null); setResult(null);
        try {
            const data = await geminiService.analyzeReviews(lines);
            setResult(data);
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
        } catch (err: any) {
            setError(err?.message || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getLabelColor = (l: string) =>
        l === 'Positive' ? 'text-emerald-400' : l === 'Negative' ? 'text-red-400' : 'text-amber-400';

    const getLabelBg = (l: string) => {
        if (l === 'Positive') return isDark ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700';
        if (l === 'Negative') return isDark ? 'bg-red-500/15 border-red-500/25 text-red-400' : 'bg-red-50 border-red-200 text-red-700';
        return isDark ? 'bg-amber-500/15 border-amber-500/25 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700';
    };

    const getLabelIcon = (l: string) =>
        l === 'Positive' ? <TrendingUp size={11} /> : l === 'Negative' ? <TrendingDown size={11} /> : <Minus size={11} />;

    // ── Chart data ─────────────────────────────────────────────────────────
    const doughnutData = result ? {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
            data: [result.summary.positive, result.summary.neutral, result.summary.negative],
            backgroundColor: [COLORS.positive.bg, COLORS.neutral.bg, COLORS.negative.bg],
            borderColor: [COLORS.positive.border, COLORS.neutral.border, COLORS.negative.border],
            hoverBackgroundColor: [COLORS.positive.hover, COLORS.neutral.hover, COLORS.negative.hover],
            borderWidth: 2,
            hoverOffset: 8,
        }],
    } : null;

    const doughnutOptions: any = {
        cutout: '62%',
        responsive: true,
        maintainAspectRatio: true,
        animation: { animateRotate: true, animateScale: true, duration: 900 },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: isDark ? '#a1a1aa' : '#64748b',
                    padding: 18,
                    font: { size: 12 },
                    usePointStyle: true,
                    pointStyleWidth: 8,
                },
            },
            tooltip: {
                backgroundColor: isDark ? '#18181b' : '#fff',
                titleColor: isDark ? '#f4f4f5' : '#0f172a',
                bodyColor: isDark ? '#a1a1aa' : '#64748b',
                borderColor: isDark ? '#3f3f46' : '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (ctx: any) => {
                        const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const pct = total > 0 ? Math.round((ctx.raw / total) * 100) : 0;
                        return `  ${ctx.label}: ${ctx.raw} (${pct}%)`;
                    },
                },
            },
        },
    };

    const barData = result ? {
        labels: result.results.map((_, i) => `#${i + 1}`),
        datasets: [{
            label: 'Sentiment Score',
            data: result.results.map(r => r.score),
            backgroundColor: result.results.map(r =>
                r.label === 'Positive' ? COLORS.positive.bg : r.label === 'Negative' ? COLORS.negative.bg : COLORS.neutral.bg
            ),
            borderColor: result.results.map(r =>
                r.label === 'Positive' ? COLORS.positive.border : r.label === 'Negative' ? COLORS.negative.border : COLORS.neutral.border
            ),
            borderWidth: 1.5,
            borderRadius: 5,
            borderSkipped: false,
        }],
    } : null;

    const barOptions: any = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        scales: {
            x: {
                min: -1, max: 1,
                grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                ticks: { color: isDark ? '#71717a' : '#94a3b8', font: { size: 10 }, callback: (v: any) => v > 0 ? `+${v}` : v },
                border: { color: isDark ? '#3f3f46' : '#e2e8f0' },
            },
            y: {
                grid: { display: false },
                ticks: { color: isDark ? '#71717a' : '#94a3b8', font: { size: 10 } },
                border: { color: isDark ? '#3f3f46' : '#e2e8f0' },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? '#18181b' : '#fff',
                titleColor: isDark ? '#f4f4f5' : '#0f172a',
                bodyColor: isDark ? '#a1a1aa' : '#64748b',
                borderColor: isDark ? '#3f3f46' : '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    title: (items: any) => result ? `Review #${items[0]?.dataIndex + 1}` : '',
                    label: (ctx: any) => {
                        const r = result?.results[ctx.dataIndex];
                        return [
                            `  ${r?.emoji} ${r?.label}  (${ctx.raw > 0 ? '+' : ''}${Number(ctx.raw).toFixed(2)})`,
                            `  "${r?.review?.slice(0, 55)}${(r?.review?.length ?? 0) > 55 ? '…' : ''}"`,
                        ];
                    },
                },
            },
        },
    };

    const detectedCount = text.split('\n').filter(l => l.trim().length > 5).length;

    return (
        <div className="space-y-6 w-full min-w-0">

            {/* ── Input card ── */}
            <div className={cn('border p-6 rounded-2xl w-full', card)}>
                <h2 className={cn('text-2xl font-semibold flex items-center gap-2 mb-1', heading)}>
                    <Star className="text-pink-500 shrink-0" size={24} />
                    Review Sentiment Analyzer
                </h2>
                <p className={cn('text-sm mb-5', subText)}>
                    Paste customer reviews — one per line. AI classifies each as{' '}
                    <span className="text-emerald-400 font-medium">Positive</span>,{' '}
                    <span className="text-amber-400 font-medium">Neutral</span>, or{' '}
                    <span className="text-red-400 font-medium">Negative</span> with Chart.js visualizations.
                </p>

                <form onSubmit={handleAnalyze} className="space-y-4">
                    {/* Label row */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <label className={cn('text-sm font-medium', labelCls)}>
                            Customer Reviews
                            <span className={cn('ml-1.5 text-xs font-normal', subText)}>(one per line · max 30)</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setText(SAMPLE_REVIEWS)}
                            className={cn(
                                'text-xs px-3 py-1.5 rounded-lg border font-medium transition-all shrink-0',
                                isDark
                                    ? 'border-zinc-700 text-zinc-400 hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/5'
                                    : 'border-slate-200 text-slate-500 hover:text-pink-600 hover:border-pink-300 hover:bg-pink-50'
                            )}
                        >
                            Load 10 samples
                        </button>
                    </div>

                    {/* Textarea */}
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder={"Great quality, fast delivery!\nPackaging was damaged on arrival.\nDecent product but nothing special..."}
                        rows={7}
                        className={cn(
                            'w-full border rounded-xl px-4 py-3 focus:outline-none transition-all resize-none text-sm leading-relaxed',
                            inputCls
                        )}
                        required
                    />

                    {/* Count + submit */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className={cn('text-xs', subText)}>
                            {detectedCount} {detectedCount === 1 ? 'review' : 'reviews'} detected
                        </span>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 min-w-[200px] bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Star size={18} />}
                            {loading ? 'Analyzing with AI...' : 'Analyze Sentiment'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* ── Results ── */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        ref={resultRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5 w-full min-w-0"
                    >
                        {/* Row 1: Doughnut + Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                            {/* Doughnut */}
                            <div className={cn('lg:col-span-2 border rounded-2xl p-5 flex flex-col items-center', card)}>
                                <p className={cn('text-sm font-semibold mb-4 self-start', heading)}>🍩 Sentiment Breakdown</p>
                                <div className="w-full max-w-[240px] mx-auto">
                                    {doughnutData && <Doughnut data={doughnutData} options={doughnutOptions} />}
                                </div>
                                <p className={cn('text-xs mt-3', subText)}>{result.results.length} reviews analysed</p>
                            </div>

                            {/* Stats */}
                            <div className="lg:col-span-3 flex flex-col gap-4">

                                {/* Verdict */}
                                <div className={cn('border rounded-2xl p-5 relative overflow-hidden', card)}>
                                    <button
                                        onClick={saveAnalysis}
                                        disabled={isSaving || isSaved}
                                        className={cn(
                                            'absolute top-4 right-4 p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider',
                                            isSaved ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'hover:bg-zinc-800 border-zinc-700 text-zinc-400'
                                        )}
                                    >
                                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <Check size={14} /> : <Bookmark size={14} />}
                                        {isSaved ? 'Saved' : 'Save Result'}
                                    </button>
                                    <p className={cn('text-xs font-semibold uppercase tracking-wider mb-3', subText)}>Overall Verdict</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl leading-none">
                                            {result.summary.overallLabel === 'Positive' ? '😊' : result.summary.overallLabel === 'Negative' ? '😠' : '😐'}
                                        </span>
                                        <div>
                                            <p className={cn('text-2xl font-bold', getLabelColor(result.summary.overallLabel))}>
                                                {result.summary.overallLabel}
                                            </p>
                                            <p className={cn('text-sm mt-0.5', subText)}>
                                                Avg score:{' '}
                                                <span className="font-mono font-semibold">
                                                    {result.summary.avgScore > 0 ? '+' : ''}{result.summary.avgScore}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Count trio */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Positive', count: result.summary.positive, color: 'text-emerald-400', bg: isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200' },
                                        { label: 'Neutral', count: result.summary.neutral, color: 'text-amber-400', bg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200' },
                                        { label: 'Negative', count: result.summary.negative, color: 'text-red-400', bg: isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200' },
                                    ].map(s => (
                                        <div key={s.label} className={cn('border rounded-2xl p-4 text-center', s.bg)}>
                                            <p className={cn('text-3xl font-bold tabular-nums', s.color)}>{s.count}</p>
                                            <p className={cn('text-xs mt-1', subText)}>{s.label}</p>
                                            <p className={cn('text-xs font-semibold mt-0.5', s.color)}>
                                                {result.results.length > 0 ? Math.round((s.count / result.results.length) * 100) : 0}%
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* AI Insight */}
                                <div className={cn('border rounded-2xl p-4 flex items-start gap-3',
                                    isDark ? 'bg-pink-500/10 border-pink-500/20' : 'bg-pink-50 border-pink-200')}>
                                    <Sparkles size={16} className="text-pink-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className={cn('text-xs font-semibold mb-1', isDark ? 'text-pink-400' : 'text-pink-700')}>💡 AI Insight</p>
                                        <p className={cn('text-sm leading-relaxed', isDark ? 'text-pink-200/80' : 'text-pink-800/80')}>
                                            {result.summary.topInsight}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Bar chart */}
                        <div className={cn('border rounded-2xl p-5', card)}>
                            <p className={cn('text-sm font-semibold mb-1', heading)}>
                                📊 Score Per Review
                            </p>
                            <p className={cn('text-xs mb-4', subText)}>Hover a bar to see the review text</p>
                            <div style={{ height: Math.max(180, result.results.length * 32) }}>
                                {barData && <Bar data={barData} options={barOptions} />}
                            </div>
                        </div>

                        {/* Row 3: Per-review list */}
                        <div className={cn('border rounded-2xl overflow-hidden', card)}>
                            <div className={cn('px-5 py-4 border-b flex items-center justify-between',
                                isDark ? 'border-zinc-800' : 'border-slate-200')}>
                                <p className={cn('font-semibold text-sm', heading)}>Review-by-Review Breakdown</p>
                                <span className={cn('text-xs px-3 py-1 rounded-full border',
                                    isDark ? 'border-zinc-700 text-zinc-500' : 'border-slate-200 text-slate-400')}>
                                    {result.results.length} reviews
                                </span>
                            </div>

                            <div className={cn('divide-y', divider)}>
                                {result.results.map((r, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={cn('cursor-pointer transition-colors', rowHover)}
                                        onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                                    >
                                        <div className="px-5 py-3.5">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Index */}
                                                <span className={cn('text-xs font-mono w-5 text-right shrink-0', subText)}>
                                                    {idx + 1}
                                                </span>
                                                {/* Emoji */}
                                                <span className="text-xl shrink-0">{r.emoji}</span>
                                                {/* Review text + key phrase */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn('text-sm truncate', isDark ? 'text-zinc-200' : 'text-slate-800')}>
                                                        {r.review}
                                                    </p>
                                                    <p className={cn('text-xs mt-0.5 leading-snug', subText)}>
                                                        Key phrase:{' '}
                                                        <span className={cn('font-medium', getLabelColor(r.label))}>
                                                            "{r.keyPhrase}"
                                                        </span>
                                                    </p>
                                                </div>
                                                {/* Badge */}
                                                <span className={cn(
                                                    'px-2.5 py-1 text-xs rounded-full border font-semibold flex items-center gap-1 shrink-0',
                                                    getLabelBg(r.label)
                                                )}>
                                                    {getLabelIcon(r.label)} {r.label}
                                                </span>
                                                {/* Chevron */}
                                                <motion.span
                                                    animate={{ rotate: expandedIdx === idx ? 180 : 0 }}
                                                    transition={{ duration: 0.18 }}
                                                    className={cn('shrink-0', subText)}
                                                >
                                                    <ChevronDown size={14} />
                                                </motion.span>
                                            </div>
                                            {/* Score bar */}
                                            <div className="mt-2 pl-14">
                                                <ScoreBar score={r.score} />
                                            </div>
                                        </div>

                                        {/* Expanded */}
                                        <AnimatePresence>
                                            {expandedIdx === idx && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className={cn(
                                                        'px-5 pb-4 pl-14 text-sm leading-relaxed',
                                                        isDark ? 'text-zinc-300' : 'text-slate-600'
                                                    )}>
                                                        <span className={cn('font-medium mr-1', subText)}>Full review:</span>
                                                        "{r.review}"
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
