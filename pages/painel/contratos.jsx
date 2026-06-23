import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { gerarContrato, listarTemplates } from '../../utils/templateContratos';
import { getCategoriaPrincipal } from '../../utils/catalogoFornecedores';
import ContratoCard from '../../components/contratos/ContratoCard';
import ContratoEditor from '../../components/contratos/ContratoEditor';
import ContratoFiltros from '../../components/contratos/ContratoFiltros';

const STATUS_CONTRATO = [
  { id: 'todos', label: 'Todos' },
  { id: 'rascunho', label: 'Rascunho', color: '#9E9E9E', bg: '#F5F5F5' },
  { id: 'enviado', label: 'Enviado', color: '#F9A825', bg: '#FFF8E1' },
  { id: 'visualizado', label: 'Visualizado', color: '#1976D2', bg: '#E3F2FD' },
  { id: 'assinado', label: 'Assinado', color: '#10B981', bg: '#E8F5E9' },
  { id: 'recusado', label: 'Recusado', color: '#C62828', bg: '#FFEBEE' },
];

export default function ContratosPage() {
  return (
    <ProtectedRoute>
      <ContratosContent />
    </ProtectedRoute>
  );
}

function ContratosContent() {
  const router = useRouter();
  const { user, evento, hasAccess, supabase } = useAuth();
  const [contratos, setContratos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [modalEditor, setModalEditor] = useState(false);
  const [contratoAtual, setContratoAtual] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroFornecedor, setFiltroFornecedor] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const readOnly = !hasAccess;
  const nomeCasal = evento?.nome_evento || '';

  useEffect(() => {
    if (evento) carregarDados();
  }, [evento]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Abrir editor via query param (vem da página de fornecedores)
  useEffect(() => {
    if (!router.isReady || !contratos.length) return;
    const { contrato: contratoId, fornecedor: fornecedorId } = router.query;

    if (contratoId) {
      const c = contratos.find(x => x.id === contratoId);
      if (c) abrirEditor(c);
    } else if (fornecedorId) {
      criarContrato(fornecedorId);
    }
  }, [router.isReady, router.query, contratos]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [{ data: contratosData }, { data: fornecedoresData }] = await Promise.all([
        supabase.from('contratos').select('*').eq('evento_id', evento.id).order('criado_em', { ascending: false }),
        supabase.from('fornecedores').select('*').eq('evento_id', evento.id).order('nome'),
      ]);
      setContratos(contratosData || []);
      setFornecedores(fornecedoresData || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const criarContrato = async (fornecedorId) => {
    if (readOnly) return;

    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    if (!fornecedor) {
      setToast({ tipo: 'erro', mensagem: 'Fornecedor não encontrado.' });
      return;
    }

    const catPrincipal = getCategoriaPrincipal(fornecedor.categoria)?.id;
    if (!catPrincipal) {
      setToast({ tipo: 'erro', mensagem: 'Categoria não mapeada para template.' });
      return;
    }

    const dados = {
      nome_noivos: evento?.nome_evento || '___',
      data_evento: evento?.data_evento ? new Date(evento.data_evento).toLocaleDateString('pt-BR') : '___',
      local_evento: evento?.local_evento || '___',
      cidade_evento: evento?.cidade_evento || '___',
      nome_responsavel: fornecedor.nome || '___',
      nome_empresa: fornecedor.empresa || fornecedor.nome || '___',
      telefone: fornecedor.telefone || '___',
      email: fornecedor.email || '___',
      valor_total: (fornecedor.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      valor_entrada: (fornecedor.valor_entrada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      data_entrada: '___',
      valor_saldo: (fornecedor.valor_saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      data_saldo: '___',
      data_contrato: new Date().toLocaleDateString('pt-BR'),
    };

    const template = gerarContrato(catPrincipal, dados);
    if (!template) {
      setToast({ tipo: 'erro', mensagem: 'Template não encontrado para esta categoria.' });
      return;
    }

    try {
      const res = await fetch('/api/contratos/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: evento.id,
          fornecedor_id: fornecedorId,
          tipo: 'modelo_gerado',
          categoria: fornecedor.categoria,
          conteudo: template.conteudo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao criar');

      setToast({ tipo: 'sucesso', mensagem: 'Contrato criado!' });
      await carregarDados();
      abrirEditor(data.contrato);
    } catch (err) {
      console.error(err);
      setToast({ tipo: 'erro', mensagem: err.message || 'Erro ao criar contrato.' });
    }
  };

  const salvarContrato = async (contrato) => {
    if (readOnly) return;

    const { id, ...rest } = contrato;
    const payload = { ...rest, atualizado_em: new Date().toISOString() };

    const { error } = await supabase.from('contratos').update(payload).eq('id', id);
    if (error) {
      console.error('Erro ao salvar contrato:', error);
      setToast({ tipo: 'erro', mensagem: 'Erro ao salvar contrato.' });
      return;
    }

    setToast({ tipo: 'sucesso', mensagem: 'Contrato salvo!' });
    setModalEditor(false);
    setContratoAtual(null);
    carregarDados();
  };

  const excluirContrato = async (id) => {
    if (readOnly) return;
    if (!confirm('Excluir este contrato?')) return;
    await supabase.from('contratos').delete().eq('id', id);
    setToast({ tipo: 'sucesso', mensagem: 'Contrato excluído.' });
    carregarDados();
  };

  const enviarFornecedor = async (id) => {
    if (readOnly) return;
    try {
      const res = await fetch('/api/contratos/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contrato_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao enviar');

      setToast({ tipo: 'sucesso', mensagem: 'Email enviado para o fornecedor!' });
      carregarDados();
    } catch (err) {
      console.error(err);
      setToast({ tipo: 'erro', mensagem: err.message || 'Erro ao enviar email.' });
    }
  };

  const abrirEditor = (contrato) => {
    setContratoAtual(contrato);
    setModalEditor(true);
  };

  const fornecedoresSemContrato = fornecedores.filter(f => {
    const catPrincipal = getCategoriaPrincipal(f.categoria)?.id;
    const temContrato = contratos.some(c => c.fornecedor_id === f.id);
    return !temContrato && catPrincipal && listarTemplates().some(t => t.chave === catPrincipal);
  });

  const contratosFiltrados = contratos.filter(c => {
    const okStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    const okFornecedor = filtroFornecedor === 'todos' || c.fornecedor_id === filtroFornecedor;
    return okStatus && okFornecedor;
  });

  return (
    <>
      <Head><title>Contratos | descomplicai</title></Head>
      <div style={pageStyle}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={mainStyle}>
          {readOnly && (
            <div style={readOnlyBannerStyle}>
              <span style={readOnlyTextStyle}>Acesso expirado. Modo somente leitura. Assine para editar.</span>
            </div>
          )}

          <div style={headerStyle}>
            <h1 style={titleStyle}>Contratos</h1>
          </div>

          <ContratoFiltros
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            filtroFornecedor={filtroFornecedor}
            setFiltroFornecedor={setFiltroFornecedor}
            fornecedores={fornecedores}
          />

          {!readOnly && fornecedoresSemContrato.length > 0 && (
            <div style={criarSectionStyle}>
              <h2 style={sectionTitleStyle}>Criar contrato a partir de fornecedor</h2>
              <div style={fornecedoresGridStyle}>
                {fornecedoresSemContrato.map(f => {
                  const catPrincipal = getCategoriaPrincipal(f.categoria)?.id;
                  const templateInfo = listarTemplates().find(t => t.chave === catPrincipal);
                  return (
                    <div key={f.id} style={fornecedorMiniCardStyle}>
                      <div style={fornecedorMiniInfoStyle}>
                        <span style={fornecedorMiniNomeStyle}>{f.nome}</span>
                        <span style={fornecedorMiniEmpresaStyle}>{f.empresa || f.nome}</span>
                      </div>
                      <button
                        onClick={() => criarContrato(f.id)}
                        style={btnCriarContratoStyle}
                      >
                        <Icon name="plus" size={14} color="#fff" /> {templateInfo?.titulo || 'Criar contrato'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={contratosSectionStyle}>
            <h2 style={sectionTitleStyle}>
              Meus contratos
              <span style={contadorStyle}>({contratosFiltrados.length})</span>
            </h2>

            {loading ? (
              <div style={emptyStateStyle}>Carregando...</div>
            ) : contratosFiltrados.length === 0 ? (
              <div style={emptyStateStyle}>
                <Icon name="fileText" size={48} color="#D4C8C0" />
                <p style={emptyTextStyle}>Nenhum contrato encontrado.</p>
                {!readOnly && fornecedoresSemContrato.length === 0 && (
                  <p style={emptySubStyle}>Adicione fornecedores na página de Fornecedores para criar contratos.</p>
                )}
              </div>
            ) : (
              <div style={gridGradeStyle}>
                {contratosFiltrados.map(c => (
                  <ContratoCard
                    key={c.id}
                    contrato={c}
                    fornecedor={fornecedores.find(f => f.id === c.fornecedor_id)}
                    onEditar={() => abrirEditor(c)}
                    onExcluir={() => excluirContrato(c.id)}
                    onEnviar={() => enviarFornecedor(c.id)}
                    onReenviar={() => enviarFornecedor(c.id)}
                    onDownload={() => c.pdf_url && window.open(c.pdf_url, '_blank')}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div style={{
          ...toastStyle,
          background: toast.tipo === 'erro' ? '#FFEBEE' : '#E8F5E9',
          color: toast.tipo === 'erro' ? '#C62828' : '#10B981',
          border: `1px solid ${toast.tipo === 'erro' ? '#C62828' : '#10B981'}`,
        }}>
          {toast.mensagem}
        </div>
      )}

      {modalEditor && contratoAtual && (
        <ContratoEditor
          contrato={contratoAtual}
          fornecedor={fornecedores.find(f => f.id === contratoAtual.fornecedor_id)}
          onSalvar={salvarContrato}
          onFechar={() => { setModalEditor(false); setContratoAtual(null); }}
          readOnly={readOnly}
        />
      )}
    </>
  );
}

const pageStyle = { minHeight: '100vh', background: '#F9F7F4', paddingTop: '52px' };
const mainStyle = { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' };
const titleStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '24px', color: '#8B6F5E', fontWeight: 400, margin: 0 };
const readOnlyBannerStyle = { background: '#FFF8E1', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' };
const readOnlyTextStyle = { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' };
const criarSectionStyle = { background: '#fff', borderRadius: '12px', border: '1px solid #F0EDE9', padding: '20px', marginBottom: '24px' };
const contratosSectionStyle = {};
const sectionTitleStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '18px', color: '#8B6F5E', fontWeight: 400, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' };
const contadorStyle = { fontSize: '14px', color: '#A89B91', fontFamily: 'var(--font-body)' };
const fornecedoresGridStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const fornecedorMiniCardStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F9F7F4', borderRadius: '10px', border: '1px solid #F0EDE9', gap: '12px', flexWrap: 'wrap' };
const fornecedorMiniInfoStyle = { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 };
const fornecedorMiniNomeStyle = { fontSize: '14px', fontWeight: 600, color: '#1A1714', fontFamily: 'var(--font-body)' };
const fornecedorMiniEmpresaStyle = { fontSize: '12px', color: '#A89B91', fontFamily: 'var(--font-body)' };
const btnCriarContratoStyle = { display: 'flex', alignItems: 'center', gap: '6px', background: '#8B6F5E', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0 };
const gridGradeStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' };
const emptyStateStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#fff', borderRadius: '12px', border: '1px solid #F0EDE9', gap: '12px' };
const emptyTextStyle = { fontSize: '15px', color: '#A89B91', fontFamily: 'var(--font-body)', margin: 0 };
const emptySubStyle = { fontSize: '13px', color: '#D4C8C0', fontFamily: 'var(--font-body)', margin: 0, textAlign: 'center' };
const toastStyle = { position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-body)', zIndex: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' };