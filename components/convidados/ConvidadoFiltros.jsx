import { useState, useEffect } from 'react';
import Icon from '../../components/ui/Icon';

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
      <div style={resumoGridStyle}>
        <ResumoCard valor={total} label="Total" cor="#8B6F5E" />
        <ResumoCard valor={confirmados} label="Confirmados" cor="#10B981" sub={pessoasConfirmadas > 0 ? `${pessoasConfirmadas} pessoas` : null} />
        <ResumoCard valor={pendentes} label="Pendentes" cor="#F9A825" />
        <ResumoCard valor={recusados} label="Recusados" cor="#C62828" />
      </div>

      {/* Barra de busca e filtros */}
      <div style={filtrosBarStyle}>
        <div style={searchWrapperStyle}>
          <div style={searchIconStyle}>
            <Icon name="search" size={16} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onFocus={() => setBuscaFocus(true)}
            onBlur={() => setBuscaFocus(false)}
            style={{
              ...searchInputStyle,
              border: `1px solid ${buscaFocus ? '#8B6F5E' : '#D4C8C0'}`,
            }}
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
          <option value="recusado">Recusado</option>
        </select>

        <select
          value={filtroGrupo}
          onChange={(e) => setFiltroGrupo(e.target.value)}
          style={selectStyle}
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
    <div style={cardStyle}>
      <span style={{ ...numeroStyle, color: cor }}>{display}</span>
      <span style={labelStyle}>{label}</span>
      {sub && <span style={subStyle}>{sub}</span>}
    </div>
  );
}

/* ===== STYLES ===== */
const resumoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '10px',
};

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid #F0EDE9',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
};

const numeroStyle = {
  fontSize: '22px',
  fontWeight: 700,
  fontFamily: 'var(--font-body)',
};

const labelStyle = {
  fontSize: '11px',
  color: '#A89B91',
  textTransform: 'uppercase',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  letterSpacing: '0.3px',
};

const subStyle = {
  fontSize: '10px',
  color: '#A89B91',
  fontFamily: 'var(--font-body)',
};

const filtrosBarStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  alignItems: 'center',
  background: '#fff',
  borderRadius: '12px',
  padding: '12px 16px',
  border: '1px solid #F0EDE9',
};

const searchWrapperStyle = {
  flex: 1,
  minWidth: '200px',
  position: 'relative',
};

const searchIconStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#A89B91',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
};

const searchInputStyle = {
  width: '100%',
  padding: '10px 12px 10px 38px',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  background: '#fff',
  color: '#1A1714',
  outline: 'none',
  transition: 'border 200ms ease',
  boxSizing: 'border-box',
};

const selectStyle = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #D4C8C0',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  background: '#fff',
  color: '#1A1714',
  outline: 'none',
  cursor: 'pointer',
  minWidth: '140px',
};