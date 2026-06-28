// components/ui/svgs/breath/BreathArabescos.jsx
// Arabescos simétricos — classico, romantico, vintage

import React from 'react';
import { motion } from 'framer-motion';

export default function BreathArabescos({ color = 'currentColor', size = 200, className = '' }) {
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
      {/* Arabesco esquerdo */}
      <motion.path
        d="M20 100 Q20 60 50 60 Q70 60 70 80 Q70 100 50 100 Q30 100 30 120 Q30 140 50 140"
        animate={{ strokeDashoffset: [0, -40, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        strokeDasharray="8 4"
      />
      {/* Arabesco direito */}
      <motion.path
        d="M180 100 Q180 60 150 60 Q130 60 130 80 Q130 100 150 100 Q170 100 170 120 Q170 140 150 140"
        animate={{ strokeDashoffset: [0, 40, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        strokeDasharray="8 4"
      />
    </svg>
  );
}
