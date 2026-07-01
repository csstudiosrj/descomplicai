import { withRateLimit, cadastroLimiter } from "../../lib/ratelimit";
import { gerarMemorialLocal } from '../../../utils/gerador-templates';
import { supabase } from '../../../lib/supabase';
import { trackServerEvent } from '../../../utils/trackServerEvent';

async function _handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ erro: 'Método não permitido' });
    }

    const dados = req.body;

    if (!dados || Object.keys(dados).length === 0) {
      return res.status(400).json({ erro: 'Dados do memorial não fornecidos' });
    }

    const memorial = gerarMemorialLocal(dados);

    // Track analytics
    await trackServerEvent({
      tipo: 'acao',
      categoria: 'memorial',
      acao: 'gerado_ia',
      usuario_id: user.id,
      req,
    });

    return res.status(200).json({ sucesso: true, memorial });
  } catch (error) {
    console.error('Erro em ia/gerar-memorial:', error.message);
    return res.status(500).json({
      erro: 'Erro interno do servidor. Tente novamente.',
    });
  }
}

// Rate limit: cadastroLimiter
export default withRateLimit(_handler, cadastroLimiter);
