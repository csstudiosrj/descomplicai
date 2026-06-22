// utils/sincronizarFinanceiro.js
// Sincroniza fornecedor com financeiro automaticamente.
// CHAMAR SEMPRE NO BACKEND (API route), NUNCA DO FRONTEND.
// Uso: await sincronizarFornecedorComFinanceiro(fornecedor, supabaseAdmin)

/**
 * Sincroniza um fornecedor com a tabela financeiro.
 * Regras:
 * - Status "contratado" -> cria despesa (sincronizada)
 * - Status "pago" -> marca como pago
 * - Valor editado -> atualiza valor_estimado
 * - Fornecedor excluido -> marca fornecedor_excluido = true
 *
 * @param {Object} fornecedor — objeto completo do fornecedor
 * @param {Object} supabaseAdmin — cliente supabase com service_role_key
 */
export async function sincronizarFornecedorComFinanceiro(fornecedor, supabaseAdmin) {
  if (!fornecedor || !supabaseAdmin) {
    throw new Error('fornecedor e supabaseAdmin sao obrigatorios');
  }

  const { id, evento_id, usuario_id, nome, categoria, categoria_principal, valor_total, status } = fornecedor;

  // Busca se ja existe despesa sincronizada para este fornecedor
  const { data: existente } = await supabaseAdmin
    .from('financeiro')
    .select('*')
    .eq('fornecedor_origem_id', id)
    .eq('sincronizado', true)
    .single();

  // Se fornecedor foi excluido (status = null ou flag de exclusao)
  if (fornecedor._excluido) {
    if (existente) {
      await supabaseAdmin
        .from('financeiro')
        .update({ fornecedor_excluido: true })
        .eq('id', existente.id);
    }
    return { acao: 'marcado_excluido' };
  }

  const payload = {
    evento_id,
    usuario_id,
    descricao: nome || 'Fornecedor',
    categoria_principal: categoria_principal || 'outro',
    categoria: categoria || 'outro',
    valor_estimado: Number(valor_total) || 0,
    valor_real: status === 'pago' ? Number(valor_total) || 0 : (existente?.valor_real || 0),
    pago: status === 'pago',
    fornecedor_origem_id: id,
    sincronizado: true,
    fornecedor_excluido: false,
  };

  if (existente) {
    // Atualiza despesa existente
    const { error } = await supabaseAdmin
      .from('financeiro')
      .update(payload)
      .eq('id', existente.id);

    if (error) throw error;
    return { acao: 'atualizado', financeiroId: existente.id };
  } else if (status === 'contratado' || status === 'pago') {
    // Cria nova despesa sincronizada
    const { data, error } = await supabaseAdmin
      .from('financeiro')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { acao: 'criado', financeiroId: data.id };
  }

  return { acao: 'nenhuma' };
}

/**
 * Marca despesa como excluida quando fornecedor eh deletado.
 * Chamada no DELETE do fornecedor.
 */
export async function marcarDespesaComoExcluida(fornecedorId, supabaseAdmin) {
  const { error } = await supabaseAdmin
    .from('financeiro')
    .update({ fornecedor_excluido: true })
    .eq('fornecedor_origem_id', fornecedorId);

  if (error) throw error;
  return { acao: 'marcado_excluido' };
}