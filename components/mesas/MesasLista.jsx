import { useState } from 'react';

function getIconeDimensoes(formato) {
  if (formato === 'redonda') return { width: 40, height: 40, borderRadius: '50%' };
  if (formato === 'quadrada') return { width: 40, height: 40, borderRadius: '8px' };
  return { width: 56, height: 32, borderRadius: '4px' };
}

export default function MesasLista({ mesas, mesasTipos, onReconfigurar, readOnly }) {
  const [modalMesa, setModalMesa] = useState(null);

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
          const dim = getIconeDimensoes(tipo?.formato);
          return (
            <div
              key={mesa.id}
              onClick={() => setModalMesa({ ...mesa, tipo })}
              style={{
                background: 'var(--color-white)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                transition: 'box-shadow 150ms ease, border-color 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                e.currentTarget.style.borderColor = 'var(--color-brand)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{
                  width: `${dim.width}px`,
                  height: `${dim.height}px`,
                  borderRadius: dim.borderRadius,
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

      {/* Modal de detalhe da mesa */}
      {modalMesa && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px',
        }} onClick={() => setModalMesa(null)}>
          <div style={{
            background: 'var(--color-white)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}>
                Mesa {modalMesa.numero}
              </h3>
              <button
                onClick={() => setModalMesa(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--color-text-secondary)',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                x
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Tipo</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.tipo?.nome}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Formato</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.tipo?.formato}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Capacidade</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.tipo?.capacidade} lugares</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Rotulo</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.rotulo || 'Nao definido'}</span>
              </div>
            </div>
            <button
              onClick={() => setModalMesa(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--color-brand)',
                color: '#fff',
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
      )}
    </div>
  );
}