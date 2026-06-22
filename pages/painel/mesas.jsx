import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (evento && user) carregarTudo();
  }, [evento, user]);

  // Autosave: salva wizard no localStorage a cada mudanca
  useEffect(() => {
    if (!wizardKey || configurado) return;
    const dados = { passo, totalConvidados, tiposSelecionados, mesasGeradas };
    localStorage.setItem(wizardKey, JSON.stringify(dados));
  }, [wizardKey, passo, totalConvidados, tiposSelecionados, mesasGeradas, configurado]);

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
      if (wizardKey) {
        try {
          const salvo = localStorage.getItem(wizardKey);
          if (salvo) {
            const dados = JSON.parse(salvo);
            if (dados.passo) setPasso(dados.passo);
            if (dados.totalConvidados) setTotalConvidados(dados.totalConvidados);
            if (dados.tiposSelecionados) setTiposSelecionados(dados.tiposSelecionados);
            if (dados.mesasGeradas) setMesasGeradas(dados.mesasGeradas);
          }
        } catch {}
      }
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
      await supabase.from('convidados').update({ mesa_id: mesaId }).eq('id', convidadoId);
      await carregarTudo();
    } catch {}
  };

  const removerConvidado = async (convidadoId) => {
    if (readOnly) return;
    try {
      await supabase.from('convidados').update({ mesa_id: null }).eq('id', convidadoId);
      await carregarTudo();
    } catch {}
  };

  const convidadosPorMesa = {};
  convidados.forEach(c => {
    if (c.mesa_id) {
      if (!convidadosPorMesa[c.mesa_id]) convidadosPorMesa[c.mesa_id] = [];
      convidadosPorMesa[c.mesa_id].push(c);
    }
  });
  const convidadosSemMesa = convidados.filter(c => !c.mesa_id);

  const nomeCasal = evento?.nome_evento || '';

  return (
    <>
      <Head><title>Mesas | descomplicai</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}>
              <span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span>
            </div>
          )}
          <div style={styles.header}>
            <h1 style={styles.title}>Mesas</h1>
            {configurado && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={styles.toggleGroup}>
                  <button onClick={() => setVisualizacao('lista')}
                    style={{ ...styles.toggleBtn, ...(visualizacao === 'lista' ? styles.toggleAtivo : {}) }}>Lista</button>
                  <button onClick={() => setVisualizacao('grade')}
                    style={{ ...styles.toggleBtn, ...(visualizacao === 'grade' ? styles.toggleAtivo : {}) }}>Grade</button>
                </div>
                <button onClick={() => router.push('/painel/mapa-mesas')} style={styles.btnMapa}>Mapa visual</button>
              </div>
            )}
          </div>
          {carregando ? (
            <div style={styles.emptyState}><span style={styles.emptyText}>Carregando...</span></div>
          ) : configurado ? (
            visualizacao === 'lista' ? (
              <MesasLista key="lista" mesas={mesas} mesasTipos={mesasTipos} onReconfigurar={() => setModalReconfigurar(true)} readOnly={readOnly} />
            ) : (
              <GradeMesas key="grade" mesas={mesas} mesasTipos={mesasTipos}
                convidadosPorMesa={convidadosPorMesa} convidadosSemMesa={convidadosSemMesa}
                onAtribuir={atribuirConvidado} onRemover={removerConvidado} readOnly={readOnly} />
            )
          ) : (
            <div style={styles.wizardBox}>
              <div style={styles.progressoBar}>
                <div style={styles.progressoTrack}>
                  <div style={{ ...styles.progressoFill, width: passo === 1 ? '33%' : passo === 2 ? '66%' : '100%' }} />
                </div>
                <div style={styles.progressoSteps}>
                  <span style={{ ...styles.stepLabel, color: passo >= 1 ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}>Quantidade</span>
                  <span style={{ ...styles.stepLabel, color: passo >= 2 ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}>Tipos</span>
                  <span style={{ ...styles.stepLabel, color: passo >= 3 ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}>Distribuicao</span>
                </div>
              </div>
              {passo === 1 && (
                <WizardPasso1 totalConvidados={totalConvidados} setTotalConvidados={setTotalConvidados} onAvancar={() => setPasso(2)} />
              )}
              {passo === 2 && (
                <WizardPasso2 totalConvidados={totalConvidados} tiposSelecionados={tiposSelecionados}
                  setTiposSelecionados={setTiposSelecionados} onAvancar={() => setPasso(3)} onVoltar={() => setPasso(1)} />
              )}
              {passo === 3 && (
                <WizardPasso3 tiposSelecionados={tiposSelecionados} grupos={grupos}
                  mesasGeradas={mesasGeradas} setMesasGeradas={setMesasGeradas}
                  onSalvar={salvarConfiguracao} onVoltar={() => setPasso(2)} />
              )}
            </div>
          )}

          {modalReconfigurar && (
            <div style={styles.modalOverlay} onClick={() => setModalReconfigurar(false)}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 style={styles.modalTitle}>Reconfigurar mesas?</h3>
                <p style={styles.modalText}>
                  Isso apagara todas as mesas, configuracoes e atribuicoes de convidados. Esta acao nao pode ser desfeita.
                </p>
                <div style={styles.modalBotoes}>
                  <button onClick={() => setModalReconfigurar(false)} style={styles.btnCancel}>Cancelar</button>
                  <button onClick={reconfigurar} style={styles.btnDanger}>Apagar e reconfigurar</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-off-white)', paddingTop: '52px' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-text-primary)', margin: 0 },
  toggleGroup: { display: 'flex', gap: '2px', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' },
  toggleBtn: { padding: '8px 16px', background: 'var(--color-white)', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)' },
  toggleAtivo: { background: 'var(--color-brand)', color: '#fff' },
  btnMapa: { padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-brand)', background: 'var(--color-white)', color: 'var(--color-brand)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' },
  wizardBox: { background: 'var(--color-white)', borderRadius: '16px', padding: '24px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '24px' },
  progressoBar: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  progressoTrack: { width: '100%', height: '6px', background: 'var(--color-off-white)', borderRadius: '3px', overflow: 'hidden' },
  progressoFill: { height: '100%', background: 'var(--color-brand)', borderRadius: '3px', transition: 'width 400ms ease' },
  progressoSteps: { display: 'flex', justifyContent: 'space-between' },
  stepLabel: { fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', textTransform: 'uppercase' },
  emptyState: { padding: '40px 16px', textAlign: 'center' },
  emptyText: { fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' },
  modal: { background: 'var(--color-white)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-text-primary)', margin: '0 0 12px' },
  modalText: { fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.5, margin: '0 0 20px' },
  modalBotoes: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  btnCancel: { background: 'var(--color-off-white)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  btnDanger: { background: '#C62828', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
};