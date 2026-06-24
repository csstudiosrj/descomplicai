// StepD2TipoIluminacao — Qual tipo de iluminação você imagina?
// Dependências diretas: React, PropTypes, Card

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "velas", label: "Velas", desc: "Romântica e intimista" },
  { valor: "fairy", label: "Fairy lights", desc: "Cordões de luz aconchegantes" },
  { valor: "lustres", label: "Lustres", desc: "Clássica e elegante" },
  { valor: "lanternas", label: "Lanternas", desc: "Rústica e charmosa" },
  { valor: "natural", label: "Natural", desc: "Luz do dia ou luar" },
  { valor: "a_definir", label: "A definir", desc: "Ainda não decidi" }
];

export default function StepD2TipoIluminacao({ onSelect, estadoAtual }) {
  const selecionado = estadoAtual?.tipoIluminacao;

  return (
    <div role="radiogroup" aria-label="Tipo de iluminação" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Qual tipo de iluminação você imagina?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => onSelect('tipoIluminacao', o.valor)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('tipoIluminacao', o.valor); } }}>
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

StepD2TipoIluminacao.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepD2TipoIluminacao };
