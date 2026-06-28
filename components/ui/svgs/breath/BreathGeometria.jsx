// components/ui/svgs/breath/BreathGeometria.jsx
// Hexágonos e triângulos — industrial, moderno, minimalista

import React from 'react';
import { motion } from 'framer-motion';

export default function BreathGeometria({ color = 'currentColor', size = 200, className = '' }) {
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
      {/* Hexágono central */}
      <motion.polygon
        points="100,50 130,67 130,100 100,117 70,100 70,67"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 83.5px' }}
      />
      {/* Triângulo superior */}
      <motion.polygon
        points="100,20 115,45 85,45"
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 45px' }}
      />
      {/* Triângulo inferior */}
      <motion.polygon
        points="100,180 115,155 85,155"
        animate={{ rotate: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ transformOrigin: '100px 155px' }}
      />
    </svg>
  );
}
