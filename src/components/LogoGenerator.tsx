import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Download, Wand2, AlertCircle, ChevronDown, ChevronUp, Lightbulb, Star, Palette, Sparkles, Bookmark, Check, Globe } from 'lucide-react';

import { geminiService } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useCollections } from '../contexts/CollectionsContext';
import { SuccessFlow } from './SuccessFlow';
import { cn } from '../lib/utils';

export const LogoGenerator: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { selectedBrand, selectedPalette, navigateTo } = useBrand();
  const { saveItem } = useCollections();



  const [brandName, setBrandName] = useState('');
  const [style, setStyle] = useState('Minimalist');
  const [palette, setPalette] = useState('');
  const [features, setFeatures] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Pre-fill brand name when navigated from BrandNameGenerator
  useEffect(() => {
    if (selectedBrand) {
      setBrandName(selectedBrand);
      setLogoUrl(null);
      setError(null);
    }
  }, [selectedBrand]);

  // Pre-fill palette when navigated from ColorPaletteGenerator
  useEffect(() => {
    if (selectedPalette) {
      setPalette(selectedPalette);
    }
  }, [selectedPalette]);

  const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const input = isDark
    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-blue-500/20'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500/30';
  const label = isDark ? 'text-zinc-400' : 'text-slate-600';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-zinc-500' : 'text-slate-400';
  const featureBox = isDark
    ? 'bg-blue-500/5 border-blue-500/20'
    : 'bg-blue-50 border-blue-200';

  const handleSuggest = async () => {
    if (!brandName.trim()) {
      setError("Please enter a brand name first so I can suggest ideas!");
      return;
    }
    setIsSuggesting(true); setError(null);
    try {
      const suggestion = await geminiService.suggestLogoIdea(brandName);
      setStyle(suggestion.style);
      setPalette(suggestion.palette);
      setFeatures(suggestion.features);
      setShowFeatures(true);
    } catch (err: any) {
      setError("AI suggestion failed. Please try again.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setLogoUrl(null); setIsSaved(false);
    try {
      setLogoUrl(await geminiService.generateLogo(brandName, style, palette, features));
    } catch (err: any) {
      setError(err?.message || 'Failed to generate logo. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!logoUrl) return;
    const a = document.createElement('a');
    a.href = logoUrl;
    a.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-logo.png`;
    a.click();
  };

  const saveToCollection = async () => {
    if (!logoUrl) return;
    setIsSaving(true);
    try {
      await saveItem({
        type: 'logo',
        label: `${brandName} Logo`,
        url: logoUrl,
        data: { style, palette, features }
      });
      setIsSaved(true);
    } catch (err) {
      console.error("Error saving logo:", err);
      setError("Failed to save logo to collection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={cn('border p-6 rounded-2xl', card)}>
        <h2 className={cn('text-2xl font-semibold mb-1 flex items-center gap-2', heading)}>
          <ImageIcon className="text-blue-500" /> Logo Generator
        </h2>
        <p className={cn('text-sm mb-6', subText)}>Powered by FLUX.1-schnell (Stable Diffusion) via HuggingFace</p>

        {/* Pre-fill banner */}
        <AnimatePresence>
          {selectedBrand && brandName === selectedBrand && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={cn('mb-4 px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm', featureBox)}
            >
              <Wand2 size={14} className="text-blue-400 shrink-0" />
              <span className={isDark ? 'text-blue-300' : 'text-blue-700'}>
                Brand name <strong>"{selectedBrand}"</strong> pre-filled from Brand Name Generator.
              </span>
            </motion.div>
          )}
          {selectedPalette && palette === selectedPalette && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={cn('mb-4 px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm',
                isDark ? 'bg-pink-500/5 border-pink-500/20' : 'bg-pink-50 border-pink-200')}
            >
              <Palette size={14} className="text-pink-400 shrink-0" />
              <span className={isDark ? 'text-pink-300' : 'text-pink-700'}>
                Color palette <strong>"{selectedPalette}"</strong> pre-filled from Palette Generator.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Magic Context Detection */}
        <AnimatePresence mode="wait">
          {brandName.length > 2 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="mb-6 flex flex-wrap gap-2">
              {brandName.toLowerCase().includes('smart') && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb size={10} /> Intelligence Optimization
                </span>
              )}
              {(brandName.toLowerCase().includes('intern') || brandName.toLowerCase().includes('edu')) && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Star size={10} /> Career & Education context
                </span>
              )}
              {(brandName.toLowerCase().includes('tech') || brandName.toLowerCase().includes('system')) && (
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={10} /> Tech Engine
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className={cn('text-sm font-medium', label)}>Brand Name</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('checker', brandName)}
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-2 py-1 rounded-md transition-all',
                    isDark
                      ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  )}
                >
                  <Globe size={10} /> Check availability
                </button>
                <button
                  type="button"
                  onClick={handleSuggest}
                  disabled={isSuggesting || !brandName}
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-2 py-1 rounded-md transition-all',
                    isDark
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-30'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50'
                  )}
                >
                  {isSuggesting ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  {isSuggesting ? 'Thinking...' : 'AI Suggestions'}
                </button>
              </div>

            </div>
            <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)}
              placeholder="Enter your brand name"
              className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} required />
          </div>
          <div className="space-y-2">
            <label className={cn('text-sm font-medium', label)}>Style</label>
            <select value={style} onChange={e => setStyle(e.target.value)}
              className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)}>
              {['Minimalist', 'Corporate', 'Monogram', 'Futuristic', 'Bold & Vibrant', 'Flat Design', 'Vintage', 'Abstract', 'Geometric', 'Hand-drawn'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className={cn('text-sm font-medium', label)}>Color Palette</label>
            <input type="text" value={palette} onChange={e => setPalette(e.target.value)}
              placeholder="e.g. Deep Blue and Gold, Emerald Green"
              className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} required />
          </div>

          {/* ── Optional Brand Features box ── */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setShowFeatures(v => !v)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                isDark
                  ? 'border-zinc-700 text-zinc-400 hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-500/5'
                  : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
              )}
            >
              <span className="flex items-center gap-2">
                <Lightbulb size={15} className={showFeatures ? 'text-blue-400' : ''} />
                Brand Features / Description
                <span className={cn('text-xs px-2 py-0.5 rounded-full border font-normal',
                  isDark ? 'border-zinc-700 text-zinc-600' : 'border-slate-200 text-slate-400')}>
                  optional
                </span>
              </span>
              {showFeatures ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            <AnimatePresence>
              {showFeatures && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-2">
                    <p className={cn('text-xs', subText)}>
                      Describe what your brand does, its values, key visuals, or any elements you want reflected in the logo.
                      The AI will weave these into the design prompt.
                    </p>
                    <textarea
                      value={features}
                      onChange={e => setFeatures(e.target.value)}
                      placeholder="e.g. We're an eco-friendly coffee brand focused on sustainability. Include a leaf motif, earthy tones, and a coffee cup. We serve young professionals who care about the planet."
                      rows={4}
                      className={cn('w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all resize-none text-sm', input)}
                    />
                    <p className={cn('text-xs', subText)}>
                      {features.length} / 400 characters
                      {features.length > 400 && <span className="text-red-400 ml-1">· Will be trimmed to 400 chars</span>}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="md:col-span-2">
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
              {loading ? 'Generating (~15-30s)...' : 'Generate Logo'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div><p className="font-medium">Generation failed</p><p className="text-red-300/80 mt-0.5">{error}</p></div>
          </div>
        )}
      </div>

      {logoUrl && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
            <div className="relative bg-white p-8 rounded-2xl shadow-2xl">
              <img src={logoUrl} alt="Generated Logo" className="w-64 h-64 object-contain" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={download}
              className={cn('flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium',
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white')}>
              <Download size={18} /> Download High-Res Logo
            </button>
            <button
              onClick={saveToCollection}
              disabled={isSaving || isSaved}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium border',
                isSaved
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              )}>
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : isSaved ? <Check size={18} /> : <Bookmark size={18} />}
              {isSaving ? 'Saving...' : isSaved ? 'Saved to Collections' : 'Save to Collection'}
            </button>
          </div>

          {/* Next Steps flow */}
          <SuccessFlow currentTab="logo" brandName={brandName} />
        </motion.div>
      )}
    </div>
  );
};

