import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import { useAuth } from '../../hooks/useAuth';
import ContratoCard from '../../components/contratos/ContratoCard';
import ContratoFiltros from '../../components/contratos/ContratoFiltros';
import ContratoEditor from '../../components/contratos/ContratoEditor';
import ContratoStatus from '../../components/contratos/ContratoStatus';

export default function ContratosPage() {
  return (
    <ProtectedRoute>
      <ContratosContent />
    </ProtectedRoute>
  );
}

function ContratosContent() {
  const { user, evento, hasAccess, supabase } = useAuth();
  const readOnly = !hasAccess;

  const [contratos, setContratos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [editorAberto, setEditorAberto] = useState(false);
  const [contratoAtivo, setContratoAtivo] = useState(null);

  // TODO: carregar contratos e fornecedores do Supabase

  const nomeCasal = evento?.nome_evento || '';

  return (
    <>
      <Head><title>Contratos | descomplicai</title></Head>
      <div style={{ minHeight: '100vh', background: '#F9F7F4', paddingTop: '52px' }}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} />
        <main style={{ maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' }}>
          {/* TODO: header, filtros, lista de contratos, editor */}
        </main>
      </div>
    </>
  );
}