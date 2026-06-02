// Lista de convidados — confirmações, mesas e contatos
// Dependências diretas: React, next/head

import React, { useState } from 'react';
import Head from 'next/head';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function ConvidadosPage() {
  const [convidados, setConvidados] = useState([
    { id: 1, nome: 'Maria Silva', email: 'maria@email.com', status: 'confirmado', mesa: '1' },
    { id: 2, nome: 'João Pereira', email: 'joao@email.com', status: 'pendente', mesa: '-' },
  ]);
  const [filtro, setFiltro] = useState('');

  const filtrados = convidados.filter((c) => c.nome.toLowerCase().includes(filtro.toLowerCase()));

  const statusBadge = {
    confirmado: 'success',
    pendente: 'warning',
    recusado: 'danger',
  };

  return (
    <>
      <Head><title>Convidados — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-6) var(--space-4)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>Convidados</h1>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Input type="search" placeholder="Buscar convidado..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {filtrados.map((c) => (
              <Card key={c.id} variant="default" padding="md">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{c.nome}</span>
                  <Badge variant={statusBadge[c.status] || 'default'} size="sm" pill>{c.status}</Badge>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>{c.email}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Mesa: {c.mesa}</div>
              </Card>
            ))}
          </div>

          {filtrados.length === 0 && (
            <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginTop: 'var(--space-8)' }}>
              Nenhum convidado encontrado.
            </p>
          )}
        </div>
      </div>
    </>
  );
}