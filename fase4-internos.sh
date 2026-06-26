#!/bin/bash
# ============================================================
# FASE 4: Componentes internos — checklist, financeiro, painel
# ============================================================

PROJECT_DIR="."
BACKUP_DIR="$PROJECT_DIR/.backup-fase4-$(date +%s)"
mkdir -p "$BACKUP_DIR"

cp "$PROJECT_DIR/pages/painel/checklist.jsx" "$BACKUP_DIR/"
cp "$PROJECT_DIR/components/checklist/TarefaItem.jsx" "$BACKUP_DIR/"
cp "$PROJECT_DIR/pages/painel/index.jsx" "$BACKUP_DIR/"
cp "$PROJECT_DIR/pages/cerimonialista/financeiro.jsx" "$BACKUP_DIR/"
cp "$PROJECT_DIR/components/cerimonialista/FinanceiroLista.jsx" "$BACKUP_DIR/"

echo "Backup em: $BACKUP_DIR"

# ============================================================
# 1. pages/painel/checklist.jsx
# ============================================================
cat > "$PROJECT_DIR/pages/painel/checklist.jsx" << 'EOF_CHECKLIST'
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import TarefaItem from '../../components/checklist/TarefaItem';
import Icon from '../../components/ui/Icon';
import Toast from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { SUBCATEGORIAS_FLAT } from '../../utils/catalogoFornecedores';

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
      const res = await fetch('/api/tarefas/gerar', {
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
EOF_CHECKLIST

echo "[1/5] painel/checklist.jsx atualizado"

# ============================================================
# 2. components/checklist/TarefaItem.jsx
# ============================================================
cat > "$PROJECT_DIR/components/checklist/TarefaItem.jsx" << 'EOF_TAREFAITEM'
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { getLabelSubcategoria } from '../../utils/catalogoFornecedores';

function calcularIndicador(prazo, concluida) {
  if (concluida) return { cor: 'var(--color-success)', label: 'Concluida' };
  if (!prazo) return { cor: 'var(--color-border-strong)', label: 'Sem prazo' };
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataPrazo = new Date(prazo + 'T00:00:00');
  const diff = Math.ceil((dataPrazo - hoje) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { cor: 'var(--color-danger)', label: 'Atrasada' };
  if (diff <= 7) return { cor: 'var(--color-warning)', label: 'Urgente' };
  return { cor: 'var(--color-info)', label: 'Futura' };
}

function formatarPrazo(prazo) {
  if (!prazo) return null;
  const data = new Date(prazo + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TarefaItem({ tarefa, onToggle, onClick }) {
  const { id, titulo, concluida, categoria, prazo, descricao } = tarefa;
  const indicador = calcularIndicador(prazo, concluida);
  const prazoFormatado = formatarPrazo(prazo);

  return (
    <Card variant={concluida ? 'flat' : 'default'} padding="md" interactive onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{
          width: 3,
          height: 40,
          borderRadius: 2,
          background: indicador.cor,
          flexShrink: 0,
        }} />

        <button
          onClick={(e) => { e.stopPropagation(); onToggle?.(id); }}
          aria-checked={concluida}
          role="checkbox"
          aria-label={concluida ? 'Marcar como pendente' : 'Marcar como concluida'}
          style={{
            width: 24,
            height: 24,
            borderRadius: 'var(--radius-sm)',
            border: `2px solid ${concluida ? 'var(--color-success)' : 'var(--color-border-strong)'}`,
            background: concluida ? 'var(--color-success)' : 'var(--color-white)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: `all var(--transition-fast)`,
          }}
        >
          {concluida && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontWeight: concluida ? 'var(--font-normal)' : 'var(--font-medium)',
            color: concluida ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            textDecoration: concluida ? 'line-through' : 'none',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-snug)',
            marginBottom: 'var(--space-1)',
          }}>
            {titulo}
          </div>
          
          {descricao && !concluida && (
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-normal)',
              marginBottom: 'var(--space-1)',
            }}>
              {descricao}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {categoria && (
              <Badge variant="default" size="sm">{getLabelSubcategoria(categoria)}</Badge>
            )}
            {prazoFormatado && (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: indicador.cor,
                fontWeight: 'var(--font-medium)',
              }}>
                {prazoFormatado}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

TarefaItem.propTypes = {
  tarefa: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    titulo: PropTypes.string.isRequired,
    concluida: PropTypes.bool,
    categoria: PropTypes.string,
    prazo: PropTypes.string,
    descricao: PropTypes.string,
  }).isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func,
};

export { TarefaItem };
EOF_TAREFAITEM

echo "[2/5] checklist/TarefaItem.jsx atualizado"

# ============================================================
# 3. pages/painel/index.jsx — criticos com IDs do catálogo
# ============================================================
# Usar sed para substituir apenas a linha dos criticos
sed -i "s/const criticos = \\['fotografia', 'filmagem', 'espaco_recepcao', 'buffet'\\];/const criticos = ['fotografia', 'filmagem', 'espaco_recepcao', 'buffet'];/" "$PROJECT_DIR/pages/painel/index.jsx"
# Na verdade os IDs já estão corretos! Não precisa mudar.

echo "[3/5] painel/index.jsx — IDs já estão corretos (fotografia, filmagem, espaco_recepcao, buffet)"

# ============================================================
# 4. pages/cerimonialista/financeiro.jsx — CATEGORIAS → catálogo
# ============================================================
cat > "$PROJECT_DIR/pages/cerimonialista/financeiro.jsx" << 'EOF_FINANCEIRO_CERIM'
import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import FinanceiroResumo from '../../components/cerimonialista/FinanceiroResumo';
import FinanceiroLista from '../../components/cerimonialista/FinanceiroLista';
import FinanceiroModal from '../../components/cerimonialista/FinanceiroModal';
import { supabase } from '../../lib/supabase';
import { SUBCATEGORIAS_FLAT } from '../../utils/catalogoFornecedores';

const TIPOS = [
  { id: 'receita', label: 'Receita', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  { id: 'despesa', label: 'Despesa', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
];

function buildCategoriasPorTipo() {
  const map = { receita: [], despesa: [] };
  SUBCATEGORIAS_FLAT.forEach((sub) => {
    const id = sub.id;
    const label = `${sub.categoriaPrincipalLabel} — ${sub.label}`;
    map.receita.push({ id, label });
    map.despesa.push({ id, label });
  });
  return map;
}

const CATEGORIAS = buildCategoriasPorTipo();

export default function FinanceiroCerimonialista() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista } = useAuth();
  const [lancamentos, setLancamentos] = useState([]);
  const [lancamentosLoading, setLancamentosLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [lancamentoEditando, setLancamentoEditando] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const buscarLancamentos = useCallback(async () => {
    if (!cerimonialista?.id) return;
    setLancamentosLoading(true);
    const { data, error } = await supabase
      .from('cerimonialista_financeiro')
      .select('*')
      .eq('cerimonialista_id', cerimonialista.id)
      .order('data_vencimento', { ascending: false });

    if (!error && data) {
      setLancamentos(data);
    }
    setLancamentosLoading(false);
  }, [cerimonialista]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (isCerimonialista && cerimonialista) {
      buscarLancamentos();
    }
  }, [isCerimonialista, cerimonialista, buscarLancamentos]);

  const handleNovoLancamento = () => {
    setLancamentoEditando(null);
    setModalOpen(true);
  };

  const handleEditarLancamento = (lancamento) => {
    setLancamentoEditando(lancamento);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setLancamentoEditando(null);
  };

  const handleLancamentoSalvo = () => {
    buscarLancamentos();
    showToast(lancamentoEditando ? 'Lancamento atualizado' : 'Lancamento criado');
  };

  const handleTogglePago = async (id, pago) => {
    const { error } = await supabase
      .from('cerimonialista_financeiro')
      .update({ pago: !pago })
      .eq('id', id);

    if (!error) {
      buscarLancamentos();
      showToast(!pago ? 'Marcado como pago' : 'Marcado como pendente');
    } else {
      showToast('Erro ao atualizar', 'error');
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este lancamento?')) return;
    const { error } = await supabase
      .from('cerimonialista_financeiro')
      .delete()
      .eq('id', id);

    if (!error) {
      buscarLancamentos();
      showToast('Lancamento excluido');
    } else {
      showToast('Erro ao excluir', 'error');
    }
  };

  const lancamentosFiltrados = lancamentos.filter((l) => {
    const matchTipo = filtroTipo === 'todos' || l.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || (filtroStatus === 'pago' && l.pago) || (filtroStatus === 'pendente' && !l.pago);
    return matchTipo && matchStatus;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando...</p>
      </div>
    );
  }

  if (!isCerimonialista || !cerimonialista) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-warning)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-4)' }}>
            Acesso restrito
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Esta area e exclusiva para cerimonialistas.
          </p>
          <Button variant="primary" onClick={() => router.push('/painel')} style={{ marginTop: 'var(--space-6)' }}>
            Ir para o painel do casal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Financeiro — Descomplicai</title>
      </Head>

      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        <header
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--space-4) var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => router.push('/cerimonialista/painel')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Voltar ao painel"
            >
              <Icon name="back" size={22} />
            </button>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Financeiro
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Controle de receitas e despesas
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleNovoLancamento}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="plus" size={16} />
              Novo Lancamento
            </span>
          </Button>
        </header>

        <main style={{ padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto' }}>
          <FinanceiroResumo lancamentos={lancamentos} loading={lancamentosLoading} />

          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-6)',
              marginBottom: 'var(--space-4)',
              overflowX: 'auto',
              paddingBottom: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                Tipo:
              </span>
              {['todos', 'receita', 'despesa'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: filtroTipo === t ? 'var(--color-brand)' : 'var(--color-white)',
                    color: filtroTipo === t ? 'var(--color-white)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Despesas'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                Status:
              </span>
              {['todos', 'pago', 'pendente'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: filtroStatus === s ? 'var(--color-brand)' : 'var(--color-white)',
                    color: filtroStatus === s ? 'var(--color-white)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {s === 'todos' ? 'Todos' : s === 'pago' ? 'Pagos' : 'Pendentes'}
                </button>
              ))}
            </div>
          </div>

          <FinanceiroLista
            lancamentos={lancamentosFiltrados}
            loading={lancamentosLoading}
            tipos={TIPOS}
            categorias={CATEGORIAS}
            onTogglePago={handleTogglePago}
            onEditar={handleEditarLancamento}
            onExcluir={handleExcluir}
          />
        </main>
      </div>

      {modalOpen && (
        <FinanceiroModal
          lancamento={lancamentoEditando}
          cerimonialistaId={cerimonialista.id}
          tipos={TIPOS}
          categorias={CATEGORIAS}
          onClose={handleModalClose}
          onSalvo={handleLancamentoSalvo}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 'var(--z-toast)',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 300ms ease',
          }}
        >
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
EOF_FINANCEIRO_CERIM

echo "[4/5] cerimonialista/financeiro.jsx atualizado"

# ============================================================
# 5. components/cerimonialista/FinanceiroLista.jsx
# ============================================================
cat > "$PROJECT_DIR/components/cerimonialista/FinanceiroLista.jsx" << 'EOF_FINLISTA'
import React from 'react';
import Icon from '../ui/Icon';
import { getLabelSubcategoria } from '../../utils/catalogoFornecedores';

function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const data = new Date(dataStr + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function agruparPorMes(lancamentos) {
  const grupos = {};
  lancamentos.forEach((l) => {
    const data = l.data_vencimento ? new Date(l.data_vencimento + 'T00:00:00') : new Date();
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    const label = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!grupos[chave]) grupos[chave] = { label, items: [] };
    grupos[chave].items.push(l);
  });
  return Object.entries(grupos).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function FinanceiroLista({ lancamentos, loading, tipos, categorias, onTogglePago, onEditar, onExcluir }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando lancamentos...</p>
      </div>
    );
  }

  if (lancamentos.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-12) var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Icon name="receipt" size={48} color="var(--color-text-muted)" />
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-primary)',
            marginTop: 'var(--space-4)',
          }}
        >
          Nenhum lancamento
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          Crie seu primeiro lancamento para comecar.
        </p>
      </div>
    );
  }

  const grupos = agruparPorMes(lancamentos);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {grupos.map(([chave, { label, items }]) => {
        const totalMes = items.reduce((s, l) => s + (l.valor || 0), 0);
        return (
          <div key={chave}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  textTransform: 'capitalize',
                }}
              >
                {label}
              </h3>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {formatarValor(totalMes)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {items.map((l) => {
                const tipoInfo = tipos.find((t) => t.id === l.tipo) || tipos[0];
                const catLabel = getLabelSubcategoria(l.categoria) || '—';

                return (
                  <div
                    key={l.id}
                    style={{
                      backgroundColor: 'var(--color-white)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() => onTogglePago(l.id, l.pago)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 'var(--space-2)',
                        color: l.pago ? 'var(--color-success)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                      aria-label={l.pago ? 'Marcar como pendente' : 'Marcar como pago'}
                      title={l.pago ? 'Pago' : 'Pendente'}
                    >
                      <Icon name={l.pago ? 'checkSquare' : 'square'} size={20} />
                    </button>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                        <span
                          style={{
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: tipoInfo.bg,
                            color: tipoInfo.color,
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-medium)',
                          }}
                        >
                          {tipoInfo.label}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {catLabel}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--color-text-primary)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {l.descricao || 'Sem descricao'}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                        Vencimento: {formatarData(l.data_vencimento)}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-semibold)',
                          color: l.tipo === 'receita' ? 'var(--color-success)' : 'var(--color-danger)',
                        }}
                      >
                        {l.tipo === 'receita' ? '+' : '-'}{formatarValor(l.valor)}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button
                          onClick={() => onEditar(l)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            padding: 'var(--space-1)',
                          }}
                          aria-label="Editar"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={() => onExcluir(l.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            padding: 'var(--space-1)',
                          }}
                          aria-label="Excluir"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
EOF_FINLISTA

echo "[5/5] cerimonialista/FinanceiroLista.jsx atualizado"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  FASE 4 CONCLUIDA"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Mudancas:"
echo "  - checklist.jsx: CATEGORIAS_TAREFA hardcoded → SUBCATEGORIAS_FLAT"
echo "  - TarefaItem.jsx: {categoria} → getLabelSubcategoria(categoria)"
echo "  - index.jsx: criticos já usam IDs do catálogo (sem mudanca)"
echo "  - financeiro.jsx (cerimonialista): CATEGORIAS hardcoded → SUBCATEGORIAS_FLAT"
echo "  - FinanceiroLista.jsx: categorias[tipo]?.find → getLabelSubcategoria"
echo ""
echo "Backup em: $BACKUP_DIR"