import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';

export default function FinanceiroPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <FinanceiroContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function FinanceiroContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [itens, setItens] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (evento) buscar();
  }, [evento]);

  const buscar = async () => {
    const { data } = await supabase
      .from('financeiro')
      .select('*')
      .eq('evento_id', evento.id)
      .order('data_vencimento');
    setItens(data || []);
  };

  const salvar = async () => {
    if (readOnly) return;
    const payload = {
      ...form,
      evento_id: evento.id,
      valor_estimado: Number(form.valor_estimado) || 0,
      valor_real: Number(form.valor_real) || 0,
    };
    if (form.id) {
      await supabase.from('financeiro').update(payload).eq('id', form.id);
    } else {
      await supabase.from('financeiro').insert(payload);
    }
    setModalAberto(false);
    setForm({});
    buscar();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir item?')) return;
    await supabase.from('financeiro').delete().eq('id', id);
    buscar();
  };

  const togglePago = async (id, pago) => {
    if (readOnly) return;
    await supabase.from('financeiro').update({ pago: !pago }).eq('id', id);
    buscar();
  };

  const resumo = useMemo(() => {
    const totalOrcamento = evento?.orcamento_total || 0;
    const comprometido = itens.reduce((s, p) => s + (p.valor_estimado || 0), 0);
    const pago = itens.reduce((s, p) => s + (p.valor_real || 0), 0);
    const saldo = comprometido - pago;
    return { totalOrcamento, comprometido, pago, saldo };
  }, [evento, itens]);

  const porCategoria = useMemo(() => {
    const map = {};
    itens.forEach((p) => {
      const cat = p.categoria || 'Outros';
      map[cat] = (map[cat] || 0) + (p.valor_estimado || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [itens]);

  const nomeCasal = evento?.nome_evento || '';

  return (
    <>
      <Head><title>Financeiro | descomplicaí</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          <div style={styles.header}>
            <h1 style={styles.title}>Financeiro</h1>
            {!readOnly && (
              <button onClick={() => { setForm({}); setModalAberto(true); }} style={styles.btnPrimary}>
                <Icon name="plus" size={16} color="#fff" /> Adicionar
              </button>
            )}
          </div>

          <div style={styles.cards}>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Orçamento Total</span>
              <span style={styles.cardValue}>R$ {resumo.totalOrcamento.toLocaleString('pt-BR')}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Comprometido</span>
              <span style={styles.cardValue}>R$ {resumo.comprometido.toLocaleString('pt-BR')}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Pago</span>
              <span style={styles.cardValue}>R$ {resumo.pago.toLocaleString('pt-BR')}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Saldo a Pagar</span>
              <span style={styles.cardValue}>R$ {resumo.saldo.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Distribuição por Categoria</h2>
            <div style={styles.chart}>
              {porCategoria.map(([cat, val]) => {
                const pct = resumo.comprometido > 0 ? (val / resumo.comprometido) * 100 : 0;
                return (
                  <div key={cat} style={styles.chartRow}>
                    <span style={styles.chartLabel}>{cat}</span>
                    <div style={styles.chartTrack}>
                      <div style={{ ...styles.chartFill, width: `${pct}%` }} />
                    </div>
                    <span style={styles.chartValue}>R$ {val.toLocaleString('pt-BR')}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Itens do Orçamento</h2>
            <div style={styles.list}>
              {itens.map((p) => {
                const saldo = (p.valor_estimado || 0) - (p.valor_real || 0);
                return (
                  <div key={p.id} style={{ ...styles.listItem, opacity: p.pago ? 0.7 : 1 }}>
                    <div style={styles.listInfo}>
                      <span style={styles.listName}>{p.descricao || p.categoria || 'Item'}</span>
                      <span style={styles.listDate}>
                        <Icon name="calendar" size={12} /> {p.data_vencimento || 'Sem data'}
                        {p.categoria && <span style={styles.tag}> · {p.categoria}</span>}
                      </span>
                    </div>
                    <div style={styles.listValores}>
                      <span style={styles.listValue}>R$ {saldo.toLocaleString('pt-BR')}</span>
                      <div style={styles.listAcoes}>
                        <button
                          onClick={() => togglePago(p.id, p.pago)}
                          style={{ ...styles.btnPago, background: p.pago ? '#2E7D32' : 'var(--color-secondary)' }}
                        >
                          {p.pago ? 'Pago' : 'Pagar'}
                        </button>
                        {!readOnly && (
                          <>
                            <button onClick={() => { setForm(p); setModalAberto(true); }} style={styles.btnIcon}>
                              <Icon name="edit" size={14} />
                            </button>
                            <button onClick={() => excluir(p.id)} style={styles.btnIcon}>
                              <Icon name="trash" size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {modalAberto && !readOnly && (
        <div style={styles.modalOverlay} onClick={() => setModalAberto(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{form.id ? 'Editar' : 'Novo'} Item</h2>
            <input style={styles.input} placeholder="Descrição" value={form.descricao || ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            <input style={styles.input} placeholder="Categoria" value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            <input style={styles.input} placeholder="Valor Estimado" type="number" value={form.valor_estimado || ''} onChange={(e) => setForm({ ...form, valor_estimado: Number(e.target.value) })} />
            <input style={styles.input} placeholder="Valor Real (pago)" type="number" value={form.valor_real || ''} onChange={(e) => setForm({ ...form, valor_real: Number(e.target.value) })} />
            <input style={styles.input} placeholder="Data de Vencimento" type="date" value={form.data_vencimento || ''} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} />
            <label style={styles.checkboxLabel}>
              <input type="checkbox" checked={form.pago || false} onChange={(e) => setForm({ ...form, pago: e.target.checked })} style={styles.checkbox} />
              Já foi pago
            </label>
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
  page: { minHeight: '100vh', background: 'var(--color-fundo)', paddingTop: '52px' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)' },
  cards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' },
  cardLabel: { fontSize: '12px', color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardValue: { fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-primary)', marginBottom: '12px' },
  chart: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' },
  chartRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  chartLabel: { width: '100px', fontSize: '12px', color: 'var(--color-text)', flexShrink: 0 },
  chartTrack: { flex: 1, height: '8px', background: 'var(--color-secondary)', borderRadius: '4px', overflow: 'hidden' },
  chartFill: { height: '100%', background: 'var(--color-primary)', borderRadius: '4px' },
  chartValue: { width: '80px', fontSize: '12px', color: 'var(--color-text-soft)', textAlign: 'right', flexShrink: 0 },
  list: { background: '#fff', borderRadius: '12px', border: '1px solid var(--color-secondary)', overflow: 'hidden' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-secondary)' },
  listInfo: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  listName: { fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' },
  listDate: { fontSize: '12px', color: 'var(--color-text-soft)', display: 'flex', alignItems: 'center', gap: '4px' },
  tag: { fontSize: '11px', color: 'var(--color-text-soft)' },
  listValores: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  listValue: { fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' },
  listAcoes: { display: 'flex', gap: '6px', alignItems: 'center' },
  btnPago: { padding: '4px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#fff' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  btnSecondary: { background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-soft)' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' },
  modal: { background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-primary)', marginBottom: '16px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', marginBottom: '10px', fontSize: '14px', fontFamily: 'var(--font-body)' },
  modalBotoes: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text)', marginBottom: '10px', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
};