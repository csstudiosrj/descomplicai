const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Descomplicaí <naoresponder@descomplicai.com.br>';

async function enviarEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY não configurado');
    return { ok: false, erro: 'Email não configurado' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Erro Resend:', err);
      return { ok: false, erro: err };
    }
    return { ok: true, data: await res.json() };
  } catch (err) {
    console.error('Exceção Resend:', err);
    return { ok: false, erro: err.message };
  }
}

export async function enviarEmailContratoParaFornecedor({ to, fornecedorNome, noivosNome, token }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://descomplicai.com';
  const link = `${baseUrl}/assinar/${token}`;
  const html = `
    <div style="font-family:Georgia,serif;color:#1A1714;max-width:560px;margin:0 auto;padding:32px;background:#F9F7F4;border-radius:16px;">
      <h2 style="color:#8B6F5E;font-weight:400;margin-top:0;">Olá, ${fornecedorNome}</h2>
      <p>Você recebeu um contrato de prestação de serviços do casamento de <strong>${noivosNome}</strong> via Descomplicaí.</p>
      <p>Para visualizar e assinar digitalmente, clique no botão abaixo:</p>
      <a href="${link}" style="display:inline-block;padding:14px 28px;background:#8B6F5E;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">Visualizar e assinar contrato</a>
      <p style="font-size:13px;color:#A89B91;margin-top:24px;">Se o botão não funcionar, copie e cole este link:<br>${link}</p>
    </div>
  `;
  return enviarEmail({ to, subject: `Contrato aguardando assinatura — ${noivosNome}`, html });
}

export async function enviarEmailAssinaturaNoivos({ to, fornecedorNome, noivosNome, contratoTipo }) {
  const html = `
    <div style="font-family:Georgia,serif;color:#1A1714;max-width:560px;margin:0 auto;padding:32px;background:#F9F7F4;border-radius:16px;">
      <h2 style="color:#10B981;font-weight:400;margin-top:0;">Contrato assinado ✓</h2>
      <p><strong>${fornecedorNome}</strong> assinou o contrato de <strong>${contratoTipo}</strong> para o casamento de ${noivosNome}.</p>
      <p>Acesse o painel para baixar o PDF assinado.</p>
    </div>
  `;
  return enviarEmail({ to, subject: `Contrato assinado por ${fornecedorNome}`, html });
}

export async function enviarEmailRecusaNoivos({ to, fornecedorNome, noivosNome, justificativa }) {
  const html = `
    <div style="font-family:Georgia,serif;color:#1A1714;max-width:560px;margin:0 auto;padding:32px;background:#F9F7F4;border-radius:16px;">
      <h2 style="color:#C62828;font-weight:400;margin-top:0;">Contrato recusado</h2>
      <p><strong>${fornecedorNome}</strong> recusou o contrato para o casamento de ${noivosNome}.</p>
      <div style="background:#FFEBEE;padding:12px 16px;border-radius:8px;border:1px solid #FFCDD2;margin-top:12px;">
        <p style="margin:0;font-size:13px;color:#C62828;"><strong>Justificativa:</strong> ${justificativa || 'Não informada'}</p>
      </div>
      <p style="margin-top:16px;">Acesse o painel para gerenciar este contrato.</p>
    </div>
  `;
  return enviarEmail({ to, subject: `Contrato recusado por ${fornecedorNome}`, html });
}