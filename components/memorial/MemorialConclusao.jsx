// components/memorial/MemorialConclusao.jsx
// Tela de conclusão do memorial — exibe o memorial gerado pela IA e resumo das escolhas
// Dependências diretas: React, PropTypes, Card, Button, gerador-memorial, ProgressRing

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressRing from '../ui/ProgressRing';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { montarMemorial, listarFornecedoresNecessarios } from '../../utils/gerador-memorial';

export default function MemorialConclusao({ estado, memorialGerado, onRecomecar, onIrParaPainel }) {
  const [copiado, setCopiado] = useState(false);
  const resumo = montarMemorial(estado);
  const fornecedores = listarFornecedoresNecessarios(estado);

  const handleCopiar = async () => {
    if (!memorialGerado) return;
    try {
      await navigator.clipboard.writeText(memorialGerado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // silent fail
    }
  };

  const handleDownload = () => {
    if (!memorialGerado) return;
    const blob = new Blob([memorialGerado], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memorial-${estado.nomeJuntos || 'casamento'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-6) var(--space-4)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', animation: 'fadeInUp 600ms ease-out' }}>
          <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-tight)' }}>
            Seu memorial está pronto
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            {estado.nomeJuntos || `${estado.nomePessoa1} e ${estado.nomePessoa2}`}
          </p>
        </div>

        {/* Memorial gerido pela IA */}
        {memorialGerado ? (
          <Card variant="elevated" padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', margin: 0 }}>
                Memorial completo
              </h2>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button variant="secondary" size="sm" onClick={handleCopiar}>
                  {copiado ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button variant="primary" size="sm" onClick={handleDownload}>
                  Baixar .txt
                </Button>
              </div>
            </div>
            <div
              style={{
                maxHeight: '60vh',
                overflowY: 'auto',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <MarkdownRenderer text={memorialGerado} />
            </div>
          </Card>
        ) : (
          <Card variant="outlined" padding="lg" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
              O memorial será gerado pela IA assim que você confirmar. Aguarde...
            </p>
          </Card>
        )}

        {/* Resumo visual das escolhas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          <ResumoCard titulo="Identidade" valor={resumo.estilo} sub={resumo.paleta} />
          <ResumoCard titulo="Cerimônia" valor={resumo.cerimonia} sub={resumo.horario} />
          <ResumoCard titulo="Local" valor={resumo.local} />
          <ResumoCard titulo="Convidados" valor={resumo.convidados} />
          <ResumoCard titulo="Decoração" valor={resumo.decoracao} />
          <ResumoCard titulo="Orçamento" valor={resumo.orcamento} />
        </div>

        {/* Fornecedores necessários */}
        <Card variant="flat" padding="lg">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-4)' }}>
            Fornecedores necessários
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {fornecedores.map((f) => (
              <span
                key={f}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-lighter)',
                  color: 'var(--color-brand-dark)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </Card>

        {/* CTA final */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center', paddingTop: 'var(--space-4)' }}>
          <Button variant="primary" size="lg" fullWidth onClick={onIrParaPainel}>
            Ir para o painel — gerenciar tudo
          </Button>
          <Button variant="ghost" size="md" onClick={onRecomecar}>
            Recomeçar memorial
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor, sub }) {
  return (
    <Card variant="default" padding="md">
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
        {titulo}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-snug)' }}>
        {valor || '—'}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          {sub}
        </div>
      )}
    </Card>
  );
}

MemorialConclusao.propTypes = {
  estado: PropTypes.object.isRequired,
  memorialGerado: PropTypes.string,
  onRecomecar: PropTypes.func.isRequired,
  onIrParaPainel: PropTypes.func.isRequired,
};

export { MemorialConclusao };