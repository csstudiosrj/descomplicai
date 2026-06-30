// components/ui/Input.jsx
// Campo de entrada com label associado, aria-describedby para erro/ajuda
// ARIA: label via htmlFor, aria-describedby para mensagens de erro

import React from 'react';
import PropTypes from 'prop-types';

export default function Input({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  hint,
  error,
  disabled,
  autoComplete,
  ...rest
}) {
  const inputId = id || `input-${React.useId().replace(/:/g, '')}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          {label}
          {required && (
            <span aria-hidden="true" style={{ color: 'var(--color-danger)', marginLeft: '2px' }}>
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : undefined}
        autoComplete={autoComplete}
        style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border-strong)'}`,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          outline: 'none',
          backgroundColor: disabled ? 'var(--color-surface)' : 'var(--color-white)',
          color: 'var(--color-text-primary)',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--color-brand)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-brand-lighter)';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border-strong)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...rest}
      />
      {hint && !error && (
        <span
          id={hintId}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {hint}
        </span>
      )}
      {error && (
        <span
          id={errorId}
          role="alert"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

Input.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  hint: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
};

export { Input };
