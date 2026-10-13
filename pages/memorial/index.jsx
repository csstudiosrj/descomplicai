// pages/memorial/index.jsx
// Página principal do memorial — delega tudo pro MemorialOrchestrator.
// NOTA: Lógica de ?fase=dna removida. O DNA agora é um step da árvore (StepDNA).
// O Orchestrator gerencia todo o fluxo: Step00 → StepPerfil → StepDNA → resto da árvore.

import Head from 'next/head';
import dynamic from 'next/dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br';

const MemorialOrchestrator = dynamic(
  () => import('../../components/memorial/MemorialOrchestrator'),
  {
    ssr: false,
    loading: () => <p>Carregando questionário...</p>,
  }
)

export default function MemorialPage() {
  return (
    <>
      <Head>
        <title>Planeje seu casamento — Descomplicai</title>
        <meta
          name="description"
          content="Responda algumas perguntas e receba um plano personalizado para o seu casamento. Rapido, gratuito e sem estresse."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${SITE_URL}/memorial`} />
      </Head>
      <MemorialOrchestrator />
    </>
  );
}
