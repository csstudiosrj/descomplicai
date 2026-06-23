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
      if (data.contrato.assinado_fornecedor_em) setAssinado(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssinar = async () => {
    if (!nome.trim()) return;
    setAssinando(true);
    try {
      const res = await fetch('/api/contratos/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nome, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao assinar');
      setAssinado(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setAssinando(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={textStyle}>Carregando contrato...</p>
        </div>
      </div>
    );
  }

  if (erro) {
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
          <p style={subStyle}>Você receberá uma cópia por email em breve.</p>
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
            <pre style={conteudoPreStyle}>{contrato?.conteudo || ''}</pre>
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

            <button
              onClick={handleAssinar}
              disabled={!nome.trim() || assinando}
              style={{
                ...btnAssinarStyle,
                opacity: !nome.trim() || assinando ? 0.6 : 1,
                cursor: !nome.trim() || assinando ? 'not-allowed' : 'pointer',
              }}
            >
              {assinando ? 'Assinando...' : 'Assinar digitalmente'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const pageStyle = { minHeight: '100vh', background: '#F9F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
const cardStyle = { background: '#fff', borderRadius: '16px', border: '1px solid #F0EDE9', maxWidth: '720px', width: '100%', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' };
const headerStyle = { textAlign: 'center' };
const titleStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '22px', color: '#8B6F5E', fontWeight: 400, margin: '0 0 8px 0' };
const subStyle = { fontSize: '14px', color: '#A89B91', fontFamily: 'var(--font-body)', margin: 0 };
const textStyle = { fontSize: '15px', color: '#1A1714', fontFamily: 'var(--font-body)', margin: 0, textAlign: 'center' };

const conteudoBoxStyle = { background: '#F9F7F4', borderRadius: '12px', padding: '20px', border: '1px solid #F0EDE9', maxHeight: '60vh', overflowY: 'auto' };
const conteudoPreStyle = { fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6, color: '#1A1714', whiteSpace: 'pre-wrap', margin: 0, wordWrap: 'break-word' };

const formBoxStyle = { display: 'flex', flexDirection: 'column', gap: '14px' };
const sectionTitleStyle = { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '16px', color: '#8B6F5E', fontWeight: 400, margin: 0 };
const formGroupStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: '#1A1714', fontFamily: 'var(--font-body)' };
const requiredStyle = { color: '#C62828' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D4C8C0', fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1A1714', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const btnAssinarStyle = { width: '100%', padding: '14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'opacity 150ms ease' };