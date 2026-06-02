// Preview em tempo real do memorial sendo construído
// Dependências diretas: React, PropTypes, sugestoes.js (sugerirPaleta)

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { sugerirPaleta } from '../../utils/sugestoes';

function Secao({ titulo, children, defaultOpen = true }) {
  const [aberto, setAberto] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) 0' }}>
      <button
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {titulo}
        <span style={{ color: 'var(--color-text-muted)', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
          ▼
        </span>
      </button>
      {aberto && (
        <div style={{ marginTop: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function MemorialPreview({ estado, visivel = true }) {
  const [mobileAberto, setMobileAberto] = useState(false);

  const temDados = Object.values(estado || {}).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'boolean') return true;
    return v !== null && v !== '' && v !== 0;
  });

  const conteudo = (
    <div style={{ height: '100%', overflowY: 'auto', padding: 'var(--space-5)' }}>
      {!temDados ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          Seu memorial vai tomando forma aqui...
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {estado.perfilCasal && (
            <Secao titulo="Identidade do casal">
              <p>Perfil: {estado.perfilCasal}</p>
              {(estado.nomePessoa1 || estado.nomePessoa2) && (
                <p>{[estado.nomePessoa1, estado.nomePessoa2].filter(Boolean).join(' e ')}</p>
              )}
            </Secao>
          )}

          {estado.estilo && (
            <Secao titulo="Identidade visual">
              <p style={{ textTransform: 'capitalize', marginBottom: 'var(--space-2)' }}>Estilo: {estado.estilo}</p>
              {estado.paleta?.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {estado.paleta.map((cor) => (
                    <div
                      key={cor}
                      aria-label={`Cor ${cor}`}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: cor,
                        border: '1px solid var(--color-border)',
                      }}
                    />
                  ))}
                </div>
              )}
              {!estado.paleta?.length && estado.estilo && (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {sugerirPaleta(estado.estilo).map((cor) => (
                    <div
                      key={cor}
                      aria-label={`Cor sugerida ${cor}`}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: cor,
                        border: '1px solid var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                  ))}
                </div>
              )}
            </Secao>
          )}

          {(estado.tipoCerimonia || estado.tipoLocal) && (
            <Secao titulo="Cerimônia e local">
              {estado.tipoCerimonia && <p>Cerimônia: {estado.tipoCerimonia}</p>}
              {estado.tipoLocal && <p>Local: {estado.tipoLocal}</p>}
              {estado.cidadeEvento && <p>Cidade: {estado.cidadeEvento}</p>}
              {estado.dataEvento && <p>Data: {estado.dataEvento}</p>}
            </Secao>
          )}

          {(estado.flores !== null || estado.iluminacao !== null) && (
            <Secao titulo="Decoração">
              {estado.flores !== null && <p>Flores: {estado.flores === false ? 'Sem flores' : 'Sim'}</p>}
              {estado.iluminacao && <p>Iluminação: {estado.iluminacao}</p>}
              {estado.velas !== null && <p>Velas: {estado.velas === false ? 'Sem velas' : 'Sim'}</p>}
            </Secao>
          )}

          {(estado.toalha || estado.loucas || estado.talheres) && (
            <Secao titulo="Mesa posta">
              {estado.toalha && <p>Toalha: {estado.toalha}</p>}
              {estado.loucas && <p>Louças: {estado.loucas}</p>}
              {estado.talheres && <p>Talheres: {estado.talheres}</p>}
            </Secao>
          )}
        </div>
      )}
    </div>
  );

  if (!visivel) return null;

  return (
    <>
      {/* Desktop: painel lateral fixo */}
      <aside
        style={{
          display: 'none',
          width: '320px',
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 'var(--z-sticky)',
        }}
        className="memorial-preview-desktop"
      >
        <style jsx>{`
          @media (min-width: 1024px) {
            .memorial-preview-desktop {
              display: block !important;
            }
          }
        `}</style>
        {conteudo}
      </aside>

      {/* Mobile: drawer via botão */}
      <div className="memorial-preview-mobile" style={{ display: 'block' }}>
        <style jsx>{`
          @media (min-width: 1024px) {
            .memorial-preview-mobile {
              display: none !important;
            }
          }
        `}</style>
        <button
          onClick={() => setMobileAberto(!mobileAberto)}
          aria-expanded={mobileAberto}
          aria-controls="memorial-preview-drawer"
          style={{
            position: 'fixed',
            bottom: 'var(--space-20)',
            right: 'var(--space-4)',
            zIndex: 'var(--z-sticky)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            backgroundColor: 'var(--color-brand)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {mobileAberto ? 'Fechar memorial' : 'Ver meu memorial'}
        </button>

        {mobileAberto && (
          <div
            id="memorial-preview-drawer"
            style={{
              position: 'fixed',
              inset: 0,
              top: '60px',
              backgroundColor: 'var(--color-surface)',
              zIndex: 'var(--z-modal)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {conteudo}
          </div>
        )}
      </div>
    </>
  );
}

MemorialPreview.propTypes = {
  estado: PropTypes.object.isRequired,
  visivel: PropTypes.bool,
};

export { MemorialPreview };