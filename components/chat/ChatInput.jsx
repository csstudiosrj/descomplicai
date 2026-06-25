import React, { useRef, useState } from 'react';
import Icon from '../ui/Icon';

export default function ChatInput({ onEnviar, disabled }) {
  const [texto, setTexto] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    const limpo = texto.trim();
    if (!limpo || disabled) return;
    onEnviar(limpo);
    setTexto('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setTexto(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-white)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          flex: 1,
          background: 'var(--color-off-white)',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--color-border)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--space-2)',
          transition: 'border-color var(--transition-fast)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={texto}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem..."
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            resize: 'none',
            maxHeight: '120px',
            lineHeight: 'var(--leading-normal)',
            padding: '2px 0',
          }}
          aria-label="Digite sua mensagem"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || !texto.trim()}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-full)',
          background: texto.trim() ? 'var(--color-brand)' : 'var(--color-surface)',
          border: 'none',
          cursor: texto.trim() && !disabled ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background var(--transition-fast)',
        }}
        aria-label="Enviar mensagem"
      >
        <Icon
          name="send"
          size={20}
          color={texto.trim() ? 'var(--color-white)' : 'var(--color-text-muted)'}
        />
      </button>
    </div>
  );
}
