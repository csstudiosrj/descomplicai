// Checklist de tarefas — acompanhamento de pendências do casamento
// Dependências diretas: React, next/head

import React, { useState } from 'react';
import Head from 'next/head';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const TAREFAS_INICIAIS = [
  { id: 1, texto: 'Definir data do casamento', feita: true, categoria: 'Planejamento' },
  { id: 2, texto: 'Escolher cidade/local', feita: true, categoria: 'Planejamento' },
  { id: 3, texto: 'Reservar espaço/cerimonial', feita: false, categoria: 'Fornecedores' },
  { id: 4, texto: 'Contratar fotógrafo', feita: false, categoria: 'Fornecedores' },
  { id: 5, texto: 'Enviar save the date', feita: false, categoria: 'Papelaria' },
];

export default function ChecklistPage() {
  const [tarefas, setTarefas] = useState(TAREFAS_INICIAIS);
  const [nova, setNova] = useState('');

  const toggle = (id) => {
    setTarefas(tarefas.map((t) => t.id === id ? { ...t, feita: !t.feita } : t));
  };

  const adicionar = (e) => {
    e.preventDefault();
    if (!nova.trim()) return;
    setTarefas([...tarefas, { id: Date.now(), texto: nova.trim(), feita: false, categoria: 'Personalizado' }]);
    setNova('');
  };

  const pendentes = tarefas.filter((t) => !t.feita).length;
  const concluidas = tarefas.filter((t) => t.feita).length;

  return (
    <>
      <Head><title>Checklist — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-6) var(--space-4)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Checklist</h1>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Badge variant="warning">{pendentes} pendentes</Badge>
              <Badge variant="success">{concluidas} feitas</Badge>
            </div>
          </div>

          <form onSubmit={adicionar} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <input
              value={nova}
              onChange={(e) => setNova(e.target.value)}
              placeholder="Nova tarefa..."
              style={{ flex: 1, padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', outline: 'none' }}
            />
            <Button type="submit" variant="primary">Adicionar</Button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {tarefas.map((t) => (
              <Card key={t.id} variant={t.feita ? 'flat' : 'default'} padding="md" interactive onClick={() => toggle(t.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', border: `2px solid ${t.feita ? 'var(--color-success)' : 'var(--color-border-strong)'}`, backgroundColor: t.feita ? 'var(--color-success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {t.feita && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', textDecoration: t.feita ? 'line-through' : 'none', color: t.feita ? 'var(--color-text-muted)' : 'var(--color-text-primary)', flex: 1 }}>
                    {t.texto}
                  </span>
                  <Badge size="sm" variant="default">{t.categoria}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}