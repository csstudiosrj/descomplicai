// components/ui/svgs/breath/BreathFolhagem.jsx
// Folhas estilizadas balançando suavemente — boho, tropical, rustico, jardim

import React from 'react';
import { motion } from 'framer-motion';

export default function BreathFolhagem({ color = 'currentColor', size = 200, className = '' }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="1"
    >
      {/* Folha superior esquerda */}
      <motion.path
        d="M60 40 Q50 20 70 15 Q90 20 80 40 Q70 50 60 40Z"
        animate={{ rotate: [0, 3, 0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '70px 40px' }}
      />
      {/* Folha superior direita */}
      <motion.path
        d="M140 40 Q150 20 130 15 Q110 20 120 40 Q130 50 140 40Z"
        animate={{ rotate: [0, -3, 0, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ transformOrigin: '130px 40px' }}
      />
      {/* Folha inferior esquerda */}
      <motion.path
        d="M50 160 Q40 140 60 135 Q80 140 70 160 Q60 170 50 160Z"
        animate={{ rotate: [0, 3, 0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ transformOrigin: '60px 160px' }}
      />
      {/* Folha inferior direita */}
      <motion.path
        d="M150 160 Q160 140 140 135 Q120 140 130 160 Q140 170 150 160Z"
        animate={{ rotate: [0, -3, 0, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{ transformOrigin: '140px 160px' }}
      />
    </svg>
  );
}
