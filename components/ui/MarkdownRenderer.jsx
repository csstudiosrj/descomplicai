import React from 'react';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseMarkdown(text) {
  if (!text) return '';

  // Normaliza quebras de linha
  let html = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Escapa HTML
  html = escapeHtml(html);

  // Processa linha por linha
  const rawLines = html.split('\n');
  const lines = [];
  let inList = false;

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i];
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('# ')) {
      if (inList) { lines.push('</ul>'); inList = false; }
      lines.push('<h1>' + trimmed.slice(2) + '</h1>');
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { lines.push('</ul>'); inList = false; }
      lines.push('<h2>' + trimmed.slice(3) + '</h2>');
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) { lines.push('</ul>'); inList = false; }
      lines.push('<h3>' + trimmed.slice(4) + '</h3>');
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      if (inList) { lines.push('</ul>'); inList = false; }
      lines.push('<h4>' + trimmed.slice(5) + '</h4>');
      continue;
    }
    if (trimmed.startsWith('##### ')) {
      if (inList) { lines.push('</ul>'); inList = false; }
      lines.push('<h5>' + trimmed.slice(6) + '</h5>');
      continue;
    }
    if (trimmed.startsWith('###### ')) {
      if (inList) { lines.push('</ul>'); inList = false; }
      lines.push('<h6>' + trimmed.slice(7) + '</h6>');
      continue;
    }

    // Listas
    if (trimmed.startsWith('- ')) {
      if (!inList) { lines.push('<ul>'); inList = true; }
      lines.push('<li>' + trimmed.slice(2) + '</li>');
      continue;
    }

    if (inList && trimmed !== '') {
      lines.push('</ul>');
      inList = false;
    }

    // Linha em branco
    if (trimmed === '') {
      lines.push('');
      continue;
    }

    // Inline: bold e italic
    line = line
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

    lines.push(line);
  }

  if (inList) lines.push('</ul>');

  // Junta parágrafos
  const blocks = lines.join('\n').split(/\n\s*\n/);
  const result = blocks
    .map((block) => {
      const t = block.trim();
      if (!t) return '';
      if (t.startsWith('<h') || t.startsWith('<ul')) return t;
      return '<p>' + t.replace(/\n/g, '<br>') + '</p>';
    })
    .join('\n');

  return result;
}

export default function MarkdownRenderer({ text, style = {} }) {
  const html = parseMarkdown(text);
  return (
    <div
      style={{
        fontFamily: 'var(--font-body)',
        lineHeight: 'var(--leading-relaxed)',
        color: 'var(--color-text)',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}