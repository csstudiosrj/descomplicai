// pages/memorial/index.jsx

import Header from '../../components/ui/Header';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';

export default function MemorialPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '52px' }}>
        <MemorialOrchestrator />
      </main>
    </>
  );
}