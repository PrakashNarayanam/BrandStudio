import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Star, TrendingUp, AlertTriangle, Lightbulb, Bookmark, Check } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandAuditResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { useBrand } from '../contexts/BrandContext';
import { SuccessFlow } from './SuccessFlow';
import { cn } from '../lib/utils';

function ScoreRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
    const radius = (size - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={6} fill="none" stroke="currentColor" className="text-zinc-800/50" />
            <motion.circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={6} fill="none"
                stroke={color} strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
        </svg>
    );
}

const DIMENSION_CONFIG = [
    { key: 'clarity', label: 'Clarity', color: '#10b981', hex: '#10b981' },
    { key: 'uniqueness', label: 'Uniqueness', color: '#6366f1', hex: '#6366f1' },
    { key: 'memorability', label: 'Memorability', color: '#f59e0b', hex: '#f59e0b' },
    { key: 'consistency', label: 'Consistency', color: '#3b82f6', hex: '#3b82f6' },
    { key: 'emotionalResonance', label: 'Emotional', color: '#ec4899', hex: '#ec4899' },
] as const;

function getGrade(score: number) {
    if (score >= 90) return { grade: 'A+', color: 'text-emerald-400' };
    if (score >= 80) return { grade: 'A', color: 'text-emerald-500' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-400' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-400' };
    return { grade: 'D', color: 'text-red-400' };
}

