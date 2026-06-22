import { useState, useMemo } from 'react';

function expandirSlots(convidados, capacidade) {
  const slots = [];
  (convidados || []).forEach(c => {
    slots.push({ tipo: 'titular', nome: c.nome, convidado: c });
    for (let i = 0; i < (c.acompanhantes || 0); i++) {
      slots.push({ tipo: 'acompanhante', nome: `+${i+1} de ${c.nome}`, convidado: c });
    }
  });
  while (slots.length < capacidade) {
    slots.push({ tipo: 'vazio' });
  }
  return slots.slice(0, capacidade);
}

function calcularOcupacao(convidados) {
  return (convidados || []).reduce((acc, c) => acc + 1 + (c.acompanhantes || 0), 0);
}

function getStatusBadge(ocupados, capacidade) {
  if (capacidade === 0) return { cor: '#9E9E9E', bg: '#F5F5F5', label: '0/0' };
  const pct = ocupados / capacidade;
  if (pct === 0) return { cor: '#9E9E9E', bg: '#F5F5F5', label: `${ocupados}/${capacidade}` };
  if (pct < 1) return { cor: '#2E7D32', bg: '#E8F5E9', label: `${ocupados}/${capacidade}` };
  if (pct === 1) return { cor: '#F9A825', bg: '#FFF8E1', label: `${ocupados}/${capacidade}` };
  return { cor: '#C62828', bg: '#FFEBEE', label: `${ocupados}/${capacidade}` };
}

