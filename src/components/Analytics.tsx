import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Zap, Activity, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { getStats, clearEvents, getEvents } from '../utils/analytics';
import { AnalyticsEventType } from '../types';

const FEATURE_META: Record<AnalyticsEventType, { label: string; color: string; bg: string }> = {
    brand_name: { label: 'Brand Names', color: 'bg-emerald-500', bg: 'bg-emerald-500/10' },
    logo: { label: 'Logo Designer', color: 'bg-blue-500', bg: 'bg-blue-500/10' },
    content: { label: 'Content Lab', color: 'bg-purple-500', bg: 'bg-purple-500/10' },
    sentiment: { label: 'Sentiment AI', color: 'bg-orange-500', bg: 'bg-orange-500/10' },
    chat: { label: 'AI Consultant', color: 'bg-indigo-500', bg: 'bg-indigo-500/10' },
    palette: { label: 'Color Palette', color: 'bg-pink-500', bg: 'bg-pink-500/10' },
    audit: { label: 'Brand Audit', color: 'bg-yellow-500', bg: 'bg-yellow-500/10' },
    suggest_logo: { label: 'Logo Suggestions', color: 'bg-cyan-500', bg: 'bg-cyan-500/10' },
    suggest_names: { label: 'Name Suggestions', color: 'bg-rose-500', bg: 'bg-rose-500/10' },
};

const DEFAULT_META = { label: 'Unknown Activity', color: 'bg-zinc-500', bg: 'bg-zinc-500/10' };


function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export const Analytics: React.FC = () => {
    const { isDark } = useTheme();
    const [stats, setStats] = useState(getStats());
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = () => { setStats(getStats()); setRefreshKey(k => k + 1); };
    const handleClear = () => { if (confirm('Clear all analytics data?')) { clearEvents(); refresh(); } };

    const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
    const innerCard = isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-slate-50 border-slate-200';
    const text = isDark ? 'text-zinc-100' : 'text-slate-900';
    const muted = isDark ? 'text-zinc-500' : 'text-slate-400';
    const labelText = isDark ? 'text-zinc-400' : 'text-slate-500';
    const track = isDark ? 'bg-zinc-800' : 'bg-slate-200';

    const allCounts = (Object.entries(stats.counts) as [AnalyticsEventType, number][])
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...allCounts.map(([, c]) => c), 1);

    const weekMax = Math.max(...stats.last7.map(d => d.count), 1);

    const statCards = [
        { label: 'Total Generations', value: stats.total, icon: Zap, color: 'text-emerald-500', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
        { label: 'Today', value: stats.today, icon: TrendingUp, color: 'text-blue-500', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
        { label: 'Top Feature', value: stats.topFeature?.[0] ? (FEATURE_META[stats.topFeature[0] as AnalyticsEventType]?.label || DEFAULT_META.label) : '—', icon: BarChart2, color: 'text-purple-500', bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50', small: true },

        { label: 'Features Used', value: allCounts.filter(([, c]) => c > 0).length, icon: Activity, color: 'text-orange-500', bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50' },
    ];

    if (stats.total === 0) {
        return (
            <div className={cn('border rounded-2xl p-12 text-center', card)}>
                <BarChart2 size={56} className={cn('mx-auto mb-4', muted)} />
                <h3 className={cn('text-2xl font-bold mb-2', text)}>No analytics yet</h3>
                <p className={cn('text-sm', muted)}>Start using BrandStudio features and your usage will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={cn('text-2xl font-bold flex items-center gap-2', text)}>
                        <BarChart2 className="text-emerald-500" /> Analytics
                    </h2>
                    <p className={cn('text-sm mt-1', muted)}>Your BrandStudio usage insights</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={refresh} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all', isDark ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100')}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20">
                        <Trash2 size={14} /> Clear
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className={cn('border rounded-2xl p-5', card)}>
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.bg)}>
                            <s.icon size={20} className={s.color} />
                        </div>
                        <p className={cn('text-sm', labelText)}>{s.label}</p>
                        <p className={cn('font-bold mt-0.5', s.small ? 'text-lg' : 'text-3xl', text)}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Usage Bar Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={cn('border rounded-2xl p-6', card)}>
                    <h3 className={cn('font-semibold mb-6', text)}>Feature Usage</h3>
                    <div className="space-y-4">
                        {allCounts.map(([type, count]) => {
                            const meta = FEATURE_META[type];
                            const pct = (count / maxCount) * 100;
                            return (
                                <div key={type} className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className={cn('text-sm', labelText)}>{meta.label}</span>
                                        <span className={cn('text-sm font-semibold', text)}>{count}</span>
                                    </div>
                                    <div className={cn('h-2 rounded-full overflow-hidden', track)}>
                                        <motion.div
                                            className={cn('h-full rounded-full', meta.color)}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, delay: 0.1 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Last 7 Days */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className={cn('border rounded-2xl p-6', card)}>
                    <h3 className={cn('font-semibold mb-6', text)}>Last 7 Days</h3>
                    <div className="flex items-end justify-between gap-2 h-40">
                        {stats.last7.map((day, i) => {
                            const heightPct = weekMax > 0 ? (day.count / weekMax) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <span className={cn('text-xs', day.count > 0 ? text : muted)}>{day.count > 0 ? day.count : ''}</span>
                                    <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                                        <motion.div
                                            className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 min-h-[3px]"
                                            initial={{ height: 0 }}
                                            animate={{ height: heightPct > 0 ? `${heightPct}%` : '3px' }}
                                            transition={{ duration: 0.6, delay: i * 0.07 }}
                                            style={{ opacity: heightPct > 0 ? 1 : 0.2 }}
                                        />
                                    </div>
                                    <span className={cn('text-xs', muted)}>{day.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className={cn('border rounded-2xl p-6', card)}>
                <h3 className={cn('font-semibold mb-4', text)}>Recent Activity</h3>
                {stats.recent.length === 0 ? (
                    <p className={cn('text-sm', muted)}>No activity yet.</p>
                ) : (
                    <div className="space-y-2">
                        {stats.recent.map((event, i) => {
                            const meta = FEATURE_META[event.type] || DEFAULT_META;
                            return (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                    className={cn('flex items-center gap-3 p-3 rounded-xl', innerCard)}>
                                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', meta.bg)}>
                                        <div className={cn('w-2 h-2 rounded-full', meta.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn('text-sm font-medium', text)}>{meta.label}</p>
                                        {event.label && <p className={cn('text-xs truncate', muted)}>{event.label}</p>}
                                    </div>
                                    <span className={cn('text-xs shrink-0', muted)}>{timeAgo(event.timestamp)}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
