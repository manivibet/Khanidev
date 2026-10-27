export type SupportedLanguage = 'auto' | 'ur' | 'ps' | 'en';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface AttachmentFile {
  name: string;
  size: number;
  mimeType: string;
  data: string; // base64
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  detectedLanguage?: 'Urdu' | 'Pashto' | 'English';
  detectedLanguageCode?: 'ur' | 'ps' | 'en';
  sources?: GroundingSource[];
  searchQueries?: string[];
  executionTimeMs?: number;
  audioBase64?: string;
  attachments?: AttachmentFile[];
  isError?: boolean;
}

export interface ServiceStatusItem {
  name: string;
  configured: boolean;
  tested: boolean;
  verified: boolean;
  lastTestedAt?: string;
  message?: string;
  endpoint?: string;
}

export interface SystemStatus {
  status: string;
  app: string;
  version: string;
  hasApiKey: boolean;
  services: {
    geminiAi: ServiceStatusItem;
    audioTranscription: ServiceStatusItem;
    textToSpeech: ServiceStatusItem;
    webSearch: ServiceStatusItem;
    webhookReceiver: ServiceStatusItem;
  };
}

export interface WebhookLogItem {
  id: string;
  timestamp: string;
  method: string;
  senderIp?: string;
  incomingPayload: any;
  responsePayload: any;
  statusCode: number;
  durationMs: number;
  headers: Record<string, string>;
}
