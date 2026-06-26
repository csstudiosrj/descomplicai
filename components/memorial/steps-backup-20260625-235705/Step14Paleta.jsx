// Etapa de paleta de cores — até 3 cores com sugestão automática e seletor personalizado
// Dependências diretas: React, PropTypes, Card, sugerirPaleta

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { sugerirPaleta } from '../../../utils/sugestoes';

export default function Step05Paleta({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo;
  const sugeridas = estilo ? sugerirPaleta(estilo) : ['#F5F0EB', '#8B6F5E', '#1A1714'];
  const [selecionadas, setSelecionadas] = useState(estadoAtual?.paleta || []);
  const [erro, setErro] = useState('');
  const [mostrarSeletor, setMostrarSeletor] = useState(false);
  const [corCustom, setCorCustom] = useState('#8B6F5E');
  const inputRef = useRef(null);

  const toggleCor = (cor) => {
    setErro('');
    if (selecionadas.includes(cor)) {
      setSelecionadas(selecionadas.filter((c) => c !== cor));
    } else if (selecionadas.length >= 3) {
      setErro('Você já selecionou 3 cores. Remova uma para adicionar outra.');
    } else {
      setSelecionadas([...selecionadas, cor]);
    }
  };

  const adicionarCustom = () => {
    setErro('');
    if (selecionadas.includes(corCustom)) return;
    if (selecionadas.length >= 3) {
      setErro('Limite de 3 cores atingido.');
      return;
    }
    setSelecionadas([...selecionadas, corCustom]);
    setMostrarSeletor(false);
  };

  const handleConfirmar = () => {
    if (selecionadas.length === 0) return;
    onSelect('paleta', selecionadas);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .shake-anim {
          animation: shake 200ms ease-in-out;
        }
      `}</style>

      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          Escolha até 3 cores para o evento
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' }}>
          Sugerimos com base no estilo que você escolheu. Pode personalizar.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          {sugeridas.map((cor) => {
            const isSelected = selecionadas.includes(cor);
            return (
              <button
                key={cor}
                onClick={() => toggleCor(cor)}
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`Cor ${cor}${isSelected ? ' selecionada' : ''}`}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: cor,
                  border: isSelected ? '3px solid var(--color-brand)' : '2px solid var(--color-border)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all var(--transition-fast)',
                  flexShrink: 0,
                }}
              >
                {isSelected && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={cor === '#FFFFFF' || cor === '#F5F0EB' || cor === '#F3F0EC' ? '#1A1714' : '#FFFFFF'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setMostrarSeletor(!mostrarSeletor);
            setTimeout(() => inputRef.current?.click(), 10);
          }}
          style={{
            alignSelf: 'flex-start',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border-strong)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            cursor: 'pointer',
          }}
        >
          Personalizar cor
        </button>

        {mostrarSeletor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <input
              ref={inputRef}
              type="color"
              value={corCustom}
              onChange={(e) => setCorCustom(e.target.value)}
              style={{ width: '48px', height: '48px', border: 'none', cursor: 'pointer', background: 'none' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {corCustom.toUpperCase()}
            </span>
            <button
              onClick={adicionarCustom}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-white)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              Adicionar
            </button>
          </div>
        )}

        {selecionadas.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Selecionadas:</span>
            {selecionadas.map((cor) => (
              <div key={cor} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: 'var(--radius-sm)', backgroundColor: cor, border: '1px solid var(--color-border)' }} />
                <button
                  onClick={() => toggleCor(cor)}
                  aria-label={`Remover cor ${cor}`}
                  style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: 'var(--text-sm)', padding: 0 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {erro && (
          <div className="shake-anim" role="alert" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
            {erro}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <button
          onClick={handleConfirmar}
          disabled={selecionadas.length === 0}
          style={{
            alignSelf: 'flex-start',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: selecionadas.length > 0 ? 'var(--color-brand)' : 'var(--color-border)',
            color: selecionadas.length > 0 ? 'var(--color-white)' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-medium)',
            cursor: selecionadas.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-fast)',
          }}
        >
          Confirmar paleta
        </button>

        {selecionadas.length > 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-success)' }}>
            Perfeito! Vamos usar essas cores em todas as sugestões daqui pra frente.
          </p>
        )}
      </div>
    </div>
  );
}

Step05Paleta.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step05Paleta };