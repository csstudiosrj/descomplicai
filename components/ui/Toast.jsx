// Sistema de notificações toast — auto-dismiss e fila
// Dependências diretas: React, PropTypes

import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const ICONS = {
  success: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  error: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  warning: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  info: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

const STYLES = {
  success: { bg: 'var(--color-success-light)', border: 'var(--color-success)', color: 'var(--color-success)' },
  error: { bg: 'var(--color-danger-light)', border: 'var(--color-danger)', color: 'var(--color-danger)' },
  warning: { bg: 'var(--color-warning-light)', border: 'var(--color-warning)', color: 'var(--color-warning)' },
  info: { bg: 'var(--color-info-light)', border: 'var(--color-info)', color: 'var(--color-info)' },
};

export default function Toast({ id, tipo = 'info', mensagem, duracao = 4000, onRemover }) {
  const [saindo, setSaindo] = useState(false);
  const style = STYLES[tipo];

  useEffect(() => {
    const timer = setTimeout(() => setSaindo(true), duracao - 300);
    const removeTimer = setTimeout(() => onRemover?.(id), duracao);
    return () => { clearTimeout(timer); clearTimeout(removeTimer); };
  }, [duracao, id, onRemover]);

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        boxShadow: 'var(--shadow-md)',
        transform: saindo ? 'translateX(120%)' : 'translateX(0)',
        opacity: saindo ? 0 : 1,
        transition: 'all 300ms ease',
        minWidth: '280px',
        maxWidth: '400px',
        cursor: 'pointer',
      }}
      onClick={() => { setSaindo(true); setTimeout(() => onRemover?.(id), 300); }}
    >
      {ICONS[tipo]}
      <span style={{ flex: 1 }}>{mensagem}</span>
      <button
        aria-label="Fechar notificação"
        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
        onClick={(e) => { e.stopPropagation(); setSaindo(true); setTimeout(() => onRemover?.(id), 300); }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

Toast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tipo: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  mensagem: PropTypes.string.isRequired,
  duracao: PropTypes.number,
  onRemover: PropTypes.func,
};

export function ToastContainer({ toasts, onRemover }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 'var(--z-toast)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onRemover={onRemover} />
      ))}
    </div>
  );
}

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export { Toast, ToastContainer };