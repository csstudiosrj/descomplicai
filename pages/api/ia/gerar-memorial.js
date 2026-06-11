// pages/api/ia/gerar-memorial.js
import { gerarMemorialLocal } from '../../../utils/gerador-templates';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const dados = req.body;

  if (!dados || Object.keys(dados).length === 0) {
    return res.status(400).json({ erro: 'Dados do memorial não fornecidos' });
  }

  try {
    const memorial = gerarMemorialLocal(dados);
    return res.status(200).json({ sucesso: true, memorial });
  } catch (erro) {
    console.error('Erro ao gerar memorial:', erro.message);
    return res.status(500).json({ erro: 'Erro ao gerar memorial', detalhe: erro.message });
  }
}