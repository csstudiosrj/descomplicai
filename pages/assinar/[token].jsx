import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Icon from '../../components/ui/Icon';

export default function AssinarPage() {
  const router = useRouter();
  const { token } = router.query;
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [assinando, setAssinando] = useState(false);
  const [assinado, setAssinado] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [concordo, setConcordo] = useState(false);
  const [recusando, setRecusando] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [mostrarRecusa, setMostrarRecusa] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (!token) return;
    buscarContrato();
  }, [token]);

  const buscarContrato = async () => {
    try {
      const res = await fetch(`/api/contratos/ver?token=${token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao carregar');
      setContrato(data.contrato);
      setPdfUrl(data.contrato?.pdf_url || null);
      if (data.contrato.status === 'assinado') setAssinado(true);
      if (data.contrato.status === 'recusado') setMostrarRecusa(true);

      fetch('/api/contratos/visualizado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssinar = async () => {
    if (!nome.trim() || !concordo) return;
    setAssinando(true);
    setErro(null);
    try {
      const res = await fetch('/api/contratos/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nome: nome.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao assinar');
      setAssinado(true);
      if (data.pdf_url) setPdfUrl(data.pdf_url);
    } catch (err) {
      setErro(err.message);
    } finally {
      setAssinando(false);
    }
  };

  const handleRecusar = async () => {
    if (!justificativa.trim()) return;
    setRecusando(true);
    setErro(null);
    try {
      const res = await fetch('/api/contratos/recusar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, justificativa: justificativa.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao recusar');
      setMostrarRecusa(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setRecusando(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}><p style={textStyle}>Carregando contrato...</p></div>
      </div>
    );
  }

  if (erro && !contrato) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <Icon name="alertCircle" size={48} color="#C62828" />
          <h1 style={titleStyle}>Erro</h1>
          <p style={textStyle}>{erro}</p>
        </div>
      </div>
    );
  }

  if (assinado) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <Icon name="checkCircle" size={64} color="#10B981" />
          <h1 style={titleStyle}>Contrato Assinado!</h1>
          <p style={textStyle}>O contrato foi assinado digitalmente com sucesso.</p>
          {pdfUrl ? (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={btnPrimarioStyle}>
              <Icon name="download" size={16} /> Baixar PDF assinado
            </a>
          ) : (
            <p style={{ ...textStyle, color: '#A89B91', fontSize: '13px' }}>O PDF será disponibilizado em breve.</p>
          )}
          <div style={ctaBoxStyle}>
            <p style={ctaTitleStyle}>Gerencie seus contratos no Descomplicaí</p>
            <p style={ctaTextStyle}>Acompanhe todos os seus contratos de casamento em um só lugar.</p>
            <a href="/login" style={btnSecundarioStyle}>Entrar ou criar conta</a>
          </div>
        </div>
      </div>
    );
  }

  if (mostrarRecusa || contrato?.status === 'recusado') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <Icon name="alertCircle" size={48} color="#C62828" />
          <h1 style={{ ...titleStyle, color: '#C62828' }}>Contrato Recusado</h1>
          <p style={textStyle}>Você recusou este contrato. Os noivos foram notificados.</p>
          {contrato?.justificativa_recusa && (
            <div style={justificativaBoxStyle}>
              <p style={justificativaLabelStyle}>Sua justificativa:</p>
              <p style={justificativaTextStyle}>{contrato.justificativa_recusa}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>Assinar Contrato | descomplicai</title></Head>
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>Contrato de Prestação de Serviços</h1>
            <p style={subStyle}>Leia atentamente antes de assinar</p>
          </div>

          <div style={conteudoBoxStyle}>
            <div style={conteudoDocStyle}>
              {contrato?.conteudo?.split('\n').map((line, i) => (
                <p key={i} style={lineStyle(line)}>{line}</p>
              )) || <p style={textStyle}>Conteúdo não disponível</p>}
            </div>
          </div>

          <div style={formBoxStyle}>
            <h2 style={sectionTitleStyle}>Dados do signatário</h2>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Nome completo <span style={requiredStyle}>*</span></label>
              <input
                style={inputStyle}
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                placeholder="seu@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={concordo}
                onChange={(e) => setConcordo(e.target.checked)}
                style={checkboxStyle}
              />
              <span>Li e concordo com os termos acima</span>
            </label>

            {erro && <p style={erroStyle}>{erro}</p>}

            <button
              onClick={handleAssinar}
              disabled={!nome.trim() || !concordo || assinando}
              style={{
                ...btnAssinarStyle,
                opacity: !nome.trim() || !concordo || assinando ? 0.6 : 1,
                cursor: !nome.trim() || !concordo || assinando ? 'not-allowed' : 'pointer',
              }}
            >
              {assinando ? 'Assinando...' : 'Assinar digitalmente'}
            </button>

            <div style={recusaSectionStyle}>
              <button onClick={() => setMostrarRecusa(!mostrarRecusa)} style={btnRecusaToggleStyle}>
                {mostrarRecusa ? 'Cancelar recusa' : 'Não concordo — recusar contrato'}
              </button>
              {mostrarRecusa && (
                <div style={recusaFormStyle}>
                  <textarea
                    style={textareaStyle}
                    placeholder="Informe o motivo da recusa (obrigatório)"
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    rows={3}
                  />
                  <button
                    onClick={handleRecusar}
                    disabled={!justificativa.trim() || recusando}
                    style={{
                      ...btnRecusaStyle,
                      opacity: !justificativa.trim() || recusando ? 0.6 : 1,
                      cursor: !justificativa.trim() || recusando ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {recusando ? 'Enviando...' : 'Confirmar recusa'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function lineStyle(line) {
  if (line.startsWith('CONTRATO') || line.startsWith('CONTRATANTES') || line.startsWith('CONTRATADA') || line.startsWith('CONTRATADO')) {
    return { ...docParagraphStyle, fontWeight: 600, marginTop: '16px' };
  }
  if (/^\d+\./.test(line)) {
    return { ...docParagraphStyle, fontWeight: 600, marginTop: '12px' };
  }
  if (line.trim() === '') {
    return { ...docParagraphStyle, margin: '4px 0' };
  }
  return docParagraphStyle;
}

const pageStyle = { minHeight: '100vh', background: '#F9F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
const cardStyle = { background: '#fff', borderRadius: '16px', border: '1px solid #F0EDE9', maxWidth: '720px', width: '100%', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' };
const headerStyle = { textAlign: 'center' };
const titleStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '22px', color: '#8B6F5E', fontWeight: 400, margin: '0 0 8px 0' };
const subStyle = { fontSize: '14px', color: '#A89B91', fontFamily: 'var(--font-body)', margin: 0 };
const textStyle = { fontSize: '15px', color: '#1A1714', fontFamily: 'var(--font-body)', margin: 0, textAlign: 'center' };

const conteudoBoxStyle = { background: '#F9F7F4', borderRadius: '12px', padding: '20px', border: '1px solid #F0EDE9', maxHeight: '50vh', overflowY: 'auto' };
const conteudoDocStyle = { fontFamily: 'Georgia, serif', fontSize: '13px', lineHeight: 1.7, color: '#1A1714' };
const docParagraphStyle = { margin: '0 0 8px 0', lineHeight: 1.7 };

const formBoxStyle = { display: 'flex', flexDirection: 'column', gap: '14px' };
const sectionTitleStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '16px', color: '#8B6F5E', fontWeight: 400, margin: 0 };
const formGroupStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: '#1A1714', fontFamily: 'var(--font-body)' };
const requiredStyle = { color: '#C62828' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D4C8C0', fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1A1714', outline: 'none', boxSizing: 'border-box', background: '#fff' };

const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1A1714', fontFamily: 'var(--font-body)', cursor: 'pointer', padding: '4px 0' };
const checkboxStyle = { width: '18px', height: '18px', accentColor: '#8B6F5E', cursor: 'pointer' };

const erroStyle = { fontSize: '13px', color: '#C62828', background: '#FFEBEE', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FFCDD2', margin: 0, fontFamily: 'var(--font-body)' };

const btnAssinarStyle = { width: '100%', padding: '14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'opacity 150ms ease' };

const btnPrimarioStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', background: '#8B6F5E', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)', marginTop: '8px' };
const btnSecundarioStyle = { display: 'inline-block', padding: '10px 20px', background: '#F9F7F4', color: '#1A1714', border: '1px solid #D4C8C0', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', marginTop: '8px' };
const ctaBoxStyle = { background: '#F9F7F4', borderRadius: '12px', padding: '20px', border: '1px solid #F0EDE9', textAlign: 'center', marginTop: '8px' };
const ctaTitleStyle = { fontSize: '15px', fontWeight: 600, color: '#1A1714', margin: '0 0 4px 0', fontFamily: 'var(--font-body)' };
const ctaTextStyle = { fontSize: '13px', color: '#A89B91', margin: '0 0 12px 0', fontFamily: 'var(--font-body)' };

const recusaSectionStyle = { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' };
const btnRecusaToggleStyle = { background: 'none', border: 'none', color: '#A89B91', fontSize: '13px', fontFamily: 'var(--font-body)', cursor: 'pointer', textDecoration: 'underline', textAlign: 'center', padding: '4px' };
const recusaFormStyle = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: '#FFEBEE', borderRadius: '10px', border: '1px solid #FFCDD2' };
const textareaStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FFCDD2', fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1A1714', outline: 'none', boxSizing: 'border-box', background: '#fff', resize: 'vertical' };
const btnRecusaStyle = { width: '100%', padding: '12px', background: '#C62828', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)' };

const justificativaBoxStyle = { background: '#FFEBEE', borderRadius: '10px', padding: '16px', border: '1px solid #FFCDD2', marginTop: '8px' };
const justificativaLabelStyle = { fontSize: '12px', color: '#C62828', fontWeight: 600, fontFamily: 'var(--font-body)', margin: '0 0 4px 0' };
const justificativaTextStyle = { fontSize: '14px', color: '#1A1714', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 };
