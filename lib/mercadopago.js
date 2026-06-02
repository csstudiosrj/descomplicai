/**
 * Configuração do cliente Mercado Pago
 * @module lib/mercadopago
 */

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

/**
 * Cria preferência de pagamento
 * @param {Object} params — { titulo, preco, quantidade = 1, externalReference }
 * @returns {Promise<{id: string, init_point: string}>}
 */
export async function criarPreferencia({ titulo, preco, quantidade = 1, externalReference }) {
  if (!MP_ACCESS_TOKEN) {
    console.warn('MP_ACCESS_TOKEN não configurado');
    throw new Error('Mercado Pago não configurado');
  }

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [{ title: titulo, unit_price: preco, quantity: quantidade, currency_id: 'BRL' }],
      external_reference: externalReference,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL || ''}/painel?status=sucesso`,
        failure: `${process.env.NEXT_PUBLIC_URL || ''}/painel?status=falha`,
        pending: `${process.env.NEXT_PUBLIC_URL || ''}/painel?status=pending`,
      },
      auto_return: 'approved',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mercado Pago erro: ${err}`);
  }

  return res.json();
}

/**
 * Verifica status de pagamento
 * @param {string} paymentId
 * @returns {Promise<Object>}
 */
export async function verificarPagamento(paymentId) {
  if (!MP_ACCESS_TOKEN) throw new Error('Mercado Pago não configurado');

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
  });

  if (!res.ok) throw new Error('Erro ao verificar pagamento');
  return res.json();
}