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
import fetchAPI from '../../utils/fetchAPI';

const BRAND_PALETTE = [
  '#8B6F5E', '#10B981', '#B89A8A', '#0D9668',
  '#D4B8AC', '#6B4F41', '#34D399', '#C4956A',
];

const formatarMoeda = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function getCorCategoria(idx) {
  return BRAND_PALETTE[idx % BRAND_PALETTE.length];
}

export default function FinanceiroPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <FinanceiroContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function FinanceiroContent({ readOnly }) {
  const { evento, supabase } = useAuth();
  const [itens, setItens] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({});
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [agrupar, setAgrupar] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (evento) sincronizarTodos();
  }, [evento]);

  const sincronizarTodos = async () => {
    try {
      await fetchAPI('/api/financeiro/sincronizar-todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: evento.id }),
      });
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
    }
    buscar();
  };

  const buscar = async () => {
    setCarregando(true);
    // CORRECAO: buscar sem filtro de fornecedor_excluido no Supabase
    // null !== false — filtrar no cliente para nao perder linhas com null
    const { data } = await supabase
      .from('financeiro')
      .select('*')
      .eq('evento_id', evento.id)
      .order('data_vencimento');
    const ativos = (data || []).filter(item => item.fornecedor_excluido !== true);
    setItens(ativos);
    setCarregando(false);
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
    if (readOnly || !confirm('Excluir item financeiro?')) return;
    await supabase.from('financeiro').delete().eq('id', id);
    buscar();
  };

  const togglePago = async (e, id, pago) => {
    e.stopPropagation();
    if (readOnly) return;
    await supabase.from('financeiro').update({ pago: !pago }).eq('id', id);
    buscar();
  };

  const resumo = useMemo(() => {
    const totalOrcamento = Number(evento?.orcamento) || 0;
    const comprometido = itens.reduce((s, p) => s + (Number(p.valor_estimado) || 0), 0);
    const pago = itens.reduce((s, p) => s + (Number(p.valor_real) || 0), 0);
    const saldo = comprometido - pago;
    const pctUsado = totalOrcamento > 0
      ? Math.min(100, Math.round((comprometido / totalOrcamento) * 100))
      : 0;
    return { totalOrcamento, comprometido, pago, saldo, pctUsado };
  }, [evento, itens]);

  const dadosPizza = useMemo(() => {
    const map = {};
    itens.forEach((p) => {
      const cat =
        getLabelCategoriaPrincipal(p.categoria) ||
        getLabelCategoriaPrincipalPorId(p.categoria_principal) ||
        getLabelSubcategoria(p.categoria) ||
        p.categoria ||
        'Outros';
      map[cat] = (map[cat] || 0) + (Number(p.valor_estimado) || 0);
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, val], idx) => ({
        label: cat,
        valor: val,
        pct: (val / total) * 100,
        cor: getCorCategoria(idx),
      }));
  }, [itens]);

  const pizzaGradient = useMemo(() => {
    let acc = 0;
    const stops = dadosPizza.map((s) => {
      const inicio = acc;
      acc += s.pct;
      return `${s.cor} ${inicio.toFixed(1)}% ${acc.toFixed(1)}%`;
    });
    return stops.length > 0
      ? `conic-gradient(${stops.join(', ')})`
      : `conic-gradient(#F0EDE9 0% 100%)`;
  }, [dadosPizza]);

  const itensFiltrados = useMemo(() => {
    return itens.filter((p) => {
      if (filtroStatus === 'pago' && !p.pago) return false;
      if (filtroStatus === 'a_contratar' && (p.sincronizado || p.pago)) return false;
      if (filtroStatus === 'contratado' && (!p.sincronizado || p.pago)) return false;
      if (filtroStatus === 'pendente' && p.pago) return false;
      if (filtroCategoria !== 'todos') {
        if (p.categoria !== filtroCategoria && p.categoria_principal !== filtroCategoria) return false;
      }
      return true;
    });
  }, [itens, filtroStatus, filtroCategoria]);

  const grupos = useMemo(() => {
    if (!agrupar) return null;
    const map = {};
    itensFiltrados.forEach((item) => {
      const cat =
        getLabelCategoriaPrincipal(item.categoria) ||
        getLabelCategoriaPrincipalPorId(item.categoria_principal) ||
        item.categoria ||
        'Outro';
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [itensFiltrados, agrupar]);

  const subcategoriasDisponiveis = form.categoria_principal
    ? getSubcategoriasPorPrincipal(form.categoria_principal)
    : [];

  const nomeCasal = evento?.nome_evento || '';

  const resolverStatus = (p) => {
    if (p.pago) return { label: 'Pago', cor: '#10B981', bg: '#F0FDF9', texto: '#065F46' };
    if (p.sincronizado) return { label: 'Contratado', cor: '#8B6F5E', bg: '#FAF8F7', texto: '#5C4A41' };
    return { label: 'A contratar', cor: '#C4B5A5', bg: '#F9F7F4', texto: '#8B6F5E' };
  };

  const renderItem = (p) => {
    const status = resolverStatus(p);
    const saldo = (Number(p.valor_estimado) || 0) - (Number(p.valor_real) || 0);
    const catLabel =
      getLabelCategoriaPrincipal(p.categoria) ||
      getLabelCategoriaPrincipalPorId(p.categoria_principal) ||
      p.categoria ||
      'Outro';
    const vencimento = p.data_vencimento
      ? new Date(p.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')
      : null;
    const vencido = p.data_vencimento && !p.pago && new Date(p.data_vencimento) < new Date();

    return (
      <div
        key={p.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid #F0EDE9',
          cursor: readOnly ? 'default' : 'pointer',
          background: 'white',
          opacity: p.pago ? 0.75 : 1,
          transition: 'background 0.1s',
        }}
        onClick={() => !readOnly && (setForm(p), setModalAberto(true))}
        onMouseEnter={e => { if (!readOnly) e.currentTarget.style.background = '#FAF8F7'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
      >
        <div style={{
          width: 3, height: 40, borderRadius: 2,
          background: status.cor, marginRight: 16, flexShrink: 0,
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1714', marginBottom: 3 }}>
            {p.descricao || catLabel}
          </div>
          <div style={{
            fontSize: 12, color: '#A89B91',
            display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <span>{catLabel}</span>
            {vencimento && (
              <>
                <span style={{ color: '#D4C8C0' }}>·</span>
                <span style={{ color: vencido ? '#E53E3E' : '#A89B91' }}>
                  {vencido ? 'venceu ' : 'vence '}{vencimento}
                </span>
              </>
            )}
          </div>
        </div>

        <span style={{
          fontSize: 11, fontWeight: 500,
          padding: '4px 10px', borderRadius: 20,
          background: status.bg, color: status.texto,
          border: `1px solid ${status.cor}40`,
          marginRight: 16, flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          {status.label}
        </span>

        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 100 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#8B6F5E' }}>
            {formatarMoeda(p.valor_estimado)}
          </div>
          {p.pago && (
            <div style={{ fontSize: 11, color: '#10B981', marginTop: 1 }}>
              pago {formatarMoeda(p.valor_real)}
            </div>
          )}
          {!p.pago && saldo > 0 && (
            <div style={{ fontSize: 11, color: '#A89B91', marginTop: 1 }}>
              saldo {formatarMoeda(saldo)}
            </div>
          )}
        </div>

        <div
          style={{ display: 'flex', gap: 4, marginLeft: 12, flexShrink: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={(e) => togglePago(e, p.id, p.pago)}
            title={p.pago ? 'Desfazer pagamento' : 'Marcar como pago'}
            style={{
              width: 30, height: 30, borderRadius: 6, cursor: 'pointer',
              border: p.pago ? '1px solid #10B981' : '1px solid #D4C8C0',
              background: p.pago ? '#F0FDF9' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: p.pago ? '#10B981' : '#C4B5A5',
            }}
          >
            <Icon name="check" size={13} />
          </button>
          {!readOnly && (
            <button
              onClick={() => excluir(p.id)}
              title="Excluir"
              style={{
                width: 30, height: 30, borderRadius: 6, cursor: 'pointer',
                border: '1px solid #D4C8C0', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#C4B5A5',
              }}
            >
              <Icon name="trash" size={13} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head><title>Financeiro | descomplicaí</title></Head>
      <div style={{ minHeight: '100vh', background: '#F9F7F4', paddingTop: 52 }}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>

          {readOnly && (
            <div style={{
              background: '#FFF8F0', border: '1px solid #EDD9BE',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              textAlign: 'center', fontSize: 13, color: '#8B6F5E',
            }}>
              Modo somente leitura. Assine para editar.
            </div>
          )}

          {/* Cabecalho */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 24,
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontSize: 26, fontWeight: 400,
                color: '#8B6F5E', margin: 0,
              }}>
                Financeiro
              </h1>
              {carregando ? null : (
                <p style={{ fontSize: 13, color: '#A89B91', margin: '4px 0 0' }}>
                  {itens.length} {itens.length === 1 ? 'item' : 'itens'} no orçamento
                </p>
              )}
            </div>
            {!readOnly && (
              <button
                onClick={() => { setForm({}); setModalAberto(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#8B6F5E', color: 'white', border: 'none',
                  padding: '10px 18px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 14, fontWeight: 500,
                }}
              >
                <Icon name="plus" size={16} color="white" />
                Adicionar
              </button>
            )}
          </div>

          {/* Cards de resumo */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12, marginBottom: 24,
          }}>
            {[
              { label: 'Orçamento total', valor: resumo.totalOrcamento, cor: '#8B6F5E' },
              { label: 'Comprometido', valor: resumo.comprometido, cor: '#C4956A' },
              { label: 'Pago', valor: resumo.pago, cor: '#10B981' },
              { label: 'Saldo a pagar', valor: resumo.saldo, cor: '#6B4F41' },
            ].map(({ label, valor, cor }) => (
              <div key={label} style={{
                background: 'white', borderRadius: 12,
                border: '1px solid #F0EDE9', padding: '16px 20px',
              }}>
                <div style={{ fontSize: 12, color: '#A89B91', marginBottom: 6, fontWeight: 500 }}>
                  {label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: cor }}>
                  {formatarMoeda(valor)}
                </div>
              </div>
            ))}
          </div>

          {/* Barra de comprometimento */}
          {resumo.totalOrcamento > 0 && (
            <div style={{
              background: 'white', borderRadius: 12,
              border: '1px solid #F0EDE9', padding: '16px 20px', marginBottom: 24,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, color: '#A89B91', marginBottom: 10,
              }}>
                <span>Orçamento utilizado</span>
                <span style={{ fontWeight: 600, color: resumo.pctUsado > 90 ? '#E53E3E' : '#8B6F5E' }}>
                  {resumo.pctUsado}%
                </span>
              </div>
              <div style={{
                height: 6, background: '#F0EDE9', borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${resumo.pctUsado}%`,
                  background: resumo.pctUsado > 90 ? '#E53E3E' : resumo.pctUsado > 70 ? '#C4956A' : '#10B981',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          {/* Pizza + legenda */}
          {dadosPizza.length > 0 && (
            <div style={{
              background: 'white', borderRadius: 12,
              border: '1px solid #F0EDE9', padding: '20px 24px',
              marginBottom: 24, display: 'flex',
              gap: 32, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
                <div style={{
                  width: 160, height: 160, borderRadius: '50%',
                  background: pizzaGradient,
                }} />
                {/* Buraco central */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'white',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, color: '#A89B91' }}>total</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#8B6F5E' }}>
                    {formatarMoeda(resumo.comprometido).replace('R$', '').trim()}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
                <div style={{
                  fontSize: 12, fontWeight: 500, color: '#A89B91',
                  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4,
                }}>
                  por categoria
                </div>
                {dadosPizza.map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 2,
                      background: s.cor, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, color: '#1A1714', flex: 1 }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: '#A89B91' }}>
                      {s.pct.toFixed(0)}%
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#8B6F5E', minWidth: 80, textAlign: 'right' }}>
                      {formatarMoeda(s.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtros */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: '1px solid #F0EDE9', padding: '14px 20px',
            marginBottom: 16, display: 'flex',
            gap: 16, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'a_contratar', label: 'A contratar' },
                { id: 'contratado', label: 'Contratados' },
                { id: 'pendente', label: 'Pendentes' },
                { id: 'pago', label: 'Pagos' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFiltroStatus(id)}
                  style={{
                    padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, transition: 'all 0.1s',
                    border: filtroStatus === id ? '1px solid #8B6F5E' : '1px solid #D4C8C0',
                    background: filtroStatus === id ? '#8B6F5E' : 'white',
                    color: filtroStatus === id ? 'white' : '#8B6F5E',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
              <select
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  border: '1px solid #D4C8C0', fontSize: 12,
                  color: '#1A1714', background: 'white', cursor: 'pointer',
                }}
              >
                <option value="todos">Todas as categorias</option>
                {CATEGORIAS_PRINCIPAIS.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>

              <label style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: '#8B6F5E', cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={agrupar}
                  onChange={e => setAgrupar(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Agrupar
              </label>
            </div>
          </div>

          {/* Lista de itens */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: '1px solid #F0EDE9', overflow: 'hidden',
          }}>
            {carregando ? (
              <div style={{
                padding: 40, textAlign: 'center',
                fontSize: 14, color: '#A89B91',
              }}>
                Carregando...
              </div>
            ) : itensFiltrados.length === 0 ? (
              <div style={{
                padding: '40px 20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, color: '#A89B91', marginBottom: 8 }}>
                  Nenhum item encontrado
                </div>
                {!readOnly && (
                  <button
                    onClick={() => { setForm({}); setModalAberto(true); }}
                    style={{
                      fontSize: 13, color: '#8B6F5E', background: 'none',
                      border: 'none', cursor: 'pointer', textDecoration: 'underline',
                    }}
                  >
                    Adicionar item
                  </button>
                )}
              </div>
            ) : agrupar && grupos ? (
              Object.entries(grupos).map(([cat, itensGrupo]) => (
                <div key={cat}>
                  <div style={{
                    padding: '10px 20px', background: '#FAF8F7',
                    borderBottom: '1px solid #F0EDE9',
                    fontSize: 12, fontWeight: 600, color: '#8B6F5E',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    {cat}
                    <span style={{ fontWeight: 400, color: '#A89B91', marginLeft: 8 }}>
                      {itensGrupo.length} {itensGrupo.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  {itensGrupo.map(renderItem)}
                </div>
              ))
            ) : (
              itensFiltrados.map(renderItem)
            )}
          </div>

        </main>
      </div>

      {/* Modal */}
      {modalAberto && !readOnly && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(26,23,20,0.5)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 300, padding: 16,
          }}
          onClick={() => setModalAberto(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 16,
              padding: 24, width: '100%', maxWidth: 480,
              maxHeight: '90vh', overflow: 'auto',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 24,
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontSize: 20, fontWeight: 400, color: '#8B6F5E', margin: 0,
              }}>
                {form.id ? 'Editar item' : 'Novo item'}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid #D4C8C0', background: 'white',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#A89B91',
                }}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Campos */}
            {[
              {
                label: 'Descrição',
                campo: 'descricao',
                tipo: 'text',
                placeholder: 'Ex: Fotógrafo, Buffet, Decoração...',
              },
            ].map(({ label, campo, tipo, placeholder }) => (
              <div key={campo} style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 500,
                  color: '#1A1714', marginBottom: 6,
                }}>
                  {label}
                </label>
                <input
                  type={tipo}
                  placeholder={placeholder}
                  value={form[campo] || ''}
                  onChange={e => setForm({ ...form, [campo]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px',
                    borderRadius: 8, border: '1.5px solid #D4C8C0',
                    fontSize: 14, color: '#1A1714', background: 'white',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 500,
                color: '#1A1714', marginBottom: 6,
              }}>
                Categoria principal
              </label>
              <select
                value={form.categoria_principal || ''}
                onChange={e => setForm({ ...form, categoria_principal: e.target.value, categoria: '' })}
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 8, border: '1.5px solid #D4C8C0',
                  fontSize: 14, color: '#1A1714', background: 'white',
                  outline: 'none', boxSizing: 'border-box',
                }}
              >
                <option value="">Selecione...</option>
                {CATEGORIAS_PRINCIPAIS.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {subcategoriasDisponiveis.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 500,
                  color: '#1A1714', marginBottom: 6,
                }}>
                  Subcategoria
                </label>
                <select
                  value={form.categoria || ''}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px',
                    borderRadius: 8, border: '1.5px solid #D4C8C0',
                    fontSize: 14, color: '#1A1714', background: 'white',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                >
                  <option value="">Selecione...</option>
                  {subcategoriasDisponiveis.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Valor estimado (R$)', campo: 'valor_estimado', placeholder: '0,00' },
                { label: 'Valor pago (R$)', campo: 'valor_real', placeholder: '0,00' },
              ].map(({ label, campo, placeholder }) => (
                <div key={campo} style={{ flex: 1 }}>
                  <label style={{
                    display: 'block', fontSize: 13, fontWeight: 500,
                    color: '#1A1714', marginBottom: 6,
                  }}>
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={placeholder}
                    value={form[campo] || ''}
                    onChange={e => setForm({ ...form, [campo]: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px',
                      borderRadius: 8, border: '1.5px solid #D4C8C0',
                      fontSize: 14, color: '#1A1714', background: 'white',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 500,
                color: '#1A1714', marginBottom: 6,
              }}>
                Data de vencimento
              </label>
              <input
                type="date"
                value={form.data_vencimento || ''}
                onChange={e => setForm({ ...form, data_vencimento: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 8, border: '1.5px solid #D4C8C0',
                  fontSize: 14, color: '#1A1714', background: 'white',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <label style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: '#1A1714', cursor: 'pointer', marginBottom: 24,
            }}>
              <input
                type="checkbox"
                checked={form.pago || false}
                onChange={e => setForm({ ...form, pago: e.target.checked })}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Já foi pago
            </label>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  border: '1px solid #D4C8C0', background: 'white',
                  color: '#8B6F5E', fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  border: 'none', background: '#8B6F5E',
                  color: 'white', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}