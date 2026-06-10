// Bloco G — Cerimônia detalhada: entrada, música, padrinhos, crianças, rituais, saída
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import useEtapaInterna from '../../../hooks/useEtapaInterna';

const CHAVES_ETAPA = ['entradaNoivos', 'musicaCerimonia', 'padrinhos', 'saidaNoivos'];

export default function Step30Entrada({ onSelect, estadoAtual }) {
  const { etapa: etapaInterna, avancar: avancar } = useEtapaInterna(estadoAtual, CHAVES_ETAPA);
  const [dados, setDados] = useState({
    entradaNoivos: estadoAtual?.entradaNoivos || '',
    acompanhamento: estadoAtual?.acompanhamento || '',
    musicaCerimonia: estadoAtual?.musicaCerimonia || '',
    elementosCerimonia: estadoAtual?.elementosCerimonia || [],
    padrinhos: estadoAtual?.padrinhos ?? null,
    criancasCerimonia: estadoAtual?.criancasCerimonia ?? null,
    papeisCriancas: estadoAtual?.papeisCriancas || [],
    rituaisSimbolicos: estadoAtual?.rituaisSimbolicos || [],
    saidaNoivos: estadoAtual?.saidaNoivos || '',
  });

  const toggleArray = (field, val) => {
    setDados(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(x => x !== val) : [...prev[field], val]
    }));
  };

  const confirmar = () => {
    Object.entries(dados).forEach(([k, v]) => onSelect(k, v));
  };

  const ELEMENTOS = ['Véu', 'Lágrimas de alegria', 'Cesta de flores', 'Incenso', 'Pétalas', 'Luz de velas'];
  const PAPEIS = ['Daminha', 'Pajem', 'Porta-alianças', 'Florista'];
  const RITUAIS = ['Areia', 'Vela', 'Vinho', 'Rosas', 'Cordas de mãos', 'Árvore'];

  const etapas = [
    // G1-G2: Entrada
    <div key="g1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Entrada dos noivos</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Como será a entrada?</label>
        {['Juntos', 'Separados (um espera no altar)', 'Surpresa', 'Ainda não sei'].map(o => (
          <Card key={o} interactive selected={dados.entradaNoivos === o} padding="md" onClick={() => setDados(p => ({ ...p, entradaNoivos: o }))} role="radio" aria-checked={dados.entradaNoivos === o}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o}</span>
          </Card>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Quem acompanha?</label>
        {['Pais', 'Mães', 'Avós', 'Padrinhos', 'Sozinho(a)', 'Ainda não sei'].map(o => (
          <Card key={o} interactive selected={dados.acompanhamento === o} padding="md" onClick={() => setDados(p => ({ ...p, acompanhamento: o }))} role="radio" aria-checked={dados.acompanhamento === o}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o}</span>
          </Card>
        ))}
      </div>
      <ButtonAvancar onClick={avancar} disabled={!dados.entradaNoivos || !dados.acompanhamento} />
    </div>,

    // G3-G4: Música e elementos
    <div key="g3" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Música e elementos</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Música da cerimônia</label>
        {['Ao vivo (violino, harpa, coral)', 'Playlist/Spotify', 'DJ', 'Ainda não sei'].map(o => (
          <Card key={o} interactive selected={dados.musicaCerimonia === o} padding="md" onClick={() => setDados(p => ({ ...p, musicaCerimonia: o }))} role="radio" aria-checked={dados.musicaCerimonia === o}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o}</span>
          </Card>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Elementos da cerimônia</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {ELEMENTOS.map(e => (
            <button key={e} onClick={() => toggleArray('elementosCerimonia', e)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.elementosCerimonia.includes(e) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.elementosCerimonia.includes(e) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <ButtonAvancar onClick={avancar} disabled={!dados.musicaCerimonia} />
    </div>,

    // G5-G6: Padrinhos e crianças
    <div key="g5" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Padrinhos e crianças</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Terá padrinhos/madrinhas no altar?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.padrinhos === o.v} padding="md" onClick={() => setDados(p => ({ ...p, padrinhos: o.v }))} role="radio" aria-checked={dados.padrinhos === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Crianças na cerimônia?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.criancasCerimonia === o.v} padding="md" onClick={() => setDados(p => ({ ...p, criancasCerimonia: o.v }))} role="radio" aria-checked={dados.criancasCerimonia === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      {dados.criancasCerimonia && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Papéis das crianças</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {PAPEIS.map(p => (
              <button key={p} onClick={() => toggleArray('papeisCriancas', p)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.papeisCriancas.includes(p) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.papeisCriancas.includes(p) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
      <ButtonAvancar onClick={avancar} disabled={dados.padrinhos === null || dados.criancasCerimonia === null} />
    </div>,

    // G7-G8: Rituais e saída
    <div key="g7" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Rituais e saída</h2>
      {(estadoAtual?.tipoCerimonia !== 'catolica' && estadoAtual?.tipoCerimonia !== 'evangelica') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Rituais simbólicos</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {RITUAIS.map(r => (
              <button key={r} onClick={() => toggleArray('rituaisSimbolicos', r)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.rituaisSimbolicos.includes(r) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.rituaisSimbolicos.includes(r) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Saída dos noivos</label>
        {['Pétalas', 'Bolhas de sabão', 'Fumaça/fumaça colorida', 'Serpentina', 'Fogos (se permitido)', 'Sozinhos, discreto'].map(o => (
          <Card key={o} interactive selected={dados.saidaNoivos === o} padding="md" onClick={() => setDados(p => ({ ...p, saidaNoivos: o }))} role="radio" aria-checked={dados.saidaNoivos === o}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o}</span>
          </Card>
        ))}
      </div>
      <ButtonAvancar onClick={confirmar} disabled={!dados.saidaNoivos} />
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

Step30Entrada.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step30Entrada };