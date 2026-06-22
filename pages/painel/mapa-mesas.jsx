import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import { useAuth } from '../../hooks/useAuth';
import MapaVisual from '../../components/mesas/MapaVisual';

export default function MapaMesasPage() {
  return (
    <ProtectedRoute>
      <MapaMesasContent />
    </ProtectedRoute>
  );
}

function MapaMesasContent() {
  const router = useRouter();
  const { user, evento, hasAccess, supabase } = useAuth();
  const readOnly = !hasAccess;

  const [carregando, setCarregando] = useState(true);
  const [mesas, setMesas] = useState([]);
  const [mesasTipos, setMesasTipos] = useState([]);
  const [convidados, setConvidados] = useState([]);

  useEffect(() => {
    if (evento) carregarTudo();
  }, [evento]);

  const carregarTudo = async () => {
    setCarregando(true);

    const { data: tipos } = await supabase
      .from('mesas_tipos')
      .select('*')
      .eq('evento_id', evento.id);
    setMesasTipos(tipos || []);

    const { data: mesasData } = await supabase
      .from('mesas')
      .select('*')
      .eq('evento_id', evento.id)
      .order('numero');
    setMesas(mesasData || []);

    const { data: convData } = await supabase
      .from('convidados')
      .select('*')
      .eq('evento_id', evento.id)
      .order('nome');
    setConvidados(convData || []);

    setCarregando(false);
  };

  const convidadosPorMesa = {};
  convidados.forEach(c => {
    if (c.mesa_id) {
      if (!convidadosPorMesa[c.mesa_id]) convidadosPorMesa[c.mesa_id] = [];
      convidadosPorMesa[c.mesa_id].push(c);
    }
  });

  const atribuirConvidado = async (convidadoId, mesaId) => {
    if (readOnly) return;
    await supabase
      .from('convidados')
      .update({ mesa_id: mesaId })
      .eq('id', convidadoId);
    await carregarTudo();
  };

  const removerConvidado = async (convidadoId) => {
    if (readOnly) return;
    await supabase
      .from('convidados')
      .update({ mesa_id: null })
      .eq('id', convidadoId);
    await carregarTudo();
  };

  const reposicionarMesa = async (mesaId, x, y) => {
    if (readOnly) return;
    await supabase
      .from('mesas')
      .update({ posicao_x: x, posicao_y: y })
      .eq('id', mesaId);
    setMesas(prev => prev.map(m => m.id === mesaId ? { ...m, posicao_x: x, posicao_y: y } : m));
  };

  const nomeCasal = evento?.nome_evento || '';

  return (
    <>
      <Head><title>Mapa de Mesas | descomplicai</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}>
              <span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span>
            </div>
          )}

          <div style={styles.header}>
            <h1 style={styles.title}>Mapa de Mesas</h1>
            <button
              onClick={() => router.push('/painel/mesas')}
              style={styles.btnVoltar}
            >
              Voltar para Mesas
            </button>
          </div>

          {carregando ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyText}>Carregando...</span>
            </div>
          ) : mesas.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyText}>Nenhuma mesa configurada. Va em Mesas para configurar.</span>
              <button
                onClick={() => router.push('/painel/mesas')}
                style={{ ...styles.btnVoltar, marginTop: '16px' }}
              >
                Configurar mesas
              </button>
            </div>
          ) : (
            <MapaVisual
              mesas={mesas}
              mesasTipos={mesasTipos}
              convidadosPorMesa={convidadosPorMesa}
              onAtribuir={atribuirConvidado}
              onRemover={removerConvidado}
              onReposicionar={reposicionarMesa}
              readOnly={readOnly}
            />
          )}
        </main>
      </div>
    </>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-off-white)', paddingTop: '52px' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '20px 16px 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-text-primary)', margin: 0 },
  btnVoltar: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-off-white)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
  },
  emptyState: { padding: '60px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyText: { fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};