// components/memorial/BreathTransition.jsx
// Respiro visual INTENSO — agora perceptível
// Overlay opacidade 0.40 + blur + glow central + 500ms
// Respeita prefers-reduced-motion

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './BreathTransition.module.css';

export default function BreathTransition({ ativa, cor, children }) {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [fase, setFase] = useState('idle'); // idle | inhale | exhale

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!ativa || prefersReduced) {
      setFase('idle');
      return;
    }

    // Ciclo de respiração: inspira (250ms) → expira (250ms) = 500ms total
    setFase('inhale');
    const exhaleTimeout = setTimeout(() => setFase('exhale'), 250);
    const idleTimeout = setTimeout(() => setFase('idle'), 500);

    return () => {
      clearTimeout(exhaleTimeout);
      clearTimeout(idleTimeout);
    };
  }, [ativa, prefersReduced]);

  if (prefersReduced) return <>{children}</>;

  const isBreathing = fase === 'inhale' || fase === 'exhale';

  return (
    <div
      className={styles.wrapper}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {children}
      <div className={styles.srOnly}>
        {isBreathing ? 'Avançando para a próxima etapa...' : ''}
      </div>

      {/* Overlay de cor — mais opaco e com blur */}
      <div
        aria-hidden="true"
        className={`${styles.overlay} ${isBreathing ? styles.overlayActive : ''}`}
        style={{ backgroundColor: cor || 'var(--color-brand)' }}
      />

      {/* Glow central — círculo de luz que expande */}
      <div
        aria-hidden="true"
        className={`${styles.glow} ${isBreathing ? styles.glowActive : ''}`}
        style={{ backgroundColor: cor || 'var(--color-brand)' }}
      />
    </div>
  );
}

BreathTransition.propTypes = {
  ativa: PropTypes.bool.isRequired,
  cor: PropTypes.string,
  children: PropTypes.node,
};

export { BreathTransition };
