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

function getIniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

function toSentenceCase(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const BADGE_COLORS = {
  a_contratar: { bg: '#F5F5F5', color: '#9E9E9E' },
  cotacao: { bg: '#FFF8E1', color: '#F9A825' },
  contratado: { bg: '#E8F5E9', color: '#10B981' },
  pago: { bg: '#E3F2FD', color: '#1976D2' },
  cancelado: { bg: '#FFEBEE', color: '#C62828' },
};

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
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [visualizacao, setVisualizacao] = useState('lista');
  const [agrupar, setAgrupar] = useState(false);

  const readOnly = !hasAccess;

  useEffect(() => {
    if (evento) buscar();
  }, [evento]);

  useEffect(() => {
    if (!menuAbertoId) return;
    const handleClose = () => setMenuAbertoId(null);
    window.addEventListener('scroll', handleClose, { once: true });
    window.addEventListener('resize', handleClose, { once: true });
    document.addEventListener('click', handleClose, { once: true });
    return () => {
      window.removeEventListener('scroll', handleClose);
      window.removeEventListener('resize', handleClose);
      document.removeEventListener('click', handleClose);
    };
  }, [menuAbertoId]);

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

    let fornecedorAtualizado = null;

    if (form.id) {
      const { data } = await supabase.from('fornecedores').update(payload).eq('id', form.id).select().single();
      fornecedorAtualizado = data || payload;
    } else {
      const { data } = await supabase.from('fornecedores').insert(payload).select().single();
      fornecedorAtualizado = data || payload;
    }

    if (fornecedorAtualizado && (fornecedorAtualizado.status === 'contratado' || fornecedorAtualizado.status === 'pago')) {
      try {
        await fetch('/api/fornecedores/sincronizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fornecedor: fornecedorAtualizado }),
        });
      } catch (err) {
        console.error('Erro ao sincronizar financeiro:', err);
      }
    }

    setModalAberto(false);
    setForm({});
    setAceiteTermo(false);
    buscar();
  };

  const excluir = async (id) => {
    if (readOnly) return;
    const f = fornecedores.find(x => x.id === id);
    if (!confirm(`Excluir "${f?.nome || 'fornecedor'}"?`)) return;
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
    const badgeColors = BADGE_COLORS[f.status] || BADGE_COLORS.a_contratar;

    const catPrincipal = toSentenceCase(getLabelCategoriaPrincipal(f.categoria) || '');
    const subcategoria = toSentenceCase(getLabelSubcategoria(f.categoria) || '');
    const categoriaLabel = catPrincipal && subcategoria
      ? `${catPrincipal} · ${subcategoria}`
      : catPrincipal || subcategoria || 'Outro';

    if (ehPreCriado) {
      return (
        <div key={f.id} style={cardVazioStyle}>
          <span style={cardVazioCategoriaStyle}>{categoriaLabel}</span>
          <div style={cardVazioRightStyle}>
            <span style={{
              ...badgeStyle,
              background: badgeColors.bg,
              color: badgeColors.color,
            }}>
              {statusInfo?.label || f.status}
            </span>
            {!readOnly && (
              <button
                onClick={() => {
                  const catPrincipal = getCategoriaPrincipal(f.categoria)?.id || '';
                  setForm({ ...f, categoria_principal: catPrincipal });
                  setAceiteTermo(false);
                  setModalAberto(true);
                }}
                style={btnPreencherStyle}
              >
                Preencher
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={f.id} style={cardStyle}>
        <div style={cardHeaderStyle}>
          <span style={categoriaStyle}>{categoriaLabel}</span>
          <div style={cardHeaderRightStyle}>
            <span style={{
              ...badgeStyle,
              background: badgeColors.bg,
              color: badgeColors.color,
            }}>
              {statusInfo?.label || f.status}
            </span>
            {!readOnly && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuAbertoId(menuAbertoId === f.id ? null : f.id); }}
                  style={menuDotsStyle}
                  title="Mais opções"
                >
                  <Icon name="moreOptions" size={18} />
                </button>
                {menuAbertoId === f.id && (
                  <>
                    <div style={menuBackdropStyle} onClick={() => setMenuAbertoId(null)} />
                    <div style={menuDropdownStyle}>
                      <button
                        onClick={() => {
                          const catPrincipal = getCategoriaPrincipal(f.categoria)?.id || '';
                          setForm({ ...f, categoria_principal: catPrincipal });
                          setAceiteTermo(false);
                          setModalAberto(true);
                          setMenuAbertoId(null);
                        }}
                        style={menuItemStyle}
                      >
                        <Icon name="edit" size={14} /> Editar
                      </button>
                      <button
                        onClick={() => { excluir(f.id); setMenuAbertoId(null); }}
                        style={{ ...menuItemStyle, color: '#C62828' }}
                      >
                        <Icon name="trash" size={14} /> Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={cardBodyStyle}>
          <div style={avatarNomeStyle}>
            <div style={avatarStyle}>
              <span style={avatarTextStyle}>{getIniciais(f.nome)}</span>
            </div>
            <div style={nomeWrapStyle}>
              <h3 style={nomeStyle}>{f.nome}</h3>
              {f.empresa && <p style={empresaStyle}>{f.empresa}</p>}
            </div>
          </div>

          <div style={contatosStyle}>
            {f.telefone && (
              <span style={contatoItemStyle}>
                <Icon name="phone" size={14} color="#A89B91" /> {f.telefone}
              </span>
            )}
            {f.email && (
              <span style={contatoItemStyle}>
                <Icon name="mail" size={14} color="#A89B91" /> {f.email}
              </span>
            )}
          </div>

          <div style={valoresCardStyle}>
            <div style={valorItemStyle}>
              <span style={valorLabelStyle}>Total</span>
              <span style={valorTotalStyle}>R$ {(f.valor_total || 0).toLocaleString('pt-BR')}</span>
            </div>
            <div style={valorDividerStyle} />
            <div style={valorItemStyle}>
              <span style={valorLabelStyle}>Entrada</span>
              <span style={valorNumStyle}>R$ {(f.valor_entrada || 0).toLocaleString('pt-BR')}</span>
            </div>
            <div style={valorDividerStyle} />
            <div style={valorItemStyle}>
              <span style={valorLabelStyle}>Saldo</span>
              <span style={valorNumStyle}>R$ {(f.valor_saldo || 0).toLocaleString('pt-BR')}</span>
            </div>
          </div>

          {f.contrato_assinado_em && (
            <div style={assinadoStyle}>
              <Icon name="check" size={14} color="#10B981" />
              <span>Assinado em {new Date(f.contrato_assinado_em).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head><title>Fornecedores | descomplicai</title></Head>
      <div style={pageStyle}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={mainStyle}>
          {readOnly && (
            <div style={readOnlyBannerStyle}>
              <span style={readOnlyTextStyle}>Acesso expirado. Modo somente leitura. Assine para editar.</span>
            </div>
          )}

          <div style={headerStyle}>
            <h1 style={titleStyle}>Fornecedores</h1>
            {!readOnly && (
              <button
                onClick={() => { setForm({ status: 'a_contratar' }); setAceiteTermo(false); setModalAberto(true); }}
                style={btnPrimaryStyle}
              >
                <Icon name="plus" size={16} color="#fff" /> Adicionar
              </button>
            )}
          </div>

          <div style={filtrosBarStyle}>
            <div style={filtroGrupoStyle}>
              <label style={filtroLabelStyle}>Status</label>
              <select style={filtroSelectStyle} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option value="todos">Todos</option>
                {STATUS_FORNECEDOR.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div style={filtroGrupoStyle}>
              <label style={filtroLabelStyle}>Visualização</label>
              <div style={toggleGroupStyle}>
                <button onClick={() => setVisualizacao('lista')} style={{ ...toggleBtnStyle, ...(visualizacao === 'lista' ? toggleAtivoStyle : {}) }} title="Lista">
                  <Icon name="list" size={16} />
                </button>
                <button onClick={() => setVisualizacao('grade')} style={{ ...toggleBtnStyle, ...(visualizacao === 'grade' ? toggleAtivoStyle : {}) }} title="Grade">
                  <Icon name="grid" size={16} />
                </button>
              </div>
            </div>
            <div style={filtroGrupoStyle}>
              <label style={filtroLabelStyle}>
                <input type="checkbox" checked={agrupar} onChange={(e) => setAgrupar(e.target.checked)} style={checkboxFiltroStyle} />
                Agrupar por categoria
              </label>
            </div>
          </div>

          {agrupar ? (
            <div style={gruposContainerStyle}>
              {Object.entries(grupos).map(([categoriaPrincipal, itens]) => (
                <div key={categoriaPrincipal} style={grupoStyle}>
                  <h2 style={grupoTituloStyle}>{toSentenceCase(categoriaPrincipal)}</h2>
                  <div style={visualizacao === 'grade' ? gridGradeStyle : gridStyle}>
                    {itens.map(renderCard)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={visualizacao === 'grade' ? gridGradeStyle : gridStyle}>
              {fornecedoresFiltrados.map(renderCard)}
            </div>
          )}
        </main>
      </div>

      {modalAberto && (
        <div style={modalOverlayStyle} onClick={() => setModalAberto(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{form.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
              <button onClick={() => setModalAberto(false)} style={btnFecharStyle}>
                <Icon name="close" size={20} color="#fff" />
              </button>
            </div>

            <div style={modalBodyStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Categoria <span style={requiredStyle}>*</span></label>
                <select style={selectStyle} value={form.categoria_principal || ''} onChange={(e) => setForm({ ...form, categoria_principal: e.target.value, categoria: '', servico: '' })}>
                  <option value="">Selecione...</option>
                  {CATEGORIAS_PRINCIPAIS.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {subcategoriasDisponiveis.length > 0 && (
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Tipo de serviço <span style={requiredStyle}>*</span></label>
                  <select style={selectStyle} value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value, servico: '' })}>
                    <option value="">Selecione...</option>
                    {subcategoriasDisponiveis.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {ehOutro && (
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Especifique o serviço <span style={requiredStyle}>*</span></label>
                  <input style={inputStyle} placeholder="Digite o tipo de serviço" value={form.servico || ''} onChange={(e) => setForm({ ...form, servico: e.target.value })} />
                </div>
              )}

              {!ehOutro && servicosDisponiveis.length > 0 && (
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Serviço contratado</label>
                  <select style={selectStyle} value={form.servico || ''} onChange={(e) => setForm({ ...form, servico: e.target.value })}>
                    <option value="">Selecione...</option>
                    {servicosDisponiveis.map((srv, i) => (
                      <option key={i} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={formGroupStyle}>
                <label style={labelStyle}>Nome <span style={requiredStyle}>*</span></label>
                <input style={inputStyle} placeholder="Nome do fornecedor" value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Empresa</label>
                <input style={inputStyle} placeholder="Nome da empresa" value={form.empresa || ''} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Telefone</label>
                <input style={inputStyle} placeholder="(00) 00000-0000" value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: formatarTelefone(e.target.value) })} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} placeholder="email@exemplo.com" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram</label>
                <input style={inputStyle} placeholder="@usuario" value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Site</label>
                <input style={inputStyle} placeholder="https://..." value={form.site || ''} onChange={(e) => setForm({ ...form, site: e.target.value })} />
              </div>

              <div style={rowStyle}>
                <div style={colStyle}>
                  <InputMoeda label="Valor Total" value={form.valor_total || 0} onChange={(v) => setForm({ ...form, valor_total: v })} />
                </div>
                <div style={colStyle}>
                  <div style={{ position: 'relative' }}>
                    <InputMoeda
                      label={
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          Sinal / adiantamento
                          <span style={ajudaIconeStyle} onMouseEnter={() => setTooltipVisivel(true)} onMouseLeave={() => setTooltipVisivel(false)}>
                            <Icon name="info" size={12} />
                          </span>
                        </span>
                      }
                      value={form.valor_entrada || 0}
                      onChange={(v) => setForm({ ...form, valor_entrada: v })}
                    />
                    {tooltipVisivel && (
                      <div style={tooltipStyle}>Valor pago antecipadamente para confirmar a contratacao.</div>
                    )}
                  </div>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Status <span style={requiredStyle}>*</span></label>
                <select style={selectStyle} value={form.status || 'a_contratar'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_FORNECEDOR.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Notas</label>
                <textarea style={textareaStyle} placeholder="Observacoes..." value={form.notas || ''} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={3} />
              </div>

              {form.id && !form.pre_criado && (
                <div style={assinaturaBoxStyle}>
                  <label style={checkboxLabelStyle}>
                    <input type="checkbox" checked={aceiteTermo} onChange={(e) => setAceiteTermo(e.target.checked)} style={checkboxStyle} />
                    Li e aceito os termos do contrato com {form.nome || 'este fornecedor'}
                  </label>
                  <button
                    onClick={() => assinarContrato(form.id)}
                    disabled={!aceiteTermo || assinando}
                    style={{ ...btnAssinarStyle, opacity: !aceiteTermo || assinando ? 0.5 : 1, cursor: !aceiteTermo || assinando ? 'not-allowed' : 'pointer' }}
                  >
                    {assinando ? 'Assinando...' : 'Assinar digitalmente'}
                  </button>
                </div>
              )}

              <div style={modalBotoesStyle}>
                <button onClick={() => setModalAberto(false)} style={btnCancelTextStyle}>Cancelar</button>
                <button onClick={salvar} style={btnSaveStyle}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== TOKENS VISUAIS ===== */

const pageStyle = { minHeight: '100vh', background: '#F9F7F4', paddingTop: '52px' };
const mainStyle = { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' };

const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' };
const titleStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '24px', color: '#8B6F5E', fontWeight: 400, margin: 0 };

const btnPrimaryStyle = { display: 'flex', alignItems: 'center', gap: '6px', background: '#8B6F5E', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)' };

const filtrosBarStyle = { display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #F0EDE9' };
const filtroGrupoStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const filtroLabelStyle = { fontSize: '12px', color: '#A89B91', fontFamily: 'var(--font-body)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' };
const filtroSelectStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4C8C0', fontSize: '14px', fontFamily: 'var(--font-body)', background: '#fff', color: '#1A1714', outline: 'none', minWidth: '140px' };
const toggleGroupStyle = { display: 'flex', gap: '2px', border: '1px solid #D4C8C0', borderRadius: '8px', overflow: 'hidden' };
const toggleBtnStyle = { padding: '8px 12px', background: '#fff', border: 'none', cursor: 'pointer', color: '#A89B91' };
const toggleAtivoStyle = { background: '#8B6F5E', color: '#fff' };
const checkboxFiltroStyle = { width: '14px', height: '14px', cursor: 'pointer' };

const gruposContainerStyle = { display: 'flex', flexDirection: 'column', gap: '24px' };
const grupoStyle = {};
const grupoTituloStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '18px', color: '#8B6F5E', fontWeight: 400, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #F0EDE9' };

const gridStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const gridGradeStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' };

/* Card preenchido */
const cardStyle = { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #F0EDE9', display: 'flex', flexDirection: 'column', gap: '12px' };
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' };
const cardHeaderRightStyle = { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 };
const categoriaStyle = { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#A89B91', fontFamily: 'var(--font-body)', fontWeight: 500 };
const badgeStyle = { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' };

const menuDotsStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', color: '#A89B91', borderRadius: '8px', transition: 'background 150ms ease' };
const menuBackdropStyle = { position: 'fixed', inset: 0, zIndex: 50 };
const menuDropdownStyle = { position: 'absolute', top: '100%', right: 0, background: '#fff', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #F0EDE9', padding: '6px', zIndex: 60, minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' };
const menuItemStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#1A1714', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap' };

const cardBodyStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const avatarNomeStyle = { display: 'flex', alignItems: 'center', gap: '12px' };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', background: '#F0EDE9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const avatarTextStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '14px', fontWeight: 600, color: '#A89B91', lineHeight: 1 };
const nomeWrapStyle = { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 };
const nomeStyle = { fontSize: '16px', fontWeight: 600, color: '#1A1714', margin: 0, fontFamily: 'var(--font-body)' };
const empresaStyle = { fontSize: '13px', color: '#A89B91', margin: 0, fontFamily: 'var(--font-body)' };

const contatosStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const contatoItemStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#A89B91', fontFamily: 'var(--font-body)' };

const valoresCardStyle = { display: 'flex', alignItems: 'center', gap: '0', background: '#F9F7F4', borderRadius: '8px', padding: '10px 12px' };
const valorItemStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: 1 };
const valorLabelStyle = { fontSize: '10px', color: '#A89B91', textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '0.3px' };
const valorTotalStyle = { fontSize: '14px', fontWeight: 700, color: '#8B6F5E', fontFamily: 'var(--font-body)' };
const valorNumStyle = { fontSize: '13px', fontWeight: 500, color: '#1A1714', fontFamily: 'var(--font-body)' };
const valorDividerStyle = { width: '1px', height: '24px', background: '#F0EDE9' };

const assinadoStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981', fontFamily: 'var(--font-body)' };

/* Card vazio (pré-criado) */
const cardVazioStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F5F0EB', border: '1px dashed #D4C8C0', borderRadius: '10px', minHeight: '44px', maxHeight: '52px', gap: '12px' };
const cardVazioCategoriaStyle = { fontSize: '13px', color: '#A89B91', fontFamily: 'var(--font-body)', fontWeight: 500 };
const cardVazioRightStyle = { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 };
const btnPreencherStyle = { background: 'none', border: 'none', color: '#8B6F5E', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'background 150ms ease' };

/* Modal */
const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(26,23,20,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' };
const modalStyle = { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' };
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: '#8B6F5E', flexShrink: 0 };
const modalTitleStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '20px', color: '#fff', fontWeight: 400, margin: 0 };
const btnFecharStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalBodyStyle = { padding: '24px', overflowY: 'auto', flex: 1 };

const formGroupStyle = { marginBottom: '14px' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 500, color: '#1A1714', marginBottom: '6px', fontFamily: 'var(--font-body)' };
const requiredStyle = { color: '#C62828' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D4C8C0', fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1A1714', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const selectStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D4C8C0', fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1A1714', background: '#fff', outline: 'none', boxSizing: 'border-box' };
const textareaStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D4C8C0', fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1A1714', minHeight: '80px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const rowStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap' };
const colStyle = { flex: 1, minWidth: '180px' };
const tooltipStyle = { position: 'absolute', bottom: '100%', left: 0, background: '#1A1714', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '6px', whiteSpace: 'nowrap', zIndex: 10, fontFamily: 'var(--font-body)' };
const ajudaIconeStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #8B6F5E', color: '#8B6F5E', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'help', lineHeight: 1 };

const modalBotoesStyle = { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', alignItems: 'center' };
const btnCancelTextStyle = { background: 'none', border: 'none', color: '#A89B91', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', padding: '10px 12px' };
const btnSaveStyle = { background: '#8B6F5E', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)' };

const readOnlyBannerStyle = { background: '#FFF8E1', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' };
const readOnlyTextStyle = { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' };

const assinaturaBoxStyle = { border: '1px solid #F0EDE9', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#F9F7F4' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1714', marginBottom: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)' };
const checkboxStyle = { width: '16px', height: '16px', cursor: 'pointer' };
const btnAssinarStyle = { width: '100%', padding: '10px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)' };