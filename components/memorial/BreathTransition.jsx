// Animação de "respiro visual" entre etapas do questionário
// Dependências diretas: React, PropTypes

import React from 'react';
import PropTypes from 'prop-types';

export default function BreathTransition({ ativa, cor, children }) {
  const [prefersReduced, setPrefersReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (prefersReduced) return <>{children}</>;

  const overlayStyles = {
    position: 'fixed',
    inset: 0,
    zIndex: 'var(--z-modal)',
    backgroundColor: cor || 'var(--color-brand)',
    opacity: ativa ? 0.15 : 0,
    pointerEvents: 'none',
    transition: 'opacity var(--transition-breath)',
  };

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div aria-hidden="true" style={overlayStyles} />
    </div>
  );
}

BreathTransition.propTypes = {
  ativa: PropTypes.bool.isRequired,
  cor: PropTypes.string,
  children: PropTypes.node,
};

export { BreathTransition };