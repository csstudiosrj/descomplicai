/**
 * Configuração do cliente UploadThing
 * @module lib/uploadthing
 */

const UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET;
const UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID;

/**
 * Gera URL pré-assinada para upload direto
 * @param {string} fileName
 * @param {string} fileType
 * @returns {Promise<{url: string, fields: Object}>}
 */
export async function gerarPresignedURL(fileName, fileType) {
  if (!UPLOADTHING_SECRET) {
    console.warn('UPLOADTHING_SECRET não configurado');
    throw new Error('UploadThing não configurado');
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
      slug: 'contratos',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`UploadThing erro: ${err}`);
  }

  return res.json();
}

/**
 * Faz upload do arquivo para a URL pré-assinada (browser)
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
 * Faz upload de um Buffer direto da API (Node.js)
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