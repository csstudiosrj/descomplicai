import React, { useState, useCallback } from 'react';
import Icon from '../ui/Icon';
import LeadCard from './LeadCard';

export default function FunilKanban({ leads, estagios, onEditar, onMover, onExcluir }) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverColuna, setDragOverColuna] = useState(null);

  const handleDragStart = useCallback((e, leadId) => {
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', leadId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverColuna(null);
  }, []);

  const handleDragOver = useCallback((e, estagioId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColuna(estagioId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColuna(null);
  }, []);

  const handleDrop = useCallback((e, estagioId) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && lead.estagio !== estagioId) {
        onMover(leadId, estagioId);
      }
    }
    setDragOverColuna(null);
    setDraggingId(null);
  }, [leads, onMover]);

  const leadsPorEstagio = (estagioId) => leads.filter((l) => l.estagio === estagioId);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))',
        gap: 'var(--space-4)',
        overflowX: 'auto',
        paddingBottom: 'var(--space-4)',
        minHeight: '60vh',
      }}
      role="region"
      aria-label="Funil de leads Kanban"
    >
      {estagios.map((estagio) => {
        const colLeads = leadsPorEstagio(estagio.id);
        const isDropTarget = dragOverColuna === estagio.id;

        return (
          <div
            key={estagio.id}
            role="list"
            aria-label={`Coluna ${estagio.label}`}
            onDragOver={(e) => handleDragOver(e, estagio.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, estagio.id)}
            style={{
              backgroundColor: isDropTarget ? 'var(--color-brand-lighter)' : 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${isDropTarget ? estagio.color : 'transparent'}`,
              padding: 'var(--space-4)',
              minWidth: '260px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
            }}
          >
            {/* Cabeçalho da coluna */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 'var(--space-3)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: estagio.color,
                  }}
                />
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {estagio.label}
                </h3>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-off-white)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-full)',
                }}
                aria-label={`${colLeads.length} leads nesta coluna`}
              >
                {colLeads.length}
              </span>
            </div>

            {/* Lista de leads */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1 }}>
              {colLeads.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-8) var(--space-4)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Icon name="columns" size={24} style={{ marginBottom: 'var(--space-2)', opacity: 0.4 }} />
                  <p>Arraste leads aqui</p>
                </div>
              ) : (
                colLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    estagios={estagios}
                    isDragging={draggingId === lead.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEditar={onEditar}
                    onMover={onMover}
                    onExcluir={onExcluir}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
