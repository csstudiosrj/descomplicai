import { useState, useRef, useCallback } from 'react';
import { arredondarMoeda } from '../../utils/formatters';

function formatarDisplay(valor) {
  if (!valor && valor !== 0) return '';
  const num = Number(valor);
  if (isNaN(num)) return '';
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function InputMoeda({ value, onChange, placeholder, style, label }) {
  const [display, setDisplay] = useState(() => formatarDisplay(value));
  const isEditingRef = useRef(false);

  // Sincroniza display quando value muda EXTERNAmente (não durante digitação)
  const prevValueRef = useRef(value);
  if (!isEditingRef.current && value !== prevValueRef.current) {
    setDisplay(formatarDisplay(value));
    prevValueRef.current = value;
  }

  const handleChange = useCallback((e) => {
    const raw = e.target.value;
    // Remove tudo que não é número
    const digits = raw.replace(/\D/g, '');
    // Converte para centavos (divide por 100) e arredonda para evitar imprecisão
    const num = arredondarMoeda(Number(digits) / 100);
    isEditingRef.current = true;
    onChange(num);
    setDisplay(formatarDisplay(num));
  }, [onChange]);

  const handleFocus = useCallback(() => {
    isEditingRef.current = true;
    setDisplay(formatarDisplay(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    isEditingRef.current = false;
    prevValueRef.current = value;
    setDisplay(formatarDisplay(value));
  }, [value]);

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
