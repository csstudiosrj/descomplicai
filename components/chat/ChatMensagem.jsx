import React from 'react';
import Icon from '../ui/Icon';

export default function ChatMensagem({ mensagem, isMe }) {
  const hora = new Date(mensagem.criado_em).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dataHoje = new Date().toDateString();
  const dataMsg = new Date(mensagem.criado_em).toDateString();
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  let labelData = '';
  if (dataMsg === dataHoje) {
    labelData = '';
  } else if (dataMsg === ontem.toDateString()) {
    labelData = 'Ontem';
  } else {
    labelData = new Date(mensagem.criado_em).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        padding: 'var(--space-2) var(--space-4)',
      }}
      role="listitem"
      aria-label={isMe ? 'Mensagem enviada por você' : 'Mensagem recebida'}
    >
      <div
        style={{
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMe ? 'flex-end' : 'flex-start',
          gap: '4px',
        }}
      >
        <div
          style={{
            background: isMe ? 'var(--color-brand)' : 'var(--color-white)',
            color: isMe ? 'var(--color-white)' : 'var(--color-text-primary)',
            borderRadius: isMe
              ? 'var(--radius-md) var(--radius-md) 2px var(--radius-md)'
              : 'var(--radius-md) var(--radius-md) var(--radius-md) 2px',
            padding: 'var(--space-3) var(--space-4)',
            boxShadow: 'var(--shadow-sm)',
            border: isMe ? 'none' : '1px solid var(--color-border)',
            wordBreak: 'break-word',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          {mensagem.conteudo}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            padding: '0 var(--space-1)',
          }}
        >
          {labelData && <span>{labelData}</span>}
          <span>{hora}</span>
          {isMe && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: mensagem.lida ? 'var(--color-info)' : 'var(--color-text-muted)',
              }}
              aria-label={mensagem.lida ? 'Mensagem lida' : 'Mensagem enviada'}
            >
              <Icon
                name={mensagem.lida ? 'checkDouble' : 'check'}
                size={14}
                color={mensagem.lida ? 'var(--color-info)' : 'var(--color-text-muted)'}
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
