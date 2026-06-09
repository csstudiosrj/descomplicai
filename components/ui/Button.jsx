export default function Button({ type = 'button', variant = 'primary', size = 'md', fullWidth, loading, onClick, children }) {
  const base = {
    padding: size === 'lg' ? 'var(--space-4)' : 'var(--space-3)',
    fontSize: size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontWeight: 'var(--font-medium)',
    cursor: loading ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : undefined,
    opacity: loading ? 0.6 : 1,
  };
  const variants = {
    primary: {
      backgroundColor: 'var(--color-brand)',
      color: 'var(--color-white)',
    },
    secondary: {
      backgroundColor: 'var(--color-white)',
      color: 'var(--color-text-primary)',
      border: '1.5px solid var(--color-border-strong)',
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{ ...base, ...(variants[variant] || {}) }}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
}