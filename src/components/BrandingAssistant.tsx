import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

export const BrandingAssistant: React.FC = () => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm **BrandStudio AI** — your elite branding consultant. 🎯\n\nI can help you with:\n- **Brand naming** — unique, memorable, trademark-safe names\n- **Logo & visual identity** — style, color psychology, typography\n- **Brand strategy** — positioning, USP, target audience\n- **Tone of voice** — messaging frameworks, taglines, copywriting\n- **Brand audits** — strengths, weaknesses, actionable improvements\n\nWhat are you building today? Tell me about your brand idea!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatRef.current = geminiService.createChatSession(); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const containerBg = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const headerBg = isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-50 border-slate-200';
  const aiBubble = isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-slate-100 text-slate-800';
  const footerBg = isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-50 border-slate-200';
  const inputCls = isDark
    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-indigo-500/20'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/30';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-zinc-500' : 'text-slate-500';

  return (
    <div className={cn('flex flex-col h-[calc(100vh-100px)] w-full border rounded-3xl overflow-hidden', containerBg)}>
      <div className={cn('p-4 border-b flex items-center gap-3', headerBg)}>
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h2 className={cn('font-semibold', heading)}>BrandStudio AI</h2>
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online & Ready to help
          </p>
        </div>
        <div className="ml-auto">
          <span className={cn('text-xs px-3 py-1 rounded-full border font-medium', isDark ? 'border-zinc-700 text-zinc-500' : 'border-slate-200 text-slate-400')}>
            Groq · llama-3.3-70b
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  msg.role === 'user' ? 'bg-indigo-600' : isDark ? 'bg-zinc-700' : 'bg-slate-300')}>
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot size={14} className={isDark ? 'text-zinc-300' : 'text-slate-600'} />}
                </div>
                <div className={cn('p-4 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : cn(aiBubble, 'rounded-tl-none'))}>
                  <div className="markdown-body"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className={cn('flex gap-2 items-center p-4 rounded-2xl rounded-tl-none', isDark ? 'bg-zinc-800' : 'bg-slate-100')}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-indigo-500"
                  animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
              ))}
              <span className={cn('text-xs ml-1', subText)}>Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSend} className={cn('p-4 border-t space-y-3', footerBg)}>
        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap gap-2">
          {[
            '💡 Suggest brand names for my startup',
            '🎨 What colors suit a wellness brand?',
            '✍️ Write a tagline for my product',
            '🔍 Audit my brand concept',
            '📱 How to build a social media brand?',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setInput(chip.replace(/^[^ ]+ /, ''))}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105',
                isDark
                  ? 'border-zinc-700 text-zinc-400 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                  : 'border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
              )}
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
            placeholder="Ask about brand names, strategy, colors, taglines... (Shift+Enter for newline)"
            rows={Math.min(5, input.split('\n').length)}
            className={cn('w-full border rounded-xl pl-4 pr-14 py-3 focus:outline-none focus:ring-2 transition-all resize-none max-h-40', inputCls)}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-2.5 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
