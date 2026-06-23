import Icon from '../ui/Icon';
import ContratoStatus from './ContratoStatus';

function getIniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

export default function ContratoCard({ contrato, fornecedor, statusInfo, onEditar, onExcluir, onAssinar, onEnviar, readOnly }) {
  const status = statusInfo || { label: contrato.status, color: '#9E9E9E', bg: '#F5F5F5' };
  const nomeFornecedor = fornecedor?.nome || 'Fornecedor';
  const empresa = fornecedor?.empresa;
  const assinadoNoivos = !!contrato.assinado_noivos_em;
  const assinadoFornecedor = !!contrato.assinado_fornecedor_em;

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div style={avatarNomeStyle}>
          <div style={avatarStyle}>
            <span style={avatarTextStyle}>{getIniciais(nomeFornecedor)}</span>
          </div>
          <div style={nomeWrapStyle}>
            <h3 style={nomeStyle}>{nomeFornecedor}</h3>
            {empresa && <p style={empresaStyle}>{empresa}</p>}
          </div>
        </div>
        <ContratoStatus status={contrato.status} statusInfo={statusInfo} />
      </div>

      <div style={cardBodyStyle}>
        <div style={tipoStyle}>
          <Icon name="fileText" size={14} color="#A89B91" />
          <span>{contrato.tipo || 'Contrato'}</span>
        </div>

        <div style={datasStyle}>
          <div style={dataItemStyle}>
            <span style={dataLabelStyle}>Criado</span>
            <span style={dataValueStyle}>
              {contrato.criado_em ? new Date(contrato.criado_em).toLocaleDateString('pt-BR') : '—'}
            </span>
          </div>
          <div style={dataItemStyle}>
            <span style={dataLabelStyle}>Atualizado</span>
            <span style={dataValueStyle}>
              {contrato.atualizado_em ? new Date(contrato.atualizado_em).toLocaleDateString('pt-BR') : '—'}
            </span>
          </div>
        </div>

        <div style={assinaturasRowStyle}>
          <div style={assinaturaItemStyle(assinadoNoivos)}>
            <Icon name={assinadoNoivos ? 'check' : 'circle'} size={14} color={assinadoNoivos ? '#10B981' : '#A89B91'} />
            <span>Noivos</span>
          </div>
          <div style={assinaturaItemStyle(assinadoFornecedor)}>
            <Icon name={assinadoFornecedor ? 'check' : 'circle'} size={14} color={assinadoFornecedor ? '#10B981' : '#A89B91'} />
            <span>Fornecedor</span>
          </div>
        </div>
      </div>

      <div style={cardFooterStyle}>
        <button onClick={onEditar} style={btnVerStyle}>
          <Icon name="edit" size={14} /> Editar
        </button>
        {!readOnly && (
          <>
            {!assinadoNoivos && (
              <button onClick={onAssinar} style={btnAssinarStyle}>
                <Icon name="check" size={14} /> Assinar
              </button>
            )}
            <button onClick={onEnviar} style={btnEnviarStyle}>
              <Icon name="mail" size={14} /> Enviar
            </button>
            <button onClick={onExcluir} style={btnExcluirStyle}>
              <Icon name="trash" size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const cardStyle = { background: '#fff', borderRadius: '12px', border: '1px solid #F0EDE9', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' };
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' };
const avatarNomeStyle = { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', background: '#F0EDE9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const avatarTextStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '14px', fontWeight: 600, color: '#A89B91', lineHeight: 1 };
const nomeWrapStyle = { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 };
const nomeStyle = { fontSize: '15px', fontWeight: 600, color: '#1A1714', margin: 0, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const empresaStyle = { fontSize: '12px', color: '#A89B91', margin: 0, fontFamily: 'var(--font-body)' };

const cardBodyStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const tipoStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#A89B91', fontFamily: 'var(--font-body)' };
const datasStyle = { display: 'flex', gap: '16px' };
const dataItemStyle = { display: 'flex', flexDirection: 'column', gap: '2px' };
const dataLabelStyle = { fontSize: '10px', color: '#A89B91', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: 'var(--font-body)' };
const dataValueStyle = { fontSize: '13px', color: '#1A1714', fontFamily: 'var(--font-body)' };

const assinaturasRowStyle = { display: 'flex', gap: '12px', marginTop: '4px' };
const assinaturaItemStyle = (ok) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  color: ok ? '#10B981' : '#A89B91',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
});

const cardFooterStyle = { display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' };
const btnBaseStyle = { display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', border: 'none', transition: 'opacity 150ms ease' };
const btnVerStyle = { ...btnBaseStyle, background: '#F9F7F4', color: '#1A1714', border: '1px solid #D4C8C0' };
const btnAssinarStyle = { ...btnBaseStyle, background: '#10B981', color: '#fff' };
const btnEnviarStyle = { ...btnBaseStyle, background: '#1976D2', color: '#fff' };
const btnExcluirStyle = { ...btnBaseStyle, background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', padding: '8px' };