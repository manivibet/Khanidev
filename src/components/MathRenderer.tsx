import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  isUrduOrPashto?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, isUrduOrPashto }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Split content by $$block$$ and $inline$ delimiters
    const tokens: Array<{ type: 'text' | 'inline-math' | 'block-math' | 'code-block'; value: string }> = [];

    // First handle multi-line code blocks ```code```
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const textSegments: Array<{ isCode: boolean; value: string }> = [];

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        textSegments.push({ isCode: false, value: content.substring(lastIndex, match.index) });
      }
      textSegments.push({ isCode: true, value: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      textSegments.push({ isCode: false, value: content.substring(lastIndex) });
    }

    // Now process math within non-code segments
    for (const segment of textSegments) {
      if (segment.isCode) {
        tokens.push({ type: 'code-block', value: segment.value });
      } else {
        const segText = segment.value;
        // Parse $$...$$ first, then $...$
        const mathRegex = /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g;
        let segLastIndex = 0;
        let mathMatch: RegExpExecArray | null;

        while ((mathMatch = mathRegex.exec(segText)) !== null) {
          if (mathMatch.index > segLastIndex) {
            tokens.push({ type: 'text', value: segText.substring(segLastIndex, mathMatch.index) });
          }

          if (mathMatch[1]) {
            // Block math $$
            tokens.push({ type: 'block-math', value: mathMatch[1] });
          } else if (mathMatch[2]) {
            // Inline math $
            tokens.push({ type: 'inline-math', value: mathMatch[2] });
          }
          segLastIndex = mathMatch.index + mathMatch[0].length;
        }

        if (segLastIndex < segText.length) {
          tokens.push({ type: 'text', value: segText.substring(segLastIndex) });
        }
      }
    }

    return tokens;
  }, [content]);

  return (
    <div className={`space-y-2 text-slate-200 leading-relaxed ${isUrduOrPashto ? 'text-right' : 'text-left'}`}>
      {renderedElements?.map((token, idx) => {
        if (token.type === 'code-block') {
          const lines = token.value.trim().split('\n');
          const firstLine = lines[0].trim();
          const language = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : '';
          const codeBody = language ? lines.slice(1).join('\n') : token.value;

          return (
            <div key={idx} className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900/90 shadow-md">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-xs font-mono text-slate-400">
                <span className="uppercase tracking-wider font-semibold text-emerald-400">{language || 'code'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(codeBody)}
                  className="px-2 py-0.5 rounded text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition"
                  title="Copy Code"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto text-emerald-300">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        if (token.type === 'block-math') {
          let html = '';
          try {
            html = katex.renderToString(token.value, { displayMode: true, throwOnError: false });
          } catch {
            return (
              <div key={idx} className="my-2 p-2 bg-slate-900/80 rounded border border-slate-800 text-emerald-400 font-mono text-center">
                $${token.value}$$
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="my-3 py-2 px-3 bg-slate-900/50 rounded-lg overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        if (token.type === 'inline-math') {
          let html = '';
          try {
            html = katex.renderToString(token.value, { displayMode: false, throwOnError: false });
          } catch {
            return <span key={idx} className="font-mono text-emerald-300">${token.value}$</span>;
          }
          return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} className="inline-block px-1" />;
        }

        // Render standard formatted text lines (bold, bullet points, headers)
        return (
          <span key={idx} className="whitespace-pre-wrap">
            {formatInlineMarkdown(token.value)}
          </span>
        );
      })}
    </div>
  );
};

// Simple lightweight markdown parser for bold, inline code, headings, bullet lists
function formatInlineMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');

  return lines.map((line, lIdx) => {
    // Heading 3
    if (line.startsWith('### ')) {
      return (
        <h4 key={lIdx} className="text-base font-bold text-slate-100 mt-3 mb-1">
          {renderSpans(line.replace('### ', ''))}
        </h4>
      );
    }
    // Heading 2
    if (line.startsWith('## ')) {
      return (
        <h3 key={lIdx} className="text-lg font-bold text-emerald-400 mt-4 mb-2 border-b border-slate-800 pb-1">
          {renderSpans(line.replace('## ', ''))}
        </h3>
      );
    }
    // Heading 1
    if (line.startsWith('# ')) {
      return (
        <h2 key={lIdx} className="text-xl font-extrabold text-emerald-300 mt-4 mb-2">
          {renderSpans(line.replace('# ', ''))}
        </h2>
      );
    }
    // Bullet list
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.trim().substring(2);
      return (
        <div key={lIdx} className="flex items-start gap-2 my-1">
          <span className="text-emerald-400 mt-1.5 text-xs font-bold">•</span>
          <span>{renderSpans(bulletText)}</span>
        </div>
      );
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lIdx} className="flex items-start gap-2 my-1">
          <span className="text-emerald-400 font-semibold text-xs mt-1">{numMatch[1]}.</span>
          <span>{renderSpans(numMatch[2])}</span>
        </div>
      );
    }

    return (
      <span key={lIdx}>
        {renderSpans(line)}
        {lIdx < lines.length - 1 && '\n'}
      </span>
    );
  });
}

function renderSpans(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // match **bold** and `code`
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
