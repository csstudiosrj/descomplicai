// StepD18VestidoComprado — Já comprou o vestido?
// Dependências diretas: React, PropTypes, Card

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já tenho o vestido" },
  { valor: "nao", label: "Não", desc: "Ainda não comprei/aluguei" },
  { valor: "em_prova", label: "Em prova", desc: "Estou fazendo provas" }
];

export default function StepD18VestidoComprado({ onSelect, estadoAtual }) {
  const selecionado = estadoAtual?.vestidoComprado;

  return (
    <div role="radiogroup" aria-label="Vestido comprado" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já comprou o vestido?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => onSelect('vestidoComprado', o.valor)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('vestidoComprado', o.valor); } }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

StepD18VestidoComprado.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepD18VestidoComprado };
