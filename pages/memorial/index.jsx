// Página principal do memorial — orquestrador do questionário
// Dependências diretas: React, MemorialOrchestrator

import React from 'react';
import Head from 'next/head';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';

export default function MemorialPage() {
  return (
    <>
      <Head>
        <title>Memorial — Descomplicaí</title>
        <meta name="description" content="Crie seu memorial de casamento passo a passo." />
        <html lang="pt-BR" />
      </Head>
      <MemorialOrchestrator />
    </>
  );
}