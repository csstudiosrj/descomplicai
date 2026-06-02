// Gestão de fornecedores contratados e em negociação
// Dependências diretas: React, next/head

import React, { useState } from 'react';
import Head from 'next/head';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const FORNECEDORES_INICIAIS = [
  { id: 1, nome: 'Espaço Villa Real', categoria: 'Espaço', status: 'contratado', valor: 15000 },
  { id: 2, nome: 'Buffet Sabores', categoria: 'Buffet', status: 'negociacao', valor: 12000 },
  { id: 3, nome: 'Foto Arte', categoria: 'Fotografia', status: 'orcamento', valor: null },
];

const STATUS_BADGE = {
  contratado: 'success',
  negociacao: 'warning',
  orcamento: 'info',
  cancelado: 'danger',
};

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState(FORNECEDORES_INICIAIS);
  const [busca, setBusca] = useState('');

  const filtrados = fornecedores.filter((f) => f.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <>
      <Head><title>Fornecedores — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-6) var(--space-4)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>Fornecedores</h1>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Input type="search" placeholder="Buscar fornecedor..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {filtrados.map((f) => (
              <Card key={f.id} variant="default" padding="lg">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{f.nome}</span>
                  <Badge variant={STATUS_BADGE[f.status]} size="sm" pill>{f.status}</Badge>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>{f.categoria}</div>
                {f.valor && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                    R$ {f.valor.toLocaleString('pt-BR')}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {filtrados.length === 0 && (
            <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginTop: 'var(--space-8)' }}>
              Nenhum fornecedor encontrado.
            </p>
          )}
        </div>
      </div>
    </>
  );
}