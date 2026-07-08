// lib/mercadopago.js
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import crypto from 'crypto';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

/**
 * Verifica a assinatura do webhook do Mercado Pago.
 * 
 * O Mercado Pago envia o header x-signature no formato:
 *   ts=<timestamp>,v1=<signature>
 *
 * O template OFICIAL da assinatura é:
 *   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 *
 * @param {object} req - Request do Next.js (body já parseado)
 * @param {string} secret - Webhook secret configurado no painel do Mercado Pago
 * @returns {boolean} true se assinatura válida
 */
export function verificarAssinaturaWebhook(req, secret) {
  const signature = req.headers['x-signature'] || req.headers['X-Signature'];
  if (!signature || typeof signature !== 'string') {
    return false;
  }

  // Parse ts e v1 do header
  const parts = signature.split(',');
  let ts = null;
  let v1 = null;

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith('ts=')) {
      ts = trimmed.slice(3);
    } else if (trimmed.startsWith('v1=')) {
      v1 = trimmed.slice(3);
    }
  }

  if (!ts || !v1) {
    return false;
  }

  // Extrai data.id e x-request-id
  const dataId = req.body?.data?.id || req.query?.['data.id'] || req.body?.data_id || req.query?.data_id;
  const requestId = req.headers['x-request-id'] || req.headers['X-Request-Id'];

  if (!dataId) {
    return false;
  }

  // Template OFICIAL do Mercado Pago
  const template = requestId 
    ? `id:${dataId};request-id:${requestId};ts:${ts};`
    : `id:${dataId};ts:${ts};`;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(template)
    .digest('hex');

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(v1, 'hex'));
  } catch {
    return hash === v1;
  }
}

/**
 * Validação de segurança do webhook.
 * 
 * Se MERCADOPAGO_WEBHOOK_SECRET estiver configurado, valida assinatura.
 * Se não estiver, loga warning e permite passar (validação via API continua).
 * 
 * Em ambiente de desenvolvimento/teste, se não houver x-signature (simulação do MP),
 * aceita a requisição com log de aviso.
 *
 * @param {object} req
 * @param {object} res
 * @returns {boolean} false se bloqueou (res já enviada), true se pode continuar
 */
export function validarWebhookSeguro(req, res) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    console.warn(
      '[WEBHOOK] MERCADOPAGO_WEBHOOK_SECRET não configurado. ' +
      'Webhook vulnerável a requisições falsas. Configure no painel do Mercado Pago e na Vercel.'
    );
    return true;
  }

  const signature = req.headers['x-signature'] || req.headers['X-Signature'];
  
  // Fallback para teste do Mercado Pago: simulação pode não enviar x-signature
  if (!signature && process.env.NODE_ENV !== 'production') {
    console.warn(
      '[WEBHOOK] x-signature ausente em ambiente NÃO-PRODUÇÃO. ' +
      'Aceitando requisição (modo teste). Em produção a assinatura será obrigatória.'
    );
    return true;
  }

  const valido = verificarAssinaturaWebhook(req, secret);
  if (!valido) {
    console.error('[WEBHOOK] Assinatura inválida. Requisição rejeitada.');
    res.status(401).json({ erro: 'Assinatura do webhook inválida' });
    return false;
  }

  return true;
}

export { client, Preference, Payment };