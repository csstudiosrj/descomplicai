// pages/memorial/index.jsx
// Entry point do memorial — gerencia fluxo por fase na URL
// Componentes pesados são carregados apenas no cliente para evitar erros de SSR.

import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Header from '../../components/ui/Header';

const MemorialOrchestrator = dynamic(
  () => import('../../components/memorial/MemorialOrchestrator'),
  { ssr: false }
);

const DNACasamento = dynamic(
  () => import('../../components/memorial/DNACasamento'),
  { ssr: false }
);

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