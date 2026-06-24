// components/memorial/BreathTransition.jsx
// Animação de "respiro visual" entre etapas do questionário
// Overlay: opacidade 0 → 0.22 → 0 em 220ms
// Card selecionado: scale 1 → 1.035 → 1 em 220ms
// Brilho sutil: backdrop-filter brightness(0.97)
// Respeita prefers-reduced-motion

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './BreathTransition.module.css';

export default function BreathTransition({ ativa, cor, children }) {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [animState, setAnimState] = useState('idle'); // idle | active | fading

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!ativa || prefersReduced) return;

    setAnimState('active');
    const fadeTimeout = setTimeout(() => setAnimState('fading'), 110);
    const endTimeout = setTimeout(() => setAnimState('idle'), 220);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(endTimeout);
    };
  }, [ativa, prefersReduced]);

  if (prefersReduced) return <>{children}</>;

  const overlayOpacity = animState === 'active' ? 0.22 : 0;
  const wrapperTransform =
    animState === 'active' || animState === 'fading' ? 'scale(1.035)' : 'scale(1)';
  const backdropFilter = animState === 'active' ? 'brightness(0.97)' : 'brightness(1)';

  return (
    <div
      className={styles.wrapper}
      style={{ transform: wrapperTransform }}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {children}
      <div className={styles.srOnly}>
        {ativa ? 'Avançando para a próxima etapa...' : ''}
      </div>
      <div
        aria-hidden="true"
        className={styles.overlay}
        style={{
          backgroundColor: cor || 'var(--color-brand)',
          opacity: overlayOpacity,
          backdropFilter: backdropFilter,
          WebkitBackdropFilter: backdropFilter,
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
