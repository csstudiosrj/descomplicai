cat > pages/memorial/index.jsx << 'EOF'
import dynamic from 'next/dynamic'

const MemorialOrchestrator = dynamic(
  () => import('../../components/memorial/MemorialOrchestrator'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-secondary)'
      }}>
        <p>Carregando questionário...</p>
      </div>
    ),
  }
)

export default function MemorialPage() {
  return <MemorialOrchestrator />
}
EOF