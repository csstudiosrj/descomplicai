import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import ConvidadoItem from '../../components/convidados/ConvidadoItem';
import ConvidadoFiltros from '../../components/convidados/ConvidadoFiltros';
import ToastStatus from '../../components/convidados/ToastStatus';

const GRUPOS_PADRAO = [
  'Familia Noivo',
  'Familia Noiva',
  'Amigos Noivo',
  'Amigos Noiva',
  'Colegas de trabalho',
  'Padrinhos',
  'Daminhas/Pajens',
];

function formatarTelefone(valor) {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ConvidadosPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <ConvidadosContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function ConvidadosContent({ readOnly }) {
  const { user, evento, supabase } = useAuth();

  const [convidados, setConvidados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroGrupo, setFiltroGrupo] = useState('todos');

  const [novoNome, setNovoNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('');
  const [novoGrupoOutro, setNovoGrupoOutro] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoAcompanhantes, setNovoAcompanhantes] = useState('');

  const [modalEditar, setModalEditar] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editGrupoOutro, setEditGrupoOutro] = useState('');

  const [erro, setErro] = useState('');
  const [toast, setToast] = useState(null);
  const [ultimoStatus, setUltimoStatus] = useState(null);

  const [resumo, setResumo] = useState({ total: 0, confirmados: 0, pendentes: 0, recusados: 0, pessoasConfirmadas: 0 });

  useEffect(() => {
    if (evento) carregarTudo();
  }, [evento]);

  const carregarTudo = async () => {
    setCarregando(true);

    // Grupos
    const { data: gruposData } = await supabase
      .from('grupos_convidados')
      .select('*')
      .eq('evento_id', evento.id)
      .order('ordem');

    let listaGrupos = gruposData || [];
    if (listaGrupos.length === 0) {
      const inserts = GRUPOS_PADRAO.map((nome, idx) => ({
        evento_id: evento.id,
        nome,
        ordem: idx,
      }));
      const { data: inseridos } = await supabase
        .from('grupos_convidados')
        .insert(inserts)
        .select();
      listaGrupos = inseridos || inserts;
    }
    setGrupos(listaGrupos);

    // Mesas
    const { data: mesasData } = await supabase
      .from('mesas')
      .select('id, numero')
      .eq('evento_id', evento.id)
      .order('numero');
    setMesas(mesasData || []);

    // Convidados
    const { data, error } = await supabase
      .from('convidados')
      .select('*')
      .eq('evento_id', evento.id)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar convidados:', error);
      setErro('Erro ao carregar convidados');
    } else {
      setConvidados(data || []);
      calcularResumo(data || []);
    }
    setCarregando(false);
  };

  const calcularResumo = (lista) => {
    const total = lista.length;
    const confirmados = lista.filter(c => c.confirmado === 'confirmado').length;
    const pendentes = lista.filter(c => c.confirmado === 'pendente').length;
    const recusados = lista.filter(c => c.confirmado === 'recusado').length;
    const pessoasConfirmadas = lista
      .filter(c => c.confirmado === 'confirmado')
      .reduce((acc, c) => acc + 1 + (Number(c.acompanhantes) || 0), 0);

    setResumo({ total, confirmados, pendentes, recusados, pessoasConfirmadas });
  };

  const adicionar = async () => {
    if (readOnly || !novoNome.trim()) return;
    setErro('');

    let grupoFinal = novoGrupo;
    if (novoGrupo === 'Outro') {
      grupoFinal = novoGrupoOutro.trim();
      if (!grupoFinal) {
        setErro('Informe o nome do novo grupo');
        return;
      }
      await supabase.from('grupos_convidados').insert({
        evento_id: evento.id,
        nome: grupoFinal,
        ordem: grupos.length,
      }).select();
      await carregarTudo();
    }

    const payload = {
      usuario_id: user.id,
      evento_id: evento.id,
      nome: novoNome.trim(),
      grupo: grupoFinal || 'Geral',
      telefone: novoTelefone.trim() || null,
      confirmado: 'pendente',
      mesa: null,
      acompanhantes: Number(novoAcompanhantes) || 0,
    };

    const { error } = await supabase.from('convidados').insert(payload);

    if (error) {
      console.error('Erro ao adicionar convidado:', error);
      setErro('Erro ao adicionar: ' + error.message);
      return;
    }

    setNovoNome('');
    setNovoGrupo('');
    setNovoGrupoOutro('');
    setNovoTelefone('');
    setNovoAcompanhantes('');
    carregarTudo();
  };

  const atualizarStatus = async (id, confirmado) => {
    if (readOnly) return;

    const conv = convidados.find(c => c.id === id);
    if (!conv || conv.confirmado === confirmado) return;

    setUltimoStatus({ id, anterior: conv.confirmado });

    const { error } = await supabase
      .from('convidados')
      .update({ confirmado })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      return;
    }

    setToast({
      id,
      nome: conv.nome,
      novoStatus: confirmado,
      anterior: conv.confirmado,
    });

    carregarTudo();
  };

  const desfazerStatus = async () => {
    if (!ultimoStatus) return;
    await supabase
      .from('convidados')
      .update({ confirmado: ultimoStatus.anterior })
      .eq('id', ultimoStatus.id);
    setUltimoStatus(null);
    setToast(null);
    carregarTudo();
  };

  const salvarEdicao = async () => {
    if (readOnly || !editForm.id) return;

    let grupoFinal = editForm.grupo;
    if (editForm.grupo === 'Outro') {
      grupoFinal = editGrupoOutro.trim();
      if (!grupoFinal) {
        setErro('Informe o nome do novo grupo');
        return;
      }
      await supabase.from('grupos_convidados').insert({
        evento_id: evento.id,
        nome: grupoFinal,
        ordem: grupos.length,
      }).select();
      await carregarTudo();
    }

    const payload = {
      nome: editForm.nome?.trim(),
      grupo: grupoFinal || 'Geral',
      telefone: editForm.telefone?.trim() || null,
      mesa: editForm.mesa?.trim() || null,
      acompanhantes: Number(editForm.acompanhantes) || 0,
    };

    const { error } = await supabase
      .from('convidados')
      .update(payload)
      .eq('id', editForm.id);

    if (error) {
      console.error('Erro ao editar convidado:', error);
      setErro('Erro ao editar: ' + error.message);
      return;
    }

    setModalEditar(false);
    setEditForm({});
    setEditGrupoOutro('');
    carregarTudo();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir convidado?')) return;
    const { error } = await supabase.from('convidados').delete().eq('id', id);
    if (error) console.error('Erro ao excluir:', error);
    carregarTudo();
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'Grupo', 'Telefone', 'Confirmado', 'Acompanhantes', 'Mesa'];
    const rows = convidados.map(c => [
      c.nome,
      c.grupo || '',
      c.telefone || '',
      c.confirmado,
      c.acompanhantes || 0,
      c.mesa || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convidados-${evento?.nome_evento || 'casamento'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const abrirEditar = (c) => {
    setEditForm({ ...c });
    const todosGrupos = [...GRUPOS_PADRAO, ...grupos.map(g => g.nome)];
    const grupoExiste = todosGrupos.includes(c.grupo);
    if (c.grupo && !grupoExiste && c.grupo !== 'Geral') {
      setEditForm(prev => ({ ...prev, grupo: 'Outro' }));
      setEditGrupoOutro(c.grupo);
    } else {
      setEditGrupoOutro('');
    }
    setModalEditar(true);
  };

  // Filtragem
  const filtrados = convidados.filter((c) => {
    const matchBusca = !busca || c.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || c.confirmado === filtroStatus;
    const matchGrupo = filtroGrupo === 'todos' || c.grupo === filtroGrupo;
    return matchBusca && matchStatus && matchGrupo;
  });

  const nomeCasal = evento?.nome_evento || '';
  const todosGrupos = Array.from(new Set([...GRUPOS_PADRAO, ...grupos.map(g => g.nome)]));

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

          <ConvidadoFiltros
            busca={busca}
            setBusca={setBusca}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            filtroGrupo={filtroGrupo}
            setFiltroGrupo={setFiltroGrupo}
            grupos={grupos}
            total={resumo.total}
            confirmados={resumo.confirmados}
            pendentes={resumo.pendentes}
            recusados={resumo.recusados}
            pessoasConfirmadas={resumo.pessoasConfirmadas}
          />

          {!readOnly && (
            <div style={styles.addBox}>
              <div style={styles.addRow}>
                <input
                  style={{ ...styles.input, flex: 2 }}
                  placeholder="Nome do convidado"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionar()}
                />
                <select
                  style={{ ...styles.input, flex: '0 0 150px', cursor: 'pointer' }}
                  value={novoGrupo}
                  onChange={(e) => setNovoGrupo(e.target.value)}
                >
                  <option value="">Grupo...</option>
                  {todosGrupos.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                  <option value="Outro">Outro...</option>
                </select>
                {novoGrupo === 'Outro' && (
                  <input
                    style={{ ...styles.input, flex: '0 0 140px' }}
                    placeholder="Qual grupo?"
                    value={novoGrupoOutro}
                    onChange={(e) => setNovoGrupoOutro(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && adicionar()}
                  />
                )}
                <input
                  style={{ ...styles.input, flex: '0 0 130px' }}
                  placeholder="Telefone"
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(formatarTelefone(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && adicionar()}
                />
                <input
                  style={{ ...styles.input, flex: '0 0 90px' }}
                  placeholder="Acomp."
                  type="number"
                  min="0"
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
            <Icon name="download" size={16} /> Exportar CSV
          </button>

          <div style={styles.list}>
            {carregando ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyText}>Carregando...</span>
              </div>
            ) : filtrados.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyText}>
                  {convidados.length === 0 ? 'Nenhum convidado cadastrado' : 'Nenhum resultado para os filtros'}
                </span>
              </div>
            ) : (
              filtrados.map((c) => (
                <ConvidadoItem
                  key={c.id}
                  convidado={c}
                  grupos={grupos}
                  mesas={mesas}
                  readOnly={readOnly}
                  onStatusChange={atualizarStatus}
                  onEdit={abrirEditar}
                  onExcluir={excluir}
                />
              ))
            )}
          </div>
        </main>
      </div>

      <ToastStatus
        toast={toast}
        onUndo={desfazerStatus}
        onClose={() => setToast(null)}
      />

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
              <select
                style={styles.select}
                value={editForm.grupo || ''}
                onChange={(e) => setEditForm({ ...editForm, grupo: e.target.value })}
              >
                <option value="">Selecione...</option>
                {todosGrupos.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
                <option value="Outro">Outro...</option>
              </select>
              {editForm.grupo === 'Outro' && (
                <input
                  style={{ ...styles.input, marginTop: '8px' }}
                  placeholder="Qual grupo?"
                  value={editGrupoOutro}
                  onChange={(e) => setEditGrupoOutro(e.target.value)}
                />
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Telefone</label>
              <input
                style={styles.input}
                placeholder="(00) 00000-0000"
                value={editForm.telefone || ''}
                onChange={(e) => setEditForm({ ...editForm, telefone: formatarTelefone(e.target.value) })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Acompanhantes</label>
              <input
                style={styles.input}
                type="number"
                min="0"
                value={editForm.acompanhantes || 0}
                onChange={(e) => setEditForm({ ...editForm, acompanhantes: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mesa</label>
              <input
                style={styles.input}
                placeholder="Numero ou nome da mesa"
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
  addBox: { marginBottom: '16px' },
  addRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontFamily: 'var(--font-body)', background: 'var(--color-white)', color: 'var(--color-text-primary)', minWidth: '100px', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontFamily: 'var(--font-body)', background: 'var(--color-white)', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--color-brand)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, minWidth: '44px', height: '42px' },
  btnSecondary: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-off-white)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' },
  list: { background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' },
  emptyState: { padding: '40px 16px', textAlign: 'center' },
  emptyText: { fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' },
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