// components/memorial/MemorialOrchestrator.jsx
// HOTFIX: corrigido typo salvandoAgoro -> salvandoAgora

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import useMemorial from '../../hooks/useMemorial';
import { useAuth } from '../../hooks/useAuth';
import useAutoSave from '../../hooks/useAutoSave';
import { calcularProximaEtapa, calcularEtapasTotais, deveExibirLoginAgora, getEtapaPorIndice } from '../../utils/algoritmo';
import BreathTransition from './BreathTransition';
import ProgressBar from './ProgressBar';
import BackButton from './BackButton';
import Footer from '../ui/Footer';

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
  Step17Flores: React.lazy(() => import('./steps/Step17Flores')),
  Step18Iluminacao: React.lazy(() => import('./steps/Step18Iluminacao')),
  Step19Velas: React.lazy(() => import('./steps/Step19Velas')),
  Step20Mobiliario: React.lazy(() => import('./steps/Step20Mobiliario')),
  Step21Backdrop: React.lazy(() => import('./steps/Step21Backdrop')),
  Step22Tecidos: React.lazy(() => import('./steps/Step22Tecidos')),
  Step23Toalha: React.lazy(() => import('./steps/Step23Toalha')),
  Step24Loucas: React.lazy(() => import('./steps/Step24Loucas')),
  Step25Talheres: React.lazy(() => import('./steps/Step25Talheres')),
  Step26Tacas: React.lazy(() => import('./steps/Step26Tacas')),
  Step27CentroMesa: React.lazy(() => import('./steps/Step27CentroMesa')),
  Step28Guardanapo: React.lazy(() => import('./steps/Step28Guardanapo')),
  Step29CartaoLugar: React.lazy(() => import('./steps/Step29CartaoLugar')),
  Step30Entrada: React.lazy(() => import('./steps/Step30Entrada')),
  Step31MusicaCerimonia: React.lazy(() => import('./steps/Step31MusicaCerimonia')),
  Step32PadrinhosCriancas: React.lazy(() => import('./steps/Step32PadrinhosCriancas')),
  Step33RituaisSaida: React.lazy(() => import('./steps/Step33RituaisSaida')),
  Step38Coquetel: React.lazy(() => import('./steps/Step38Coquetel')),
  Step39BoloDocesBar: React.lazy(() => import('./steps/Step39BoloDocesBar')),
  Step40MusicaEntretenimento: React.lazy(() => import('./steps/Step40MusicaEntretenimento')),
  Step49Convites: React.lazy(() => import('./steps/Step49Convites')),
  Step50IdentidadeVisual: React.lazy(() => import('./steps/Step50IdentidadeVisual')),
  Step54Vestido: React.lazy(() => import('./steps/Step54Vestido')),
  Step55BelezaPadronizacao: React.lazy(() => import('./steps/Step55BelezaPadronizacao')),
  StepA4Criancas: React.lazy(() => import('./steps/StepA4Criancas')),
  StepA5Padrinhos: React.lazy(() => import('./steps/StepA5Padrinhos')),
  StepA6DataPrevista: React.lazy(() => import('./steps/StepA6DataPrevista')),
  StepA7TempoJuntos: React.lazy(() => import('./steps/StepA7TempoJuntos')),
  StepA8MoramJuntos: React.lazy(() => import('./steps/StepA8MoramJuntos')),
  StepA9ComoSeConheceram: React.lazy(() => import('./steps/StepA9ComoSeConheceram')),
  StepA10TemFilhos: React.lazy(() => import('./steps/StepA10TemFilhos')),
  StepA11TemAnimais: React.lazy(() => import('./steps/StepA11TemAnimais')),
  StepA12GostamDeFazer: React.lazy(() => import('./steps/StepA12GostamDeFazer')),
  StepA13PersonalidadeNoivo: React.lazy(() => import('./steps/StepA13PersonalidadeNoivo')),
  StepA14PersonalidadeNoiva: React.lazy(() => import('./steps/StepA14PersonalidadeNoiva')),
  StepA15TradicaoFamiliar: React.lazy(() => import('./steps/StepA15TradicaoFamiliar')),
  StepA16RestricaoCultural: React.lazy(() => import('./steps/StepA16RestricaoCultural')),
  StepB5CriancasCerimonia: React.lazy(() => import('./steps/StepB5CriancasCerimonia')),
  StepB6DuracaoCerimonia: React.lazy(() => import('./steps/StepB6DuracaoCerimonia')),
  StepB7MusicaCerimoniaViva: React.lazy(() => import('./steps/StepB7MusicaCerimoniaViva')),
  StepB8ReservouIgreja: React.lazy(() => import('./steps/StepB8ReservouIgreja')),
  StepB9CursoNoivos: React.lazy(() => import('./steps/StepB9CursoNoivos')),
  StepB10EscolheuPadre: React.lazy(() => import('./steps/StepB10EscolheuPadre')),
  StepB11ReservouTemplo: React.lazy(() => import('./steps/StepB11ReservouTemplo')),
  StepB12DefiniuChupa: React.lazy(() => import('./steps/StepB12DefiniuChupa')),
  StepB13EscolheuCelebrante: React.lazy(() => import('./steps/StepB13EscolheuCelebrante')),
  StepB14AgendouCartorio: React.lazy(() => import('./steps/StepB14AgendouCartorio')),
  StepB15PadrinhosEscolhidos: React.lazy(() => import('./steps/StepB15PadrinhosEscolhidos')),
  StepB16DefiniramEntrada: React.lazy(() => import('./steps/StepB16DefiniramEntrada')),
  StepB17MusicosCerimonia: React.lazy(() => import('./steps/StepB17MusicosCerimonia')),
  StepB18CertidaoBatismo: React.lazy(() => import('./steps/StepB18CertidaoBatismo')),
  StepC4Estacionamento: React.lazy(() => import('./steps/StepC4Estacionamento')),
  StepC5CozinhaApoio: React.lazy(() => import('./steps/StepC5CozinhaApoio')),
  StepC6CapacidadeLocal: React.lazy(() => import('./steps/StepC6CapacidadeLocal')),
  StepC7GeradorLocal: React.lazy(() => import('./steps/StepC7GeradorLocal')),
  StepC8ReservouLocalCerimonia: React.lazy(() => import('./steps/StepC8ReservouLocalCerimonia')),
  StepC9ReservouLocalFesta: React.lazy(() => import('./steps/StepC9ReservouLocalFesta')),
  StepC10VerificouMare: React.lazy(() => import('./steps/StepC10VerificouMare')),
  StepC11ListaPreliminar: React.lazy(() => import('./steps/StepC11ListaPreliminar')),
  StepC12ConvidadosForaCidade: React.lazy(() => import('./steps/StepC12ConvidadosForaCidade')),
  StepC13HotelIndicacao: React.lazy(() => import('./steps/StepC13HotelIndicacao')),
  StepC14HorarioFesta: React.lazy(() => import('./steps/StepC14HorarioFesta')),
  StepC15DuracaoCoquetel: React.lazy(() => import('./steps/StepC15DuracaoCoquetel')),
  StepD1TipoFlores: React.lazy(() => import('./steps/StepD1TipoFlores')),
  StepD2TipoIluminacao: React.lazy(() => import('./steps/StepD2TipoIluminacao')),
  StepD3MobiliarioQual: React.lazy(() => import('./steps/StepD3MobiliarioQual')),
  StepD4FotografoContratado: React.lazy(() => import('./steps/StepD4FotografoContratado')),
  StepD5FilmagemContratada: React.lazy(() => import('./steps/StepD5FilmagemContratada')),
  StepD6BuffetContratado: React.lazy(() => import('./steps/StepD6BuffetContratado')),
  StepD7DecoracaoContratada: React.lazy(() => import('./steps/StepD7DecoracaoContratada')),
  StepD8MusicaContratada: React.lazy(() => import('./steps/StepD8MusicaContratada')),
  StepD9EspacoContratado: React.lazy(() => import('./steps/StepD9EspacoContratado')),
  StepD10VestidoContratado: React.lazy(() => import('./steps/StepD10VestidoContratado')),
  StepD11TrajeNoivoContratado: React.lazy(() => import('./steps/StepD11TrajeNoivoContratado')),
  StepD12CerimonialistaContratado: React.lazy(() => import('./steps/StepD12CerimonialistaContratado')),
  StepD13TransporteContratado: React.lazy(() => import('./steps/StepD13TransporteContratado')),
  StepD14PapelariaContratada: React.lazy(() => import('./steps/StepD14PapelariaContratada')),
  StepD15CabineFotos: React.lazy(() => import('./steps/StepD15CabineFotos')),
  StepD16Drone: React.lazy(() => import('./steps/StepD16Drone')),
  StepD17AnimacaoInfantil: React.lazy(() => import('./steps/StepD17AnimacaoInfantil')),
  StepD18VestidoComprado: React.lazy(() => import('./steps/StepD18VestidoComprado')),
  StepD19TesteBeleza: React.lazy(() => import('./steps/StepD19TesteBeleza')),
  StepD20ConvitesEncomendados: React.lazy(() => import('./steps/StepD20ConvitesEncomendados')),
  StepD21SaveTheDate: React.lazy(() => import('./steps/StepD21SaveTheDate')),
  StepD22Lembrancinhas: React.lazy(() => import('./steps/StepD22Lembrancinhas')),
  StepD23KitSaida: React.lazy(() => import('./steps/StepD23KitSaida')),
  StepG8MesaFrios: React.lazy(() => import('./steps/StepG8MesaFrios')),
  StepG9BebidasPorPessoa: React.lazy(() => import('./steps/StepG9BebidasPorPessoa')),
  StepG10MenuInfantil: React.lazy(() => import('./steps/StepG10MenuInfantil')),
  StepH3FogosSparklers: React.lazy(() => import('./steps/StepH3FogosSparklers')),
  StepH4MesaDocesExposta: React.lazy(() => import('./steps/StepH4MesaDocesExposta')),
  StepH5AulaDanca: React.lazy(() => import('./steps/StepH5AulaDanca')),
  StepI4AulasDanca: React.lazy(() => import('./steps/StepI4AulasDanca')),
  StepI5MudancaLook: React.lazy(() => import('./steps/StepI5MudancaLook')),
  StepI6QuantasMadrinhas: React.lazy(() => import('./steps/StepI6QuantasMadrinhas')),
  StepL1Aliancas: React.lazy(() => import('./steps/StepL1Aliancas')),
  StepL2CivilJunto: React.lazy(() => import('./steps/StepL2CivilJunto')),
  StepL3TransporteEspecialNoivos: React.lazy(() => import('./steps/StepL3TransporteEspecialNoivos')),
  StepL4CarroNoivos: React.lazy(() => import('./steps/StepL4CarroNoivos')),
  StepL5TransporteConvidados: React.lazy(() => import('./steps/StepL5TransporteConvidados')),
  StepL6Seguranca: React.lazy(() => import('./steps/StepL6Seguranca')),
  StepM1LuaDeMel: React.lazy(() => import('./steps/StepM1LuaDeMel')),
  StepM2FotosLuaDeMel: React.lazy(() => import('./steps/StepM2FotosLuaDeMel')),
  StepE1EstadoCivilNoivo: React.lazy(() => import('./steps/StepE1EstadoCivilNoivo')),
  StepE2EstadoCivilNoiva: React.lazy(() => import('./steps/StepE2EstadoCivilNoiva')),
  StepE3CertidaoDivorcioNoivo: React.lazy(() => import('./steps/StepE3CertidaoDivorcioNoivo')),
  StepE4CertidaoDivorcioNoiva: React.lazy(() => import('./steps/StepE4CertidaoDivorcioNoiva')),
  StepE5CertidaoObitoNoivo: React.lazy(() => import('./steps/StepE5CertidaoObitoNoivo')),
  StepE6CertidaoObitoNoiva: React.lazy(() => import('./steps/StepE6CertidaoObitoNoiva')),
  StepE7NacionalidadeNoivo: React.lazy(() => import('./steps/StepE7NacionalidadeNoivo')),
  StepE8NacionalidadeNoiva: React.lazy(() => import('./steps/StepE8NacionalidadeNoiva')),
  StepE9DocumentacaoEstrangeiro: React.lazy(() => import('./steps/StepE9DocumentacaoEstrangeiro')),
  StepE10QuemPaga: React.lazy(() => import('./steps/StepE10QuemPaga')),
  StepE11FormaPagamento: React.lazy(() => import('./steps/StepE11FormaPagamento')),
  StepE12CronogramaDia: React.lazy(() => import('./steps/StepE12CronogramaDia')),
  StepE13HorarioMakingOfNoiva: React.lazy(() => import('./steps/StepE13HorarioMakingOfNoiva')),
  StepE14HorarioMakingOfNoivo: React.lazy(() => import('./steps/StepE14HorarioMakingOfNoivo')),
  StepE15DestinoLuaDeMel: React.lazy(() => import('./steps/StepE15DestinoLuaDeMel')),
  StepE16LuaDeMelReservada: React.lazy(() => import('./steps/StepE16LuaDeMelReservada')),
  StepE17PassaporteValido: React.lazy(() => import('./steps/StepE17PassaporteValido')),
  StepE18Visto: React.lazy(() => import('./steps/StepE18Visto')),
  StepE19Vacinas: React.lazy(() => import('./steps/StepE19Vacinas')),
};

