import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Cpu, Mic, Volume2, Search, Webhook, ShieldCheck, Play } from 'lucide-react';
import { SystemStatus } from '../types';

interface ServiceStatusModalProps {
  systemStatus: SystemStatus | null;
  onRefreshStatus: () => Promise<void>;
  onClose: () => void;
}

export const ServiceStatusModal: React.FC<ServiceStatusModalProps> = ({
  systemStatus,
  onRefreshStatus,
  onClose,
}) => {
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs?: number }>>({});

  const runTest = async (serviceKey: string) => {
    setTestingService(serviceKey);
    try {
      const res = await fetch('/api/test-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: serviceKey }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [serviceKey]: {
          success: data.success,
          message: data.message || data.error || 'Test completed',
          latencyMs: data.latencyMs,
        },
      }));
      await onRefreshStatus();
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [serviceKey]: {
          success: false,
          message: err.message || 'Network test failed',
        },
      }));
    } finally {
      setTestingService(null);
    }
  };

  const testAllServices = async () => {
    const services = ['geminiAi', 'webSearch', 'textToSpeech', 'audioTranscription', 'webhookReceiver'];
    for (const s of services) {
      await runTest(s);
    }
  };

  const servicesList = [
    {
      key: 'geminiAi',
      title: 'Gemini 3.8 Flash AI Model',
      description: 'Core intelligence engine for Urdu, Pashto, English reasoning, STEM, and code planning.',
      icon: Cpu,
      status: systemStatus?.services?.geminiAi,
    },
    {
      key: 'audioTranscription',
      title: 'Speech-to-Text (Gemini 3.5 Transcribe)',
      description: 'High-fidelity audio transcription for Urdu, Pashto, and multilingual voice messages.',
      icon: Mic,
      status: systemStatus?.services?.audioTranscription,
    },
    {
      key: 'textToSpeech',
      title: 'Text-to-Speech (Gemini 3.8 Flash Lite TTS)',
      description: 'Natural voice synthesis for spoken AI replies with multiple personas (Kore, Zephyr, etc.).',
      icon: Volume2,
      status: systemStatus?.services?.textToSpeech,
    },
    {
      key: 'webSearch',
      title: 'Google Search Grounding',
      description: 'Real-time web search for current news, facts, citations, and verified references.',
      icon: Search,
      status: systemStatus?.services?.webSearch,
    },
    {
      key: 'webhookReceiver',
      title: 'Make.com Webhook Receiver',
      description: 'Production-ready endpoint (/api/webhook/make) receiving and dispatching JSON payloads.',
      icon: Webhook,
      status: systemStatus?.services?.webhookReceiver,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">SHEZI × MANI AI Service Connectivity Matrix</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                v2.5.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              "Do not claim a service is connected unless it has been configured and tested." — Live verification dashboard.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Audit Badge */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-emerald-300 block">Strict Security Policy Enforced</span>
            <p className="text-slate-400">
              API keys are isolated in the server-side environment (`process.env.GEMINI_API_KEY`) and are never sent over HTTP responses, Make.com webhooks, or exposed in client bundles.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Connected Services (5 Total)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefreshStatus()}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={testAllServices}
              disabled={Boolean(testingService)}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Test All Services
            </button>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {servicesList.map((srv) => {
            const Icon = srv.icon;
            const isConfigured = srv.status?.configured;
            const isTested = srv.status?.tested;
            const isVerified = srv.status?.verified;
            const isCurrentTesting = testingService === srv.key;
            const customTestResult = testResults[srv.key];

            return (
              <div
                key={srv.key}
                className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-800/80 text-emerald-400 border border-slate-700/60 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100">{srv.title}</span>
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected & Verified
                          </span>
                        ) : isConfigured && !isTested ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            Configured (Needs Test)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{srv.description}</p>
                      {srv.status?.message && (
                        <p className="text-[11px] text-slate-500 mt-1 font-mono">
                          Status note: {srv.status.message}
                        </p>
                      )}
                      {customTestResult && (
                        <div className={`mt-2 p-2 rounded-lg text-xs font-mono ${customTestResult.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                          Result: {customTestResult.message} {customTestResult.latencyMs && `(${customTestResult.latencyMs}ms)`}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => runTest(srv.key)}
                    disabled={isCurrentTesting}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isCurrentTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current text-emerald-400" />
                        Test Connection
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Project: <strong className="text-slate-200">SHEZI × MANI AI</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