export const BrandAudit: React.FC = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { selectedBrand } = useBrand();
    const { saveItem } = useCollections();
    const [brandName, setBrandName] = useState('');
    const [description, setDescription] = useState('');
    const [industry, setIndustry] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BrandAuditResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Pre-fill when navigated
    useEffect(() => {
        if (selectedBrand) {
            setBrandName(selectedBrand);
            setResult(null);
            setError(null);
        }
    }, [selectedBrand]);

    const saveAudit = async () => {
        if (!result) return;
        setIsSaving(true);
        try {
            await saveItem({
                type: 'audit',
                label: `Audit: ${brandName || selectedBrand}`,
                data: result
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            console.error("Save audit error", err);
        } finally {
            setIsSaving(false);
        }
    };

    const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
    const resultCard = isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-slate-50 border-slate-200';
    const input = isDark
        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-yellow-500/20'
        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-yellow-400/30';
    const label = isDark ? 'text-zinc-400' : 'text-slate-600';
    const heading = isDark ? 'text-white' : 'text-slate-900';
    const muted = isDark ? 'text-zinc-500' : 'text-slate-400';
    const bodyText = isDark ? 'text-zinc-300' : 'text-slate-700';
    const track = isDark ? 'bg-zinc-800' : 'bg-slate-200';

    const handleAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null); setResult(null);
        try {
            setResult(await geminiService.auditBrand(brandName, description, industry));
        } catch (err: any) {
            setError(err?.message || 'Failed to audit brand. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const { grade, color: gradeColor } = result ? getGrade(result.overallScore) : { grade: '', color: '' };

    return (
        <div className="space-y-8">
            <div className={cn('border p-6 rounded-2xl', card)}>
                <h2 className={cn('text-2xl font-semibold mb-1 flex items-center gap-2', heading)}>
                    <ShieldCheck className="text-yellow-500" /> Brand Audit
                </h2>
                <p className={cn('text-sm mb-6', muted)}>Get a comprehensive AI-powered brand health assessment</p>
                <form onSubmit={handleAudit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={cn('text-sm font-medium', label)}>Brand Name</label>
                            <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)}
                                placeholder="e.g. Airbnb, Tesla" required
                                className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} />
                        </div>
                        <div className="space-y-2">
                            <label className={cn('text-sm font-medium', label)}>Industry</label>
                            <input type="text" value={industry} onChange={e => setIndustry(e.target.value)}
                                placeholder="e.g. Travel & Hospitality" required
                                className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className={cn('text-sm font-medium', label)}>Brand Description / Mission</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your brand identity, mission, values, and how you position yourself..."
                            rows={4} required
                            className={cn('w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all resize-none', input)} />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                        {loading ? 'Auditing Brand...' : 'Run Brand Audit'}
                    </button>
                </form>
                {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Overall Score */}
                        <div className={cn('border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8 relative', resultCard)}>
                            <button
                                onClick={saveAudit}
                                disabled={isSaving || isSaved}
                                className={cn(
                                    'absolute top-4 right-4 p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider',
                                    isSaved ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'hover:bg-zinc-800 border-zinc-700 text-zinc-400'
                                )}
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <Check size={14} /> : <Bookmark size={14} />}
                                {isSaved ? 'Saved' : 'Save Result'}
                            </button>
                            <div className="relative shrink-0">
                                <ScoreRing score={result.overallScore} color="#10b981" size={120} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={cn('text-3xl font-black', gradeColor)}>{grade}</span>
                                    <span className={cn('text-xs', muted)}>{result.overallScore}/100</span>
                                </div>
                            </div>
                            <div>
                                <h3 className={cn('text-2xl font-bold mb-2', heading)}>Brand Score: {result.overallScore}/100</h3>
                                <p className={cn('text-sm leading-relaxed mb-4', bodyText)}>{result.summary}</p>
                                <div className="flex items-center gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.round(result.overallScore / 20) ? '#f59e0b' : 'none'}
                                            className={i < Math.round(result.overallScore / 20) ? 'text-yellow-400' : muted} />
                                    ))}
                                    <span className={cn('text-xs ml-1', muted)}>Brand Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Dimension scores */}
                        <div className={cn('border rounded-2xl p-6', resultCard)}>
                            <h4 className={cn('font-semibold mb-6', heading)}>Dimension Breakdown</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                {DIMENSION_CONFIG.map(dim => {
                                    const score = result.scores[dim.key as keyof typeof result.scores];
                                    return (
                                        <div key={dim.key} className="flex flex-col items-center gap-2">
                                            <div className="relative">
                                                <ScoreRing score={score} color={dim.hex} size={72} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className={cn('text-sm font-bold', heading)}>{score}</span>
                                                </div>
                                            </div>
                                            <span className={cn('text-xs text-center', muted)}>{dim.label}</span>
                                            <div className={cn('h-1 w-full rounded-full', track)}>
                                                <motion.div className="h-full rounded-full" style={{ backgroundColor: dim.hex }}
                                                    initial={{ width: 0 }} animate={{ width: `${score}%` }}
                                                    transition={{ duration: 0.8, delay: 0.3 }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div className={cn('border rounded-2xl p-6 space-y-3', resultCard)}>
                                <h4 className={cn('font-semibold flex items-center gap-2', heading)}>
                                    <TrendingUp size={17} className="text-emerald-500" /> Strengths
                                </h4>
                                {result.strengths.map((s, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <p className={cn('text-sm', bodyText)}>{s}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Weaknesses */}
                            <div className={cn('border rounded-2xl p-6 space-y-3', resultCard)}>
                                <h4 className={cn('font-semibold flex items-center gap-2', heading)}>
                                    <Star size={17} className="text-red-400" /> Areas to Improve
                                </h4>
                                {result.weaknesses.map((w, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                        <p className={cn('text-sm', bodyText)}>{w}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className={cn('border rounded-2xl p-6 space-y-4', resultCard)}>
                            <h4 className={cn('font-semibold flex items-center gap-2', heading)}>
                                <Lightbulb size={17} className="text-yellow-500" /> Action Recommendations
                            </h4>
                            <div className="space-y-3">
                                {result.recommendations.map((rec, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        className={cn('flex items-start gap-4 p-3 rounded-xl border', isDark ? 'bg-zinc-950/40 border-zinc-800' : 'bg-white border-slate-200')}>
                                        <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0 text-xs font-bold">
                                            {i + 1}
                                        </div>
                                        <p className={cn('text-sm leading-relaxed', bodyText)}>{rec}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <SuccessFlow currentTab="audit" brandName={brandName || selectedBrand || 'your brand'} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
