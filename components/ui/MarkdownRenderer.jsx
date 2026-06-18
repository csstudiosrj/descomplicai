// components/ui/MarkdownRenderer.jsx
import React from 'react';

function parseMarkdown(text) {
  if (!text) return '';
  
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold e Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Listas
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');
  html = html.replace(/<\/ul><ul>/g, '');

  // Quebras de linha → parágrafos
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<li')) return p;
    return p.trim() ? `<p>${p.replace(/\n/g, '<br/>')}</p>` : '';
  }).join('');

  return html;
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