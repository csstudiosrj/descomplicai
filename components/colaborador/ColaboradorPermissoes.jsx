// Gerenciamento de permissões do colaborador — o que pode ver/editar
// Dependências diretas: React, PropTypes, Card

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';

const PERMISSOES = [
  { key: 'cronograma', label: 'Cronograma do dia', desc: 'Visualizar e editar timeline' },
  { key: 'fornecedores', label: 'Contatos de emergência', desc: 'Ver telefones de todos os fornecedores' },
  { key: 'checklist', label: 'Checklist ao vivo', desc: 'Marcar tarefas concluídas' },
  { key: 'convidados', label: 'Lista de convidados', desc: 'Ver confirmações e mesas' },
  { key: 'financeiro', label: 'Financeiro', desc: 'Ver pagamentos pendentes do dia' },
];

export default function ColaboradorPermissoes({ permissoesAtivas, onToggle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {PERMISSOES.map((p) => {
        const ativa = permissoesAtivas.includes(p.key);
        return (
          <Card key={p.key} variant={ativa ? 'elevated' : 'outlined'} padding="md" interactive onClick={() => onToggle(p.key)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: 'var(--radius-sm)', border: `2px solid ${ativa ? 'var(--color-brand)' : 'var(--color-border-strong)'}`, background: ativa ? 'var(--color-brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {ativa && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{p.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{p.desc}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

ColaboradorPermissoes.propTypes = {
  permissoesAtivas: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export { ColaboradorPermissoes };