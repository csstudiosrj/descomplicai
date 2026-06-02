// Componente de input reutilizável — text, number, textarea, etc.
// Componente Input — campo de texto com label, prefixo, sufixo e feedback integrados
// Dependências diretas: React, PropTypes

import React, { useId } from 'react';
import PropTypes from 'prop-types';

/**
 * Input — campo de texto acessível com estados visuais
 *
 * @param {string} label - texto do label acima do campo
 * @param {string} type - tipo do input: text | email | password | tel | number | date | search
 * @param {string} placeholder - placeholder do campo
 * @param {string} value - valor controlado
 * @param {function} onChange - handler de mudança
 * @param {string} error - mensagem de erro (ativa estado de erro)
 * @param {string} hint - texto de ajuda abaixo do campo
 * @param {boolean} disabled - desabilita o campo
 * @param {boolean} required - campo obrigatório
 * @param {React.ReactNode} prefix - ícone ou texto antes do input
 * @param {React.ReactNode} suffix - ícone ou texto após o input
 * @param {string} id - id do input (gerado automaticamente se omitido)
 * @param {string} className - classes CSS extras
 */
export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  disabled = false,
  required = false,
  prefix,
  suffix,
  id: idProp,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const id = idProp || generatedId;
  const hasError = !!error;

  const wrapperStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    width: '100%',
    opacity: disabled ? 0.5 : 1,
  };

  const labelStyles = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    color: hasError ? 'var(--color-danger)' : 'var(--color-text-secondary)',
    marginBottom: 'var(--space-1)',
  };

  const fieldStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    width: '100%',
    minHeight: '44px',
    padding: 'var(--space-3) var(--space-4)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    backgroundColor: disabled ? 'var(--color-surface)' : 'var(--color-white)',
    border: `1.5px solid ${
      hasError
        ? 'var(--color-danger)'
        : 'var(--color-border)'
    }`,
    borderRadius: 'var(--radius-md)',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const inputStyles = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    minWidth: 0,
  };

  const feedbackStyles = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: hasError ? 'var(--color-danger)' : 'var(--color-text-muted)',
    minHeight: '1.25rem',
  };

  const handleFocus = (e) => {
    if (!disabled) {
      e.currentTarget.style.borderColor = hasError ? 'var(--color-danger)' : 'var(--color-brand)';
      e.currentTarget.style.boxShadow = `0 0 0 3px ${
        hasError ? 'var(--color-danger-light)' : 'var(--color-brand-lighter)'
      }`;
    }
  };

  const handleBlur = (e) => {
    e.currentTarget.style.borderColor = hasError ? 'var(--color-danger)' : 'var(--color-border)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className={className} style={wrapperStyles}>
      {label && (
        <label htmlFor={id} style={labelStyles}>
          {label}
          {required && (
            <span
              aria-hidden="true"
              style={{ color: 'var(--color-danger)', marginLeft: 'var(--space-1)' }}
            >
              *
            </span>
          )}
        </label>
      )}

      <div
        style={fieldStyles}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {prefix && (
          <span
            aria-hidden="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}
          >
            {prefix}
          </span>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-feedback` : hint ? `${id}-feedback` : undefined}
          style={inputStyles}
          {...rest}
        />

        {suffix && (
          <span
            aria-hidden="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {(error || hint) && (
        <div id={`${id}-feedback`} style={feedbackStyles} role={hasError ? 'alert' : undefined}>
          {error || hint}
        </div>
      )}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'tel', 'number', 'date', 'search']),
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  id: PropTypes.string,
  className: PropTypes.string,
};

export { Input };