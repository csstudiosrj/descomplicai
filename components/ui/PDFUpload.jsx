/**
 * PDFUpload.jsx
 * Componente de upload de PDFs para contratos e anexos
 * Usa UploadThing v7 via @uploadthing/react (SDK oficial)
 *
 * Props:
 * - onUpload: (url: string) => void — chamado quando upload completa
 * - onError: (erro: string) => void — chamado em erro
 * - label: string — texto do label
 * - urlExistente: string — URL ja existente (edicao)
 * - onRemover: () => void — remover URL existente
 */

import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateReactHelpers } from '@uploadthing/react';
import Icon from './Icon';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/descomplicai';

const { useUploadThing } = generateReactHelpers({
  url: `${basePath}/api/uploadthing`,
});

export default function PDFUpload({
  onUpload,
  onError,
  label = 'Anexar PDF',
  urlExistente,
  onRemover,
}) {
  const [arquivo, setArquivo] = useState(null);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const { startUpload } = useUploadThing('pdfUploader', {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url;
      if (url) {
        onUpload?.(url);
      }
      setArquivo(null);
      setNomeArquivo('');
      setUploading(false);
    },
    onUploadError: (err) => {
      console.error('[UploadThing] Erro PDF:', err);
      onError?.(err.message || 'Erro ao fazer upload do PDF. Tente novamente.');
      setUploading(false);
    },
  });

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      onError?.('Apenas arquivos PDF sao permitidos.');
      return;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`Arquivo excede ${maxSizeMB}MB. Selecione um arquivo menor.`);
      return;
    }

    setArquivo(file);
    setNomeArquivo(file.name);
  }, [onError]);

  const handleUpload = useCallback(async () => {
    if (!arquivo) return;
    setUploading(true);
    try {
      await startUpload([arquivo]);
    } catch (err) {
      console.error('Erro no upload PDF:', err);
      onError?.(err.message || 'Erro ao fazer upload do PDF. Tente novamente.');
      setUploading(false);
    }
  }, [arquivo, startUpload, onError]);

  const handleRemover = useCallback(() => {
    setArquivo(null);
    setNomeArquivo('');
    onRemover?.();
  }, [onRemover]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-text-primary)',
        }}>
          {label}
        </label>
      )}

      {!arquivo && !urlExistente && (
        <div
          onClick={handleClick}
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 200ms ease',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Selecionar arquivo PDF"
          />
          <Icon name="fileText" size={32} color="var(--color-text-muted)" />
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-2)',
          }}>
            Clique para anexar PDF
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-1)',
          }}>
            Max 10MB · PDF
          </p>
        </div>
      )}

      {arquivo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-brand-lighter)',
          border: '1px solid var(--color-brand-light)',
        }}>
          <Icon name="fileText" size={20} color="var(--color-brand)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {nomeArquivo}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}>
              {(arquivo.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {!uploading && (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                onClick={handleUpload}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                }}
              >
                Enviar
              </button>
              <button
                onClick={handleRemover}
                aria-label="Remover arquivo"
                style={{
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <Icon name="close" size={16} color="var(--color-text-muted)" />
              </button>
            </div>
          )}
        </div>
      )}

      {uploading && (
        <div style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-brand-lighter)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-brand-dark)',
          }}>
            Enviando PDF...
          </p>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'var(--color-brand-light)',
            borderRadius: 'var(--radius-full)',
            marginTop: 'var(--space-2)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '60%',
              height: '100%',
              backgroundColor: 'var(--color-brand)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      )}

      {urlExistente && !arquivo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-success-light)',
          border: '1px solid var(--color-success)',
        }}>
          <Icon name="fileText" size={20} color="var(--color-success)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
            }}>
              PDF anexado
            </p>
            <a
              href={urlExistente}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-brand)',
                textDecoration: 'none',
              }}
            >
              Visualizar PDF
            </a>
          </div>
          <button
            onClick={handleRemover}
            aria-label="Remover PDF"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            <Icon name="close" size={16} color="var(--color-text-muted)" />
          </button>
        </div>
      )}
    </div>
  );
}

PDFUpload.propTypes = {
  onUpload: PropTypes.func,
  onError: PropTypes.func,
  label: PropTypes.string,
  urlExistente: PropTypes.string,
  onRemover: PropTypes.func,
};

export { PDFUpload };
