import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

function calcularIndicador(prazo, concluida) {
  if (concluida) return { cor: 'var(--color-success)', label: 'Concluída' };
  if (!prazo) return { cor: 'var(--color-border-strong)', label: 'Sem prazo' };
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataPrazo = new Date(prazo + 'T00:00:00');
  const diff = Math.ceil((dataPrazo - hoje) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { cor: 'var(--color-danger)', label: 'Atrasada' };
  if (diff <= 7) return { cor: 'var(--color-warning)', label: 'Urgente' };
  return { cor: 'var(--color-info)', label: 'Futura' };
}

function formatarPrazo(prazo) {
  if (!prazo) return null;
  const data = new Date(prazo + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TarefaItem({ tarefa, onToggle, onClick }) {
  const { id, titulo, concluida, categoria, prazo, descricao } = tarefa;
  const indicador = calcularIndicador(prazo, concluida);
  const prazoFormatado = formatarPrazo(prazo);

  return (
    <Card variant={concluida ? 'flat' : 'default'} padding="md" interactive onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Indicador lateral */}
        <div style={{
          width: 3,
          height: 40,
          borderRadius: 2,
          background: indicador.cor,
          flexShrink: 0,
        }} />

        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle?.(id); }}
          aria-checked={concluida}
          role="checkbox"
          aria-label={concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
          style={{
            width: 24,
            height: 24,
            borderRadius: 'var(--radius-sm)',
            border: `2px solid ${concluida ? 'var(--color-success)' : 'var(--color-border-strong)'}`,
            background: concluida ? 'var(--color-success)' : 'var(--color-white)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: `all var(--transition-fast)`,
          }}
        >
          {concluida && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </button>

        {/* Conteúdo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontWeight: concluida ? 'var(--font-normal)' : 'var(--font-medium)',
            color: concluida ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            textDecoration: concluida ? 'line-through' : 'none',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-snug)',
            marginBottom: 'var(--space-1)',
          }}>
            {titulo}
          </div>
          
          {descricao && !concluida && (
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-normal)',
              marginBottom: 'var(--space-1)',
            }}>
              {descricao}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {categoria && (
              <Badge variant="default" size="sm">{categoria}</Badge>
            )}
            {prazoFormatado && (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: indicador.cor,
                fontWeight: 'var(--font-medium)',
              }}>
                {prazoFormatado}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

TarefaItem.propTypes = {
  tarefa: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    titulo: PropTypes.string.isRequired,
    concluida: PropTypes.bool,
    categoria: PropTypes.string,
    prazo: PropTypes.string,
    descricao: PropTypes.string,
  }).isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func,
};

export { TarefaItem };