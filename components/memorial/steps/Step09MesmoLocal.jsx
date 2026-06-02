// C2 — Cerimônia e festa no mesmo local?
// Dependências diretas: React, PropTypes, Card

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

export default function Step09MesmoLocal({ onSelect, estadoAtual }) {
  const selecionado = estadoAtual?.ceremoniaFestaMesmoLocal;

  return (
    <div role="radiogroup" aria-label="Cerimônia e festa no mesmo local?" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Cerimônia e festa no mesmo local?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {[{v:true,l:'Sim, tudo no mesmo lugar'}, {v:false,l:'Não, locais diferentes'}].map((o) => {
          const isSelected = selecionado === o.v;
          return (
            <Card key={String(o.v)} interactive selected={isSelected} padding="lg" onClick={() => onSelect('ceremoniaFestaMesmoLocal', o.v)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('ceremoniaFestaMesmoLocal', o.v); } }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)' }}>{o.l}</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

Step09MesmoLocal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step09MesmoLocal };