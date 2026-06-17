import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

export default function ConvidadosPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <ConvidadosContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function ConvidadosContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [convidados, setConvidados] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('');
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    if (evento) buscar();
  }, [evento]);

  const buscar = async () => {
    const { data } = await supabase
      .from('convidados')
      .select('*')
      .eq('evento_id', evento.id)
      .order('nome');
    setConvidados(data || []);
  };

  const adicionar = async () => {
    if (readOnly || !novoNome.trim()) return;
    await supabase.from('convidados').insert({
      evento_id: evento.id,
      nome: novoNome,
      grupo: novoGrupo || 'Geral',
      status: 'pendente',
    });
    setNovoNome('');
    setNovoGrupo('');
    buscar();
  };

  const atualizarStatus = async (id, status) => {
    if (readOnly) return;
    await supabase.from('convidados').update({ status }).eq('id', id);
    buscar();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir convidado?')) return;
    await supabase.from('convidados').delete().eq('id', id);
    buscar();
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'Grupo', 'Telefone', 'Status', 'Mesa'];
    const rows = convidados.map(c => [c.nome, c.grupo, c.telefone || '', c.status, c.mesa || '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convidados-${evento?.nome_pessoa1 || 'casamento'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resumo = {
    total: convidados.length,
    confirmados: convidados.filter(c => c.status === 'confirmado').length,
    pendentes: convidados.filter(c => c.status === 'pendente').length,
    recusados: convidados.filter(c => c.status === 'recusado').length,
  };

  const filtrados = filtro === 'todos'
    ? convidados
    : convidados.filter(c => c.status === filtro);

  const nomeCasal = evento
    ? `${evento.nome_pessoa1 || ''} & ${evento.nome_pessoa2 || ''}`
    : '';

  return (
    <>
      <Head><title>Convidados | descomplicaí</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          <h1 style={styles.title}>Convidados</h1>

          <div style={styles.resumo}>
            <div style={styles.resumoCard}><span style={styles.resumoValue}>{resumo.total}</span><span style={styles.resumoLabel}>Total</span></div>
            <div style={styles.resumoCard}><span style={{ ...styles.resumoValue, color: '#2E7D32' }}>{resumo.confirmados}</span><span style={styles.resumoLabel}>Confirmados</span></div>
            <div style={styles.resumoCard}><span style={{ ...styles.resumoValue, color: '#F9A825' }}>{resumo.pendentes}</span><span style={styles.resumoLabel}>Pendentes</span></div>
            <div style={styles.resumoCard}><span style={{ ...styles.resumoValue, color: '#C62828' }}>{resumo.recusados}</span><span style={styles.resumoLabel}>Recusados</span></div>
          </div>

          {!readOnly && (
            <div style={styles.addBox}>
              <input style={styles.input} placeholder="Nome do convidado" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionar()} />
              <input style={{ ...styles.input, width: '120px' }} placeholder="Grupo" value={novoGrupo} onChange={(e) => setNovoGrupo(e.target.value)} />
              <button onClick={adicionar} style={styles.btnPrimary}><Icon name="plus" size={16} color="#fff" /></button>
            </div>
          )}

          <button onClick={exportarCSV} style={styles.btnSecondary}><Icon name="download" size={16} /> CSV</button>

          <div style={styles.filtros}>
            {['todos', 'confirmado', 'pendente', 'recusado'].map((f) => (
              <button key={f} onClick={() => setFiltro(f)} style={{ ...styles.filtroBtn, background: filtro === f ? 'var(--color-primary)' : 'var(--color-secondary)', color: filtro === f ? '#fff' : 'var(--color-text)' }}>
                {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div style={styles.list}>
            {filtrados.map((c) => (
              <div key={c.id} style={styles.item}>
                <div style={styles.itemInfo}>
                  <span style={styles.itemNome}>{c.nome}</span>
                  <span style={styles.itemGrupo}>{c.grupo} {c.mesa && `· Mesa ${c.mesa}`}</span>
                </div>
                <div style={styles.itemAcoes}>
                  <select value={c.status} onChange={(e) => atualizarStatus(c.id, e.target.value)} style={styles.select}>
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="recusado">Recusado</option>
                  </select>
                  {!readOnly && (
                    <button onClick={() => excluir(c.id)} style={styles.btnIcon}><Icon name="trash" size={14} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
  resumo: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  resumoCard: { background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid var(--color-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  resumoValue: { fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' },
  resumoLabel: { fontSize: '11px', color: 'var(--color-text-soft)', textTransform: 'uppercase' },
  addBox: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', fontSize: '14px', minWidth: '150px' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnSecondary: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-soft)' },
  filtros: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  filtroBtn: { padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
  list: { background: '#fff', borderRadius: '12px', border: '1px solid var(--color-secondary)', overflow: 'hidden' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-secondary)' },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  itemNome: { fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' },
  itemGrupo: { fontSize: '12px', color: 'var(--color-text-soft)' },
  itemAcoes: { display: 'flex', alignItems: 'center', gap: '8px' },
  select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-secondary)', fontSize: '13px', background: '#fff' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};