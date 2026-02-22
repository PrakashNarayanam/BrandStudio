import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Copy, Check, Image as ImageIcon, FileText, ShieldCheck, ChevronRight, Bookmark, Globe, RefreshCw } from 'lucide-react';

import { geminiService } from '../services/gemini';
import { BrandName } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useCollections } from '../contexts/CollectionsContext';
import { cn } from '../lib/utils';

export const BrandNameGenerator: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { navigateTo } = useBrand();
  const { saveItem } = useCollections();

  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [personality, setPersonality] = useState('Modern');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BrandName[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());
  const [availabilities, setAvailabilities] = useState<Record<string, { isAvailable: boolean; reasoning: string; suggestedDomain?: string }>>({});
  const [refineCounts, setRefineCounts] = useState<Record<number, number>>({});


  const handleSurprise = async () => {
    setIsSuggesting(true); setError(null);
    try {
      const suggestion = await geminiService.suggestNamingContext();
      setIndustry(suggestion.industry);
      setAudience(suggestion.audience);
      setPersonality(suggestion.personality);
    } catch (err: any) {
      setError("AI failed to suggest. Try again.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleVerify = async (name: string, id: string) => {
    if (verifyingIds.has(id)) return;
    setVerifyingIds(prev => new Set([...prev, id]));
    try {
      const res = await geminiService.checkNameAvailability(name);
      setAvailabilities(prev => ({ ...prev, [id]: res }));
    } catch (err) {
      console.error("Verification failed", err);
    } finally {
      setVerifyingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRefine = async (originalName: string, idx: number) => {
    const id = `name-${idx}`;
    const currentCount = (refineCounts[idx] || 0) + 1;
    setRefineCounts(prev => ({ ...prev, [idx]: currentCount }));

    setVerifyingIds(prev => new Set([...prev, id]));
    try {
      // If we've refined 3+ times, we demand absolute uniqueness (coined/abstract words)
      const isUrgent = currentCount >= 3;
      const newName = await geminiService.suggestSimilarName(originalName, isUrgent);

      setResults(prev => {
        const next = [...prev];
        next[idx] = newName;
        return next;
      });
      // Clear availability for the new name so it can be re-checked or auto-checked
      setAvailabilities(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      // Auto-verify the new name
      handleVerify(newName.name, id);
    } catch (err) {
      setError("Failed to refine name.");
    } finally {
      setVerifyingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSavedIds(new Set());
    setAvailabilities({}); setVerifyingIds(new Set()); setRefineCounts({});
    try {
      const names = await geminiService.generateBrandNames(industry, audience, personality);
      setResults(names);
      // Auto-verify top names in background
      names.slice(0, 5).forEach((item, i) => handleVerify(item.name, `name-${i}`));
    } catch (err: any) {
      setError(err?.message || 'Failed to generate. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveToCollection = async (item: BrandName, id: string) => {
    setSavingId(id);
    try {
      await saveItem({
        type: 'brand_name',
        label: item.name,
        data: item
      });
      setSavedIds(prev => new Set([...prev, id]));
    } catch (err) {
      console.error("Error saving brand name:", err);
      setError("Failed to save brand name to collection.");
    } finally {
      setSavingId(null);
    }
  };

  const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const input = isDark
    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-emerald-500/20'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-emerald-500/30';
  const label = isDark ? 'text-zinc-400' : 'text-slate-600';
  const nameText = isDark ? 'text-white' : 'text-slate-900';
  const explainText = isDark ? 'text-zinc-400' : 'text-slate-500';
  const resultCard = isDark ? 'bg-zinc-950/40 border-zinc-800 hover:border-emerald-500/30' : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm';

  const actions = [
    {
      label: 'Design Logo',
      tab: 'logo' as const,
      icon: ImageIcon,
      color: isDark
        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400'
        : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
    },
    {
      label: 'Write Content',
      tab: 'content' as const,
      icon: FileText,
      color: isDark
        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400'
        : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100',
    },
    {
      label: 'Brand Audit',
      tab: 'audit' as const,
      icon: ShieldCheck,
      color: isDark
        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400'
        : 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100',
    },

  ];

  return (
    <div className="space-y-8">
      <div className={cn('border p-6 rounded-2xl', card)}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={cn('text-2xl font-semibold flex items-center gap-2', nameText)}>
            <Sparkles className="text-emerald-500" /> Brand Name Generator
          </h2>
          <button
            type="button"
            onClick={handleSurprise}
            disabled={isSuggesting}
            className={cn(
              'text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all',
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 shadow-sm'
            )}
          >
            {isSuggesting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isSuggesting ? 'Thinking...' : 'AI Surprise'}
          </button>
        </div>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={cn('text-sm font-medium', label)}>Industry</label>
            <input type="text" value={industry} onChange={e => setIndustry(e.target.value)}
              placeholder="e.g. Fintech, Organic Food"
              className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} required />
          </div>
          <div className="space-y-2">
            <label className={cn('text-sm font-medium', label)}>Target Audience</label>
            <input type="text" value={audience} onChange={e => setAudience(e.target.value)}
              placeholder="e.g. Gen Z, Professionals"
              className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} required />
          </div>
          <div className="space-y-2">
            <label className={cn('text-sm font-medium', label)}>Personality</label>
            <select value={personality} onChange={e => setPersonality(e.target.value)}
              className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)}>
              {['Modern', 'Luxury', 'Playful', 'Minimalist', 'Bold', 'Tech-focused'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Generating Unique Names...' : 'Generate Brand Names'}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className={cn('text-sm flex items-center gap-1.5', explainText)}>
              <Sparkles size={13} className="text-emerald-500" />
              AI automatically verifies top names. If "Likely Taken", click Refine to get a similar unique name.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {results.map((item, idx) => {
                const id = `name-${idx}`;
                const isSaved = savedIds.has(id);
                const isSaving = savingId === id;
                const isVerifying = verifyingIds.has(id);
                const availability = availabilities[id];

                return (
                  <motion.div key={`${idx}-${item.name}`}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn('group border p-5 rounded-2xl transition-all', resultCard)}>

                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <h3 className={cn('text-xl font-bold', nameText)}>{item.name}</h3>
                        <div className="flex flex-col gap-2 mt-1">
                          <div className="flex items-center gap-2">
                            {!availability && isVerifying && (
                              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <Loader2 size={10} className="animate-spin" /> Verifying...
                              </span>
                            )}

                            {availability && (
                              <div className="flex items-center gap-2">
                                <span className={cn('text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                                  availability.isAvailable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                                  {availability.isAvailable ? 'Available' : 'Likely Taken'}
                                </span>
                                {!availability.isAvailable && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleRefine(item.name, idx)}
                                      className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1 hover:text-blue-400"
                                    >
                                      <RefreshCw size={10} /> Refine {(refineCounts[idx] || 0) > 0 && `(${refineCounts[idx]})`}
                                    </button>
                                    {(refineCounts[idx] || 0) >= 3 && (
                                      <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-1 rounded animate-pulse">Deep Search Active</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {availability?.isAvailable && (refineCounts[idx] || 0) >= 3 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className={cn('flex items-center justify-between p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 mt-1')}
                            >
                              <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-tighter">Recommended Domain</span>
                                <span className={cn('text-xs font-mono font-bold', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                                  {availability.suggestedDomain || `${item.name.toLowerCase().replace(/\s+/g, '')}.com`}
                                </span>
                              </div>

                            </motion.div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => saveToCollection(item, id)}
                          disabled={isSaved || isSaving}
                          className={cn('p-2 rounded-lg transition-colors shrink-0',
                            isSaved ? 'text-emerald-500' :
                              isDark ? 'hover:bg-zinc-800 text-zinc-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700')}
                        >
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : isSaved ? <Check size={16} /> : <Bookmark size={16} />}
                        </button>
                        <button onClick={() => copy(item.name)}
                          className={cn('p-2 rounded-lg transition-colors shrink-0',
                            isDark ? 'hover:bg-zinc-800 text-zinc-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700')}>
                          {copied === item.name ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <p className={cn('text-sm leading-relaxed mb-4', explainText)}>{item.explanation}</p>

                    <div className={cn('pt-3 border-t flex flex-wrap gap-2', isDark ? 'border-zinc-800' : 'border-slate-200')}>
                      {actions.map(action => (
                        <button
                          key={action.tab}
                          onClick={() => navigateTo(action.tab, item.name)}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105 active:scale-95',
                            action.color
                          )}
                        >
                          <action.icon size={12} />
                          {action.label}
                          <ChevronRight size={11} className="opacity-60" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
