// components/memorial/BreathTransition.jsx
// Animação de "respiro visual" entre etapas do questionário
// O card clicado pulsa suavemente na cor escolhida antes de avançar
// Sistema aguarda 400ms (respiro visual mais perceptível e elegante)
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

    // Ciclo de respiração: inspira (200ms) → expira (200ms)
    setFase('inhale');
    const exhaleTimeout = setTimeout(() => setFase('exhale'), 200);
    const idleTimeout = setTimeout(() => setFase('idle'), 400);

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
      <div
        aria-hidden="true"
        className={`${styles.overlay} ${isBreathing ? styles.overlayActive : ''}`}
        style={{
          backgroundColor: cor || 'var(--color-brand)',
        }}
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
