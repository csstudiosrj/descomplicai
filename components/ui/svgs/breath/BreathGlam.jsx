// components/ui/svgs/breath/BreathGlam.jsx
// Círculos/dots brilhantes — glam

import React from 'react';
import { motion } from 'framer-motion';

export default function BreathGlam({ color = 'currentColor', size = 200, className = '' }) {
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
      {/* Círculos pequenos pulsantes */}
      <motion.circle
        cx="60" cy="60" r="6"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="140" cy="60" r="5"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
      <motion.circle
        cx="50" cy="140" r="4"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />
      <motion.circle
        cx="150" cy="140" r="7"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
      />
      <motion.circle
        cx="100" cy="40" r="4"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      />
      {/* Forma central */}
      <motion.circle
        cx="100" cy="100" r="20"
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 100px' }}
      />
    </svg>
  );
}
