// Bloco G — Cerimônia detalhada: entrada, música, padrinhos, crianças, rituais, saída
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import useEtapaInterna from '../../../hooks/useEtapaInterna';

const CHAVES_ETAPA = ['entradaNoivos', 'musicaCerimonia', 'padrinhos', 'saidaNoivos'];

const ELEMENTOS = [
  { nome: 'Véu', desc: 'Tecido leve que cobre o rosto ou os ombros, tradicional em cerimônias clássicas.' },
  { nome: 'Lágrimas de alegria', desc: 'Lenços ou frascos para guardar as lágrimas emocionadas dos noivos e convidados.' },
  { nome: 'Cesta de flores', desc: 'Cestas com pétalas ou pequenos arranjos carregadas por crianças ou madrinhas.' },
  { nome: 'Incenso', desc: 'Aroma suave que perfuma o ambiente, comum em cerimônias espirituais ou ao ar livre.' },
  { nome: 'Pétalas', desc: 'Pétalas de flores naturais jogadas no caminho ou sobre os noivos na saída.' },
  { nome: 'Luz de velas', desc: 'Velas acesas ao redor do altar, criando uma atmosfera íntima e acolhedora.' },
];

const PAPEIS = ['Daminha', 'Pajem', 'Porta-alianças', 'Florista'];

const RITUAIS = [
  { nome: 'Areia', desc: 'Os noivos despejam areia colorida em um recipiente único, simbolizando a união.' },
  { nome: 'Vela', desc: 'Cada noivo acende uma vela e juntos acendem uma terceira, representando a nova família.' },
  { nome: 'Vinho', desc: 'Os noivos bebem do mesmo cálice, selando a partilha da vida.' },
  { nome: 'Rosas', desc: 'Troca de rosas como símbolo de amor e compromisso.' },
  { nome: 'Cordas de mãos', desc: 'As mãos são atadas com uma corda ou fita, simbolizando o laço eterno.' },
  { nome: 'Árvore', desc: 'Os noivos plantam uma muda ou regam uma árvore, representando o crescimento do amor.' },
];

export default function Step30Entrada({ onSelect, estadoAtual }) {
  const { etapa: etapaInterna, avancar: avancar, storageKey } = useEtapaInterna(
    estadoAtual,
    CHAVES_ETAPA,
    'G'
  );
  const [dados, setDados] = useState({
    entradaNoivos: estadoAtual?.entradaNoivos || '',
    acompanhamento: estadoAtual?.acompanhamento || '',
    musicaCerimonia: estadoAtual?.musicaCerimonia || '',
    elementosCerimonia: estadoAtual?.elementosCerimonia || [],
    padrinhos: estadoAtual?.padrinhos ?? null,
    criancasCerimonia: estadoAtual?.criancasCerimonia ?? null,
    papeisCriancas: estadoAtual?.papeisCriancas || [],
    rituaisSimbolicos: [],
    saidaNoivos: estadoAtual?.saidaNoivos || '',
  });

  const rituaisJaDefinidos =
    Array.isArray(estadoAtual?.rituaisSimbolicos) &&
    estadoAtual.rituaisSimbolicos.length > 0;

  const mostrarRituais =
    estadoAtual?.tipoCerimonia !== 'catolica' &&
    estadoAtual?.tipoCerimonia !== 'evangelica' &&
    !rituaisJaDefinidos;

  const toggleArray = (field, val) => {
    setDados(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(x => x !== val) : [...prev[field], val]
    }));
  };

  const confirmar = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
    const payload = { ...dados };
    if (rituaisJaDefinidos) {
      payload.rituaisSimbolicos = estadoAtual.rituaisSimbolicos;
    }
    Object.entries(payload).forEach(([k, v]) => onSelect(k, v));
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {ELEMENTOS.map(el => {
            const isSelected = dados.elementosCerimonia.includes(el.nome);
            return (
              <button
                key={el.nome}
                onClick={() => toggleArray('elementosCerimonia', el.nome)}
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
                    {el.nome}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                    {el.desc}
                  </div>
                </div>
              </button>
            );
          })}
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
      {mostrarRituais && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Rituais simbólicos</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {RITUAIS.map(ritual => {
              const isSelected = dados.rituaisSimbolicos.includes(ritual.nome);
              return (
                <button
                  key={ritual.nome}
                  onClick={() => toggleArray('rituaisSimbolicos', ritual.nome)}
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
                      {ritual.nome}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                      {ritual.desc}
                    </div>
                  </div>
                </button>
              );
            })}
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