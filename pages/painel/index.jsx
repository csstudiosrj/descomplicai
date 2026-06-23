import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import NavCards from '../../components/painel/NavCards';
import AlertCards from '../../components/painel/AlertCards';
import Icon from '../../components/ui/Icon';
import InputMoeda from '../../components/ui/InputMoeda';
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

  // NOVO: status do memorial para alerta inteligente
  const [memorialStatus, setMemorialStatus] = useState({ temMemorial: false, temEstado: false });

  // Modal de orçamento (legado, via ícone no card financeiro)
  const [modalOrcamentoAberto, setModalOrcamentoAberto] = useState(false);
  const [valorOrcamento, setValorOrcamento] = useState(0);
  const [salvandoOrcamento, setSalvandoOrcamento] = useState(false);

  // Modal de edição do evento
  const [modalEventoAberto, setModalEventoAberto] = useState(false);
  const [formEvento, setFormEvento] = useState({ nome_evento: '', data_evento: '', orcamento: 0 });
  const [salvandoEvento, setSalvandoEvento] = useState(false);

  useEffect(() => {
    if (!evento || !user) return;
    carregarDashboard();
  }, [evento, user]);

  useEffect(() => {
    if (modalOrcamentoAberto && evento) {
      const valor = Number(evento.orcamento) || Number(evento.orcamento_total) || 0;
      setValorOrcamento(valor);
    }
  }, [modalOrcamentoAberto, evento]);

  useEffect(() => {
    if (modalEventoAberto && evento) {
      setFormEvento({
        nome_evento: evento.nome_evento || '',
        data_evento: evento.data_evento || '',
        orcamento: Number(evento.orcamento) || Number(evento.orcamento_total) || 0,
      });
    }
  }, [modalEventoAberto, evento]);

  const carregarDashboard = async () => {
    setLoading(true);
    const eventoId = evento.id;

    // --- NOVO: Verifica memorial do evento ---
    const { data: memorialData } = await supabase
      .from('memoriais')
      .select('id, estado')
      .eq('evento_id', eventoId)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    const temMemorial = !!memorialData;
    const temEstado = temMemorial && !!memorialData.estado;
    setMemorialStatus({ temMemorial, temEstado });

    // Só importa pre-fornecedores se tiver estado estruturado
    if (temEstado) {
      await importarPreFornecedores(eventoId, supabase, user.id);
    }

    const { data: fornData } = await supabase
      .from('fornecedores')
      .select('status, valor_total, pre_criado, nome, categoria')
      .eq('evento_id', eventoId);

    const fornTotal = fornData?.length || 0;
    const fornContratados = fornData?.filter(f => f.status === 'contratado' || f.status === 'pago').length || 0;
    const fornPagos = fornData?.filter(f => f.status === 'pago').length || 0;
    const fornPreCriados = fornData?.filter(f => f.pre_criado === true).length || 0;

    setFornecedores({ total: fornTotal, contratados: fornContratados, pagos: fornPagos, preCriados: fornPreCriados });

    const { data: finData } = await supabase
      .from('financeiro')
      .select('valor_estimado, valor_real, pago, data_vencimento')
      .eq('evento_id', eventoId)
      .eq('fornecedor_excluido', false);

    const finPago = finData?.filter(f => f.pago).reduce((acc, f) => acc + (Number(f.valor_real) || 0), 0) || 0;
    const finComprometido = finData?.reduce((acc, f) => acc + (Number(f.valor_estimado) || 0), 0) || 0;
    const orcamento = Number(evento?.orcamento) || Number(evento?.orcamento_total) || 0;

    setFinanceiro({ orcamento, comprometido: finComprometido, pago: finPago });

    const { data: convData } = await supabase
      .from('convidados')
      .select('confirmado')
      .eq('evento_id', eventoId);

    const convTotal = convData?.length || 0;
    const convConfirmados = convData?.filter(c => c.confirmado === 'confirmado').length || 0;

    setConvidados({ total: convTotal, confirmados: convConfirmados });

    const { data: tarData } = await supabase
      .from('tarefas')
      .select('*')
      .eq('evento_id', eventoId)
      .order('prazo', { ascending: true });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const tarTotal = tarData?.length || 0;
    const tarConcluidas = tarData?.filter(t => t.concluida).length || 0;

    const tarComStatus = tarData?.map(t => {
      const prazo = t.prazo ? new Date(t.prazo + 'T00:00:00') : null;
      const dias = prazo ? Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24)) : null;
      return { ...t, dias, atrasada: prazo && dias < 0 && !t.concluida };
    }) || [];

    const tarUrgentes = tarComStatus.filter(t => t.atrasada || (t.dias !== null && t.dias <= 7 && !t.concluida));

    setTarefas({ total: tarTotal, concluidas: tarConcluidas, urgentes: tarUrgentes });

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

    const alertasLista = [];

    // NOVO: Alerta memorial não preenchido
    if (!temEstado) {
      alertasLista.push({
        tipo: 'urgente',
        icone: 'fileText',
        cor: 'var(--color-danger)',
        titulo: 'Complete o memorial para ativar o painel inteligente',
        descricao: 'O questionário estruturado alimenta tarefas, fornecedores e orçamento. Clique para preencher.',
        onClick: () => router.push('/memorial'),
      });
    }

    // Alerta: dados do evento incompletos
    const dadosIncompletos = !evento?.data_evento || !evento?.orcamento || !evento?.nome_evento;
    if (dadosIncompletos) {
      const faltando = [];
      if (!evento?.nome_evento) faltando.push('nome do casal');
      if (!evento?.data_evento) faltando.push('data do evento');
      if (!evento?.orcamento) faltando.push('orçamento');
      alertasLista.push({
        tipo: 'aviso',
        icone: 'info',
        cor: 'var(--color-warning)',
        titulo: 'Complete os dados do seu casamento',
        descricao: `Faltando: ${faltando.join(', ')} — clique para preencher`,
        onClick: () => setModalEventoAberto(true),
      });
    }

    const atrasadas = tarUrgentes.filter(t => t.atrasada);
    if (atrasadas.length > 0) {
      alertasLista.push({
        tipo: 'urgente', icone: 'alert', cor: 'var(--color-danger)',
        titulo: `${atrasadas.length} tarefa${atrasadas.length > 1 ? 's' : ''} atrasada${atrasadas.length > 1 ? 's' : ''}`,
        descricao: 'Precisa de atenção imediata', onClick: () => router.push('/painel/checklist'),
      });
    }

    const prePendentes = fornData?.filter(f => f.pre_criado && !f.nome).length || 0;
    if (prePendentes > 0) {
      alertasLista.push({
        tipo: 'aviso', icone: 'store', cor: 'var(--color-brand)',
        titulo: `${prePendentes} fornecedor${prePendentes > 1 ? 'es' : ''} do memorial`,
        descricao: 'Aguardando informações — clique para preencher', onClick: () => router.push('/painel/fornecedores'),
      });
    }

    const vencendo = finData?.filter(f => {
      if (f.pago) return false;
      const venc = f.data_vencimento ? new Date(f.data_vencimento + 'T00:00:00') : null;
      if (!venc) return false;
      const dias = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
      return dias <= 7 && dias >= 0;
    }) || [];

    if (vencendo.length > 0) {
      alertasLista.push({
        tipo: 'aviso', icone: 'dollar', cor: 'var(--color-warning)',
        titulo: `${vencendo.length} pagamento${vencendo.length > 1 ? 's' : ''} vencendo`,
        descricao: 'Próximos 7 dias', onClick: () => router.push('/painel/financeiro'),
      });
    }

    if (evento?.data_evento) {
      const dataEvento = new Date(evento.data_evento + 'T00:00:00');
      const mesesAteEvento = (dataEvento - hoje) / (1000 * 60 * 60 * 24 * 30);
      if (mesesAteEvento <= 6 && mesesAteEvento > 0) {
        const criticos = ['fotografia', 'filmagem', 'espaco_recepcao', 'buffet'];
        const faltando = criticos.filter(c => !fornData?.some(f => f.categoria === c && (f.status === 'contratado' || f.status === 'pago')));
        if (faltando.length > 0) {
          alertasLista.push({
            tipo: 'aviso', icone: 'store', cor: 'var(--color-brand)',
            titulo: `${faltando.length} fornecedor${faltando.length > 1 ? 'es' : ''} crítico${faltando.length > 1 ? 's' : ''} faltando`,
            descricao: 'Menos de 6 meses para o casamento', onClick: () => router.push('/painel/fornecedores'),
          });
        }
      }
    }

    setAlertas(alertasLista.slice(0, 4));
    setLoading(false);
  };

  const abrirModalOrcamento = (e) => {
    e.stopPropagation();
    if (!hasAccess) return;
    setModalOrcamentoAberto(true);
  };

  const salvarOrcamento = async () => {
    if (!hasAccess || !evento) return;
    const valor = Number(valorOrcamento);
    if (isNaN(valor) || valor < 0) {
      alert('Informe um valor válido');
      return;
    }
    setSalvandoOrcamento(true);
    const { error } = await supabase
      .from('eventos')
      .update({ orcamento: valor })
      .eq('id', evento.id);
    setSalvandoOrcamento(false);
    if (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento');
      return;
    }
    setFinanceiro(prev => ({ ...prev, orcamento: valor }));
    setModalOrcamentoAberto(false);
  };

  const salvarEvento = async () => {
    if (!hasAccess || !evento) return;
    setSalvandoEvento(true);

    const payload = {};
    if (formEvento.nome_evento !== undefined) payload.nome_evento = formEvento.nome_evento;
    if (formEvento.data_evento !== undefined) payload.data_evento = formEvento.data_evento || null;
    if (formEvento.orcamento !== undefined) payload.orcamento = Number(formEvento.orcamento) || 0;

    const { error } = await supabase
      .from('eventos')
      .update(payload)
      .eq('id', evento.id);

    setSalvandoEvento(false);
    if (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar dados do evento');
      return;
    }

    setModalEventoAberto(false);
    window.location.reload();
  };

  const nomeCasal = evento?.nome_evento || '';
  const dadosEventoCompletos = evento?.data_evento && evento?.orcamento && evento?.nome_evento;

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

          {/* Seção Meu Casamento */}
          <section style={styles.meuCasamentoSection}>
            <div style={styles.meuCasamentoHeader}>
              <div style={styles.meuCasamentoIcone}>
                <Icon name="calendar" size={20} color="var(--color-brand)" />
              </div>
              <div style={styles.meuCasamentoTituloWrap}>
                <h2 style={styles.meuCasamentoTitulo}>Meu Casamento</h2>
                <p style={styles.meuCasamentoSubtitulo}>
                  {dadosEventoCompletos
                    ? 'Informações do seu evento'
                    : 'Preencha os dados para ativar todas as funcionalidades'}
                </p>
              </div>
              {hasAccess && (
                <button
                  onClick={() => setModalEventoAberto(true)}
                  style={styles.btnEditarEvento}
                >
                  <Icon name="edit" size={14} color="var(--color-brand)" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            <div style={styles.meuCasamentoGrid}>
              <div style={styles.meuCasamentoItem}>
                <span style={styles.meuCasamentoLabel}>Nome</span>
                <span style={styles.meuCasamentoValor}>
                  {evento?.nome_evento || <span style={styles.valorVazio}>Não definido</span>}
                </span>
              </div>
              <div style={styles.meuCasamentoItem}>
                <span style={styles.meuCasamentoLabel}>Data</span>
                <span style={styles.meuCasamentoValor}>
                  {evento?.data_evento
                    ? (() => {
                        const [ano, mes, dia] = evento.data_evento.split('-');
                        return `${dia}/${mes}/${ano}`;
                      })()
                    : <span style={styles.valorVazio}>Não definida</span>
                  }
                </span>
              </div>
              <div style={styles.meuCasamentoItem}>
                <span style={styles.meuCasamentoLabel}>Orçamento</span>
                <span style={styles.meuCasamentoValor}>
                  {evento?.orcamento
                    ? `R$ ${Number(evento.orcamento).toLocaleString('pt-BR')}`
                    : <span style={styles.valorVazio}>Não definido</span>
                  }
                </span>
              </div>
            </div>
          </section>

          {/* Progresso */}
          <section style={styles.progressoSection}>
            <div style={styles.progressoHeader}>
              <span style={styles.progressoLabel}>Progresso do planejamento</span>
              <span style={styles.progressoValor}>{progresso}%</span>
            </div>
            <div style={styles.progressoBarraBg}>
              <div style={{ ...styles.progressoBarraFill, width: `${progresso}%` }} />
            </div>
          </section>

          {/* Alertas */}
          <section>
            <AlertCards alertas={alertas} />
          </section>

          {/* Cards rápidos com métricas */}
          <section style={styles.cardsSection}>
            <h2 style={styles.sectionTitle}>Resumo</h2>
            <div style={styles.cardsGrid}>
              <button onClick={() => router.push('/painel/fornecedores')} style={styles.cardRapido}>
                <div style={styles.cardRapidoIcone}>
                  <Icon name="store" size={24} color="var(--color-brand)" />
                </div>
                <div style={styles.cardRapidoInfo}>
                  <span style={styles.cardRapidoNumero}>{fornecedores.contratados}<span style={styles.cardRapidoDe}> de </span>{fornecedores.total}</span>
                  <span style={styles.cardRapidoLabel}>Fornecedores contratados</span>
                </div>
              </button>

              <button onClick={() => router.push('/painel/financeiro')} style={{ ...styles.cardRapido, position: 'relative' }}>
                {hasAccess && (
                  <div onClick={abrirModalOrcamento} style={styles.btnEditar} title="Ajustar orçamento">
                    <Icon name="edit" size={14} color="var(--color-text-muted)" />
                  </div>
                )}
                <div style={styles.cardRapidoIcone}>
                  <Icon name="dollar" size={24} color="var(--color-success)" />
                </div>
                <div style={styles.cardRapidoInfo}>
                  <span style={styles.cardRapidoNumero}>R$ {financeiro.comprometido.toLocaleString('pt-BR')}<span style={styles.cardRapidoDe}> de </span>R$ {financeiro.orcamento.toLocaleString('pt-BR')}</span>
                  <span style={styles.cardRapidoLabel}>Orçamento comprometido</span>
                </div>
              </button>

              <button onClick={() => router.push('/painel/convidados')} style={styles.cardRapido}>
                <div style={styles.cardRapidoIcone}>
                  <Icon name="users" size={24} color="var(--color-info)" />
                </div>
                <div style={styles.cardRapidoInfo}>
                  <span style={styles.cardRapidoNumero}>{convidados.confirmados}<span style={styles.cardRapidoDe}> de </span>{convidados.total}</span>
                  <span style={styles.cardRapidoLabel}>Convidados confirmados</span>
                </div>
              </button>

              <button onClick={() => router.push('/painel/checklist')} style={styles.cardRapido}>
                <div style={styles.cardRapidoIcone}>
                  <Icon name="checklist" size={24} color="var(--color-warning)" />
                </div>
                <div style={styles.cardRapidoInfo}>
                  <span style={styles.cardRapidoNumero}>{tarefas.concluidas}<span style={styles.cardRapidoDe}> de </span>{tarefas.total}</span>
                  <span style={styles.cardRapidoLabel}>Tarefas concluídas</span>
                </div>
              </button>
            </div>
          </section>

          {/* Navegação */}
          <section style={styles.navSection}>
            <h2 style={styles.sectionTitle}>Acessar módulos</h2>
            <NavCards />
          </section>

          {/* Próximas ações */}
          {(tarefas.urgentes.length > 0) && (
            <section style={styles.proximasSection}>
              <h2 style={styles.sectionTitle}>Próximas ações</h2>
              <div style={styles.proximasLista}>
                {tarefas.urgentes.slice(0, 3).map((t) => (
                  <div key={t.id} style={{ ...styles.proximaItem, borderLeftColor: t.atrasada ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                    <div style={styles.proximaHeader}>
                      <span style={styles.proximaTitulo}>{t.titulo}</span>
                      <span style={{ ...styles.proximaPrazo, color: t.atrasada ? 'var(--color-danger)' : 'var(--color-warning)' }}>
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

      {/* Modal de orçamento (legado) */}
      {modalOrcamentoAberto && (
        <div style={styles.modalOverlay} onClick={() => setModalOrcamentoAberto(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Definir orçamento</h2>
            <p style={styles.modalDesc}>Informe o valor total planejado para o casamento.</p>
            <div style={styles.inputWrapper}>
              <InputMoeda value={valorOrcamento} onChange={(v) => setValorOrcamento(v)} />
            </div>
            <div style={styles.modalBotoes}>
              <button onClick={() => setModalOrcamentoAberto(false)} style={styles.btnCancel}>Cancelar</button>
              <button onClick={salvarOrcamento} disabled={salvandoOrcamento} style={{ ...styles.btnSave, opacity: salvandoOrcamento ? 0.6 : 1 }}>
                {salvandoOrcamento ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição do evento */}
      {modalEventoAberto && (
        <div style={styles.modalOverlay} onClick={() => setModalEventoAberto(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Dados do casamento</h2>
            <p style={styles.modalDesc}>Edite as informações principais do seu evento.</p>

            <div style={styles.inputWrapper}>
              <label style={styles.inputLabel}>Nome do casal / Evento *</label>
              <input
                type="text"
                placeholder="Ex: Ana & João"
                value={formEvento.nome_evento}
                onChange={(e) => setFormEvento(prev => ({ ...prev, nome_evento: e.target.value }))}
                style={styles.input}
              />
            </div>

            <div style={styles.inputWrapper}>
              <label style={styles.inputLabel}>Data do evento *</label>
              <input
                type="date"
                value={formEvento.data_evento}
                onChange={(e) => setFormEvento(prev => ({ ...prev, data_evento: e.target.value }))}
                style={styles.input}
              />
            </div>

            <div style={styles.inputWrapper}>
              <label style={styles.inputLabel}>Orçamento total *</label>
              <InputMoeda
                value={formEvento.orcamento}
                onChange={(v) => setFormEvento(prev => ({ ...prev, orcamento: v }))}
              />
            </div>

            <div style={styles.modalBotoes}>
              <button onClick={() => setModalEventoAberto(false)} style={styles.btnCancel}>Cancelar</button>
              <button onClick={salvarEvento} disabled={salvandoEvento} style={{ ...styles.btnSave, opacity: salvandoEvento ? 0.6 : 1 }}>
                {salvandoEvento ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-off-white)', paddingTop: '52px' },
  main: { maxWidth: '960px', margin: '0 auto', padding: 'var(--space-6) var(--space-4) var(--space-12)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' },

  readOnlyBanner: { background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', textAlign: 'center' },
  readOnlyText: { fontSize: 'var(--text-sm)', color: 'var(--color-warning)', fontFamily: 'var(--font-body)' },

  // Meu Casamento
  meuCasamentoSection: { background: 'var(--color-white)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', border: '1px solid var(--color-border)' },
  meuCasamentoHeader: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' },
  meuCasamentoIcone: { width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--color-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  meuCasamentoTituloWrap: { flex: 1 },
  meuCasamentoTitulo: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-brand)', margin: 0, fontWeight: 'var(--font-normal)' },
  meuCasamentoSubtitulo: { fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' },
  btnEditarEvento: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-off-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-brand)', fontWeight: 'var(--font-medium)' },
  meuCasamentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' },
  meuCasamentoItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  meuCasamentoLabel: { fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  meuCasamentoValor: { fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-semibold)' },
  valorVazio: { color: 'var(--color-text-muted)', fontStyle: 'italic' },

  // Progresso
  progressoSection: { background: 'var(--color-white)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' },
  progressoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' },
  progressoLabel: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-semibold)' },
  progressoValor: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-brand)', fontWeight: 'var(--font-bold)' },
  progressoBarraBg: { width: '100%', height: '8px', background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' },
  progressoBarraFill: { height: '100%', background: 'var(--color-brand)', borderRadius: 'var(--radius-full)', transition: 'width 500ms ease' },

  // Cards
  cardsSection: {},
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-brand)', fontWeight: 'var(--font-normal)', marginBottom: 'var(--space-3)' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' },
  cardRapido: { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'var(--color-white)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left', alignItems: 'flex-start' },
  btnEditar: { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', zIndex: 2 },
  cardRapidoIcone: { width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--color-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardRapidoInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  cardRapidoNumero: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-bold)' },
  cardRapidoDe: { fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-normal)' },
  cardRapidoLabel: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' },

  // Navegação
  navSection: {},

  // Próximas ações
  proximasSection: { background: 'var(--color-white)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' },
  proximasLista: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' },
  proximaItem: { padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'var(--color-off-white)', borderLeftWidth: '3px', borderLeftStyle: 'solid' },
  proximaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  proximaTitulo: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' },
  proximaPrazo: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)' },
  proximaCategoria: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' },
  verTodas: { marginTop: 'var(--space-3)', background: 'none', border: 'none', color: 'var(--color-brand)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', cursor: 'pointer', padding: '0', textAlign: 'left' },

  // Modais
  modalOverlay: { position: 'fixed', inset: 0, background: 'var(--color-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 'var(--z-modal)', padding: 'var(--space-4)' },
  modal: { background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-brand)', marginBottom: '6px' },
  modalDesc: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' },
  inputWrapper: { marginBottom: 'var(--space-4)' },
  inputLabel: { display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border-strong)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', background: 'var(--color-white)', outline: 'none', boxSizing: 'border-box' },
  modalBotoes: { display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' },
  btnCancel: { background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: 'none', padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 'var(--text-sm)' },
  btnSave: { background: 'var(--color-brand)', color: 'var(--color-white)', border: 'none', padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' },
};