import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import TarefaItem from '../../components/checklist/TarefaItem';
import Icon from '../../components/ui/Icon';
import Toast from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { SUBCATEGORIAS_FLAT } from '../../utils/catalogoFornecedores';
import fetchAPI from '../../utils/fetchAPI';

export default function ChecklistPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <ChecklistContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function ChecklistContent({ readOnly }) {
  const { evento, supabase } = useAuth();
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [gruposAbertos, setGruposAbertos] = useState({ futuros: false, concluidas: false });
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (evento?.id && evento?.data_evento) {
      gerarPadraoSeNecessario().then(() => buscar());
    } else if (evento?.id) {
      buscar();
    }
  }, [evento]);

  const gerarPadraoSeNecessario = async () => {
    if (!evento?.data_evento) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetchAPI('/api/tarefas/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          evento_id: evento.id, 
          data_evento: evento.data_evento,
          usuario_id: user?.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error('[gerar]', json);
      } else if (json.criadas > 0) {
        buscar();
      }
    } catch (err) {
      console.error('Erro ao gerar tarefas padrao:', err);
    }
  };

  const buscar = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from('tarefas')
      .select('*')
      .eq('evento_id', evento.id)
      .order('prazo', { ascending: true });
    setTarefas(data || []);
    setCarregando(false);
  };

  const mostrarToast = (mensagem, tipo = 'success') => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const salvar = async () => {
    if (readOnly) return;
    if (!form.titulo?.trim()) return;

    const payload = {
      evento_id: evento.id,
      titulo: form.titulo,
      descricao: form.descricao || null,
      prazo: form.prazo || null,
      categoria: form.categoria || null,
      concluida: form.concluida || false,
    };

    if (form.id) {
      await supabase.from('tarefas').update(payload).eq('id', form.id);
      mostrarToast('Tarefa atualizada');
    } else {
      await supabase.from('tarefas').insert(payload);
      mostrarToast('Tarefa adicionada');
    }

    setModalAberto(false);
    setForm({});
    buscar();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir tarefa?')) return;
    await supabase.from('tarefas').delete().eq('id', id);
    mostrarToast('Tarefa excluida', 'info');
    buscar();
  };

  const toggle = async (id, concluida) => {
    if (readOnly) return;
    await supabase.from('tarefas').update({ concluida: !concluida }).eq('id', id);
    mostrarToast(!concluida ? 'Tarefa concluida' : 'Tarefa reaberta');
    buscar();
  };

  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const resumo = useMemo(() => {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = total - concluidas;
    const atrasadas = tarefas.filter(t => {
      if (t.concluida || !t.prazo) return false;
      const p = new Date(t.prazo + 'T00:00:00');
      return p < hoje;
    }).length;
    const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { total, concluidas, pendentes, atrasadas, pct };
  }, [tarefas, hoje]);

  const itensFiltrados = useMemo(() => {
    return tarefas.filter((t) => {
      if (filtroStatus === 'pendentes' && t.concluida) return false;
      if (filtroStatus === 'concluidas' && !t.concluida) return false;
      if (filtroStatus === 'urgentes') {
        if (t.concluida || !t.prazo) return false;
        const p = new Date(t.prazo + 'T00:00:00');
        const diff = Math.ceil((p - hoje) / (1000 * 60 * 60 * 24));
        if (diff < 0 || diff > 7) return false;
      }
      if (filtroStatus === 'proximos30') {
        if (t.concluida || !t.prazo) return false;
        const p = new Date(t.prazo + 'T00:00:00');
        const diff = Math.ceil((p - hoje) / (1000 * 60 * 60 * 24));
        if (diff < 0 || diff > 30) return false;
      }
      if (filtroCategoria !== 'todas' && t.categoria !== filtroCategoria) return false;
      return true;
    });
  }, [tarefas, filtroStatus, filtroCategoria, hoje]);

  const grupos = useMemo(() => {
    const map = {
      atrasadas: [],
      urgentes: [],
      proximos30: [],
      futuros: [],
      concluidas: [],
    };

    itensFiltrados.forEach((t) => {
      if (t.concluida) {
        map.concluidas.push(t);
        return;
      }
      if (!t.prazo) {
        map.futuros.push(t);
        return;
      }
      const p = new Date(t.prazo + 'T00:00:00');
      const diff = Math.ceil((p - hoje) / (1000 * 60 * 60 * 24));

      if (diff < 0) map.atrasadas.push(t);
      else if (diff <= 7) map.urgentes.push(t);
      else if (diff <= 30) map.proximos30.push(t);
      else map.futuros.push(t);
    });

    return map;
  }, [itensFiltrados, hoje]);

  const nomeCasal = evento?.nome_evento || '';

  const toggleGrupo = (key) => {
    setGruposAbertos(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderGrupo = (key, label, color, itens, colapsavel = false) => {
    if (itens.length === 0) return null;
    const aberto = colapsavel ? gruposAbertos[key] : true;

    return (
      <section key={key} style={{ marginBottom: 'var(--space-4)' }}>
        <div
          onClick={() => colapsavel && toggleGrupo(key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-2)',
            cursor: colapsavel ? 'pointer' : 'default',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block',
            }} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {label}
            </span>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-normal)',
            }}>
              {itens.length} {itens.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          {colapsavel && (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {aberto ? '▲' : '▼'}
            </span>
          )}
        </div>

        {aberto && (
          <div style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}>
            {itens.map((t) => (
              <div
                key={t.id}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  transition: `background var(--transition-fast)`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-off-white)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-white)'; }}
              >
                <TarefaItem
                  tarefa={t}
                  onToggle={() => toggle(t.id, t.concluida)}
                  onClick={() => { setForm(t); setModalAberto(true); }}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <>
      <Head><title>Checklist | descomplicai</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--color-off-white)', paddingTop: 52 }}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={{ maxWidth: 960, margin: '0 auto', padding: 'var(--space-6) var(--space-4) var(--space-12)' }}>

          {readOnly && (
            <div style={{
              background: 'var(--color-warning-light)',
              border: '1px solid var(--color-warning)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-5)',
              textAlign: 'center',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-warning)',
            }}>
              Modo somente leitura. Assine para editar.
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-6)',
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-normal)',
                color: 'var(--color-brand)',
                margin: 0,
              }}>
                Checklist
              </h1>
              {carregando ? null : (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
                  {tarefas.length} {tarefas.length === 1 ? 'tarefa' : 'tarefas'}
                </p>
              )}
            </div>
            {!readOnly && (
              <button
                onClick={() => { setForm({}); setModalAberto(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  background: 'var(--color-brand)', color: 'var(--color-white)', border: 'none',
                  padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
                }}
              >
                <Icon name="plus" size={16} color="var(--color-white)" />
                Adicionar tarefa
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}>
            {[
              { label: 'Total de tarefas', valor: resumo.total, cor: 'var(--color-brand)' },
              { label: 'Concluidas', valor: `${resumo.concluidas} (${resumo.pct}%)`, cor: 'var(--color-success)' },
              { label: 'Pendentes', valor: resumo.pendentes, cor: 'var(--color-info)' },
              { label: 'Atrasadas', valor: resumo.atrasadas, cor: 'var(--color-danger)' },
            ].map(({ label, valor, cor }) => (
              <div key={label} style={{
                background: 'var(--color-white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-4) var(--space-5)',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-medium)' }}>
                  {label}
                </div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)', color: cor }}>
                  {valor}
                </div>
              </div>
            ))}
          </div>

          {resumo.total > 0 && (
            <div style={{
              background: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-4) var(--space-5)',
              marginBottom: 'var(--space-6)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)',
              }}>
                <span>Progresso de conclusao</span>
                <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-brand)' }}>
                  {resumo.pct}%
                </span>
              </div>
              <div style={{
                height: 6, background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 'var(--radius-full)',
                  width: `${resumo.pct}%`,
                  background: resumo.pct === 100 ? 'var(--color-success)' : 'var(--color-brand)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          <div style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {[
                { id: 'todas', label: 'Todas' },
                { id: 'pendentes', label: 'Pendentes' },
                { id: 'concluidas', label: 'Concluidas' },
                { id: 'urgentes', label: 'Urgentes' },
                { id: 'proximos30', label: 'Proximos 30 dias' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFiltroStatus(id)}
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                    fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', transition: 'all var(--transition-fast)',
                    border: filtroStatus === id ? '1px solid var(--color-brand)' : '1px solid var(--color-border-strong)',
                    background: filtroStatus === id ? 'var(--color-brand)' : 'var(--color-white)',
                    color: filtroStatus === id ? 'var(--color-white)' : 'var(--color-brand)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <select
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-strong)', fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-primary)', background: 'var(--color-white)', cursor: 'pointer',
                }}
              >
                <option value="todas">Todas as categorias</option>
                {SUBCATEGORIAS_FLAT.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.categoriaPrincipalLabel} — {sub.label}</option>
                ))}
              </select>
            </div>
          </div>

          {carregando ? (
            <div style={{
              padding: 'var(--space-10)', textAlign: 'center',
              fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
            }}>
              Carregando...
            </div>
          ) : tarefas.length === 0 ? (
            <div style={{
              background: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-10) var(--space-6)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                Nenhuma tarefa encontrada
              </div>
              {!readOnly && (
                <button
                  onClick={() => { setForm({}); setModalAberto(true); }}
                  style={{
                    fontSize: 'var(--text-sm)', color: 'var(--color-brand)', background: 'none',
                    border: 'none', cursor: 'pointer', textDecoration: 'underline',
                  }}
                >
                  Adicionar primeira tarefa
                </button>
              )}
            </div>
          ) : itensFiltrados.length === 0 ? (
            <div style={{
              background: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-10) var(--space-6)',
              textAlign: 'center',
              fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
            }}>
              Nenhum item corresponde aos filtros selecionados
            </div>
          ) : (
            <>
              {renderGrupo('atrasadas', 'Atrasadas', 'var(--color-danger)', grupos.atrasadas)}
              {renderGrupo('urgentes', 'Urgentes', 'var(--color-warning)', grupos.urgentes)}
              {renderGrupo('proximos30', 'Proximos 30 dias', 'var(--color-info)', grupos.proximos30)}
              {renderGrupo('futuros', 'Futuros', 'var(--color-border-strong)', grupos.futuros, true)}
              {renderGrupo('concluidas', 'Concluidas', 'var(--color-success)', grupos.concluidas, true)}
            </>
          )}

        </main>
      </div>

      {modalAberto && !readOnly && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'var(--color-overlay)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 'var(--z-modal)', padding: 'var(--space-4)',
          }}
          onClick={() => setModalAberto(false)}
        >
          <div
            style={{
              background: 'var(--color-white)', borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)', width: '100%', maxWidth: 480,
              maxHeight: '90vh', overflow: 'auto',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 'var(--space-6)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-normal)',
                color: 'var(--color-brand)', margin: 0,
              }}>
                {form.id ? 'Editar tarefa' : 'Nova tarefa'}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
                style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-strong)', background: 'var(--color-white)',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                }}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)',
              }}>
                Titulo *
              </label>
              <input
                type="text"
                placeholder="Ex: Contratar fotografo"
                value={form.titulo || ''}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border-strong)',
                  fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', background: 'var(--color-white)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)',
              }}>
                Descricao
              </label>
              <textarea
                placeholder="Detalhes adicionais..."
                value={form.descricao || ''}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border-strong)',
                  fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', background: 'var(--color-white)',
                  outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'var(--font-body)',
                }}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)',
              }}>
                Prazo
              </label>
              <input
                type="date"
                value={form.prazo || ''}
                onChange={e => setForm({ ...form, prazo: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border-strong)',
                  fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', background: 'var(--color-white)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)',
              }}>
                Categoria
              </label>
              <select
                value={form.categoria || ''}
                onChange={e => setForm({ ...form, categoria: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border-strong)',
                  fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', background: 'var(--color-white)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              >
                <option value="">Selecione...</option>
                {SUBCATEGORIAS_FLAT.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.categoriaPrincipalLabel} — {sub.label}</option>
                ))}
              </select>
            </div>

            {form.id && (
              <label style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', cursor: 'pointer', marginBottom: 'var(--space-6)',
              }}>
                <input
                  type="checkbox"
                  checked={form.concluida || false}
                  onChange={e => setForm({ ...form, concluida: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                Tarefa concluida
              </label>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-strong)', background: 'var(--color-white)',
                  color: 'var(--color-brand)', fontSize: 'var(--text-sm)', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-sm)',
                  border: 'none', background: 'var(--color-brand)',
                  color: 'var(--color-white)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}
    </>
  );
}
