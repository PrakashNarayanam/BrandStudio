import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Copy, Check, Instagram, Info, MessageSquare, Sparkles, Wand2, Bookmark } from 'lucide-react';

import { geminiService } from '../services/gemini';
import { BrandingContent } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useCollections } from '../contexts/CollectionsContext';
import { SuccessFlow } from './SuccessFlow';
import { cn } from '../lib/utils';

export const ContentGenerator: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { selectedBrand } = useBrand();
  const { saveItem } = useCollections();

  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<BrandingContent | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Pre-fill brand name when navigated from BrandNameGenerator
  useEffect(() => {
    if (selectedBrand) {
      setBrandName(selectedBrand);
      setContent(null);
      setError(null);
    }
  }, [selectedBrand]);

  const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const resultCard = isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-slate-50 border-slate-200';
  const innerCard = isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const input = isDark
    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-purple-500/20'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-purple-500/30';
  const label = isDark ? 'text-zinc-400' : 'text-slate-600';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const subLabel = isDark ? 'text-zinc-400' : 'text-slate-500';
  const bodyText = isDark ? 'text-zinc-300' : 'text-slate-700';
  const copyBtn = isDark ? 'hover:bg-zinc-800 text-zinc-500 hover:text-white' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700';

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setIsSaved(false);
    try {
      setContent(await geminiService.generateContent(brandName, industry));
    } catch (err: any) {
      setError(err?.message || 'Failed to generate. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const saveToCollection = async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      await saveItem({
        type: 'content',
        label: `${brandName} Content`,
        data: content
      });
      setIsSaved(true);
    } catch (err) {
      console.error("Error saving content:", err);
      setError("Failed to save content to collection.");
    } finally {
      setIsSaving(false);
    }
  };


  const platforms = ['LinkedIn', 'Instagram', 'Twitter / X'];

  return (
    <div className="space-y-8">
      <div className={cn('border p-6 rounded-2xl', card)}>
        <h2 className={cn('text-2xl font-semibold mb-6 flex items-center gap-2', heading)}>
          <FileText className="text-purple-500" /> Content Lab
        </h2>

        {/* Pre-fill banner */}
        <AnimatePresence>
          {selectedBrand && brandName === selectedBrand && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={cn('mb-4 px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm',
                isDark ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200')}
            >
              <Wand2 size={14} className="text-purple-400 shrink-0" />
              <span className={isDark ? 'text-purple-300' : 'text-purple-700'}>
                Brand name <strong>"{selectedBrand}"</strong> pre-filled from Brand Name Generator.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={cn('text-sm font-medium', label)}>Brand Name</label>
            <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)}
              placeholder="e.g. EcoFlow"
              className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} required />
          </div>
          <div className="space-y-2">
            <label className={cn('text-sm font-medium', label)}>Industry</label>
            <input type="text" value={industry} onChange={e => setIndustry(e.target.value)}
              placeholder="e.g. Sustainable Energy"
              className={cn('w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all', input)} required />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
              {loading ? 'Generating Content...' : 'Generate Branding Content'}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
      </div>

      {content && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={cn('border p-6 rounded-2xl space-y-4', resultCard)}>
            <div className="flex justify-between items-center">
              <h3 className={cn('flex items-center gap-2 font-medium', subLabel)}><Sparkles size={16} className="text-purple-500" />Tagline</h3>
              <div className="flex items-center gap-2">
                <button onClick={saveToCollection} disabled={isSaving || isSaved}
                  className={cn('p-2 rounded-lg transition-all border',
                    isSaved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-white' : 'border-slate-200 hover:bg-slate-200 text-slate-400 hover:text-slate-700')}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : isSaved ? <Check size={16} /> : <Bookmark size={16} />}
                </button>
                <button onClick={() => copy(content.tagline, 'tagline')} className={cn('p-2 rounded-lg transition-colors border',
                  isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-white' : 'border-slate-200 hover:bg-slate-200 text-slate-400 hover:text-slate-700')}>
                  {copiedKey === 'tagline' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <p className={cn('text-2xl font-bold italic', heading)}>"{content.tagline}"</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={cn('border p-6 rounded-2xl space-y-4', resultCard)}>
            <div className="flex justify-between items-center">
              <h3 className={cn('flex items-center gap-2 font-medium', subLabel)}><Instagram size={16} className="text-pink-500" />Instagram Bio</h3>
              <button onClick={() => copy(content.instagramBio, 'bio')} className={cn('p-2 rounded-lg transition-colors', copyBtn)}>
                {copiedKey === 'bio' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
            <p className={cn('leading-relaxed whitespace-pre-wrap', bodyText)}>{content.instagramBio}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={cn('md:col-span-2 border p-6 rounded-2xl space-y-4', resultCard)}>
            <div className="flex justify-between items-center">
              <h3 className={cn('flex items-center gap-2 font-medium', subLabel)}><Info size={16} className="text-blue-500" />About Us</h3>
              <button onClick={() => copy(content.aboutUs, 'about')} className={cn('p-2 rounded-lg transition-colors', copyBtn)}>
                {copiedKey === 'about' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
            <p className={cn('leading-relaxed', bodyText)}>{content.aboutUs}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={cn('md:col-span-2 border p-6 rounded-2xl space-y-4', resultCard)}>
            <h3 className={cn('flex items-center gap-2 font-medium', subLabel)}><MessageSquare size={16} className="text-emerald-500" />Social Media Captions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.socialCaptions.map((caption, idx) => (
                <div key={idx} className={cn('border p-4 rounded-xl relative group', innerCard)}>
                  <p className={cn('text-xs font-semibold mb-2', subLabel)}>{platforms[idx]}</p>
                  <p className={cn('text-sm mb-8', bodyText)}>{caption}</p>
                  <button onClick={() => copy(caption, `c-${idx}`)} className={cn('absolute bottom-3 right-3 p-2 rounded-lg transition-colors', copyBtn)}>
                    {copiedKey === `c-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="md:col-span-2">
            <SuccessFlow currentTab="content" brandName={brandName} />
          </div>
        </div>
      )}
    </div>
  );
};

