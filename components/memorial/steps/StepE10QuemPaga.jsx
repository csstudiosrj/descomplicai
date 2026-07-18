// StepE10QuemPaga — Quem está pagando o {termos.celebracao}?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { getTermos } from '../../../utils/linguagemCasal';

export default function StepE10QuemPaga({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);
  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';
  const termos = getTermos(perfil);

  const OPCOES = [
    { valor: "noivos", label: `${termos.pessoa1} e ${termos.pessoa2}`, desc: `Nós pagamos tudo` },
    { valor: "pais_noiva", label: `Pais do ${termos.pessoa1}`, desc: `Família do ${termos.pessoa1} assume` },
    { valor: "pais_noivo", label: `Pais do ${termos.pessoa2}`, desc: `Família do ${termos.pessoa2} assume` },
    { valor: "ambos_pais", label: "Ambos os pais", desc: "As duas famílias dividem" },
    { valor: "outros", label: "Outros", desc: "Outra combinação" }
  ];

  const selecionado = estadoAtual?.quemPaga;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
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
    <div role="radiogroup" aria-label={`Quem paga o ${termos.celebracao}`} style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        {`Quem está pagando o ${termos.celebracao}?`}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((opcao) => {
          const isSelected = selecionado === opcao.valor;
          return (
            <div
      key={opcao.valor}
      style={{
        transition: 'transform 300ms ease, box-shadow 300ms ease',
        transform: cardPulsando === opcao.valor ? 'scale(1.03)' : 'scale(1)',
        boxShadow: cardPulsando === opcao.valor ? `0 0 0 3px ${opcao.cor || 'var(--color-brand)'}` : 'none',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Card key={opcao.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(opcao)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(opcao); } }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{opcao.label}</span>
                {opcao.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{opcao.desc}</span>}
              </div>
            </Card>
    </div>
  );
})}
      </div>
    </div>
  );
}

StepE10QuemPaga.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepE10QuemPaga };
