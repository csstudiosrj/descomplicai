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

// === STEPS EXISTENTES (não mexer) ===
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
  Step60Fornecedores: React.lazy(() => import('./steps/Step60Fornecedores')),

  // === STEPS DESMEMBRADOS (Bloco E: Decoração) ===
  Step17Flores: React.lazy(() => import('./steps/Step17Flores')),
  Step18Iluminacao: React.lazy(() => import('./steps/Step18Iluminacao')),
  Step19Velas: React.lazy(() => import('./steps/Step19Velas')),
  Step20Mobiliario: React.lazy(() => import('./steps/Step20Mobiliario')),
  Step21Backdrop: React.lazy(() => import('./steps/Step21Backdrop')),
  Step22Tecidos: React.lazy(() => import('./steps/Step22Tecidos')),

  // === STEPS DESMEMBRADOS (Bloco F: Mesa Posta) ===
  Step23Toalha: React.lazy(() => import('./steps/Step23Toalha')),
  Step24Loucas: React.lazy(() => import('./steps/Step24Loucas')),
  Step25Talheres: React.lazy(() => import('./steps/Step25Talheres')),
  Step26Tacas: React.lazy(() => import('./steps/Step26Tacas')),
  Step27CentroMesa: React.lazy(() => import('./steps/Step27CentroMesa')),
  Step28Guardanapo: React.lazy(() => import('./steps/Step28Guardanapo')),
  Step29CartaoLugar: React.lazy(() => import('./steps/Step29CartaoLugar')),

  // === STEPS DESMEMBRADOS (Bloco G: Cerimônia Detalhada) ===
  Step30Entrada: React.lazy(() => import('./steps/Step30Entrada')),
  Step31MusicaCerimonia: React.lazy(() => import('./steps/Step31MusicaCerimonia')),
  Step32PadrinhosCriancas: React.lazy(() => import('./steps/Step32PadrinhosCriancas')),
  Step33RituaisSaida: React.lazy(() => import('./steps/Step33RituaisSaida')),

  // === STEPS DESMEMBRADOS (Bloco H: Recepção) ===
  Step38Coquetel: React.lazy(() => import('./steps/Step38Coquetel')),
  Step39BoloDocesBar: React.lazy(() => import('./steps/Step39BoloDocesBar')),
  Step40MusicaEntretenimento: React.lazy(() => import('./steps/Step40MusicaEntretenimento')),

  // === STEPS DESMEMBRADOS (Bloco I: Papelaria) ===
  Step49Convites: React.lazy(() => import('./steps/Step49Convites')),
  Step50IdentidadeVisual: React.lazy(() => import('./steps/Step50IdentidadeVisual')),

  // === STEPS DESMEMBRADOS (Bloco J: Vestuário) ===
  Step54Vestido: React.lazy(() => import('./steps/Step54Vestido')),
  Step55BelezaPadronizacao: React.lazy(() => import('./steps/Step55BelezaPadronizacao')),

  // === EXPANSÃO: Bloco A (Perfil) ===
  StepA4Criancas: React.lazy(() => import('./steps/StepA4Criancas')),
  StepA5Padrinhos: React.lazy(() => import('./steps/StepA5Padrinhos')),
  StepA6DataPrevista: React.lazy(() => import('./steps/StepA6DataPrevista')),

  // === EXPANSÃO: Bloco B (Cerimônia) ===
  StepB5CriancasCerimonia: React.lazy(() => import('./steps/StepB5CriancasCerimonia')),
  StepB6DuracaoCerimonia: React.lazy(() => import('./steps/StepB6DuracaoCerimonia')),
  StepB7MusicaCerimoniaViva: React.lazy(() => import('./steps/StepB7MusicaCerimoniaViva')),

  // === EXPANSÃO: Bloco C (Local) ===
  StepC4Estacionamento: React.lazy(() => import('./steps/StepC4Estacionamento')),
  StepC5CozinhaApoio: React.lazy(() => import('./steps/StepC5CozinhaApoio')),
  StepC6CapacidadeLocal: React.lazy(() => import('./steps/StepC6CapacidadeLocal')),
  StepC7GeradorLocal: React.lazy(() => import('./steps/StepC7GeradorLocal')),

  // === EXPANSÃO: Bloco G/H (Alimentação e Entretenimento) ===
  StepG8MesaFrios: React.lazy(() => import('./steps/StepG8MesaFrios')),
  StepG9BebidasPorPessoa: React.lazy(() => import('./steps/StepG9BebidasPorPessoa')),
  StepG10MenuInfantil: React.lazy(() => import('./steps/StepG10MenuInfantil')),
  StepH3FogosSparklers: React.lazy(() => import('./steps/StepH3FogosSparklers')),
  StepH4MesaDocesExposta: React.lazy(() => import('./steps/StepH4MesaDocesExposta')),
  StepH5AulaDanca: React.lazy(() => import('./steps/StepH5AulaDanca')),

  // === EXPANSÃO: Bloco I (Vestuário) ===
  StepI4AulasDanca: React.lazy(() => import('./steps/StepI4AulasDanca')),
  StepI5MudancaLook: React.lazy(() => import('./steps/StepI5MudancaLook')),
  StepI6QuantasMadrinhas: React.lazy(() => import('./steps/StepI6QuantasMadrinhas')),

  // === NOVO: Bloco L (Logística e Documentação) ===
  StepL1Aliancas: React.lazy(() => import('./steps/StepL1Aliancas')),
  StepL2CivilJunto: React.lazy(() => import('./steps/StepL2CivilJunto')),
  StepL3TransporteEspecialNoivos: React.lazy(() => import('./steps/StepL3TransporteEspecialNoivos')),
  StepL4CarroNoivos: React.lazy(() => import('./steps/StepL4CarroNoivos')),
  StepL5TransporteConvidados: React.lazy(() => import('./steps/StepL5TransporteConvidados')),
  StepL6Seguranca: React.lazy(() => import('./steps/StepL6Seguranca')),

  // === NOVO: Bloco M (Pós-casamento) ===
  StepM1LuaDeMel: React.lazy(() => import('./steps/StepM1LuaDeMel')),
  StepM2FotosLuaDeMel: React.lazy(() => import('./steps/StepM2FotosLuaDeMel')),
};

