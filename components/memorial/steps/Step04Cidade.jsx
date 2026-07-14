// components/memorial/steps/Step04Cidade.jsx
// B3 — Cidade e estado do evento com dados locais

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ESTADOS, CIDADES_POR_ESTADO } from '../../../lib/estados-cidades';

export default function Step04Cidade({ onSelect, estadoAtual }) {
  const [ufSelecionada, setUfSelecionada] = useState(estadoAtual?.estadoEvento || '');
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');

  // Estados já carregados localmente
  const estados = useMemo(() => {
    return [...ESTADOS].sort((a, b) => a.nome.localeCompare(b.nome));
  }, []);

  // Cidades do estado selecionado — já carregadas localmente
  const cidades = useMemo(() => {
    if (!ufSelecionada) return [];
    const lista = CIDADES_POR_ESTADO[ufSelecionada] || [];
    return lista.map((nome, idx) => ({ id: idx, nome }));
  }, [ufSelecionada]);

  const handleUfChange = useCallback((e) => {
    setUfSelecionada(e.target.value);
    setCidadeSelecionada('');
  }, []);

  const handleCidadeChange = useCallback((e) => {
    setCidadeSelecionada(e.target.value);
  }, []);

  const handleConfirmar = () => {
    if (!ufSelecionada || !cidadeSelecionada) return;
    onSelect('estadoEvento', ufSelecionada);
    onSelect('cidadeEvento', cidadeSelecionada);
  };

  const podeAvancar = ufSelecionada && cidadeSelecionada;

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        animation: 'fadeInUp 300ms ease-out',
      }}
    >
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-text-primary)',
        }}
      >
        Onde será a celebração?
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Seletor de estado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label
            htmlFor="estado-select"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-medium)',
            }}
          >
            Estado
          </label>
          <select
            id="estado-select"
            value={ufSelecionada}
            onChange={handleUfChange}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border-strong)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              width: '100%',
            }}
          >
            <option value="">Selecione um estado</option>
            {estados.map((estado) => (
              <option key={estado.sigla} value={estado.sigla}>
                {estado.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de cidade */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label
            htmlFor="cidade-select"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-medium)',
            }}
          >
            Cidade
          </label>
          {!ufSelecionada ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Selecione um estado primeiro
            </p>
          ) : (
            <select
              id="cidade-select"
              value={cidadeSelecionada}
              onChange={handleCidadeChange}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border-strong)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                width: '100%',
              }}
            >
              <option value="">Selecione uma cidade</option>
              {cidades.map((cidade) => (
                <option key={cidade.id} value={cidade.nome}>
                  {cidade.nome}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <button
        aria-label="Confirmar resposta" onClick={handleConfirmar}
        disabled={!podeAvancar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: podeAvancar ? 'var(--color-brand)' : 'var(--color-border)',
          color: podeAvancar ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: podeAvancar ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar local
      </button>
    </div>
  );
}

Step04Cidade.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step04Cidade };
