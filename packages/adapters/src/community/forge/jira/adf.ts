/**
 * Minimal Atlassian Document Format helpers for Jira Cloud comments.
 */
import type {
  AtlassianDocument,
  AtlassianDocumentNode,
  AtlassianListItemNode,
  AtlassianParagraphNode,
  AtlassianTextNode,
} from './types';

function textNode(text: string): AtlassianTextNode {
  return { type: 'text', text };
}

function paragraph(text: string): AtlassianParagraphNode {
  const parts = text.split('\n');
  const content: AtlassianParagraphNode['content'] = [];
  parts.forEach((part, index) => {
    if (part.length > 0) content.push(textNode(part));
    if (index < parts.length - 1) content.push({ type: 'hardBreak' });
  });
  return { type: 'paragraph', content: content.length > 0 ? content : [textNode('')] };
}

function bulletList(lines: string[]): AtlassianDocumentNode {
  const items: AtlassianListItemNode[] = lines.map(line => ({
    type: 'listItem',
    content: [paragraph(line.replace(/^[-*]\s+/, ''))],
  }));
  return { type: 'bulletList', content: items };
}

function codeBlock(lines: string[], language?: string): AtlassianDocumentNode {
  const text = lines.join('\n');
  return {
    type: 'codeBlock',
    attrs: language ? { language } : undefined,
    content: [textNode(text)],
  };
}

export function toAdfDocument(message: string): AtlassianDocument {
  const normalized = message.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const nodes: AtlassianDocumentNode[] = [];
  let paragraphLines: string[] = [];
  let bulletLines: string[] = [];
  let codeLines: string[] = [];
  let codeLanguage: string | undefined;
  let inCodeBlock = false;

  const flushParagraph = (): void => {
    if (paragraphLines.length === 0) return;
    nodes.push(paragraph(paragraphLines.join('\n')));
    paragraphLines = [];
  };

  const flushBullets = (): void => {
    if (bulletLines.length === 0) return;
    nodes.push(bulletList(bulletLines));
    bulletLines = [];
  };

  const flushCode = (): void => {
    nodes.push(codeBlock(codeLines, codeLanguage));
    codeLines = [];
    codeLanguage = undefined;
  };

  for (const line of lines) {
    const fenceMatch = /^```([A-Za-z0-9_-]+)?\s*$/.exec(line);
    if (fenceMatch) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushParagraph();
        flushBullets();
        inCodeBlock = true;
        codeLanguage = fenceMatch[1];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      bulletLines.push(line);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      flushBullets();
      continue;
    }

    flushBullets();
    paragraphLines.push(line);
  }

  if (inCodeBlock) flushCode();
  flushParagraph();
  flushBullets();

  return {
    type: 'doc',
    version: 1,
    content: nodes.length > 0 ? nodes : [paragraph('')],
  };
}

export function flattenAdfText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  const type = typeof record.type === 'string' ? record.type : undefined;

  if (type === 'text') {
    return typeof record.text === 'string' ? record.text : '';
  }
  if (type === 'hardBreak') return '\n';

  const content = Array.isArray(record.content) ? record.content : [];
  const childText = content.map(flattenAdfText).join('');

  if (type === 'paragraph' || type === 'heading' || type === 'listItem') {
    return `${childText}\n`;
  }
  if (type === 'bulletList' || type === 'orderedList' || type === 'doc') {
    return childText;
  }
  if (type === 'codeBlock') {
    return `${childText}\n`;
  }

  return childText;
}
