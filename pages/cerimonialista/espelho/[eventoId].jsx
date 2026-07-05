import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import fetchAPI from '../../../utils/fetchAPI';

export default function EspelhoEvento() {
  const router = useRouter();
  const { eventoId } = router.query;
  const { user, loading, cerimonialista, isCerimonialista, signOut } = useAuth();

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!eventoId || !user) return;
    buscarDados();
  }, [eventoId, user]);

  const buscarDados = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setErro('Sessão expirada');
        setCarregando(false);
        return;
      }

      const res = await fetchAPI(`/api/cerimonialista/espelho/${eventoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        setErro(err.error || 'Erro ao carregar dados');
        setCarregando(false);
        return;
      }

      const json = await res.json();
      setDados(json);
    } catch (err) {
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Carregando...</p>
      </div>
    );
  }

  if (!isCerimonialista || !cerimonialista) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-warning)" />
          <h2 style={styles.tituloRestrito}>Acesso restrito</h2>
          <p style={styles.descricaoRestrita}>Esta área é exclusiva para cerimonialistas.</p>
          <Button variant="primary" onClick={() => router.push('/painel')} style={{ marginTop: 'var(--space-6)' }}>
            Ir para o painel do casal
          </Button>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-danger)" />
          <h2 style={styles.tituloRestrito}>{erro}</h2>
          <Button variant="secondary" onClick={buscarDados} style={{ marginTop: 'var(--space-4)' }}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (carregando || !dados) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Carregando dados do evento...</p>
      </div>
    );
  }

  const { evento, permissoes, fornecedores, financeiro, tarefas, convidados, mensagens, memorial, mesas } = dados;

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Não definida';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const calcularDiasRestantes = (dataStr) => {
    if (!dataStr) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataEvento = new Date(dataStr + 'T00:00:00');
    return Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));
  };

  const dias = calcularDiasRestantes(evento.data_evento);

  // Métricas
  const fornTotal = fornecedores?.length || 0;
  const fornContratados = fornecedores?.filter((f) => f.status === 'contratado' || f.status === 'pago').length || 0;
  const fornPagos = fornecedores?.filter((f) => f.status === 'pago').length || 0;

  const finPago = financeiro?.filter((f) => f.pago).reduce((acc, f) => acc + (Number(f.valor_real) || 0), 0) || 0;
  const finComprometido = financeiro?.reduce((acc, f) => acc + (Number(f.valor_estimado) || 0), 0) || 0;

  const convTotal = convidados?.length || 0;
  const convConfirmados = convidados?.filter((c) => c.confirmado === 'confirmado').length || 0;

  const tarTotal = tarefas?.length || 0;
  const tarConcluidas = tarefas?.filter((t) => t.concluida).length || 0;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const tarUrgentes = tarefas
    ?.map((t) => {
      const prazo = t.prazo ? new Date(t.prazo + 'T00:00:00') : null;
      const diasDiff = prazo ? Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24)) : null;
      return { ...t, dias: diasDiff, atrasada: prazo && diasDiff < 0 && !t.concluida };
    })
    .filter((t) => t.atrasada || (t.dias !== null && t.dias <= 7 && !t.concluida)) || [];

  const progressoForn = fornTotal > 0 ? Math.round((fornContratados / fornTotal) * 100) : 0;
  const progressoTar = tarTotal > 0 ? Math.round((tarConcluidas / tarTotal) * 100) : 0;
  const pesoForn = fornTotal > 0 ? 1 : 0;
  const pesoTar = tarTotal > 0 ? 1 : 0;
  const pesoTotal = pesoForn + pesoTar;
  const progressoGeral = pesoTotal > 0 ? Math.round((progressoForn * pesoForn + progressoTar * pesoTar) / pesoTotal) : 0;

  const modulosDisponiveis = [
    { key: 'fornecedores', label: 'Fornecedores', ver: permissoes.ver_fornecedores, editar: permissoes.editar_fornecedores, icone: 'store', cor: 'var(--color-brand)' },
    { key: 'financeiro', label: 'Financeiro', ver: permissoes.ver_financeiro, editar: permissoes.editar_financeiro, icone: 'dollar', cor: 'var(--color-success)' },
    { key: 'tarefas', label: 'Tarefas', ver: permissoes.ver_tarefas, editar: permissoes.editar_tarefas, icone: 'checklist', cor: 'var(--color-warning)' },
    { key: 'convidados', label: 'Convidados', ver: permissoes.ver_convidados, editar: permissoes.editar_convidados, icone: 'users', cor: 'var(--color-info)' },
    { key: 'chat', label: 'Chat', ver: permissoes.ver_chat, editar: permissoes.editar_chat, icone: 'chat', cor: 'var(--color-brand)' },
    { key: 'cronograma', label: 'Cronograma', ver: permissoes.ver_cronograma, editar: permissoes.editar_cronograma, icone: 'cronograma', cor: 'var(--color-warning)' },
    { key: 'contratos', label: 'Contratos', ver: permissoes.ver_contratos, editar: permissoes.editar_contratos, icone: 'contratos', cor: 'var(--color-brand)' },
    { key: 'mesas', label: 'Mesas', ver: permissoes.ver_mesas, editar: permissoes.editar_mesas, icone: 'mesas', cor: 'var(--color-info)' },
    { key: 'memorial', label: 'Memorial', ver: permissoes.ver_memorial, editar: false, icone: 'memorial', cor: 'var(--color-brand)' },
  ];

  return (
    <>
      <Head>
        <title>{evento.nome_evento || 'Evento'} — Espelho | Descomplicaí</title>
      </Head>

      <div style={styles.page}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button onClick={() => router.push('/cerimonialista/eventos')} style={styles.btnVoltar} aria-label="Voltar">
              <Icon name="arrowLeft" size={20} />
            </button>
            <div>
              <h1 style={styles.headerTitulo}>{evento.nome_evento || 'Evento'}</h1>
              <p style={styles.headerSubtitulo}>
                {formatarData(evento.data_evento)}
                {dias !== null && (
                  <span style={{ color: dias < 0 ? 'var(--color-text-muted)' : dias <= 30 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {' · '}
                    {dias < 0 ? `Realizado há ${Math.abs(dias)} dias` : dias === 0 ? 'Hoje é o grande dia' : `${dias} dias restantes`}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button onClick={signOut} style={styles.btnSair} aria-label="Sair">
            <Icon name="logout" size={22} />
          </button>
        </header>

        {/* Banner espelho */}
        <div style={styles.bannerEspelho}>
          <Icon name="eye" size={16} color="var(--color-brand)" />
          <span>Visualizando painel do casal como cerimonialista</span>
        </div>

        <main style={styles.main}>
          {/* Progresso */}
          <section style={styles.secao}>
            <div style={styles.progressoHeader}>
              <span style={styles.progressoLabel}>Progresso do planejamento</span>
              <span style={styles.progressoValor}>{progressoGeral}%</span>
            </div>
            <div style={styles.progressoBarraBg}>
              <div style={{ ...styles.progressoBarraFill, width: `${progressoGeral}%` }} />
            </div>
          </section>

          {/* Cards de módulos */}
          <section>
            <h2 style={styles.secaoTitulo}>Módulos do evento</h2>
            <div style={styles.modulosGrid}>
              {modulosDisponiveis.map((mod) => {
                if (!mod.ver) return null;
                return (
                  <div key={mod.key} style={styles.moduloCard}>
                    <div style={styles.moduloHeader}>
                      <div style={{ ...styles.moduloIcone, backgroundColor: mod.cor + '20' }}>
                        <Icon name={mod.icone} size={20} color={mod.cor} />
                      </div>
                      <div style={styles.moduloInfo}>
                        <h3 style={styles.moduloTitulo}>{mod.label}</h3>
                        {mod.editar ? (
                          <span style={styles.moduloBadgeEditar}>
                            <Icon name="edit" size={10} />
                            Edição
                          </span>
                        ) : (
                          <span style={styles.moduloBadgeVer}>
                            <Icon name="eye" size={10} />
                            Visualização
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Conteúdo específico por módulo */}
                    {mod.key === 'fornecedores' && (
                      <div style={styles.moduloConteudo}>
                        <p style={styles.moduloMetrica}>
                          {fornContratados}<span style={styles.moduloMetricaDe}> de </span>{fornTotal} contratados
                        </p>
                        <p style={styles.moduloMetricaSec}>
                          {fornPagos} pagos · R$ {finComprometido.toLocaleString('pt-BR')} comprometido
                        </p>
                      </div>
                    )}

                    {mod.key === 'financeiro' && (
                      <div style={styles.moduloConteudo}>
                        <p style={styles.moduloMetrica}>
                          R$ {finPago.toLocaleString('pt-BR')}<span style={styles.moduloMetricaDe}> de </span>
                          R$ {Number(evento.orcamento || 0).toLocaleString('pt-BR')}
                        </p>
                        <p style={styles.moduloMetricaSec}>
                          {finComprometido > 0 ? `${Math.round((finPago / finComprometido) * 100)}% pago` : 'Sem pagamentos'}
                        </p>
                      </div>
                    )}

                    {mod.key === 'tarefas' && (
                      <div style={styles.moduloConteudo}>
                        <p style={styles.moduloMetrica}>
                          {tarConcluidas}<span style={styles.moduloMetricaDe}> de </span>{tarTotal} concluídas
                        </p>
                        {tarUrgentes.length > 0 && (
                          <p style={styles.moduloAlerta}>
                            <Icon name="alert" size={12} />
                            {tarUrgentes.length} urgente{tarUrgentes.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}

                    {mod.key === 'convidados' && (
                      <div style={styles.moduloConteudo}>
                        <p style={styles.moduloMetrica}>
                          {convConfirmados}<span style={styles.moduloMetricaDe}> de </span>{convTotal} confirmados
                        </p>
                        {convTotal > 0 && (
                          <p style={styles.moduloMetricaSec}>
                            {Math.round((convConfirmados / convTotal) * 100)}% taxa de confirmação
                          </p>
                        )}
                      </div>
                    )}

                    {mod.key === 'chat' && (
                      <div style={styles.moduloConteudo}>
                        <p style={styles.moduloMetrica}>
                          {mensagens?.naoLidas || 0} mensagem{mensagens?.naoLidas !== 1 ? 's' : ''} não lida{mensagens?.naoLidas !== 1 ? 's' : ''}
                        </p>
                        <p style={styles.moduloMetricaSec}>
                          {mod.editar ? 'Você pode responder' : 'Somente visualização'}
                        </p>
                      </div>
                    )}

                    {mod.key === 'memorial' && (
                      <div style={styles.moduloConteudo}>
                        <p style={styles.moduloMetrica}>
                          {memorial ? 'Memorial preenchido' : 'Memorial não preenchido'}
                        </p>
                        <p style={styles.moduloMetricaSec}>
                          {memorial?.estado ? 'Dados estruturados disponíveis' : 'Aguardando preenchimento'}
                        </p>
                      </div>
                    )}

                    {mod.key === 'mesas' && (
                      <div style={styles.moduloConteudo}>
                        <p style={styles.moduloMetrica}>
                          {mesas?.length || 0} mesa{mesas?.length !== 1 ? 's' : ''} configurada{mesas?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {(mod.key === 'cronograma' || mod.key === 'contratos') && (
                      <div style={styles.moduloConteudo}>
                        <p style={styles.moduloMetricaSec}>
                          {mod.editar ? 'Acesso completo' : 'Visualização somente'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tarefas urgentes */}
          {permissoes.ver_tarefas && tarUrgentes.length > 0 && (
            <section style={styles.secao}>
              <h2 style={styles.secaoTitulo}>Tarefas urgentes</h2>
              <div style={styles.urgentesLista}>
                {tarUrgentes.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    style={{
                      ...styles.urgenteItem,
                      borderLeftColor: t.atrasada ? 'var(--color-danger)' : 'var(--color-warning)',
                    }}
                  >
                    <div style={styles.urgenteHeader}>
                      <span style={styles.urgenteTitulo}>{t.titulo}</span>
                      <span
                        style={{
                          ...styles.urgentePrazo,
                          color: t.atrasada ? 'var(--color-danger)' : 'var(--color-warning)',
                        }}
                      >
                        {t.atrasada ? `Atrasada ${Math.abs(t.dias)}d` : `Em ${t.dias}d`}
                      </span>
                    </div>
                    <span style={styles.urgenteCategoria}>{t.categoria || 'Geral'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Memorial sempre visível */}
          {permissoes.ver_memorial && memorial?.estado && (
            <section style={styles.secao}>
              <h2 style={styles.secaoTitulo}>Memorial do casal</h2>
              <div style={styles.memorialCard}>
                <Icon name="memorial" size={24} color="var(--color-brand)" />
                <div>
                  <p style={styles.memorialTitulo}>Memorial preenchido</p>
                  <p style={styles.memorialDesc}>
                    O casal completou o questionário estruturado. Dados disponíveis para consulta.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

const styles = {
  page: { minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' },

  header: {
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: 'var(--space-4) var(--space-5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' },
  btnVoltar: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    padding: 'var(--space-2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  headerSubtitulo: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    margin: '2px 0 0',
  },
  btnSair: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    padding: 'var(--space-2)',
  },

  bannerEspelho: {
    backgroundColor: 'var(--color-brand-light)',
    borderBottom: '1px solid var(--color-brand)',
    padding: 'var(--space-3) var(--space-5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-brand)',
    fontWeight: 'var(--font-medium)',
  },

  main: { padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' },

  loadingContainer: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-off-white)',
  },
  loadingText: {
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-muted)',
  },

  tituloRestrito: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    color: 'var(--color-text-primary)',
    marginTop: 'var(--space-4)',
  },
  descricaoRestrita: {
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--space-2)',
  },

  secao: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5)',
    border: '1px solid var(--color-border)',
  },
  secaoTitulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    color: 'var(--color-brand)',
    fontWeight: 'var(--font-normal)',
    marginBottom: 'var(--space-4)',
  },

  progressoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-3)',
  },
  progressoLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    fontWeight: 'var(--font-semibold)',
  },
  progressoValor: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    color: 'var(--color-brand)',
    fontWeight: 'var(--font-bold)',
  },
  progressoBarraBg: {
    width: '100%',
    height: '8px',
    background: 'var(--color-surface-dark)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  },
  progressoBarraFill: {
    height: '100%',
    background: 'var(--color-brand)',
    borderRadius: 'var(--radius-full)',
    transition: 'width 500ms ease',
  },

  modulosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 'var(--space-4)',
  },
  moduloCard: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  moduloHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  moduloIcone: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduloInfo: { flex: 1 },
  moduloTitulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  moduloBadgeEditar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-success)',
    fontWeight: 'var(--font-medium)',
    marginTop: '2px',
  },
  moduloBadgeVer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    fontWeight: 'var(--font-medium)',
    marginTop: '2px',
  },
  moduloConteudo: {
    borderTop: '1px solid var(--color-border-light)',
    paddingTop: 'var(--space-3)',
  },
  moduloMetrica: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    color: 'var(--color-text-primary)',
    fontWeight: 'var(--font-bold)',
    margin: 0,
  },
  moduloMetricaDe: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    fontWeight: 'var(--font-normal)',
  },
  moduloMetricaSec: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    marginTop: '2px',
  },
  moduloAlerta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-danger)',
    marginTop: '2px',
  },

  urgentesLista: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  },
  urgenteItem: {
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-off-white)',
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
  },
  urgenteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  urgenteTitulo: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-primary)',
  },
  urgentePrazo: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-medium)',
  },
  urgenteCategoria: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },

  memorialCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    backgroundColor: 'var(--color-off-white)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },
  memorialTitulo: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  memorialDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    margin: '2px 0 0',
  },
};
