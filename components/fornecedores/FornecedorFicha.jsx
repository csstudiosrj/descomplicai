// Ficha detalhada do fornecedor — dados completos e contatos
// Dependências diretas: React, PropTypes, Card, Badge

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function FornecedorFicha({ fornecedor }) {
  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-2)' }}>{fornecedor.nome}</h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Badge variant="primary">{fornecedor.categoria}</Badge>
            <Badge variant={fornecedor.status === 'contratado' ? 'success' : 'warning'}>{fornecedor.status}</Badge>
            {fornecedor.avaliacao && <Badge variant="default">★ {fornecedor.avaliacao}</Badge>}
          </div>
        </div>
        {fornecedor.logo && <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>LOGO</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {fornecedor.telefone && <Info label="Telefone" valor={fornecedor.telefone} />}
        {fornecedor.email && <Info label="E-mail" valor={fornecedor.email} />}
        {fornecedor.site && <Info label="Site" valor={fornecedor.site} />}
        {fornecedor.instagram && <Info label="Instagram" valor={`@${fornecedor.instagram}`} />}
        {fornecedor.cidade && <Info label="Cidade" valor={fornecedor.cidade} />}
        {fornecedor.valor && <Info label="Investimento" valor={`R$ ${fornecedor.valor.toLocaleString('pt-BR')}`} />}
      </div>

      {fornecedor.observacoes && (
        <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Observações</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{fornecedor.observacoes}</p>
        </div>
      )}
    </Card>
  );
}

function Info({ label, valor }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>{valor}</div>
    </div>
  );
}

FornecedorFicha.propTypes = {
  fornecedor: PropTypes.shape({
    nome: PropTypes.string.isRequired,
    categoria: PropTypes.string,
    status: PropTypes.string,
    avaliacao: PropTypes.number,
    telefone: PropTypes.string,
    email: PropTypes.string,
    site: PropTypes.string,
    instagram: PropTypes.string,
    cidade: PropTypes.string,
    valor: PropTypes.number,
    observacoes: PropTypes.string,
    logo: PropTypes.string,
  }).isRequired,
};

export { FornecedorFicha };