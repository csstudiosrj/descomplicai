// Etapa 2 do memorial — nomes do casal
// Dependencias diretas: React, PropTypes
// CORRECAO 13/07: Labels dinamicos conforme perfil (getTermos)

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getTermos } from '../../../utils/linguagemCasal';

export default function Step02NomeCasal({ onSelect, estadoAtual }) {
  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';
  const termos = getTermos(perfil);

  const [nome1, setNome1] = useState(estadoAtual?.nomePessoa1 || '');
  const [nome2, setNome2] = useState(estadoAtual?.nomePessoa2 || '');
  const [nomeJuntos, setNomeJuntos] = useState(estadoAtual?.nomeCasal || '');

  const handleConfirmar = () => {
    onSelect('nomePessoa1', nome1.trim());
    onSelect('nomePessoa2', nome2.trim());
    onSelect('nomeCasal', nomeJuntos.trim() || null);
  };

  const podeConfirmar = nome1.trim().length > 0 && nome2.trim().length > 0;

  // Labels dinamicos conforme perfil
  const labelPessoa1 = `Nome da ${termos.pessoa1}`;
  const labelPessoa2 = `Nome da ${termos.pessoa2}`;
  const labelJuntos = `Como querem ser chamados juntos (opcional)`;

  // Placeholders dinamicos conforme genero
  const placeholder1 = termos.genero1 === 'feminino' ? 'Ex: Ana' : termos.genero1 === 'masculino' ? 'Ex: Pedro' : 'Ex: Ana';
  const placeholder2 = termos.genero2 === 'feminino' ? 'Ex: Maria' : termos.genero2 === 'masculino' ? 'Ex: Joao' : 'Ex: Pedro';

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Como devemos chamar voces?
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label
            htmlFor="nome1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
            }}
          >
            {labelPessoa1}
          </label>
          <input
            id="nome1"
            type="text"
            value={nome1}
            onChange={(e) => setNome1(e.target.value)}
            placeholder={placeholder1}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-white)',
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label
            htmlFor="nome2"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
            }}
          >
            {labelPessoa2}
          </label>
          <input
            id="nome2"
            type="text"
            value={nome2}
            onChange={(e) => setNome2(e.target.value)}
            placeholder={placeholder2}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-white)',
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label
            htmlFor="nomeJuntos"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
            }}
          >
            {labelJuntos}
          </label>
          <input
            id="nomeJuntos"
            type="text"
            value={nomeJuntos}
            onChange={(e) => setNomeJuntos(e.target.value)}
            placeholder="Ex: Ana e Pedro, Aninha e Pedrinho..."
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-white)',
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
          />
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Se deixar em branco, usamos os dois nomes
          </p>
        </div>

        <button
          aria-label="Confirmar resposta" onClick={handleConfirmar}
          disabled={!podeConfirmar}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: podeConfirmar ? 'var(--color-brand)' : 'var(--color-border)',
            color: podeConfirmar ? 'var(--color-white)' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-medium)',
            cursor: podeConfirmar ? 'pointer' : 'not-allowed',
            transition: 'background-color var(--transition-fast)',
          }}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

Step02NomeCasal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step02NomeCasal };
