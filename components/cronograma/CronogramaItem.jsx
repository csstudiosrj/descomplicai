// Item do cronograma — horário, atividade, responsável e duração
// Dependências direitas: React, PropTypes, Card, Badge

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function CronogramaItem({ evento, ativo = false, onClick }) {
  const { hora, titulo, local, responsavel, duracao, tipo } = evento;

  const TIPO_VARIANT = {
    cerimonia: 'primary',
    recepcao: 'success',
    alimentacao: 'warning',
    entretenimento: 'info',
    transporte: 'default',
  };

  return (
    <Card variant={ativo ? 'elevated' : 'default'} padding="md" interactive={!!onClick} onClick={onClick} selected={ativo}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center', minWidth: '60px', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-brand)' }}>{hora}</div>
          {duracao && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{duracao}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{titulo}</span>
            {tipo && <Badge variant={TIPO_VARIANT[tipo] || 'default'} size="sm">{tipo}</Badge>}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {local && <span>{local}</span>}
            {responsavel && <span>{local ? ' · ' : ''}Resp: {responsavel}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}

CronogramaItem.propTypes = {
  evento: PropTypes.shape({
    hora: PropTypes.string.isRequired,
    titulo: PropTypes.string.isRequired,
    local: PropTypes.string,
    responsavel: PropTypes.string,
    duracao: PropTypes.string,
    tipo: PropTypes.string,
  }).isRequired,
  ativo: PropTypes.bool,
  onClick: PropTypes.func,
};

export { CronogramaItem };