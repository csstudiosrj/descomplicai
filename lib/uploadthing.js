/**
 * lib/uploadthing.js
 * Utilitarios de compressao de imagem e upload server-side via UploadThing v7.
 */

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

export async function comprimirPerfil(file) {
  return comprimirImagem(file, 800, 800, 0.85, 200);
}

export async function comprimirReferencia(file) {
  return comprimirImagem(file, 1600, 1600, 0.9, 500);
}

/**
 * Upload de Buffer server-side via UploadThing v7 (UTApi)
 * SERVER-SIDE ONLY — usa process.env.UPLOADTHING_TOKEN
 * @param {Buffer} buffer
 * @param {string} fileName
 * @param {string} fileType
 * @returns {Promise<{url: string}>}
 */
export async function uploadBuffer(buffer, fileName, fileType) {
  const { UTApi } = await import('uploadthing/server');
  const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

  const file = new File([buffer], fileName, { type: fileType });
  const res = await utapi.uploadFiles(file);

  if (!res || !res[0] || res[0].error) {
    throw new Error(res?.[0]?.error?.message || 'Falha no upload do buffer');
  }

  return { url: res[0].url };
}
