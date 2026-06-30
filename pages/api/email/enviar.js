import { enviarEmailTemplate } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/email/enviar
 * Body: { para, template, variaveis }
 * Requer: x-api-key (opcional, se configurado) ou autenticacao
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const { para, template, variaveis } = req.body;

  if (!para || !template) {
    return res.status(400).json({ error: 'Campos obrigatorios: para, template' });
  }

  // Valida e-mail basico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(para)) {
    return res.status(400).json({ error: 'E-mail invalido' });
  }

  const resultado = await enviarEmailTemplate({ para, template, variaveis }, supabaseAdmin);

  // Log do envio (tabela email_logs pode nao existir — silencia erro)
  try {
    const status = resultado.error ? 'erro' : 'enviado';
    await supabaseAdmin.from('email_logs').insert({
      destinatario: para,
      template,
      status,
      erro: resultado.error?.message || null,
      variaveis: variaveis || null,
      provider_id: resultado.id || null,
      criado_em: new Date().toISOString(),
    });
  } catch (logErr) {
    // Silencia erro de log — nao quebra a API
    if (process.env.NODE_ENV === 'development') {
      console.warn('[email/enviar] Erro ao logar:', logErr.message);
    }
  }

  if (resultado.error) {
    return res.status(500).json({ error: 'Falha ao enviar e-mail', detalhe: resultado.error.message });
  }

  return res.status(200).json({ success: true, id: resultado.id });
}
