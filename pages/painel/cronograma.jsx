// Cronograma do evento — timeline do grande dia
// Dependências diretas: React, next/head

import React from 'react';
import Head from 'next/head';
import Card from '../../components/ui/Card';

const EVENTOS = [
  { hora: '14:00', titulo: 'Chegada dos fornecedores', local: 'Salão', responsavel: 'Cerimonialista' },
  { hora: '15:30', titulo: 'Início da cerimônia', local: 'Altar', responsavel: 'Celebrante' },
  { hora: '16:30', titulo: 'Coquetel de recepção', local: 'Jardim', responsavel: 'Buffet' },
  { hora: '18:00', titulo: 'Início do jantar', local: 'Salão principal', responsavel: 'Buffet' },
  { hora: '20:00', titulo: 'Abertura da pista', local: 'Salão principal', responsavel: 'DJ/Banda' },
  { hora: '23:00', titulo: 'Saída dos noivos', local: 'Portaria', responsavel: 'Cerimonialista' },
];

export default function CronogramaPage() {
  return (
    <>
      <Head><title>Cronograma — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-6) var(--space-4)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-8)' }}>Cronograma</h1>

          <div style={{ position: 'relative', paddingLeft: 'var(--space-8)' }}>
            <div style={{ position: 'absolute', left: '12px', top: 0, bottom: 0, width: '2px', backgroundColor: 'var(--color-border-strong)' }} />

            {EVENTOS.map((e, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
                <div style={{ position: 'absolute', left: '-26px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-brand)', border: '2px solid var(--color-white)' }} />
                <Card variant="default" padding="md">
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-brand)' }}>{e.hora}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{e.titulo}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {e.local} · Responsável: {e.responsavel}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}