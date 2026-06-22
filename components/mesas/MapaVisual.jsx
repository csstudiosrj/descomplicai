import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

const SALAO_W = 1200;
const SALAO_H = 800;

function calcularPosicoesCadeiras(formato, capacidade, raio) {
  const posicoes = [];
  if (formato === 'redonda') {
    for (let i = 0; i < capacidade; i++) {
      const angulo = (i / capacidade) * Math.PI * 2 - Math.PI / 2;
      posicoes.push({
        x: Math.cos(angulo) * raio,
        y: Math.sin(angulo) * raio,
      });
    }
  } else if (formato === 'quadrada') {
    const lado = Math.ceil(capacidade / 4);
    let count = 0;
    for (let i = 0; i < lado && count < capacidade; i++, count++) {
      posicoes.push({ x: -raio + (2 * raio * i) / (lado - 1 || 1), y: -raio });
    }
    for (let i = 0; i < lado && count < capacidade; i++, count++) {
      posicoes.push({ x: raio, y: -raio + (2 * raio * i) / (lado - 1 || 1) });
    }
    for (let i = 0; i < lado && count < capacidade; i++, count++) {
      posicoes.push({ x: raio - (2 * raio * i) / (lado - 1 || 1), y: raio });
    }
    for (let i = 0; i < lado && count < capacidade; i++, count++) {
      posicoes.push({ x: -raio, y: raio - (2 * raio * i) / (lado - 1 || 1) });
    }
  } else {
    const proporcao = 1.6;
    const rw = raio * proporcao;
    const rh = raio;
    const lados = [Math.ceil(capacidade / 2), Math.floor(capacidade / 2)];
    let count = 0;
    for (let i = 0; i < lados[0] && count < capacidade; i++, count++) {
      posicoes.push({ x: -rw + (2 * rw * i) / (lados[0] - 1 || 1), y: -rh });
    }
    for (let i = 0; i < lados[1] && count < capacidade; i++, count++) {
      posicoes.push({ x: rw - (2 * rw * i) / (lados[1] - 1 || 1), y: rh });
    }
  }
  return posicoes;
}

function calcularGridPosicao(index, total) {
  const cols = Math.ceil(Math.sqrt(total * (SALAO_W / SALAO_H)));
  const rows = Math.ceil(total / cols);
  const padding = 100;
  const availableW = SALAO_W - padding * 2;
  const availableH = SALAO_H - padding * 2;
  const cellW = availableW / cols;
  const cellH = availableH / rows;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    x: padding + cellW * col + cellW / 2,
    y: padding + cellH * row + cellH / 2,
  };
}

