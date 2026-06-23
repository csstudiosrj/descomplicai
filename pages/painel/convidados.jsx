import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import Modal from '../../components/ui/Modal';
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
  const router = useRouter();
  const { user, evento, supabase } = useAuth();

  const [convidados, setConvidados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroGrupo, setFiltroGrupo] = useState('todos');

  // Modal Adicionar
  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('');
  const [novoGrupoOutro, setNovoGrupoOutro] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoAcompanhantes, setNovoAcompanhantes] = useState('');

  // Modal Editar
  const [modalEditar, setModalEditar] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editGrupoOutro, setEditGrupoOutro] = useState('');

  const [erro, setErro] = useState('');
  const [toast, setToast] = useState(null);
  const [ultimoStatus, setUltimoStatus] = useState(null);

  const [resumo, setResumo] = useState({ total: 0, confirmados: 0, pendentes: 0, recusados: 0, pessoasConfirmadas: 0 });

  useEffect(() => {
    if (evento && user) carregarTudo();
  }, [evento, user]);

  const carregarTudo = async () => {
    setCarregando(true);

    let listaGrupos = [];
    try {
      const { data: gruposData } = await supabase
        .from('grupos_convidados')
        .select('*')
        .eq('evento_id', evento.id)
        .order('ordem');
      if (gruposData && gruposData.length > 0) {
        listaGrupos = gruposData;
      } else {
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
    } catch {
      listaGrupos = GRUPOS_PADRAO.map((nome, idx) => ({
        id: `local-${idx}`, evento_id: evento.id, nome, ordem: idx,
      }));
    }
    setGrupos(listaGrupos);

    try {
      const { data: mesasData } = await supabase
        .from('mesas')
        .select('id, numero')
        .eq('evento_id', evento.id)
        .order('numero');
      setMesas(mesasData || []);
    } catch {
      setMesas([]);
    }

    const { data, error } = await supabase
      .from('convidados')
      .select('*')
      .eq('evento_id', evento.id)
      .order('nome');

    if (error) {
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

  const resetFormAdicionar = () => {
    setNovoNome('');
    setNovoGrupo('');
    setNovoGrupoOutro('');
    setNovoTelefone('');
    setNovoAcompanhantes('');
    setErro('');
  };

  const adicionar = async () => {
    if (readOnly || !novoNome.trim()) return;
    setErro('');

    let grupoFinal = novoGrupo;
    if (novoGrupo === 'Outro') {
      grupoFinal = novoGrupoOutro.trim();
      if (!grupoFinal) { setErro('Informe o nome do novo grupo'); return; }
      await supabase.from('grupos_convidados').insert({
        evento_id: evento.id, nome: grupoFinal, ordem: grupos.length,
      });
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
    if (error) { setErro('Erro ao adicionar: ' + error.message); return; }

    resetFormAdicionar();
    setModalAdicionar(false);
    carregarTudo();
  };

  const atualizarStatus = async (id, confirmado) => {
    if (readOnly) return;
    const conv = convidados.find(c => c.id === id);
    if (!conv || conv.confirmado === confirmado) return;
    setUltimoStatus({ id, anterior: conv.confirmado });

    const { error } = await supabase.from('convidados').update({ confirmado }).eq('id', id);
    if (error) return;

    setToast({ id, nome: conv.nome, novoStatus: confirmado, anterior: conv.confirmado });
    carregarTudo();
  };

  const desfazerStatus = async () => {
    if (!ultimoStatus) return;
    await supabase.from('convidados').update({ confirmado: ultimoStatus.anterior }).eq('id', ultimoStatus.id);
    setUltimoStatus(null); setToast(null); carregarTudo();
  };

  const salvarEdicao = async () => {
    if (readOnly || !editForm.id) return;
    let grupoFinal = editForm.grupo;
    if (editForm.grupo === 'Outro') {
      grupoFinal = editGrupoOutro.trim();
      if (!grupoFinal) { setErro('Informe o nome do novo grupo'); return; }
      await supabase.from('grupos_convidados').insert({ evento_id: evento.id, nome: grupoFinal, ordem: grupos.length });
      await carregarTudo();
    }

    const payload = {
      nome: editForm.nome?.trim(),
      grupo: grupoFinal || 'Geral',
      telefone: editForm.telefone?.trim() || null,
      mesa: editForm.mesa?.trim() || null,
      acompanhantes: Number(editForm.acompanhantes) || 0,
    };
    const { error } = await supabase.from('convidados').update(payload).eq('id', editForm.id);
    if (error) { setErro('Erro ao editar: ' + error.message); return; }

    setModalEditar(false); setEditForm({}); setEditGrupoOutro(''); setErro('');
    carregarTudo();
  };

  const excluir = async (id) => {
    if (readOnly) return;
    const conv = convidados.find(c => c.id === id);
    if (!confirm(`Excluir "${conv?.nome || 'convidado'}"?`)) return;
    await supabase.from('convidados').delete().eq('id', id);
    carregarTudo();
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'Grupo', 'Telefone', 'Confirmado', 'Acompanhantes', 'Mesa'];
    const rows = convidados.map(c => [c.nome, c.grupo || '', c.telefone || '', c.confirmado, c.acompanhantes || 0, c.mesa || '']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `convidados-${evento?.nome_evento || 'casamento'}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const abrirEditar = (c) => {
    setEditForm({ ...c });
    const todosGrupos = [...GRUPOS_PADRAO, ...grupos.map(g => g.nome)];
    const grupoExiste = todosGrupos.includes(c.grupo);
    if (c.grupo && !grupoExiste && c.grupo !== 'Geral') {
      setEditForm(prev => ({ ...prev, grupo: 'Outro' }));
      setEditGrupoOutro(c.grupo);
    } else { setEditGrupoOutro(''); }
    setErro('');
    setModalEditar(true);
  };

  const filtrados = convidados.filter((c) => {
    const matchBusca = !busca || c.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || c.confirmado === filtroStatus;
    const matchGrupo = filtroGrupo === 'todos' || c.grupo === filtroGrupo;
    return matchBusca && matchStatus && matchGrupo;
  });

  const nomeCasal = evento?.nome_evento || '';
  const todosGrupos = Array.from(new Set([...GRUPOS_PADRAO, ...grupos.map(g => g.nome)]));

  const renderFormFields = (isEdit = false) => {
    const form = isEdit ? editForm : {
      nome: novoNome, grupo: novoGrupo, telefone: novoTelefone, acompanhantes: novoAcompanhantes, mesa: ''
    };
    const setForm = isEdit ? setEditForm : null;

    const handleChange = (field, val) => {
      if (isEdit) setForm(prev => ({ ...prev, [field]: val }));
      else {
        if (field === 'nome') setNovoNome(val);
        if (field === 'grupo') setNovoGrupo(val);
        if (field === 'telefone') setNovoTelefone(val);
        if (field === 'acompanhantes') setNovoAcompanhantes(val);
      }
    };

    const grupoValue = isEdit ? editForm.grupo : novoGrupo;
    const grupoOutroValue = isEdit ? editGrupoOutro : novoGrupoOutro;
    const setGrupoOutro = isEdit ? setEditGrupoOutro : setNovoGrupoOutro;

    return (
      <>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Nome</label>
          <input
            style={inputStyle}
            placeholder="Nome do convidado"
            value={form.nome || ''}
            onChange={(e) => handleChange('nome', e.target.value)}
          />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Grupo</label>
          <select
            style={selectStyle}
            value={grupoValue || ''}
            onChange={(e) => handleChange('grupo', e.target.value)}
          >
            <option value="">Selecione...</option>
            {todosGrupos.map(g => <option key={g} value={g}>{g}</option>)}
            <option value="Outro">Outro...</option>
          </select>
          {grupoValue === 'Outro' && (
            <input
              style={{ ...inputStyle, marginTop: '8px' }}
              placeholder="Qual grupo?"
              value={grupoOutroValue}
              onChange={(e) => setGrupoOutro(e.target.value)}
            />
          )}
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Telefone</label>
          <input
            style={inputStyle}
            placeholder="(00) 00000-0000"
            value={form.telefone || ''}
            onChange={(e) => handleChange('telefone', formatarTelefone(e.target.value))}
          />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Acompanhantes</label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            placeholder="0"
            value={form.acompanhantes || ''}
            onChange={(e) => handleChange('acompanhantes', e.target.value)}
          />
        </div>
        {isEdit && (
          <div style={formGroupStyle}>
            <label style={labelStyle}>Mesa</label>
            <input
              style={inputStyle}
              placeholder="Número ou nome da mesa"
              value={editForm.mesa || ''}
              onChange={(e) => setEditForm({ ...editForm, mesa: e.target.value })}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Head><title>Convidados | descomplicai</title></Head>
      <div style={pageStyle}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={mainStyle}>
          {readOnly && (
            <div style={readOnlyBannerStyle}>
              <span style={readOnlyTextStyle}>Modo somente leitura. Assine para editar.</span>
            </div>
          )}
          {erro && !modalAdicionar && !modalEditar && (
            <div style={erroBannerStyle} onClick={() => setErro('')}>
              <span style={erroTextStyle}>{erro}</span>
              <button style={btnFecharErroStyle} onClick={() => setErro('')}>
                <Icon name="close" size={12} />
              </button>
            </div>
          )}

          <div style={headerRowStyle}>
            <h1 style={titleStyle}>Convidados</h1>
            <div style={headerActionsStyle}>
              <button onClick={exportarCSV} style={btnSecondaryStyle}>
                <Icon name="download" size={16} /> Exportar CSV
              </button>
              <button onClick={() => router.push('/painel/mesas')} style={btnMesasStyle}>
                <Icon name="layout" size={16} /> Ver mesas
              </button>
              {!readOnly && (
                <button onClick={() => { resetFormAdicionar(); setModalAdicionar(true); }} style={btnPrimaryStyle}>
                  <Icon name="plus" size={16} /> Adicionar convidado
                </button>
              )}
            </div>
          </div>

          <ConvidadoFiltros
            busca={busca} setBusca={setBusca}
            filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
            filtroGrupo={filtroGrupo} setFiltroGrupo={setFiltroGrupo}
            grupos={grupos}
            total={resumo.total} confirmados={resumo.confirmados}
            pendentes={resumo.pendentes} recusados={resumo.recusados}
            pessoasConfirmadas={resumo.pessoasConfirmadas}
          />

          <div style={listCardStyle}>
            {carregando ? (
              <div style={emptyStateStyle}><span style={emptyTextStyle}>Carregando...</span></div>
            ) : filtrados.length === 0 ? (
              <div style={emptyStateStyle}>
                <span style={emptyTextStyle}>
                  {convidados.length === 0 ? 'Nenhum convidado cadastrado' : 'Nenhum resultado para os filtros'}
                </span>
              </div>
            ) : (
              filtrados.map((c) => (
                <ConvidadoItem key={c.id} convidado={c} grupos={grupos} mesas={mesas}
                  readOnly={readOnly} onStatusChange={atualizarStatus}
                  onEdit={abrirEditar} onExcluir={excluir} />
              ))
            )}
          </div>
        </main>
      </div>

      <ToastStatus toast={toast} onUndo={desfazerStatus} onClose={() => setToast(null)} />

      {/* Modal Adicionar */}
      <Modal isOpen={modalAdicionar} onClose={() => setModalAdicionar(false)} title="Adicionar convidado" size="md">
        {erro && modalAdicionar && (
          <div style={{ ...erroBannerStyle, marginBottom: '16px' }} onClick={() => setErro('')}>
            <span style={erroTextStyle}>{erro}</span>
          </div>
        )}
        {renderFormFields(false)}
        <div style={modalBotoesStyle}>
          <button onClick={() => setModalAdicionar(false)} style={btnCancelStyle}>Cancelar</button>
          <button onClick={adicionar} style={btnSaveStyle}>Salvar</button>
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={modalEditar} onClose={() => setModalEditar(false)} title="Editar convidado" size="md">
        {erro && modalEditar && (
          <div style={{ ...erroBannerStyle, marginBottom: '16px' }} onClick={() => setErro('')}>
            <span style={erroTextStyle}>{erro}</span>
          </div>
        )}
        {renderFormFields(true)}
        <div style={modalBotoesStyle}>
          <button onClick={() => setModalEditar(false)} style={btnCancelStyle}>Cancelar</button>
          <button onClick={salvarEdicao} style={btnSaveStyle}>Salvar</button>
        </div>
      </Modal>
    </>
  );
}

/* ===== TOKENS VISUAIS ===== */
const pageStyle = { minHeight: '100vh', background: '#F9F7F4', paddingTop: '52px' };
const mainStyle = { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' };

const headerRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
  gap: '12px',
};

const titleStyle = {
  fontFamily: 'var(--font-display, Georgia, serif)',
  fontSize: '24px',
  color: '#8B6F5E',
  fontWeight: 400,
  margin: 0,
};

const headerActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
};

const btnPrimaryStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#8B6F5E',
  color: '#fff',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
};

const btnSecondaryStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#F9F7F4',
  color: '#1A1714',
  border: '1px solid #D4C8C0',
  padding: '10px 14px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
};

const btnMesasStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #8B6F5E',
  background: '#fff',
  color: '#8B6F5E',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
};

const listCardStyle = {
  background: '#fff',
  borderRadius: '12px',
  border: '1px solid #F0EDE9',
  overflow: 'hidden',
};

const emptyStateStyle = { padding: '40px 16px', textAlign: 'center' };
const emptyTextStyle = { fontSize: '14px', color: '#A89B91', fontFamily: 'var(--font-body)' };

const readOnlyBannerStyle = {
  background: '#FFF8E1',
  border: '1px solid #F9A825',
  borderRadius: '10px',
  padding: '12px 16px',
  textAlign: 'center',
  marginBottom: '16px',
};
const readOnlyTextStyle = { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' };

const erroBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#FFEBEE',
  border: '1px solid #C62828',
  borderRadius: '10px',
  padding: '10px 14px',
  cursor: 'pointer',
};
const erroTextStyle = { fontSize: '13px', color: '#C62828', fontFamily: 'var(--font-body)' };
const btnFecharErroStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#C62828', padding: '2px' };

const formGroupStyle = { marginBottom: '14px' };
const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#1A1714',
  marginBottom: '6px',
  fontFamily: 'var(--font-body)',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #D4C8C0',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  background: '#fff',
  color: '#1A1714',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #D4C8C0',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  background: '#fff',
  color: '#1A1714',
  outline: 'none',
  boxSizing: 'border-box',
};

const modalBotoesStyle = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
  marginTop: '10px',
};

const btnCancelStyle = {
  background: '#F9F7F4',
  color: '#1A1714',
  border: '1px solid #D4C8C0',
  padding: '10px 18px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
};

const btnSaveStyle = {
  background: '#8B6F5E',
  color: '#fff',
  border: 'none',
  padding: '10px 18px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
};