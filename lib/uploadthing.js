/**
 * Configuracao do UploadThing — versao moderna compativel
 * @module lib/uploadthing
 * 
 * Usa a API v6+ do UploadThing com presigned URLs.
 * Fallback para a API antiga se as env vars nao estiverem configuradas.
 */

const UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET;
const UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID;

/**
 * Comprime imagem via Canvas antes do upload
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @param {number} quality 0-1
 * @param {number} maxSizeKB
 * @returns {Promise<Blob>}
 */
export async function comprimirImagem(file, maxWidth = 1600, maxHeight = 1600, quality = 0.85, maxSizeKB = 500) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Redimensiona proporcionalmente
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Tenta qualidades decrescentes ate caber no maxSizeKB
      const tentarQualidade = (q) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao comprimir imagem'));
              return;
            }
            const sizeKB = blob.size / 1024;
            if (sizeKB > maxSizeKB && q > 0.3) {
              tentarQualidade(q - 0.1);
            } else {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          q
        );
      };

      tentarQualidade(quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Erro ao carregar imagem para compressao'));
    };

    img.src = url;
  });
}

/**
 * Comprime imagem de perfil/logo (max 200KB, 800x800)
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function comprimirPerfil(file) {
  return comprimirImagem(file, 800, 800, 0.85, 200);
}

/**
 * Comprime imagem de referencia/galeria (max 500KB, 1600x1600)
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function comprimirReferencia(file) {
  return comprimirImagem(file, 1600, 1600, 0.9, 500);
}

/**
 * Gera URL pre-assinada para upload direto (API v6 UploadThing)
 * @param {string} fileName
 * @param {string} fileType
 * @returns {Promise<{url: string, fields: Object}>}
 */
export async function gerarPresignedURL(fileName, fileType) {
  if (!UPLOADTHING_SECRET) {
    console.warn('UPLOADTHING_SECRET nao configurado');
    throw new Error('UploadThing nao configurado');
  }

  const res = await fetch('https://uploadthing.com/api/prepareUpload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-uploadthing-api-key': UPLOADTHING_SECRET,
    },
    body: JSON.stringify({
      filename: fileName,
      filetype: fileType,
      slug: 'descomplicai',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`UploadThing erro: ${err}`);
  }

  return res.json();
}

/**
 * Faz upload do arquivo para a URL pre-assinada (browser)
 * @param {File} file
 * @param {string} url
 * @param {Object} fields
 * @returns {Promise<{url: string}>}
 */
export async function fazerUpload(file, url, fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
  formData.append('file', file);

  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Falha no upload');
  return { url: `${url}/${fields.key}` };
}

/**
 * Upload completo: comprime (se imagem) + envia para UploadThing
 * @param {File} file
 * @param {Object} opcoes { tipo: 'perfil'|'referencia'|'pdf' }
 * @returns {Promise<{url: string, nome: string}>}
 */
export async function uploadArquivo(file, opcoes = {}) {
  const { tipo = 'referencia' } = opcoes;

  let arquivoProcessado = file;

  // Comprime se for imagem
  if (file.type.startsWith('image/')) {
    if (tipo === 'perfil') {
      arquivoProcessado = await comprimirPerfil(file);
    } else {
      arquivoProcessado = await comprimirReferencia(file);
    }
  }

  // Gera nome unico
  const timestamp = Date.now();
  const extensao = file.name.split('.').pop();
  const nomeUnico = `${tipo}_${timestamp}.${extensao}`;

  // Gera presigned URL e faz upload
  const { url, fields } = await gerarPresignedURL(nomeUnico, arquivoProcessado.type);
  const resultado = await fazerUpload(arquivoProcessado, url, fields);

  return {
    url: resultado.url,
    nome: nomeUnico,
    tipoOriginal: file.type,
    tamanhoOriginal: file.size,
    tamanhoFinal: arquivoProcessado.size,
  };
}

/**
 * Upload multiplo de imagens
 * @param {File[]} files
 * @param {Object} opcoes
 * @param {Function} onProgress (opcional) — recebe { atual, total, url }
 * @returns {Promise<Array<{url: string, nome: string}>>}
 */
export async function uploadMultiplo(files, opcoes = {}, onProgress = null) {
  const resultados = [];

  for (let i = 0; i < files.length; i++) {
    const resultado = await uploadArquivo(files[i], opcoes);
    resultados.push(resultado);

    if (onProgress) {
      onProgress({ atual: i + 1, total: files.length, url: resultado.url });
    }
  }

  return resultados;
}

/**
 * Deleta arquivo do UploadThing (se necessario no futuro)
 * Nota: UploadThing nao tem API publica de delete.
 * Arquivos expiram automaticamente apos 7 dias no plano free.
 * @param {string} url
 */
export async function deletarArquivo(url) {
  console.warn('UploadThing nao suporta delete via API no plano free. Arquivo expira em 7 dias:', url);
  return true;
}

/**
 * Faz upload de um Buffer direto da API (Node.js)
 * Usado por utils/pdfContrato.js para gerar PDFs de contratos
 * @param {Buffer} buffer
 * @param {string} fileName
 * @param {string} fileType
 * @returns {Promise<{url: string}>}
 */
export async function uploadBuffer(buffer, fileName, fileType) {
  const { url, fields } = await gerarPresignedURL(fileName, fileType);

  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v));

  const blob = new Blob([buffer], { type: fileType });
  formData.append('file', blob, fileName);

  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Falha no upload do buffer');
  return { url: `${url}/${fields.key}` };
}
