// pages/api/cron/lembrete-trial.js
// Envia lembrete de expiração de trial para fornecedores

import { createClient } from '@supabase/supabase-js';
import { enviarEmail } from '../../../lib/email';

const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req, res) {
  // Proteção por header
  if (req.headers['x-cron-secret'] !== CRON_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const hoje = new Date();
  const daqui3Dias = new Date(hoje);
  daqui3Dias.setDate(hoje.getDate() + 3);

  try {
    // Busca fornecedores com trial expirando entre hoje e hoje+3
    const { data: fornecedores, error } = await supabaseAdmin
      .from('fornecedores')
      .select('id, nome, nome_fantasia, email, trial_expira_em')
      .eq('status', 'trial')
      .gte('trial_expira_em', hoje.toISOString())
      .lte('trial_expira_em', daqui3Dias.toISOString());

    if (error) throw error;

    const resultados = [];

    for (const f of fornecedores || []) {
      const diasRestantes = Math.ceil(
        (new Date(f.trial_expira_em) - hoje) / (1000 * 60 * 60 * 24)
      );

      const nome = f.nome_fantasia || f.nome || 'Fornecedor';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f59e0b;">⏰ Seu trial expira em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}</h2>
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Seu período de teste gratuito no Descomplicaí expira em <strong>${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}</strong> (${new Date(f.trial_expira_em).toLocaleDateString('pt-BR')}).</p>
          <p>Para continuar aparecendo na vitrine e recebendo leads, renove seu plano agora:</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br'}/fornecedor/painel" 
             style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Renovar plano
          </a>
          <p style="color: #666; font-size: 14px;">Dúvidas? Responda este e-mail ou entre em contato pelo painel.</p>
        </div>
      `;

      const { id: emailId, error: emailError } = await enviarEmail({
        para: f.email,
        assunto: `Seu trial expira em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} — Renove agora`,
        html,
        texto: `Olá ${nome}! Seu trial expira em ${diasRestantes} dia(s). Renove em ${process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br'}/fornecedor/painel`,
      });

      // Log no banco
      await supabaseAdmin.from('email_logs').insert({
        destinatario: f.email,
        template: 'lembrete_trial',
        status: emailError ? 'erro' : 'enviado',
        erro: emailError?.message || null,
        variaveis: { fornecedor_id: f.id, dias_restantes: diasRestantes },
        provider_id: emailId || null,
      });

      resultados.push({
        fornecedor_id: f.id,
        email: f.email,
        dias_restantes: diasRestantes,
        status: emailError ? 'erro' : 'enviado',
      });
    }

    return res.status(200).json({
      success: true,
      enviados: resultados.filter((r) => r.status === 'enviado').length,
      erros: resultados.filter((r) => r.status === 'erro').length,
      detalhes: resultados,
    });
  } catch (err) {
    console.error('[CRON] lembrete-trial erro:', err);
    return res.status(500).json({ error: 'Erro interno', detalhe: err.message });
  }
}
