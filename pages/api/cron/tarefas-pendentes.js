// pages/api/cron/tarefas-pendentes.js
// Envia alerta de tarefas atrasadas para casais

import { createClient } from '@supabase/supabase-js';
import { enviarEmail } from '../../../lib/email';

const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req, res) {
  if (req.headers['x-cron-secret'] !== CRON_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const hoje = new Date().toISOString().split('T')[0];

  try {
    const { data: tarefasAtrasadas, error } = await supabaseAdmin
      .from('tarefas')
      .select('id, titulo, descricao, prazo, evento_id, usuario_id, eventos:evento_id(nome_evento, data_evento)')
      .lt('prazo', hoje)
      .eq('concluida', false)
      .order('prazo', { ascending: true });

    if (error) throw error;

    const porUsuario = {};
    for (const t of tarefasAtrasadas || []) {
      const uid = t.usuario_id;
      if (!porUsuario[uid]) porUsuario[uid] = { tarefas: [], evento: t.eventos };
      porUsuario[uid].tarefas.push(t);
    }

    const resultados = [];

    for (const [usuarioId, dados] of Object.entries(porUsuario)) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(usuarioId);
      const email = userData?.user?.email;
      if (!email) continue;

      const nomeEvento = dados.evento?.nome_evento || 'seu casamento';
      const dataEvento = dados.evento?.data_evento
        ? new Date(dados.evento.data_evento).toLocaleDateString('pt-BR')
        : null;

      const listaTarefas = dados.tarefas
        .map(t => `<li style="margin-bottom:8px;padding:12px;background:#fef3c7;border-radius:6px;"><strong>${t.titulo}</strong>${t.descricao ? '<br/><span style="color:#666;font-size:13px;">' + t.descricao + '</span>' : ''}<br/><span style="color:#b45309;font-size:12px;">Vencida em: ${new Date(t.prazo).toLocaleDateString('pt-BR')}</span></li>`)
        .join('');

      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#dc2626;">⚠️ Você tem tarefas atrasadas</h2>
        <p>Olá!</p>
        <p>Identificamos <strong>${dados.tarefas.length} tarefa${dados.tarefas.length > 1 ? 's' : ''} atrasada${dados.tarefas.length > 1 ? 's' : ''}</strong> no planejamento de <strong>${nomeEvento}</strong>${dataEvento ? ' (' + dataEvento + ')' : ''}.</p>
        <ul style="list-style:none;padding:0;">${listaTarefas}</ul>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br'}/painel/checklist" style="display:inline-block;background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Ver checklist</a>
        <p style="color:#666;font-size:14px;">Não deixe o planejamento acumular. Cada tarefa concluída é um passo mais perto do grande dia! 💍</p>
      </div>`;

      const { id: emailId, error: emailError } = await enviarEmail({
        para: email,
        assunto: `⚠️ ${dados.tarefas.length} tarefa${dados.tarefas.length > 1 ? 's' : ''} atrasada${dados.tarefas.length > 1 ? 's' : ''} — ${nomeEvento}`,
        html,
        texto: `Você tem ${dados.tarefas.length} tarefa(s) atrasada(s) no planejamento de ${nomeEvento}. Acesse ${process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br'}/painel/checklist`,
      });

      await supabaseAdmin.from('email_logs').insert({
        destinatario: email,
        template: 'tarefas_pendentes',
        status: emailError ? 'erro' : 'enviado',
        erro: emailError?.message || null,
        variaveis: { usuario_id: usuarioId, total_tarefas: dados.tarefas.length },
        provider_id: emailId || null,
      });

      resultados.push({ usuario_id: usuarioId, email, total_tarefas: dados.tarefas.length, status: emailError ? 'erro' : 'enviado' });
    }

    return res.status(200).json({
      success: true,
      casais_notificados: resultados.filter(r => r.status === 'enviado').length,
      erros: resultados.filter(r => r.status === 'erro').length,
      detalhes: resultados,
    });
  } catch (err) {
    console.error('[CRON] tarefas-pendentes erro:', err);
    return res.status(500).json({ error: 'Erro interno', detalhe: err.message });
  }
}
