import { useState } from 'react';

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', cor: '#F9A825', bg: '#FFF8E1' },
  confirmado: { label: 'Confirmado', cor: '#2E7D32', bg: '#E8F5E9' },
  recusado: { label: 'Recusado', cor: '#C62828', bg: '#FFEBEE' },
};

export default function ConvidadoItem({ convidado, grupos, readOnly, onStatusChange, onEdit, onExcluir }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [animarBadge, setAnimarBadge] = useState(false);

  const cfg = STATUS_CONFIG[convidado.confirmado] || STATUS_CONFIG.pendente;

  const handleStatusChange = (novo) => {
    setAnimarBadge(true);
    onStatusChange(convidado.id, novo);
    setMenuAberto(false);
    setTimeout(() => setAnimarBadge(false), 400);
  };

  const grupoLabel = grupos.find(g => g.nome === convidado.grupo)?.nome || convidado.grupo || 'Geral';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-white)',
      transition: 'background 150ms ease',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-off-white)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-white)'; }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-body)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {convidado.nome}
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {grupoLabel && (
            <span style={{
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              background: 'var(--color-off-white)',
              padding: '2px 8px',
              borderRadius: '10px',
            }}>
              {grupoLabel}
            </span>
          )}
          {convidado.telefone && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
              {convidado.telefone}
            </span>
          )}
          {convidado.acompanhantes > 0 && (
            <span style={{
              fontSize: '11px',
              color: 'var(--color-brand)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
            }}>
              +{convidado.acompanhantes} acomp.
            </span>
          )}
          {convidado.mesa && (
            <span style={{
              fontSize: '11px',
              color: 'var(--color-brand)',
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
            }}>
              Mesa {convidado.mesa}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Badge de status com menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => !readOnly && setMenuAberto(!menuAberto)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              border: 'none',
              background: cfg.bg,
              color: cfg.cor,
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: readOnly ? 'default' : 'pointer',
              animation: animarBadge ? 'badgePop 0.4s ease' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {cfg.label}
            {!readOnly && (
              <span style={{ fontSize: '10px', marginLeft: '2px' }}>v</span>
            )}
          </button>

          {menuAberto && !readOnly && (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 50,
                }}
                onClick={() => setMenuAberto(false)}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: 'var(--color-white)',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid var(--color-border)',
                padding: '6px',
                zIndex: 60,
                minWidth: '140px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: convidado.confirmado === key ? val.bg : 'transparent',
                      color: val.cor,
                      fontSize: '12px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {!readOnly && (
          <>
            <button
              onClick={() => onEdit(convidado)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: 'var(--color-text-secondary)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
              }}
              title="Editar"
            >
              Editar
            </button>
            <button
              onClick={() => onExcluir(convidado.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: '#C62828',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
              }}
              title="Excluir"
            >
              Excluir
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes badgePop {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}