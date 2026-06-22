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

const FORMATOS = [
  { id: 'redonda', label: 'Redonda', desc: 'Classica, melhor circulacao' },
  { id: 'quadrada', label: 'Quadrada', desc: 'Moderna, aproveita espaco' },
  { id: 'retangular', label: 'Retangular', desc: 'Elegante, para grupos maiores' },
  { id: 'misto', label: 'Misto', desc: 'Combine formatos' },
];

function getIconeDimensoes(formato) {
  if (formato === 'redonda') return { width: 48, height: 48, borderRadius: '50%' };
  if (formato === 'quadrada') return { width: 48, height: 48, borderRadius: '8px' };
  return { width: 72, height: 40, borderRadius: '6px' };
}

function sugerirQuantidades(formato, totalConvidados) {
  const opcoes = CATALOGO_MESAS.filter(t => formato === 'misto' || t.formato === formato);
  const sugerido = {};
  let restante = totalConvidados;

  // Ordena por capacidade decrescente para usar mesas maiores primeiro
  const ordenado = [...opcoes].sort((a, b) => b.capacidade - a.capacidade);

  for (const tipo of ordenado) {
    if (restante <= 0) break;
    const qtd = Math.floor(restante / tipo.capacidade);
    if (qtd > 0) {
      sugerido[tipo.id] = qtd;
      restante -= qtd * tipo.capacidade;
    }
  }

  // Se sobrou gente, adiciona uma mesa do menor tipo disponivel
  if (restante > 0 && opcoes.length > 0) {
    const menor = [...opcoes].sort((a, b) => a.capacidade - b.capacidade)[0];
    sugerido[menor.id] = (sugerido[menor.id] || 0) + 1;
  }

  return sugerido;
}

