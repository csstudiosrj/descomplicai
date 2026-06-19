import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fornecedorId } = req.body;
  if (!fornecedorId) {
    return res.status(400).json({ erro: 'fornecedorId obrigatorio' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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

  res.status(200).json({ sucesso: true, assinadoEm: new Date().toISOString(), ip });
}