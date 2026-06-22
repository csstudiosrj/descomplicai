import { useState } from 'react';

function getIconeDimensoes(formato) {
  if (formato === 'redonda') return { width: 40, height: 40, borderRadius: '50%' };
  if (formato === 'quadrada') return { width: 40, height: 40, borderRadius: '8px' };
  return { width: 56, height: 32, borderRadius: '4px' };
}

export default function GradeMesas({ mesas, mesasTipos, convidadosPorMesa, convidadosSemMesa, onAtribuir, onRemover, readOnly }) {
  const [mesaExpandida, setMesaExpandida] = useState(null);
  const [modalConvidado, setModalConvidado] = useState(null);
  const [slotSelecionado, setSlotSelecionado] = useState(null);

  const tipoPorId = {};
  mesasTipos.forEach(t => { tipoPorId[t.id] = t; });

  const toggleMesa = (mesaId) => {
    setMesaExpandida(prev => prev === mesaId ? null : mesaId);
  };

  const handleAtribuir = (convidadoId, mesaId) => {
    if (readOnly) return;
    onAtribuir(convidadoId, mesaId);
    setSlotSelecionado(null);
  };

  const handleRemover = (convidadoId) => {
    if (readOnly) return;
    onRemover(convidadoId);
    setModalConvidado(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Convidados sem mesa */}
      {convidadosSemMesa.length > 0 && (
        <div style={{
          background: 'var(--color-white)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid var(--color-border)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            color: 'var(--color-text-primary)',
            marginBottom: '12px',
          }}>
            Convidados sem mesa ({convidadosSemMesa.length})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {convidadosSemMesa.map(c => (
              <div
                key={c.id}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: '#FFF8E1',
                  border: '1px solid #F9A825',
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 500,
                }}
              >
                {c.nome}
                {c.acompanhantes > 0 && <span style={{ color: 'var(--color-brand)', marginLeft: '4px' }}>+{c.acompanhantes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grade de mesas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
      }}>
        {mesas.map((mesa) => {
          const tipo = tipoPorId[mesa.tipo_id];
          const ocupantes = convidadosPorMesa[mesa.id] || [];
          const capacidade = tipo?.capacidade || 8;
          const expandida = mesaExpandida === mesa.id;
          const dim = getIconeDimensoes(tipo?.formato);

          return (
            <div
              key={mesa.id}
              style={{
                background: 'var(--color-white)',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
              }}
            >
              {/* Header da mesa */}
              <div
                onClick={() => toggleMesa(mesa.id)}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  background: expandida ? 'var(--color-off-white)' : 'var(--color-white)',
                  transition: 'background 150ms ease',
                }}
              >
                <div style={{
                  width: `${dim.width}px`,
                  height: `${dim.height}px`,
                  borderRadius: dim.borderRadius,
                  border: '2px solid var(--color-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-brand)',
                  flexShrink: 0,
                }}>
                  {mesa.numero}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {mesa.rotulo || `Mesa ${mesa.numero}`}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {tipo?.nome} · {ocupantes.length}/{capacidade} ocupados
                  </div>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-body)',
                  transform: expandida ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease',
                }}>
                  v
                </span>
              </div>

              {/* Slots expandidos */}
              {expandida && (
                <div style={{
                  padding: '12px 16px 16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '8px',
                  borderTop: '1px solid var(--color-border)',
                }}>
                  {Array.from({ length: capacidade }).map((_, idx) => {
                    const conv = ocupantes[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (conv) {
                            setModalConvidado(conv);
                          } else if (!readOnly && convidadosSemMesa.length > 0) {
                            setSlotSelecionado({ mesaId: mesa.id, slotIdx: idx });
                          }
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)',
                          background: conv ? '#E8F5E9' : 'var(--color-off-white)',
                          cursor: conv || (!readOnly && convidadosSemMesa.length > 0) ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          minHeight: '36px',
                        }}
                      >
                        <span style={{
                          fontSize: '10px',
                          color: 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 700,
                          minWidth: '16px',
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: conv ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-body)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1,
                        }}>
                          {conv ? conv.nome : 'Vazio'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: atribuir convidado ao slot */}
      {slotSelecionado && !readOnly && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px',
        }} onClick={() => setSlotSelecionado(null)}>
          <div style={{
            background: 'var(--color-white)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              color: 'var(--color-text-primary)',
              margin: '0 0 16px',
            }}>
              Atribuir convidado a mesa {mesas.find(m => m.id === slotSelecionado.mesaId)?.numero}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflow: 'auto' }}>
              {convidadosSemMesa.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleAtribuir(c.id, slotSelecionado.mesaId)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-off-white)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{c.nome}</span>
                  {c.acompanhantes > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--color-brand)' }}>+{c.acompanhantes} acomp.</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSlotSelecionado(null)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-off-white)',
                color: 'var(--color-text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal: ver convidado ocupando slot */}
      {modalConvidado && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px',
        }} onClick={() => setModalConvidado(null)}>
          <div style={{
            background: 'var(--color-white)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '360px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              color: 'var(--color-text-primary)',
              margin: '0 0 12px',
            }}>
              {modalConvidado.nome}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Grupo</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalConvidado.grupo || 'Geral'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Status</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalConvidado.confirmado}</span>
              </div>
              {modalConvidado.telefone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Telefone</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalConvidado.telefone}</span>
                </div>
              )}
              {modalConvidado.acompanhantes > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Acompanhantes</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalConvidado.acompanhantes}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!readOnly && (
                <button
                  onClick={() => handleRemover(modalConvidado.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #C62828',
                    background: '#FFEBEE',
                    color: '#C62828',
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                  }}
                >
                  Remover da mesa
                </button>
              )}
              <button
                onClick={() => setModalConvidado(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-off-white)',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}