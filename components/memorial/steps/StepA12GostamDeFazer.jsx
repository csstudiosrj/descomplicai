// StepA12GostamDeFazer — O que gostam de fazer juntos?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "viajar", label: "Viajar", desc: "Explorar novos lugares" },
  { valor: "cozinhar", label: "Cozinhar", desc: "Criar receitas juntos" },
  { valor: "esportes", label: "Esportes", desc: "Atividades físicas" },
  { valor: "arte", label: "Arte", desc: "Museus, teatro, cinema" },
  { valor: "musica", label: "Música", desc: "Shows e festivais" },
  { valor: "natureza", label: "Natureza", desc: "Trilhas, praia, camping" },
  { valor: "tecnologia", label: "Tecnologia", desc: "Games, gadgets, inovação" },
  { valor: "outros", label: "Outros", desc: "Outras atividades" }
];

export default function StepA12GostamDeFazer({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);

  const [selecionadas, setSelecionadas] = useState(estadoAtual?.gostamDeFazer || []);

  const toggle = (valor) => {
    if (selecionadas.includes(valor)) {
      setSelecionadas(selecionadas.filter((v) => v !== valor));
    } else {
      setSelecionadas([...selecionadas, valor]);
    }
  };

  const handleConfirmar = () => {
    onSelect('gostamDeFazer', selecionadas);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        O que gostam de fazer juntos?
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Selecione todas as opções que combinam com vocês.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionadas.includes(o.valor);
          return (
            <div
      key={o.valor}
      style={{
        transition: 'transform 300ms ease, box-shadow 300ms ease',
        transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
        boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => toggle(o.valor)} role="checkbox" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(o.valor); } }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
              </div>
            </Card>
    </div>
  );
})}
      </div>

      <button
        aria-label="Confirmar resposta" onClick={handleConfirmar}
        disabled={selecionadas.length === 0}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: selecionadas.length > 0 ? 'var(--color-brand)' : 'var(--color-border)',
          color: selecionadas.length > 0 ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: selecionadas.length > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

StepA12GostamDeFazer.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA12GostamDeFazer };
