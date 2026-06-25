import React from 'react';
import Icon from '../ui/Icon';

export default function ChatMensagem({ mensagem, modo }) {
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

  // Posicionamento fixo: casal sempre à esquerda, cerimonialista sempre à direita
  const isCasal = mensagem.remetente_tipo === 'casal';
  const alinhamento = isCasal ? 'flex-start' : 'flex-end';
  const bg = isCasal ? 'var(--color-white)' : 'var(--color-brand)';
  const cor = isCasal ? 'var(--color-text-primary)' : 'var(--color-white)';
  const borda = isCasal ? '1px solid var(--color-border)' : 'none';
  const borderRadius = isCasal
    ? 'var(--radius-md) var(--radius-md) var(--radius-md) 2px'
    : 'var(--radius-md) var(--radius-md) 2px var(--radius-md)';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: alinhamento,
        padding: 'var(--space-2) var(--space-4)',
      }}
      role="listitem"
      aria-label={isCasal ? 'Mensagem do casal' : 'Mensagem do cerimonialista'}
    >
      <div
        style={{
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCasal ? 'flex-start' : 'flex-end',
          gap: '4px',
        }}
      >
        <div
          style={{
            background: bg,
            color: cor,
            borderRadius: borderRadius,
            padding: 'var(--space-3) var(--space-4)',
            boxShadow: 'var(--shadow-sm)',
            border: borda,
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
          {!isCasal && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: mensagem.lida ? 'var(--color-info-light)' : 'var(--color-text-muted)',
              }}
              aria-label={mensagem.lida ? 'Mensagem lida' : 'Mensagem enviada'}
            >
              <Icon
                name={mensagem.lida ? 'checkDouble' : 'check'}
                size={14}
                color={mensagem.lida ? 'var(--color-info-light)' : 'var(--color-text-muted)'}
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
