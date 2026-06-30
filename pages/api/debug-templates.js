import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const templates = [
    'email_template_bem_vindo_casal',
    'email_template_bem_vindo_fornecedor',
    'email_template_convite_colaborador',
    'email_template_recuperacao_senha',
    'email_template_lembrete_pagamento',
  ];
  
  const resultados = [];
  
  for (const t of templates) {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('chave')
      .eq('chave', t)
      .maybeSingle();
    
    resultados.push({
      template: t,
      data: data,
      error: error ? error.message : null,
      hasChave: data ? !!data.chave : false,
    });
  }
  
  res.status(200).json({ resultados });
}