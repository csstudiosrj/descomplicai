// components/ui/Button.jsx
// Botão reutilizável com variantes primary, secondary e estados de loading.
// ARIA: aria-label quando não tem texto visível, aria-disabled para loading

import React from 'react';
import PropTypes from 'prop-types';

export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  disabled,
  onClick,
  children,
  ariaLabel,
  ariaExpanded,
  ariaHasPopup,
  ariaControls,
  ...rest
}) {
  const isDisabled = loading || disabled;

  const base = {
    padding: size === 'lg' ? 'var(--space-4)' : 'var(--space-3)',
    fontSize: size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-medium)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : undefined,
    opacity: isDisabled ? 0.6 : 1,
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

  // Determina aria-label: prop explícita > texto dos children
  const hasVisibleText = React.Children.toArray(children).some(
    (child) => typeof child === 'string' && child.trim().length > 0
  );
  const finalAriaLabel = ariaLabel || (!hasVisibleText ? 'Botão' : undefined);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={finalAriaLabel}
      aria-disabled={isDisabled || undefined}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      aria-controls={ariaControls}
      style={{ ...base, ...(variants[variant] || {}) }}
      {...rest}
    >
      {loading ? (
        <>
          <span className="sr-only" style={srOnlyStyle}>Carregando...</span>
          <span aria-hidden="true">Carregando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

const srOnlyStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

Button.propTypes = {
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  ariaLabel: PropTypes.string,
  ariaExpanded: PropTypes.bool,
  ariaHasPopup: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  ariaControls: PropTypes.string,
};

export { Button };
