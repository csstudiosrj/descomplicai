// components/memorial/steps/Step03Data.jsx
// B2 — Data do casamento com validação de data futura

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Input from '../../ui/Input';

function getDataMinima() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function inferirEstacao(dataISO) {
  if (!dataISO) return '';
  const mes = new Date(dataISO).getMonth(); // 0-11
  if (mes === 11 || mes === 0 || mes === 1) return 'verao';
  if (mes >= 2 && mes <= 4) return 'outono';
  if (mes >= 5 && mes <= 7) return 'inverno';
  return 'primavera';
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
    const periodo = inferirEstacao(data);
    onSelect('dataEvento', data);
    onSelect('periodoAno', periodo);
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
        Quando será o casamento?
      </h1>

      <Input
        label="Data do evento"
        type="date"
        value={data}
        onChange={handleChange}
        min={dataMinima}
        required
        aria-describedby={erro ? 'erro-data' : undefined}
      />

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