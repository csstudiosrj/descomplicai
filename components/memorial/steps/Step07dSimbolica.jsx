// components/memorial/steps/Step07dSimbolica.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const RITUAIS = [
  {
    nome: 'Areia',
    desc: '${termos.pessoa1} e ${termos.pessoa2} despejam areia colorida em um recipiente, simbolizando a união indivisível.',
  },
  {
    nome: 'Vela',
    desc: 'Cada pessoa acende uma vela e juntos acendem uma terceira, representando a nova família.',
  },
  {
    nome: 'Vinho',
    desc: '${termos.pessoa1} e ${termos.pessoa2} bebem do mesmo cálice, selando a partilha da vida.',
  },
  {
    nome: 'Rosas',
    desc: 'Troca de rosas como símbolo de amor e compromisso.',
  },
  {
    nome: 'Cordas de mãos',
    desc: 'As mãos são atadas com uma corda ou fita, simbolizando o laço eterno.',
  },
  {
    nome: 'Árvore',
    desc: '${termos.pessoa1} e ${termos.pessoa2} plantam uma muda ou regam uma árvore, representando o crescimento do amor.',
  },
  {
    nome: 'Pétalas',
    desc: 'Convidados jogam pétalas sobre ${termos.pessoa1} e ${termos.pessoa2}, abençoando a união.',
  },
  {
    nome: 'Balões',
    desc: 'Soltura de balões biodegradáveis com desejos dos convidados.',
  },
  {
    nome: 'Lágrimas de alegria',
    desc: '${termos.pessoa1} e ${termos.pessoa2} oferecem lenços ou frascos para guardar as lágrimas de felicidade.',
  },
  {
    nome: 'Escrita de votos',
    desc: '${termos.pessoa1} e ${termos.pessoa2} leem votos pessoais escritos por eles mesmos.',
  },
];

export default function Step07dSimbolica({ onSelect, estadoAtual }) {
  const [selecionados, setSelecionados] = useState(
    estadoAtual?.rituaisSimbolicos || []
  );

  const toggle = (nome) => {
    setSelecionados((prev) =>
      prev.includes(nome) ? prev.filter((x) => x !== nome) : [...prev, nome]
    );
  };

  const handleConfirmar = () => {
    onSelect('rituaisSimbolicos', selecionados);
  };

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
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
        Rituais simbólicos
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Escolha os rituais que deseja incluir na cerimônia simbólica:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {RITUAIS.map((ritual) => {
          const isSelected = selecionados.includes(ritual.nome);
          return (
            <button
              key={ritual.nome}
              onClick={() => toggle(ritual.nome)}
              style={{
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: isSelected
                  ? '2px solid var(--color-brand)'
                  : '1px solid var(--color-border)',
                background: isSelected
                  ? 'var(--color-brand-lighter)'
                  : 'var(--color-white)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
                width: '100%',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '22px',
                  height: '22px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected
                    ? '2px solid var(--color-brand)'
                    : '2px solid var(--color-border)',
                  background: isSelected
                    ? 'var(--color-brand)'
                    : 'transparent',
                  color: isSelected ? 'var(--color-white)' : 'transparent',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-bold)',
                  marginTop: '1px',
                }}
                aria-hidden="true"
              >
                {isSelected ? '✓' : ''}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: isSelected
                      ? 'var(--font-semibold)'
                      : 'var(--font-normal)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  {ritual.nome}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    lineHeight: '1.4',
                  }}
                >
                  {ritual.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleConfirmar}
        disabled={selecionados.length === 0}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor:
            selecionados.length > 0
              ? 'var(--color-brand)'
              : 'var(--color-border)',
          color:
            selecionados.length > 0
              ? 'var(--color-white)'
              : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: selecionados.length > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar rituais
      </button>
    </div>
  );
}

Step07dSimbolica.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step07dSimbolica };