// components/memorial/steps/Step23Toalha.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const alternativasToalha = [
  { valor: 'Linho cru', cor: '#E8E0D5', desc: 'Natural e rústico' },
  { valor: 'Branco com renda', cor: '#FFFFFF', desc: 'Clássico romântico' },
  { valor: 'Juta', cor: '#C4A882', desc: 'Rústico e sustentável' },
  { valor: 'Sem toalha (mesa aparente)', cor: '#8B6F5E', desc: 'Moderno e minimalista' },
];

function sugerirToalha(estilo, paleta) {
  if (!estilo) return 'Linho cru';
  if (estilo === 'rustico' || estilo === 'boho') return 'Juta';
  if (estilo === 'moderno' || estilo === 'minimalista') return 'Sem toalha (mesa aparente)';
  if (estilo === 'classico' || estilo === 'romantico') return 'Branco com renda';
  return 'Linho cru';
}

export default function Step23Toalha({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo;
  const paleta = estadoAtual?.paleta || [];
  const sugestao = sugerirToalha(estilo, paleta);
  const [selecionado, setSelecionado] = useState(estadoAtual?.toalha || sugestao);

  const handleConfirmar = () => { onSelect('toalha', selecionado); };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Toalha de mesa</h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>Sugestão baseada no seu estilo: <strong>{sugestao}</strong>. Toque para alterar.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        {alternativasToalha.map(op => (
          <button key={op.valor} onClick={() => setSelecionado(op.valor)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-full)', border: selecionado === op.valor ? '2px solid var(--color-brand)' : '1px solid var(--color-border)', background: selecionado === op.valor ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: op.cor, display: 'inline-block', border: '1px solid var(--color-border)' }} />
            {op.valor}
          </button>
        ))}
      </div>
      <button aria-label="Confirmar resposta" onClick={handleConfirmar} style={{ alignSelf: 'flex-start', padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--color-brand)', color: 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', cursor: 'pointer' }}>Confirmar</button>
    </div>
  );
}

Step23Toalha.propTypes = { onSelect: PropTypes.func.isRequired, estadoAtual: PropTypes.object };
export { Step23Toalha };
