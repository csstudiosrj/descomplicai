// components/memorial/steps/Step54Vestido.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';

const OPCOES = [
  { valor: 'princesa', label: 'Princesa', subtexto: 'Volumoso e romântico', icone: 'star' },
  { valor: 'sereia', label: 'Sereia', subtexto: 'Justo e sensual', icone: 'droplet' },
  { valor: 'evase', label: 'Evase', subtexto: 'Solto e confortável', icone: 'wind' },
  { valor: 'jumpsuit', label: 'Jumpsuit', subtexto: 'Moderno e ousado', icone: 'user' },
  { valor: 'midi', label: 'Midi', subtexto: 'Elegante e prático', icone: 'scissors' },
];

export default function Step54Vestido({ onSelect, estadoAtual }) {
  const selecionado = estadoAtual?.estiloVestido;
  return (
    <div role="radiogroup" aria-label="Qual estilo de vestido?" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Vestido e acessórios</h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>Qual estilo de vestido?</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-4)' }}>
        {OPCOES.map((opcao) => {
          const isSelected = selecionado === opcao.valor;
          return (
            <Card key={opcao.valor} interactive selected={isSelected} padding="lg" onClick={() => onSelect('estiloVestido', opcao.valor)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('estiloVestido', opcao.valor); } }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: isSelected ? 'var(--color-brand-lighter)' : 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'var(--color-brand)' : 'var(--color-text-muted)', flexShrink: 0 }}>
                  <Icon name={opcao.icone} size={24} ariaHidden={true} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{opcao.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{opcao.subtexto}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

Step54Vestido.propTypes = { onSelect: PropTypes.func.isRequired, estadoAtual: PropTypes.object };
export { Step54Vestido };
