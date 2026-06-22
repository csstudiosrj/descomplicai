import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';

export default function ConvidadosPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <ConvidadosContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function ConvidadosContent({ readOnly }) {
  const { user, evento, signOut, supabase } = useAuth();
  const [convidados, setConvidados] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoAcompanhantes, setNovoAcompanhantes] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [erro, setErro] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (evento) buscar();
  }, [evento]);

  const buscar = async () => {
    const { data, error } = await supabase
      .from('convidados')
      .select('*')
      .eq('evento_id', evento.id)
      .order('nome');
    if (error) {
      console.error('Erro ao buscar convidados:', error);
      setErro('Erro ao carregar convidados');
    }
    setConvidados(data || []);
  };

  const adicionar = async () => {
    if (readOnly || !novoNome.trim()) return;
    setErro('');

    const payload = {
      usuario_id: user.id,
      evento_id: evento.id,
      nome: novoNome.trim(),
      grupo: novoGrupo.trim() || 'Geral',
      telefone: novoTelefone.trim() || null,
      confirmado: 'pendente',
      mesa: novoAcompanhantes ? novoAcompanhantes.trim() : null,
    };

    const { error } = await supabase.from('convidados').insert(payload);

    if (error) {
      console.error('Erro ao adicionar convidado:', error);
      setErro('Erro ao adicionar: ' + error.message);
      return;
    }

    setNovoNome('');
    setNovoGrupo('');
    setNovoTelefone('');
    setNovoAcompanhantes('');
    buscar();
  };

  const atualizarStatus = async (id, confirmado) => {
    if (readOnly) return;
    const { error } = await supabase.from('convidados').update({ confirmado }).eq('id', id);
    if (error) console.error('Erro ao atualizar status:', error);
    buscar();
  };

  const salvarEdicao = async () => {
    if (readOnly || !editForm.id) return;
    const payload = {
      nome: editForm.nome?.trim(),
      grupo: editForm.grupo?.trim() || 'Geral',
      telefone: editForm.telefone?.trim() || null,
      mesa: editForm.mesa?.trim() || null,
    };
    const { error } = await supabase.from('convidados').update(payload).eq('id', editForm.id);
    if (error) {
      console.error('Erro ao editar convidado:', error);
      setErro('Erro ao editar: ' + error.message);
      return;
    }
    setModalEditar(false);
    setEditForm({});
    buscar();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir convidado?')) return;
    const { error } = await supabase.from('convidados').delete().eq('id', id);
    if (error) console.error('Erro ao excluir:', error);
    buscar();
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'Grupo', 'Telefone', 'Confirmado', 'Mesa'];
    const rows = convidados.map(c => [
      c.nome,
      c.grupo || '',
      c.telefone || '',
      c.confirmado,
      c.mesa || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convidados-${evento?.nome_evento || 'casamento'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resumo = {
    total: convidados.length,
    confirmados: convidados.filter(c => c.confirmado === 'confirmado').length,
    pendentes: convidados.filter(c => c.confirmado === 'pendente').length,
    recusados: convidados.filter(c => c.confirmado === 'recusado').length,
  };

  const filtrados = filtro === 'todos'
    ? convidados
    : convidados.filter(c => c.confirmado === filtro);

  const nomeCasal = evento?.nome_evento || '';

  return (
    <>
      <Head><title>Convidados | descomplicai</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}>
              <span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span>
            </div>
          )}

          {erro && (
            <div style={styles.erroBanner} onClick={() => setErro('')}>
              <span style={styles.erroText}>{erro}</span>
              <button style={styles.btnFecharErro}><Icon name="close" size={12} /></button>
            </div>
          )}

          <h1 style={styles.title}>Convidados</h1>

          <div style={styles.resumo}>
            <div style={styles.resumoCard}>
              <span style={styles.resumoValue}>{resumo.total}</span>
              <span style={styles.resumoLabel}>Total</span>
            </div>
            <div style={styles.resumoCard}>
              <span style={{ ...styles.resumoValue, color: '#2E7D32' }}>{resumo.confirmados}</span>
              <span style={styles.resumoLabel}>Confirmados</span>
            </div>
            <div style={styles.resumoCard}>
              <span style={{ ...styles.resumoValue, color: '#F9A825' }}>{resumo.pendentes}</span>
              <span style={styles.resumoLabel}>Pendentes</span>
            </div>
            <div style={styles.resumoCard}>
              <span style={{ ...styles.resumoValue, color: '#C62828' }}>{resumo.recusados}</span>
              <span style={styles.resumoLabel}>Recusados</span>
            </div>
          </div>

          {!readOnly && (
            <div style={styles.addBox}>
              <div style={styles.addRow}>
                <input
                  style={styles.input}
                  placeholder="Nome do convidado"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionar()}
                />
                <input
                  style={{ ...styles.input, flex: '0 0 140px' }}
                  placeholder="Grupo (ex: Familia noiva)"
                  value={novoGrupo}
                  onChange={(e) => setNovoGrupo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionar()}
                />
                <input
                  style={{ ...styles.input, flex: '0 0 120px' }}
                  placeholder="Telefone"
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionar()}
                />
                <input
                  style={{ ...styles.input, flex: '0 0 100px' }}
                  placeholder="Mesa"
                  value={novoAcompanhantes}
                  onChange={(e) => setNovoAcompanhantes(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionar()}
                />
                <button onClick={adicionar} style={styles.btnPrimary}>
                  <Icon name="plus" size={16} color="#fff" />
                </button>
              </div>
            </div>
          )}

          <button onClick={exportarCSV} style={styles.btnSecondary}>
            <Icon name="download" size={16} /> CSV
          </button>

          <div style={styles.filtros}>
            {['todos', 'confirmado', 'pendente', 'recusado'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                style={{
                  ...styles.filtroBtn,
                  background: filtro === f ? 'var(--color-brand)' : 'var(--color-off-white)',
                  color: filtro === f ? '#fff' : 'var(--color-text-primary)',
                }}
              >
                {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div style={styles.list}>
            {filtrados.length === 0 && (
              <div style={styles.emptyState}>
                <span style={styles.emptyText}>Nenhum convidado cadastrado</span>
              </div>
            )}
            {filtrados.map((c) => (
              <div key={c.id} style={styles.item}>
                <div style={styles.itemInfo}>
                  <span style={styles.itemNome}>{c.nome}</span>
                  <span style={styles.itemMeta}>
                    {c.grupo && <span style={styles.itemGrupo}>{c.grupo}</span>}
                    {c.telefone && <span style={styles.itemTelefone}> · {c.telefone}</span>}
                    {c.mesa && <span style={styles.itemMesa}> · Mesa {c.mesa}</span>}
                  </span>
                </div>
                <div style={styles.itemAcoes}>
                  <select
                    value={c.confirmado}
                    onChange={(e) => atualizarStatus(c.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="recusado">Recusado</option>
                  </select>
                  {!readOnly && (
                    <>
                      <button
                        onClick={() => { setEditForm(c); setModalEditar(true); }}
                        style={styles.btnIcon}
                        title="Editar"
                      >
                        <Icon name="edit" size={14} />
                      </button>
                      <button
                        onClick={() => excluir(c.id)}
                        style={styles.btnIcon}
                        title="Excluir"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {modalEditar && !readOnly && (
        <div style={styles.modalOverlay} onClick={() => setModalEditar(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Editar convidado</h2>
              <button onClick={() => setModalEditar(false)} style={styles.btnFechar}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nome</label>
              <input
                style={styles.input}
                value={editForm.nome || ''}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Grupo</label>
              <input
                style={styles.input}
                value={editForm.grupo || ''}
                onChange={(e) => setEditForm({ ...editForm, grupo: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Telefone</label>
              <input
                style={styles.input}
                value={editForm.telefone || ''}
                onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mesa</label>
              <input
                style={styles.input}
                value={editForm.mesa || ''}
                onChange={(e) => setEditForm({ ...editForm, mesa: e.target.value })}
              />
            </div>

            <div style={styles.modalBotoes}>
              <button onClick={() => setModalEditar(false)} style={styles.btnCancel}>Cancelar</button>
              <button onClick={salvarEdicao} style={styles.btnSave}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-off-white)', paddingTop: '52px' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-text-primary)', marginBottom: '20px' },
  resumo: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  resumoCard: { background: 'var(--color-white)', borderRadius: '10px', padding: '12px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  resumoValue: { fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' },
  resumoLabel: { fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' },
  addBox: { marginBottom: '16px' },
  addRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontFamily: 'var(--font-body)', background: 'var(--color-white)', color: 'var(--color-text-primary)', minWidth: '120px', outline: 'none' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--color-brand)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, minWidth: '44px', height: '42px' },
  btnSecondary: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-off-white)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-secondary)' },
  filtros: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  filtroBtn: { padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
  list: { background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' },
  emptyState: { padding: '40px 16px', textAlign: 'center' },
  emptyText: { fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  itemNome: { fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' },
  itemMeta: { display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' },
  itemGrupo: { fontSize: '12px', color: 'var(--color-text-secondary)' },
  itemTelefone: { fontSize: '12px', color: 'var(--color-text-secondary)' },
  itemMesa: { fontSize: '12px', color: 'var(--color-brand)', fontWeight: 500 },
  itemAcoes: { display: 'flex', alignItems: 'center', gap: '8px' },
  select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px', background: 'var(--color-white)', color: 'var(--color-text-primary)', outline: 'none' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
  erroBanner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDE8E8', border: '1px solid #C62828', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', cursor: 'pointer' },
  erroText: { fontSize: '13px', color: '#C62828', fontFamily: 'var(--font-body)' },
  btnFecharErro: { background: 'none', border: 'none', cursor: 'pointer', color: '#C62828', padding: '2px' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' },
  modal: { background: 'var(--color-white)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-text-primary)', margin: 0 },
  btnFechar: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-secondary)' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '6px', fontFamily: 'var(--font-body)' },
  modalBotoes: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' },
  btnCancel: { background: 'var(--color-off-white)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnSave: { background: 'var(--color-brand)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
};