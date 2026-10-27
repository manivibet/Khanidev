import React from 'react';
import {
  Webhook,
  Activity,
  Globe2,
  Sparkles,
  Search,
  RotateCcw,
  Download,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface NavbarProps {
  onOpenMakeStudio: () => void;
  onOpenServiceStatus: () => void;
  onOpenExport: () => void;
  onClearChat: () => void;
  targetLanguage: SupportedLanguage;
  setTargetLanguage: (lang: SupportedLanguage) => void;
  enableWebSearch: boolean;
  setEnableWebSearch: (val: boolean) => void;
  verifiedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMakeStudio,
  onOpenServiceStatus,
  onOpenExport,
  onClearChat,
  targetLanguage,
  setTargetLanguage,
  enableWebSearch,
  setEnableWebSearch,
  verifiedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/10 ring-1 ring-white/20">
            SM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-100 flex items-center gap-1.5">
                SHEZI <span className="text-emerald-400">×</span> MANI AI
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Automation
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Urdu</span> • <span>Pashto</span> • <span>English</span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-[10px] text-emerald-400">Make.com Webhooks</span>
            </p>
          </div>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Web Search Grounding Toggle */}
          <button
            onClick={() => setEnableWebSearch(!enableWebSearch)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
              enableWebSearch
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Google Search Grounding for real-time information"
          >
            <Search className={`w-3.5 h-3.5 ${enableWebSearch ? 'text-emerald-400' : ''}`} />
            <span>Search Grounding</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                enableWebSearch ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
            <Globe2 className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 hidden sm:block" />
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-slate-200 text-xs py-1 px-2 focus:outline-none cursor-pointer"
            >
              <option value="auto" className="bg-slate-900 text-slate-200">
                Auto-Detect (خودکار)
              </option>
              <option value="ur" className="bg-slate-900 text-slate-200">
                اردو (Urdu)
              </option>
              <option value="ps" className="bg-slate-900 text-slate-200">
                پښتو (Pashto)
              </option>
              <option value="en" className="bg-slate-900 text-slate-200">
                English
              </option>
            </select>
          </div>

          {/* Make.com Studio Button */}
          <button
            onClick={onOpenMakeStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition shadow cursor-pointer"
            title="Open Make.com Automation Studio & Blueprint"
          >
            <Webhook className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Make.com Studio</span>
          </button>

          {/* Service Verification Status */}
          <button
            onClick={onOpenServiceStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Service Connectivity & Verification Matrix"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Services ({verifiedCount}/5)</span>
          </button>

          {/* Export Chat Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-xs font-medium transition cursor-pointer"
            title="Export Conversation as Markdown or JSON"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* New Chat / Reset */}
          <button
            onClick={onClearChat}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Start New Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
