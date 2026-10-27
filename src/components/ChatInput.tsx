import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Paperclip,
  X,
  Search,
  Sparkles,
  FileText,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';
import { AttachmentFile, SupportedLanguage } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: AttachmentFile[]) => Promise<void>;
  isLoading: boolean;
  onOpenVoiceRecorder: () => void;
  enableWebSearch: boolean;
  setEnableWebSearch: (val: boolean) => void;
  targetLanguage: SupportedLanguage;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onOpenVoiceRecorder,
  enableWebSearch,
  setEnableWebSearch,
  targetLanguage,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            mimeType: file.type || 'text/plain',
            data: base64String,
          },
        ]);
      };

      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Determine placeholder based on selected language
  const getPlaceholder = () => {
    if (targetLanguage === 'ur') {
      return 'اردو میں سوال لکھیں یا آواز ریکارڈ کریں... (حیاتیات، سائنس، ریاضی، کوڈنگ)';
    }
    if (targetLanguage === 'ps') {
      return 'په پښتو ژبه خپله پوښتنه ولیکئ یا ږغ ولېږئ... (ساینس، ریاضي، پروګرامینګ)';
    }
    return 'Ask in Urdu, Pashto, or English... Biology, Math, Science, Coding Plans...';
  };

  return (
    <div className="sticky bottom-0 z-30 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Attachment Pills */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 shadow-sm"
              >
                {file.mimeType.startsWith('image/') ? (
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                ) : file.mimeType.startsWith('text/') || file.name.endsWith('.ts') || file.name.endsWith('.js') ? (
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="max-w-[150px] truncate">{file.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(file.size / 1024).toFixed(0)}KB
                </span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-end gap-2 bg-slate-900 border border-slate-700/80 rounded-2xl p-2 focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition shadow-lg">
          {/* File Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            title="Attach document, code, PDF, or image"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".txt,.md,.pdf,.json,.csv,.js,.ts,.tsx,.py,.png,.jpg,.jpeg,.webp"
            className="hidden"
          />

          {/* Voice Record Button */}
          <button
            type="button"
            onClick={onOpenVoiceRecorder}
            className="p-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition cursor-pointer"
            title="Voice message input (Speech-to-Text)"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Main Text Area */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            rows={1}
            dir={targetLanguage === 'ur' || targetLanguage === 'ps' ? 'rtl' : 'auto'}
            className="flex-1 bg-transparent border-0 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none py-2 px-1 max-h-44 leading-relaxed"
          />

          {/* Search Toggle Shortcut */}
          <button
            type="button"
            onClick={() => setEnableWebSearch(!enableWebSearch)}
            className={`p-2 rounded-xl transition cursor-pointer ${
              enableWebSearch
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title={enableWebSearch ? 'Web search grounding active' : 'Click to enable web search grounding'}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!text.trim() && attachments.length === 0) || isLoading}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition shadow cursor-pointer transform active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Input Footer Note */}
        <div className="flex items-center justify-between px-2 text-[10px] text-slate-500">
          <span>
            Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[9px] text-slate-400">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[9px] text-slate-400">Shift+Enter</kbd> for new line
          </span>
          <span className="flex items-center gap-1 font-mono text-emerald-400/80">
            <Sparkles className="w-2.5 h-2.5" />
            SHEZI × MANI AI Automation Core
          </span>
        </div>
      </div>
    </div>
  );
};
