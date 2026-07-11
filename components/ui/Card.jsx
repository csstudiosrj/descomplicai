// components/ui/Card.jsx
// Componente Card genérico — container reutilizável com variantes visuais
// ARIA: role="article" para item de lista, role="button" quando interativo
// MUDANÇA 10/07: suporte a backgroundImage para cards do memorial
// MUDANÇA 11/07: remove overlay branco opaco para SVG aparecer

import React from 'react';
import PropTypes from 'prop-types';

export default function Card({
  variant = 'default',
  padding = 'md',
  interactive = false,
  selected = false,
  disabled = false,
  backgroundImage = null,
  children,
  className = '',
  ...props
}) {
  const baseClasses = 'relative overflow-hidden rounded-2xl transition-all duration-300';

  const variantClasses = {
    default: 'bg-white/80 backdrop-blur-sm border border-stone-200/50',
    primary: 'bg-[#F5E6D3]/90 backdrop-blur-sm border border-[#C9A87C]/30',
    secondary: 'bg-stone-100/80 backdrop-blur-sm border border-stone-200/50',
    ghost: 'bg-transparent border-0',
    outline: 'bg-transparent border-2 border-current',
    memorial: 'bg-white/60 backdrop-blur-md border border-stone-200/30 shadow-sm'
  };

  const paddingClasses = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const stateClasses = [
    interactive && !disabled && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
    selected && 'ring-2 ring-[#C9A87C] shadow-lg scale-[1.02]',
    disabled && 'opacity-50 cursor-not-allowed'
  ].filter(Boolean).join(' ');

  const allClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${paddingClasses[padding] || paddingClasses.md} ${stateClasses} ${className}`;

  return (
    <div
      role={interactive ? 'button' : 'article'}
      aria-pressed={interactive ? selected : undefined}
      aria-disabled={disabled}
      tabIndex={interactive && !disabled ? 0 : -1}
      className={allClasses}
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
      {...props}
    >
      {/* Overlay removido — SVG agora visível */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

Card.propTypes = {
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'ghost', 'outline', 'memorial']),
  padding: PropTypes.oneOf(['none', 'xs', 'sm', 'md', 'lg', 'xl']),
  interactive: PropTypes.bool,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  backgroundImage: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string
};