export default function MesasLista({ mesas, mesasTipos, convidadosPorMesa, convidadosSemMesa, onAtribuir, onRemover, onReconfigurar, readOnly }) {
  const [mesaExpandida, setMesaExpandida] = useState(null);
  const [modalAtribuir, setModalAtribuir] = useState(null);
  const [modalConvidado, setModalConvidado] = useState(null);

  const tipoPorId = {};
  mesasTipos.forEach(t => { tipoPorId[t.id] = t; });

  const toggleMesa = (mesaId) => {
    setMesaExpandida(prev => prev === mesaId ? null : mesaId);
  };

  const handleAtribuir = (convidadoId, mesaId) => {
    if (readOnly) return;
    onAtribuir(convidadoId, mesaId);
    setModalAtribuir(null);
  };

  const handleRemover = (convidadoId) => {
    if (readOnly) return;
    onRemover(convidadoId);
    setModalConvidado(null);
  };

  const abrirAtribuir = (mesa) => {
    if (readOnly) return;
    const convs = convidadosPorMesa[mesa.id] || [];
    const ocupados = calcularOcupacao(convs);
    const tipo = tipoPorId[mesa.tipo_id];
    const capacidade = tipo?.capacidade || 0;
    setModalAtribuir({ mesa, ocupados, capacidade });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: 20, color: '#1A1714', marginBottom: 4,
          }}>
            Mesas do evento
          </h2>
          <p style={{ fontSize: 14, color: '#A89B91', fontFamily: 'var(--font-body)' }}>
            Clique em uma mesa para expandir e gerenciar convidados
          </p>
        </div>
        {!readOnly && (
          <button onClick={onReconfigurar} style={{
            padding: '10px 18px', borderRadius: 8,
            border: '1px solid #D4C8C0', background: 'white',
            color: '#1A1714', fontSize: 14, fontWeight: 600,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
          }}>
            Reconfigurar mesas
          </button>
        )}
      </div>

      {mesas.map((mesa) => {
        const tipo = tipoPorId[mesa.tipo_id];
        const convs = convidadosPorMesa[mesa.id] || [];
        const capacidade = tipo?.capacidade || 0;
        const ocupados = calcularOcupacao(convs);
        const expandida = mesaExpandida === mesa.id;
        const badge = getStatusBadge(ocupados, capacidade);
        const slots = expandirSlots(convs, capacidade);

        return (
          <div key={mesa.id} style={{
            background: 'white', borderRadius: 12,
            border: '1px solid #F0EDE9', overflow: 'hidden',
          }}>
            {/* Header da mesa */}
            <div
              onClick={() => toggleMesa(mesa.id)}
              style={{
                padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer',
                background: expandida ? '#FAF8F7' : 'white',
                transition: 'background 150ms ease',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '2px solid #8B6F5E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#8B6F5E',
                flexShrink: 0, background: 'white',
              }}>
                {mesa.numero}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: '#1A1714',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {mesa.rotulo || `Mesa ${mesa.numero}`}
                </div>
                <div style={{ fontSize: 12, color: '#A89B91', fontFamily: 'var(--font-body)' }}>
                  {tipo?.nome} · {capacidade} lugares
                </div>
              </div>

              {/* Barra de ocupação */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{ width: 100, height: 6, background: '#F0EDE9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${capacidade > 0 ? (ocupados / capacidade) * 100 : 0}%`,
                    background: ocupados === 0 ? '#F0EDE9' : ocupados < capacidade ? '#10B981' : '#F9A825',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
                  padding: '4px 10px', borderRadius: 12,
                  background: badge.bg, color: badge.cor, flexShrink: 0,
                }}>
                  {badge.label}
                </span>
              </div>

              <span style={{
                fontSize: 12, color: '#A89B91',
                transform: expandida ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}>
                ▼
              </span>
            </div>

            {/* Slots expandidos */}
            {expandida && (
              <div style={{
                padding: '16px 20px 20px',
                borderTop: '1px solid #F0EDE9',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 8,
                }}>
                  {slots.map((slot, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (slot.tipo === 'titular') {
                          setModalConvidado(slot.convidado);
                        } else if (slot.tipo === 'vazio' && !readOnly) {
                          abrirAtribuir(mesa);
                        }
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: slot.tipo === 'vazio' ? '1px dashed #D4C8C0' : `1px solid ${slot.tipo === 'titular' ? '#10B981' : '#F9A825'}`,
                        background: slot.tipo === 'vazio' ? '#F9F7F4' : slot.tipo === 'titular' ? '#E8F5E9' : '#FFF8E1',
                        cursor: slot.tipo !== 'acompanhante' ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', gap: 8,
                        minHeight: 40,
                      }}
                    >
                      <span style={{
                        fontSize: 10, color: '#A89B91',
                        fontFamily: 'var(--font-body)', fontWeight: 700,
                        minWidth: 18,
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{
                        fontSize: 13,
                        color: slot.tipo === 'vazio' ? '#A89B91' : '#1A1714',
                        fontFamily: 'var(--font-body)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        flex: 1,
                      }}>
                        {slot.tipo === 'vazio' ? 'Vazio' : slot.nome}
                      </span>
                      {slot.tipo === 'titular' && slot.convidado.acompanhantes > 0 && (
                        <span style={{ fontSize: 10, color: '#F9A825', fontWeight: 600 }}>
                          +{slot.convidado.acompanhantes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {!readOnly && convidadosSemMesa.length > 0 && (
                  <button
                    onClick={() => abrirAtribuir(mesa)}
                    style={{
                      marginTop: 12, width: '100%',
                      padding: '10px', borderRadius: 8,
                      border: '1px dashed #8B6F5E', background: '#FAF8F7',
                      color: '#8B6F5E', fontSize: 13, fontWeight: 600,
                      fontFamily: 'var(--font-body)', cursor: 'pointer',
                    }}
                  >
                    + Adicionar convidado
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Modal: atribuir convidado */}
      {modalAtribuir && !readOnly && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(26,23,20,0.5)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 300, padding: 16,
        }} onClick={() => setModalAtribuir(null)}>
          <div style={{
            background: 'white', borderRadius: 16,
            padding: 24, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflow: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontSize: 20, color: '#1A1714', margin: 0,
              }}>
                Atribuir à Mesa {modalAtribuir.mesa.numero}
              </h3>
              <button onClick={() => setModalAtribuir(null)} style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid #D4C8C0', background: 'white',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#A89B91', fontSize: 16,
              }}>
                ✕
              </button>
            </div>

            {convidadosSemMesa.length === 0 ? (
              <p style={{ fontSize: 14, color: '#A89B91', fontFamily: 'var(--font-body)' }}>
                Nenhum convidado sem mesa disponível.
              </p>
            ) : (
              <>
                {/* Preview inteligente */}
                {convidadosSemMesa.some(c => {
                  const lugaresNecessarios = 1 + (c.acompanhantes || 0);
                  const restantes = modalAtribuir.capacidade - modalAtribuir.ocupados;
                  return lugaresNecessarios <= restantes;
                }) && (
                  <div style={{
                    background: '#E8F5E9', border: '1px solid #10B981',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                  }}>
                    <p style={{ fontSize: 12, color: '#065F46', margin: 0, fontFamily: 'var(--font-body)' }}>
                      Selecione um convidado. Acompanhantes ocuparão slots automaticamente.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflow: 'auto' }}>
                  {convidadosSemMesa.map(c => {
                    const lugaresNecessarios = 1 + (c.acompanhantes || 0);
                    const restantes = modalAtribuir.capacidade - modalAtribuir.ocupados;
                    const cabe = lugaresNecessarios <= restantes;

                    return (
                      <button
                        key={c.id}
                        disabled={!cabe}
                        onClick={() => cabe && handleAtribuir(c.id, modalAtribuir.mesa.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          border: '1px solid #F0EDE9',
                          background: cabe ? 'white' : '#F9F7F4',
                          textAlign: 'left',
                          cursor: cabe ? 'pointer' : 'not-allowed',
                          fontSize: 14,
                          fontFamily: 'var(--font-body)',
                          color: cabe ? '#1A1714' : '#D4C8C0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: cabe ? 1 : 0.6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: '#F0EDE9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, color: '#A89B91', fontWeight: 600,
                            flexShrink: 0,
                          }}>
                            {c.nome[0].toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontWeight: 500 }}>{c.nome}</span>
                            <span style={{ fontSize: 11, color: '#A89B91' }}>{c.grupo || 'Geral'}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          {c.acompanhantes > 0 && (
                            <span style={{ fontSize: 11, color: '#F9A825', fontWeight: 500 }}>
                              +{c.acompanhantes} acomp.
                            </span>
                          )}
                          {!cabe && (
                            <span style={{ fontSize: 11, color: '#C62828', fontWeight: 500 }}>
                              Não cabe
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            <button
              onClick={() => setModalAtribuir(null)}
              style={{
                marginTop: 16, width: '100%',
                padding: '10px', borderRadius: 8,
                border: '1px solid #D4C8C0', background: '#F9F7F4',
                color: '#1A1714', fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal: ver convidado */}
      {modalConvidado && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(26,23,20,0.5)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 300, padding: 16,
        }} onClick={() => setModalConvidado(null)}>
          <div style={{
            background: 'white', borderRadius: 16,
            padding: 24, width: '100%', maxWidth: 360,
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontSize: 20, color: '#1A1714', margin: 0,
              }}>
                {modalConvidado.nome}
              </h3>
              <button onClick={() => setModalConvidado(null)} style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid #D4C8C0', background: 'white',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#A89B91', fontSize: 16,
              }}>
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#A89B91', fontFamily: 'var(--font-body)' }}>Grupo</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1714', fontFamily: 'var(--font-body)' }}>{modalConvidado.grupo || 'Geral'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#A89B91', fontFamily: 'var(--font-body)' }}>Status</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1714', fontFamily: 'var(--font-body)' }}>{modalConvidado.confirmado}</span>
              </div>
              {modalConvidado.telefone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#A89B91', fontFamily: 'var(--font-body)' }}>Telefone</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1714', fontFamily: 'var(--font-body)' }}>{modalConvidado.telefone}</span>
                </div>
              )}
              {modalConvidado.acompanhantes > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#A89B91', fontFamily: 'var(--font-body)' }}>Acompanhantes</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1714', fontFamily: 'var(--font-body)' }}>{modalConvidado.acompanhantes}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {!readOnly && (
                <button
                  onClick={() => handleRemover(modalConvidado.id)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    border: '1px solid #C62828', background: '#FFEBEE',
                    color: '#C62828', fontSize: 14, fontWeight: 600,
                    fontFamily: 'var(--font-body)', cursor: 'pointer',
                  }}
                >
                  Remover da mesa
                </button>
              )}
              <button
                onClick={() => setModalConvidado(null)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  border: '1px solid #D4C8C0', background: '#F9F7F4',
                  color: '#1A1714', fontSize: 14, fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
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