import { calcularNovaExpiracao } from '../../../utils/acesso'
import { createClient } from '@supabase/supabase-js'
import { trackServerEvent } from '../../../utils/trackServerEvent'
import { validarWebhookSeguro } from '../../../lib/mercadopago'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // ─── VALIDAÇÃO DE ASSINATURA DO WEBHOOK ───
  const podeContinuar = validarWebhookSeguro(req, res)
  if (!podeContinuar) return

  const { type, data } = req.body
  if (type !== 'payment') return res.status(200).end()

  try {
    // FIX: usa a mesma variável padronizada MP_ACCESS_TOKEN
    const mpToken = process.env.MP_ACCESS_TOKEN
    if (!mpToken) {
      console.error('[WEBHOOK] MP_ACCESS_TOKEN não configurado')
      return res.status(500).end()
    }

    // Busca payment direto na API REST do Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!mpResponse.ok) {
      const erroTexto = await mpResponse.text()
      const status = mpResponse.status

      // Se payment não existe (404), retorna 200 para o MP não reenviar
      if (status === 404) {
        return res.status(200).end()
      }

      console.error('Webhook: erro ao buscar payment na API MP', data.id, status, erroTexto)
      return res.status(500).end()
    }

    const pagamento = await mpResponse.json()

    if (pagamento.status !== 'approved') {
      return res.status(200).end()
    }

    // ─── Tratamento robusto do external_reference ───
    let ref = {}
    const extRef = pagamento.external_reference

    // FIX: detecta formato do external_reference
    if (extRef && typeof extRef === 'string' && extRef.trim() !== '') {
      if (extRef.startsWith('fornecedor_')) {
        // É pagamento de fornecedor — não processa aqui, retorna 200
        console.log('[WEBHOOK] Pagamento de fornecedor detectado. Ignorando neste endpoint.', extRef)
        return res.status(200).end()
      }

      if (extRef.startsWith('descomplicai_')) {
        // É pagamento do casal no novo formato — busca no banco
        try {
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          )

          const { data: pagamentoDb } = await supabaseAdmin
            .from('pagamentos')
            .select('usuario_id, evento_id, tipo, duracao_meses')
            .eq('external_reference', extRef)
            .single()

          if (pagamentoDb) {
            ref = {
              usuarioId: pagamentoDb.usuario_id,
              eventoId: pagamentoDb.evento_id,
              tipo: pagamentoDb.tipo,
              duracao_meses: pagamentoDb.duracao_meses,
            }
          } else {
            // Fallback: tenta extrair do próprio external_reference
            const parts = extRef.split('_')
            if (parts.length >= 3) {
              ref = {
                usuarioId: null,
                eventoId: parts[1],
                tipo: parts[2],
                duracao_meses: pagamento.metadata?.duracao_meses ?? 0,
              }
            }
          }
        } catch (e) {
          console.error('[WEBHOOK] Erro ao buscar pagamento no banco:', e)
          ref = { usuarioId: null, eventoId: null, tipo: null, raw: extRef }
        }
      } else {
        // Formato antigo (JSON) — tenta parsear para compatibilidade
        try {
          ref = JSON.parse(extRef)
        } catch (e) {
          ref = { usuarioId: null, eventoId: null, tipo: null, raw: extRef }
        }
      }
    } else if (extRef && typeof extRef === 'object') {
      ref = extRef
    }

    // ─── FALLBACK: link fixo (sem external_reference ou não reconhecido) ───
    if (!ref.eventoId || !ref.tipo) {
      const payerEmail = pagamento?.payer?.email
      const valor = pagamento?.transaction_amount

      if (payerEmail && valor) {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // Busca pagamento pendente mais recente com mesmo valor
        const { data: pagamentoDb } = await supabaseAdmin
          .from('pagamentos')
          .select('usuario_id, evento_id, tipo, duracao_meses')
          .eq('status', 'pendente')
          .eq('valor', valor)
          .order('criado_em', { ascending: false })
          .limit(1)
          .single()

        if (pagamentoDb) {
          ref = {
            usuarioId: pagamentoDb.usuario_id,
            eventoId: pagamentoDb.evento_id,
            tipo: pagamentoDb.tipo,
            duracao_meses: pagamentoDb.duracao_meses,
          }

          // Atualiza o external_reference do pagamento com o do MP
          await supabaseAdmin
            .from('pagamentos')
            .update({
              external_reference: pagamento.external_reference || `mp_${pagamento.id}`,
              atualizado_em: new Date().toISOString(),
            })
            .eq('id', pagamentoDb.id)
        }
      }
    }

    const { usuarioId, eventoId, tipo } = ref
    let duracaoMeses = pagamento.metadata?.duracao_meses ?? ref.duracao_meses ?? 0

    if (!eventoId || !tipo) {
      console.error('Webhook: nao foi possivel identificar pagamento', {
        external_reference: pagamento.external_reference,
        payer_email: pagamento?.payer?.email,
        valor: pagamento?.transaction_amount,
        payment_id: pagamento.id,
      })
      return res.status(200).end()
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
      console.error('Webhook: tipo desconhecido', tipo)
      return res.status(200).end()
    }

    await supabaseAdmin
      .from('eventos')
      .update({
        acesso_expira_em: novaExpiracao,
        acesso_iniciado_em: eventoAtual?.acesso_iniciado_em || new Date().toISOString(),
        plano: novoPlano,
      })
      .eq('id', eventoId)

    // Atualiza status do pagamento no banco
    await supabaseAdmin
      .from('pagamentos')
      .update({
        status: 'aprovado',
        mp_payment_id: String(pagamento.id),
        atualizado_em: new Date().toISOString(),
      })
      .eq('external_reference', pagamento.external_reference || `mp_${pagamento.id}`)

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
    // FIX: sempre retorna 200 para o MP não reenviar
    res.status(200).end()
  }
}