export default function WizardPasso2({ totalConvidados, tiposSelecionados, onChange, onAvancar, onVoltar }) {
  const [formatoFiltro, setFormatoFiltro] = useState(null);
  const [quantidades, setQuantidades] = useState({});
  const [modalExcesso, setModalExcesso] = useState(false);

  useEffect(() => {
    const map = {};
    tiposSelecionados.forEach(t => { map[t.catalogoId] = t.quantidade; });
    setQuantidades(map);
  }, [tiposSelecionados]);

  const tiposFiltrados = formatoFiltro && formatoFiltro !== 'misto'
    ? CATALOGO_MESAS.filter(t => t.formato === formatoFiltro)
    : CATALOGO_MESAS;

  const totalLugares = Object.entries(quantidades).reduce((acc, [id, qtd]) => {
    const tipo = CATALOGO_MESAS.find(t => t.id === id);
    return acc + (tipo ? tipo.capacidade * qtd : 0);
  }, 0);

  const totalMesas = Object.values(quantidades).reduce((a, b) => a + b, 0);
  const sobra = totalLugares - totalConvidados;
  const insuficiente = totalLugares > 0 && totalLugares < totalConvidados;
  const atingiuLimite = totalConvidados > 0 && totalLugares >= totalConvidados * 1.1;

  const setQtd = (catalogoId, qtd) => {
    const num = Math.max(0, parseInt(qtd) || 0);
    setQuantidades(prev => {
      const novo = { ...prev };
      if (num <= 0) {
        delete novo[catalogoId];
      } else {
        novo[catalogoId] = num;
      }
      const selecionados = Object.entries(novo)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => {
          const tipo = CATALOGO_MESAS.find(t => t.id === id);
          return { catalogoId: id, nome: tipo.nome, formato: tipo.formato, capacidade: tipo.capacidade, quantidade: q };
        });
      onChange(selecionados);
      return novo;
    });
  };

  const incrementar = (catalogoId, capacidade) => {
    if (atingiuLimite) {
      setModalExcesso(true);
      return;
    }
    const atual = quantidades[catalogoId] || 0;
    setQtd(catalogoId, atual + 1);
  };

  const decrementar = (catalogoId) => {
    const atual = quantidades[catalogoId] || 0;
    if (atual > 0) setQtd(catalogoId, atual - 1);
  };

  const aplicarSugestao = () => {
    const sugerido = sugerirQuantidades(formatoFiltro || 'misto', totalConvidados);
    setQuantidades(sugerido);
    const selecionados = Object.entries(sugerido)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => {
        const tipo = CATALOGO_MESAS.find(t => t.id === id);
        return { catalogoId: id, nome: tipo.nome, formato: tipo.formato, capacidade: tipo.capacidade, quantidade: q };
      });
    onChange(selecionados);
  };

  const avancar = () => {
    const selecionados = Object.entries(quantidades)
      .filter(([, qtd]) => qtd > 0)
      .map(([id, qtd]) => {
        const tipo = CATALOGO_MESAS.find(t => t.id === id);
        return { catalogoId: id, nome: tipo.nome, formato: tipo.formato, capacidade: tipo.capacidade, quantidade: qtd };
      });
    onChange(selecionados);
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
          Escolha um formato primeiro. O sistema pode sugerir as quantidades.
        </p>
      </div>

      {/* Seletor de formato */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '8px',
      }}>
        {FORMATOS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFormatoFiltro(f.id)}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: `2px solid ${formatoFiltro === f.id ? 'var(--color-brand)' : 'var(--color-border)'}`,
              background: formatoFiltro === f.id ? 'var(--color-white)' : 'var(--color-off-white)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              textAlign: 'left',
            }}
          >
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
            }}>
              {f.label}
            </span>
            <span style={{
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
            }}>
              {f.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Sugestao automatica */}
      {formatoFiltro && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-white)',
          borderRadius: '10px',
          padding: '12px 16px',
          border: '1px solid var(--color-border)',
        }}>
          <div>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
            }}>
              Sugestao automatica
            </span>
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              margin: '2px 0 0',
            }}>
              Para {totalConvidados} convidados em mesas {formatoFiltro === 'misto' ? 'mistos' : formatoFiltro + 's'}
            </p>
          </div>
          <button
            onClick={aplicarSugestao}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--color-brand)',
              background: 'var(--color-white)',
              color: 'var(--color-brand)',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            Aplicar sugestao
          </button>
        </div>
      )}

      {/* Lista de tipos */}
      {formatoFiltro ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '10px',
        }}>
          {tiposFiltrados.map((tipo) => {
            const qtd = quantidades[tipo.id] || 0;
            const selecionado = qtd > 0;
            const dim = getIconeDimensoes(tipo.formato);
            const bloqueado = atingiuLimite && !selecionado;

            return (
              <div
                key={tipo.id}
                style={{
                  background: selecionado ? 'var(--color-white)' : 'var(--color-off-white)',
                  border: `2px solid ${selecionado ? 'var(--color-brand)' : 'var(--color-border)'}`,
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 150ms ease',
                  opacity: bloqueado ? 0.5 : 1,
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

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <button
                    onClick={() => decrementar(tipo.id)}
                    disabled={qtd <= 0}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-off-white)',
                      cursor: qtd > 0 ? 'pointer' : 'not-allowed',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: qtd > 0 ? 'var(--color-text-primary)' : '#C4B5A5',
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
                    onClick={() => incrementar(tipo.id, tipo.capacidade)}
                    disabled={bloqueado}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-off-white)',
                      cursor: bloqueado ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: bloqueado ? '#C4B5A5' : 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 16px',
          background: 'var(--color-off-white)',
          borderRadius: '12px',
          border: '1px dashed var(--color-border)',
        }}>
          <span style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
          }}>
            Selecione um formato acima para ver as opcoes
          </span>
        </div>
      )}

      {/* Resumo */}
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
        {sobra >= 0 && (
          <span style={{
            fontSize: '13px',
            color: '#2E7D32',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}>
            {sobra} lugares de sobra (margem de seguranca)
          </span>
        )}
        {atingiuLimite && (
          <span style={{
            fontSize: '13px',
            color: '#E65100',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}>
            Limite atingido (110% dos convidados). Nao e possivel adicionar mais mesas.
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

      {/* Modal de excesso */}
      {modalExcesso && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px',
        }} onClick={() => setModalExcesso(false)}>
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
              fontSize: '20px',
              color: 'var(--color-text-primary)',
              margin: '0 0 12px',
            }}>
              Limite de mesas atingido
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.5,
              margin: '0 0 20px',
            }}>
              Voce ja tem lugares suficientes para {totalConvidados} convidados com uma margem de 10%. Adicionar mais mesas pode desperdicar espaco no salao.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalExcesso(false)}
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
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}