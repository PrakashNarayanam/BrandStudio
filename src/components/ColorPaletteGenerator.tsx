import React, { useState, useEffect } from 'react';
import { Palette, Loader2, Copy, Check, Download, Image as ImageIcon, Bookmark } from 'lucide-react';

import { geminiService } from '../services/gemini';
import { ColorPaletteResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useCollections } from '../contexts/CollectionsContext';
import { SuccessFlow } from './SuccessFlow';
import { cn } from '../lib/utils';


function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

function isLight(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

const MOODS = ['Professional', 'Playful', 'Luxurious', 'Minimalist', 'Bold', 'Natural', 'Futuristic', 'Warm'];

export const ColorPaletteGenerator: React.FC = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { selectedBrand, setSelectedPalette, navigateTo } = useBrand();
    const { saveItem } = useCollections();

    const [brandName, setBrandName] = useState('');
    const [industry, setIndustry] = useState('');
    const [mood, setMood] = useState('Professional');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ColorPaletteResult | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Pre-fill brand name when navigated from other tools
    useEffect(() => {
        if (selectedBrand) {
            setBrandName(selectedBrand);
            setResult(null);
            setError(null);
        }
    }, [selectedBrand]);

    const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
    const input = isDark
        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-pink-500/20'
        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-pink-400/30';
    const label = isDark ? 'text-zinc-400' : 'text-slate-600';
    const heading = isDark ? 'text-white' : 'text-slate-900';
    const muted = isDark ? 'text-zinc-500' : 'text-slate-400';
    const resultCard = isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-slate-50 border-slate-200';

    const copy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopied(hex);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null); setResult(null); setIsSaved(false);
        try {
            setResult(await geminiService.generateColorPalette(brandName, industry, mood));
        } catch (err: any) {
            setError(err?.message || 'Failed to generate palette. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadCSS = () => {
        if (!result) return;
        const css = `:root {\n${result.colors.map(c => `  --color-${c.role.toLowerCase()}: ${c.hex}; /* ${c.name} */`).join('\n')}\n}`;
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-palette.css`;
        a.click(); URL.revokeObjectURL(url);
    };

    const saveToCollection = async () => {
        if (!result) return;
        setIsSaving(true);
        try {
            await saveItem({
                type: 'palette',
                label: result.paletteName,
                data: result
            });

            setIsSaved(true);
        } catch (err) {
            console.error("Error saving palette:", err);
            setError("Failed to save palette to collection.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className={cn('border p-6 rounded-2xl', card)}>
                <h2 className={cn('text-2xl font-semibold mb-1 flex items-center gap-2', heading)}>
                    <Palette className="text-pink-500" /> Color Palette Generator
                </h2>
                <p className={cn('text-sm mb-6', muted)}>AI-crafted brand color palettes with role assignments</p>
                <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className={cn('text-sm font-medium', label)}>Brand Name</label>
                        <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)}
                            placeholder="e.g. NovaPeak" required
                            className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} />
                    </div>
                    <div className="space-y-2">
                        <label className={cn('text-sm font-medium', label)}>Industry</label>
                        <input type="text" value={industry} onChange={e => setIndustry(e.target.value)}
                            placeholder="e.g. Wellness, Fintech" required
                            className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} />
                    </div>
                    <div className="space-y-2">
                        <label className={cn('text-sm font-medium', label)}>Mood / Vibe</label>
                        <select value={mood} onChange={e => setMood(e.target.value)}
                            className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)}>
                            {MOODS.map(m => <option key={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <button type="submit" disabled={loading}
                            className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : <Palette size={18} />}
                            {loading ? 'Generating Palette...' : 'Generate Color Palette'}
                        </button>
                    </div>
                </form>
                {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Palette header */}
                        <div className={cn('border p-5 rounded-2xl flex items-center justify-between', resultCard)}>
                            <div>
                                <h3 className={cn('text-xl font-bold', heading)}>{result.paletteName}</h3>
                                <p className={cn('text-sm', muted)}>Mood: {result.mood}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={saveToCollection} disabled={isSaving || isSaved}
                                    className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                                        isSaved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                            isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100')}>
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <Check size={14} /> : <Bookmark size={14} />}
                                    {isSaved ? 'Saved' : 'Save'}
                                </button>
                                <button onClick={downloadCSS}
                                    className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all', isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100')}>
                                    <Download size={14} /> CSS Variables
                                </button>
                            </div>
                        </div>

                        {/* Color strip preview */}
                        <div className="flex h-20 rounded-2xl overflow-hidden shadow-lg">
                            {result.colors.map((color, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ flex: 0 }} animate={{ flex: 1 }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                    className="relative group cursor-pointer"
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() => copy(color.hex)}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                        {copied === color.hex ? <Check size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Color cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {result.colors.map((color, i) => (
                                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.07 }}
                                    className={cn('border rounded-2xl overflow-hidden', resultCard)}>
                                    <div
                                        className="h-24 relative group cursor-pointer"
                                        style={{ backgroundColor: color.hex }}
                                        onClick={() => copy(color.hex)}
                                    >
                                        <div className={cn('absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full',
                                            isLight(color.hex) ? 'bg-black/10 text-black/70' : 'bg-white/20 text-white')}>
                                            {color.role}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                            {copied === color.hex ? <Check className="text-white drop-shadow" /> : <Copy className="text-white drop-shadow" />}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className={cn('text-sm font-semibold', heading)}>{color.name}</p>
                                            <button onClick={() => copy(color.hex)} className={cn('text-xs font-mono px-2 py-0.5 rounded-lg transition-colors',
                                                isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800')}>
                                                {color.hex}
                                            </button>
                                        </div>
                                        <p className={cn('text-xs leading-relaxed', muted)}>{color.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Usage guide */}
                        <div className={cn('border p-5 rounded-2xl', resultCard)}>
                            <h4 className={cn('font-semibold mb-2', heading)}>Usage Guidelines</h4>
                            <p className={cn('text-sm leading-relaxed', muted)}>{result.usage}</p>
                            <div className="mt-6 pt-6 border-t border-zinc-500/10">
                                <button
                                    onClick={() => {
                                        const paletteColors = result.colors.map(c => c.name).join(' and ');
                                        setSelectedPalette(paletteColors);
                                        navigateTo('logo', brandName);
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <ImageIcon size={18} /> Apply this Palette to Logo Designer
                                </button>
                            </div>
                        </div>

                        {/* Next Steps flow */}
                        <SuccessFlow currentTab="palette" brandName={brandName} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

