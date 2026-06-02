// B5 — Faixa de orçamento
// Dependências diretas: React, PropTypes, Card

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: 'ate-20k', label: 'Até R$ 20 mil', desc: 'Casamento econômico' },
  { valor: '20k-50k', label: 'R$ 20 mil a 50 mil', desc: 'Padrão brasileiro' },
  { valor: '50k-90k', label: 'R$ 50 mil a 90 mil', desc: 'Confortável' },
  { valor: '90k-150k', label: 'R$ 90 mil a 150 mil', desc: 'Premium' },
  { valor: '150k-300k', label: 'R$ 150 mil a 300 mil', desc: 'Luxo' },
  { valor: 'acima-300k', label: 'Acima de R$ 300 mil', desc: 'Alto padrão' },
  { valor: 'nao-informar', label: 'Prefiro não informar', desc: 'Definimos depois' },
];

export default function Step06Orcamento({ onSelect, estadoAtual }) {
  const selecionado = estadoAtual?.faixaOrcamento;

  return (
    <div role="radiogroup" aria-label="Orçamento do casamento" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Qual o orçamento estimado?
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Isso nos ajuda a sugerir fornecedores na faixa certa. Pode mudar depois.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <Card key={o.valor} interactive selected={isSelected} padding="md" onClick={() => onSelect('faixaOrcamento', o.valor)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('faixaOrcamento', o.valor); } }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

Step06Orcamento.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step06Orcamento };