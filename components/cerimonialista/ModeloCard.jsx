import React from 'react';
import Icon from '../ui/Icon';

export default function ModeloCard({ modelo, tipos, onEditar, onCopiar, onExcluir }) {
  const tipoInfo = tipos.find((t) => t.id === modelo.tipo) || tipos[tipos.length - 1];
  const variaveis = modelo.variaveis ? Object.keys(modelo.variaveis) : [];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        transition: 'box-shadow var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Topo: tipo + ações */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: tipoInfo.bg,
            color: tipoInfo.color,
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: tipoInfo.color,
            }}
          />
          {tipoInfo.label}
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button
            onClick={() => onCopiar(modelo)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label={`Duplicar modelo ${modelo.nome}`}
            title="Duplicar"
          >
            <Icon name="copy" size={16} />
          </button>
          <button
            onClick={() => onEditar(modelo)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label={`Editar modelo ${modelo.nome}`}
            title="Editar"
          >
            <Icon name="edit" size={16} />
          </button>
          <button
            onClick={() => onExcluir(modelo.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-danger)',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label={`Excluir modelo ${modelo.nome}`}
            title="Excluir"
          >
            <Icon name="trash" size={16} />
          </button>
        </div>
      </div>

      {/* Nome */}
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--leading-snug)',
          wordBreak: 'break-word',
        }}
      >
        {modelo.nome}
      </h3>

      {/* Preview do conteúdo */}
      {modelo.conteudo && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-normal)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {modelo.conteudo}
        </p>
      )}

      {/* Variáveis */}
      {variaveis.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'auto' }}>
          {variaveis.slice(0, 5).map((v) => (
            <span
              key={v}
              style={{
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-brand-lighter)',
                color: 'var(--color-brand)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
              }}
            >
              {'{{' + v + '}}'}
            </span>
          ))}
          {variaveis.length > 5 && (
            <span
              style={{
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-off-white)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
              }}
            >
              +{variaveis.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
