/**
 * ImageUpload.jsx
 * Componente generico de upload de imagens com compressao e preview
 * Usa UploadThing (lib/uploadthing.js) no backend
 * 
 * Props:
 * - onUpload: (urls: string[]) => void — chamado quando upload completa
 * - onError: (erro: string) => void — chamado em erro
 * - maxFiles: number — maximo de arquivos (padrao: 1)
 * - maxSizeMB: number — tamanho maximo antes da compressao (padrao: 10)
 * - tipo: 'perfil' | 'referencia' | 'galeria' — define compressao
 * - label: string — texto do label
 * - accept: string — tipos aceitos (padrao: 'image/*')
 * - urlsExistentes: string[] — URLs ja existentes (edicao)
 * - onRemoverExistente: (url: string) => void — remover URL existente
 */

import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { uploadArquivo, uploadMultiplo } from '../../lib/uploadthing';
import Icon from './Icon';

export default function ImageUpload({
  onUpload,
  onError,
  maxFiles = 1,
  maxSizeMB = 10,
  tipo = 'referencia',
  label = 'Selecionar imagem',
  accept = 'image/*',
  urlsExistentes = [],
  onRemoverExistente,
}) {
  const [arquivos, setArquivos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });
  const inputRef = useRef(null);

  const gerarPreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Valida quantidade
    const total = urlsExistentes.length + arquivos.length + files.length;
    if (total > maxFiles) {
      onError?.(`Maximo de ${maxFiles} ${maxFiles === 1 ? 'imagem' : 'imagens'} permitidas.`);
      return;
    }

    // Valida tamanho
    const arquivosGrandes = files.filter(f => f.size > maxSizeMB * 1024 * 1024);
    if (arquivosGrandes.length > 0) {
      onError?.(`Arquivo(s) excedem ${maxSizeMB}MB. Selecione arquivo(s) menor(es).`);
      return;
    }

    // Gera previews
    const novosPreviews = await Promise.all(files.map(gerarPreview));

    setArquivos(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...novosPreviews]);
  }, [arquivos, urlsExistentes, maxFiles, maxSizeMB, onError]);

  const handleUpload = useCallback(async () => {
    if (!arquivos.length) return;

    setUploading(true);
    setProgresso({ atual: 0, total: arquivos.length });

    try {
      const onProgress = ({ atual, total }) => {
        setProgresso({ atual, total });
      };

      const resultados = await uploadMultiplo(arquivos, { tipo }, onProgress);
      const urls = resultados.map(r => r.url);

      onUpload?.(urls);

      // Limpa estado
      setArquivos([]);
      setPreviews([]);
      setProgresso({ atual: 0, total: 0 });
    } catch (err) {
      console.error('Erro no upload:', err);
      onError?.(err.message || 'Erro ao fazer upload. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }, [arquivos, tipo, onUpload, onError]);

  const handleRemover = useCallback((index) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoverExistente = useCallback((url) => {
    onRemoverExistente?.(url);
  }, [onRemoverExistente]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const totalImagens = urlsExistentes.length + arquivos.length;
  const podeAdicionar = totalImagens < maxFiles;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Label */}
      {label && (
        <label style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-text-primary)',
        }}>
          {label}
          {maxFiles > 1 && (
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-normal)' }}>
              {' '}({totalImagens}/{maxFiles})
            </span>
          )}
        </label>
      )}

      {/* Area de upload */}
      {podeAdicionar && (
        <div
          onClick={handleClick}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-brand)'; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--color-border)';
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            if (files.length) {
              const event = { target: { files } };
              handleFileChange(event);
            }
          }}
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
            accept={accept}
            multiple={maxFiles > 1}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Selecionar arquivo de imagem"
          />
          <Icon name="upload" size={32} color="var(--color-text-muted)" />
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-2)',
          }}>
            Clique ou arraste imagens aqui
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-1)',
          }}>
            {tipo === 'perfil' ? 'Max 200KB · 800x800px recomendado' : 'Max 500KB · JPEG, PNG, WebP'}
          </p>
        </div>
      )}

      {/* Previews — arquivos novos */}
      {previews.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 'var(--space-3)',
        }}>
          {previews.map((preview, index) => (
            <div key={index} style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              aspectRatio: '1',
              border: '1px solid var(--color-border)',
            }}>
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {!uploading && (
                <button
                  onClick={() => handleRemover(index)}
                  aria-label={`Remover imagem ${index + 1}`}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="close" size={12} color="#fff" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* URLs existentes */}
      {urlsExistentes.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 'var(--space-3)',
        }}>
          {urlsExistentes.map((url, index) => (
            <div key={`existente-${index}`} style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              aspectRatio: '1',
              border: '1px solid var(--color-border)',
            }}>
              <img
                src={url}
                alt={`Imagem existente ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <button
                onClick={() => handleRemoverExistente(url)}
                aria-label={`Remover imagem existente ${index + 1}`}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="close" size={12} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botao de upload */}
      {arquivos.length > 0 && !uploading && (
        <button
          onClick={handleUpload}
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
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <Icon name="upload" size={16} color="#fff" />
          Fazer upload ({arquivos.length} {arquivos.length === 1 ? 'arquivo' : 'arquivos'})
        </button>
      )}

      {/* Progresso */}
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
            Enviando... {progresso.atual} de {progresso.total}
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
              width: `${progresso.total > 0 ? (progresso.atual / progresso.total) * 100 : 0}%`,
              height: '100%',
              backgroundColor: 'var(--color-brand)',
              transition: 'width 300ms ease',
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

ImageUpload.propTypes = {
  onUpload: PropTypes.func,
  onError: PropTypes.func,
  maxFiles: PropTypes.number,
  maxSizeMB: PropTypes.number,
  tipo: PropTypes.oneOf(['perfil', 'referencia', 'galeria']),
  label: PropTypes.string,
  accept: PropTypes.string,
  urlsExistentes: PropTypes.arrayOf(PropTypes.string),
  onRemoverExistente: PropTypes.func,
};

export { ImageUpload };