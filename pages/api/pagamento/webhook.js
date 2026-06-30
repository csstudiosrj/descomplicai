import { calcularNovaExpiracao } from '../../../utils/acesso'
import { createClient } from '@supabase/supabase-js'
import { trackServerEvent } from '../../../utils/trackServerEvent'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { type, data } = req.body
  if (type !== 'payment') return res.status(200).end()

  try {
    // Busca payment direto na API REST do Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!mpResponse.ok) {
      const erroTexto = await mpResponse.text()
      console.error('Webhook: erro ao buscar payment na API MP', data.id, erroTexto)
      return res.status(500).end()
    }

    const pagamento = await mpResponse.json()

    if (pagamento.status !== 'approved') {
      return res.status(200).end()
    }

    // ─── Tratamento robusto do external_reference ───
    let ref = {}
    const extRef = pagamento.external_reference

    if (extRef && typeof extRef === 'string' && extRef.trim() !== '') {
      try {
        ref = JSON.parse(extRef)
      } catch (e) {
        ref = { usuarioId: null, eventoId: null, tipo: null, raw: extRef }
      }
    } else if (extRef && typeof extRef === 'object') {
      ref = extRef
    }

    const { usuarioId, eventoId, tipo } = ref
    let duracaoMeses = pagamento.metadata?.duracao_meses ?? ref.duracao_meses ?? 0

    if (!usuarioId || !eventoId || !tipo) {
      console.error('Webhook: external_reference invalido', {
        external_reference: pagamento.external_reference,
        ref,
        payment_id: pagamento.id,
        metadata: pagamento.metadata,
      })
      return res.status(400).json({
        erro: 'external_reference invalido',
        external_reference: pagamento.external_reference,
        metadata: pagamento.metadata,
      })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: eventoAtual } = await supabaseAdmin
      .from('eventos')
      .select('acesso_expira_em, acesso_iniciado_em')
      .eq('id', eventoId)
      .single()

    let novaExpiracao
    let novoPlano

    if (tipo === 'assinatura') {
      novaExpiracao = calcularNovaExpiracao(eventoAtual?.acesso_expira_em, duracaoMeses)
      novoPlano = duracaoMeses === 1 ? 'mensal' : `${duracaoMeses}_meses`
    } else if (tipo === 'memorial_pdf') {
      novaExpiracao = calcularNovaExpiracao(eventoAtual?.acesso_expira_em, 7 / 30)
      novoPlano = 'pdf'
    } else {
      return res.status(400).json({ erro: 'tipo desconhecido', tipo })
    }

    await supabaseAdmin
      .from('eventos')
      .update({
        acesso_expira_em: novaExpiracao,
        acesso_iniciado_em: eventoAtual?.acesso_iniciado_em || new Date().toISOString(),
        plano: novoPlano,
      })
      .eq('id', eventoId)

    await supabaseAdmin.from('pagamentos').insert({
      usuario_id: usuarioId,
      evento_id: eventoId,
      tipo,
      valor: pagamento.transaction_amount,
      status: 'aprovado',
      mp_payment_id: String(pagamento.id),
      duracao_meses: duracaoMeses || null,
      aceite_termo_em: null,
    })

    // Track analytics
    await trackServerEvent({
      tipo: 'checkout',
      categoria: 'pagamento',
      acao: 'pagou',
      valor: pagamento.transaction_amount,
      usuario_id: usuarioId,
      evento_id: eventoId,
      req,
    })

    res.status(200).json({ sucesso: true, eventoId, tipo, plano: novoPlano })
  } catch (erro) {
    console.error('Webhook erro:', erro)
    res.status(500).json({ erro: erro.message })
  }
}
