// Bloco I — Papelaria: convites, save the date, sinalização, monograma, itens digitais
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { sugerirFontes } from '../../../utils/sugestoes';
import useEtapaInterna from '../../../hooks/useEtapaInterna';

const CHAVES_ETAPA = ['formatoConvite', 'monograma'];

export default function Step49Convites({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo;
  const { etapa: etapaInterna, avancar: avancar, storageKey } = useEtapaInterna(
    estadoAtual,
    CHAVES_ETAPA,
    'I'
  );
  const [dados, setDados] = useState({
    formatoConvite: estadoAtual?.formatoConvite || '',
    saveTheDate: estadoAtual?.saveTheDate ?? null,
    sinalizacaoEvento: estadoAtual?.sinalizacaoEvento || [],
    monograma: estadoAtual?.monograma ?? null,
    fontesIdentidade: estadoAtual?.fontesIdentidade || [],
    itensDigitais: estadoAtual?.itensDigitais || [],
  });

  const fontesSugeridas = estilo ? sugerirFontes(estilo) : [{ nome: 'Cormorant Garamond', uso: 'display' }, { nome: 'DM Sans', uso: 'corpo' }];

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
    Object.entries(dados).forEach(([k, v]) => onSelect(k, v));
  };

  const SINALIZACAO = ['Placa de boas-vindas', 'Placa de estacionamento', 'Sinalização de mesas', 'Sinalização de banheiros', 'Mapa do evento', 'Quadro de assentos'];
  const DIGITAIS = ['Site do casamento', 'Lista de presentes online', 'QR code para menu', 'Convite digital animado', 'Filtro de Instagram'];

  const etapas = [
    // I1-I2: Convites e save the date
    <div key="i1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Papelaria</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Formato dos convites</label>
        {['Convite físico tradicional', 'Convite físico moderno', 'Convite digital', 'Híbrido (físico + digital)', 'Ainda não sei'].map(o => (
          <Card key={o} interactive selected={dados.formatoConvite === o} padding="md" onClick={() => setDados(p => ({ ...p, formatoConvite: o }))} role="radio" aria-checked={dados.formatoConvite === o}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Save the date?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.saveTheDate === o.v} padding="md" onClick={() => setDados(p => ({ ...p, saveTheDate: o.v }))} role="radio" aria-checked={dados.saveTheDate === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      <ButtonAvancar onClick={avancar} disabled={!dados.formatoConvite || dados.saveTheDate === null} />
    </div>,

    // I3-I5: Sinalização, monograma, digitais
    <div key="i3" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Identidade visual do evento</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Sinalização no evento</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {SINALIZACAO.map(s => (
            <button key={s} onClick={() => toggleArray('sinalizacaoEvento', s)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.sinalizacaoEvento.includes(s) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.sinalizacaoEvento.includes(s) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Monograma ou brasão personalizado?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.monograma === o.v} padding="md" onClick={() => setDados(p => ({ ...p, monograma: o.v }))} role="radio" aria-checked={dados.monograma === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Fontes da identidade</label>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Sugeridas: {fontesSugeridas.map(f => `${f.nome} (${f.uso})`).join(', ')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {fontesSugeridas.map(f => (
            <button key={f.nome} onClick={() => toggleArray('fontesIdentidade', f.nome)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.fontesIdentidade.includes(f.nome) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.fontesIdentidade.includes(f.nome) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              {f.nome}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Itens digitais</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {DIGITAIS.map(d => (
            <button key={d} onClick={() => toggleArray('itensDigitais', d)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.itensDigitais.includes(d) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.itensDigitais.includes(d) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <ButtonAvancar onClick={confirmar} disabled={dados.monograma === null} />
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

Step49Convites.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step49Convites };