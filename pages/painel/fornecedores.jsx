import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import InputMoeda from '../../components/ui/InputMoeda';
import { useAuth } from '../../hooks/useAuth';
import {
  CATEGORIAS_PRINCIPAIS,
  getSubcategoriasPorPrincipal,
  getServicos,
  getLabelSubcategoria,
  getLabelCategoriaPrincipal,
  getCategoriaPrincipal,
  STATUS_FORNECEDOR,
} from '../../utils/catalogoFornecedores';

function formatarTelefone(valor) {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function FornecedoresPage() {
  return (
    <ProtectedRoute>
      <FornecedoresContent />
    </ProtectedRoute>
  );
}

function FornecedoresContent() {
  const { user, evento, hasAccess, supabase } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({});
  const [aceiteTermo, setAceiteTermo] = useState(false);
  const [assinando, setAssinando] = useState(false);
  const [tooltipVisivel, setTooltipVisivel] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [visualizacao, setVisualizacao] = useState('lista');
  const [agrupar, setAgrupar] = useState(false);

  const readOnly = !hasAccess;

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

    const valorTotal = Number(form.valor_total) || 0;
    const valorEntrada = Number(form.valor_entrada) || 0;
    const valorSaldo = valorTotal - valorEntrada;

    const payload = {
      ...form,
      evento_id: evento.id,
      usuario_id: user.id,
      valor_saldo: valorSaldo,
    };

    if (form.pre_criado && form.nome && form.nome.trim()) {
      payload.pre_criado = false;
    }

    if (form.id) {
      await supabase.from('fornecedores').update(payload).eq('id', form.id);
    } else {
      await supabase.from('fornecedores').insert(payload);
    }
    setModalAberto(false);
    setForm({});
    setAceiteTermo(false);
    buscar();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir fornecedor?')) return;
    await supabase.from('fornecedores').delete().eq('id', id);
    buscar();
  };

  const assinarContrato = async (fornecedorId) => {
    if (!aceiteTermo) return;
    setAssinando(true);
    try {
      const res = await fetch('/api/fornecedores/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fornecedorId }),
      });
      const data = await res.json();
      if (data.sucesso) {
        alert('Contrato assinado digitalmente com sucesso!');
        buscar();
      } else {
        alert('Erro: ' + data.erro);
      }
    } catch (err) {
      alert('Erro ao assinar contrato');
    } finally {
      setAssinando(false);
      setAceiteTermo(false);
    }
  };

  const subcategoriasDisponiveis = form.categoria_principal
    ? getSubcategoriasPorPrincipal(form.categoria_principal)
    : [];

  const servicosDisponiveis = form.categoria
    ? getServicos(form.categoria)
    : [];

  const ehOutro = form.categoria === 'outro';

  const fornecedoresFiltrados = filtroStatus === 'todos'
    ? fornecedores
    : fornecedores.filter(f => f.status === filtroStatus);

  const grupos = {};
  if (agrupar) {
    fornecedoresFiltrados.forEach(f => {
      const catPrincipal = getLabelCategoriaPrincipal(f.categoria) || 'Outro';
      if (!grupos[catPrincipal]) grupos[catPrincipal] = [];
      grupos[catPrincipal].push(f);
    });
  }

  const nomeCasal = evento?.nome_evento || '';

  const renderCard = (f) => {
    const ehPreCriado = f.pre_criado === true && (!f.nome || !f.nome.trim());
    const statusInfo = STATUS_FORNECEDOR.find(s => s.id === f.status);

    return (
      <div key={f.id} style={{ ...styles.card, ...(ehPreCriado ? styles.cardPreCriado : {}) }}>
        <div style={styles.cardHeader}>
          <span style={styles.categoria}>
            {getLabelCategoriaPrincipal(f.categoria)}
            {getLabelCategoriaPrincipal(f.categoria) && ' → '}
            {getLabelSubcategoria(f.categoria)}
          </span>
          <span style={{ ...styles.badge, background: statusInfo?.color || '#8B6F5E' }}>
            {statusInfo?.label || f.status}
          </span>
        </div>

        {ehPreCriado ? (
          <div style={styles.preCriadoBox}>
            <span style={styles.preCriadoIcon}>📋</span>
            <div>
              <h3 style={styles.preCriadoTitulo}>Aguardando informações</h3>
              <p style={styles.preCriadoTexto}>Clique para preencher os dados deste fornecedor</p>
            </div>
          </div>
        ) : (
          <>
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
            {f.contrato_assinado_em && (
              <div style={styles.assinado}>
                <Icon name="check" size={12} color="#2E7D32" /> Assinado em {new Date(f.contrato_assinado_em).toLocaleDateString('pt-BR')}
              </div>
            )}
          </>
        )}

        {!readOnly && (
          <div style={styles.acoes}>
            <button onClick={() => {
              const catPrincipal = getCategoriaPrincipal(f.categoria)?.id || '';
              setForm({ ...f, categoria_principal: catPrincipal });
              setAceiteTermo(false);
              setModalAberto(true);
            }} style={styles.btnIcon}>
              <Icon name="edit" size={16} />
            </button>
            {!ehPreCriado && (
              <button onClick={() => excluir(f.id)} style={styles.btnIcon}>
                <Icon name="trash" size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head><title>Fornecedores | descomplicaí</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}>
              <span style={styles.readOnlyText}>Acesso expirado. Modo somente leitura. Assine para editar.</span>
            </div>
          )}

          <div style={styles.header}>
            <h1 style={styles.title}>Fornecedores</h1>
            {!readOnly && (
              <button
                onClick={() => { setForm({ status: 'a_contratar' }); setAceiteTermo(false); setModalAberto(true); }}
                style={styles.btnPrimary}
              >
                <Icon name="plus" size={16} color="#fff" /> Adicionar
              </button>
            )}
          </div>

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
              <label style={styles.filtroLabel}>Visualização</label>
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

          {agrupar ? (
            <div style={styles.gruposContainer}>
              {Object.entries(grupos).map(([categoriaPrincipal, itens]) => (
                <div key={categoriaPrincipal} style={styles.grupo}>
                  <h2 style={styles.grupoTitulo}>{categoriaPrincipal}</h2>
                  <div style={visualizacao === 'grade' ? styles.gridGrade : styles.grid}>
                    {itens.map(renderCard)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={visualizacao === 'grade' ? styles.gridGrade : styles.grid}>
              {fornecedoresFiltrados.map(renderCard)}
            </div>
          )}
        </main>
      </div>

      {modalAberto && (
        <div style={styles.modalOverlay} onClick={() => setModalAberto(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header do modal com X */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{form.id ? 'Editar' : 'Novo'} Fornecedor</h2>
              <button onClick={() => setModalAberto(false)} style={styles.btnFechar}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Categoria <span style={styles.required}>*</span></label>
              <select style={styles.select} value={form.categoria_principal || ''} onChange={(e) => setForm({ ...form, categoria_principal: e.target.value, categoria: '', servico: '' })}>
                <option value="">Selecione...</option>
                {CATEGORIAS_PRINCIPAIS.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {subcategoriasDisponiveis.length > 0 && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de serviço <span style={styles.required}>*</span></label>
                <select style={styles.select} value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value, servico: '' })}>
                  <option value="">Selecione...</option>
                  {subcategoriasDisponiveis.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.label}</option>
                  ))}
                </select>
              </div>
            )}

            {ehOutro && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Especifique o serviço <span style={styles.required}>*</span></label>
                <input style={styles.input} placeholder="Digite o tipo de serviço" value={form.servico || ''} onChange={(e) => setForm({ ...form, servico: e.target.value })} />
              </div>
            )}

            {!ehOutro && servicosDisponiveis.length > 0 && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Serviço contratado</label>
                <select style={styles.select} value={form.servico || ''} onChange={(e) => setForm({ ...form, servico: e.target.value })}>
                  <option value="">Selecione...</option>
                  {servicosDisponiveis.map((srv, i) => (
                    <option key={i} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Nome <span style={styles.required}>*</span></label>
              <input style={styles.input} placeholder="Nome do fornecedor" value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Empresa</label>
              <input style={styles.input} placeholder="Nome da empresa" value={form.empresa || ''} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Telefone</label>
              <input style={styles.input} placeholder="(00) 00000-0000" value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: formatarTelefone(e.target.value) })} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} placeholder="email@exemplo.com" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Instagram</label>
              <input style={styles.input} placeholder="@usuario" value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Site</label>
              <input style={styles.input} placeholder="https://..." value={form.site || ''} onChange={(e) => setForm({ ...form, site: e.target.value })} />
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <InputMoeda label="Valor Total" value={form.valor_total || 0} onChange={(v) => setForm({ ...form, valor_total: v })} />
              </div>
              <div style={styles.col}>
                <div style={{ position: 'relative' }}>
                  <InputMoeda
                    label={
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Sinal / adiantamento
                        <span style={styles.ajudaIcone} onMouseEnter={() => setTooltipVisivel(true)} onMouseLeave={() => setTooltipVisivel(false)}>í</span>
                      </span>
                    }
                    value={form.valor_entrada || 0}
                    onChange={(v) => setForm({ ...form, valor_entrada: v })}
                  />
                  {tooltipVisivel && (
                    <div style={styles.tooltip}>Valor pago antecipadamente para confirmar a contratação.</div>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status <span style={styles.required}>*</span></label>
              <select style={styles.select} value={form.status || 'a_contratar'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_FORNECEDOR.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notas</label>
              <textarea style={styles.textarea} placeholder="Observações..." value={form.notas || ''} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={3} />
            </div>

            {form.id && !form.pre_criado && (
              <div style={styles.assinaturaBox}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={aceiteTermo} onChange={(e) => setAceiteTermo(e.target.checked)} style={styles.checkbox} />
                  Li e aceito os termos do contrato com {form.nome || 'este fornecedor'}
                </label>
                <button
                  onClick={() => assinarContrato(form.id)}
                  disabled={!aceiteTermo || assinando}
                  style={{ ...styles.btnAssinar, opacity: !aceiteTermo || assinando ? 0.5 : 1, cursor: !aceiteTermo || assinando ? 'not-allowed' : 'pointer' }}
                >
                  {assinando ? 'Assinando...' : 'Assinar digitalmente'}
                </button>
              </div>
            )}

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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)', margin: 0 },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '6px', background: '#8B6F5E', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: '0 2px 8px rgba(139,111,94,0.3)' },
  btnSecondary: { background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-soft)' },
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
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px' },
  gridGrade: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' },
  card: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  categoria: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-soft)' },
  badge: { color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 },
  nome: { fontSize: '17px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' },
  empresa: { fontSize: '13px', color: 'var(--color-text-soft)', marginBottom: '10px' },
  contatos: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--color-text-soft)', marginBottom: '10px' },
  valores: { display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--color-text-soft)', marginBottom: '10px', flexWrap: 'wrap' },
  assinado: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2E7D32', marginBottom: '10px' },
  acoes: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  cardPreCriado: { background: '#FAFAF8', border: '1px dashed #C4B5A5' },
  preCriadoBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', marginBottom: '10px' },
  preCriadoIcon: { fontSize: '24px' },
  preCriadoTitulo: { fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' },
  preCriadoTexto: { fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-soft)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' },
  modal: { background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-primary)', margin: 0 },
  btnFechar: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-soft)' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '6px', fontFamily: 'var(--font-body)' },
  required: { color: '#C62828' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #C4B5A5', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box', background: '#fff' },
  select: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #C4B5A5', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--color-text)', background: '#fff', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #C4B5A5', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--color-text)', minHeight: '80px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#fff' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  col: { flex: 1, minWidth: '180px' },
  tooltip: { position: 'absolute', bottom: '100%', left: 0, background: 'var(--color-text)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '6px', whiteSpace: 'nowrap', zIndex: 10, fontFamily: 'var(--font-body)' },
  modalBotoes: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
  assinaturaBox: { border: '1px solid var(--color-secondary)', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#fafafa' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text)', marginBottom: '10px', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  btnAssinar: { width: '100%', padding: '10px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 },
  ajudaIcone: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #00A86B', color: '#00A86B', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'help', lineHeight: 1 },
};