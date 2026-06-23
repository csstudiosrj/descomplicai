export default function ContratoStatus({ status }) {
  const STATUS_MAP = {
    rascunho: { label: 'Rascunho', color: '#9E9E9E', bg: '#F5F5F5' },
    enviado: { label: 'Enviado', color: '#F9A825', bg: '#FFF8E1' },
    visualizado: { label: 'Visualizado', color: '#1976D2', bg: '#E3F2FD' },
    assinado: { label: 'Assinado', color: '#10B981', bg: '#E8F5E9' },
    recusado: { label: 'Recusado', color: '#C62828', bg: '#FFEBEE' },
  };

  const info = STATUS_MAP[status] || { label: status, color: '#9E9E9E', bg: '#F5F5F5' };

  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      fontFamily: 'var(--font-body)',
      whiteSpace: 'nowrap',
      background: info.bg,
      color: info.color,
      display: 'inline-block',
      letterSpacing: '0.2px',
    }}>
      {info.label}
    </span>
  );
}