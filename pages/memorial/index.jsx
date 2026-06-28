import Header from '../../components/ui/Header';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';

export default function MemorialPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '52px', height: '100dvh', boxSizing: 'border-box', overflow: 'hidden' }}>
        <MemorialOrchestrator />
      </main>
    </>
  );
}
