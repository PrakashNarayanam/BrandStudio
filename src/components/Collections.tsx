import React, { useEffect, useState } from 'react';
import {
    Library, Trash2, Download, ExternalLink,
    Calendar, ImageIcon, Palette, Sparkles,
    Search, Filter, LayoutGrid, List,
    Loader2, AlertCircle, ShoppingBag, FileText,
    ShieldCheck, BarChart3
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { SavedItem } from '../types';
import { cn } from '../lib/utils';
import { useCollections } from '../contexts/CollectionsContext';
import { useBrand } from '../contexts/BrandContext';


export const Collections: React.FC = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { setSelectedBrand, setSelectedPalette } = useBrand();
    const { items, loading, removeItem, syncLocalToCloud } = useCollections();

    const [filter, setFilter] = useState<'all' | 'logo' | 'palette' | 'brand_name' | 'content' | 'audit' | 'sentiment'>('all');

    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        if (user) {
            syncLocalToCloud();
        }
    }, [user, syncLocalToCloud]);

    const handleDelete = async (id: string) => {
        await removeItem(id);
    };


    const downloadImage = (url: string, filename: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

    const filteredItems = items.filter(item => {
        const matchesFilter = filter === 'all' || item.type === filter;
        const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const card = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
    const input = isDark
        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-emerald-500/20'
        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-emerald-500/30';
    const heading = isDark ? 'text-white' : 'text-slate-900';
    const subText = isDark ? 'text-zinc-500' : 'text-slate-500';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className={subText}>Loading your collections...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className={cn('text-3xl font-bold mb-2 flex items-center gap-3', heading)}>
                        <Library className="text-emerald-500" /> My Collections
                    </h2>
                    <p className={subText}>Manage your saved logos, palettes, names, and content.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn('p-2.5 rounded-xl border transition-all',
                            viewMode === 'grid'
                                ? (isDark ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600')
                                : (isDark ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500' : 'bg-white border-slate-200 text-slate-400')
                        )}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn('p-2.5 rounded-xl border transition-all',
                            viewMode === 'list'
                                ? (isDark ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600')
                                : (isDark ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500' : 'bg-white border-slate-200 text-slate-400')
                        )}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            <div className={cn('p-6 rounded-2xl border', card)}>
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search your collections..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={cn('w-full pl-11 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all', input)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                        {(['all', 'logo', 'palette', 'brand_name', 'content', 'audit', 'sentiment'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={cn(
                                    'px-4 py-2.5 rounded-xl text-sm font-medium border whitespace-nowrap transition-all flex items-center gap-2',
                                    filter === t
                                        ? 'bg-emerald-500 text-white border-emerald-500'
                                        : isDark
                                            ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                )}
                            >
                                {t === 'all' && <ShoppingBag size={14} />}
                                {t === 'logo' && <ImageIcon size={14} />}
                                {t === 'palette' && <Palette size={14} />}
                                {t === 'brand_name' && <Sparkles size={14} />}
                                {t === 'content' && <FileText size={14} />}
                                {t === 'audit' && <ShieldCheck size={14} />}
                                {t === 'sentiment' && <BarChart3 size={14} />}
                                {t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                </div>

                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-800/50 rounded-3xl">
                        <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-500">
                            <Library size={32} />
                        </div>
                        <h3 className={cn('text-lg font-semibold', heading)}>No items found</h3>
                        <p className={subText}>Try adjusting your search or filter, or generate some brand assets!</p>
                    </div>
                ) : (
                    <div className={cn(
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                            : 'space-y-4'
                    )}>
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                    'group relative border transition-all overflow-hidden',
                                    card,
                                    viewMode === 'grid' ? 'rounded-2xl' : 'rounded-xl flex items-center p-4 gap-6'
                                )}
                            >
                                {/* Image / Icon Preview */}
                                <div className={cn(
                                    'bg-zinc-950 flex items-center justify-center overflow-hidden',
                                    viewMode === 'grid' ? 'aspect-square' : 'w-20 h-20 rounded-lg shrink-0'
                                )}>
                                    {item.type === 'logo' && item.url ? (
                                        <img src={item.url} alt={item.label} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                                    ) : item.type === 'palette' ? (
                                        <div className="grid grid-cols-2 w-full h-full p-2 gap-1">
                                            {item.data?.colors?.slice(0, 4).map((c: any) => (
                                                <div key={c.hex} className="rounded-sm" style={{ backgroundColor: c.hex }} />
                                            ))}
                                        </div>
                                    ) : item.type === 'audit' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-yellow-500/10">
                                            <ShieldCheck className="text-yellow-500" size={viewMode === 'grid' ? 40 : 24} />
                                        </div>
                                    ) : item.type === 'sentiment' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-orange-500/10">
                                            <BarChart3 className="text-orange-500" size={viewMode === 'grid' ? 40 : 24} />
                                        </div>
                                    ) : item.type === 'content' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-purple-500/10">
                                            <FileText className="text-purple-500" size={viewMode === 'grid' ? 40 : 24} />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-500/10">
                                            <Sparkles className="text-emerald-500" size={viewMode === 'grid' ? 40 : 24} />
                                        </div>
                                    )}
                                </div>

                                <div className={cn('flex flex-col', viewMode === 'grid' ? 'p-4' : 'flex-1')}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border',
                                            item.type === 'logo' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' :
                                                item.type === 'palette' ? 'text-pink-500 border-pink-500/20 bg-pink-500/5' :
                                                    item.type === 'content' ? 'text-purple-500 border-purple-500/20 bg-purple-500/5' :
                                                        item.type === 'audit' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' :
                                                            item.type === 'sentiment' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' :
                                                                'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                                        )}>
                                            {item.type.replace('_', ' ')}
                                        </span>

                                        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <h4 className={cn('font-semibold truncate', heading)}>{item.label}</h4>

                                    {(item.type === 'brand_name' || item.type === 'content') && item.data?.explanation && (
                                        <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">{item.data.explanation}</p>
                                    )}
                                    {item.type === 'content' && item.data?.tagline && (
                                        <p className="text-xs text-zinc-400 italic line-clamp-1 mt-1 font-medium">"{item.data.tagline}"</p>
                                    )}

                                    <div className={cn('flex items-center gap-2 mt-4', viewMode === 'grid' ? '' : 'sm:justify-end')}>
                                        {item.type === 'logo' && item.url && (
                                            <button
                                                onClick={() => downloadImage(item.url!, `${item.label}-logo.png`)}
                                                className={cn('p-2 rounded-lg border hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white')}
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </button>
                                        )}
                                        {(item.type === 'brand_name' || item.type === 'palette') && (
                                            <button
                                                onClick={() => {
                                                    if (item.type === 'brand_name') setSelectedBrand(item.label);
                                                    if (item.type === 'palette') setSelectedPalette(item.label);
                                                }}
                                                className={cn('p-2 rounded-lg border hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white')}
                                                title="Apply to Brand"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 rounded-lg border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all ml-auto"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

