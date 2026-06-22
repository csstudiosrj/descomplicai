import { useState, useEffect } from 'react';

function getIconeDimensoes(formato) {
  if (formato === 'redonda') return { width: 36, height: 36, borderRadius: '50%' };
  if (formato === 'quadrada') return { width: 36, height: 36, borderRadius: '8px' };
  return { width: 50, height: 30, borderRadius: '4px' };
}

export default function WizardPasso3({ tiposSelecionados, grupos, mesasGeradas, onChange, onSalvar, onVoltar }) {
  const [rotulos, setRotulos] = useState({});
  const [modalMesa, setModalMesa] = useState(null);

  useEffect(() => {
    if (mesasGeradas.length > 0) {
      const map = {};
      mesasGeradas.forEach(m => { map[m.numero] = m.rotulo; });
      setRotulos(map);
      return;
    }

    let numero = 1;
    const geradas = [];

    tiposSelecionados.forEach(tipo => {
      for (let i = 0; i < tipo.quantidade; i++) {
        geradas.push({
          numero: numero++,
          nomeTipo: tipo.nome,
          formato: tipo.formato,
          capacidade: tipo.capacidade,
          rotulo: '',
        });
      }
    });

    const nomesGrupos = grupos.map(g => g.nome);
    geradas.forEach((mesa, idx) => {
      if (nomesGrupos[idx]) {
        mesa.rotulo = nomesGrupos[idx];
      }
    });

    onChange(geradas);
    const map = {};
    geradas.forEach(m => { map[m.numero] = m.rotulo; });
    setRotulos(map);
  }, []);

  useEffect(() => {
    if (mesasGeradas.length > 0) {
      const map = {};
      mesasGeradas.forEach(m => { map[m.numero] = m.rotulo; });
      setRotulos(map);
    }
  }, [mesasGeradas]);

  const atualizarRotulo = (numero, valor) => {
    setRotulos(prev => ({ ...prev, [numero]: valor }));
    const atualizadas = mesasGeradas.map(m =>
      m.numero === numero ? { ...m, rotulo: valor } : m
    );
    onChange(atualizadas);
  };

  const totalCapacidade = mesasGeradas.reduce((acc, m) => acc + m.capacidade, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
        }}>
          O sistema organizou suas mesas
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
        }}>
          {mesasGeradas.length} mesas · {totalCapacidade} lugares totais
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '50vh',
        overflow: 'auto',
        padding: '4px',
      }}>
        {mesasGeradas.map((mesa) => {
          const dim = getIconeDimensoes(mesa.formato);
          return (
            <div
              key={mesa.numero}
              onClick={() => setModalMesa(mesa)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--color-white)',
                borderRadius: '10px',
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
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
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-body)',
                }}>
                  {mesa.nomeTipo}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}>
                  {mesa.capacidade} lugares · {mesa.formato}
                </div>
              </div>

              <input
                type="text"
                placeholder="Rotulo (ex: Familia Noivo)"
                value={rotulos[mesa.numero] || ''}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => atualizarRotulo(mesa.numero, e.target.value)}
                style={{
                  flex: '0 0 180px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  background: 'var(--color-off-white)',
                }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={onVoltar}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-off-white)',
            color: 'var(--color-text-primary)',
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          Voltar
        </button>
        <button
          onClick={onSalvar}
          style={{
            padding: '12px 32px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--color-brand)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          Salvar configuracao
        </button>
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
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.nomeTipo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Formato</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.formato}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Capacidade</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{modalMesa.capacidade} lugares</span>
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