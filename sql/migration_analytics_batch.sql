-- ============================================================
-- MIGRACAO: Otimizacoes de performance no Supabase
-- ============================================================

-- 1. Indice composto para batch de analytics (ja existe idx_analytics_tipo,
--    mas adicionamos indice para busca por sessao_id + criado_em DESC)
--    Ja existe: idx_analytics_sessao (sessao_id, criado_em DESC)

-- 2. Verifica se indice em fornecedores.categoria existe
--    Ja existe: idx_forn_plat_categoria

-- 3. Adiciona indice em analytics_eventos.evento_tipo para queries de batch
CREATE INDEX IF NOT EXISTS idx_analytics_evento_tipo 
ON public.analytics_eventos (evento_tipo, criado_em DESC);

-- 4. Indice para busca rapida de eventos por usuario e memorial
--    Ja existe: idx_eventos_usuario_id, idx_eventos_memoriais_id

-- 5. Indice para busca de fornecedores por status (vitrine)
CREATE INDEX IF NOT EXISTS idx_fornecedores_status_aprovado 
ON public.fornecedores (status, categoria) 
WHERE status = 'aprovado';

-- 6. Comenta sobre a tabela analytics_eventos
COMMENT ON TABLE public.analytics_eventos IS 'Eventos de analytics com batch de 30s/10 eventos no cliente';
