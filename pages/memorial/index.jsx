// pages/memorial/index.jsx
// Página principal do memorial — delega tudo pro MemorialOrchestrator.
// NOTA: Lógica de ?fase=dna removida. O DNA agora é um step da árvore (StepDNA).
// O Orchestrator gerencia todo o fluxo: Step00 → StepPerfil → StepDNA → resto da árvore.

import dynamic from 'next/dynamic'

const MemorialOrchestrator = dynamic(
  () => import('../../components/memorial/MemorialOrchestrator'),
  {
    ssr: false,
    loading: () => <p>Carregando questionário...</p>,
  }
)

export default function MemorialPage() {
  return <MemorialOrchestrator />
}
