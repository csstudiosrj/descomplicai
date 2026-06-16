// components/painel/ProgressBar.jsx — Barra de progresso geral
export default function ProgressBar({ percentual, label }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>{percentual}%</span>
      </div>
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${percentual}%`,
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid var(--color-secondary)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  value: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  track: {
    height: '8px',
    background: 'var(--color-secondary)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: 'var(--color-primary)',
    borderRadius: '4px',
    transition: 'width 0.6s ease',
  },
};
