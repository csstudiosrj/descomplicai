// Select.jsx — Dropdown acessível com ARIA
// role="listbox", aria-expanded, aria-selected
// Dependências diretas: React, PropTypes

import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

export default function Select({
  id,
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  required,
  disabled,
  error,
  hint,
  ...rest
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);
  const selectId = id || `select-${React.useId().replace(/:/g, '')}`;
  const labelId = `${selectId}-label`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const listboxId = `${selectId}-listbox`;

  const selectedOption = options.find((opt) => opt.value === value);
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }, [disabled]);

  const handleSelect = useCallback((optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleSelect(options[highlightedIndex].value);
        } else {
          handleToggle();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(options.length - 1);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [disabled, isOpen, highlightedIndex, options, handleSelect, handleToggle]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll para item destacado
  useEffect(() => {
    if (isOpen && listboxRef.current && highlightedIndex >= 0) {
      const item = listboxRef.current.children[highlightedIndex];
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {label && (
        <label
          id={labelId}
          htmlFor={selectId}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          {label}
          {required && (
            <span aria-hidden="true" style={{ color: 'var(--color-danger)', marginLeft: '2px' }}>
              *
            </span>
          )}
        </label>
      )}

      <div ref={containerRef} style={{ position: 'relative' }}>
        {/* Trigger */}
        <button
          id={selectId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          aria-invalid={error ? 'true' : undefined}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border-strong)'}`,
            backgroundColor: disabled ? 'var(--color-surface)' : 'var(--color-white)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            textAlign: 'left',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            outline: 'none',
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--color-brand)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-brand-lighter)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border-strong)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...rest}
        >
          <span style={{ color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
            {selectedOption?.label || placeholder}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform var(--transition-fast)',
              color: 'var(--color-text-muted)',
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {/* Listbox */}
        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? labelId : undefined}
            style={{
              position: 'absolute',
              top: 'calc(100% + var(--space-1))',
              left: 0,
              right: 0,
              maxHeight: '240px',
              overflowY: 'auto',
              backgroundColor: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 'var(--z-dropdown)',
              listStyle: 'none',
              margin: 0,
              padding: 'var(--space-1)',
            }}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  backgroundColor:
                    option.value === value
                      ? 'var(--color-brand-lighter)'
                      : index === highlightedIndex
                      ? 'var(--color-surface)'
                      : 'transparent',
                  fontWeight: option.value === value ? 'var(--font-semibold)' : 'var(--font-normal)',
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {hint && !error && (
        <span
          id={hintId}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {hint}
        </span>
      )}
      {error && (
        <span
          id={errorId}
          role="alert"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

Select.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  hint: PropTypes.string,
};

export { Select };
