// pages/memorial/index.jsx
// Entry point do memorial — gerencia fluxo por fase na URL

import { useRouter } from 'next/router';
import Header from '../../components/ui/Header';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';
import DNACasamento from '../../components/memorial/DNACasamento';

// Força a página a ser renderizada no servidor sob demanda,
// evitando pré-renderização estática e erros com localStorage.
export async function getServerSideProps() {
  return { props: {} };
}

export default function MemorialPage() {
  const router = useRouter();
  const { fase } = router.query;

  const renderConteudo = () => {
    if (fase === 'dna') {
      return <DNACasamento />;
    }
    return <MemorialOrchestrator />;
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: '52px', minHeight: '100dvh', boxSizing: 'border-box' }}>
        {renderConteudo()}
      </main>
    </>
  );
}