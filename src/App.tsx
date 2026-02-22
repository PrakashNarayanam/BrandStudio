import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Sparkles, Image as ImageIcon,
  FileText, BarChart3, MessageSquare, Menu, X,
  ChevronRight, Sun, Moon, LogOut, User,
  Palette, ShieldCheck, BarChart2, Library, Globe
} from 'lucide-react';

import { BrandNameGenerator } from './components/BrandNameGenerator';
import { LogoGenerator } from './components/LogoGenerator';
import { ContentGenerator } from './components/ContentGenerator';
import { SentimentAnalysis } from './components/SentimentAnalysis';
import { BrandingAssistant } from './components/BrandingAssistant';
import { Analytics } from './components/Analytics';
import { ColorPaletteGenerator } from './components/ColorPaletteGenerator';
import { BrandAudit } from './components/BrandAudit';
import { Collections } from './components/Collections';
import { BrandChecker } from './components/BrandChecker';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { BrandProvider, useBrand } from './contexts/BrandContext';
import { CollectionsProvider } from './contexts/CollectionsContext';
import { db } from './lib/firebase';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import bsLogo from './assets/bs-logo.png';


type Tab = 'dashboard' | 'names' | 'logo' | 'content' | 'sentiment' | 'assistant' | 'palette' | 'audit' | 'analytics' | 'collections' | 'checker';

type View = 'landing' | 'auth' | 'app';

