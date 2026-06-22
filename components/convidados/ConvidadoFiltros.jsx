import { useState, useEffect } from 'react';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function ConvidadoFiltros({
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  filtroGrupo,
  setFiltroGrupo,
  grupos,
  total,
  confirmados,
  pendentes,
  recusados,
  pessoasConfirmadas,
}) {
  const [buscaFocus, setBuscaFocus] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
      {/* Cards de resumo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
      }}>
        <ResumoCard valor={total} label="Total" cor="#8B6F5E" />
        <ResumoCard valor={confirmados} label="Confirmados" cor="#2E7D32" sub={pessoasConfirmadas > 0 ? `${pessoasConfirmadas} pessoas` : null} />
        <ResumoCard valor={pendentes} label="Pendentes" cor="#F9A825" />
        <ResumoCard valor={recusados} label="Recusados" cor="#C62828" />
      </div>

      {/* Barra de busca e filtros */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center',
        background: 'var(--color-white)',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '1px solid var(--color-border)',
      }}>
        <div style={{
          flex: 1,
          minWidth: '200px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-secondary)',
            pointerEvents: 'none',
          }}>
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onFocus={() => setBuscaFocus(true)}
            onBlur={() => setBuscaFocus(false)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: `1px solid ${buscaFocus ? 'var(--color-brand)' : 'var(--color-border)'}`,
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              background: 'var(--color-white)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              transition: 'border 200ms ease',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            background: 'var(--color-white)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '140px',
          }}
        >
          <option value="todos">Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
          <option value="recusado">Recusado</option>
        </select>

        <select
          value={filtroGrupo}
          onChange={(e) => setFiltroGrupo(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            background: 'var(--color-white)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '160px',
          }}
        >
          <option value="todos">Todos os grupos</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.nome}>{g.nome}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ResumoCard({ valor, label, cor, sub }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 600;
    const from = 0;
    const to = valor;

    const anim = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress >= 1) clearInterval(anim);
    }, 16);

    return () => clearInterval(anim);
  }, [valor]);

  return (
    <div style={{
      background: 'var(--color-white)',
      borderRadius: '10px',
      padding: '12px',
      border: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    }}>
      <span style={{ fontSize: '22px', fontWeight: 700, color: cor }}>{display}</span>
      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>{label}</span>
      {sub && <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>{sub}</span>}
    </div>
  );
}