import { useState, useEffect } from 'react';

export default function MesasLista({ mesas, mesasTipos, onReconfigurar, readOnly }) {
  const [ocupacao, setOcupacao] = useState({});

  useEffect(() => {
    // Busca ocupacao de cada mesa (convidados atribuidos)
    // Isso sera implementado no LOTE 3 quando houver atribuicao de convidados
    // Por enquanto, mostra apenas a estrutura
  }, [mesas]);

  const tipoPorId = {};
  mesasTipos.forEach(t => { tipoPorId[t.id] = t; });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}>
            Mesas do evento
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
          }}>
            {mesas.length} mesas configuradas
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={onReconfigurar}
            style={{
              padding: '10px 18px',
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
            Reconfigurar mesas
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px',
      }}>
        {mesas.map((mesa) => {
          const tipo = tipoPorId[mesa.tipo_id];
          return (
            <div
              key={mesa.id}
              style={{
                background: 'var(--color-white)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: tipo?.formato === 'redonda' ? '50%' : tipo?.formato === 'quadrada' ? '8px' : '4px',
                  border: '2px solid var(--color-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-brand)',
                }}>
                  {mesa.numero}
                </div>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-body)',
                  textTransform: 'uppercase',
                }}>
                  {tipo?.formato}
                </span>
              </div>

              <div style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
              }}>
                {mesa.rotulo || `Mesa ${mesa.numero}`}
              </div>

              <div style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
              }}>
                {tipo?.nome} · {tipo?.capacidade} lugares
              </div>

              <div style={{
                marginTop: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'var(--color-off-white)',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
              }}>
                0 / {tipo?.capacidade} ocupados
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}