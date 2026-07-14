// components/memorial/MemorialOrchestrator.jsx
// REFATORADO: Motor de árvore de nós (motorArvore.js) substitui algoritmo linear.
// Mantém todas as funcionalidades existentes: login, autosave, analytics, etc.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import useMemorial from '../../hooks/useMemorial';
import { useAuth } from '../../hooks/useAuth';
import { useAnalytics } from '../../hooks/useAnalytics';
import useAutoSave from '../../hooks/useAutoSave';
import { carregarArvore, getNoPorId, getRaiz, proximoNo, noAnterior, contarNosAtivos } from '../../utils/motorArvore';
import BreathTransition from './BreathTransition';
import ProgressBar from './ProgressBar';
import BackButton from './BackButton';
import Footer from '../ui/Footer';
import LoginCadastroModal from './LoginCadastroModal';
import fetchAPI from '../../utils/fetchAPI';

const STEP_COMPONENTS = {
  Step00Casal: React.lazy(() => import('./steps/Step00Casal')),
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
  'B': 'Bloco B — Cerimonia',
  'C': 'Bloco C — Local e Estrutura',
  'D': 'Bloco D — Identidade Visual e Fornecedores',
  'E': 'Bloco E — Decoracao',
  'F': 'Bloco F — Mesa Posta',
  'G': 'Bloco G — Cerimonia Detalhada',
  'H': 'Bloco H — Recepcao',
  'I': 'Bloco I — Papelaria e Identidade',
  'J': 'Bloco J — Vestuario e Beleza',
  'K': 'Bloco K — Fornecedores',
  'L': 'Bloco L — Logistica e Documentacao',
  'M': 'Bloco M — Pos-casamento',
  'N': 'Bloco N — Documentacao e Financeiro',
};

function PlaceholderStep({ titulo, componente }) {
  return (
    <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
      <h2>{titulo || 'Componente não encontrado'}</h2>
      <p>Etapa em desenvolvimento</p>
      {componente && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Faltando: {componente}</p>}
    </div>
  );
}

