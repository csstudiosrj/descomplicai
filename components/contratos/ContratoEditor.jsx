import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';

export default function ContratoEditor({ contrato, fornecedor, onSalvar, onFechar, readOnly }) {
  const [conteudo, setConteudo] = useState(contrato?.conteudo || '');
  const [status, setStatus] = useState(contrato?.status || 'rascunho');

  useEffect(() => {
    setConteudo(contrato?.conteudo || '');
    setStatus(contrato?.status || 'rascunho');
  }, [contrato]);

  const handleSalvar = () => {
    onSalvar({ ...contrato, conteudo, status });
  };

  const nomeFornecedor = fornecedor?.nome || 'Fornecedor';

  return (
    <div style={overlayStyle} onClick={onFechar}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>Editar Contrato</h2>
            <p style={modalSubtitleStyle}>{nomeFornecedor}</p>
          </div>
          <button onClick={onFechar} style={btnFecharStyle}>
            <Icon name="close" size={20} color="#fff" />
          </button>
        </div>

        <div style={modalBodyStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Status</label>
            <select
              style={selectStyle}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={readOnly}
            >
              <option value="rascunho">Rascunho</option>
              <option value="enviado">Enviado</option>
              <option value="visualizado">Visualizado</option>
              <option value="assinado">Assinado</option>
              <option value="recusado">Recusado</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Conteúdo do contrato</label>
            <textarea
              style={textareaEditorStyle}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              disabled={readOnly}
              rows={24}
            />
          </div>

          <div style={variaveisBoxStyle}>
            <span style={variaveisLabelStyle}>Variáveis disponíveis:</span>
            <div style={variaveisTagsStyle}>
              {['nome_noivos', 'data_evento', 'local_evento', 'cidade_evento', 'nome_responsavel', 'nome_empresa', 'telefone', 'email', 'valor_total', 'valor_entrada', 'data_entrada', 'valor_saldo', 'data_saldo', 'data_contrato'].map(v => (
                <span key={v} style={variavelTagStyle}>{`{${v}}`}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={modalFooterStyle}>
          <button onClick={onFechar} style={btnCancelTextStyle}>Cancelar</button>
          {!readOnly && (
            <button onClick={handleSalvar} style={btnSaveStyle}>
              <Icon name="save" size={14} color="#fff" /> Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(26,23,20,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' };
const modalStyle = { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' };
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px', background: '#8B6F5E', flexShrink: 0, gap: '12px' };
const modalTitleStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '20px', color: '#fff', fontWeight: 400, margin: 0 };
const modalSubtitleStyle = { fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-body)', margin: '4px 0 0 0' };
const btnFecharStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

const modalBodyStyle = { padding: '24px', overflowY: 'auto', flex: 1 };
const formGroupStyle = { marginBottom: '16px' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 500, color: '#1A1714', marginBottom: '6px', fontFamily: 'var(--font-body)' };
const selectStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D4C8C0', fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1A1714', background: '#fff', outline: 'none', boxSizing: 'border-box' };
const textareaEditorStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D4C8C0', fontSize: '13px', fontFamily: 'monospace', color: '#1A1714', lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#fff', minHeight: '400px' };

const variaveisBoxStyle = { background: '#F9F7F4', borderRadius: '8px', padding: '12px', border: '1px solid #F0EDE9' };
const variaveisLabelStyle = { fontSize: '12px', color: '#A89B91', fontFamily: 'var(--font-body)', fontWeight: 500, display: 'block', marginBottom: '8px' };
const variaveisTagsStyle = { display: 'flex', flexWrap: 'wrap', gap: '6px' };
const variavelTagStyle = { fontSize: '11px', fontFamily: 'monospace', color: '#8B6F5E', background: '#F0EDE9', padding: '3px 8px', borderRadius: '4px', border: '1px solid #D4C8C0' };

const modalFooterStyle = { display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #F0EDE9', alignItems: 'center', flexShrink: 0 };
const btnCancelTextStyle = { background: 'none', border: 'none', color: '#A89B91', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', padding: '10px 12px' };
const btnSaveStyle = { display: 'flex', alignItems: 'center', gap: '6px', background: '#8B6F5E', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)' };
