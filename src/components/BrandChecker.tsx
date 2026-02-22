import React, { useState, useEffect } from 'react';
import { Search, Globe, AlertCircle, CheckCircle2, RefreshCw, ArrowRight, Sparkles, Loader2, ShieldCheck, MapPin, ExternalLink, Bookmark, Check } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { useBrand } from '../contexts/BrandContext';
import { cn } from '../lib/utils';
import { BrandName } from '../types';

export const BrandChecker: React.FC = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { selectedBrand } = useBrand();
    const { saveItem } = useCollections();
    const [name, setName] = useState(selectedBrand || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ isAvailable: boolean; suggestedDomain: string; reasoning: string } | null>(null);
    const [alternative, setAlternative] = useState<BrandName | null>(null);
    const [isGeneratingAlt, setIsGeneratingAlt] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const saveAlternative = async () => {
        if (!alternative) return;
        setIsSaving(true);
        try {
            await saveItem({
                type: 'brand_name',
                label: alternative.name,
                data: alternative
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            console.error("Save alt error", err);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (selectedBrand) {
            setName(selectedBrand);
            setResult(null);
            setAlternative(null);
        }
    }, [selectedBrand]);


    const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
    const input = isDark
        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-blue-500/20'
        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500/30';
    const heading = isDark ? 'text-white' : 'text-slate-900';
    const subText = isDark ? 'text-zinc-500' : 'text-slate-500';

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setAlternative(null);
        try {
            const check = await geminiService.checkNameAvailability(name);
            setResult(check);
        } catch (err: any) {
            setError(err?.message || "Failed to check name. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAlternative = async () => {
        if (!name) return;
        setIsGeneratingAlt(true);
        try {
            const alt = await geminiService.suggestSimilarName(name);
            setAlternative(alt);
        } catch (err: any) {
            setError("Failed to generate alternative suggestion.");
        } finally {
            setIsGeneratingAlt(false);
        }
    };

    const useAlternative = () => {
        if (alternative) {
            setName(alternative.name);
            setResult(null);
            setAlternative(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className={cn('text-3xl font-bold tracking-tight', heading)}>Check Name & Domain</h2>
                <p className={subText}>Verify if your brand name is available and find the perfect domain.</p>
            </div>

            {/* Main Search */}
            <div className={cn('border p-8 rounded-3xl', card)}>
                <form onSubmit={handleCheck} className="relative">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter brand name (e.g. NovaPeak)"
                            className={cn('w-full pl-12 pr-32 py-4 rounded-2xl border text-lg focus:outline-none focus:ring-4 transition-all', input)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 rounded-xl font-medium transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                            {loading ? 'Checking...' : 'Check'}
                        </button>
                    </div>
                </form>
                {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
            </div>

            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Status Card */}
                        <div className={cn('border p-6 rounded-3xl relative overflow-hidden', card)}>
                            <div className={cn('absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full opacity-20',
                                result.isAvailable ? 'bg-emerald-500' : 'bg-red-500'
                            )} />

                            <div className="flex items-start gap-4 mb-4">
                                {result.isAvailable ? (
                                    <CheckCircle2 className="text-emerald-500 shrink-0" size={28} />
                                ) : (
                                    <AlertCircle className="text-red-500 shrink-0" size={28} />
                                )}
                                <div>
                                    <h3 className={cn('text-xl font-bold', heading)}>
                                        {result.isAvailable ? 'Likely Available!' : 'Heads up: Already In Use'}
                                    </h3>
                                    <p className={cn('text-sm mt-1', subText)}>{result.reasoning}</p>
                                </div>
                            </div>

                            {!result.isAvailable && (
                                <div className="mt-8 pt-6 border-t border-zinc-800/50">
                                    <p className={cn('text-sm font-medium mb-3', heading)}>What happened?</p>
                                    <p className={cn('text-xs leading-relaxed mb-4', subText)}>
                                        Our AI strategist found existing trademarks or heavy digital presence for this name. To avoid legal issues and branding confusion, we recommend choosing a unique alternative.
                                    </p>
                                    <button
                                        onClick={handleGenerateAlternative}
                                        disabled={isGeneratingAlt}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-700"
                                    >
                                        {isGeneratingAlt ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                        Find Alternative with Same Meaning
                                    </button>
                                </div>
                            )}

                            {result.isAvailable && (
                                <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="text-xs text-emerald-400 font-semibold mb-1 uppercase tracking-wider">Suggested Domain</p>
                                    <p className={cn('text-lg font-bold', heading)}>{result.suggestedDomain}</p>
                                </div>
                            )}
                        </div>

                        {/* Alternative Suggestions */}
                        <AnimatePresence>
                            {alternative && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn('border p-6 rounded-3xl border-blue-500/20 bg-blue-500/5 relative', isDark ? '' : 'bg-blue-50')}
                                >
                                    <button
                                        onClick={saveAlternative}
                                        disabled={isSaving || isSaved}
                                        className={cn(
                                            'absolute top-4 right-4 p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider',
                                            isSaved ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'hover:bg-zinc-800 border-zinc-700 text-zinc-400'
                                        )}
                                    >
                                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <Check size={14} /> : <Bookmark size={14} />}
                                        {isSaved ? 'Saved' : 'Save'}
                                    </button>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="text-blue-500" size={20} />
                                        <h3 className={cn('font-bold', heading)}>AI Suggested Alternative</h3>
                                    </div>
                                    <div className="bg-zinc-950/40 p-5 rounded-2xl border border-blue-500/10 mb-6">
                                        <p className={cn('text-2xl font-black mb-2 text-blue-400')}>{alternative.name}</p>
                                        <p className={cn('text-sm leading-relaxed', subText)}>{alternative.explanation}</p>
                                    </div>
                                    <button
                                        onClick={useAlternative}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
                                    >
                                        Use This Name Instead
                                        <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Domain Extensions Grid (Dummy data for demo) */}
                        {result.isAvailable && !alternative && (
                            <div className="space-y-4">
                                <h4 className={cn('text-sm font-bold uppercase tracking-widest px-1', subText)}>Top Extensions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { ext: '.com', price: '$12.99', available: true },
                                        { ext: '.io', price: '$39.00', available: true },
                                        { ext: '.co', price: '$24.00', available: true },
                                        { ext: '.app', price: '$18.00', available: false },
                                    ].map((d) => (
                                        <div key={d.ext} className={cn('p-4 rounded-2xl border flex items-center justify-between', card)}>
                                            <div>
                                                <p className={cn('font-bold', heading)}>{name.toLowerCase().replace(/\s+/g, '')}{d.ext}</p>
                                                <p className="text-[10px] text-zinc-500">{d.price}/yr</p>
                                            </div>
                                            {d.available ? (
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            ) : (
                                                <AlertCircle size={14} className="text-red-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                {[
                    { icon: ShieldCheck, title: 'Trademark Safe', desc: 'Checks against global registry' },
                    { icon: MapPin, title: 'Local Search', desc: 'Checks localized brand presence' },
                    { icon: ExternalLink, title: 'Direct Links', desc: 'Jump to registrar to buy' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
                            <item.icon className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className={cn('text-sm font-bold', heading)}>{item.title}</p>
                            <p className="text-xs text-zinc-500">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
