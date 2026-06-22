import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import {
  CATEGORIAS_PRINCIPAIS,
  getSubcategoriasPorPrincipal,
  getLabelSubcategoria,
  getLabelCategoriaPrincipal,
  getLabelCategoriaPrincipalPorId,
  STATUS_FORNECEDOR,
} from '../../utils/catalogoFornecedores';

export default function FinanceiroPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <FinanceiroContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

const PIZZA_COLORS = ['#8B6F5E', '#2E7D32', '#00838F', '#F9A825', '#C62828', '#7B1FA2', '#1565C0', '#E65100'];

function getColorForCategory(cat, colorMap) {
  if (!colorMap[cat]) {
    const idx = Object.keys(colorMap).length % PIZZA_COLORS.length;
    colorMap[cat] = PIZZA_COLORS[idx];
  }
  return colorMap[cat];
}

function FinanceiroContent({ readOnly }) {
  const { evento, supabase } = useAuth();
  const [itens, setItens] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({});

  // Filtros e visualizacao
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [visualizacao, setVisualizacao] = useState('lista');
  const [agrupar, setAgrupar] = useState(false);

  useEffect(() => {
    if (evento) {
      sincronizarTodos();
    }
  }, [evento]);

  const sincronizarTodos = async () => {
    try {
      await fetch('/api/financeiro/sincronizar-todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: evento.id }),
      });
    } catch (err) {
      console.error('Erro ao sincronizar lote:', err);
    }
    buscar();
  };

  const buscar = async () => {
    const { data } = await supabase
      .from('financeiro')
      .select('*')
      .eq('evento_id', evento.id)
      .eq('fornecedor_excluido', false)
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

  const togglePago = async (e, id, pago) => {
    e.stopPropagation();
    if (readOnly) return;
    await supabase.from('financeiro').update({ pago: !pago }).eq('id', id);
    buscar();
  };

  const abrirEditar = (p) => {
    if (readOnly) return;
    setForm(p);
    setModalAberto(true);
  };

  const resumo = useMemo(() => {
    const totalOrcamento = Number(evento?.orcamento) || 0;
    const comprometido = itens.reduce((s, p) => s + (Number(p.valor_estimado) || 0), 0);
    const pago = itens.reduce((s, p) => s + (Number(p.valor_real) || 0), 0);
    const saldo = comprometido - pago;
    return { totalOrcamento, comprometido, pago, saldo };
  }, [evento, itens]);

  // Dados para grafico de pizza
  const dadosPizza = useMemo(() => {
    const map = {};
    itens.forEach((p) => {
      const cat = getLabelCategoriaPrincipal(p.categoria)
        || getLabelCategoriaPrincipalPorId(p.categoria_principal)
        || getLabelSubcategoria(p.categoria)
        || p.categoria
        || 'Outros';
      map[cat] = (map[cat] || 0) + (Number(p.valor_estimado) || 0);
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    const colorMap = {};
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, val]) => ({
        label: cat,
        valor: val,
        pct: (val / total) * 100,
        color: getColorForCategory(cat, colorMap),
      }));
  }, [itens]);

  // Filtros com status do fornecedor
  const itensFiltrados = useMemo(() => {
    let filtrados = [...itens];
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter((p) => {
        if (filtroStatus === 'pago') return p.pago;
        if (filtroStatus === 'cancelado') return p.fornecedor_excluido;
        if (filtroStatus === 'a_contratar') return !p.sincronizado && !p.pago;
        if (filtroStatus === 'em_negociacao' || filtroStatus === 'contratado') {
          return p.sincronizado && !p.pago && !p.fornecedor_excluido;
        }
        return true;
      });
    }
    if (filtroCategoria !== 'todos') {
      filtrados = filtrados.filter(f => f.categoria === filtroCategoria || f.categoria_principal === filtroCategoria);
    }
    return filtrados;
  }, [itens, filtroStatus, filtroCategoria]);

  // Agrupamento por categoria principal
  const grupos = useMemo(() => {
    if (!agrupar) return null;
    const map = {};
    itensFiltrados.forEach((item) => {
      const catPrincipal = getLabelCategoriaPrincipal(item.categoria)
        || getLabelCategoriaPrincipalPorId(item.categoria_principal)
        || getLabelSubcategoria(item.categoria)
        || item.categoria
        || 'Outro';
      if (!map[catPrincipal]) map[catPrincipal] = [];
      map[catPrincipal].push(item);
    });
    return map;
  }, [itensFiltrados, agrupar]);

  const subcategoriasDisponiveis = form.categoria_principal
    ? getSubcategoriasPorPrincipal(form.categoria_principal)
    : [];

  const nomeCasal = evento?.nome_evento || '';

  const renderCard = (p) => {
    const saldo = (Number(p.valor_estimado) || 0) - (Number(p.valor_real) || 0);
    const catPrincipal = getLabelCategoriaPrincipal(p.categoria)
      || getLabelCategoriaPrincipalPorId(p.categoria_principal)
      || getLabelSubcategoria(p.categoria)
      || p.categoria
      || 'Outro';
    const subcategoria = getLabelSubcategoria(p.categoria) || p.categoria || '';
    const statusInfo = STATUS_FORNECEDOR.find(s => {
      if (p.pago) return s.id === 'pago';
      if (p.fornecedor_excluido) return s.id === 'cancelado';
      if (p.sincronizado) return s.id === 'contratado';
      return s.id === 'a_contratar';
    });

    return (
      <div key={p.id} style={{ ...styles.cardItem, opacity: p.pago ? 0.7 : 1 }} onClick={() => abrirEditar(p)}>
        <div style={styles.cardItemHeader}>
          <span style={{ ...styles.cardItemBadge, background: statusInfo?.color || '#8B6F5E' }}>
            {statusInfo?.label || 'Pendente'}
          </span>
          <div style={styles.cardItemAcoes} onClick={(e) => e.stopPropagation()}>
            <button onClick={(e) => togglePago(e, p.id, p.pago)} style={styles.btnIcon}>
              <Icon name={p.pago ? 'check' : 'circle'} size={14} />
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
        <div style={styles.cardItemBody}>
          <span style={styles.cardItemName}>{p.descricao || subcategoria || 'Item'}</span>
          <span style={styles.cardItemCategoria}>
            {catPrincipal}{subcategoria && catPrincipal !== subcategoria ? ` -> ${subcategoria}` : ''}
          </span>
          <span style={styles.cardItemDate}>
            <Icon name="calendar" size={12} /> {p.data_vencimento || 'Sem data'}
          </span>
        </div>
        <div style={styles.cardItemFooter}>
          <span style={styles.cardItemValue}>R$ {saldo.toLocaleString('pt-BR')}</span>
        </div>
      </div>
    );
  };

  const renderListItem = (p) => {
    const saldo = (Number(p.valor_estimado) || 0) - (Number(p.valor_real) || 0);
    const catPrincipal = getLabelCategoriaPrincipal(p.categoria)
      || getLabelCategoriaPrincipalPorId(p.categoria_principal)
      || getLabelSubcategoria(p.categoria)
      || p.categoria
      || 'Outro';
    const subcategoria = getLabelSubcategoria(p.categoria) || p.categoria || '';
    const statusInfo = STATUS_FORNECEDOR.find(s => {
      if (p.pago) return s.id === 'pago';
      if (p.fornecedor_excluido) return s.id === 'cancelado';
      if (p.sincronizado) return s.id === 'contratado';
      return s.id === 'a_contratar';
    });

    return (
      <div key={p.id} style={{ ...styles.listItem, opacity: p.pago ? 0.7 : 1 }} onClick={() => abrirEditar(p)}>
        <div style={styles.listInfo}>
          <span style={styles.listName}>{p.descricao || subcategoria || 'Item'}</span>
          <span style={styles.listCategoria}>
            {catPrincipal}{subcategoria && catPrincipal !== subcategoria ? ` -> ${subcategoria}` : ''}
          </span>
          <span style={styles.listDate}>
            <Icon name="calendar" size={12} /> {p.data_vencimento || 'Sem data'}
            {p.pago && <span style={styles.tagPago}> · Pago</span>}
          </span>
        </div>
        <div style={styles.listValores}>
          <span style={styles.listValue}>R$ {saldo.toLocaleString('pt-BR')}</span>
          <div style={styles.listAcoes} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => togglePago(e, p.id, p.pago)}
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
  };

  // Constroi conic-gradient para pizza
  const getPizzaStyle = () => {
    let grad = [];
    let acc = 0;
    dadosPizza.forEach((slice) => {
      grad.push(`${slice.color} ${acc}% ${acc + slice.pct}%`);
      acc += slice.pct;
    });
    return { background: `conic-gradient(${grad.join(', ')})` };
  };

  return (
    <>
      <Head><title>Financeiro | descomplicai</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          <div style={styles.header}>
            <h1 style={styles.title}>Financeiro</h1>
            {!readOnly && (
              <button onClick={() => { setForm({}); setModalAberto(true); }} style={styles.btnAdd}>
                <Icon name="plus" size={16} color="#fff" /> Adicionar
              </button>
            )}
          </div>

          <div style={styles.cards}>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Orcamento Total</span>
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

          {/* Filtros */}
          <div style={styles.filtrosBar}>
            <div style={styles.filtroGrupo}>
              <label style={styles.filtroLabel}>Status</label>
              <select style={styles.filtroSelect} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option value="todos">Todos</option>
                {STATUS_FORNECEDOR.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.filtroGrupo}>
              <label style={styles.filtroLabel}>Categoria</label>
              <select style={styles.filtroSelect} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                <option value="todos">Todas</option>
                {CATEGORIAS_PRINCIPAIS.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.filtroGrupo}>
              <label style={styles.filtroLabel}>Visualizacao</label>
              <div style={styles.toggleGroup}>
                <button onClick={() => setVisualizacao('lista')} style={{ ...styles.toggleBtn, ...(visualizacao === 'lista' ? styles.toggleAtivo : {}) }} title="Lista">
                  <Icon name="list" size={16} />
                </button>
                <button onClick={() => setVisualizacao('grade')} style={{ ...styles.toggleBtn, ...(visualizacao === 'grade' ? styles.toggleAtivo : {}) }} title="Grade">
                  <Icon name="grid" size={16} />
                </button>
              </div>
            </div>
            <div style={styles.filtroGrupo}>
              <label style={styles.filtroLabel}>
                <input type="checkbox" checked={agrupar} onChange={(e) => setAgrupar(e.target.checked)} style={styles.checkboxFiltro} />
                Agrupar por categoria
              </label>
            </div>
          </div>

          {/* Grafico de pizza */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Distribuicao por Categoria</h2>
            <div style={styles.pizzaContainer}>
              <div style={styles.pizzaChart}>
                <div style={{ ...styles.pizza, ...getPizzaStyle() }} />
              </div>
              <div style={styles.pizzaLegend}>
                {dadosPizza.map((slice) => (
                  <div key={slice.label} style={styles.pizzaLegendItem}>
                    <span style={{ ...styles.pizzaLegendDot, background: slice.color }} />
                    <span style={styles.pizzaLegendLabel}>{slice.label}</span>
                    <span style={styles.pizzaLegendValue}>{slice.pct.toFixed(1)}% · R$ {slice.valor.toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Itens do Orcamento</h2>
            {agrupar && grupos ? (
              <div style={styles.gruposContainer}>
                {Object.entries(grupos).map(([categoriaPrincipal, itensGrupo]) => (
                  <div key={categoriaPrincipal} style={styles.grupo}>
                    <h3 style={styles.grupoTitulo}>{categoriaPrincipal}</h3>
                    <div style={visualizacao === 'grade' ? styles.gridGrade : styles.list}>
                      {itensGrupo.map(visualizacao === 'grade' ? renderCard : renderListItem)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={visualizacao === 'grade' ? styles.gridGrade : styles.list}>
                {itensFiltrados.map(visualizacao === 'grade' ? renderCard : renderListItem)}
              </div>
            )}
          </section>
        </main>
      </div>

      {modalAberto && !readOnly && (
        <div style={styles.modalOverlay} onClick={() => setModalAberto(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{form.id ? 'Editar' : 'Novo'} Item</h2>
              <button onClick={() => setModalAberto(false)} style={styles.btnFechar}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Descricao</label>
              <input style={styles.input} placeholder="Ex: Buffet, Fotografia..." value={form.descricao || ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Categoria Principal</label>
              <select style={styles.select} value={form.categoria_principal || ''} onChange={(e) => setForm({ ...form, categoria_principal: e.target.value, categoria: '' })}>
                <option value="">Selecione...</option>
                {CATEGORIAS_PRINCIPAIS.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {subcategoriasDisponiveis.length > 0 && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Subcategoria</label>
                <select style={styles.select} value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                  <option value="">Selecione...</option>
                  {subcategoriasDisponiveis.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={styles.row}>
              <div style={styles.col}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor Estimado</label>
                  <input style={styles.input} placeholder="0" type="number" value={form.valor_estimado || ''} onChange={(e) => setForm({ ...form, valor_estimado: Number(e.target.value) })} />
                </div>
              </div>
              <div style={styles.col}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor Real (pago)</label>
                  <input style={styles.input} placeholder="0" type="number" value={form.valor_real || ''} onChange={(e) => setForm({ ...form, valor_real: Number(e.target.value) })} />
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Vencimento</label>
              <input style={styles.input} type="date" value={form.data_vencimento || ''} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} />
            </div>

            <label style={styles.checkboxLabel}>
              <input type="checkbox" checked={form.pago || false} onChange={(e) => setForm({ ...form, pago: e.target.checked })} style={styles.checkbox} />
              Ja foi pago
            </label>

            <div style={styles.modalBotoes}>
              <button onClick={() => setModalAberto(false)} style={styles.btnCancel}>Cancelar</button>
              <button onClick={salvar} style={styles.btnSave}>Salvar</button>
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
  pizzaContainer: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' },
  pizzaChart: { width: '200px', height: '200px', flexShrink: 0 },
  pizza: { width: '100%', height: '100%', borderRadius: '50%' },
  pizzaLegend: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '200px' },
  pizzaLegendItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  pizzaLegendDot: { width: '12px', height: '12px', borderRadius: '3px', flexShrink: 0 },
  pizzaLegendLabel: { fontSize: '13px', color: 'var(--color-text)', fontFamily: 'var(--font-body)', flex: 1 },
  pizzaLegendValue: { fontSize: '12px', color: 'var(--color-text-soft)', fontFamily: 'var(--font-body)' },
  list: { background: '#fff', borderRadius: '12px', border: '1px solid var(--color-secondary)', overflow: 'hidden' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-secondary)', cursor: 'pointer' },
  listInfo: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  listName: { fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' },
  listCategoria: { fontSize: '11px', color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  listDate: { fontSize: '12px', color: 'var(--color-text-soft)', display: 'flex', alignItems: 'center', gap: '4px' },
  tagPago: { fontSize: '11px', color: '#2E7D32', fontWeight: 600 },
  listValores: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  listValue: { fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' },
  listAcoes: { display: 'flex', gap: '6px', alignItems: 'center' },
  btnPago: { padding: '4px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#fff' },
  btnAdd: { display: 'flex', alignItems: 'center', gap: '6px', background: '#8B6F5E', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  btnCancel: { background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnSave: { display: 'flex', alignItems: 'center', gap: '6px', background: '#8B6F5E', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-soft)' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' },
  modal: { background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-primary)', margin: 0 },
  btnFechar: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-soft)' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '6px', fontFamily: 'var(--font-body)' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--color-text-soft)', fontSize: '14px', fontFamily: 'var(--font-body)', background: '#fff', color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--color-text-soft)', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--color-text)', background: '#fff', outline: 'none', boxSizing: 'border-box' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  col: { flex: 1, minWidth: '180px' },
  modalBotoes: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text)', marginBottom: '10px', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  filtrosBar: { display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-secondary)' },
  filtroGrupo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  filtroLabel: { fontSize: '12px', color: 'var(--color-text-soft)', fontFamily: 'var(--font-body)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  filtroSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #C4B5A5', fontSize: '14px', fontFamily: 'var(--font-body)', background: '#fff', outline: 'none', minWidth: '140px' },
  toggleGroup: { display: 'flex', gap: '2px', border: '1px solid #C4B5A5', borderRadius: '8px', overflow: 'hidden' },
  toggleBtn: { padding: '8px 12px', background: '#fff', border: 'none', cursor: 'pointer', color: 'var(--color-text-soft)' },
  toggleAtivo: { background: '#8B6F5E', color: '#fff' },
  checkboxFiltro: { width: '14px', height: '14px', cursor: 'pointer' },
  gruposContainer: { display: 'flex', flexDirection: 'column', gap: '24px' },
  grupo: {},
  grupoTitulo: { fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-primary)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--color-secondary)' },
  gridGrade: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' },
  cardItem: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardItemBadge: { color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 },
  cardItemAcoes: { display: 'flex', gap: '4px' },
  cardItemBody: { display: 'flex', flexDirection: 'column', gap: '4px' },
  cardItemName: { fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' },
  cardItemCategoria: { fontSize: '11px', color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardItemDate: { fontSize: '12px', color: 'var(--color-text-soft)', display: 'flex', alignItems: 'center', gap: '4px' },
  cardItemFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: '4px' },
  cardItemValue: { fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' },
};