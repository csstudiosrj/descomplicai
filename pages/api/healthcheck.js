import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const result = { ok: 0, fail: 0, checks: [] };
  const add = (status, msg) => {
    result.checks.push({ status, msg });
    status === 'ok' ? result.ok++ : result.fail++;
  };

  // 1. Supabase
  try {
    await supabase.from('fornecedores').select('id', { head: true }).limit(1);
    add('ok', 'Supabase conectado');
  } catch (e) {
    add('fail', `Supabase: ${e.message}`);
  }

  // 2. Colunas fornecedores
  const colunas = ['trial_expira_em', 'status', 'pagamento_status', 'plano', 'aprovado_em'];
  for (const c of colunas) {
    try {
      await supabase.from('fornecedores').select(c).limit(1);
      add('ok', `Coluna '${c}' existe`);
    } catch (e) {
      add('fail', `Coluna '${c}' faltando — rode migration 002`);
    }
  }

  // 3. Tabela email_logs
  try {
    await supabase.from('email_logs').select('id', { head: true }).limit(1);
    add('ok', 'Tabela email_logs existe');
  } catch (e) {
    add('fail', 'Tabela email_logs faltando — rode migration 001');
  }

  // 4. Templates de e-mail (CORRIGIDO: usa maybeSingle em vez de single)
  const templates = [
    'email_template_bem_vindo_casal',
    'email_template_bem_vindo_fornecedor',
    'email_template_convite_colaborador',
    'email_template_recuperacao_senha',
    'email_template_lembrete_pagamento',
  ];
  for (const t of templates) {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('chave')
      .eq('chave', t)
      .maybeSingle();
    if (data && data.chave) {
      add('ok', `Template '${t}' configurado`);
    } else {
      add('fail', `Template '${t}' faltando — rode migration 003`);
    }
  }

  // 5. Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.domains.list();
    add('ok', 'Resend autenticado');
  } catch (e) {
    add('fail', `Resend: ${e.message}`);
  }

  // 6. Mercado Pago
  if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    add('ok', 'Mercado Pago configurado');
  } else {
    add('fail', 'Mercado Pago faltando');
  }

  const status = result.fail > 0 ? 503 : 200;
  res.status(status).json(result);
}