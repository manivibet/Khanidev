import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Play,
  Webhook,
  ArrowRight,
  Code,
  Layers,
  Terminal,
  Activity,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MAKE_BLUEPRINT_TEMPLATE,
  SAMPLE_WEBHOOK_PAYLOADS,
  MAKE_SETUP_GUIDE_STEPS,
} from '../utils/makeBlueprint';
import { WebhookLogItem } from '../types';

interface MakeStudioModalProps {
  onClose: () => void;
}

export const MakeStudioModal: React.FC<MakeStudioModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'tester' | 'logs' | 'guide'>('blueprint');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Tester state
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [customPayload, setCustomPayload] = useState(
    JSON.stringify(SAMPLE_WEBHOOK_PAYLOADS[0].payload, null, 2)
  );
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Live Webhook Logs state
  const [logs, setLogs] = useState<WebhookLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const webhookEndpoint = `${typeof window !== 'undefined' ? window.location.origin : 'https://your-app-domain.run.app'}/api/webhook/make`;

  const curlCommand = `curl -X POST "${webhookEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(SAMPLE_WEBHOOK_PAYLOADS[0].payload)}'`;

  // Fetch logs when switching to logs tab
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/webhook/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error('Failed to load webhook logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const clearLogs = async () => {
    try {
      await fetch('/api/webhook/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const copyToClipboard = (text: string, type: 'url' | 'json' | 'curl') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else if (type === 'json') {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const downloadBlueprint = () => {
    const jsonStr = JSON.stringify(MAKE_BLUEPRINT_TEMPLATE, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SHEZI_MANI_AI_Make_Blueprint.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setCustomPayload(JSON.stringify(SAMPLE_WEBHOOK_PAYLOADS[idx].payload, null, 2));
  };

  const handleSendTestWebhook = async () => {
    setIsSending(true);
    setTestResult(null);

    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(customPayload);
      } catch {
        throw new Error('Invalid JSON format in payload text area.');
      }

      const res = await fetch('/api/webhook/make', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Make-Simulation': 'true',
        },
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();
      setTestResult({
        status: res.status,
        ok: res.ok,
        data,
      });

      if (res.ok) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 500,
        ok: false,
        data: { error: err.message || 'Webhook transmission failed.' },
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Make.com Automation Studio</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  SHEZI × MANI AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure, test, and orchestrate automated AI workflows in Make.com
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 flex gap-4 text-xs font-medium bg-slate-900/90">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'blueprint'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Scenario Blueprint & Flow
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'tester'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            Interactive Webhook Tester
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'logs'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Webhook Logs
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Setup Instructions
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: BLUEPRINT & SCENARIO FLOW */}
          {activeTab === 'blueprint' && (
            <div className="space-y-6">
              {/* Webhook Endpoint Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                    Your Live Make.com Webhook Endpoint
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    POST Method
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookEndpoint}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 selection:bg-emerald-500 selection:text-slate-900"
                  />
                  <button
                    onClick={() => copyToClipboard(webhookEndpoint, 'url')}
                    className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedUrl ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Target this URL in your Make.com 'HTTP - Make a request' module to process Urdu, Pashto, and English queries.
                </p>
              </div>

              {/* Visual Scenario Workflow Diagram */}
              <div>
                <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3">
                  Interactive Make.com Scenario Architecture
                </h3>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto text-xs">
                  {/* Module 1 */}
                  <div className="w-full md:w-44 p-3 rounded-lg bg-slate-900 border border-purple-500/40 text-center space-y-1 shadow">
                    <span className="text-[10px] font-mono text-purple-400 font-bold block">MODULE 1</span>
                    <span className="font-semibold text-slate-200 block text-xs">Custom Webhook</span>
                    <p className="text-[10px] text-slate-400">Incoming Message Trigger</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden md:block" />

                  {/* Module 2 */}
                  <div className="w-full md:w-44 p-3 rounded-lg bg-slate-900 border border-blue-500/40 text-center space-y-1 shadow">
                    <span className="text-[10px] font-mono text-blue-400 font-bold block">MODULE 2</span>
                    <span className="font-semibold text-slate-200 block text-xs">JSON Validator</span>
                    <p className="text-[10px] text-slate-400">Parse user query & lang</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden md:block" />

                  {/* Module 3 */}
                  <div className="w-full md:w-52 p-3 rounded-lg bg-slate-900 border border-emerald-500/50 text-center space-y-1 shadow-lg ring-1 ring-emerald-500/30">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">MODULE 3 (HTTP)</span>
                    <span className="font-semibold text-emerald-300 block text-xs">SHEZI × MANI AI</span>
                    <p className="text-[10px] text-slate-400">Urdu / Pashto / STEM AI</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden md:block" />

                  {/* Module 4 */}
                  <div className="w-full md:w-44 p-3 rounded-lg bg-slate-900 border border-amber-500/40 text-center space-y-1 shadow">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block">MODULE 4</span>
                    <span className="font-semibold text-slate-200 block text-xs">Webhook Respond</span>
                    <p className="text-[10px] text-slate-400">Return JSON response</p>
                  </div>
                </div>
              </div>

              {/* Download / Copy Blueprint Section */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      Download Ready-to-Import Make.com Blueprint
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Includes modules, field mappings, JSON parse schema, and response filters.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(MAKE_BLUEPRINT_TEMPLATE, null, 2), 'json')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700 transition"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedJson ? 'Copied' : 'Copy JSON'}
                    </button>
                    <button
                      onClick={downloadBlueprint}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Blueprint (.json)
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto">
                  <pre>{JSON.stringify(MAKE_BLUEPRINT_TEMPLATE, null, 2).slice(0, 500)}... (truncated for preview)</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE TESTER */}
          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Select Quick Test Preset
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_WEBHOOK_PAYLOADS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        selectedPresetIdx === idx
                          ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Request Payload Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Request Body (JSON)</span>
                    <span className="font-mono text-[11px] text-purple-400">POST /api/webhook/make</span>
                  </div>
                  <textarea
                    rows={10}
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                  <button
                    onClick={handleSendTestWebhook}
                    disabled={isSending}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Simulating Webhook Execution...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        Fire Test Webhook Payload
                      </>
                    )}
                  </button>
                </div>

                {/* Response Viewer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Webhook Response (JSON)</span>
                    {testResult && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          testResult.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        HTTP {testResult.status}
                      </span>
                    )}
                  </div>

                  <div className="w-full h-[240px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono overflow-y-auto">
                    {testResult ? (
                      <pre className={testResult.ok ? 'text-emerald-300' : 'text-rose-400'}>
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center">
                        <Terminal className="w-8 h-8 mb-2 opacity-50" />
                        <p>No test executed yet.</p>
                        <p className="text-[10px]">Click 'Fire Test Webhook Payload' to simulate Make.com</p>
                      </div>
                    )}
                  </div>

                  {testResult?.data?.reply && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-xs">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                        Detected Language: {testResult.data.detected_language} ({testResult.data.detected_language_code})
                      </span>
                      <p className="text-slate-300 line-clamp-3 italic">
                        "{testResult.data.reply}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE WEBHOOK ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Live Incoming Webhook Calls</h3>
                  <p className="text-xs text-slate-400">
                    Inspect actual calls made by external Make.com scenarios or curl requests.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchLogs}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    Refresh Logs
                  </button>
                  <button
                    onClick={clearLogs}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              {isLoadingLogs ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading incoming webhook requests...</div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  No incoming webhook calls recorded yet. Use the Interactive Tester or execute your Make.com scenario to see live requests here!
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              log.statusCode >= 200 && log.statusCode < 300
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            HTTP {log.statusCode}
                          </span>
                          <span className="font-mono text-slate-300 font-semibold">{log.method} /api/webhook/make</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <span>{log.durationMs}ms</span>
                          <span>•</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block mb-1">Payload In:</span>
                          <p className="text-slate-300 truncate">
                            {JSON.stringify(log.incomingPayload)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block mb-1">Response Out:</span>
                          <p className="text-emerald-400 truncate">
                            {JSON.stringify(log.responsePayload)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETUP INSTRUCTIONS & CURL */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">Step-by-Step Setup in Make.com</h3>
                <div className="space-y-2.5">
                  {MAKE_SETUP_GUIDE_STEPS.map((step) => (
                    <div key={step.step} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {step.step}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-200">{step.title}</span>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* cURL Example */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Test via cURL (Terminal)</span>
                  <button
                    onClick={() => copyToClipboard(curlCommand, 'curl')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCurl ? 'Copied' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto">
                  <code>{curlCommand}</code>
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Zero Secret Exposure Guarantee:</span>
                  <p className="text-amber-200/80">
                    Make.com scenarios only communicate through your webhook URL. API keys never leave the server and are never included in webhook headers or JSON bodies.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Make.com Webhook Gateway Online
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
