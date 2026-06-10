// Bloco E — Decoração: flores, iluminação, velas, mobiliário, backdrop, têxteis
// Mapeia: Step17Flores(E1-E1b), Step18Iluminacao(E2), Step19Velas(E3), Step20Mobiliario(E4), Step21Backdrop(E5), Step22Tecidos(E6)
// Dependências diretas: React, PropTypes, Card, sugestoes.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { sugerirFlores, sugerirIluminacao, sugerirVelas, sugerirMobiliario } from '../../../utils/sugestoes';

const OPCOES_ILUMINACAO = [
  { valor: 'Spots quentes', desc: 'Luz direcionada em tons amarelados, ideal para destacar elementos como altar, bolo e mesas.' },
  { valor: 'Spots frios', desc: 'Luz direcionada em tons brancos/azulados, usada para criar contraste ou ambiente moderno.' },
  { valor: 'Fairy lights', desc: 'Pequenas luzes pendentes (tipo estrelas), muito usadas em ambientes externos e rústicos.' },
  { valor: 'Lustres', desc: 'Peças centrais elegantes que pendem do teto, criando um ponto focal sofisticado.' },
  { valor: 'Velas predominantes', desc: 'Iluminação suave e romântica com velas como fonte principal de luz.' },
  { valor: 'Luz natural', desc: 'Aproveitamento da luz do dia para cerimônias diurnas, sem necessidade de iluminação extra.' },
];

export default function Step17Flores({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo;
  const [etapaInterna, setEtapaInterna] = useState(0);
  const [floresSim, setFloresSim] = useState(estadoAtual?.flores ?? null);
  const [locaisFlores, setLocaisFlores] = useState(estadoAtual?.locaisFlores || []);
  const [iluminacao, setIluminacao] = useState(estadoAtual?.iluminacao || '');
  const [velasSim, setVelasSim] = useState(estadoAtual?.velas ?? null);
  const [mobiliario, setMobiliario] = useState(estadoAtual?.mobiliarioEspecial || false);
  const [backdrop, setBackdrop] = useState(estadoAtual?.backdrop || false);
  const [tecidos, setTecidos] = useState(estadoAtual?.tecidos || false);

  const floresSugeridas = estilo ? sugerirFlores(estilo) : [];
  const ilumSugerida = estilo && estadoAtual?.horarioCasamento ? sugerirIluminacao(estilo, estadoAtual.horarioCasamento) : null;
  const velasSugeridas = estilo ? sugerirVelas(estilo) : [];
  const mobSugerido = estilo ? sugerirMobiliario(estilo) : null;

  const LOCAIS = ['Entrada', 'Altar', 'Mesas dos convidados', 'Mesa do bolo', 'Lounge', 'Banheiros'];

  const toggleLocal = (l) => {
    setLocaisFlores(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const avancarInterno = () => setEtapaInterna(p => p + 1);
  const confirmarTudo = () => {
    onSelect('flores', floresSim);
    if (floresSim) onSelect('locaisFlores', locaisFlores);
    onSelect('iluminacao', iluminacao || ilumSugerida?.tipo || 'Spots quentes');
    onSelect('velas', velasSim);
    if (velasSim) onSelect('tipoVelas', velasSugeridas[0] || 'Velas simples');
    onSelect('mobiliarioEspecial', mobiliario);
    onSelect('backdrop', backdrop);
    onSelect('tecidos', tecidos);
  };

  const etapas = [
    // E1: Flores
    <div key="e1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Flores</h2>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Sugerimos: {floresSugeridas.join(', ') || 'Rosas, hortênsias'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {[{v:true,l:'Sim, com flores'}, {v:false,l:'Sem flores'}].map(o => (
          <Card key={String(o.v)} interactive selected={floresSim === o.v} padding="md" onClick={() => setFloresSim(o.v)} role="radio" aria-checked={floresSim === o.v}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      {floresSim && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Onde terá flores?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {LOCAIS.map(l => (
              <button key={l} onClick={() => toggleLocal(l)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: locaisFlores.includes(l) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: locaisFlores.includes(l) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
      <ButtonAvancar onClick={avancarInterno} disabled={floresSim === null} />
    </div>,

    // E2: Iluminação (com descrições)
    <div key="e2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Iluminação</h2>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Sugestão: {ilumSugerida?.tipo || 'Spots quentes'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {OPCOES_ILUMINACAO.map((opcao) => {
          const isSelected = iluminacao === opcao.valor;
          return (
            <button
              key={opcao.valor}
              onClick={() => setIluminacao(opcao.valor)}
              style={{
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                background: isSelected ? 'var(--color-brand-lighter)' : 'var(--color-white)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
                width: '100%',
              }}
              role="radio"
              aria-checked={isSelected}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '22px',
                height: '22px',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '2px solid var(--color-brand)' : '2px solid var(--color-border)',
                background: isSelected ? 'var(--color-brand)' : 'transparent',
                color: isSelected ? 'var(--color-white)' : 'transparent',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-bold)',
                marginTop: '1px',
              }} aria-hidden="true">
                {isSelected ? '✓' : ''}
              </span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: isSelected ? 'var(--font-semibold)' : 'var(--font-normal)', marginBottom: 'var(--space-1)' }}>
                  {opcao.valor}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  {opcao.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <ButtonAvancar onClick={avancarInterno} disabled={!iluminacao} />
    </div>,

    // E3: Velas
    <div key="e3" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Velas</h2>
      {velasSugeridas.length > 0 && <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>Sugerimos: {velasSugeridas.join(', ')}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={velasSim === o.v} padding="md" onClick={() => setVelasSim(o.v)} role="radio" aria-checked={velasSim === o.v}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      <ButtonAvancar onClick={avancarInterno} disabled={velasSim === null} />
    </div>,

    // E4-E6: Mobiliário, Backdrop, Têxteis
    <div key="e4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Mobiliário e estrutura</h2>
      {mobSugerido && <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>Sugestão: {mobSugerido.cadeiras}, {mobSugerido.mesas}</p>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {[
          { label: 'Mobiliário especial (lounge, puffs, etc)', val: mobiliario, set: setMobiliario, field: 'mobiliarioEspecial' },
          { label: 'Backdrop para cerimônia/fotos', val: backdrop, set: setBackdrop, field: 'backdrop' },
          { label: 'Têxteis especiais (tapetes, cortinas)', val: tecidos, set: setTecidos, field: 'tecidos' },
        ].map(item => (
          <Card key={item.field} interactive selected={item.val} padding="md" onClick={() => item.set(!item.val)} role="checkbox" aria-checked={item.val}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)' }}>{item.label}</span>
          </Card>
        ))}
      </div>
      <ButtonAvancar onClick={confirmarTudo} />
    </div>
  ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {etapas[etapaInterna] || etapas[etapas.length - 1]}
    </div>
  );
}

function ButtonAvancar({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        alignSelf: 'flex-start',
        padding: 'var(--space-3) var(--space-6)',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        backgroundColor: disabled ? 'var(--color-border)' : 'var(--color-brand)',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-white)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-medium)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      Confirmar
    </button>
  );
}

Step17Flores.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step17Flores };