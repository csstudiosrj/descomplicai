// pages/api/cron/resumo-semanal.js
// Resumo semanal para casais ativos — toda segunda 9h

import { createClient } from '@supabase/supabase-js';
import { enviarEmail } from '../../../lib/email';
import { emailIcon } from '../../../utils/emailIcons';

const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req, res) {
  if (req.headers['x-cron-secret'] !== CRON_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const hoje = new Date();
  const hojeIso = hoje.toISOString().split('T')[0];

  try {
    // Busca eventos ativos (com data futura ou nos últimos 30 dias)
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    const { data: eventos, error: errEventos } = await supabaseAdmin
      .from('eventos')
      .select('id, nome_evento, data_evento, usuario_id')
      .gte('data_evento', trintaDiasAtras.toISOString().split('T')[0])
      .order('data_evento', { ascending: true });

    if (errEventos) throw errEventos;

    const resultados = [];

    for (const ev of eventos || []) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(ev.usuario_id);
      const email = userData?.user?.email;
      if (!email) continue;

      const diasAteEvento = ev.data_evento
        ? Math.ceil((new Date(ev.data_evento) - hoje) / (1000 * 60 * 60 * 24))
        : null;

      // Tarefas do evento
      const { data: tarefas } = await supabaseAdmin
        .from('tarefas')
        .select('id, titulo, concluida, prazo')
        .eq('evento_id', ev.id);

      const totalTarefas = tarefas?.length || 0;
      const concluidas = tarefas?.filter(t => t.concluida).length || 0;
      const pendentes = totalTarefas - concluidas;
      const atrasadas = tarefas?.filter(t => !t.concluida && t.prazo && t.prazo < hojeIso).length || 0;

      // Próximas tarefas (prazo nos próximos 7 dias)
      const proximas = tarefas
        ?.filter(t => !t.concluida && t.prazo && t.prazo >= hojeIso && t.prazo <= new Date(hoje.getTime() + 7 * 86400000).toISOString().split('T')[0])
        .slice(0, 5) || [];

      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#f59e0b;">${emailIcon('calendar')} Resumo semanal — ${ev.nome_evento || 'Seu casamento'}</h2>
        ${diasAteEvento !== null ? `<p style="font-size:18px;">Faltam <strong style="color:#f59e0b;">${diasAteEvento} dia${diasAteEvento !== 1 ? 's' : ''}</strong> para o grande dia! ${emailIcon('sparkle')}</p>` : ''}
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
          <p><strong>Progresso do checklist:</strong></p>
          <div style="background:#e5e7eb;border-radius:4px;height:20px;overflow:hidden;margin:8px 0;">
            <div style="background:#f59e0b;height:100%;width:${totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0}%;"></div>
          </div>
          <p style="font-size:14px;color:#666;">${concluidas} de ${totalTarefas} tarefas concluídas ${emailIcon('check')} • ${pendentes} pendentes${atrasadas > 0 ? ` • <span style="color:#dc2626;">${atrasadas} atrasadas ${emailIcon('warning')}</span>` : ''}</p>
        </div>
        ${proximas.length > 0 ? `<h3 style="color:#374151;">Próximos passos (próximos 7 dias):</h3><ul style="padding-left:20px;">${proximas.map(t => `<li style="margin-bottom:6px;">${t.titulo} <span style="color:#666;font-size:12px;">(${new Date(t.prazo).toLocaleDateString('pt-BR')})</span></li>`).join('')}</ul>` : '<p style="color:#666;">Nenhuma tarefa com prazo nos próximos 7 dias. Aproveite para adiantar o planejamento! ' + emailIcon('sparkle') + '</p>'}
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br'}/painel" style="display:inline-block;background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Acessar painel</a>
        <p style="color:#666;font-size:12px;margin-top:20px;">Este é um resumo automático enviado toda segunda-feira. Boa semana de planejamento! ${emailIcon('rings')}</p>
      </div>`;

      const { id: emailId, error: emailError } = await enviarEmail({
        para: email,
        assunto: `Resumo semanal — ${ev.nome_evento || 'Seu casamento'}${diasAteEvento !== null ? ` (faltam ${diasAteEvento} dias)` : ''}`,
        html,
        texto: `Resumo semanal: ${concluidas}/${totalTarefas} tarefas concluídas. ${pendentes} pendentes${atrasadas > 0 ? ', ' + atrasadas + ' atrasadas' : ''}. Acesse ${process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br'}/painel`,
      });

      await supabaseAdmin.from('email_logs').insert({
        destinatario: email,
        template: 'resumo_semanal',
        status: emailError ? 'erro' : 'enviado',
        erro: emailError?.message || null,
        variaveis: { evento_id: ev.id, usuario_id: ev.usuario_id, dias_ate_evento: diasAteEvento },
        provider_id: emailId || null,
      });

      resultados.push({ evento_id: ev.id, email, status: emailError ? 'erro' : 'enviado' });
    }

    return res.status(200).json({
      success: true,
      casais_notificados: resultados.filter(r => r.status === 'enviado').length,
      erros: resultados.filter(r => r.status === 'erro').length,
      detalhes: resultados,
    });
  } catch (err) {
    console.error('[CRON] resumo-semanal erro:', err);
    return res.status(500).json({ error: 'Erro interno', detalhe: err.message });
  }
}