// Header do painel principal — navegação e perfil do casal
// Dependências diretas: React, PropTypes, useAuth

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function PainelHeader({ titulo, subtitulo }) {
  const { usuario, logout } = useAuth();

  return (
    <header style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', margin: 0 }}>{titulo}</h1>
        {subtitulo && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>{subtitulo}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          {usuario?.email || 'Visitante'}
        </span>
        <Link href="/memorial" passHref legacyBehavior>
          <a style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm">Memorial</Button>
          </a>
        </Link>
        <Button variant="secondary" size="sm" onClick={logout}>Sair</Button>
      </div>
    </header>
  );
}

PainelHeader.propTypes = {
  titulo: PropTypes.string.isRequired,
  subtitulo: PropTypes.string,
};

export { PainelHeader };