export default function MapaVisual({ mesas, mesasTipos, convidadosPorMesa, onAtribuir, onRemover, onReposicionar, readOnly }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mostrarNomes, setMostrarNomes] = useState(true);
  const [draggingMesa, setDraggingMesa] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingConvidado, setDraggingConvidado] = useState(null);
  const [hoverMesa, setHoverMesa] = useState(null);

  const tipoPorId = {};
  mesasTipos.forEach(t => { tipoPorId[t.id] = t; });

  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('.mesa-item') || e.target.closest('.cadeira')) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    panStartPos.current = { ...pan };
  };

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({ x: panStartPos.current.x + dx, y: panStartPos.current.y + dy });
    }
    if (draggingMesa) {
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = SALAO_W / rect.width;
      const scaleY = SALAO_H / rect.height;
      const rawX = (e.clientX - rect.left) * scaleX;
      const rawY = (e.clientY - rect.top) * scaleY;
      const novaX = Math.max(0, Math.min(SALAO_W, rawX - dragOffset.x));
      const novaY = Math.max(0, Math.min(SALAO_H, rawY - dragOffset.y));
      onReposicionar(draggingMesa, novaX, novaY);
    }
  }, [isPanning, draggingMesa, dragOffset, pan, onReposicionar]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingMesa(null);
    setDraggingConvidado(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const iniciarDragMesa = (e, mesaId) => {
    if (readOnly) return;
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = SALAO_W / rect.width;
    const scaleY = SALAO_H / rect.height;
    const mesa = mesas.find(m => m.id === mesaId);
    setDraggingMesa(mesaId);
    setDragOffset({
      x: ((e.clientX - rect.left) * scaleX) - (mesa.posicao_x || SALAO_W / 2),
      y: ((e.clientY - rect.top) * scaleY) - (mesa.posicao_y || SALAO_H / 2),
    });
  };

  const iniciarDragConvidado = (e, convidado) => {
    if (readOnly) return;
    e.stopPropagation();
    setDraggingConvidado(convidado);
  };

  const handleDropOnMesa = (e, mesaId) => {
    e.preventDefault();
    if (draggingConvidado && draggingConvidado.mesa_id !== mesaId) {
      onAtribuir(draggingConvidado.id, mesaId);
    }
    setDraggingConvidado(null);
    setHoverMesa(null);
  };

  const handleDragOverMesa = (e, mesaId) => {
    e.preventDefault();
    setHoverMesa(mesaId);
  };

  const handleDragLeaveMesa = () => {
    setHoverMesa(null);
  };

  const zoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const zoomOut = () => setZoom(z => Math.max(z - 0.2, 0.4));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const mesasComPosicao = useMemo(() => {
    return mesas.map((mesa, idx) => {
      if (mesa.posicao_x != null && mesa.posicao_y != null) return mesa;
      const auto = calcularGridPosicao(idx, mesas.length);
      return { ...mesa, posicao_x: auto.x, posicao_y: auto.y };
    });
  }, [mesas]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        background: 'var(--color-white)',
        borderRadius: '10px',
        padding: '10px 16px',
        border: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={zoomOut} style={styles.btnControl}>-</button>
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', minWidth: '50px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={zoomIn} style={styles.btnControl}>+</button>
          <button onClick={resetView} style={styles.btnControlText}>Centralizar</button>
        </div>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={mostrarNomes}
            onChange={(e) => setMostrarNomes(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Mostrar nomes
        </label>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        style={{
          width: '100%',
          height: '600px',
          background: '#F5F0EB',
          borderRadius: '12px',
          border: '2px solid var(--color-border)',
          overflow: 'hidden',
          position: 'relative',
          cursor: isPanning ? 'grabbing' : 'grab',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${SALAO_W}px`,
          height: `${SALAO_H}px`,
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: 'center center',
          background: '#FAF8F5',
          border: '1px dashed #C4B5A5',
          borderRadius: '4px',
        }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C4B5A5" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {mesasComPosicao.map((mesa) => {
            const tipo = tipoPorId[mesa.tipo_id];
            const ocupantes = convidadosPorMesa[mesa.id] || [];
            const capacidade = tipo?.capacidade || 8;
            const raio = formatoRaio(tipo?.formato, capacidade);
            const posicoes = calcularPosicoesCadeiras(tipo?.formato, capacidade, raio + 18);
            const x = mesa.posicao_x ?? (SALAO_W / 2);
            const y = mesa.posicao_y ?? (SALAO_H / 2);
            const isHover = hoverMesa === mesa.id;

            return (
              <div
                key={mesa.id}
                className="mesa-item"
                onMouseDown={(e) => iniciarDragMesa(e, mesa.id)}
                onDragOver={(e) => handleDragOverMesa(e, mesa.id)}
                onDrop={(e) => handleDropOnMesa(e, mesa.id)}
                onDragLeave={handleDragLeaveMesa}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  cursor: readOnly ? 'default' : 'move',
                  zIndex: isHover ? 20 : 10,
                }}
              >
                <div style={{
                  width: tipo?.formato === 'retangular' ? `${raio * 3.2}px` : `${raio * 2}px`,
                  height: tipo?.formato === 'retangular' ? `${raio * 2}px` : `${raio * 2}px`,
                  borderRadius: tipo?.formato === 'redonda' ? '50%' : tipo?.formato === 'quadrada' ? '12px' : '6px',
                  background: isHover ? '#E8D5C4' : 'var(--color-white)',
                  border: `2px solid ${isHover ? 'var(--color-brand)' : '#C4B5A5'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 200ms ease',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-brand)',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {mesa.numero}
                    </span>
                    {mesa.rotulo && mostrarNomes && (
                      <span style={{
                        fontSize: '9px',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-body)',
                        maxWidth: `${raio * 1.5}px`,
                        textAlign: 'center',
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {mesa.rotulo}
                      </span>
                    )}
                    <span style={{
                      fontSize: '9px',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      {ocupantes.length}/{capacidade}
                    </span>
                  </div>
                </div>

                {posicoes.map((pos, idx) => {
                  const conv = ocupantes[idx];
                  return (
                    <div
                      key={idx}
                      className="cadeira"
                      draggable={!readOnly && !!conv}
                      onDragStart={(e) => conv && iniciarDragConvidado(e, conv)}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: conv ? 'var(--color-brand)' : 'transparent',
                        border: conv ? 'none' : '1px dashed #C4B5A5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: conv ? 'grab' : 'default',
                        zIndex: 15,
                      }}
                    >
                      {conv && mostrarNomes && (
                        <span style={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '8px',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-body)',
                          whiteSpace: 'nowrap',
                          background: 'rgba(255,255,255,0.9)',
                          padding: '1px 4px',
                          borderRadius: '4px',
                          marginTop: '2px',
                          pointerEvents: 'none',
                        }}>
                          {conv.nome.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #C4B5A5', background: 'var(--color-white)' }} />
          <span>Mesa vazia</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--color-brand)' }} />
          <span>Lugar ocupado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px dashed #C4B5A5' }} />
          <span>Lugar vazio</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px' }}>Arraste o convidado para outra mesa</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px' }}>Arraste a mesa para reposicionar</span>
        </div>
      </div>
    </div>
  );
}

function formatoRaio(formato, capacidade) {
  if (formato === 'redonda') return 30 + capacidade * 3;
  if (formato === 'quadrada') return 30 + capacidade * 2.5;
  return 30 + capacidade * 2.5;
}

const styles = {
  btnControl: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-white)',
    color: 'var(--color-text-primary)',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnControlText: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-white)',
    color: 'var(--color-text-primary)',
    fontSize: '13px',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    fontWeight: 600,
  },
};