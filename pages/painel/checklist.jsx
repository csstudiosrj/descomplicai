import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

export default function ChecklistPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <ChecklistContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function ChecklistContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [novoPrazo, setNovoPrazo] = useState('');

  useEffect(() => {
    if (evento) buscar();
  }, [evento]);

  const buscar = async () => {
    const { data } = await supabase
      .from('tarefas')
      .select('*')
      .eq('evento_id', evento.id)
      .order('prazo', { ascending: true });
    setTarefas(data || []);
  };

  const toggle = async (id, concluida) => {
    if (readOnly) return;
    await supabase.from('tarefas').update({ concluida: !concluida }).eq('id', id);
    buscar();
  };

  const adicionar = async () => {
    if (readOnly || !novaTarefa.trim()) return;
    await supabase.from('tarefas').insert({
      evento_id: evento.id,
      titulo: novaTarefa,
      prazo: novoPrazo || null,
      concluida: false,
    });
    setNovaTarefa('');
    setNovoPrazo('');
    buscar();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir tarefa?')) return;
    await supabase.from('tarefas').delete().eq('id', id);
    buscar();
  };

  const hoje = new Date();
  const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

  const grupos = {
    urgente: tarefas.filter(t => !t.concluida && t.prazo && new Date(t.prazo) < hoje),
    proximos: tarefas.filter(t => {
      if (t.concluida || !t.prazo) return false;
      const d = new Date(t.prazo);
      return d >= hoje && d <= trintaDias;
    }),
    futuros: tarefas.filter(t => !t.concluida && (!t.prazo || new Date(t.prazo) > trintaDias)),
    concluidos: tarefas.filter(t => t.concluida),
  };

  const nomeCasal = evento
    ? `${evento.nome_pessoa1 || ''} & ${evento.nome_pessoa2 || ''}`
    : '';

  return (
    <>
      <Head><title>Checklist | descomplicaí</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          <h1 style={styles.title}>Checklist</h1>

          {!readOnly && (
            <div style={styles.addBox}>
              <input
                style={styles.input}
                placeholder="Nova tarefa..."
                value={novaTarefa}
                onChange={(e) => setNovaTarefa(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && adicionar()}
              />
              <input
                style={{ ...styles.input, width: '130px' }}
                type="date"
                value={novoPrazo}
                onChange={(e) => setNovoPrazo(e.target.value)}
              />
              <button onClick={adicionar} style={styles.btnPrimary}>
                <Icon name="plus" size={16} color="#fff" />
              </button>
            </div>
          )}

          {Object.entries({
            urgente: { label: 'Urgente', color: '#C62828' },
            proximos: { label: 'Próximos 30 dias', color: '#F9A825' },
            futuros: { label: 'Futuros', color: '#1565C0' },
            concluidos: { label: 'Concluídos', color: '#2E7D32' },
          }).map(([key, meta]) => (
            grupos[key].length > 0 && (
              <section key={key} style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: meta.color }}>{meta.label} ({grupos[key].length})</h2>
                <div style={styles.list}>
                  {grupos[key].map((t) => (
                    <div key={t.id} style={styles.item}>
                      <button
                        onClick={() => toggle(t.id, t.concluida)}
                        style={{
                          ...styles.checkbox,
                          background: t.concluida ? 'var(--color-primary)' : 'transparent',
                          borderColor: t.concluida ? 'var(--color-primary)' : 'var(--color-secondary)',
                        }}
                      >
                        {t.concluida && <Icon name="check" size={12} color="#fff" />}
                      </button>
                      <div style={styles.itemText}>
                        <span style={{ ...styles.itemTitle, textDecoration: t.concluida ? 'line-through' : 'none', color: t.concluida ? 'var(--color-text-soft)' : 'var(--color-text)' }}>
                          {t.titulo}
                        </span>
                        {t.prazo && <span style={styles.itemDate}>{t.prazo}</span>}
                      </div>
                      {!readOnly && (
                        <button onClick={() => excluir(t.id)} style={styles.btnIcon}>
                          <Icon name="trash" size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          ))}
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return getPainelServerSideProps(context);
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '20px' },
  addBox: { display: 'flex', gap: '8px', marginBottom: '20px' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', fontSize: '14px', fontFamily: 'var(--font-body)' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-soft)' },
  section: { marginBottom: '20px' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '10px' },
  list: { background: '#fff', borderRadius: '12px', border: '1px solid var(--color-secondary)', overflow: 'hidden' },
  item: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--color-secondary)' },
  checkbox: { width: '20px', height: '20px', borderRadius: '4px', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: 'none' },
  itemText: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  itemTitle: { fontSize: '14px', fontWeight: 500 },
  itemDate: { fontSize: '11px', color: 'var(--color-text-soft)' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};