const BLOCK_NAMES = {
  'A': 'Bloco A — Perfil do Casal',
  'B': 'Bloco B — Cerimônia',
  'C': 'Bloco C — Local e Estrutura',
  'D': 'Bloco D — Identidade Visual',
  'E': 'Bloco E — Decoração',
  'F': 'Bloco F — Mesa Posta',
  'G': 'Bloco G — Cerimônia Detalhada',
  'H': 'Bloco H — Recepção',
  'I': 'Bloco I — Papelaria e Identidade',
  'J': 'Bloco J — Vestuário e Beleza',
  'K': 'Bloco K — Fornecedores',
  'L': 'Bloco L — Logística e Documentação',
  'M': 'Bloco M — Pós-casamento',
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
  const { user, loading: carregandoAuth, supabase } = useAuth();
  const { temDraft, carregarDraft, limparDraft, salvandoAgora } = useAutoSave(estado);

  const [transicionando, setTransicionando] = useState(false);
  const [mostrandoLogin, setMostrandoLogin] = useState(false);
  const [oferecerDraft, setOferecerDraft] = useState(false);
  const restauracaoFeita = useRef(false);

  // ========== RESTAURAÇÃO APÓS LOGIN VIA SUPABASE ==========
  useEffect(() => {
    if (!user) return;
    if (estado.etapaAtual !== 0 || estado.perfilCasal) return;
    if (restauracaoFeita.current) return;

    restauracaoFeita.current = true;

    async function buscarDoSupabase() {
      try {
        console.log('buscando memorial para user_id:', user.id);

        const { data, error } = await supabase
          .from('memoriais')
          .select('estado')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('resultado supabase:', data, error);

        if (data?.estado && data.estado.perfilCasal) {
          carregarEstado(data.estado);
          return;
        }
      } catch (e) {
        console.warn('Erro ao buscar memorial no Supabase:', e);
      }

      // Fallback: oferece draft local se existir
      const draft = carregarDraft();
      if (draft) {
        setOferecerDraft(true);
      }
    }

    buscarDoSupabase();
  }, [user, estado.etapaAtual, estado.perfilCasal, carregarEstado, carregarDraft, supabase]);

  const etapasTotais = calcularEtapasTotais(estado);
  const etapaAtualObj = getEtapaPorIndice(estado.etapaAtual);
  const blocoAtual = etapaAtualObj?.bloco || '';
  const progress = etapasTotais > 0 ? (estado.etapaAtual / etapasTotais) * 100 : 0;
  const blockName = BLOCK_NAMES[blocoAtual] || '';

  const handleSelect = useCallback((campo, valor) => {
    setRespostas(campo, valor);
    setTransicionando(true);

    const novoEstado = { ...estado, [campo]: valor };
    setTimeout(() => {
      const proxima = calcularProximaEtapa(novoEstado, estado.etapaAtual);
      const etapaId = getEtapaPorIndice(proxima)?.id;

      if (!user && deveExibirLoginAgora(novoEstado, etapaId)) {
        setMostrandoLogin(true);
        setTransicionando(false);
        return;
      }

      irParaEtapa(proxima);
      setTransicionando(false);
    }, 220);
  }, [estado, setRespostas, irParaEtapa, user]);

  // ========== SALVA ESTADO NO sessionStorage ANTES DE IR PARA LOGIN ==========
  const handleIrParaLogin = (destino) => {
    try {
      sessionStorage.setItem(
        'descomplicai-pre-login-state',
        JSON.stringify(estado)
      );
    } catch (e) {}
    router.push(`${destino}?redirect=${encodeURIComponent('/memorial')}`);
  };

  const handleConcluirMemorial = useCallback(async (fornecedores) => {
    setRespostas('fornecedoresNecessarios', fornecedores);
    try {
      localStorage.setItem('descomplicai-memorial-draft', JSON.stringify(estado));
      router.push('/memorial/conclusao?concluido=1');
    } catch (erro) {
      alert('Falha ao salvar o progresso. Tente novamente.');
    }
  }, [estado, setRespostas, router]);

  const handleBack = useCallback(() => {
    if (estado.historicoEtapas.length > 0) voltarEtapa();
  }, [estado.historicoEtapas.length, voltarEtapa]);

  const handleContinuarDraft = () => {
    const draft = carregarDraft();
    if (draft) carregarEstado(draft);
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
            <StepComponent onSelect={handleSelect} estadoAtual={estado} onConcluir={handleConcluirMemorial} />
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
                <button onClick={() => handleIrParaLogin('/login')} style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--color-brand)', color: 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', cursor: 'pointer' }}>Fazer login</button>
                <button onClick={() => handleIrParaLogin('/cadastro')} style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-brand)', backgroundColor: 'transparent', color: 'var(--color-brand)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', cursor: 'pointer' }}>Criar conta</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BreathTransition>
  );
}

export { MemorialOrchestrator };
