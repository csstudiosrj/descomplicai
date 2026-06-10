// components/memorial/MemorialOrchestrator.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import useMemorial from '../../hooks/useMemorial';
import { useAuth } from '../../hooks/useAuth';
import useAutoSave from '../../hooks/useAutoSave';
import { calcularProximaEtapa, calcularEtapasTotais, deveExibirLoginAgora, getEtapaPorIndice } from '../../utils/algoritmo';
import BreathTransition from './BreathTransition';
import ProgressBar from './ProgressBar';
import BackButton from './BackButton';

const STEP_COMPONENTS = {
  Step00Casal: React.lazy(() => import('./steps/Step00Casal')),
  Step01Modo: React.lazy(() => import('./steps/Step01Modo')),
  Step02NomeCasal: React.lazy(() => import('./steps/Step02NomeCasal')),
  Step03Data: React.lazy(() => import('./steps/Step03Data')),
  Step04Cidade: React.lazy(() => import('./steps/Step04Cidade')),
  Step05Convidados: React.lazy(() => import('./steps/Step05Convidados')),
  Step06Orcamento: React.lazy(() => import('./steps/Step06Orcamento')),
  Step07Cerimonia: React.lazy(() => import('./steps/Step07Cerimonia')),
  Step07aCatolica: React.lazy(() => import('./steps/Step07aCatolica')),
  Step07bEvangelica: React.lazy(() => import('./steps/Step07bEvangelica')),
  Step07cJudaica: React.lazy(() => import('./steps/Step07cJudaica')),
  Step07dSimbolica: React.lazy(() => import('./steps/Step07dSimbolica')),
  Step08Local: React.lazy(() => import('./steps/Step08Local')),
  Step09MesmoLocal: React.lazy(() => import('./steps/Step09MesmoLocal')),
  Step10Horario: React.lazy(() => import('./steps/Step10Horario')),
  Step11PlanoChuva: React.lazy(() => import('./steps/Step11PlanoChuva')),
  Step11bTransporte: React.lazy(() => import('./steps/Step11bTransporte')),
  Step12Estilo: React.lazy(() => import('./steps/Step12Estilo')),
  Step13Formalidade: React.lazy(() => import('./steps/Step13Formalidade')),
  Step14Paleta: React.lazy(() => import('./steps/Step14Paleta')),
  Step15Tom: React.lazy(() => import('./steps/Step15Tom')),
  Step16Referencias: React.lazy(() => import('./steps/Step16Referencias')),
  Step17Flores: React.lazy(() => import('./steps/Step17Flores')),
  Step23Toalha: React.lazy(() => import('./steps/Step23Toalha')),
  Step30Entrada: React.lazy(() => import('./steps/Step30Entrada')),
  Step38Coquetel: React.lazy(() => import('./steps/Step38Coquetel')),
  Step49Convites: React.lazy(() => import('./steps/Step49Convites')),
  Step54Vestido: React.lazy(() => import('./steps/Step54Vestido')),
  Step60Fornecedores: React.lazy(() => import('./steps/Step60Fornecedores')),
};

const BLOCK_NAMES = {
  'A': 'Bloco A — Perfil do Casal',
  'B': 'Bloco B — Dados do evento',
  'C': 'Bloco C — Local e Estrutura',
  'D': 'Bloco D — Identidade Visual',
  'E': 'Bloco E — Decoração',
  'F': 'Bloco F — Mesa Posta',
  'G': 'Bloco G — Cerimônia detalhada',
  'H': 'Bloco H — Recepção',
  'I': 'Bloco I — Papelaria e Identidade',
  'J': 'Bloco J — Vestuário e Beleza',
  'K': 'Bloco K — Fornecedores',
};

function PlaceholderStep({ titulo }) {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>{titulo}</h2>
      <p>Etapa em desenvolvimento</p>
    </div>
  );
}

