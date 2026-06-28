// components/ui/svgs/breath/BreathOndas.jsx
// Linhas onduladas horizontais — praia

import React from 'react';
import { motion } from 'framer-motion';

export default function BreathOndas({ color = 'currentColor', size = 200, className = '' }) {
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
      <motion.path
        d="M10 80 Q50 60 100 80 Q150 100 190 80"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M10 110 Q50 90 100 110 Q150 130 190 110"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
      <motion.path
        d="M10 140 Q50 120 100 140 Q150 160 190 140"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
    </svg>
  );
}
