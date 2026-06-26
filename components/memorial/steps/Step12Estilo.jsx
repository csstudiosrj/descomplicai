// Etapa de estilo visual — 10 opções com swatches e palavra-chave
// Modo ativo: campo extra de upload/link (opcional, não bloqueia)
// Dependências diretas: React, PropTypes, Card, sugerirPaleta

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { sugerirPaleta } from '../../../utils/sugestoes';

const ESTILOS = [
  { valor: 'classico', label: 'Clássico', desc: 'Elegante · Atemporal' },
  { valor: 'rustico', label: 'Rústico', desc: 'Natural · Aconchegante' },
  { valor: 'boho', label: 'Boho', desc: 'Leve · Artesanal' },
  { valor: 'moderno', label: 'Moderno', desc: 'Limpo · Urbano' },
  { valor: 'minimalista', label: 'Minimalista', desc: 'Essencial · Sereno' },
  { valor: 'industrial', label: 'Industrial', desc: 'Bruto · Autêntico' },
  { valor: 'tropical', label: 'Tropical', desc: 'Vibrante · Solar' },
  { valor: 'romantico', label: 'Romântico', desc: 'Suave · Sonhador' },
  { valor: 'gotico', label: 'Gótico Suave', desc: 'Dramático · Único' },
  { valor: 'vintage', label: 'Vintage', desc: 'Nostálgico · Charmoso' },
];

export default function Step04Estilo({ onSelect, estadoAtual }) {
  const [selecionado, setSelecionado] = useState(estadoAtual?.estilo || null);
  const [referencias, setReferencias] = useState('');
  const modoAtivo = estadoAtual?.modoPlanejamento === 'ativo';

  const handleConfirmar = () => {
    if (!selecionado) return;
    onSelect('estilo', selecionado);
    if (modoAtivo && referencias.trim()) {
      onSelect('referenciasVisuais', [{ tipo: 'link', url: referencias.trim() }]);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 640px) {
          .estilo-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          Qual estilo mais combina com vocês?
        </h1>
      </div>

      <div className="estilo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-4)' }}>
        {ESTILOS.map((opcao) => {
          const isSelected = selecionado === opcao.valor;
          const paleta = sugerirPaleta(opcao.valor);
          return (
            <Card
              key={opcao.valor}
              interactive
              selected={isSelected}
              padding="md"
              onClick={() => setSelecionado(opcao.valor)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelecionado(opcao.valor);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {paleta.map((cor) => (
                    <div key={cor} style={{ width: '20px', height: '20px', borderRadius: 'var(--radius-sm)', backgroundColor: cor, border: '1px solid var(--color-border)' }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                    {opcao.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                    {opcao.desc}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {modoAtivo && selecionado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
            Tem referências? Cole links do Pinterest ou descreva (opcional)
          </label>
          <textarea
            value={referencias}
            onChange={(e) => setReferencias(e.target.value)}
            placeholder="https://pinterest.com/..."
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          />
        </div>
      )}

      <button
        aria-label="Confirmar resposta" onClick={handleConfirmar}
        disabled={!selecionado}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: selecionado ? 'var(--color-brand)' : 'var(--color-border)',
          color: selecionado ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: selecionado ? 'pointer' : 'not-allowed',
          transition: 'all var(--transition-fast)',
        }}
      >
        Confirmar estilo
      </button>
    </div>
  );
}

Step04Estilo.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step04Estilo };