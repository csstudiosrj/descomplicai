import Icon from '../ui/Icon';

export default function ContratoFiltros({ filtroStatus, setFiltroStatus, filtroCategoria, setFiltroCategoria, statusOptions, categorias }) {
  return (
    <div style={filtrosBarStyle}>
      <div style={filtroGrupoStyle}>
        <label style={filtroLabelStyle}>Status</label>
        <select style={filtroSelectStyle} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="todos">Todos</option>
          {statusOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
      <div style={filtroGrupoStyle}>
        <label style={filtroLabelStyle}>Categoria</label>
        <select style={filtroSelectStyle} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="todos">Todas</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const filtrosBarStyle = { display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #F0EDE9' };
const filtroGrupoStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const filtroLabelStyle = { fontSize: '12px', color: '#A89B91', fontFamily: 'var(--font-body)', fontWeight: 500 };
const filtroSelectStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4C8C0', fontSize: '14px', fontFamily: 'var(--font-body)', background: '#fff', color: '#1A1714', outline: 'none', minWidth: '160px' };