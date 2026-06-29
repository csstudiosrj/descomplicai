// StepB9CursoNoivos — {`Já fez curso de ${termos.pessoa1} e ${termos.pessoa2}?`}
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { getTermos } from '../../../utils/linguagemCasal';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Curso concluído" },
  { valor: "em_andamento", label: "Em andamento", desc: "Estou fazendo o curso" },
  { valor: "nao_iniciado", label: "Não iniciado", desc: "Ainda não comecei" }
];

export default function StepB9CursoNoivos({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);
  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';
  const termos = getTermos(perfil);

  const selecionado = estadoAtual?.cursoNoivos;


  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(o.valor);
    setTimeout(() => {
      onSelect(o.campo || o.valor, o.valor, o.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label={`Curso de ${termos.pessoa1} e ${termos.pessoa2}`} style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        {`Já fez curso de ${termos.pessoa1} e ${termos.pessoa2}?`}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
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
      <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
              </div>
            </Card>
    </div>
  );
})}
      </div>
    </div>
  );
}

StepB9CursoNoivos.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB9CursoNoivos };
