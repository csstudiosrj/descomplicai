import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import { useAuth } from '../../hooks/useAuth';
import WizardPasso1 from '../../components/mesas/WizardPasso1';
import WizardPasso2 from '../../components/mesas/WizardPasso2';
import WizardPasso3 from '../../components/mesas/WizardPasso3';
import MesasLista from '../../components/mesas/MesasLista';

export default function MesasPage() {
  return (
    <ProtectedRoute>
      <MesasContent />
    </ProtectedRoute>
  );
}

function MesasContent() {
  const { user, evento, hasAccess, supabase } = useAuth();
  const readOnly = !hasAccess;

  const [carregando, setCarregando] = useState(true);
  const [configurado, setConfigurado] = useState(false);
  const [mesas, setMesas] = useState([]);
  const [mesasTipos, setMesasTipos] = useState([]);
  const [grupos, setGrupos] = useState([]);

  // Wizard state
  const [passo, setPasso] = useState(1);
  const [totalConvidados, setTotalConvidados] = useState(0);
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [mesasGeradas, setMesasGeradas] = useState([]);

  useEffect(() => {
    if (evento) verificarConfiguracao();
  }, [evento]);

  const verificarConfiguracao = async () => {
    setCarregando(true);

    // Busca grupos
    const { data: gruposData } = await supabase
      .from('grupos_convidados')
      .select('*')
      .eq('evento_id', evento.id)
      .order('ordem');
    setGrupos(gruposData || []);

    // Busca mesas_tipos
    const { data: tipos } = await supabase
      .from('mesas_tipos')
      .select('*')
      .eq('evento_id', evento.id);

    if (tipos && tipos.length > 0) {
      setMesasTipos(tipos);

      // Busca mesas
      const { data: mesasData } = await supabase
        .from('mesas')
        .select('*')
        .eq('evento_id', evento.id)
        .order('numero');
      setMesas(mesasData || []);
      setConfigurado(true);
    } else {
      // Sugere total de convidados como base
      const { data: convData } = await supabase
        .from('convidados')
        .select('id')
        .eq('evento_id', evento.id);
      setTotalConvidados(convData?.length || 0);
      setConfigurado(false);
    }

    setCarregando(false);
  };

  const salvarConfiguracao = async () => {
    if (readOnly) return;

    // 1. Insere tipos
    const tiposPayload = tiposSelecionados.map(t => ({
      evento_id: evento.id,
      nome: t.nome,
      formato: t.formato,
      capacidade: t.capacidade,
      quantidade: t.quantidade,
    }));

    await supabase.from('mesas_tipos').insert(tiposPayload);

    // 2. Busca tipos salvos para pegar UUIDs
    const { data: tiposSalvos } = await supabase
      .from('mesas_tipos')
      .select('id, nome')
      .eq('evento_id', evento.id);

    const nomeToUuid = {};
    tiposSalvos.forEach(t => { nomeToUuid[t.nome] = t.id; });

    // 3. Insere mesas
    const mesasPayload = mesasGeradas.map(m => ({
      evento_id: evento.id,
      numero: m.numero,
      tipo_id: nomeToUuid[m.nomeTipo],
      rotulo: m.rotulo,
      posicao_x: null,
      posicao_y: null,
      rotacao: 0,
    }));

    await supabase.from('mesas').insert(mesasPayload);

    // Recarrega
    setPasso(1);
    setTiposSelecionados([]);
    setMesasGeradas([]);
    await verificarConfiguracao();
  };

  const reconfigurar = async () => {
    if (readOnly) return;
    if (!confirm('Isso apagara todas as mesas e configuracoes atuais. Continuar?')) return;

    await supabase.from('mesas').delete().eq('evento_id', evento.id);
    await supabase.from('mesas_tipos').delete().eq('evento_id', evento.id);

    setConfigurado(false);
    setPasso(1);
    setTiposSelecionados([]);
    setMesasGeradas([]);
    setTotalConvidados(0);
  };

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

          <h1 style={styles.title}>Mesas</h1>

          {carregando ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyText}>Carregando...</span>
            </div>
          ) : configurado ? (
            <MesasLista
              mesas={mesas}
              mesasTipos={mesasTipos}
              onReconfigurar={reconfigurar}
              readOnly={readOnly}
            />
          ) : (
            <div style={styles.wizardBox}>
              {/* Progresso */}
              <div style={styles.progressoBar}>
                <div style={styles.progressoTrack}>
                  <div style={{
                    ...styles.progressoFill,
                    width: passo === 1 ? '33%' : passo === 2 ? '66%' : '100%',
                  }} />
                </div>
                <div style={styles.progressoSteps}>
                  <span style={{ ...styles.stepLabel, color: passo >= 1 ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}>Quantidade</span>
                  <span style={{ ...styles.stepLabel, color: passo >= 2 ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}>Tipos</span>
                  <span style={{ ...styles.stepLabel, color: passo >= 3 ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}>Distribuicao</span>
                </div>
              </div>

              {passo === 1 && (
                <WizardPasso1
                  totalConvidados={totalConvidados}
                  setTotalConvidados={setTotalConvidados}
                  onAvancar={() => setPasso(2)}
                />
              )}

              {passo === 2 && (
                <WizardPasso2
                  totalConvidados={totalConvidados}
                  tiposSelecionados={tiposSelecionados}
                  setTiposSelecionados={setTiposSelecionados}
                  onAvancar={() => setPasso(3)}
                  onVoltar={() => setPasso(1)}
                />
              )}

              {passo === 3 && (
                <WizardPasso3
                  tiposSelecionados={tiposSelecionados}
                  grupos={grupos}
                  mesasGeradas={mesasGeradas}
                  setMesasGeradas={setMesasGeradas}
                  onSalvar={salvarConfiguracao}
                  onVoltar={() => setPasso(2)}
                />
              )}
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
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-text-primary)', marginBottom: '20px' },
  wizardBox: {
    background: 'var(--color-white)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  progressoBar: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  progressoTrack: { width: '100%', height: '6px', background: 'var(--color-off-white)', borderRadius: '3px', overflow: 'hidden' },
  progressoFill: { height: '100%', background: 'var(--color-brand)', borderRadius: '3px', transition: 'width 400ms ease' },
  progressoSteps: { display: 'flex', justifyContent: 'space-between' },
  stepLabel: { fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', textTransform: 'uppercase' },
  emptyState: { padding: '40px 16px', textAlign: 'center' },
  emptyText: { fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};