export default function MemorialOrchestrator() {
  const router = useRouter();
  const { estado, setRespostas, carregarEstado, irParaEtapa, voltarEtapa } = useMemorial();
  const { usuario, carregando: carregandoAuth } = useAuth();
  const { salvandoAgora, temDraft, carregarDraft, limparDraft } = useAutoSave(estado, usuario);

  const [transicionando, setTransicionando] = useState(false);
  const [mostrandoLogin, setMostrandoLogin] = useState(false);
  const [oferecerDraft, setOferecerDraft] = useState(false);

  const estadoRef = useRef(estado);
  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  useEffect(() => {
    if (estado.memorialConcluido) {
      console.log('3. memorialConcluido = true, redirecionando...');
      console.log('4. chamando router.push(/memorial/conclusao)');
      router.push('/memorial/conclusao');
    }
  }, [estado.memorialConcluido, router]);

  useEffect(() => {
    if (!usuario && !carregandoAuth && temDraft && estado.etapaAtual === 0 && !estado.perfilCasal) {
      setOferecerDraft(true);
    }
  }, [usuario, carregandoAuth, temDraft, estado.etapaAtual, estado.perfilCasal]);

  useEffect(() => {
    if (usuario && temDraft && estado.etapaAtual === 0 && !estado.perfilCasal) {
      const draft = carregarDraft();
      if (draft) {
        carregarEstado(draft);
        setOferecerDraft(false);
      }
    }
  }, [usuario, temDraft, estado.etapaAtual, estado.perfilCasal, carregarDraft, carregarEstado]);

  const etapasTotais = calcularEtapasTotais(estado);
  const etapaAtualObj = getEtapaPorIndice(estado.etapaAtual);
  const blocoAtual = etapaAtualObj?.bloco || '';
  const progress = etapasTotais > 0 ? (estado.etapaAtual / etapasTotais) * 100 : 0;
  const blockName = BLOCK_NAMES[blocoAtual] || '';

  const handleSelect = useCallback((campo, valor) => {
    const novoEstado = { ...estadoRef.current, [campo]: valor };
    setRespostas(campo, valor);
    setTransicionando(true);

    setTimeout(() => {
      const proxima = calcularProximaEtapa(novoEstado, estadoRef.current.etapaAtual);
      const etapaId = getEtapaPorIndice(proxima)?.id;

      if (!usuario && deveExibirLoginAgora(novoEstado, etapaId)) {
        setMostrandoLogin(true);
        setTransicionando(false);
        return;
      }

      irParaEtapa(proxima);
      setTransicionando(false);
    }, 220);
  }, [setRespostas, irParaEtapa, usuario]);

  const handleBack = useCallback(() => {
    if (estado.historicoEtapas.length > 0) voltarEtapa();
  }, [estado.historicoEtapas.length, voltarEtapa]);

  const handleContinuarDraft = () => {
    const draft = carregarDraft();
    if (draft) {
      carregarEstado(draft);
    }
    setOferecerDraft(false);
  };

  const handleDescartarDraft = () => {
    limparDraft();
    setOferecerDraft(false);
  };

  const StepComponent = etapaAtualObj
    ? (STEP_COMPONENTS[etapaAtualObj.componente] || (() => <PlaceholderStep titulo={etapaAtualObj.titulo} />))
    : () => <PlaceholderStep titulo="Memorial Concluído" />;

  return (
    <BreathTransition ativa={transicionando} cor="var(--color-brand-lighter)">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: 'var(--color-off-white)' }}>
        <ProgressBar progress={progress} blockName={blockName} />

        {salvandoAgora && (
          <div style={{ position: 'fixed', top: '4px', right: 'var(--space-4)', zIndex: 'var(--z-sticky)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-brand)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <style jsx>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
            Salvando...
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-4)', paddingLeft: 'var(--space-4)', paddingRight: 'var(--space-4)' }}>
          <React.Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando...</span></div>}>
            <StepComponent onSelect={handleSelect} estadoAtual={estado} />
          </React.Suspense>
        </main>

        <BackButton onClick={handleBack} disabled={estado.historicoEtapas.length === 0} />

        {oferecerDraft && (
          <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-overlay)', padding: 'var(--space-4)' }}>
            <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', maxWidth: '420px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>Continuar onde parou?</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>Encontramos um memorial salvo neste dispositivo. Deseja continuar de onde parou?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <button onClick={handleContinuarDraft} style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--color-brand)', color: 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', cursor: 'pointer' }}>Sim, continuar</button>
                <button onClick={handleDescartarDraft} style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border-strong)', backgroundColor: 'transparent', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', cursor: 'pointer' }}>Não, começar do zero</button>
              </div>
            </div>
          </div>
        )}

        {mostrandoLogin && (
          <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-overlay)', padding: 'var(--space-4)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', maxWidth: '400px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>Quase lá!</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>Para continuar seu memorial na nuvem e acessar de qualquer lugar, faça login ou crie sua conta.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <button onClick={() => router.push(`/login?redirect=${encodeURIComponent('/memorial')}`)} style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--color-brand)', color: 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', cursor: 'pointer' }}>Fazer login</button>
                <button onClick={() => router.push(`/cadastro?redirect=${encodeURIComponent('/memorial')}`)} style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-brand)', backgroundColor: 'transparent', color: 'var(--color-brand)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', cursor: 'pointer' }}>Criar conta</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BreathTransition>
  );
}

export { MemorialOrchestrator };