/**
 * API Route: /api/uploadthing
 * Rota compativel com UploadThing v7+ (moderno)
 * Usa presigned URLs para upload direto
 * 
 * POST /api/uploadthing — gera presigned URL
 * Body: { filename: string, filetype: string, filesize: number }
 * Response: { url: string, fields: object }
 */

import { gerarPresignedURL } from '../../lib/uploadthing';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  try {
    const { filename, filetype, filesize } = req.body;

    if (!filename || !filetype) {
      return res.status(400).json({ 
        erro: 'filename e filetype sao obrigatorios' 
      });
    }

    // Valida tipo de arquivo permitido
    const tiposPermitidos = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
    ];

    if (!tiposPermitidos.includes(filetype)) {
      return res.status(400).json({ 
        erro: `Tipo de arquivo nao permitido: ${filetype}` 
      });
    }

    const resultado = await gerarPresignedURL(filename, filetype, filesize || 0);

    return res.status(200).json(resultado);
  } catch (err) {
    console.error('[API uploadthing] Erro:', err);
    return res.status(500).json({ 
      erro: err.message || 'Erro interno ao gerar URL de upload' 
    });
  }
}
