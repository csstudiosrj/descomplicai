// Card de fornecedor — resumo visual para listagens
// Dependências diretas: React, PropTypes, Card, Badge

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const STATUS_MAP = {
  contratado: 'success',
  negociacao: 'warning',
  orcamento: 'info',
  cancelado: 'danger',
};

export default function FornecedorCard({ fornecedor, onClick }) {
  return (
    <Card variant="default" padding="md" interactive={!!onClick} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{fornecedor.nome}</span>
        <Badge variant={STATUS_MAP[fornecedor.status] || 'default'} size="sm" pill>{fornecedor.status}</Badge>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>{fornecedor.categoria}</div>
      {fornecedor.valor && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          R$ {fornecedor.valor.toLocaleString('pt-BR')}
        </div>
      )}
    </Card>
  );
}

FornecedorCard.propTypes = {
  fornecedor: PropTypes.shape({
    nome: PropTypes.string.isRequired,
    categoria: PropTypes.string,
    status: PropTypes.string,
    valor: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func,
};

export { FornecedorCard };