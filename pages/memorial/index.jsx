// pages/memorial/index.jsx
// Entry point do memorial — gerencia fluxo por fase na URL

import { useRouter } from 'next/router';
import Header from '../../components/ui/Header';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';
import DNACasamento from '../../components/memorial/DNACasamento';

export default function MemorialPage() {
  const router = useRouter();
  const { fase } = router.query;

  const renderConteudo = () => {
    if (fase === 'dna') {
      return <DNACasamento />;
    }
    // Qualquer outra fase (incluindo sem fase na URL):
    // o MemorialOrchestrator cuida do Step00, swipe, aprofundamento, etc.
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
