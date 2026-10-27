import React, { useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Globe2,
  ExternalLink,
  Sparkles,
  Search,
  FileText,
  Clock,
  Volume2,
  AlertCircle,
  FileCode,
  Download,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { MathRenderer } from './MathRenderer';
import { AudioPlayer } from './AudioPlayer';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onGenerateVoiceForMessage: (msgId: string, text: string) => Promise<void>;
  ttsLoadingMsgId: string | null;
  onOpenExport?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onGenerateVoiceForMessage,
  ttsLoadingMsgId,
  onOpenExport,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Session Info Bar when conversation is ongoing */}
        {messages.length > 1 && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active Conversation • {messages.length} messages
            </span>
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 transition cursor-pointer text-xs font-medium"
                title="Export this conversation as Markdown or JSON"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Chat</span>
              </button>
            )}
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isUrdu = msg.detectedLanguage === 'Urdu';
          const isPashto = msg.detectedLanguage === 'Pashto';
          const isRTL = isUrdu || isPashto;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              {/* Message Meta Info */}
              <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">
                  {isUser ? 'You' : 'SHEZI × MANI AI'}
                </span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                {msg.detectedLanguage && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      isUrdu
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : isPashto
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                    }`}
                  >
                    <Globe2 className="w-2.5 h-2.5" />
                    {msg.detectedLanguage}
                  </span>
                )}

                {msg.executionTimeMs && (
                  <span className="text-slate-500 font-mono text-[10px]">
                    {msg.executionTimeMs}ms
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                dir={isRTL ? 'rtl' : 'ltr'}
                className={`w-full max-w-3xl rounded-2xl p-4 sm:p-5 shadow-lg relative ${
                  isUser
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-tl-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                } ${isUrdu ? 'font-urdu' : isPashto ? 'font-pashto' : ''}`}
              >
                {/* Attachments preview if user attached documents */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {msg.attachments.map((file, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/40 border border-white/10 text-xs text-white"
                      >
                        <FileText className="w-4 h-4 text-emerald-300 shrink-0" />
                        <div className="max-w-[180px] truncate">
                          <p className="font-semibold truncate">{file.name}</p>
                          <p className="text-[10px] text-white/70">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error Banner */}
                {msg.isError && (
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-rose-300">
                    <AlertCircle className="w-4 h-4" />
                    <span>Processing Exception</span>
                  </div>
                )}

                {/* Body: Math + Markdown + Code block formatting */}
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                    {msg.content}
                  </p>
                ) : (
                  <MathRenderer content={msg.content} isUrduOrPashto={isRTL} />
                )}

                {/* Web Search Sources Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800" dir="ltr">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                      <Search className="w-3.5 h-3.5" />
                      <span>Web Search Grounding Citations</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-emerald-300 border border-slate-800 transition max-w-[260px] truncate"
                          title={src.title}
                        >
                          <span className="truncate">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Audio Player for AI replies */}
                {!isUser && !msg.isError && (
                  <div className="mt-2 flex flex-col items-start" dir="ltr">
                    {msg.audioBase64 ? (
                      <AudioPlayer
                        audioBase64={msg.audioBase64}
                        textToRead={msg.content}
                        language={msg.detectedLanguage}
                      />
                    ) : (
                      <button
                        onClick={() => onGenerateVoiceForMessage(msg.id, msg.content)}
                        disabled={ttsLoadingMsgId === msg.id}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-emerald-300 text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${ttsLoadingMsgId === msg.id ? 'animate-pulse text-emerald-400' : 'text-emerald-400'}`} />
                        <span>
                          {ttsLoadingMsgId === msg.id
                            ? 'Generating Speech...'
                            : 'Generate Natural Voice Reply'}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Action buttons on message bubble */}
                <div
                  className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400"
                  dir="ltr"
                >
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition flex items-center gap-1 cursor-pointer text-[11px]"
                    title="Copy Message Text"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {isUser ? 'Message' : 'SHEZI × MANI AI'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="font-semibold text-slate-300">SHEZI × MANI AI is thinking...</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 w-full max-w-lg space-y-2.5">
              <div className="h-3 bg-slate-800 rounded-full w-3/4 animate-pulse" />
              <div className="h-3 bg-slate-800 rounded-full w-full animate-pulse" />
              <div className="h-3 bg-slate-800 rounded-full w-5/6 animate-pulse" />
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>
    </div>
  );
};
