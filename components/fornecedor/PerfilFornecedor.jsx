// Perfil público do fornecedor — versão componente reutilizável
// Dependências diretas: React, PropTypes, Card, Badge

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function PerfilFornecedor({ fornecedor }) {
  return (
    <div>
      <Card variant="elevated" padding="lg" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-2)' }}>{fornecedor.nome}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <Badge variant="primary">{fornecedor.categoria}</Badge>
              <Badge variant="default">{fornecedor.cidade}</Badge>
              {fornecedor.verificado && <Badge variant="success">Verificado</Badge>}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{fornecedor.descricao}</p>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {fornecedor.capacidade && (
          <Card variant="flat" padding="md">
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Capacidade</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>{fornecedor.capacidade}</div>
          </Card>
        )}
        {fornecedor.investimento && (
          <Card variant="flat" padding="md">
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Investimento médio</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>R$ {fornecedor.investimento.toLocaleString('pt-BR')}</div>
          </Card>
        )}
        {fornecedor.avaliacao && (
          <Card variant="flat" padding="md">
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Avaliação</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>{fornecedor.avaliacao} / 5</div>
          </Card>
        )}
        {fornecedor.casamentosRealizados && (
          <Card variant="flat" padding="md">
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Casamentos</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>{fornecedor.casamentosRealizados}</div>
          </Card>
        )}
      </div>
    </div>
  );
}

PerfilFornecedor.propTypes = {
  fornecedor: PropTypes.shape({
    nome: PropTypes.string.isRequired,
    categoria: PropTypes.string,
    cidade: PropTypes.string,
    verificado: PropTypes.bool,
    descricao: PropTypes.string,
    capacidade: PropTypes.number,
    investimento: PropTypes.number,
    avaliacao: PropTypes.number,
    casamentosRealizados: PropTypes.number,
  }).isRequired,
};

export { PerfilFornecedor };