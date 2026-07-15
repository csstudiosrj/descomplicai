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