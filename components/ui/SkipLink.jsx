// SkipLink.jsx — Link para pular para conteúdo principal
// Visível apenas quando recebe foco via teclado
// Dependências diretas: React

import React from 'react';

export default function SkipLink({ targetId = 'main-content', children = 'Pular para conteúdo principal' }) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      style={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        background: 'var(--color-brand)',
        color: 'var(--color-white)',
        padding: '8px 16px',
        zIndex: 'var(--z-toast)',
        textDecoration: 'none',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--font-medium)',
        borderRadius: '0 0 var(--radius-md) 0',
        transition: 'top var(--transition-fast)',
        fontSize: 'var(--text-sm)',
      }}
      onFocus={(e) => { e.currentTarget.style.top = '0'; }}
      onBlur={(e) => { e.currentTarget.style.top = '-40px'; }}
    >
      {children}
    </a>
  );
}
