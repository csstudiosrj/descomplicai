import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import { useAuth } from '../../hooks/useAuth';
import WizardPasso1 from '../../components/mesas/WizardPasso1';
import WizardPasso2 from '../../components/mesas/WizardPasso2';
import WizardPasso3 from '../../components/mesas/WizardPasso3';
import MesasLista from '../../components/mesas/MesasLista';
import GradeMesas from '../../components/mesas/GradeMesas';

export default function MesasPage() {
  return (
    <ProtectedRoute>
      <MesasContent />
    </ProtectedRoute>
  );
}

function MesasContent() {
  const router = useRouter();
  const { user, evento, hasAccess, supabase } = useAuth();
  const readOnly = !hasAccess;

  const [carregando, setCarregando] = useState(true);
  const [configurado, setConfigurado] = useState(false);
  const [mesas, setMesas] = useState([]);
  const [mesasTipos, setMesasTipos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [convidados, setConvidados] = useState([]);
  const [visualizacao, setVisualizacao] = useState('lista');

  const [passo, setPasso] = useState(1);
  const [totalConvidados, setTotalConvidados] = useState(0);
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [mesasGeradas, setMesasGeradas] = useState([]);
  const [modalReconfigurar, setModalReconfigurar] = useState(false);

  const wizardKey = evento ? `descomplicai_mesas_wizard_${evento.id}` : null;

  const salvarWizardState = useCallback(() => {
    if (!wizardKey || configurado) return;
    const dados = { passo, totalConvidados, tiposSelecionados, mesasGeradas };
    localStorage.setItem(wizardKey, JSON.stringify(dados));
  }, [wizardKey, passo, totalConvidados, tiposSelecionados, mesasGeradas, configurado]);

  const restaurarWizardState = useCallback(() => {
    if (!wizardKey || configurado) return;
    try {
      const salvo = localStorage.getItem(wizardKey);
      if (salvo) {
        const dados = JSON.parse(salvo);
        if (dados.passo && dados.passo >= 1 && dados.passo <= 3) setPasso(dados.passo);
        if (typeof dados.totalConvidados === 'number') setTotalConvidados(dados.totalConvidados);
        if (Array.isArray(dados.tiposSelecionados)) setTiposSelecionados(dados.tiposSelecionados);
        if (Array.isArray(dados.mesasGeradas)) setMesasGeradas(dados.mesasGeradas);
      }
    } catch {}
  }, [wizardKey, configurado]);

  useEffect(() => {
    if (evento && user) carregarTudo();
  }, [evento, user]);

  useEffect(() => {
    salvarWizardState();
  }, [salvarWizardState]);

  const carregarTudo = async () => {
    setCarregando(true);

    try {
      const { data: gruposData } = await supabase
        .from('grupos_convidados')
        .select('*')
        .eq('evento_id', evento.id)
        .order('ordem');
      setGrupos(gruposData || []);
    } catch { setGrupos([]); }

    try {
      const { data: convData } = await supabase
        .from('convidados')
        .select('*')
        .eq('evento_id', evento.id)
        .order('nome');
      setConvidados(convData || []);
    } catch { setConvidados([]); }

    let tipos = [];
    try {
      const { data: tiposData } = await supabase
        .from('mesas_tipos')
        .select('*')
        .eq('evento_id', evento.id);
      tipos = tiposData || [];
    } catch { tipos = []; }

    if (tipos.length > 0) {
      setMesasTipos(tipos);
      try {
        const { data: mesasData } = await supabase
          .from('mesas')
          .select('*')
          .eq('evento_id', evento.id)
          .order('numero');
        setMesas(mesasData || []);
        setConfigurado(true);
      } catch {
        setMesas([]); setConfigurado(false);
      }
    } else {
      setTotalConvidados(convidados.length || 0);
      setConfigurado(false);
      restaurarWizardState();
    }

    setCarregando(false);
  };

  const salvarConfiguracao = async () => {
    if (readOnly) return;
    try {
      const tiposPayload = tiposSelecionados.map(t => ({
        evento_id: evento.id, nome: t.nome, formato: t.formato,
        capacidade: t.capacidade, quantidade: t.quantidade,
      }));
      await supabase.from('mesas_tipos').insert(tiposPayload);

      const { data: tiposSalvos } = await supabase
        .from('mesas_tipos')
        .select('id, nome')
        .eq('evento_id', evento.id);

      const nomeToUuid = {};
      tiposSalvos.forEach(t => { nomeToUuid[t.nome] = t.id; });

      const mesasPayload = mesasGeradas.map(m => ({
        evento_id: evento.id, numero: m.numero,
        tipo_id: nomeToUuid[m.nomeTipo], rotulo: m.rotulo,
        posicao_x: null, posicao_y: null, rotacao: 0,
      }));
      await supabase.from('mesas').insert(mesasPayload);
    } catch {
      alert('Erro ao salvar configuracao.'); return;
    }

    if (wizardKey) localStorage.removeItem(wizardKey);

    setPasso(1); setTiposSelecionados([]); setMesasGeradas([]);
    await carregarTudo();
  };

  const reconfigurar = async () => {
    if (readOnly) return;
    setModalReconfigurar(false);
    try {
      await supabase.from('convidados').update({ mesa_id: null }).eq('evento_id', evento.id);
      await supabase.from('mesas').delete().eq('evento_id', evento.id);
      await supabase.from('mesas_tipos').delete().eq('evento_id', evento.id);
    } catch {}
    if (wizardKey) localStorage.removeItem(wizardKey);
    setConfigurado(false); setPasso(1); setTiposSelecionados([]);
    setMesasGeradas([]); setTotalConvidados(0); setVisualizacao('lista');
  };

  const atribuirConvidado = async (convidadoId, mesaId) => {
    if (readOnly) return;
    try {
      const { error } = await supabase
        .from('convidados')
        .update({ mesa_id: mesaId })
        .eq('id', convidadoId);
      if (error) {
        alert('Erro ao atribuir convidado: ' + error.message);
        return;
      }
      await carregarTudo();
    } catch (err) {
      alert('Erro inesperado ao atribuir convidado.');
    }
  };

  const removerConvidado = async (convidadoId) => {
    if (readOnly) return;
    try {
      const { error } = await supabase
        .from('convidados')
        .update({ mesa_id: null })
        .eq('id', convidadoId);
      if (error) {
        alert('Erro ao remover convidado: ' + error.message);
        return;
      }
      await carregarTudo();
    } catch (err) {
      alert('Erro inesperado ao remover convidado.');
    }
  };

  const convidadosPorMesa = {};
  convidados.forEach(c => {
    if (c.mesa_id) {
      if (!convidadosPorMesa[c.mesa_id]) convidadosPorMesa[c.mesa_id] = [];
      convidadosPorMesa[c.mesa_id].push(c);
    }
  });
  const convidadosSemMesa = convidados.filter(c => !c.mesa_id);

  // Resumo
  const resumo = useMemo(() => {
    const totalMesas = mesas.length;
    const totalLugares = mesas.reduce((acc, m) => {
      const tipo = mesasTipos.find(t => t.id === m.tipo_id);
      return acc + (tipo?.capacidade || 0);
    }, 0);
    const totalOcupados = convidados.reduce((acc, c) => {
      if (c.mesa_id) return acc + 1 + (c.acompanhantes || 0);
      return acc;
    }, 0);
    const semMesa = convidadosSemMesa.length;
    const pct = totalLugares > 0 ? Math.round((totalOcupados / totalLugares) * 100) : 0;
    return { totalMesas, totalLugares, totalOcupados, semMesa, pct };
  }, [mesas, mesasTipos, convidados, convidadosSemMesa]);

  const nomeCasal = evento?.nome_evento || '';

  return (
    <>
      <Head><title>Mesas | descomplicai</title></Head>
      <div style={{ minHeight: '100vh', background: '#F9F7F4', paddingTop: '52px' }}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 60px' }}>

          {readOnly && (
            <div style={{
              background: '#FFF8F0', border: '1px solid #EDD9BE',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              textAlign: 'center', fontSize: 13, color: '#8B6F5E',
            }}>
              Modo somente leitura. Assine para editar.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontSize: 26, fontWeight: 400,
                color: '#8B6F5E', margin: 0,
              }}>
                Mesas
              </h1>
              {configurado && (
                <p style={{ fontSize: 13, color: '#A89B91', margin: '4px 0 0' }}>
                  {mesas.length} {mesas.length === 1 ? 'mesa configurada' : 'mesas configuradas'}
                </p>
              )}
            </div>
            {configurado && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['lista', 'grade'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVisualizacao(v)}
                      style={{
                        padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                        fontSize: 13, fontWeight: 500, transition: 'all 0.1s',
                        border: visualizacao === v ? '1px solid #8B6F5E' : '1px solid #D4C8C0',
                        background: visualizacao === v ? '#8B6F5E' : 'white',
                        color: visualizacao === v ? 'white' : '#8B6F5E',
                        textTransform: 'capitalize',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <button onClick={() => router.push('/painel/mapa-mesas')} style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: '1px solid #8B6F5E', background: 'white',
                  color: '#8B6F5E', fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}>
                  Mapa visual
                </button>
              </div>
            )}
          </div>

          {carregando ? (
            <div style={{ padding: 40, textAlign: 'center', fontSize: 14, color: '#A89B91' }}>
              Carregando...
            </div>
          ) : configurado ? (
            <>
              {/* Cards de resumo */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12, marginBottom: 24,
              }}>
                {[
                  { label: 'Mesas', valor: resumo.totalMesas, cor: '#8B6F5E' },
                  { label: 'Lugares totais', valor: resumo.totalLugares, cor: '#C4956A' },
                  { label: 'Sem mesa', valor: resumo.semMesa, cor: '#F9A825' },
                  { label: 'Ocupação', valor: `${resumo.pct}%`, cor: '#10B981' },
                ].map(({ label, valor, cor }) => (
                  <div key={label} style={{
                    background: 'white', borderRadius: 12,
                    border: '1px solid #F0EDE9', padding: '16px 20px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: cor }}>{valor}</span>
                    <span style={{ fontSize: 11, color: '#A89B91', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Dock de convidados sem mesa */}
              {convidadosSemMesa.length > 0 && (
                <div style={{
                  background: 'white', borderRadius: 12,
                  border: '1px solid #F0EDE9', padding: '16px',
                  marginBottom: 24,
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 14, color: '#1A1714', marginBottom: 12,
                  }}>
                    Convidados sem mesa ({convidadosSemMesa.length})
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {convidadosSemMesa.map(c => (
                      <div
                        key={c.id}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 20,
                          background: '#FFF8E1',
                          border: '1px solid #F9A825',
                          fontSize: 12,
                          fontFamily: 'var(--font-body)',
                          color: '#1A1714',
                          fontWeight: 500,
                        }}
                      >
                        {c.nome}
                        {c.acompanhantes > 0 && (
                          <span style={{ color: '#F9A825', marginLeft: 4 }}>+{c.acompanhantes}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {visualizacao === 'lista' ? (
                <MesasLista
                  mesas={mesas}
                  mesasTipos={mesasTipos}
                  convidadosPorMesa={convidadosPorMesa}
                  convidadosSemMesa={convidadosSemMesa}
                  onAtribuir={atribuirConvidado}
                  onRemover={removerConvidado}
                  onReconfigurar={() => setModalReconfigurar(true)}
                  readOnly={readOnly}
                />
              ) : (
                <GradeMesas
                  mesas={mesas}
                  mesasTipos={mesasTipos}
                  convidadosPorMesa={convidadosPorMesa}
                  convidadosSemMesa={convidadosSemMesa}
                  onAtribuir={atribuirConvidado}
                  onRemover={removerConvidado}
                  readOnly={readOnly}
                />
              )}
            </>
          ) : (
            <div style={{
              background: 'white', borderRadius: 16,
              padding: 24, border: '1px solid #F0EDE9',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                <div style={{ width: '100%', height: 6, background: '#F0EDE9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#8B6F5E', borderRadius: 3, transition: 'width 400ms ease', width: passo === 1 ? '33%' : passo === 2 ? '66%' : '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: passo >= 1 ? '#8B6F5E' : '#A89B91', textTransform: 'uppercase' }}>Quantidade</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: passo >= 2 ? '#8B6F5E' : '#A89B91', textTransform: 'uppercase' }}>Tipos</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: passo >= 3 ? '#8B6F5E' : '#A89B91', textTransform: 'uppercase' }}>Distribuicao</span>
                </div>
              </div>
              {passo === 1 && (
                <WizardPasso1
                  totalConvidados={totalConvidados}
                  onChange={setTotalConvidados}
                  onAvancar={() => setPasso(2)}
                />
              )}
              {passo === 2 && (
                <WizardPasso2
                  totalConvidados={totalConvidados}
                  tiposSelecionados={tiposSelecionados}
                  onChange={setTiposSelecionados}
                  onAvancar={() => setPasso(3)}
                  onVoltar={() => setPasso(1)}
                />
              )}
              {passo === 3 && (
                <WizardPasso3
                  tiposSelecionados={tiposSelecionados}
                  grupos={grupos}
                  mesasGeradas={mesasGeradas}
                  onChange={setMesasGeradas}
                  onSalvar={salvarConfiguracao}
                  onVoltar={() => setPasso(2)}
                />
              )}
            </div>
          )}

          {modalReconfigurar && (
            <div style={{
              position: 'fixed', inset: 0,
              background: 'rgba(26,23,20,0.5)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 300, padding: 16,
            }} onClick={() => setModalReconfigurar(false)}>
              <div style={{
                background: 'white', borderRadius: 16,
                padding: 24, width: '100%', maxWidth: 420,
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{
                  fontFamily: 'var(--font-display, Georgia, serif)',
                  fontSize: 20, color: '#1A1714', margin: '0 0 12px',
                }}>
                  Reconfigurar mesas?
                </h3>
                <p style={{ fontSize: 14, color: '#A89B91', lineHeight: 1.5, margin: '0 0 20px' }}>
                  Isso apagara todas as mesas, configuracoes e atribuicoes de convidados. Esta acao nao pode ser desfeita.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setModalReconfigurar(false)} style={{
                    padding: '10px 20px', borderRadius: 8,
                    border: '1px solid #D4C8C0', background: 'white',
                    color: '#8B6F5E', fontSize: 14, cursor: 'pointer',
                  }}>
                    Cancelar
                  </button>
                  <button onClick={reconfigurar} style={{
                    padding: '10px 20px', borderRadius: 8,
                    border: 'none', background: '#C62828',
                    color: 'white', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                    Apagar e reconfigurar
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}