function AppInner() {
  const { isDark, toggle } = useTheme();
  const { user, loading: authLoading, logout } = useAuth();
  const { registerNavigate } = useBrand();
  const [view, setView] = useState<View>('landing');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [counts, setCounts] = useState({ names: 0, logos: 0, content: 0, saved: 0 });

  // Register tab navigator into BrandContext so child components can navigate
  React.useEffect(() => { registerNavigate(setActiveTab); }, [registerNavigate]);

  // Sync counts from collections
  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, 'collections'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => d.data());
      setCounts({
        names: items.filter(i => i.type === 'brand_name').length,
        logos: items.filter(i => i.type === 'logo').length,
        content: items.filter(i => i.type === 'content').length,
        saved: items.length
      });
    }, (err) => console.error("Count sync error:", err));
    return () => unsubscribe();
  }, [user]);

  // React to Firebase auth changes
  useEffect(() => {
    if (authLoading) return;
    if (user) { setView('app'); }
    else if (view === 'app') { setView('landing'); setActiveTab('dashboard'); }
  }, [user, authLoading]);


  const handleLogout = async () => {
    await logout();
    setView('landing');
    setActiveTab('dashboard');
  };

  // Show loading spinner while Firebase checks auth state
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading BrandStudio…</p>
      </div>
    </div>
  );

  // ── Theme tokens ──
  const bg = isDark ? 'bg-[#0a0a0a]' : 'bg-slate-50';
  const text = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sidebarBg = isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200';
  const navActive = isDark ? 'bg-zinc-900 text-white' : 'bg-emerald-50 text-emerald-700 font-semibold';
  const navHover = isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100';
  const profileBg = isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200';
  const sectionLabel = isDark ? 'text-zinc-600' : 'text-slate-400';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-zinc-400', section: null },
    { id: 'names', label: 'Brand Names', icon: Sparkles, color: 'text-emerald-500', section: 'AI Tools' },
    { id: 'logo', label: 'Logo Designer', icon: ImageIcon, color: 'text-blue-500', section: null },
    { id: 'content', label: 'Content Lab', icon: FileText, color: 'text-purple-500', section: null },
    { id: 'palette', label: 'Color Palette', icon: Palette, color: 'text-pink-500', section: null },


    { id: 'sentiment', label: 'Sentiment AI', icon: BarChart3, color: 'text-orange-500', section: null },

    { id: 'audit', label: 'Brand Audit', icon: ShieldCheck, color: 'text-yellow-500', section: null },
    { id: 'assistant', label: 'AI Consultant', icon: MessageSquare, color: 'text-indigo-500', section: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, color: 'text-teal-500', section: 'Insights' },
    { id: 'collections', label: 'Collections', icon: Library, color: 'text-amber-500', section: 'Personal' },
  ];

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const dashFeatures = navItems.filter(i => !['dashboard', 'analytics', 'collections'].includes(i.id));

  const featureDesc: Record<string, string> = {
    names: 'Generate unique, brandable names for your startup.',
    logo: 'Create professional logos with AI-driven design.',
    content: 'Automate taglines, bios, and social media posts.',
    palette: 'AI-crafted brand color palettes for every mood.',
    sentiment: 'Analyze the emotional impact of your brand copy.',

    audit: 'Get a full brand health score and action plan.',
    assistant: 'Chat with a professional AI branding expert.',
  };

  const statCards = [
    { label: 'Brand Names Generated', value: counts.names.toString(), icon: Sparkles, color: 'text-emerald-500', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50', border: isDark ? 'border-emerald-500/20' : 'border-emerald-200', tab: 'names' as Tab },
    { label: 'Logos Created', value: counts.logos.toString(), icon: ImageIcon, color: 'text-blue-500', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50', border: isDark ? 'border-blue-500/20' : 'border-blue-200', tab: 'logo' as Tab },
    { label: 'Content Pieces', value: counts.content.toString(), icon: FileText, color: 'text-purple-500', bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50', border: isDark ? 'border-purple-500/20' : 'border-purple-200', tab: 'content' as Tab },
    { label: 'Saved Assets', value: counts.saved.toString(), icon: Library, color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50', border: isDark ? 'border-amber-500/20' : 'border-amber-200', tab: 'collections' as Tab },
  ];


  const quickActions = [
    { id: 'names', label: 'Generate Brand Names', desc: 'AI-crafted unique startup names', icon: Sparkles, color: 'text-emerald-500', grad: 'from-emerald-500/20 to-teal-500/5' },
    { id: 'logo', label: 'Design a Logo', desc: 'Professional logos in seconds', icon: ImageIcon, color: 'text-blue-500', grad: 'from-blue-500/20 to-indigo-500/5' },
    { id: 'content', label: 'Write Brand Content', desc: 'Taglines, bios & social copy', icon: FileText, color: 'text-purple-500', grad: 'from-purple-500/20 to-pink-500/5' },
    { id: 'palette', label: 'Pick a Color Palette', desc: 'AI-powered brand color combos', icon: Palette, color: 'text-pink-500', grad: 'from-pink-500/20 to-rose-500/5' },
    { id: 'sentiment', label: 'Analyze Sentiment', desc: 'Gauge emotional impact of copy', icon: BarChart3, color: 'text-orange-500', grad: 'from-orange-500/20 to-red-500/5' },

    { id: 'audit', label: 'Run Brand Audit', desc: 'Full health score & action plan', icon: ShieldCheck, color: 'text-yellow-500', grad: 'from-yellow-500/20 to-amber-500/5' },
    { id: 'assistant', label: 'Ask AI Consultant', desc: 'Chat with your branding expert', icon: MessageSquare, color: 'text-indigo-500', grad: 'from-indigo-500/20 to-blue-500/5' },
    { id: 'collections', label: 'View Collections', desc: 'All your saved brand assets', icon: Library, color: 'text-amber-500', grad: 'from-amber-500/20 to-orange-500/5' },
  ];

  const checklist = [
    { label: 'Generate your first brand name', tab: 'names' as Tab },
    { label: 'Design a logo for your brand', tab: 'logo' as Tab },
    { label: 'Write your brand content', tab: 'content' as Tab },
    { label: 'Run a brand audit', tab: 'audit' as Tab },
    { label: 'View your saved collections', tab: 'collections' as Tab },
  ];

  const renderContent = () => {
    if (activeTab === 'dashboard') return (
      <div className="space-y-8">

        {/* ── Hero greeting ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className={cn('relative overflow-hidden rounded-3xl border p-8 md:p-10',
            isDark
              ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-zinc-800'
              : 'bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 border-transparent'
          )}
        >
          {/* Decorative blobs */}
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-400/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-60 h-60 bg-indigo-400/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className={cn('text-sm font-medium mb-2 flex items-center gap-2',
                  isDark ? 'text-emerald-400' : 'text-emerald-100')}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Welcome back, {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there'} 👋
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight leading-tight">
                Your Brand Studio<br />
                <span className={isDark ? 'text-emerald-400' : 'text-emerald-200'}>is ready. Let's create.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}
                className={cn('text-sm mb-6 max-w-md', isDark ? 'text-zinc-400' : 'text-emerald-100/90')}>
                8 AI-powered tools to build your complete brand identity — from naming to logos, content, and beyond.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab('names')}
                  className={cn('px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 text-sm',
                    isDark ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-white text-emerald-700 hover:bg-emerald-50')}>
                  <Sparkles size={16} /> Start Building
                </button>
                <button onClick={() => setActiveTab('collections')}
                  className={cn('px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 text-sm border',
                    isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-white/40 text-white hover:bg-white/10')}>
                  <Library size={16} /> View Collections
                </button>
              </motion.div>
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {[
                { label: 'AI Tools', value: '9' },
                { label: 'Free to Use', value: '∞' },
                { label: 'Avg. Time Saved', value: '6h' },
                { label: 'Uptime', value: '99%' },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }}
                  className={cn('rounded-2xl p-3 text-center border min-w-[90px]',
                    isDark ? 'bg-zinc-800/60 border-zinc-700' : 'bg-white/20 border-white/30')}>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className={cn('text-xs mt-0.5', isDark ? 'text-zinc-400' : 'text-white/70')}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Usage stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.button key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
              whileHover={{ y: -2 }} onClick={() => setActiveTab(s.tab)}
              className={cn('p-4 rounded-2xl border text-left transition-all group', s.bg, s.border,
                isDark ? 'hover:border-zinc-600' : 'hover:shadow-md')}>
              <div className={cn('p-2 rounded-xl w-fit mb-3 border', s.color, s.border,
                isDark ? 'bg-zinc-900/60' : 'bg-white')}>
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
              <p className={cn('text-xs mt-1 leading-tight', isDark ? 'text-zinc-500' : 'text-slate-500')}>{s.label}</p>
              <p className={cn('text-xs mt-2 font-medium group-hover:underline', s.color)}>Open →</p>
            </motion.button>
          ))}
        </div>

        {/* ── Quick actions + checklist ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Quick actions grid (2/3) */}
          <div className="xl:col-span-2">
            <h2 className={cn('text-base font-semibold mb-4', isDark ? 'text-zinc-300' : 'text-slate-700')}>
              🛠️ AI Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((item, idx) => (
                <motion.button key={item.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + idx * 0.04 }}
                  whileHover={{ y: -2 }} onClick={() => setActiveTab(item.id as Tab)}
                  className={cn('group flex items-center gap-4 p-4 rounded-2xl border transition-all text-left',
                    isDark
                      ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md')}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br transition-transform group-hover:scale-110',
                    item.grad, isDark ? 'border border-zinc-800' : 'border border-slate-100')}>
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-semibold truncate', isDark ? 'text-zinc-200' : 'text-slate-800')}>{item.label}</p>
                    <p className={cn('text-xs truncate mt-0.5', isDark ? 'text-zinc-500' : 'text-slate-500')}>{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className={cn('shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1', item.color)} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Getting started checklist (1/3) */}
          <div>
            <h2 className={cn('text-base font-semibold mb-4', isDark ? 'text-zinc-300' : 'text-slate-700')}>
              ✅ Getting Started
            </h2>
            <div className={cn('rounded-2xl border p-5 space-y-3',
              isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm')}>
              {checklist.map((item, i) => (
                <motion.button key={item.label}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
                  onClick={() => setActiveTab(item.tab)}
                  className={cn('w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group',
                    isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-50')}>
                  <div className={cn('w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors',
                    isDark ? 'border-zinc-700 group-hover:border-emerald-500' : 'border-slate-300 group-hover:border-emerald-500')}>
                    <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-emerald-500 transition-colors" />
                  </div>
                  <span className={cn('text-sm', isDark ? 'text-zinc-400 group-hover:text-zinc-200' : 'text-slate-600 group-hover:text-slate-900')}>
                    {item.label}
                  </span>
                </motion.button>
              ))}
              <div className={cn('mt-4 pt-4 border-t', isDark ? 'border-zinc-800' : 'border-slate-100')}>
                <div className="flex justify-between text-xs mb-2">
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-500'}>Progress</span>
                  <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>0 / 5</span>
                </div>
                <div className={cn('h-1.5 rounded-full', isDark ? 'bg-zinc-800' : 'bg-slate-100')}>
                  <div className="h-full w-0 rounded-full bg-emerald-500 transition-all duration-700" />
                </div>
              </div>
            </div>

            {/* Tip card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className={cn('mt-4 rounded-2xl border p-4',
                isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200')}>
              <p className={cn('text-xs font-semibold mb-1', isDark ? 'text-indigo-400' : 'text-indigo-700')}>💡 Pro Tip</p>
              <p className={cn('text-xs leading-relaxed', isDark ? 'text-indigo-300/70' : 'text-indigo-600/80')}>
                Start with <strong>Brand Names</strong>, then use the generated name directly in the <strong>Logo Designer</strong> and <strong>Content Lab</strong> for a cohesive brand identity.
              </p>
            </motion.div>
          </div>
        </div>

      </div>
    );

    switch (activeTab) {
      case 'names': return <BrandNameGenerator />;
      case 'logo': return <LogoGenerator />;
      case 'content': return <ContentGenerator />;
      case 'sentiment': return <SentimentAnalysis />;

      case 'assistant': return <BrandingAssistant />;
      case 'palette': return <ColorPaletteGenerator />;
      case 'audit': return <BrandAudit />;
      case 'analytics': return <Analytics />;
      case 'collections': return <Collections />;
      case 'checker': return <BrandChecker />;
    }

  };


  if (view === 'landing') return <LandingPage onGetStarted={() => setView('auth')} />;
  if (view === 'auth') return <LoginPage onBack={() => setView('landing')} onSuccess={() => setView('app')} />;;

  let sectionRender = '';
  return (
    <div className={cn('min-h-screen font-sans transition-colors duration-300', bg, text)}>
      {/* Mobile header */}
      <div className={cn('lg:hidden flex items-center justify-between p-4 border-b backdrop-blur-md sticky top-0 z-50',
        isDark ? 'bg-black/80 border-zinc-800' : 'bg-white/80 border-slate-200')}>
        <div className="flex items-center gap-2">
          <img src={bsLogo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
          <span className="font-bold text-xl tracking-tight">BrandStudio</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className={cn('p-2 rounded-xl', isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-slate-500 hover:bg-slate-100')}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={cn('p-2', isDark ? 'text-zinc-400' : 'text-slate-500')}>
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn('fixed inset-y-0 left-0 z-40 w-64 border-r transition-transform lg:translate-x-0 lg:static flex flex-col',
          sidebarBg, !isSidebarOpen && '-translate-x-full')}>
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            {/* Logo + theme toggle */}
            <div className="hidden lg:flex items-center justify-between mb-8 px-2 pt-2">
              <div className="flex items-center gap-2.5">
                <img src={bsLogo} alt="Logo" className="w-9 h-9 object-contain rounded-xl" />
                <span className="font-bold text-xl tracking-tight">BrandStudio</span>
              </div>
              <button onClick={toggle}
                className={cn('p-2 rounded-xl border transition-all',
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-indigo-600')}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-0.5">
              {navItems.map((item) => {
                const showSection = item.section && item.section !== sectionRender;
                if (showSection) sectionRender = item.section!;
                return (
                  <React.Fragment key={item.id}>
                    {showSection && (
                      <p className={cn('text-[10px] font-semibold uppercase tracking-widest px-3 pt-4 pb-1', sectionLabel)}>
                        {item.section}
                      </p>
                    )}
                    <button
                      onClick={() => { setActiveTab(item.id as Tab); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                      className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                        activeTab === item.id ? navActive : navHover)}>
                      <item.icon size={18} className={cn('transition-colors', activeTab === item.id ? item.color : '')} />
                      <span className="text-sm font-medium">{item.label}</span>
                      {activeTab === item.id && (
                        <motion.div layoutId="nav-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Profile section */}
          <div className={cn('p-4 border-t', isDark ? 'border-zinc-900' : 'border-slate-200')}>
            <div className={cn('rounded-2xl border p-3', profileBg)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                  {user?.photoURL
                    ? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                    : user?.displayName ? getInitials(user.displayName) : <User size={14} />}
                </div>
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold truncate', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className={cn('text-xs truncate', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <button onClick={handleLogout}
                className={cn('w-full flex items-center justify-center gap-2 text-xs font-medium py-2 px-3 rounded-xl transition-all',
                  isDark ? 'bg-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500/20'
                    : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200')}>
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CollectionsProvider>
      <BrandProvider>
        <AppInner />
      </BrandProvider>
    </CollectionsProvider>
  );
}

