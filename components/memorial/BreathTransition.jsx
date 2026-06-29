// components/memorial/BreathTransition.jsx
// Respiro contextual elaborado por bloco do memorial
// Framer Motion + imagem de fundo + SVG temático + linguagem inclusiva
// Duração: 1400ms até troca de etapa · fade-out de 0.8s continua enquanto novo step surge · Fluido

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: { duration: 0.8, ease: 'easeIn' },
  },
};

const backgroundVariants = {
  initial: { opacity: 0, scale: 1.1 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: { opacity: 0, transition: { duration: 0.7 } },
};

const svgVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 0.6,
    y: 0,
    transition: { duration: 0.5, delay: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.6 } },
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
  // Congela config no momento da ativação — não re-renderiza durante fade-out
  const frozenConfig = useRef(null);
  const frozenResposta = useRef('');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Quando ativa=true, congela config e resposta
  useEffect(() => {
    if (ativa) {
      frozenConfig.current = getBreathConfig(estiloEscolhido, blocoAtual, perfilCasal);
      frozenResposta.current = typeof respostaAtual === 'string' ? respostaAtual : '';
    }
  }, [ativa, estiloEscolhido, blocoAtual, perfilCasal, respostaAtual]);

  const config = frozenConfig.current;
  const resposta = frozenResposta.current;

  const SvgComponent = useMemo(() => {
    if (!config?.svgComponent) return null;
    return SVG_MAP[config.svgComponent] || null;
  }, [config]);

  const srMessage = useMemo(() => {
    if (!config) return '';
    const blockName = config.blockLabel || `Bloco ${config.blockLetter}`;
    return resposta
      ? `Avançando para ${blockName}. Você escolheu: ${resposta}`
      : `Avançando para ${blockName}`;
  }, [config, resposta]);

  if (!ativa) {
    return <>{children}</>;
  }

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

            <div
              className={styles.overlay}
              style={{ backgroundColor: config.overlayColor }}
            />

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
              {resposta && (
                <p className={styles.responseText} style={{ color: config.textColor }}>
                  {resposta}
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