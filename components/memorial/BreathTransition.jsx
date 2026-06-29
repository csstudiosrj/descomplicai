// components/memorial/BreathTransition.jsx
// Respiro contextual elaborado por bloco do memorial
// Framer Motion + imagem de fundo + SVG temático + linguagem inclusiva
// Duração: 2800ms (0.6s in + 1.4s hold + 0.8s out) · Respeita prefers-reduced-motion

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import styles from './BreathTransition.module.css';
import { getBreathConfig } from '../../utils/getBreathConfig';
import BreathFolhagem from '../ui/svgs/breath/BreathFolhagem';
import BreathOndas from '../ui/svgs/breath/BreathOndas';
import BreathGeometria from '../ui/svgs/breath/BreathGeometria';
import BreathArabescos from '../ui/svgs/breath/BreathArabescos';
import BreathGlam from '../ui/svgs/breath/BreathGlam';

const SVG_MAP = {
  BreathFolhagem,
  BreathOndas,
  BreathGeometria,
  BreathArabescos,
  BreathGlam,
};

const breathVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: { duration: 0.6, ease: 'easeIn' },
  },
};

const backgroundVariants = {
  initial: { opacity: 0, scale: 1.1 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
  exit: { opacity: 0, transition: { duration: 0.5 } },
};

const svgVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 0.6,
    y: 0,
    transition: { duration: 0.6, delay: 0.4 },
  },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

export default function BreathTransition({
  ativa,
  cor,
  blocoAtual,
  estiloEscolhido,
  respostaAtual,
  perfilCasal,
  children,
}) {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const config = useMemo(() => {
    if (!ativa) return null;
    return getBreathConfig(estiloEscolhido, blocoAtual, perfilCasal);
  }, [ativa, estiloEscolhido, blocoAtual, perfilCasal]);

  const SvgComponent = useMemo(() => {
    if (!config?.svgComponent) return null;
    return SVG_MAP[config.svgComponent] || null;
  }, [config]);

  const srMessage = useMemo(() => {
    if (!config) return '';
    const blockName = config.blockLabel || `Bloco ${config.blockLetter}`;
    const resposta = typeof respostaAtual === 'string' ? respostaAtual : '';
    return resposta
      ? `Avançando para ${blockName}. Você escolheu: ${resposta}`
      : `Avançando para ${blockName}`;
  }, [config, respostaAtual]);

  // Quando inativo: retorna children puro, zero interferência no layout
  if (!ativa) {
    return <>{children}</>;
  }

  // prefers-reduced-motion: pular animação
  if (prefersReduced) {
    return (
      <>
        {children}
        <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
          {srMessage}
        </div>
      </>
    );
  }

  return (
    <>
      {children}
      <AnimatePresence>
        {ativa && config && (
          <motion.div
            key="breath"
            className={styles.breathContainer}
            variants={breathVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            aria-live="polite"
            aria-atomic="true"
            role="status"
          >
            {/* Imagem de fundo */}
            <motion.div
              className={styles.backgroundImage}
              variants={backgroundVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                backgroundImage: `url(${config.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Overlay colorido */}
            <div
              className={styles.overlay}
              style={{ backgroundColor: config.overlayColor }}
            />

            {/* SVG animado */}
            {SvgComponent && (
              <motion.div
                className={styles.svgContainer}
                variants={svgVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <SvgComponent
                  color={config.textColor}
                  size={200}
                  className={styles.svgElement}
                />
              </motion.div>
            )}

            {/* Conteúdo central */}
            <div className={styles.content}>
              <p
                className={styles.blockLabel}
                style={{
                  fontFamily: config.fontFamily,
                  color: config.textColor,
                }}
              >
                Bloco {config.blockLetter} — {config.blockLabel}
              </p>
              {respostaAtual && (
                <p className={styles.responseText} style={{ color: config.textColor }}>
                  {typeof respostaAtual === 'string' ? respostaAtual : JSON.stringify(respostaAtual)}
                </p>
              )}
            </div>

            <div className={styles.srOnly}>{srMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

BreathTransition.propTypes = {
  ativa: PropTypes.bool.isRequired,
  cor: PropTypes.string,
  blocoAtual: PropTypes.string,
  estiloEscolhido: PropTypes.string,
  respostaAtual: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  perfilCasal: PropTypes.string,
  children: PropTypes.node,
};

export { BreathTransition };