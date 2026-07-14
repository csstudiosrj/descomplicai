// pages/memorial/index.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/ui/Header';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';
import DNACasamento from '../../components/memorial/DNACasamento';

function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : fallback;
}

export default function MemorialPage() {
  const router = useRouter();
  const { fase } = router.query;

  return (
    <>
      <Header />
      <main style={{ paddingTop: '52px', minHeight: '100dvh', boxSizing: 'border-box' }}>
        <ClientOnly fallback={<p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando…</p>}>
          {fase === 'dna' ? <DNACasamento /> : <MemorialOrchestrator />}
        </ClientOnly>
      </main>
    </>
  );
}