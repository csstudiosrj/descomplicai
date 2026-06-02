// Componente Modal acessível com trap de foco, fechamento por ESC e backdrop
// Dependências diretas: React, PropTypes

import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  hideCloseButton = false,
}) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const titleId = `modal-title-${React.useId().replace(/:/g, '')}`;

  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '560px' },
    lg: { maxWidth: '800px' },
    full: { maxWidth: '100%', margin: 'var(--space-4)', height: 'calc(100dvh - var(--space-8))' },
  };

  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    return Array.from(
      modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !hideCloseButton) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [getFocusableElements, hideCloseButton, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      setMounted(true);
      const timer = setTimeout(() => setEntered(true), 10);

      const handleEscape = (e) => {
        if (e.key === 'Escape' && !hideCloseButton) onClose();
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      setEntered(false);
      const timer = setTimeout(() => setMounted(false), 220);
      if (previousFocusRef.current?.focus) {
        previousFocusRef.current.focus();
      }
      return () => clearTimeout(timer);
    }
  }, [isOpen, hideCloseButton, onClose]);

  useEffect(() => {
    if (mounted && modalRef.current) {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        modalRef.current.focus();
      }
    }
  }, [mounted, getFocusableElements]);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      role="presentation"
      onClick={(e) => {
        if (e.target === overlayRef.current && !hideCloseButton) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-overlay)',
        opacity: entered ? 1 : 0,
        transition: 'opacity 220ms ease',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: 'calc(100dvh - var(--space-8))',
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 220ms ease, transform 220ms ease',
          ...sizeStyles[size],
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <h2
            id={titleId}
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-tight)',
            }}
          >
            {title}
          </h2>

          {!hideCloseButton && (
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                transition: 'background-color var(--transition-fast), color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div style={{ padding: 'var(--space-6)', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'full']),
  children: PropTypes.node,
  hideCloseButton: PropTypes.bool,
};

export { Modal };