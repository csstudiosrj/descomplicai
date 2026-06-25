// components/vitrine/ContatoCard.jsx
// Card de contato do cerimonialista com 3 níveis de visibilidade
// Público: nada | Logado: parcial + watermark | Assinante: completo clicável

import React from 'react';
import Icon from '../ui/Icon';

export default function ContatoCard({
  telefone,
  instagram,
  site,
  email,
  isPublico,
  isLogado,
  isAssinante,
  telefoneParcial,
}) {
  const hasAnyContact = telefone || instagram || site || email;

  if (!hasAnyContact) {
    return (
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        fontStyle: 'italic',
      }}>
        Nenhum dado de contato cadastrado.
      </p>
    );
  }

  // Público: não vê nada de contato
  if (isPublico) {
    return (
      <div style={{
        padding: 'var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1.5px dashed var(--color-border)',
        textAlign: 'center',
      }}>
        <Icon name="lock" size={28} color="var(--color-text-muted)" />
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          marginTop: 'var(--space-3)',
        }}>
          Dados de contato disponíveis para usuários cadastrados.
        </p>
      </div>
    );
  }

  // Logado (não assinante): vê parcial + watermark
  if (isLogado) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          filter: 'blur(1.5px)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          {telefoneParcial && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="phone" size={18} color="var(--color-text-muted)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                {telefoneParcial}
              </span>
            </div>
          )}
          {instagram && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="users" size={18} color="var(--color-text-muted)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                @{instagram}
              </span>
            </div>
          )}
          {site && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="link" size={18} color="var(--color-text-muted)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                {site}
              </span>
            </div>
          )}
        </div>

        {/* Watermark overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(243, 240, 236, 0.85)',
          backdropFilter: 'blur(2px)',
        }}>
          <Icon name="award" size={32} color="var(--color-brand)" />
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-brand-dark)',
            marginTop: 'var(--space-2)',
            fontWeight: 'var(--font-medium)',
          }}>
            Descomplicaí Pro
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-1)',
          }}>
            Assine para desbloquear o contato completo
          </p>
        </div>
      </div>
    );
  }

  // Assinante: vê tudo completo e clicável
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    }}>
      {telefone && (
        <a
          href={`tel:${telefone.replace(/\D/g, '')}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            textDecoration: 'none',
            color: 'var(--color-text-primary)',
          }}
        >
          <Icon name="phone" size={18} color="var(--color-brand)" />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
            {telefone}
          </span>
        </a>
      )}

      {instagram && (
        <a
          href={`https://instagram.com/${instagram.replace(/^@/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            textDecoration: 'none',
            color: 'var(--color-text-primary)',
          }}
        >
          <Icon name="users" size={18} color="var(--color-brand)" />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
            @{instagram.replace(/^@/, '')}
          </span>
        </a>
      )}

      {site && (
        <a
          href={site.startsWith('http') ? site : `https://${site}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            textDecoration: 'none',
            color: 'var(--color-text-primary)',
          }}
        >
          <Icon name="link" size={18} color="var(--color-brand)" />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            wordBreak: 'break-all',
          }}>
            {site}
          </span>
        </a>
      )}

      {email && (
        <a
          href={`mailto:${email}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            textDecoration: 'none',
            color: 'var(--color-text-primary)',
          }}
        >
          <Icon name="mail" size={18} color="var(--color-brand)" />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            wordBreak: 'break-all',
          }}>
            {email}
          </span>
        </a>
      )}
    </div>
  );
}
