import Icon from '../ui/Icon';
import ContratoStatus from './ContratoStatus';

function getIniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

export default function ContratoCard({ contrato, fornecedor, onEditar, onExcluir, onEnviar, onReenviar, onDownload, readOnly }) {
  const nomeFornecedor = fornecedor?.nome || 'Fornecedor';
  const empresa = fornecedor?.empresa;
  const status = contrato.status;
  const isModelo = contrato.origem !== 'upload';
  const temPdf = !!contrato.pdf_url;
  const enviadoNaoAssinado = ['enviado', 'visualizado'].includes(status);
  const podeEditar = !readOnly && status !== 'assinado';
  const podeExcluir = !readOnly && status !== 'assinado';
  const podeEnviar = !readOnly && status === 'rascunho';
  const podeReenviar = !readOnly && enviadoNaoAssinado;
  const podeDownload = temPdf;

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
        <ContratoStatus status={status} />
      </div>

      <div style={cardBodyStyle}>
        <div style={metaRowStyle}>
          <div style={tipoBadgeStyle(isModelo)}>
            <Icon name={isModelo ? 'fileText' : 'upload'} size={12} color={isModelo ? '#A89B91' : '#8B6F5E'} />
            <span>{isModelo ? 'Modelo gerado' : 'Upload do fornecedor'}</span>
          </div>
          <span style={tipoLabelStyle}>{contrato.tipo || 'Contrato'}</span>
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
          {contrato.visualizado_em && (
            <div style={dataItemStyle}>
              <span style={dataLabelStyle}>Visualizado</span>
              <span style={dataValueStyle}>
                {new Date(contrato.visualizado_em).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
          {contrato.assinado_fornecedor_em && (
            <div style={dataItemStyle}>
              <span style={dataLabelStyle}>Assinado</span>
              <span style={dataValueStyle}>
                {new Date(contrato.assinado_fornecedor_em).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
          {contrato.recusado_em && (
            <div style={dataItemStyle}>
              <span style={dataLabelStyle}>Recusado</span>
              <span style={{ ...dataValueStyle, color: '#C62828' }}>
                {new Date(contrato.recusado_em).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        {contrato.justificativa_recusa && (
          <div style={justificativaStyle}>
            <Icon name="alertCircle" size={12} color="#C62828" />
            <span style={justificativaTextStyle}>{contrato.justificativa_recusa}</span>
          </div>
        )}
      </div>

      <div style={cardFooterStyle}>
        {podeEditar && (
          <button onClick={onEditar} style={btnSecundarioStyle}>
            <Icon name="edit" size={14} /> Editar
          </button>
        )}
        {podeEnviar && (
          <button onClick={onEnviar} style={btnPrimarioStyle}>
            <Icon name="mail" size={14} /> Enviar
          </button>
        )}
        {podeReenviar && (
          <button onClick={onReenviar} style={btnReenviarStyle}>
            <Icon name="refreshCw" size={14} /> Reenviar
          </button>
        )}
        {podeDownload && (
          <button onClick={onDownload} style={btnSecundarioStyle}>
            <Icon name="download" size={14} /> PDF
          </button>
        )}
        {podeExcluir && (
          <button onClick={onExcluir} style={btnExcluirStyle}>
            <Icon name="trash" size={14} />
          </button>
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
const metaRowStyle = { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' };
const tipoBadgeStyle = (isModelo) => ({ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, fontFamily: 'var(--font-body)', background: isModelo ? '#F5F5F5' : '#FFF8E1', color: isModelo ? '#9E9E9E' : '#F9A825', border: `1px solid ${isModelo ? '#E0E0E0' : '#FFE082'}` });
const tipoLabelStyle = { fontSize: '13px', color: '#A89B91', fontFamily: 'var(--font-body)' };

const datasStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' };
const dataItemStyle = { display: 'flex', flexDirection: 'column', gap: '2px' };
const dataLabelStyle = { fontSize: '10px', color: '#A89B91', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: 'var(--font-body)' };
const dataValueStyle = { fontSize: '13px', color: '#1A1714', fontFamily: 'var(--font-body)' };

const justificativaStyle = { display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '8px 10px', background: '#FFEBEE', borderRadius: '8px', border: '1px solid #FFCDD2' };
const justificativaTextStyle = { fontSize: '12px', color: '#C62828', fontFamily: 'var(--font-body)', lineHeight: 1.4 };

const cardFooterStyle = { display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' };
const btnBaseStyle = { display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'opacity 150ms ease', border: 'none' };
const btnSecundarioStyle = { ...btnBaseStyle, background: '#F9F7F4', color: '#1A1714', border: '1px solid #D4C8C0' };
const btnPrimarioStyle = { ...btnBaseStyle, background: '#8B6F5E', color: '#fff' };
const btnReenviarStyle = { ...btnBaseStyle, background: '#1976D2', color: '#fff' };
const btnExcluirStyle = { ...btnBaseStyle, background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', padding: '8px' };