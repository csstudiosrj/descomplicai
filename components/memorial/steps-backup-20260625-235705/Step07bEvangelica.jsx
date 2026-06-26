// B6b — Detalhes da cerimônia evangélica
// Dependências diretas: React, PropTypes, Card, Input

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Input from '../../ui/Input';

export default function Step07bEvangelica({ onSelect, estadoAtual }) {
  const [igrejaDefinida, setIgrejaDefinida] = useState(estadoAtual?.igrejaDefinida || false);
  const [nomeIgreja, setNomeIgreja] = useState(estadoAtual?.nomeIgreja || '');
  const [pastor, setPastor] = useState(estadoAtual?.pastor || '');
  const [musicaAoVivo, setMusicaAoVivo] = useState(estadoAtual?.musicaAoVivo ?? true);

  const handleConfirmar = () => {
    onSelect('igrejaDefinida', igrejaDefinida);
    if (igrejaDefinida) onSelect('nomeIgreja', nomeIgreja.trim());
    onSelect('pastor', pastor.trim());
    onSelect('musicaAoVivo', musicaAoVivo);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Detalhes da cerimônia evangélica
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Já tem igreja definida?</label>
          {[{v:true,l:'Sim'}, {v:false,l:'Ainda não'}].map(o => (
            <Card key={String(o.v)} interactive selected={igrejaDefinida === o.v} padding="md" onClick={() => setIgrejaDefinida(o.v)} role="radio" aria-checked={igrejaDefinida === o.v}>
              <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
            </Card>
          ))}
        </div>

        {igrejaDefinida && (
          <Input label="Nome da igreja" value={nomeIgreja} onChange={(e) => setNomeIgreja(e.target.value)} placeholder="Ex: Igreja Batista Central" />
        )}

        <Input label="Pastor/ministro (se já souber)" value={pastor} onChange={(e) => setPastor(e.target.value)} placeholder="Nome do pastor" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Música ao vivo na cerimônia?</label>
          {[{v:true,l:'Sim, banda/coral'}, {v:false,l:'Playlist/Spotify'}].map(o => (
            <Card key={String(o.v)} interactive selected={musicaAoVivo === o.v} padding="md" onClick={() => setMusicaAoVivo(o.v)} role="radio" aria-checked={musicaAoVivo === o.v}>
              <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
            </Card>
          ))}
        </div>
      </div>

      <button
        onClick={handleConfirmar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--color-brand)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

Step07bEvangelica.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step07bEvangelica };