import { useState } from 'react';

function getIconeDimensoes(formato) {
  if (formato === 'redonda') return { width: 36, height: 36, borderRadius: '50%' };
  if (formato === 'quadrada') return { width: 32, height: 32, borderRadius: '8px' };
  return { width: 52, height: 28, borderRadius: '4px' };
}

function getStatusBadge(ocupados, capacidade) {
  if (capacidade === 0) return { cor: '#9E9E9E', bg: '#F5F5F5', label: '0/0' };
  const pct = ocupados / capacidade;
  if (pct === 0) return { cor: '#9E9E9E', bg: '#F5F5F5', label: `${ocupados}/${capacidade}` };
  if (pct < 1) return { cor: '#2E7D32', bg: '#E8F5E9', label: `${ocupados}/${capacidade}` };
  if (pct === 1) return { cor: '#F9A825', bg: '#FFF8E1', label: `${ocupados}/${capacidade}` };
  return { cor: '#C62828', bg: '#FFEBEE', label: `${ocupados}/${capacidade}` };
}

export default function MesasLista({ mesas, mesasTipos, convidadosPorMesa, onReconfigurar, readOnly }) {
  const [modalMesa, setModalMesa] = useState(null);

  const tipoPorId = {};
  mesasTipos.forEach(t => { tipoPorId[t.id] = t; });

  const ocupantesPorMesa = {};
  Object.entries(convidadosPorMesa || {}).forEach(([mesaId, lista]) => {
    ocupantesPorMesa[mesaId] = lista.length;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            Mesas do evento
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            {mesas.length} mesas configuradas
          </p>
        </div>
        {!readOnly && (
          <button onClick={onReconfigurar} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-off-white)', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
            Reconfigurar mesas
          </button>
        )}
      </div>

      <div style={{ background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {mesas.map((mesa, idx) => {
          const tipo = tipoPorId[mesa.tipo_id];
          const dim = getIconeDimensoes(tipo?.formato);
          const ocupados = ocupantesPorMesa[mesa.id] || 0;
          const capacidade = tipo?.capacidade || 0;
          const badge = getStatusBadge(ocupados, capacidade);

          return (
            <div
              key={mesa.id}
              onClick={() => setModalMesa({ ...mesa, tipo, ocupados, capacidade })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: idx < mesas.length - 1 ? '1px solid var(--color-border)' : 'none',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-off-white)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-white)'; }}
            >
              <div style={{
                width: `${dim.width}px`,
                height: `${dim.height}px`,
                borderRadius: dim.borderRadius,
                border: '2px solid var(--color-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-brand)',
                flexShrink: 0,
                background: 'var(--color-white)',
              }}>
                {mesa.numero}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mesa.rotulo || `Mesa ${mesa.numero}`}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                  {tipo?.nome} · {tipo?.formato}
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                padding: '4px 10px',
                borderRadius: '12px',
                background: badge.bg,
                color: badge.cor,
                flexShrink: 0,
              }}>
                {badge.label}
              </div>
            </div>
          );
        })}
      </div>

      {modalMesa && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }} onClick={() => setModalMesa(null)}>
          <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-text-primary)', margin: 0 }}>Mesa {modalMesa.numero}</h3>
              <button onClick={() => setModalMesa(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-secondary)', fontSize: '18px', fontWeight: 700 }}>x</button>
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
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.capacidade} lugares</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Ocupacao</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.ocupados} / {modalMesa.capacidade}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Rotulo</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.rotulo || 'Nao definido'}</span>
              </div>
            </div>
            <button onClick={() => setModalMesa(null)} style={{ marginTop: '20px', width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--color-brand)', color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}