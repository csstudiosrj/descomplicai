/**
 * Badge de status do contrato.
 * Cores semânticas alinhadas ao padrão visual do sistema.
 */
const STATUS_CONFIG = {
    rascunho: { label: 'Rascunho', bg: '#F5F5F5', color: '#9E9E9E' },
    enviado: { label: 'Enviado', bg: '#E3F2FD', color: '#1976D2' },
    visualizado: { label: 'Visualizado', bg: '#FFF8E1', color: '#F9A825' },
    assinado: { label: 'Assinado', bg: '#E8F5E9', color: '#10B981' },
    recusado: { label: 'Recusado', bg: '#FFEBEE', color: '#C62828' },
  };
  
  export default function ContratoStatus({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.rascunho;
  
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          background: cfg.bg,
          color: cfg.color,
          whiteSpace: 'nowrap',
        }}
      >
        {cfg.label}
      </span>
    );
  }