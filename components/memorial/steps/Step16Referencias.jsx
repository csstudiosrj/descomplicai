// D5 — Upload de referencias visuais (modo ativo)
// Dependencias diretas: React, PropTypes, Input, ImageUpload

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../ui/Input';
import ImageUpload from '../../ui/ImageUpload';

export default function Step16Referencias({ onSelect, estadoAtual }) {
  const [links, setLinks] = useState(estadoAtual?.referenciasVisuais?.map(r => r.url).join('\n') || '');
  const [uploads, setUploads] = useState(estadoAtual?.referenciasUploads || []);
  const [erroUpload, setErroUpload] = useState(null);

  const handleConfirmar = () => {
    const urls = links.split('\n').filter(l => l.trim()).map(url => ({ tipo: 'link', url: url.trim() }));
    const uploadsFormatados = uploads.map(u => ({ tipo: 'upload', url: u }));
    onSelect('referenciasVisuais', [...urls, ...uploadsFormatados]);
    onSelect('referenciasUploads', uploads);
  };

  const handleUpload = (novasUrls) => {
    setUploads(prev => [...prev, ...novasUrls]);
    setErroUpload(null);
  };

  const handleRemoverUpload = (url) => {
    setUploads(prev => prev.filter(u => u !== url));
  };

  const handleError = (mensagem) => {
    setErroUpload(mensagem);
    setTimeout(() => setErroUpload(null), 5000);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Referencias visuais
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Cole links do Pinterest, Instagram ou faca upload de imagens de inspiracao. Isso e opcional.
      </p>

      {/* Upload de imagens */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
          Imagens de referencia
        </label>
        <ImageUpload
          onUpload={handleUpload}
          onError={handleError}
          maxFiles={5}
          tipo="referencia"
          label=""
          urlsExistentes={uploads}
          onRemoverExistente={handleRemoverUpload}
        />
        {erroUpload && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: 'var(--space-1)' }}>
            {erroUpload}
          </p>
        )}
      </div>

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
          Links de referencia (um por linha, max 10)
        </label>
        <textarea
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          rows={5}
          placeholder="https://pinterest.com/...
https://instagram.com/..."
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            resize: 'vertical',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        />
      </div>

      <button
        aria-label="Confirmar resposta" onClick={handleConfirmar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--color-brand)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
        }}
      >
        Confirmar referencias
      </button>
    </div>
  );
}

Step16Referencias.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step16Referencias };
