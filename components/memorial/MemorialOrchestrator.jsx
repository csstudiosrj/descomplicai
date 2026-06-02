// Orquestrador do fluxo do memorial — controla navegação entre etapas
// Dependências diretas: React, useMemorial, algoritmo.js, BreathTransition, ProgressBar, BackButton

import React, { useState, useCallback, useEffect } from 'react';
import useMemorial from '../../hooks/useMemorial';
import { calcularProximaEtapa, calcularEtapasTotais, deveExibirLoginAgora, getEtapaPorIndice } from '../../utils/algoritmo';
import BreathTransition from './BreathTransition';
import ProgressBar from './ProgressBar';
import BackButton from './BackButton';

// Mapa de etapas para componentes (importação dinâmica/placeholder para Steps existentes)
const STEP_COMPONENTS = {
  Step00Casal: React.lazy(() => import('./steps/Step00Casal')),
  Step01Modo: React.lazy(() => import('./steps/Step01Modo')),
};

function PlaceholderStep({ titulo }) {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
        {titulo}
      </h2>
      <p>Etapa em desenvolvimento</p>
    </div>
  );
}

export default function MemorialOrchestrator() {
  const {
    estado,
    setRespostas,
    avancarEtapa,
    voltarEtapa,
    pularEtapa,
  } = useMemorial();

  const [transicionando, setTransicionando] = useState(false);
  const [mostrandoLogin, setMostrandoLogin] = useState(false);
  const [etapaAnterior, setEtapaAnterior] = useState(null);

  const etapasTotais = calcularEtapasTotais(estado);
  const etapaAtualObj = getEtapaPorIndice(estado.etapaAtual);
  const blocoAtual = etapaAtualObj?.bloco || '';
  const nomeBlocoAtual = etapaAtualObj?.titulo || '';

  const handleSelect = useCallback((campo, valor) => {
    setRespostas(campo, valor);
    setTransicionando(true);

    setTimeout(() => {
      const proxima = calcularProximaEtapa(estado, estado.etapaAtual);
      const etapaId = getEtapaPorIndice(proxima)?.id;

      if (deveExibirLoginAgora(estado, etapaId)) {
        setMostrandoLogin(true);
        setTransicionando(false);
        return;
      }

      setEtapaAnterior(estado.etapaAtual);
      avancarEtapa();
      setTransicionando(false);
    }, 220);
  }, [estado, setRespostas, avancarEtapa]);

  const handleBack = useCallback(() => {
    if (estado.historicoEtapas.length > 0) {
      voltarEtapa();
    }
  }, [estado.historicoEtapas.length, voltarEtapa]);

  const handlePular = useCallback(() => {
    pularEtapa();
  }, [pularEtapa]);

  const StepComponent = etapaAtualObj
    ? (STEP_COMPONENTS[etapaAtualObj.componente] || (() => <PlaceholderStep titulo={etapaAtualObj.titulo} />))
    : () => <PlaceholderStep titulo="Memorial Concluído" />;

  return (
    <BreathTransition ativa={transicionando} cor="var(--color-brand-lighter)">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflow: 'hidden',
          backgroundColor: 'var(--color-off-white)',
        }}
      >
        <ProgressBar
          etapaAtual={estado.etapaAtual}
          etapasTotais={etapasTotais}
          blocoAtual={blocoAtual}
          nomeBlocoAtual={nomeBlocoAtual}
        />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingTop: 'var(--space-12)',
            paddingBottom: 'var(--space-20)',
            paddingLeft: 'var(--space-4)',
            paddingRight: 'var(--space-4)',
          }}
        >
          <React.Suspense
            fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando...</span>
              </div>
            }
          >
            <StepComponent onSelect={handleSelect} estadoAtual={estado} />
          </React.Suspense>
        </main>

        <BackButton
          onClick={handleBack}
          disabled={estado.historicoEtapas.length === 0}
        />

        {mostrandoLogin && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 'var(--z-modal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-overlay)',
              padding: 'var(--space-4)',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-8)',
                maxWidth: '400px',
                width: '100%',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>
                Quase lá!
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                Para salvar seu memorial e continuar personalizando, faça login ou crie uma conta.
              </p>
              <button
                onClick={() => setMostrandoLogin(false)}
                style={{
                  fontFamily: 'var(--font-body)',
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border-strong)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                }}
              >
                Continuar sem login
              </button>
            </div>
          </div>
        )}
      </div>
    </BreathTransition>
  );
}

export { MemorialOrchestrator };