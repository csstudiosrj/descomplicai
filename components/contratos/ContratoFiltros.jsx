import Icon from '../ui/Icon';

const STATUS_LIST = [
  { id: 'todos', label: 'Todos' },
  { id: 'rascunho', label: 'Rascunho', color: '#9E9E9E' },
  { id: 'enviado', label: 'Enviado', color: '#F9A825' },
  { id: 'visualizado', label: 'Visualizado', color: '#1976D2' },
  { id: 'assinado', label: 'Assinado', color: '#10B981' },
  { id: 'recusado', label: 'Recusado', color: '#C62828' },
];

export default function ContratoFiltros({ filtroStatus, setFiltroStatus, filtroFornecedor, setFiltroFornecedor, fornecedores }) {
  return (
    <div style={filtrosBarStyle}>
      <div style={pillsRowStyle}>
        {STATUS_LIST.map((s) => {
          const ativo = filtroStatus === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setFiltroStatus(s.id)}
              style={{
                ...pillStyle,
                background: ativo ? '#8B6F5E' : '#fff',
                color: ativo ? '#fff' : '#1A1714',
                border: `1px solid ${ativo ? '#8B6F5E' : '#D4C8C0'}`,
              }}
            >
              {s.id !== 'todos' && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: s.color,
                  display: 'inline-block',
                  marginRight: '6px',
                }} />
              )}
              {s.label}
            </button>
          );
        })}
      </div>

      <div style={fornecedorGrupoStyle}>
        <label style={filtroLabelStyle}>Fornecedor</label>
        <div style={selectWrapStyle}>
          <Icon name="users" size={14} color="#A89B91" />
          <select
            style={fornecedorSelectStyle}
            value={filtroFornecedor}
            onChange={(e) => setFiltroFornecedor(e.target.value)}
          >
            <option value="todos">Todos os fornecedores</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}{f.empresa ? ` — ${f.empresa}` : ''}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

const filtrosBarStyle = { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' };
const pillsRowStyle = { display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #F0EDE9', alignItems: 'center' };
const pillStyle = { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 150ms ease', border: 'none' };
const fornecedorGrupoStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const filtroLabelStyle = { fontSize: '12px', color: '#A89B91', fontFamily: 'var(--font-body)', fontWeight: 500 };
const selectWrapStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #D4C8C0', minWidth: '240px' };
const fornecedorSelectStyle = { border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1A1714', background: 'transparent', flex: 1, cursor: 'pointer' };