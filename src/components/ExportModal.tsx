import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  Sparkles,
  Share2,
} from 'lucide-react';
import { ChatMessage } from '../types';
import {
  formatChatAsMarkdown,
  formatChatAsJSON,
  downloadFile,
} from '../utils/exportChat';

interface ExportModalProps {
  messages: ChatMessage[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ messages, onClose }) => {
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  const markdownContent = formatChatAsMarkdown(messages);
  const jsonContent = formatChatAsJSON(messages);

  const activeContent = exportFormat === 'markdown' ? markdownContent : jsonContent;
  const filename = `SHEZI_MANI_AI_Conversation_${new Date().toISOString().slice(0, 10)}.${
    exportFormat === 'markdown' ? 'md' : 'json'
  }`;

  const handleDownload = () => {
    const mimeType = exportFormat === 'markdown' ? 'text/markdown;charset=utf-8' : 'application/json';
    downloadFile(activeContent, filename, mimeType);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Export Chat Conversation</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Save your full multilingual conversation, STEM steps, and code blueprints to your device.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold mr-1">Format:</span>
            <button
              onClick={() => setExportFormat('markdown')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                exportFormat === 'markdown'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Markdown (.md)
            </button>
            <button
              onClick={() => setExportFormat('json')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                exportFormat === 'json'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              JSON (.json)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow cursor-pointer transform active:scale-95"
              title="Download file to device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {exportFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Live File Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] text-emerald-400">{filename}</span>
            <span className="text-[11px] text-slate-500">
              Approx. {(new Blob([activeContent]).size / 1024).toFixed(1)} KB
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
            {activeContent}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Preserves LaTeX equations, code syntax, and multilingual text
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
