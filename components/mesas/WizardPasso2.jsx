import { useState, useEffect } from 'react';

const CATALOGO_MESAS = [
  { id: 'redonda_4', nome: 'Redonda 4 lugares', formato: 'redonda', capacidade: 4 },
  { id: 'redonda_6', nome: 'Redonda 6 lugares', formato: 'redonda', capacidade: 6 },
  { id: 'redonda_8', nome: 'Redonda 8 lugares', formato: 'redonda', capacidade: 8 },
  { id: 'redonda_10', nome: 'Redonda 10 lugares', formato: 'redonda', capacidade: 10 },
  { id: 'redonda_12', nome: 'Redonda 12 lugares', formato: 'redonda', capacidade: 12 },
  { id: 'quadrada_4', nome: 'Quadrada 4 lugares', formato: 'quadrada', capacidade: 4 },
  { id: 'quadrada_8', nome: 'Quadrada 8 lugares', formato: 'quadrada', capacidade: 8 },
  { id: 'retangular_10', nome: 'Retangular 10 lugares', formato: 'retangular', capacidade: 10 },
  { id: 'retangular_12', nome: 'Retangular 12 lugares', formato: 'retangular', capacidade: 12 },
];

function getIconeDimensoes(formato) {
  if (formato === 'redonda') return { width: 48, height: 48, borderRadius: '50%' };
  if (formato === 'quadrada') return { width: 48, height: 48, borderRadius: '8px' };
  // retangular: proporcao 1.6:1, nunca quadrado
  return { width: 64, height: 40, borderRadius: '6px' };
}

export default function WizardPasso2({ totalConvidados, tiposSelecionados, setTiposSelecionados, onAvancar, onVoltar }) {
  const [quantidades, setQuantidades] = useState({});

  useEffect(() => {
    const map = {};
    tiposSelecionados.forEach(t => { map[t.catalogoId] = t.quantidade; });
    setQuantidades(map);
  }, [tiposSelecionados]);

  const toggleTipo = (catalogoId) => {
    setQuantidades(prev => {
      const novo = { ...prev };
      if (novo[catalogoId]) {
        delete novo[catalogoId];
      } else {
        novo[catalogoId] = 1;
      }
      return novo;
    });
  };

  const setQtd = (catalogoId, qtd) => {
    const num = Math.max(0, parseInt(qtd) || 0);
    setQuantidades(prev => {
      const novo = { ...prev };
      if (num <= 0) {
        delete novo[catalogoId];
      } else {
        novo[catalogoId] = num;
      }
      return novo;
    });
  };

  const totalLugares = Object.entries(quantidades).reduce((acc, [id, qtd]) => {
    const tipo = CATALOGO_MESAS.find(t => t.id === id);
    return acc + (tipo ? tipo.capacidade * qtd : 0);
  }, 0);

  const totalMesas = Object.values(quantidades).reduce((a, b) => a + b, 0);
  const sobra = totalLugares - totalConvidados;
  const insuficiente = totalLugares > 0 && totalLugares < totalConvidados;
  const excesso = totalConvidados > 0 && totalLugares > totalConvidados * 1.3;

  const avancar = () => {
    const selecionados = Object.entries(quantidades)
      .filter(([, qtd]) => qtd > 0)
      .map(([id, qtd]) => {
        const tipo = CATALOGO_MESAS.find(t => t.id === id);
        return { catalogoId: id, nome: tipo.nome, formato: tipo.formato, capacidade: tipo.capacidade, quantidade: qtd };
      });
    setTiposSelecionados(selecionados);
    onAvancar();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
        }}>
          Quais tipos de mesas voce vai usar?
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
        }}>
          Selecione os modelos e informe a quantidade de cada um.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '10px',
      }}>
        {CATALOGO_MESAS.map((tipo) => {
          const selecionado = !!quantidades[tipo.id];
          const qtd = quantidades[tipo.id] || 0;
          const dim = getIconeDimensoes(tipo.formato);
          return (
            <div
              key={tipo.id}
              onClick={() => toggleTipo(tipo.id)}
              style={{
                background: selecionado ? 'var(--color-white)' : 'var(--color-off-white)',
                border: `2px solid ${selecionado ? 'var(--color-brand)' : 'var(--color-border)'}`,
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 150ms ease',
              }}
            >
              <div style={{
                width: `${dim.width}px`,
                height: `${dim.height}px`,
                borderRadius: dim.borderRadius,
                border: `2px solid ${selecionado ? 'var(--color-brand)' : '#C4B5A5'}`,
                background: selecionado ? 'var(--color-brand)' : 'transparent',
                alignSelf: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selecionado ? '#fff' : 'var(--color-text-secondary)',
                fontSize: '14px',
                fontWeight: 700,
              }}>
                {tipo.capacidade}
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                textAlign: 'center',
              }}>
                {tipo.nome}
              </span>

              {selecionado && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setQtd(tipo.id, qtd - 1); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-off-white)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                    minWidth: '24px',
                    textAlign: 'center',
                  }}>
                    {qtd}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setQtd(tipo.id, qtd + 1); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-off-white)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        background: 'var(--color-white)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            Convidados esperados
          </span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
            {totalConvidados}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            Total de mesas
          </span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
            {totalMesas}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            Total de lugares
          </span>
          <span style={{
            fontSize: '16px',
            fontWeight: 700,
            color: insuficiente ? '#C62828' : sobra >= 0 ? '#2E7D32' : 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
          }}>
            {totalLugares}
          </span>
        </div>
        {insuficiente && (
          <span style={{
            fontSize: '13px',
            color: '#C62828',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}>
            Faltam {totalConvidados - totalLugares} lugares. Adicione mais mesas.
          </span>
        )}
        {excesso && (
          <span style={{
            fontSize: '13px',
            color: '#E65100',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}>
            Atencao: voce tem {sobra} lugares de sobra (mais de 30% do necessario). Revise se realmente precisa de tantas mesas.
          </span>
        )}
        {!insuficiente && !excesso && sobra >= 0 && (
          <span style={{
            fontSize: '13px',
            color: '#2E7D32',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}>
            {sobra} lugares de sobra (margem de seguranca)
          </span>
        )}
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
          onClick={avancar}
          disabled={totalLugares < totalConvidados || totalMesas === 0}
          style={{
            padding: '12px 32px',
            borderRadius: '10px',
            border: 'none',
            background: totalLugares >= totalConvidados && totalMesas > 0 ? 'var(--color-brand)' : '#C4B5A5',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: totalLugares >= totalConvidados && totalMesas > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          Proximo
        </button>
      </div>
    </div>
  );
}