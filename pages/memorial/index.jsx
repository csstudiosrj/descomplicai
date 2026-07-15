import dynamic from 'next/dynamic'

const TestComponent = dynamic(
  () => import('../../components/memorial/TestComponent'),
  {
    ssr: false,
    loading: () => <p>Carregando teste...</p>,
  }
)

export default function MemorialPage() {
  return <TestComponent />
}
