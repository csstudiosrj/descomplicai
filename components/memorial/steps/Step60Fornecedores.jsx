// Bloco K — Confirmação da lista automática de fornecedores gerada pelo algoritmo
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { listarFornecedoresNecessarios } from '../../../utils/gerador-memorial';

export default function Step60Fornecedores({ onConcluir, estadoAtual }) {
  const fornecedores = useMemo(
    () => listarFornecedoresNecessarios(estadoAtual),
    [estadoAtual]
  );

  const agrupados = useMemo(() => {
    const grupos = {};
    fornecedores.forEach((f) => {
      if (!grupos[f.categoria]) grupos[f.categoria] = [];
      grupos[f.categoria].push(f.nome);
    });
    return Object.entries(grupos);
  }, [fornecedores]);

  const handleConfirmar = (event) => {
    event.preventDefault();
    // Envia os fornecedores diretamente para conclusão, sem passar pelo handleSelect
    if (onConcluir) onConcluir(fornecedores);
  };

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
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
        Seus fornecedores sugeridos
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Com base em todas as suas escolhas, identificamos estas categorias de
        fornecedores necessários para seu casamento:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {agrupados.map(([categoria, nomes]) => (
          <Card key={categoria} variant="default" padding="md">
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-brand)',
                fontSize: 'var(--text-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-2)',
              }}
            >
              {categoria}
            </div>
            {nomes.map((nome, i) => (
              <div
                key={nome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) 0',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-primary)',
                  borderBottom:
                    i < nomes.length - 1
                      ? '1px solid var(--color-border)'
                      : 'none',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-brand)',
                    flexShrink: 0,
                  }}
                />
                <span>{nome}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-brand-lighter)',
          border: '1px solid var(--color-brand-light)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-brand-dark)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          Você pode adicionar, remover ou substituir fornecedores depois no
          painel. Esta é apenas uma lista inicial inteligente.
        </p>
      </div>

      <button
        type="button"
        onClick={handleConfirmar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-4) var(--space-8)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--color-brand)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        Finalizar memorial
      </button>
    </div>
  );
}

Step60Fornecedores.propTypes = {
  onConcluir: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step60Fornecedores };