export default function ContratoStatus({ status, statusInfo }) {
  const info = statusInfo || { label: status, color: '#9E9E9E', bg: '#F5F5F5' };
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
    }}>
      {info.label}
    </span>
  );
}