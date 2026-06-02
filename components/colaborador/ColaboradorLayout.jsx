// Layout da área do colaborador — navegação restrita e identidade visual
// Dependências diretas: React, PropTypes

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

export default function ColaboradorLayout({ token, children }) {
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
      <header style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>Área do Colaborador</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', padding: '2px var(--space-2)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {token?.slice(0, 8)}...
          </span>
        </div>
        <Link href="/" passHref legacyBehavior>
          <a style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-brand)', textDecoration: 'none' }}>Descomplicaí</a>
        </Link>
      </header>
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        {children}
      </main>
    </div>
  );
}

ColaboradorLayout.propTypes = {
  token: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export { ColaboradorLayout };