// components/memorial/steps/Step03Data.jsx
// B2 — Data do evento com validação de data futura
// Agora usa um <input> nativo para garantir o funcionamento do atributo min

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

function getDataMinima() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export default function Step03Data({ onSelect, estadoAtual }) {
  const [data, setData] = useState(estadoAtual?.dataEvento || '');
  const [erro, setErro] = useState('');

  const dataMinima = useMemo(() => getDataMinima(), []);
  const dataValida = data && data >= dataMinima;

  const handleChange = (e) => {
    const valor = e.target.value;
    setData(valor);
    if (valor && valor < dataMinima) {
      setErro('A data deve ser hoje ou no futuro.');
    } else {
      setErro('');
    }
  };

  const handleConfirmar = () => {
    if (!dataValida || erro) return;
    // Apenas um campo é enviado para evitar duplo avanço
    onSelect('dataEvento', data);
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        animation: 'fadeInUp 300ms ease-out',
      }}
    >
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-text-primary)',
        }}
      >
        Quando será a celebração?
      </h1>

      {/* Campo de data nativo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label
          htmlFor="data-evento"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          Data do evento
        </label>
        <input
          id="data-evento"
          type="date"
          value={data}
          onChange={handleChange}
          min={dataMinima}
          required
          aria-describedby={erro ? 'erro-data' : undefined}
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border-strong)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            width: '100%',
          }}
        />
      </div>

      {erro && (
        <p
          id="erro-data"
          role="alert"
          style={{
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            margin: 0,
          }}
        >
          {erro}
        </p>
      )}

      <button
        onClick={handleConfirmar}
        disabled={!dataValida}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: dataValida ? 'var(--color-brand)' : 'var(--color-border)',
          color: dataValida ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: dataValida ? 'pointer' : 'not-allowed',
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