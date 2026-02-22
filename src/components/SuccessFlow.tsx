import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Palette, FileText, BarChart3, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { useBrand } from '../contexts/BrandContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

type Tab = 'dashboard' | 'names' | 'logo' | 'content' | 'sentiment' | 'assistant' | 'palette' | 'audit' | 'analytics';

interface SuccessFlowProps {
    currentTab: Tab;
    brandName: string;
}

export const SuccessFlow: React.FC<SuccessFlowProps> = ({ currentTab, brandName }) => {
    const { isDark } = useTheme();
    const { navigateTo } = useBrand();

    const suggestions = [
        {
            id: 'logo',
            label: 'Design Logo',
            icon: ImageIcon,
            desc: 'Create a visual identity',
            color: 'text-blue-500',
            bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
            border: isDark ? 'border-blue-500/20' : 'border-blue-200',
        },
        {
            id: 'palette',
            label: 'Color Palette',
            icon: Palette,
            desc: 'Define brand colors',
            color: 'text-pink-500',
            bg: isDark ? 'bg-pink-500/10' : 'bg-pink-50',
            border: isDark ? 'border-pink-500/20' : 'border-pink-200',
        },
        {
            id: 'content',
            label: 'Content Lab',
            icon: FileText,
            desc: 'Generate copy & bios',
            color: 'text-purple-500',
            bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
            border: isDark ? 'border-purple-500/20' : 'border-purple-200',
        },
        {
            id: 'sentiment',
            label: 'Sentiment AI',
            icon: BarChart3,
            desc: 'Analyze brand impact',
            color: 'text-orange-500',
            bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50',
            border: isDark ? 'border-orange-500/20' : 'border-orange-200',
        },
        {
            id: 'audit',
            label: 'Brand Audit',
            icon: ShieldCheck,
            desc: 'Get a health score',
            color: 'text-yellow-500',
            bg: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50',
            border: isDark ? 'border-yellow-500/20' : 'border-yellow-200',
        }
    ].filter(s => s.id !== currentTab);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'mt-12 p-8 rounded-3xl border text-center transition-all',
                isDark ? 'bg-zinc-900/40 border-emerald-500/20' : 'bg-emerald-50/30 border-emerald-200'
            )}
        >
            <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                    <Sparkles className="text-white" size={24} />
                </div>
                <h3 className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
                    What's next for {brandName}?
                </h3>
                <p className={cn('text-sm max-w-md', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                    Great progress! Keep building your brand identity with these AI-powered tools.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestions.slice(0, 4).map((s, idx) => (
                    <motion.button
                        key={s.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -4 }}
                        onClick={() => navigateTo(s.id as Tab, brandName)}
                        className={cn(
                            'group p-4 rounded-2xl border text-left transition-all',
                            isDark ? 'bg-zinc-900/60 hover:border-zinc-700' : 'bg-white hover:border-slate-300 shadow-sm'
                        )}
                    >
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 border', s.bg, s.border)}>
                            <s.icon size={18} className={s.color} />
                        </div>
                        <p className={cn('text-sm font-bold flex items-center gap-1', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                            {s.label}
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </p>
                        <p className={cn('text-xs mt-0.5', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                            {s.desc}
                        </p>
                    </motion.button>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-emerald-500/10">
                <button
                    onClick={() => navigateTo('assistant', brandName)}
                    className={cn('text-sm font-semibold flex items-center gap-2 mx-auto transition-colors',
                        isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700')}
                >
                    Need expert advice? Chat with your AI Consultant →
                </button>
            </div>
        </motion.div>
    );
};
