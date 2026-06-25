import React from 'react';
import Icon from '../ui/Icon';

export default function AssistenteCard({ assistente, acessos, onToggleAtivo, onEditar, onExcluir }) {
  const acessoInfo = acessos.find((a) => a.id === assistente.acesso) || acessos[0];

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
        opacity: assistente.ativo ? 1 : 0.6,
        transition: 'opacity var(--transition-fast)',
      }}
    >
      {/* Topo: avatar + ações */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: acessoInfo.bg,
              color: acessoInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              flexShrink: 0,
            }}
          >
            {assistente.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                wordBreak: 'break-word',
              }}
            >
              {assistente.nome}
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {assistente.email}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button
            onClick={() => onEditar(assistente)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label={`Editar ${assistente.nome}`}
            title="Editar"
          >
            <Icon name="edit" size={16} />
          </button>
          <button
            onClick={() => onExcluir(assistente.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-danger)',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label={`Remover ${assistente.nome}`}
            title="Remover"
          >
            <Icon name="trash" size={16} />
          </button>
        </div>
      </div>

      {/* Badge de acesso + toggle ativo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', marginTop: 'auto' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: acessoInfo.bg,
            color: acessoInfo.color,
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
              backgroundColor: acessoInfo.color,
            }}
          />
          {acessoInfo.label}
        </span>

        <button
          onClick={() => onToggleAtivo(assistente.id, assistente.ativo)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            backgroundColor: assistente.ativo ? 'var(--color-success-light)' : 'var(--color-off-white)',
            color: assistente.ativo ? 'var(--color-success)' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Icon name={assistente.ativo ? 'userCheck' : 'userX'} size={14} />
          {assistente.ativo ? 'Ativo' : 'Inativo'}
        </button>
      </div>
    </div>
  );
}
