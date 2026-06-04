import React from 'react';

/**
 * Logo tipográfico do Descomplicaí
 * "descomplica" — DM Sans Light (300), cor #8B6F5E
 * "í" — Space Mono Italic (400), cor #10B981
 * Zero SVG, zero imagem — só tipografia
 */
export default function Logo({ className = '' }) {
  return (
    <span
      className={`logo-root ${className}`}
      aria-label="Descomplicaí"
      role="img"
    >
      <span className="logo-descomplica">descomplica</span>
      <span className="logo-i">í</span>
    </span>
  );
}