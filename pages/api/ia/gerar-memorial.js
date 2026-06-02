/**
 * API Route — Gera memorial completo via Claude AI
 * POST /api/ia/gerar-memorial
 * Body: { estado: Object (estado completo do memorial) }
 * Response: { memorial: string, fornecedores: string[] }
 */

import { montarMemorial } from '../../../utils/gerador-memorial';
import { gerarMemorialIA } from '../../../lib/claude';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { estado } = req.body;

    if (!estado || typeof estado !== 'object') {
      return res.status(400).json({ error: 'Estado do memorial é obrigatório.' });
    }

    // Validação mínima — precisa ter pelo menos estilo e data
    if (!estado.estilo || !estado.dataEvento) {
      return res.status(400).json({ error: 'Memorial incompleto. Complete pelo menos estilo e data.' });
    }

    const dadosMemorial = montarMemorial(estado);
    const resultado = await gerarMemorialIA(dadosMemorial);

    return res.status(200).json({
      sucesso: true,
      memorial: resultado.memorial,
      fornecedores: resultado.fornecedores,
    });
  } catch (erro) {
    console.error('[API gerar-memorial]', erro);
    return res.status(500).json({
      sucesso: false,
      erro: erro.message || 'Erro ao gerar memorial. Tente novamente.',
    });
  }
}