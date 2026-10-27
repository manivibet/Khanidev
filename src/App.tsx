/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { EducationalPresets } from './components/EducationalPresets';
import { MakeStudioModal } from './components/MakeStudioModal';
import { ServiceStatusModal } from './components/ServiceStatusModal';
import { AudioRecorder } from './components/AudioRecorder';
import { ExportModal } from './components/ExportModal';
import {
  ChatMessage,
  SupportedLanguage,
  AttachmentFile,
  SystemStatus,
} from './types';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  role: 'model',
  content: `### السلام علیکم! پخیر راغلاست! Welcome to SHEZI × MANI AI 🚀

میں **شیزہ × مانی اے آئی** (SHEZI × MANI AI) ہوں — آپ کا جدید ترین ملٹی لنگول اسسٹنٹ اور Make.com آٹومیشن انجن۔

زه په دریو ژبو: **پښتو (Pashto)**، **اردو (Urdu)** او **انګلیسي (English)** کې ستاسو مرستې ته چمتو یم!

---

#### 🌟 Key Capabilities & Features:
1. **Trilingual Auto-Detection**: Write or speak in Urdu, Pashto, or English — I automatically detect your language and reply with authentic grammar, native script, and high cultural precision.
2. **Make.com Webhook Automation**: Production-ready endpoint (\`/api/webhook/make\`) with downloadable blueprints, scenario simulators, and live execution logging.
3. **STEM & Educational Intelligence**: Step-by-step problem solver for **Biology (حیاتیات)**, **Science & Physics (طبیعیات)**, and **Mathematics (ریاضی)** with full LaTeX equation rendering (e.g. $E = mc^2$ and $$\\int_a^b f(x) dx$$).
4. **Software Architecture & Coding**: Full-stack application planning, database schemas, API blueprints, and code generation.
5. **Voice Transcription & Natural Speech**: Record voice messages directly or generate lifelike voice replies.
6. **Real-time Web Search Grounding**: Up-to-date facts, current news, and citations.

*Feel free to pick any educational starter query below, or type your own question in Urdu, Pashto, or English!*`,
  timestamp: new Date().toISOString(),
  detectedLanguage: 'English',
  detectedLanguageCode: 'en',
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('auto');
  const [enableWebSearch, setEnableWebSearch] = useState(false);

  // Modals state
  const [isMakeStudioOpen, setIsMakeStudioOpen] = useState(false);
  const [isServiceStatusOpen, setIsServiceStatusOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [ttsLoadingMsgId, setTtsLoadingMsgId] = useState<string | null>(null);

  // System status state
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch system status:', e);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const countVerified = () => {
    if (!systemStatus?.services) return 1;
    let count = 0;
    for (const key of Object.keys(systemStatus.services) as (keyof typeof systemStatus.services)[]) {
      if (systemStatus.services[key]?.verified) count++;
    }
    return count;
  };

  const handleSendMessage = async (text: string, attachments: AttachmentFile[] = []) => {
    if (!text && attachments.length === 0) return;

    const userMsgId = 'msg_' + Math.random().toString(36).substring(2, 9);
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      attachments,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build context for model
      const context = messages
        .filter((m) => !m.isError)
        .slice(-8)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context,
          enableWebSearch,
          targetLanguage,
          attachments,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === 'error') {
        throw new Error(data.error || 'Failed to generate answer from AI model.');
      }

      const modelMsgId = 'msg_' + Math.random().toString(36).substring(2, 9);
      const modelMsg: ChatMessage = {
        id: modelMsgId,
        role: 'model',
        content: data.answer,
        timestamp: new Date().toISOString(),
        detectedLanguage: data.detectedLanguage,
        detectedLanguageCode: data.detectedLanguageCode,
        sources: data.sources,
        searchQueries: data.searchQueries,
        executionTimeMs: data.executionTimeMs,
      };

      setMessages((prev) => [...prev, modelMsg]);
      // Update system verification status
      fetchSystemStatus();
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Math.random().toString(36).substring(2, 9),
        role: 'model',
        content: `Error: ${err.message || 'Unable to connect to AI server. Please verify your connection or try again.'}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVoiceForMessage = async (msgId: string, text: string) => {
    setTtsLoadingMsgId(msgId);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Kore' }),
      });
      const data = await res.json();

      if (res.ok && data.audioBase64) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, audioBase64: data.audioBase64 } : m))
        );
      } else {
        // Fallback: let the audio player use browser SpeechSynthesis
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, audioBase64: undefined } : m))
        );
      }
    } catch (e) {
      console.error('TTS error:', e);
    } finally {
      setTtsLoadingMsgId(null);
    }
  };

  const handleTranscriptionComplete = (transcribedText: string, language?: string) => {
    handleSendMessage(transcribedText, []);
  };

  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        onOpenMakeStudio={() => setIsMakeStudioOpen(true)}
        onOpenServiceStatus={() => setIsServiceStatusOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onClearChat={handleClearChat}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        enableWebSearch={enableWebSearch}
        setEnableWebSearch={setEnableWebSearch}
        verifiedCount={countVerified()}
      />

      {/* Main Chat Display */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden">
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onGenerateVoiceForMessage={handleGenerateVoiceForMessage}
          ttsLoadingMsgId={ttsLoadingMsgId}
          onOpenExport={() => setIsExportModalOpen(true)}
        />

        {/* Educational Presets displayed when only welcome message is present */}
        {messages.length <= 1 && (
          <div className="pb-4">
            <EducationalPresets onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          </div>
        )}

        {/* Bottom Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)}
          enableWebSearch={enableWebSearch}
          setEnableWebSearch={setEnableWebSearch}
          targetLanguage={targetLanguage}
        />
      </main>

      {/* Export Conversation Modal */}
      {isExportModalOpen && (
        <ExportModal
          messages={messages}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Make.com Studio Modal */}
      {isMakeStudioOpen && (
        <MakeStudioModal onClose={() => setIsMakeStudioOpen(false)} />
      )}

      {/* Connected Services Health Status Modal */}
      {isServiceStatusOpen && (
        <ServiceStatusModal
          systemStatus={systemStatus}
          onRefreshStatus={fetchSystemStatus}
          onClose={() => setIsServiceStatusOpen(false)}
        />
      )}

      {/* Voice Recorder (Speech-to-Text) Modal */}
      {isVoiceRecorderOpen && (
        <AudioRecorder
          onTranscriptionComplete={handleTranscriptionComplete}
          onClose={() => setIsVoiceRecorderOpen(false)}
        />
      )}
    </div>
  );
}