const BLOCK_NAMES = {
  'A': 'Bloco A — Perfil do Casal',
  'B': 'Bloco B — Cerimônia',
  'C': 'Bloco C — Local e Estrutura',
  'D': 'Bloco D — Identidade Visual e Fornecedores',
  'E': 'Bloco E — Decoração',
  'F': 'Bloco F — Mesa Posta',
  'G': 'Bloco G — Cerimônia Detalhada',
  'H': 'Bloco H — Recepção',
  'I': 'Bloco I — Papelaria e Identidade',
  'J': 'Bloco J — Vestuário e Beleza',
  'K': 'Bloco K — Fornecedores',
  'L': 'Bloco L — Logística e Documentação',
  'M': 'Bloco M — Pós-casamento',
  'N': 'Bloco N — Documentação e Financeiro',
};

function PlaceholderStep({ titulo }) {
  return (
    <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
      <h2>{titulo}</h2>
      <p>Etapa em desenvolvimento</p>
    </div>
  );
}

export default function MemorialOrchestrator() {
  const router = useRouter();
  const { estado, setRespostas, carregarEstado, irParaEtapa, voltarEtapa } = useMemorial();
  const { user, evento, loading: carregandoAuth, supabase } = useAuth();
  const { temDraft, carregarDraft, limparDraft, salvandoAgora } = useAutoSave(estado, user, evento);

  const [transicionando, setTransicionando] = useState(false);
  const [corTransicao, setCorTransicao] = useState(null);
  const [respostaTransicao, setRespostaTransicao] = useState('');
  const [campoTransicao, setCampoTransicao] = useState('');
  const [mostrandoLogin, setMostrandoLogin] = useState(false);
  const [oferecerDraft, setOferecerDraft] = useState(false);
  const restauracaoFeita = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (estado.etapaAtual !== 0 || estado.perfilCasal) return;
    if (restauracaoFeita.current) return;

    restauracaoFeita.current = true;

    async function buscarDoSupabase() {
      try {
        const { data, error } = await supabase
          .from('memoriais')
          .select('estado')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data?.estado && data.estado.perfilCasal) {
          carregarEstado(data.estado);
          return;
        }
      } catch (e) {
        console.warn('Erro ao buscar memorial:', e);
      }
      const draft = carregarDraft();
      if (draft) setOferecerDraft(true);
    }

    buscarDoSupabase();
  }, [user, estado.etapaAtual, estado.perfilCasal, carregarEstado, carregarDraft, supabase]);

  const etapasTotais = calcularEtapasTotais(estado);
  const etapaAtualObj = getEtapaPorIndice(estado.etapaAtual);
  const blocoAtual = etapaAtualObj?.bloco || '';
  const progress = etapasTotais > 0 ? (estado.etapaAtual / etapasTotais) * 100 : 0;
  const blockName = BLOCK_NAMES[blocoAtual] || '';

  const BREATH_DURATION = 1400;

  const handleSelect = useCallback((campo, valor, cor) => {
    setRespostas(campo, valor);
    setRespostaTransicao(typeof valor === 'string' ? valor : '');
    setCampoTransicao(campo);
    setTransicionando(true);
    if (cor) setCorTransicao(cor);

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
      setCorTransicao(null);
      setRespostaTransicao('');
      setCampoTransicao('');
    }, BREATH_DURATION);
  }, [estado, setRespostas, irParaEtapa, user]);

  const handleIrParaLogin = (destino) => {
    try {
      sessionStorage.setItem('descomplicai-pre-login-state', JSON.stringify(estado));
    } catch (e) {}
    router.push(`${destino}?redirect=${encodeURIComponent('/memorial')}`);
  };

  const handleConcluirMemorial = useCallback(async (fornecedores) => {
    setRespostas('fornecedoresNecessarios', fornecedores);
    try {
      localStorage.setItem('descomplicai-memorial-draft', JSON.stringify(estado));
      if (user && evento?.id) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (token) {
          const res = await fetch('/api/memorial/salvar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ evento_id: evento.id, estado }),
          });
          if (!res.ok) void 0
        }
      }
      router.push('/memorial/conclusao?concluido=1');
    } catch (erro) {
      alert('Falha ao salvar o progresso. Tente novamente.');
    }
  }, [estado, setRespostas, router, user, evento, supabase]);

  const handleBack = useCallback(() => {
    if (estado.historicoEtapas?.length > 0) voltarEtapa();
  }, [estado.historicoEtapas, voltarEtapa]);

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
    : () => null;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {salvandoAgora && (
        <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 9999, fontSize: 12, opacity: 0.6 }}>
          Salvando...
        </div>
      )}

      {carregandoAuth ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Carregando...</p>
        </div>
      ) : (
        <>
          {estado.etapaAtual === 0 && oferecerDraft ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <h2>Você tem um progresso salvo</h2>
              <p>Deseja continuar de onde parou?</p>
              <button onClick={handleContinuarDraft}>Continuar</button>
              <button onClick={handleDescartarDraft}>Começar do zero</button>
            </div>
          ) : mostrandoLogin ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <h2>Quase lá!</h2>
              <p>Para continuar salvando seu progresso, faça login ou crie uma conta.</p>
              <button onClick={() => handleIrParaLogin('/login')}>Entrar</button>
              <button onClick={() => handleIrParaLogin('/cadastro')}>Criar conta</button>
            </div>
          ) : (
            <>
              <BreathTransition
                ativa={transicionando}
                cor={corTransicao}
                blocoAtual={blocoAtual}
                estiloEscolhido={estado.estilo || ''}
                respostaAtual={respostaTransicao || estado[campoTransicao] || ''}
                perfilCasal={estado.perfilCasal || ''}
              >
                <ProgressBar progress={progress} blockName={blockName} />
                {estado.etapaAtual > 0 && <BackButton onClick={handleBack} />}
                <React.Suspense fallback={<div style={{ padding: 'var(--space-6)' }}>Carregando etapa...</div>}>
                  <StepComponent
                    estado={estado}
                    onSelect={handleSelect}
                    onConcluir={handleConcluirMemorial}
                  />
                </React.Suspense>
                {estado.etapaAtual === 0 && <Footer />}
              </BreathTransition>
            </>
          )}
        </>
      )}
    </div>
  );
}