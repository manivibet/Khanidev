import { ChatMessage } from '../types';

export function formatChatAsMarkdown(messages: ChatMessage[]): string {
  const exportDate = new Date().toLocaleString();
  let md = `# SHEZI × MANI AI — Conversation Export\n\n`;
  md += `**Exported on:** ${exportDate}  \n`;
  md += `**Total Messages:** ${messages.length}  \n`;
  md += `**Application:** SHEZI × MANI AI (Multilingual & Make.com Automation)\n\n`;
  md += `---\n\n`;

  messages.forEach((msg, idx) => {
    const isUser = msg.role === 'user';
    const roleTitle = isUser ? '👤 User' : '🤖 SHEZI × MANI AI';
    const time = new Date(msg.timestamp).toLocaleString();
    const langBadge = msg.detectedLanguage ? `[${msg.detectedLanguage}]` : '';

    md += `### ${idx + 1}. ${roleTitle} ${langBadge}\n`;
    md += `*Time: ${time}*`;
    if (msg.executionTimeMs) {
      md += ` | *Latency: ${msg.executionTimeMs}ms*`;
    }
    md += `\n\n`;

    // Attachments note if any
    if (msg.attachments && msg.attachments.length > 0) {
      md += `**Attached Files:**\n`;
      msg.attachments.forEach((att) => {
        md += `- ${att.name} (${(att.size / 1024).toFixed(1)} KB, ${att.mimeType})\n`;
      });
      md += `\n`;
    }

    md += `${msg.content}\n\n`;

    // Sources if any
    if (msg.sources && msg.sources.length > 0) {
      md += `**Grounding Sources & Citations:**\n`;
      msg.sources.forEach((src) => {
        md += `- [${src.title}](${src.url})\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

export function formatChatAsJSON(messages: ChatMessage[]): string {
  const exportData = {
    project: 'SHEZI × MANI AI',
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      detectedLanguage: m.detectedLanguage,
      detectedLanguageCode: m.detectedLanguageCode,
      executionTimeMs: m.executionTimeMs,
      sources: m.sources,
      searchQueries: m.searchQueries,
      attachments: m.attachments?.map((a) => ({
        name: a.name,
        size: a.size,
        mimeType: a.mimeType,
      })),
      isError: m.isError,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
