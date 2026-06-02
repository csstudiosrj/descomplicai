// B2 — Data do casamento
// Dependências diretas: React, PropTypes, Input

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../ui/Input';

export default function Step03Data({ onSelect, estadoAtual }) {
  const [data, setData] = useState(estadoAtual?.dataEvento || '');

  const handleConfirmar = () => {
    if (!data) return;
    const dateObj = new Date(data);
    const mes = dateObj.getMonth();
    let periodo = 'primavera';
    if (mes >= 11 || mes <= 1) periodo = 'verao';
    else if (mes >= 2 && mes <= 4) periodo = 'outono';
    else if (mes >= 5 && mes <= 7) periodo = 'inverno';
    
    onSelect('dataEvento', data);
    onSelect('periodoAno', periodo);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Quando será o casamento?
      </h1>

      <Input
        label="Data do evento"
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
      />

      <button
        onClick={handleConfirmar}
        disabled={!data}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: data ? 'var(--color-brand)' : 'var(--color-border)',
          color: data ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: data ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar data
      </button>
    </div>
  );
}

Step03Data.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step03Data };