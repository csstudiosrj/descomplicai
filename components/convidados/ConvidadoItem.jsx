import { useState, useRef, useEffect } from 'react';
import Icon from '../../components/ui/Icon';

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', cor: '#F9A825', bg: '#FFF8E1' },
  confirmado: { label: 'Confirmado', cor: '#10B981', bg: '#E8F5E9' },
  recusado: { label: 'Recusado', cor: '#C62828', bg: '#FFEBEE' },
};

function getIniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

export default function ConvidadoItem({ convidado, grupos, mesas, readOnly, onStatusChange, onEdit, onExcluir }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [animarBadge, setAnimarBadge] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const badgeRef = useRef(null);

  const cfg = STATUS_CONFIG[convidado.confirmado] || STATUS_CONFIG.pendente;

  const handleStatusChange = (novo) => {
    setAnimarBadge(true);
    onStatusChange(convidado.id, novo);
    setMenuAberto(false);
    setTimeout(() => setAnimarBadge(false), 400);
  };

  const abrirMenu = () => {
    if (readOnly) return;
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const menuHeight = 140;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < menuHeight ? rect.top - menuHeight - 4 : rect.bottom + 4;
      setMenuPos({ top, left: rect.left });
    }
    setMenuAberto(true);
  };

  useEffect(() => {
    if (!menuAberto) return;
    const handleClose = () => setMenuAberto(false);
    window.addEventListener('scroll', handleClose, { once: true });
    window.addEventListener('resize', handleClose, { once: true });
    return () => {
      window.removeEventListener('scroll', handleClose);
      window.removeEventListener('resize', handleClose);
    };
  }, [menuAberto]);

  const grupoLabel = grupos.find(g => g.nome === convidado.grupo)?.nome || convidado.grupo || 'Geral';
  const mesa = mesas?.find(m => m.id === convidado.mesa_id);
  const iniciais = getIniciais(convidado.nome);

  return (
    <div style={cardStyle}>
      <div style={leftSectionStyle}>
        <div style={avatarStyle}>
          <span style={avatarTextStyle}>{iniciais}</span>
        </div>
        <div style={infoStyle}>
          <span style={nomeStyle}>{convidado.nome}</span>
          <div style={metaRowStyle}>
            {grupoLabel && (
              <span style={grupoBadgeStyle}>{grupoLabel}</span>
            )}
            {convidado.telefone && (
              <span style={telefoneStyle}>{convidado.telefone}</span>
            )}
            {convidado.acompanhantes > 0 && (
              <span style={acompanhanteStyle}>+{convidado.acompanhantes} acomp.</span>
            )}
            {mesa && (
              <span style={mesaBadgeStyle}>Mesa {mesa.numero}</span>
            )}
          </div>
        </div>
      </div>

      <div style={rightSectionStyle}>
        <div style={{ position: 'relative' }}>
          <button
            ref={badgeRef}
            onClick={abrirMenu}
            style={{
              ...badgeStyle,
              background: cfg.bg,
              color: cfg.cor,
              animation: animarBadge ? 'badgePop 0.4s ease' : 'none',
              cursor: readOnly ? 'default' : 'pointer',
            }}
          >
            <span style={badgeLabelStyle}>{cfg.label}</span>
            {!readOnly && (
              <span style={badgeArrowStyle}>
                <Icon name="chevron-down" size={10} />
              </span>
            )}
          </button>

          {menuAberto && !readOnly && (
            <>
              <div style={menuBackdropStyle} onClick={() => setMenuAberto(false)} />
              <div style={{
                ...menuDropdownStyle,
                top: `${menuPos.top}px`,
                left: `${menuPos.left}px`,
              }}>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key)}
                    style={{
                      ...menuItemStyle,
                      background: convidado.confirmado === key ? val.bg : 'transparent',
                      color: val.cor,
                    }}
                  >
                    <span style={menuDotStyle(val.cor)} />
                    {val.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {!readOnly && (
          <div style={actionsStyle}>
            <button
              onClick={() => onEdit(convidado)}
              style={actionBtnStyle}
              title="Editar"
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              onClick={() => onExcluir(convidado.id)}
              style={actionBtnExcluirStyle}
              title="Excluir"
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
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

/* ===== STYLES ===== */
const cardStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 16px',
  borderBottom: '1px solid #F0EDE9',
  background: '#fff',
  transition: 'background 150ms ease',
  gap: '12px',
};

const leftSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
  minWidth: 0,
};

const avatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: '#F0EDE9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const avatarTextStyle = {
  fontFamily: 'var(--font-display, Georgia, serif)',
  fontSize: '13px',
  fontWeight: 600,
  color: '#A89B91',
  lineHeight: 1,
};

const infoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0,
  flex: 1,
};

const nomeStyle = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#1A1714',
  fontFamily: 'var(--font-body)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const metaRowStyle = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

const grupoBadgeStyle = {
  fontSize: '11px',
  color: '#A89B91',
  fontFamily: 'var(--font-body)',
  background: '#F9F7F4',
  padding: '2px 8px',
  borderRadius: '10px',
  fontWeight: 500,
};

const telefoneStyle = {
  fontSize: '12px',
  color: '#A89B91',
  fontFamily: 'var(--font-body)',
};

const acompanhanteStyle = {
  fontSize: '11px',
  color: '#8B6F5E',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
};

const mesaBadgeStyle = {
  fontSize: '11px',
  color: '#fff',
  background: '#8B6F5E',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  padding: '2px 8px',
  borderRadius: '10px',
};

const rightSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  borderRadius: '20px',
  border: 'none',
  fontFamily: 'var(--font-body)',
  whiteSpace: 'nowrap',
};

const badgeLabelStyle = {
  fontSize: '11px',
  fontWeight: 600,
};

const badgeArrowStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  opacity: 0.7,
};

const menuBackdropStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
};

const menuDropdownStyle = {
  position: 'fixed',
  background: '#fff',
  borderRadius: '10px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  border: '1px solid #F0EDE9',
  padding: '6px',
  zIndex: 60,
  minWidth: '150px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 10px',
  borderRadius: '6px',
  border: 'none',
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const menuDotStyle = (cor) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: cor,
  flexShrink: 0,
});

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
};

const actionBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#A89B91',
  borderRadius: '8px',
  transition: 'background 150ms ease, color 150ms ease',
};

const actionBtnExcluirStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#A89B91',
  borderRadius: '8px',
  transition: 'background 150ms ease, color 150ms ease',
};