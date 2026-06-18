import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';

const STATUS_LABELS = {
  a_contratar: 'A contratar',
  negociando: 'Negociando',
  contratado: 'Contratado',
  pago: 'Pago',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
};

const STATUS_COLORS = {
  a_contratar: '#8B6F5E',
  negociando: '#1565C0',
  contratado: '#2E7D32',
  pago: '#00838F',
  pendente: '#F9A825',
  cancelado: '#C62828',
};

export default function FornecedoresPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <FornecedoresContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function FornecedoresContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (evento) buscar();
  }, [evento]);

  const buscar = async () => {
    const { data } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('evento_id', evento.id)
      .order('categoria');
    setFornecedores(data || []);
  };

  const salvar = async () => {
    if (readOnly) return;
    const payload = { ...form, evento_id: evento.id };
    if (form.id) {
      await supabase.from('fornecedores').update(payload).eq('id', form.id);
    } else {
      await supabase.from('fornecedores').insert(payload);
    }
    setModalAberto(false);
    setForm({});
    buscar();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir fornecedor?')) return;
    await supabase.from('fornecedores').delete().eq('id', id);
    buscar();
  };

  const nomeCasal = evento?.nome_evento || '';

  return (
    <>
      <Head><title>Fornecedores | descomplicaí</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          <div style={styles.header}>
            <h1 style={styles.title}>Fornecedores</h1>
            {!readOnly && (
              <button onClick={() => { setForm({}); setModalAberto(true); }} style={styles.btnPrimary}>
                <Icon name="plus" size={16} color="#fff" /> Adicionar
              </button>
            )}
          </div>

          <div style={styles.grid}>
            {fornecedores.map((f) => (
              <div key={f.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.categoria}>{f.categoria}</span>
                  <span style={{ ...styles.badge, background: STATUS_COLORS[f.status] || '#8B6F5E' }}>
                    {STATUS_LABELS[f.status] || f.status}
                  </span>
                </div>
                <h3 style={styles.nome}>{f.nome}</h3>
                <p style={styles.empresa}>{f.empresa}</p>

                <div style={styles.contatos}>
                  {f.telefone && <span><Icon name="phone" size={12} /> {f.telefone}</span>}
                  {f.email && <span><Icon name="mail" size={12} /> {f.email}</span>}
                </div>

                <div style={styles.valores}>
                  <span>Total: <strong>R$ {(f.valor_total || 0).toLocaleString('pt-BR')}</strong></span>
                  <span>Entrada: R$ {(f.valor_entrada || 0).toLocaleString('pt-BR')}</span>
                  <span>Saldo: R$ {(f.valor_saldo || 0).toLocaleString('pt-BR')}</span>
                </div>

                {!readOnly && (
                  <div style={styles.acoes}>
                    <button onClick={() => { setForm(f); setModalAberto(true); }} style={styles.btnIcon}>
                      <Icon name="edit" size={16} />
                    </button>
                    <button onClick={() => excluir(f.id)} style={styles.btnIcon}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {modalAberto && !readOnly && (
        <div style={styles.modalOverlay} onClick={() => setModalAberto(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{form.id ? 'Editar' : 'Novo'} Fornecedor</h2>
            <input style={styles.input} placeholder="Nome" value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <input style={styles.input} placeholder="Empresa" value={form.empresa || ''} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
            <input style={styles.input} placeholder="Categoria" value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            <input style={styles.input} placeholder="Telefone" value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <input style={styles.input} placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input style={styles.input} placeholder="Instagram" value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            <input style={styles.input} placeholder="Site" value={form.site || ''} onChange={(e) => setForm({ ...form, site: e.target.value })} />
            <input style={styles.input} placeholder="Serviço" value={form.servico || ''} onChange={(e) => setForm({ ...form, servico: e.target.value })} />
            <input style={styles.input} placeholder="Valor Total" type="number" value={form.valor_total || ''} onChange={(e) => setForm({ ...form, valor_total: Number(e.target.value) })} />
            <input style={styles.input} placeholder="Entrada" type="number" value={form.valor_entrada || ''} onChange={(e) => setForm({ ...form, valor_entrada: Number(e.target.value) })} />
            <select style={styles.input} value={form.status || 'a_contratar'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <textarea style={styles.textarea} placeholder="Notas" value={form.notas || ''} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            <div style={styles.modalBotoes}>
              <button onClick={() => setModalAberto(false)} style={styles.btnSecondary}>Cancelar</button>
              <button onClick={salvar} style={styles.btnPrimary}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  btnSecondary: { background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-soft)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px' },
  card: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  categoria: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-soft)' },
  badge: { color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 },
  nome: { fontSize: '17px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' },
  empresa: { fontSize: '13px', color: 'var(--color-text-soft)', marginBottom: '10px' },
  contatos: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--color-text-soft)', marginBottom: '10px' },
  valores: { display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--color-text-soft)', marginBottom: '10px', flexWrap: 'wrap' },
  acoes: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' },
  modal: { background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-primary)', marginBottom: '16px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', marginBottom: '10px', fontSize: '14px', fontFamily: 'var(--font-body)' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', marginBottom: '10px', fontSize: '14px', fontFamily: 'var(--font-body)', minHeight: '80px', resize: 'vertical' },
  modalBotoes: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};