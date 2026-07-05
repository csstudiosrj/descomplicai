/**
 * lib/uploadthing.js
 * Utilitários de compressão de imagem para upload.
 * Upload em si é feito via SDK @uploadthing/react (ImageUpload.jsx).
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
