import React, { useState, useEffect } from 'react';
import { BarChart3, Loader2, AlertCircle, CheckCircle2, MinusCircle, Sparkles, Bookmark, Check } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { SentimentResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { useBrand } from '../contexts/BrandContext';
import { SuccessFlow } from './SuccessFlow';
import { cn } from '../lib/utils';

export const SentimentAnalysis: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { selectedBrand } = useBrand();
  const { saveItem } = useCollections();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const saveSentiment = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await saveItem({
        type: 'sentiment',
        label: `Sentiment: ${selectedBrand || description.slice(0, 20)}...`,
        data: { result, description }
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Save sentiment error", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Pre-fill when navigated
  useEffect(() => {
    if (selectedBrand) {
      setDescription(`Mission for ${selectedBrand}: `);
      setResult(null);
      setError(null);
    }
  }, [selectedBrand]);

  const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const resultCard = isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-slate-50 border-slate-200';
  const input = isDark
    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-orange-500/20'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-orange-500/30';
  const label = isDark ? 'text-zinc-400' : 'text-slate-600';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-zinc-400' : 'text-slate-500';
  const bodyText = isDark ? 'text-zinc-300' : 'text-slate-700';
  const track = isDark ? 'bg-zinc-800' : 'bg-slate-200';

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      setResult(await geminiService.analyzeSentiment(description));
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (lbl: string) => {
    if (lbl === 'Positive') return <CheckCircle2 className="text-emerald-500" size={32} />;
    if (lbl === 'Negative') return <AlertCircle className="text-red-500" size={32} />;
    return <MinusCircle className={isDark ? 'text-zinc-500' : 'text-slate-400'} size={32} />;
  };

  const getColor = (lbl: string) => lbl === 'Positive' ? 'bg-emerald-500' : lbl === 'Negative' ? 'bg-red-500' : isDark ? 'bg-zinc-500' : 'bg-slate-400';

  return (
    <div className="space-y-8">
      <div className={cn('border p-6 rounded-2xl', card)}>
        <h2 className={cn('text-2xl font-semibold mb-6 flex items-center gap-2', heading)}>
          <BarChart3 className="text-orange-500" /> Sentiment Analysis
        </h2>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-2">
            <label className={cn('text-sm font-medium', label)}>Brand Description / Mission Statement</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Enter your brand description to analyze its emotional impact..."
              rows={4} className={cn('w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all resize-none', input)} required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <BarChart3 size={18} />}
            {loading ? 'Analyzing...' : 'Analyze Sentiment'}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
      </div>

      {result && (
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cn('border p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 relative', resultCard)}>
              <button
                onClick={saveSentiment}
                disabled={isSaving || isSaved}
                className={cn(
                  'absolute top-4 right-4 p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider',
                  isSaved ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'hover:bg-zinc-800 border-zinc-700 text-zinc-400'
                )}
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <Check size={14} /> : <Bookmark size={14} />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
              {getIcon(result.label)}
              <div>
                <h3 className={cn('text-2xl font-bold', heading)}>{result.label}</h3>
                <p className={cn('text-sm', subText)}>Overall Sentiment</p>
              </div>
              <div className={cn('w-full h-2 rounded-full overflow-hidden', track)}>
                <div className={cn('h-full transition-all duration-1000', getColor(result.label))}
                  style={{ width: `${((result.score + 1) / 2) * 100}%` }} />
              </div>
              <p className={cn('text-xs', subText)}>Score: {result.score.toFixed(2)}</p>
            </div>

            <div className={cn('md:col-span-2 border p-6 rounded-2xl space-y-4', resultCard)}>
              <h3 className={cn('text-lg font-semibold flex items-center gap-2', heading)}>
                <Sparkles size={18} className="text-orange-500" /> Improvement Suggestions
              </h3>
              <ul className="space-y-3">
                {result.suggestions.map((s, idx) => (
                  <li key={idx} className={cn('flex items-start gap-3 text-sm', bodyText)}>
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <SuccessFlow currentTab="sentiment" brandName={selectedBrand || 'your brand'} />
        </div>
      )}
    </div>
  );
};
