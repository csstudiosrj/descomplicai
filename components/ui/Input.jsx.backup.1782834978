export default function Input({ label, type = 'text', placeholder, value, onChange, required, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {label && (
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--color-border-strong)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          outline: 'none',
        }}
      />
      {hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{hint}</span>}
    </div>
  );
}