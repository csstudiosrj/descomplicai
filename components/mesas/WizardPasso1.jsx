import { useState, useEffect } from 'react';

export default function WizardPasso1({ totalConvidados, onChange, onAvancar }) {
  const [valor, setValor] = useState(totalConvidados > 0 ? String(totalConvidados) : '');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (totalConvidados > 0) setValor(String(totalConvidados));
  }, [totalConvidados]);

  const avancar = () => {
    const num = Number(valor);
    if (!num || num < 1) {
      setErro('Informe um numero valido de convidados');
      return;
    }
    setErro('');
    onChange(num);
    onAvancar();
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setValor(v);
    const num = Number(v);
    if (num && num >= 1) {
      onChange(num);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ maxWidth: '400px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
        }}>
          Quantos convidados voce espera?
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
          marginBottom: '24px',
        }}>
          O sistema vai calcular automaticamente quantas mesas voce precisa.
        </p>
      </div>

      <input
        type="number"
        min="1"
        value={valor}
        onChange={handleChange}
        onKeyDown={(e) => e.key === 'Enter' && avancar()}
        placeholder="Ex: 120"
        style={{
          width: '200px',
          padding: '14px 18px',
          borderRadius: '12px',
          border: '2px solid var(--color-border)',
          fontSize: '24px',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          outline: 'none',
          background: 'var(--color-white)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
      />

      {erro && (
        <span style={{
          fontSize: '13px',
          color: '#C62828',
          fontFamily: 'var(--font-body)',
        }}>{erro}</span>
      )}

      <button
        onClick={avancar}
        style={{
          marginTop: '12px',
          padding: '12px 32px',
          borderRadius: '10px',
          border: 'none',
          background: 'var(--color-brand)',
          color: '#fff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
        }}
      >
        Proximo
      </button>
    </div>
  );
}