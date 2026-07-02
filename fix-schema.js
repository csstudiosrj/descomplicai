const fs = require('fs');

const path = './supabase/schema.sql';
let content = fs.readFileSync(path, 'utf8');

const policiesBlock = `

-- ============================================================
-- SERVICE_ROLE BYPASS POLICIES (APIs server-side)
-- ============================================================

CREATE POLICY "service_role_bypass_admins" ON public.admins FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_analytics" ON public.analytics_eventos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_avaliacoes" ON public.avaliacoes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_assistente_permissoes" ON public.cerimonialista_assistente_permissoes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_assistentes" ON public.cerimonialista_assistentes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_financeiro" ON public.cerimonialista_financeiro FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_favoritos" ON public.cerimonialista_fornecedores_favoritos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_leads" ON public.cerimonialista_leads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_modelos" ON public.cerimonialista_modelos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_permissoes" ON public.cerimonialista_permissoes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_roteiro" ON public.cerimonialista_roteiro_itens FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_cerimonialistas" ON public.cerimonialistas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_chat" ON public.chat_mensagens FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_cliques" ON public.cliques_fornecedor FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_colaboradores" ON public.colaboradores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_configuracoes" ON public.configuracoes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_contratos" ON public.contratos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_convidados" ON public.convidados FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_cronograma" ON public.cronograma FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_eventos" ON public.eventos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_financeiro_casal" ON public.financeiro FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_fornecedores" ON public.fornecedores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_forn_plat" ON public.fornecedores_plataforma FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_grupos" ON public.grupos_convidados FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_memoriais" ON public.memoriais FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_mensagens" ON public.mensagens FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_mesas" ON public.mesas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_mesas_backup" ON public.mesas_backup FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_mesas_tipos" ON public.mesas_tipos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_metricas" ON public.metricas_fornecedor FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_pagamentos" ON public.pagamentos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_tarefas" ON public.tarefas FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

`;

const insertPoint = content.indexOf('-- ============================================================\n-- MIGRATION: Campos de upload');

if (insertPoint === -1) {
  console.log('ERRO: nao achei o ponto de insercao');
  process.exit(1);
}

content = content.slice(0, insertPoint) + policiesBlock + content.slice(insertPoint);

fs.writeFileSync(path, content);
console.log('schema.sql atualizado');