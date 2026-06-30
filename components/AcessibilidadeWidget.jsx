// AcessibilidadeWidget.jsx — Botão flutuante de acessibilidade
// Carrega VLibras via lazy load (CDN externo) só quando clicado
// Não renderiza em páginas privadas (memorial, painel, admin, etc.)
// Dependências diretas: React, next/router

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';

const VLIBRAS_SCRIPT_URL = 'https://vlibras.gov.br/app/vlibras-plugin.js';
const VLIBRAS_CSS_URL = 'https://vlibras.gov.br/app/vlibras-plugin.css';

const PRIVATE_ROUTE_PATTERNS = [
  /^\/memorial/,
  /^\/painel/,
  /^\/admin/,
  /^\/fornecedor\/painel/,
  /^\/fornecedor\/perfil/,
  /^\/cerimonialista\/(painel|eventos|funil|financeiro|biblioteca|assistentes|roteiro|chat|perfil|espelho)/,
];

function isPrivateRoute(pathname) {
  return PRIVATE_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export default function AcessibilidadeWidget() {
  const router = useRouter();
  const [estado, setEstado] = useState('inativo'); // inativo | carregando | carregado | erro
  const widgetRef = useRef(null);
  const containerRef = useRef(null);

  const isPrivate = isPrivateRoute(router.pathname);

  const carregarVLibras = useCallback(() => {
    if (estado !== 'inativo') return;
    setEstado('carregando');

    // Carrega CSS
    if (!document.getElementById('vlibras-css')) {
      const link = document.createElement('link');
      link.id = 'vlibras-css';
      link.rel = 'stylesheet';
      link.href = VLIBRAS_CSS_URL;
      document.head.appendChild(link);
    }

    // Carrega Script
    const existingScript = document.getElementById('vlibras-script');
    if (existingScript) {
      inicializarWidget();
      return;
    }

    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = VLIBRAS_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      inicializarWidget();
    };
    script.onerror = () => {
      setEstado('erro');
    };
    document.body.appendChild(script);
  }, [estado]);

  const inicializarWidget = useCallback(() => {
    if (typeof window === 'undefined' || !window.VLibras) {
      setEstado('erro');
      return;
    }

    // Remove widget anterior se existir
    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }

    // Cria container do VLibras
    const vlibrasDiv = document.createElement('div');
    vlibrasDiv.setAttribute('vw', 'true');
    vlibrasDiv.setAttribute('class', 'enabled');
    vlibrasDiv.innerHTML = `
      <div class="vw-access-button">
        <span class="sr-only">Abrir tradutor de Libras</span>
      </div>
      <div class="vw-plugin-top-wrapper"></div>
    `;
    document.body.appendChild(vlibrasDiv);
    widgetRef.current = vlibrasDiv;

    try {
      window.VLibras.Widget('https://vlibras.gov.br/app');
      setEstado('carregado');
    } catch (err) {
      console.error('[AcessibilidadeWidget] Erro ao inicializar VLibras:', err);
      setEstado('erro');
    }
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, []);

  if (isPrivate) return null;

  const buttonLabel = {
    inativo: 'Ativar tradutor de Libras',
    carregando: 'Carregando tradutor...',
    carregado: 'Tradutor de Libras ativo',
    erro: 'VLibras indisponível',
  }[estado];

  const buttonColor = estado === 'erro' ? 'var(--color-danger)' : 'var(--color-brand)';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 'var(--z-vlibras)',
      }}
    >
      <button
        onClick={carregarVLibras}
        disabled={estado === 'carregando' || estado === 'carregado'}
        aria-label={buttonLabel}
        aria-pressed={estado === 'carregado'}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: buttonColor,
          color: 'var(--color-white)',
          cursor: estado === 'carregando' ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          opacity: estado === 'carregando' ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (estado !== 'carregando') e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Ícone de Libras (mão sinalizando) */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      </button>

      {/* Tooltip / Status */}
      {estado !== 'inativo' && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + var(--space-2))',
            right: 0,
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-text-primary)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
            border: '1px solid var(--color-border)',
          }}
        >
          {estado === 'erro' ? (
            <>
              <span role="img" aria-label="Erro">⚠️</span>{' '}
              VLibras indisponível no momento
            </>
          ) : estado === 'carregando' ? (
            <>
              <span role="img" aria-label="Carregando">⏳</span>{' '}
              Carregando...
            </>
          ) : (
            <>
              <span role="img" aria-label="Sucesso">✓</span>{' '}
              Tradutor ativo
            </>
          )}
        </div>
      )}
    </div>
  );
}
