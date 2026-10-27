import React, { useState } from 'react';
import { Dna, Atom, Calculator, Code2, Globe2, Sparkles, BookOpen } from 'lucide-react';

interface Preset {
  id: string;
  category: 'biology' | 'science' | 'math' | 'code' | 'knowledge';
  title: string;
  prompt: string;
  language: 'Urdu' | 'Pashto' | 'English';
  badge: string;
}

const PRESETS: Preset[] = [
  {
    id: 'bio_ur',
    category: 'biology',
    title: 'ڈی این اے اور مائٹوسس (Urdu)',
    prompt: 'ڈی این اے (DNA) کی ساخت، ڈبل ہیلکس ماڈل اور مائٹوسس (Mitosis) کا عمل مرحلہ وار تفصیل سے اردو میں سمجھائیں۔',
    language: 'Urdu',
    badge: '🧬 Biology'
  },
  {
    id: 'bio_ps',
    category: 'biology',
    title: 'د حجرې او فوتوسنتز جوړښت (Pashto)',
    prompt: 'د نباتي حجرې جوړښت او د فوتوسنتز (Photosynthesis) پړاوونه په اسانه او مستنده پښتو ژبه تشریح کړئ.',
    language: 'Pashto',
    badge: '🌿 Biology'
  },
  {
    id: 'math_calc',
    category: 'math',
    title: 'Calculus: Fundamental Theorem',
    prompt: 'Explain the Fundamental Theorem of Calculus with proof and compute the definite integral $\\int_{0}^{\\pi} \\sin(x)\\,dx$ step by step with LaTeX formatting.',
    language: 'English',
    badge: '📐 Calculus'
  },
  {
    id: 'math_ur',
    category: 'math',
    title: 'الجبرا اور دو درجی مساوات (Urdu)',
    prompt: 'دو درجی مساوات (Quadratic Equation) $ax^2 + bx + c = 0$ کو حل کرنے کا کلیہ ثبوت کے ساتھ اردو میں واضح کریں۔',
    language: 'Urdu',
    badge: '🧮 Algebra'
  },
  {
    id: 'sci_physics',
    category: 'science',
    title: 'Quantum Mechanics & Light',
    prompt: 'Explain the wave-particle duality of light, Young\'s double-slit experiment, and Planck\'s equation $E = h\\nu$.',
    language: 'English',
    badge: '🔬 Physics'
  },
  {
    id: 'sci_ps',
    category: 'science',
    title: 'د نیوټن د حرکت قوانین (Pashto)',
    prompt: 'د اسحاق نیوټن د حرکت درې واړه قوانین په پښتو ژبه د عملي مثالونو سره واضح او تحلیل کړئ.',
    language: 'Pashto',
    badge: '⚡ Physics'
  },
  {
    id: 'code_plan',
    category: 'code',
    title: 'Full-Stack App Architecture Blueprint',
    prompt: 'Design a comprehensive architectural blueprint for a modern SaaS web app: including Frontend (React/TypeScript), Backend (Node.js/Express), Database schema (PostgreSQL), and Make.com automated webhook pipelines.',
    language: 'English',
    badge: '💻 Architecture'
  },
  {
    id: 'code_ur',
    category: 'code',
    title: 'ویب ڈویلپمنٹ سیکھنے کا روڈ میپ (Urdu)',
    prompt: 'ایک ابتدائی طالب علم کے لیے مکمل فل اسٹیک ویب ڈویلپمنٹ (HTML, CSS, JavaScript, React, Backend) سیکھنے کا 6 ماہ کا تفصیلی روڈ میپ اردو میں بنائیں۔',
    language: 'Urdu',
    badge: '🖥️ Coding Roadmap'
  },
  {
    id: 'gk_ps',
    category: 'knowledge',
    title: 'د پښتو ژبې او ادب تاریخ (Pashto)',
    prompt: 'د پښتو ژبې د تاریخ، لرغونو شاعرانو لکه خوشحال خان خټک او رحمان بابا د افکارو په اړه یو جامع لنډیز ولیکئ.',
    language: 'Pashto',
    badge: '📜 Literature'
  },
  {
    id: 'gk_world',
    category: 'knowledge',
    title: 'James Webb Space Telescope Discoveries',
    prompt: 'Summarize the most groundbreaking cosmological discoveries made by the James Webb Space Telescope (JWST) about the earliest galaxies in the universe.',
    language: 'English',
    badge: '🌌 Astronomy'
  }
];

interface EducationalPresetsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const EducationalPresets: React.FC<EducationalPresetsProps> = ({ onSelectPrompt }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'biology' | 'science' | 'math' | 'code' | 'knowledge'>('all');

  const filteredPresets = activeTab === 'all'
    ? PRESETS
    : PRESETS.filter((p) => p.category === activeTab);

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Multi-Domain Trilingual Intelligence
        </div>
        <h2 className="text-xl font-bold text-slate-100">
          Explore Educational & Engineering Topics
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mt-1">
          Instant starter queries in Urdu (اردو), Pashto (پښتو), and English for Biology, Mathematics, Science, and Coding Plans.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-1.5 mb-5">
        {[
          { key: 'all', label: 'All Topics', icon: BookOpen },
          { key: 'biology', label: 'Biology', icon: Dna },
          { key: 'science', label: 'Science & Physics', icon: Atom },
          { key: 'math', label: 'Mathematics', icon: Calculator },
          { key: 'code', label: 'Code & Plans', icon: Code2 },
          { key: 'knowledge', label: 'General Knowledge', icon: Globe2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPrompt(preset.prompt)}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 text-left transition group shadow-sm flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-semibold text-emerald-400">
                  {preset.badge}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    preset.language === 'Urdu'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : preset.language === 'Pashto'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                  }`}
                >
                  {preset.language}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition">
                {preset.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {preset.prompt}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>Click to Ask</span>
              <span className="text-emerald-400 group-hover:translate-x-0.5 transition">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
