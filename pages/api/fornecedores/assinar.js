import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

    const { fornecedorId } = req.body;
    if (!fornecedorId) {
      return res.status(400).json({ erro: 'fornecedorId obrigatório' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verifica se o fornecedor existe
    const { data: fornecedor, error: findError } = await supabaseAdmin
      .from('fornecedores')
      .select('id, nome, contrato_assinado_em')
      .eq('id', fornecedorId)
      .single();

    if (findError || !fornecedor) {
      return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    }

    // Verifica se já foi assinado
    if (fornecedor.contrato_assinado_em) {
      return res.status(400).json({ erro: 'Contrato já foi assinado anteriormente' });
    }

    // Grava a assinatura
    const { error } = await supabaseAdmin
      .from('fornecedores')
      .update({
        contrato_assinado_em: new Date().toISOString(),
        contrato_assinado_ip: ip,
        contrato_assinado_ua: ua,
      })
      .eq('id', fornecedorId);

    if (error) {
      console.error('Erro ao assinar:', error);
      return res.status(500).json({ erro: 'Erro ao gravar assinatura' });
    }

    res.status(200).json({
      sucesso: true,
      assinadoEm: new Date().toISOString(),
      fornecedor: fornecedor.nome,
      ip,
    });
  } catch (error) {
    console.error('Erro em fornecedores/assinar:', error.message);
    return res.status(500).json({
      error: 'Erro interno do servidor. Tente novamente.',
    });
  }
}
