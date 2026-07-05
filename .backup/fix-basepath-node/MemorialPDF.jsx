import React, { useState } from 'react';

/**
 * Componente cliente para download do Memorial PDF.
 * Faz fetch para /api/gerar-pdf e recebe o blob do PDF gerado no servidor.
 * NÃO importa @react-pdf/renderer nem utilitários de filesystem.
 */
export default function MemorialPDF({ memorial, dadosEvento, qrCodeDataUri = null, dimensoesImagens = {} }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const handleDownload = async () => {
    setErro(null);
    setLoading(true);

    try {
      const res = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memorial,
          dadosEvento,
          qrCodeDataUri,
          dimensoesImagens,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.erro || `Erro ${res.status} ao gerar PDF`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const nome1 = dadosEvento?.nomePessoa1 || 'casamento';
      const nome2 = dadosEvento?.nomePessoa2 || '';
      const slug = [nome1, nome2].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');
      const filename = `memorial-${slug || 'descomplicai'}.pdf`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[MemorialPDF] Erro ao gerar PDF:', err);
      setErro(err.message || 'Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        padding: '10px 20px',
        borderRadius: 6,
        border: '1px solid #8B6F5E',
        background: loading ? '#E5E0D9' : '#8B6F5E',
        color: loading ? '#8B6F5E' : '#FFFFFF',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: 14,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
      aria-busy={loading}
      aria-live="polite"
    >
      {loading ? (
        <>
          <span className="spinner" style={{ width: 16, height: 16, border: '2px solid #8B6F5E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
          Gerando PDF…
        </>
      ) : (
        '⬇️ Baixar Memorial PDF'
      )}
    </button>
  );
}
