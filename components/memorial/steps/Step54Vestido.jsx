// Bloco J — Vestuário e beleza: traje, atelier, acessórios, maquiagem/cabelo, padronização
// Mapeia: Step54Vestido(J1), Step55Atelier(J2), Step56Acessorios(J3), Step57Beleza(J4), Step58Profissional(J5), Step59Padronizar(J6)
// Dependências diretas: React, PropTypes, Card, sugestoes.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { sugerirVestido } from '../../../utils/sugestoes';

export default function Step54Vestido({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo;
  const perfil = estadoAtual?.perfilCasal;
  const [etapaInterna, setEtapaInterna] = useState(0);
  const [dados, setDados] = useState({
    estiloVestido: estadoAtual?.estiloVestido || '',
    atelierContratado: estadoAtual?.atelierContratado || '',
    acessorios: estadoAtual?.acessorios || [],
    estiloMaquiagem: estadoAtual?.estiloMaquiagem || '',
    estiloCabelo: estadoAtual?.estiloCabelo || '',
    profissionalBeleza: estadoAtual?.profissionalBeleza ?? null,
    padronizarMadrinhas: estadoAtual?.padronizarMadrinhas ?? null,
    padronizarPadrinhos: estadoAtual?.padronizarPadrinhos ?? null,
  });

  const opcoesVestido = estilo && perfil ? sugerirVestido(estilo, perfil) : ['Clássico', 'Moderno', 'Boho'];
  const mostrarBeleza = perfil !== 'dois-noivos';

  const toggleArray = (field, val) => {
    setDados(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(x => x !== val) : [...prev[field], val]
    }));
  };

  const avancar = () => setEtapaInterna(p => p + 1);
  const confirmar = () => {
    Object.entries(dados).forEach(([k, v]) => onSelect(k, v));
  };

  const ACESSORIOS = ['Véu', 'Tiara', 'Brincos statement', 'Pulseira', 'Anel de noivado visível', 'Botas/tenis de noiva', 'Jaqueta/capa'];
  const MAQUIAGENS = ['Natural/No makeup', 'Clássica', 'Glam', 'Dramática/Smoky', 'Ainda não sei'];
  const CABELOS = ['Preso clássico', 'Semi-preso', 'Solto com ondas', 'Coque baixo', 'Coque alto', 'Ainda não sei'];

  const etapas = [
    // J1-J3: Traje, atelier, acessórios
    <div key="j1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Vestuário e acessórios</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Estilo do traje principal</label>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Sugerimos: {opcoesVestido.join(', ')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {opcoesVestido.map(o => (
            <button key={o} onClick={() => setDados(p => ({ ...p, estiloVestido: o }))} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.estiloVestido === o ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.estiloVestido === o ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--var(--color-text-primary)' }}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Atelier em mente?</label>
        <input
          type="text"
          value={dados.atelierContratado}
          onChange={(e) => setDados(p => ({ ...p, atelierContratado: e.target.value }))}
          placeholder="Nome do atelier ou estilista (deixe em branco se não tiver)"
          style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Acessórios</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {ACESSORIOS.map(a => (
            <button key={a} onClick={() => toggleArray('acessorios', a)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.acessorios.includes(a) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.acessorios.includes(a) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              {a}
            </button>
          ))}
        </div>
      </div>
      <ButtonAvancar onClick={avancar} disabled={!dados.estiloVestido} />
    </div>,

    // J4-J6: Beleza e padronização
    <div key="j4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Beleza e padronização</h2>
      
      {mostrarBeleza && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Estilo de maquiagem</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {MAQUIAGENS.map(m => (
                <button key={m} onClick={() => setDados(p => ({ ...p, estiloMaquiagem: m }))} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.estiloMaquiagem === m ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.estiloMaquiagem === m ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Estilo de cabelo</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {CABELOS.map(c => (
                <button key={c} onClick={() => setDados(p => ({ ...p, estiloCabelo: c }))} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.estiloCabelo === c ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.estiloCabelo === c ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Profissional de beleza contratado?</label>
            {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
              <Card key={String(o.v)} interactive selected={dados.profissionalBeleza === o.v} padding="md" onClick={() => setDados(p => ({ ...p, profissionalBeleza: o.v }))} role="radio" aria-checked={dados.profissionalBeleza === o.v}>
                <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
              </Card>
            ))}
          </div>
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Padronizar look das madrinhas?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.padronizarMadrinhas === o.v} padding="md" onClick={() => setDados(p => ({ ...p, padronizarMadrinhas: o.v }))} role="radio" aria-checked={dados.padronizarMadrinhas === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Padronizar look dos padrinhos?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.padronizarPadrinhos === o.v} padding="md" onClick={() => setDados(p => ({ ...p, padronizarPadrinhos: o.v }))} role="radio" aria-checked={dados.padronizarPadrinhos === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      <ButtonAvancar onClick={confirmar} disabled={dados.padronizarMadrinhas === null || dados.padronizarPadrinhos === null || (mostrarBeleza && (!dados.estiloMaquiagem || !dados.estiloCabelo || dados.profissionalBeleza === null))} />
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

Step54Vestido.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step54Vestido };