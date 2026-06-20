import { useState, useEffect } from 'react';

function formatarMoeda(valor) {
  if (!valor && valor !== 0) return '';
  const num = Number(valor);
  if (isNaN(num)) return '';
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseMoeda(valorStr) {
  if (!valorStr) return 0;
  const limpo = valorStr
    .replace(/R\$/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const num = Number(limpo);
  return isNaN(num) ? 0 : num;
}

export default function InputMoeda({ value, onChange, placeholder, style, label }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay(formatarMoeda(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    // Remove tudo que não é número
    const digits = raw.replace(/\D/g, '');
    // Converte para centavos (divide por 100)
    const num = Number(digits) / 100;
    onChange(num);
    setDisplay(formatarMoeda(num));
  };

  const handleFocus = () => {
    setDisplay(formatarMoeda(value));
  };

  const handleBlur = () => {
    setDisplay(formatarMoeda(value));
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      {label && (
        <label style={labelStyle}>{label}</label>
      )}
      <div style={wrapperStyle}>
        <span style={prefixStyle}>R$</span>
        <input
          type="text"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || '0,00'}
          style={{ ...inputStyle, ...style }}
        />
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-text)',
  marginBottom: '6px',
  fontFamily: 'var(--font-body)',
};

const wrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid var(--color-secondary)',
  borderRadius: '8px',
  padding: '0 12px',
  background: '#fff',
  height: '42px',
};

const prefixStyle = {
  fontSize: '14px',
  color: 'var(--color-text-soft)',
  fontWeight: 500,
  marginRight: '8px',
  fontFamily: 'var(--font-body)',
  userSelect: 'none',
};

const inputStyle = {
  border: 'none',
  outline: 'none',
  flex: 1,
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: 'var(--color-text)',
  background: 'transparent',
  padding: 0,
  width: '100%',
};