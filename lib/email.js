import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const REMETENTE_PADRAO = process.env.EMAIL_FROM || 'nao-responder@descomplicai.com.br';
const NOME_REMETENTE = process.env.EMAIL_FROM_NAME || 'Descomplicaí';

/**
 * Envia e-mail transacional via Resend
 * @param {string} para — e-mail do destinatário
 * @param {string} assunto — assunto do e-mail
 * @param {string} html — conteúdo HTML
 * @param {string} [texto] — conteúdo texto plano (fallback)
 * @returns {Promise<{id?:string, error?:Error}>}
 */
export async function enviarEmail({ para, assunto, html, texto }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('[EMAIL] RESEND_API_KEY não configurada');
    return { error: new Error('Provider de e-mail não configurado') };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${NOME_REMETENTE} <${REMETENTE_PADRAO}>`,
      to: para,
      subject: assunto,
      html,
      text: texto || '',
    });

    if (error) throw error;
    return { id: data?.id };
  } catch (err) {
    console.error('[EMAIL] Falha no envio:', err);
    return { error: err };
  }
}

/**
 * Envia e-mail usando template do banco + variáveis
 * @param {object} params
 * @param {string} params.para
 * @param {string} params.template — slug do template em configuracoes
 * @param {object} params.variaveis — { nome: 'João', link: '...' }
 * @param {object} supabase — cliente Supabase (service role)
 */
export async function enviarEmailTemplate({ para, template, variaveis = {} }, supabase) {
  // Busca template na tabela configuracoes
  const { data: cfg } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', `email_template_${template}`)
    .single();

  const { data: assuntoCfg } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', `email_assunto_${template}`)
    .single();

  let html = cfg?.valor || '';
  let assunto = assuntoCfg?.valor || 'Descomplicaí';

  // Substitui variáveis {{chave}}
  Object.entries(variaveis).forEach(([chave, valor]) => {
    const regex = new RegExp(`{{\s*${chave}\s*}}`, 'g');
    html = html.replace(regex, valor);
    assunto = assunto.replace(regex, valor);
  });

  return enviarEmail({ para, assunto, html });
}

export { resend, REMETENTE_PADRAO, NOME_REMETENTE };
