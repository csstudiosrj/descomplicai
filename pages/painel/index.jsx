import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { importarPreFornecedores } from '../../utils/preFornecedores';

export default function PainelPage() {
  return (
    <ProtectedRoute>
      <PainelContent />
    </ProtectedRoute>
  );
}

function PainelContent() {
  const router = useRouter();
  const { user, evento, hasAccess } = useAuth();
  const [loading, setLoading] = useState(true);

  const [progresso, setProgresso] = useState(0);
  const [fornecedores, setFornecedores] = useState({ total: 0, contratados: 0, pagos: 0, preCriados: 0 });
  const [financeiro, setFinanceiro] = useState({ orcamento: 0, comprometido: 0, pago: 0 });
  const [convidados, setConvidados] = useState({ total: 0, confirmados: 0 });
  const [tarefas, setTarefas] = useState({ total: 0, concluidas: 0, urgentes: [] });
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    if (!evento || !user) return;
    carregarDashboard();
  }, [evento, user]);

  const carregarDashboard = async () => {
    setLoading(true);
    const eventoId = evento.id;

    // Importa pré-fornecedores do memorial (tabela memoriais)
    await importarPreFornecedores(eventoId, supabase, user.id);

    // Fornecedores
    const { data: fornData } = await supabase
      .from('fornecedores')
      .select('status, valor_total, pre_criado, nome')
      .eq('evento_id', eventoId);

    const fornTotal = fornData?.length || 0;
    const fornContratados = fornData?.filter(f => f.status === 'contratado' || f.status === 'pago').length || 0;
    const fornPagos = fornData?.filter(f => f.status === 'pago').length || 0;
    const fornPreCriados = fornData?.filter(f => f.pre_criado === true).length || 0;
    const fornComprometido = fornData?.reduce((acc, f) => acc + (Number(f.valor_total) || 0), 0) || 0;

    setFornecedores({ total: fornTotal, contratados: fornContratados, pagos: fornPagos, preCriados: fornPreCriados });

    // Financeiro
    const { data: finData } = await supabase
      .from('financeiro')
      .select('valor_estimado, valor_real, pago, data_vencimento')
      .eq('evento_id', eventoId)
      .eq('fornecedor_excluido', false);

    const finPago = finData?.filter(f => f.pago).reduce((acc, f) => acc + (Number(f.valor_real) || 0), 0) || 0;
    const finComprometido = finData?.reduce((acc, f) => acc + (Number(f.valor_estimado) || 0), 0) || 0;
    const orcamento = Number(evento?.orcamento) || 0;

    setFinanceiro({ orcamento, comprometido: finComprometido, pago: finPago });

    // Convidados
    const { data: convData } = await supabase
      .from('convidados')
      .select('status')
      .eq('evento_id', eventoId);

    const convTotal = convData?.length || 0;
    const convConfirmados = convData?.filter(c => c.status === 'confirmado').length || 0;

    setConvidados({ total: convTotal, confirmados: convConfirmados });

    // Tarefas
    const { data: tarData } = await supabase
      .from('tarefas')
      .select('*')
      .eq('evento_id', eventoId)
      .order('prazo', { ascending: true });

    const hoje = new Date();
    const tarTotal = tarData?.length || 0;
    const tarConcluidas = tarData?.filter(t => t.concluida).length || 0;

    const tarComStatus = tarData?.map(t => {
      const prazo = t.prazo ? new Date(t.prazo) : null;
      const dias = prazo ? Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24)) : null;
      return { ...t, dias, atrasada: prazo && dias < 0 && !t.concluida };
    }) || [];

    const tarUrgentes = tarComStatus.filter(t => t.atrasada || (t.dias !== null && t.dias <= 7 && !t.concluida));

    setTarefas({ total: tarTotal, concluidas: tarConcluidas, urgentes: tarUrgentes });

    // Progresso: denominador = max(pré-criados, contratados) — não piora com adições
    const denomForn = Math.max(fornPreCriados, fornContratados) || 1;
    const progressoForn = Math.min(100, Math.round((fornContratados / denomForn) * 100));
    const progressoTar = tarTotal > 0 ? Math.round((tarConcluidas / tarTotal) * 100) : 0;

    let pesoForn = fornPreCriados > 0 || fornContratados > 0 ? 1 : 0;
    let pesoTar = tarTotal > 0 ? 1 : 0;
    const pesoTotal = pesoForn + pesoTar;

    const progressoGeral = pesoTotal > 0
      ? Math.round((progressoForn * pesoForn + progressoTar * pesoTar) / pesoTotal)
      : 0;

    setProgresso(progressoGeral);

    // Alertas
    const alertasLista = [];

    const atrasadas = tarUrgentes.filter(t => t.atrasada);
    if (atrasadas.length > 0) {
      alertasLista.push({
        tipo: 'urgente', icone: 'alert', cor: '#C62828',
        titulo: `${atrasadas.length} tarefa${atrasadas.length > 1 ? 's' : ''} atrasada${atrasadas.length > 1 ? 's' : ''}`,
        descricao: 'Precisa de atenção imediata', link: '/painel/checklist',
      });
    }

    const prePendentes = fornData?.filter(f => f.pre_criado && !f.nome).length || 0;
    if (prePendentes > 0) {
      alertasLista.push({
        tipo: 'aviso', icone: 'store', cor: '#8B6F5E',
        titulo: `${prePendentes} fornecedor${prePendentes > 1 ? 'es' : ''} do memorial`,
        descricao: 'Aguardando informações — clique para preencher', link: '/painel/fornecedores',
      });
    }

    const vencendo = finData?.filter(f => {
      if (f.pago) return false;
      const venc = f.data_vencimento ? new Date(f.data_vencimento) : null;
      if (!venc) return false;
      const dias = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
      return dias <= 7 && dias >= 0;
    }) || [];

    if (vencendo.length > 0) {
      alertasLista.push({
        tipo: 'aviso', icone: 'dollar', cor: '#F9A825',
        titulo: `${vencendo.length} pagamento${vencendo.length > 1 ? 's' : ''} vencendo`,
        descricao: 'Próximos 7 dias', link: '/painel/financeiro',
      });
    }

    if (evento?.data_evento) {
      const dataEvento = new Date(evento.data_evento);
      const mesesAteEvento = (dataEvento - hoje) / (1000 * 60 * 60 * 24 * 30);
      if (mesesAteEvento <= 6 && mesesAteEvento > 0) {
        const criticos = ['fotografia', 'filmagem', 'espaco_recepcao', 'buffet'];
        const faltando = criticos.filter(c => !fornData?.some(f => f.categoria === c && (f.status === 'contratado' || f.status === 'pago')));
        if (faltando.length > 0) {
          alertasLista.push({
            tipo: 'aviso', icone: 'store', cor: '#8B6F5E',
            titulo: `${faltando.length} fornecedor${faltando.length > 1 ? 'es' : ''} crítico${faltando.length > 1 ? 's' : ''} faltando`,
            descricao: 'Menos de 6 meses para o casamento', link: '/painel/fornecedores',
          });
        }
      }
    }

    setAlertas(alertasLista.slice(0, 3));
    setLoading(false);
  };

  const nomeCasal = evento?.nome_evento || '';

  return (
    <>
      <Head><title>Painel | descomplicaí</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={styles.main}>
          {!hasAccess && (
            <div style={styles.readOnlyBanner}>
              <span style={styles.readOnlyText}>Acesso expirado. Modo somente leitura. Assine para editar.</span>
            </div>
          )}

          <section style={styles.progressoSection}>
            <div style={styles.progressoHeader}>
              <span style={styles.progressoLabel}>Progresso do planejamento</span>
              <span style={styles.progressoValor}>{progresso}%</span>
            </div>
            <div style={styles.progressoBarraBg}>
              <div style={{ ...styles.progressoBarraFill, width: `${progresso}%` }} />
            </div>
          </section>

          {alertas.length > 0 && (
            <section style={styles.alertasSection}>
              {alertas.map((a, i) => (
                <button key={i} onClick={() => router.push(a.link)} style={{ ...styles.alertaCard, borderLeftColor: a.cor }}>
                  <div style={{ ...styles.alertaIcone, background: a.cor }}>
                    <Icon name={a.icone} size={16} color="#fff" />
                  </div>
                  <div style={styles.alertaTexto}>
                    <span style={styles.alertaTitulo}>{a.titulo}</span>
                    <span style={styles.alertaDescricao}>{a.descricao}</span>
                  </div>
                  <Icon name="arrowRight" size={16} color="var(--color-text-soft)" />
                </button>
              ))}
            </section>
          )}

          <section style={styles.cardsSection}>
            <div style={styles.cardsGrid}>
              <button onClick={() => router.push('/painel/fornecedores')} style={styles.cardRapido}>
                <div style={styles.cardRapidoIcone}><Icon name="store" size={24} color="#8B6F5E" /></div>
                <div style={styles.cardRapidoInfo}>
                  <span style={styles.cardRapidoNumero}>{fornecedores.contratados}<span style={styles.cardRapidoDe}> de </span>{fornecedores.total}</span>
                  <span style={styles.cardRapidoLabel}>Fornecedores contratados</span>
                </div>
              </button>
              <button onClick={() => router.push('/painel/financeiro')} style={styles.cardRapido}>
                <div style={styles.cardRapidoIcone}><Icon name="dollar" size={24} color="#2E7D32" /></div>
                <div style={styles.cardRapidoInfo}>
                  <span style={styles.cardRapidoNumero}>R$ {financeiro.comprometido.toLocaleString('pt-BR')}<span style={styles.cardRapidoDe}> de </span>R$ {financeiro.orcamento.toLocaleString('pt-BR')}</span>
                  <span style={styles.cardRapidoLabel}>Orçamento comprometido</span>
                </div>
              </button>
              <button onClick={() => router.push('/painel/convidados')} style={styles.cardRapido}>
                <div style={styles.cardRapidoIcone}><Icon name="users" size={24} color="#00838F" /></div>
                <div style={styles.cardRapidoInfo}>
                  <span style={styles.cardRapidoNumero}>{convidados.confirmados}<span style={styles.cardRapidoDe}> de </span>{convidados.total}</span>
                  <span style={styles.cardRapidoLabel}>Convidados confirmados</span>
                </div>
              </button>
              <button onClick={() => router.push('/painel/checklist')} style={styles.cardRapido}>
                <div style={styles.cardRapidoIcone}><Icon name="checklist" size={24} color="#F9A825" /></div>
                <div style={styles.cardRapidoInfo}>
                  <span style={styles.cardRapidoNumero}>{tarefas.concluidas}<span style={styles.cardRapidoDe}> de </span>{tarefas.total}</span>
                  <span style={styles.cardRapidoLabel}>Tarefas concluídas</span>
                </div>
              </button>
            </div>
          </section>

          {(tarefas.urgentes.length > 0) && (
            <section style={styles.proximasSection}>
              <h2 style={styles.sectionTitle}>Próximas ações</h2>
              <div style={styles.proximasLista}>
                {tarefas.urgentes.slice(0, 3).map((t) => (
                  <div key={t.id} style={{ ...styles.proximaItem, borderLeftColor: t.atrasada ? '#C62828' : '#F9A825' }}>
                    <div style={styles.proximaHeader}>
                      <span style={styles.proximaTitulo}>{t.titulo}</span>
                      <span style={{ ...styles.proximaPrazo, color: t.atrasada ? '#C62828' : '#F9A825' }}>
                        {t.atrasada ? `Atrasada ${Math.abs(t.dias)}d` : `Em ${t.dias}d`}
                      </span>
                    </div>
                    <span style={styles.proximaCategoria}>{t.categoria || 'Geral'}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/painel/checklist')} style={styles.verTodas}>Ver checklist completo →</button>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)', paddingTop: '52px' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '24px' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
  progressoSection: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)' },
  progressoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  progressoLabel: { fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-primary)', fontWeight: 600 },
  progressoValor: { fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-brand)', fontWeight: 700 },
  progressoBarraBg: { width: '100%', height: '8px', background: 'var(--color-secondary)', borderRadius: '4px', overflow: 'hidden' },
  progressoBarraFill: { height: '100%', background: '#8B6F5E', borderRadius: '4px', transition: 'width 500ms ease' },
  alertasSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  alertaCard: { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '1px solid var(--color-secondary)', borderLeftWidth: '4px', cursor: 'pointer', textAlign: 'left', width: '100%' },
  alertaIcone: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertaTexto: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  alertaTitulo: { fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' },
  alertaDescricao: { fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-soft)' },
  cardsSection: {},
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  cardRapido: { display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)', cursor: 'pointer', textAlign: 'left', alignItems: 'flex-start' },
  cardRapidoIcone: { width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-fundo)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardRapidoInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  cardRapidoNumero: { fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-text)', fontWeight: 700 },
  cardRapidoDe: { fontSize: '14px', color: 'var(--color-text-soft)', fontWeight: 400 },
  cardRapidoLabel: { fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-soft)' },
  proximasSection: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '12px' },
  proximasLista: { display: 'flex', flexDirection: 'column', gap: '8px' },
  proximaItem: { padding: '12px 14px', borderRadius: '8px', background: 'var(--color-fundo)', borderLeftWidth: '3px', borderLeftStyle: 'solid' },
  proximaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  proximaTitulo: { fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' },
  proximaPrazo: { fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500 },
  proximaCategoria: { fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-soft)' },
  verTodas: { marginTop: '12px', background: 'none', border: 'none', color: '#8B6F5E', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '0', textAlign: 'left' },
};