export default function MemorialOrchestrator() {
  const router = useRouter();
  const { estado, setRespostas, atualizarMultiplo, carregarEstado } = useMemorial();
  const { user, evento, loading: carregandoAuth, supabase } = useAuth();
  const { trackStep } = useAnalytics();
  const { temDraft, carregarDraft, limparDraft, salvandoAgora } = useAutoSave(estado, user, evento);

  const [arvore, setArvore] = useState(null);
  const [noAtualId, setNoAtualId] = useState(null);
  const [historicoIds, setHistoricoIds] = useState([]);
  const arvoreCarregada = useRef(false);

  useEffect(() => {
    if (arvoreCarregada.current) return;
    arvoreCarregada.current = true;
    const tipo = estado.tipoEvento || 'casamento';
    carregarArvore(tipo).then(arv => {
      setArvore(arv);
      if (!noAtualId) {
        const raiz = getRaiz(arv);
        if (raiz) setNoAtualId(raiz.id);
      }
    });
  }, [estado.tipoEvento]);

  const [transicionando, setTransicionando] = useState(false);
  const [corTransicao, setCorTransicao] = useState(null);
  const [respostaTransicao, setRespostaTransicao] = useState('');
  const [campoTransicao, setCampoTransicao] = useState('');
  const [modalAuthAberto, setModalAuthAberto] = useState(false);
  const [oferecerDraft, setOferecerDraft] = useState(false);
  const [carregandoDoBanco, setCarregandoDoBanco] = useState(false);
  const [eventoId, setEventoId] = useState(null);
  const restauracaoFeita = useRef(false);
  const stepCompletedRef = useRef(false);
  const currentStepIdRef = useRef(null);
  const perfilSelecionadoRef = useRef(null);
  const dnaSkipFeito = useRef(false);

  useEffect(() => {
    const id = localStorage.getItem('descomplicai-evento-id');
    if (id) setEventoId(id);
  }, []);

  useEffect(() => {
    if (dnaSkipFeito.current || !arvore) return;
    const dnaCompleto = localStorage.getItem('descomplicai-dna-completo');
    if (dnaCompleto && estado.perfilCasal && noAtualId === getRaiz(arvore)?.id) {
      dnaSkipFeito.current = true;
      const raiz = getRaiz(arvore);
      if (raiz) {
        const prox = proximoNo(estado, raiz.id, arvore);
        if (prox) {
          setHistoricoIds(prev => [...prev, raiz.id]);
          setNoAtualId(prox.id);
        }
      }
    }
  }, [estado.perfilCasal, noAtualId, arvore]);

  useEffect(() => {
    if (!user || carregandoAuth) return;
    if (eventoId) return;
    const draft = localStorage.getItem('descomplicai-perfil-draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.perfilCasal || perfilSelecionadoRef.current) {
          router.push('/memorial/perfil');
        }
      } catch { /* ignora */ }
    }
  }, [user, carregandoAuth, eventoId, router]);

  useEffect(() => {
    if (!noAtualId || !arvore) return;
    const noAtual = getNoPorId(noAtualId, arvore);
    const stepId = noAtual?.id || noAtual?.componente;

    if (stepId && stepId !== currentStepIdRef.current) {
      if (currentStepIdRef.current && !stepCompletedRef.current) {
        trackStep(currentStepIdRef.current, 'abandonou');
      }
      stepCompletedRef.current = false;
      currentStepIdRef.current = stepId;
      trackStep(stepId, 'iniciou');
    }

    return () => {
      if (currentStepIdRef.current && !stepCompletedRef.current) {
        trackStep(currentStepIdRef.current, 'abandonou');
      }
    };
  }, [noAtualId, arvore, trackStep]);

  useEffect(() => {
    if (!user) return;
    if (restauracaoFeita.current) return;
    if (carregandoAuth) return;
    if (estado.perfilCasal) return;

    restauracaoFeita.current = true;
    setCarregandoDoBanco(true);

    async function buscarDoSupabase() {
      try {
        const { data: memorialData, error: memErr } = await supabase
          .from('memoriais')
          .select('estado, dados')
          .eq('user_id', user.id)
          .order('atualizado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!memErr && memorialData?.estado?.perfilCasal) {
          carregarEstado(memorialData.estado);
          setCarregandoDoBanco(false);
          return;
        }

        if (!memErr && memorialData?.dados) {
          carregarEstado(memorialData.dados);
        }

        const draft = carregarDraft();
        if (draft?.perfilCasal) {
          setCarregandoDoBanco(false);
          setOferecerDraft(true);
          return;
        }
      } catch (e) {
        console.warn('[MemorialOrchestrator] Erro ao buscar do Supabase:', e);
      } finally {
        setCarregandoDoBanco(false);
      }
    }

    buscarDoSupabase();
  }, [user, carregandoAuth, estado.perfilCasal, carregarEstado, carregarDraft, supabase]);

  const etapasTotais = arvore ? contarNosAtivos(estado, arvore) : 0;
  const noAtual = arvore ? getNoPorId(noAtualId, arvore) : null;
  const blocoAtual = noAtual?.bloco || '';
  const progress = etapasTotais > 0 ? (historicoIds.length / etapasTotais) * 100 : 0;
  const blockName = BLOCK_NAMES[blocoAtual] || '';

  const BREATH_DURATION = 1400;

  const handleSelect = useCallback((campo, valor, cor) => {
    if (campo === 'perfilCasal') {
      perfilSelecionadoRef.current = valor;

      if (!user) {
        localStorage.setItem('descomplicai-perfil-draft', JSON.stringify({ perfilCasal: valor }));
        setModalAuthAberto(true);
        return;
      }

      if (!eventoId) {
        localStorage.setItem('descomplicai-perfil-draft', JSON.stringify({ perfilCasal: valor }));
        router.push('/memorial/perfil');
        return;
      }

      setRespostas('perfilCasal', valor);
      setRespostas('modoPlanejamento', 'guiado');

      setRespostaTransicao('');
      setCampoTransicao(campo);
      setTransicionando(true);
      if (cor) setCorTransicao(cor);

      const novoEstado = { ...estado, perfilCasal: valor, modoPlanejamento: 'guiado' };

      setTimeout(() => {
        if (!arvore) return;
        const proximo = proximoNo(novoEstado, noAtualId, arvore);
        if (proximo) {
          setHistoricoIds(prev => [...prev, noAtualId]);
          setNoAtualId(proximo.id);
        }
        setTransicionando(false);
        setCorTransicao(null);
        setRespostaTransicao('');
        setCampoTransicao('');
      }, BREATH_DURATION);
      return;
    }

    setRespostas(campo, valor);

    let valorDisplay = valor;
    if (campo === 'dataEvento' && valor && typeof valor === 'string') {
      const [ano, mes, dia] = valor.split('-');
      if (ano && mes && dia) valorDisplay = `${dia}/${mes}/${ano}`;
    }

    setRespostaTransicao(typeof valorDisplay === 'string' ? valorDisplay : '');
    setCampoTransicao(campo);
    setTransicionando(true);
    if (cor) setCorTransicao(cor);

    const novoEstado = { ...estado, [campo]: valor };

    setTimeout(() => {
      if (!arvore) return;
      const proximo = proximoNo(novoEstado, noAtualId, arvore);
      if (proximo) {
        setHistoricoIds(prev => [...prev, noAtualId]);
        setNoAtualId(proximo.id);
      }
      setTransicionando(false);
      setCorTransicao(null);
      setRespostaTransicao('');
      setCampoTransicao('');
    }, BREATH_DURATION);
  }, [estado, setRespostas, noAtualId, arvore, user, eventoId, router]);

  const handleConcluirMemorial = useCallback(async (fornecedores) => {
    setRespostas('fornecedoresNecessarios', fornecedores);
    try {
      localStorage.setItem('descomplicai-memorial-draft', JSON.stringify(estado));

      const evId = eventoId || localStorage.getItem('descomplicai-evento-id');
      if (user && evId) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (token) {
          const res = await fetchAPI('/api/memorial/salvar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ evento_id: evId, estado }),
          });
          if (!res.ok) {
            const errText = await res.text();
            console.warn('[MemorialOrchestrator] Erro ao salvar memorial:', errText);
          }
        }
      }
      router.push('/memorial/conclusao?concluido=1');
    } catch (erro) {
      console.error('[MemorialOrchestrator] Falha ao salvar:', erro);
      alert('Falha ao salvar o progresso. Tente novamente.');
    }
  }, [estado, setRespostas, router, user, eventoId, supabase]);

  const handleBack = useCallback(() => {
    if (!arvore || historicoIds.length === 0) {
      router.push('/memorial?fase=dna');
      return;
    }
    const anterior = noAnterior(historicoIds, arvore);
    if (anterior) {
      setRespostaTransicao('');
      setCampoTransicao('');
      setCorTransicao(null);
      setHistoricoIds(prev => prev.slice(0, -1));
      setNoAtualId(anterior.id);
    } else {
      router.push('/memorial?fase=dna');
    }
  }, [arvore, historicoIds, router]);

  const handleContinuarDraft = () => {
    const draft = carregarDraft();
    if (draft) carregarEstado(draft);
    setOferecerDraft(false);
  };

  const handleDescartarDraft = () => {
    limparDraft();
    setOferecerDraft(false);
  };

  let StepComponent = null;
  let stepProps = {};
  if (noAtual) {
    const Comp = STEP_COMPONENTS[noAtual.componente];
    if (Comp) {
      StepComponent = Comp;
    } else {
      console.warn(`[MemorialOrchestrator] Componente "${noAtual.componente}" não encontrado no STEP_COMPONENTS.`);
      StepComponent = PlaceholderStep;
      stepProps = { titulo: noAtual.titulo, componente: noAtual.componente };
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {salvandoAgora && (
        <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 9999, fontSize: 12, opacity: 0.6 }}>
          Salvando...
        </div>
      )}

      {carregandoDoBanco && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9997,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.8)',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
            Carregando seu progresso...
          </p>
        </div>
      )}

      <LoginCadastroModal
        isOpen={modalAuthAberto}
        onClose={() => setModalAuthAberto(false)}
      />

      {carregandoAuth ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Carregando...</p>
        </div>
      ) : (
        <>
          {(!noAtualId && oferecerDraft) ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <h2>Voce tem um progresso salvo</h2>
              <p>Deseja continuar de onde parou?</p>
              <button onClick={handleContinuarDraft}>Continuar</button>
              <button onClick={handleDescartarDraft}>Comecar do zero</button>
            </div>
          ) : (
            <>
              <BreathTransition
                ativa={transicionando}
                cor={corTransicao}
                blocoAtual={blocoAtual}
                estiloEscolhido={estado.estilo || ''}
                respostaAtual={respostaTransicao}
                perfilCasal={estado.perfilCasal || ''}
              >
                <ProgressBar progress={progress} blockName={blockName} />
                {historicoIds.length > 0 && <BackButton onClick={handleBack} />}
                <React.Suspense fallback={<div style={{ padding: 'var(--space-6)' }}>Carregando etapa...</div>}>
                  {StepComponent && (
                    <StepComponent
                      estado={estado}
                      onSelect={handleSelect}
                      onConcluir={handleConcluirMemorial}
                      disabled={modalAuthAberto && noAtual?.componente === 'Step00Casal'}
                      {...stepProps}
                    />
                  )}
                </React.Suspense>
                {!noAtualId && <Footer />}
              </BreathTransition>
            </>
          )}
        </>
      )}
    </div>
  );
}