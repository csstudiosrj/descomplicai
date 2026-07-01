-- ============================================================
-- SCHEMA.SQL - Descomplicaí
-- Gerado em: 2026-06-30
-- Fiel ao banco de produção Supabase
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";

-- ============================================================
-- FUNÇÕES
-- ============================================================

CREATE OR REPLACE FUNCTION public.atualizar_media_avaliacoes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.fornecedores_plataforma
  SET 
    avaliacao_media = (
      SELECT COALESCE(AVG(nota), 0) 
      FROM public.avaliacoes 
      WHERE fornecedor_id = COALESCE(NEW.fornecedor_id, OLD.fornecedor_id)
    ),
    total_avaliacoes = (
      SELECT COUNT(*) 
      FROM public.avaliacoes 
      WHERE fornecedor_id = COALESCE(NEW.fornecedor_id, OLD.fornecedor_id)
    ),
    atualizado_em = now()
  WHERE id = COALESCE(NEW.fornecedor_id, OLD.fornecedor_id);

  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.atualizar_permissoes_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.atualizar_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.atualizado_em = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.dashboard_metrics()
 RETURNS TABLE(metrica text, valor bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 'casais_ativos'::text, COUNT(DISTINCT usuario_id)::bigint
  FROM public.eventos WHERE criado_em >= now() - interval '30 days'
  UNION ALL
  SELECT 'memoriais_completados', COUNT(*)::bigint
  FROM public.eventos WHERE memorial_concluido = true AND criado_em >= now() - interval '30 days'
  UNION ALL
  SELECT 'memoriais_abandonados', COUNT(*)::bigint
  FROM public.eventos WHERE memorial_concluido = false AND status = 'rascunho' AND criado_em >= now() - interval '30 days'
  UNION ALL
  SELECT 'fornecedores_cadastrados', COUNT(*)::bigint
  FROM public.fornecedores_plataforma
  UNION ALL
  SELECT 'fornecedores_pagantes', COUNT(*)::bigint
  FROM public.fornecedores_plataforma WHERE ativo = true AND plano != 'trial'
  UNION ALL
  SELECT 'cerimonialistas_ativos', COUNT(*)::bigint
  FROM public.cerimonialistas WHERE ativo = true
  UNION ALL
  SELECT 'receita_total_30d', COALESCE(SUM(valor)::bigint, 0)
  FROM public.pagamentos WHERE status = 'pago' AND criado_em >= now() - interval '30 days'
  UNION ALL
  SELECT 'total_pageviews_30d', COUNT(*)::bigint
  FROM public.analytics_eventos WHERE evento_tipo = 'pageview' AND criado_em >= now() - interval '30 days'
  UNION ALL
  SELECT 'total_logins_30d', COUNT(*)::bigint
  FROM public.analytics_eventos WHERE evento_tipo = 'acao' AND acao = 'login_sucesso' AND criado_em >= now() - interval '30 days';
END;
$function$;

CREATE OR REPLACE FUNCTION public.funil_checkout_ultimos_30_dias()
 RETURNS TABLE(etapa text, total bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 'checkout_iniciado'::text, COUNT(*)::bigint
  FROM public.analytics_eventos
  WHERE evento_tipo = 'checkout' AND acao = 'iniciou' AND criado_em >= now() - interval '30 days'
  UNION ALL
  SELECT 'checkout_pago', COUNT(*)::bigint
  FROM public.analytics_eventos
  WHERE evento_tipo = 'checkout' AND acao = 'pagou' AND criado_em >= now() - interval '30 days'
  UNION ALL
  SELECT 'checkout_falhou', COUNT(*)::bigint
  FROM public.analytics_eventos
  WHERE evento_tipo = 'checkout' AND acao = 'falhou' AND criado_em >= now() - interval '30 days';
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE usuario_id = p_user_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_colaborador_evento(p_evento_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.colaboradores c
    WHERE c.evento_id = p_evento_id
      AND c.email = auth.jwt() ->> 'email'
      AND c.ativo = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_colaborador_evento_editor(p_evento_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.colaboradores c
    WHERE c.evento_id = p_evento_id
      AND c.email = auth.jwt() ->> 'email'
      AND c.ativo = true
      AND c.permissao = 'editar'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_colaborador_evento_financeiro(p_evento_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.colaboradores c
    WHERE c.evento_id = p_evento_id
      AND c.email = auth.jwt() ->> 'email'
      AND c.ativo = true
      AND c.ver_financeiro = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_colaborador_evento_financeiro_editor(p_evento_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.colaboradores c
    WHERE c.evento_id = p_evento_id
      AND c.email = auth.jwt() ->> 'email'
      AND c.ativo = true
      AND c.ver_financeiro = true
      AND c.permissao = 'editar'
  );
$function$;

CREATE OR REPLACE FUNCTION public.memorial_abandono_ultimos_30_dias()
 RETURNS TABLE(step_id text, total_iniciaram bigint, total_completaram bigint, taxa_abandono numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH iniciados AS (
    SELECT ae.step_id, COUNT(DISTINCT ae.sessao_id) as cnt
    FROM public.analytics_eventos ae
    WHERE ae.evento_tipo = 'step_memorial'
      AND ae.acao = 'iniciou'
      AND ae.criado_em >= now() - interval '30 days'
    GROUP BY ae.step_id
  ),
  completados AS (
    SELECT ae.step_id, COUNT(DISTINCT ae.sessao_id) as cnt
    FROM public.analytics_eventos ae
    WHERE ae.evento_tipo = 'step_memorial'
      AND ae.acao = 'completou'
      AND ae.criado_em >= now() - interval '30 days'
    GROUP BY ae.step_id
  )
  SELECT 
    i.step_id,
    i.cnt as total_iniciaram,
    COALESCE(c.cnt, 0) as total_completaram,
    CASE 
      WHEN i.cnt = 0 THEN 0
      ELSE ROUND(((i.cnt - COALESCE(c.cnt, 0))::numeric / i.cnt) * 100, 2)
    END as taxa_abandono
  FROM iniciados i
  LEFT JOIN completados c ON i.step_id = c.step_id
  ORDER BY taxa_abandono DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.paginas_mais_acessadas(p_dias integer DEFAULT 30)
 RETURNS TABLE(pagina text, total_acessos bigint, usuarios_unicos bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ae.pagina,
    COUNT(*)::bigint as total_acessos,
    COUNT(DISTINCT ae.usuario_id)::bigint as usuarios_unicos
  FROM public.analytics_eventos ae
  WHERE ae.evento_tipo = 'pageview'
    AND ae.criado_em >= now() - (p_dias || ' days')::interval
    AND ae.pagina IS NOT NULL
  GROUP BY ae.pagina
  ORDER BY total_acessos DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.tempo_medio_por_pagina(p_dias integer DEFAULT 30)
 RETURNS TABLE(pagina text, tempo_medio_segundos numeric, total_sessoes bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ae.pagina,
    ROUND(AVG(ae.tempo_na_pagina)::numeric, 2) as tempo_medio_segundos,
    COUNT(*)::bigint as total_sessoes
  FROM public.analytics_eventos ae
  WHERE ae.evento_tipo = 'tempo'
    AND ae.criado_em >= now() - (p_dias || ' days')::interval
    AND ae.pagina IS NOT NULL
    AND ae.tempo_na_pagina IS NOT NULL
  GROUP BY ae.pagina
  ORDER BY tempo_medio_segundos DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_atualizado_em()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_tarefas_atualizado_em()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_evento_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT id FROM eventos WHERE usuario_id = auth.uid();
$function$;

-- ============================================================
-- TABELAS
-- ============================================================

-- admins
CREATE TABLE public.admins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    email text
);
ALTER TABLE public.admins ADD CONSTRAINT admins_pkey PRIMARY KEY (id);
ALTER TABLE public.admins ADD CONSTRAINT admins_usuario_id_key UNIQUE (usuario_id);

-- analytics_eventos
CREATE TABLE public.analytics_eventos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid,
    sessao_id text NOT NULL,
    evento_tipo text NOT NULL,
    categoria text,
    acao text,
    pagina text,
    step_id text,
    fornecedor_id uuid,
    evento_id uuid,
    valor numeric,
    tempo_na_pagina integer,
    dados jsonb,
    user_agent text,
    ip text,
    origem text,
    criado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.analytics_eventos ADD CONSTRAINT analytics_eventos_pkey PRIMARY KEY (id);

-- avaliacoes
CREATE TABLE public.avaliacoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fornecedor_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    nota integer NOT NULL,
    comentario text,
    criado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_pkey PRIMARY KEY (id);
ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores_plataforma(id);

-- cerimonialista_assistente_permissoes
CREATE TABLE public.cerimonialista_assistente_permissoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assistente_id uuid NOT NULL,
    evento_id uuid NOT NULL,
    ver_fornecedores boolean DEFAULT false,
    ver_financeiro boolean DEFAULT false,
    ver_tarefas boolean DEFAULT false,
    ver_convidados boolean DEFAULT false,
    ver_chat boolean DEFAULT false,
    ver_cronograma boolean DEFAULT false,
    ver_contratos boolean DEFAULT false,
    ver_mesas boolean DEFAULT false,
    ver_memorial boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.cerimonialista_assistente_permissoes ADD CONSTRAINT cerimonialista_assistente_permissoes_pkey PRIMARY KEY (id);
ALTER TABLE public.cerimonialista_assistente_permissoes ADD CONSTRAINT cerimonialista_assistente_permissoe_assistente_id_evento_id_key UNIQUE (assistente_id, evento_id);
ALTER TABLE public.cerimonialista_assistente_permissoes ADD CONSTRAINT cerimonialista_assistente_permissoes_assistente_id_fkey FOREIGN KEY (assistente_id) REFERENCES public.cerimonialista_assistentes(id);
ALTER TABLE public.cerimonialista_assistente_permissoes ADD CONSTRAINT cerimonialista_assistente_permissoes_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);

-- cerimonialista_assistentes
CREATE TABLE public.cerimonialista_assistentes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cerimonialista_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    acesso text DEFAULT 'operacional'::text,
    ativo boolean DEFAULT true,
    criado_em timestamp without time zone DEFAULT now()
);
ALTER TABLE public.cerimonialista_assistentes ADD CONSTRAINT cerimonialista_assistentes_pkey PRIMARY KEY (id);
ALTER TABLE public.cerimonialista_assistentes ADD CONSTRAINT fk_ass_cerimonialista FOREIGN KEY (cerimonialista_id) REFERENCES public.cerimonialistas(id);

-- cerimonialista_financeiro
CREATE TABLE public.cerimonialista_financeiro (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cerimonialista_id uuid NOT NULL,
    evento_id uuid,
    tipo text,
    categoria text,
    descricao text,
    valor numeric NOT NULL,
    data_vencimento date,
    pago boolean DEFAULT false,
    criado_em timestamp without time zone DEFAULT now()
);
ALTER TABLE public.cerimonialista_financeiro ADD CONSTRAINT cerimonialista_financeiro_pkey PRIMARY KEY (id);
ALTER TABLE public.cerimonialista_financeiro ADD CONSTRAINT fk_fin_cerimonialista FOREIGN KEY (cerimonialista_id) REFERENCES public.cerimonialistas(id);
ALTER TABLE public.cerimonialista_financeiro ADD CONSTRAINT fk_fin_evento FOREIGN KEY (evento_id) REFERENCES public.eventos(id);

-- cerimonialista_fornecedores_favoritos
CREATE TABLE public.cerimonialista_fornecedores_favoritos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cerimonialista_id uuid NOT NULL,
    nome_fornecedor text NOT NULL,
    categoria text,
    telefone text,
    email text,
    instagram text,
    notas_internas text,
    fornecedor_id uuid,
    criado_em timestamp without time zone DEFAULT now()
);
ALTER TABLE public.cerimonialista_fornecedores_favoritos ADD CONSTRAINT cerimonialista_fornecedores_favoritos_pkey PRIMARY KEY (id);
ALTER TABLE public.cerimonialista_fornecedores_favoritos ADD CONSTRAINT fk_fav_cerimonialista FOREIGN KEY (cerimonialista_id) REFERENCES public.cerimonialistas(id);
ALTER TABLE public.cerimonialista_fornecedores_favoritos ADD CONSTRAINT fk_fav_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id);

-- cerimonialista_leads
CREATE TABLE public.cerimonialista_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cerimonialista_id uuid NOT NULL,
    nome_lead text NOT NULL,
    email text,
    telefone text,
    tipo_evento text,
    data_prevista date,
    valor_proposta numeric,
    estagio text DEFAULT 'contato_inicial'::text,
    fonte text,
    notas text,
    convertido_evento_id uuid,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now()
);
ALTER TABLE public.cerimonialista_leads ADD CONSTRAINT cerimonialista_leads_pkey PRIMARY KEY (id);
ALTER TABLE public.cerimonialista_leads ADD CONSTRAINT fk_leads_cerimonialista FOREIGN KEY (cerimonialista_id) REFERENCES public.cerimonialistas(id);
ALTER TABLE public.cerimonialista_leads ADD CONSTRAINT fk_leads_evento FOREIGN KEY (convertido_evento_id) REFERENCES public.eventos(id);

-- cerimonialista_modelos
CREATE TABLE public.cerimonialista_modelos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cerimonialista_id uuid NOT NULL,
    tipo text,
    nome text NOT NULL,
    conteudo text,
    variaveis jsonb,
    criado_em timestamp without time zone DEFAULT now()
);
ALTER TABLE public.cerimonialista_modelos ADD CONSTRAINT cerimonialista_modelos_pkey PRIMARY KEY (id);
ALTER TABLE public.cerimonialista_modelos ADD CONSTRAINT fk_modelos_cerimonialista FOREIGN KEY (cerimonialista_id) REFERENCES public.cerimonialistas(id);

-- cerimonialista_permissoes
CREATE TABLE public.cerimonialista_permissoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    cerimonialista_id uuid NOT NULL,
    ver_fornecedores boolean DEFAULT false,
    editar_fornecedores boolean DEFAULT false,
    ver_financeiro boolean DEFAULT false,
    editar_financeiro boolean DEFAULT false,
    ver_tarefas boolean DEFAULT false,
    editar_tarefas boolean DEFAULT false,
    ver_convidados boolean DEFAULT false,
    editar_convidados boolean DEFAULT false,
    ver_chat boolean DEFAULT false,
    editar_chat boolean DEFAULT false,
    ver_cronograma boolean DEFAULT false,
    editar_cronograma boolean DEFAULT false,
    ver_contratos boolean DEFAULT false,
    editar_contratos boolean DEFAULT false,
    ver_mesas boolean DEFAULT false,
    editar_mesas boolean DEFAULT false,
    ver_memorial boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.cerimonialista_permissoes ADD CONSTRAINT cerimonialista_permissoes_pkey PRIMARY KEY (id);
ALTER TABLE public.cerimonialista_permissoes ADD CONSTRAINT cerimonialista_permissoes_evento_id_cerimonialista_id_key UNIQUE (evento_id, cerimonialista_id);
ALTER TABLE public.cerimonialista_permissoes ADD CONSTRAINT cerimonialista_permissoes_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.cerimonialista_permissoes ADD CONSTRAINT cerimonialista_permissoes_cerimonialista_id_fkey FOREIGN KEY (cerimonialista_id) REFERENCES public.cerimonialistas(id);

-- cerimonialista_roteiro_itens
CREATE TABLE public.cerimonialista_roteiro_itens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    cerimonialista_id uuid NOT NULL,
    horario time without time zone NOT NULL,
    titulo text NOT NULL,
    descricao text,
    responsavel text,
    status text DEFAULT 'pendente'::text,
    ordem integer DEFAULT 0 NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.cerimonialista_roteiro_itens ADD CONSTRAINT cerimonialista_roteiro_itens_pkey PRIMARY KEY (id);
ALTER TABLE public.cerimonialista_roteiro_itens ADD CONSTRAINT fk_roteiro_evento FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.cerimonialista_roteiro_itens ADD CONSTRAINT fk_roteiro_cerimonialista FOREIGN KEY (cerimonialista_id) REFERENCES public.cerimonialistas(id);

-- cerimonialistas
CREATE TABLE public.cerimonialistas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    nome_empresa text NOT NULL,
    cnpj text,
    bio text,
    portfolio_urls jsonb,
    instagram text,
    site text,
    telefone text,
    cidade text,
    estado text,
    regiao_atuacao text,
    ativo boolean DEFAULT false,
    plano text DEFAULT 'trial'::text,
    trial_inicio timestamp without time zone DEFAULT now(),
    avaliacao_media numeric DEFAULT 0,
    total_avaliacoes integer DEFAULT 0,
    total_eventos integer DEFAULT 0,
    criado_em timestamp without time zone DEFAULT now(),
    visibilidade_contato text DEFAULT 'assinante'::text
);
ALTER TABLE public.cerimonialistas ADD CONSTRAINT cerimonialistas_pkey PRIMARY KEY (id);

-- chat_mensagens
CREATE TABLE public.chat_mensagens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    remetente_id uuid NOT NULL,
    mensagem text NOT NULL,
    lida boolean DEFAULT false,
    criado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.chat_mensagens ADD CONSTRAINT chat_mensagens_pkey PRIMARY KEY (id);
ALTER TABLE public.chat_mensagens ADD CONSTRAINT chat_mensagens_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);

-- cliques_fornecedor
CREATE TABLE public.cliques_fornecedor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fornecedor_id uuid NOT NULL,
    tipo text NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.cliques_fornecedor ADD CONSTRAINT cliques_fornecedor_pkey PRIMARY KEY (id);
ALTER TABLE public.cliques_fornecedor ADD CONSTRAINT cliques_fornecedor_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores_plataforma(id);

-- colaboradores
CREATE TABLE public.colaboradores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    nome text,
    email text NOT NULL,
    telefone text,
    token uuid DEFAULT gen_random_uuid() NOT NULL,
    permissao text DEFAULT 'visualizar'::text,
    ver_financeiro boolean DEFAULT false,
    ativo boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.colaboradores ADD CONSTRAINT colaboradores_pkey PRIMARY KEY (id);
ALTER TABLE public.colaboradores ADD CONSTRAINT colaboradores_token_key UNIQUE (token);
ALTER TABLE public.colaboradores ADD CONSTRAINT colaboradores_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);

-- configuracoes
CREATE TABLE public.configuracoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chave text NOT NULL,
    valor text NOT NULL,
    descricao text,
    categoria text NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now(),
    atualizado_por uuid
);
ALTER TABLE public.configuracoes ADD CONSTRAINT configuracoes_pkey PRIMARY KEY (id);
ALTER TABLE public.configuracoes ADD CONSTRAINT configuracoes_chave_key UNIQUE (chave);

-- contratos
CREATE TABLE public.contratos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid,
    fornecedor_id uuid,
    tipo text,
    categoria text,
    status text,
    conteudo text,
    assinado_noivos_em timestamp without time zone,
    assinado_fornecedor_em timestamp without time zone,
    fornecedor_email_enviado_em timestamp without time zone,
    pdf_url text,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now(),
    token_assinatura uuid DEFAULT gen_random_uuid(),
    justificativa_recusa text,
    visualizado_em timestamp with time zone,
    recusado_em timestamp with time zone,
    fornecedor_nome_assinatura text,
    fornecedor_email_assinatura text
);
ALTER TABLE public.contratos ADD CONSTRAINT contratos_pkey PRIMARY KEY (id);
ALTER TABLE public.contratos ADD CONSTRAINT contratos_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.contratos ADD CONSTRAINT contratos_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id);

-- convidados
CREATE TABLE public.convidados (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    evento_id uuid,
    nome text NOT NULL,
    email text,
    telefone text,
    grupo text,
    confirmado text DEFAULT 'pendente'::text,
    mesa text,
    criado_em timestamp with time zone DEFAULT now(),
    mesa_id uuid,
    mesa_texto text,
    acompanhantes integer DEFAULT 0,
    posicao_na_mesa integer
);
ALTER TABLE public.convidados ADD CONSTRAINT convidados_pkey PRIMARY KEY (id);
ALTER TABLE public.convidados ADD CONSTRAINT convidados_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.convidados ADD CONSTRAINT convidados_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas(id);

-- cronograma
CREATE TABLE public.cronograma (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    evento_id uuid,
    horario time without time zone NOT NULL,
    atividade text NOT NULL,
    responsavel text,
    concluido boolean DEFAULT false,
    criado_em timestamp with time zone DEFAULT now(),
    musica text,
    fornecedor_id uuid,
    visivel_cliente boolean DEFAULT true
);
ALTER TABLE public.cronograma ADD CONSTRAINT cronograma_pkey PRIMARY KEY (id);
ALTER TABLE public.cronograma ADD CONSTRAINT cronograma_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.cronograma ADD CONSTRAINT cronograma_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id);

-- eventos
CREATE TABLE public.eventos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    nome_evento text,
    data_evento date,
    status text DEFAULT 'rascunho'::text,
    plano text DEFAULT 'gratuito'::text,
    assinatura_ativa boolean DEFAULT false,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    acesso_expira_em timestamp without time zone,
    acesso_iniciado_em timestamp without time zone,
    orcamento numeric DEFAULT 0,
    tipo_cerimonia text,
    tipo_local text,
    estilo text,
    total_convidados text,
    faixa_orcamento numeric,
    musica_festa text,
    flores text,
    iluminacao text,
    tipo_jantar text,
    tipo_bar text,
    formato_convite text,
    estilo_vestido text,
    estado_civil_noivo text,
    estado_civil_noiva text,
    lua_de_mel boolean DEFAULT false,
    memorial_concluido boolean DEFAULT false,
    memoriais_id uuid,
    cerimonialista_id uuid,
    criado_por text DEFAULT 'casal'::text,
    casal_confirmado boolean DEFAULT false,
    convite_revogado boolean DEFAULT false,
    cidade text
);
ALTER TABLE public.eventos ADD CONSTRAINT eventos_pkey PRIMARY KEY (id);
ALTER TABLE public.eventos ADD CONSTRAINT eventos_memoriais_id_fkey FOREIGN KEY (memoriais_id) REFERENCES public.memoriais(id);
ALTER TABLE public.eventos ADD CONSTRAINT fk_eventos_cerimonialista FOREIGN KEY (cerimonialista_id) REFERENCES public.cerimonialistas(id);

-- financeiro
CREATE TABLE public.financeiro (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    evento_id uuid,
    orcamento_total numeric,
    categoria text,
    descricao text,
    valor_estimado numeric,
    valor_real numeric,
    data_vencimento date,
    pago boolean DEFAULT false,
    criado_em timestamp with time zone DEFAULT now(),
    fornecedor_origem_id uuid,
    sincronizado boolean DEFAULT false,
    fornecedor_excluido boolean DEFAULT false,
    categoria_principal text,
    gerado_auto boolean DEFAULT false
);
ALTER TABLE public.financeiro ADD CONSTRAINT financeiro_pkey PRIMARY KEY (id);
ALTER TABLE public.financeiro ADD CONSTRAINT financeiro_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.financeiro ADD CONSTRAINT financeiro_fornecedor_origem_id_fkey FOREIGN KEY (fornecedor_origem_id) REFERENCES public.fornecedores(id);

-- fornecedores
CREATE TABLE public.fornecedores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    nome text NOT NULL,
    empresa text,
    categoria text,
    telefone text,
    email text,
    instagram text,
    site text,
    servico text,
    valor_total numeric DEFAULT 0,
    valor_entrada numeric DEFAULT 0,
    valor_saldo numeric DEFAULT 0,
    status text DEFAULT 'a_contratar'::text,
    notas text,
    criado_em timestamp with time zone DEFAULT now(),
    contrato_assinado_em timestamp without time zone,
    contrato_assinado_ip text,
    contrato_assinado_ua text,
    visivel_cliente boolean DEFAULT true,
    usuario_id uuid,
    categoria_principal text,
    pre_criado boolean DEFAULT false
);
ALTER TABLE public.fornecedores ADD CONSTRAINT fornecedores_pkey PRIMARY KEY (id);
ALTER TABLE public.fornecedores ADD CONSTRAINT fornecedores_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);

-- fornecedores_plataforma
CREATE TABLE public.fornecedores_plataforma (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    nome_empresa text NOT NULL,
    categoria text NOT NULL,
    cidade text,
    estado text,
    descricao text,
    telefone text,
    email text,
    site text,
    instagram text,
    fotos jsonb DEFAULT '[]'::jsonb,
    plano text DEFAULT 'gratuito'::text,
    ativo boolean DEFAULT false,
    avaliacao_media numeric DEFAULT 0,
    total_avaliacoes integer DEFAULT 0,
    visualizacoes integer DEFAULT 0,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.fornecedores_plataforma ADD CONSTRAINT fornecedores_plataforma_pkey PRIMARY KEY (id);

-- grupos_convidados
CREATE TABLE public.grupos_convidados (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    nome text NOT NULL,
    ordem integer DEFAULT 0,
    criado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.grupos_convidados ADD CONSTRAINT grupos_convidados_pkey PRIMARY KEY (id);
ALTER TABLE public.grupos_convidados ADD CONSTRAINT grupos_convidados_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.grupos_convidados ADD CONSTRAINT grupos_convidados_evento_id_nome_key UNIQUE (evento_id, nome);

-- memoriais
CREATE TABLE public.memoriais (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    evento_id uuid,
    estado jsonb DEFAULT '{}'::jsonb NOT NULL,
    conteudo_gerado text,
    concluido boolean DEFAULT false NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.memoriais ADD CONSTRAINT memoriais_pkey PRIMARY KEY (id);
ALTER TABLE public.memoriais ADD CONSTRAINT memoriais_user_id_key UNIQUE (user_id);
ALTER TABLE public.memoriais ADD CONSTRAINT memoriais_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);

-- mensagens
CREATE TABLE public.mensagens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    remetente_id uuid NOT NULL,
    remetente_tipo text,
    conteudo text NOT NULL,
    lida boolean DEFAULT false,
    criado_em timestamp without time zone DEFAULT now()
);
ALTER TABLE public.mensagens ADD CONSTRAINT mensagens_pkey PRIMARY KEY (id);
ALTER TABLE public.mensagens ADD CONSTRAINT fk_msg_evento FOREIGN KEY (evento_id) REFERENCES public.eventos(id);

-- mesas
CREATE TABLE public.mesas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    numero integer NOT NULL,
    tipo_id uuid NOT NULL,
    rotulo text,
    posicao_x double precision,
    posicao_y double precision,
    rotacao integer DEFAULT 0,
    criado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.mesas ADD CONSTRAINT mesas_pkey1 PRIMARY KEY (id);
ALTER TABLE public.mesas ADD CONSTRAINT mesas_evento_id_fkey1 FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.mesas ADD CONSTRAINT mesas_tipo_id_fkey FOREIGN KEY (tipo_id) REFERENCES public.mesas_tipos(id);

-- mesas_backup
CREATE TABLE public.mesas_backup (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    nome text NOT NULL,
    capacidade integer DEFAULT 8,
    observacoes text,
    criado_em timestamp without time zone DEFAULT now()
);
ALTER TABLE public.mesas_backup ADD CONSTRAINT mesas_pkey PRIMARY KEY (id);
ALTER TABLE public.mesas_backup ADD CONSTRAINT mesas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);

-- mesas_tipos
CREATE TABLE public.mesas_tipos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    nome text NOT NULL,
    formato text NOT NULL,
    capacidade integer NOT NULL,
    quantidade integer DEFAULT 1,
    criado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.mesas_tipos ADD CONSTRAINT mesas_tipos_pkey PRIMARY KEY (id);
ALTER TABLE public.mesas_tipos ADD CONSTRAINT mesas_tipos_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);

-- metricas_fornecedor
CREATE TABLE public.metricas_fornecedor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fornecedor_id uuid NOT NULL,
    dia date DEFAULT CURRENT_DATE NOT NULL,
    visualizacoes integer DEFAULT 0 NOT NULL,
    cliques integer DEFAULT 0 NOT NULL
);
ALTER TABLE public.metricas_fornecedor ADD CONSTRAINT metricas_fornecedor_pkey PRIMARY KEY (id);
ALTER TABLE public.metricas_fornecedor ADD CONSTRAINT metricas_fornecedor_fornecedor_id_dia_key UNIQUE (fornecedor_id, dia);
ALTER TABLE public.metricas_fornecedor ADD CONSTRAINT metricas_fornecedor_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores_plataforma(id);

-- pagamentos
CREATE TABLE public.pagamentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    evento_id uuid,
    fornecedor_id uuid,
    tipo text NOT NULL,
    valor numeric NOT NULL,
    status text DEFAULT 'pendente'::text,
    mp_payment_id text,
    criado_em timestamp with time zone DEFAULT now(),
    data_vencimento date,
    duracao_meses integer,
    aceite_termo_em timestamp without time zone
);
ALTER TABLE public.pagamentos ADD CONSTRAINT pagamentos_pkey PRIMARY KEY (id);
ALTER TABLE public.pagamentos ADD CONSTRAINT pagamentos_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.pagamentos ADD CONSTRAINT pagamentos_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores_plataforma(id);

-- tarefas
CREATE TABLE public.tarefas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    evento_id uuid,
    titulo text NOT NULL,
    descricao text,
    prazo date,
    concluida boolean DEFAULT false,
    categoria text,
    gerada_auto boolean DEFAULT false,
    criado_em timestamp with time zone DEFAULT now(),
    categoria_principal text,
    fornecedor_id uuid,
    atualizado_em timestamp with time zone DEFAULT now()
);
ALTER TABLE public.tarefas ADD CONSTRAINT tarefas_pkey PRIMARY KEY (id);
ALTER TABLE public.tarefas ADD CONSTRAINT tarefas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id);
ALTER TABLE public.tarefas ADD CONSTRAINT tarefas_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_analytics_criado_em ON public.analytics_eventos USING btree (criado_em DESC);
CREATE INDEX idx_analytics_dados ON public.analytics_eventos USING gin (dados);
CREATE INDEX idx_analytics_pagina ON public.analytics_eventos USING btree (pagina, criado_em DESC) WHERE (pagina IS NOT NULL);
CREATE INDEX idx_analytics_sessao ON public.analytics_eventos USING btree (sessao_id, criado_em DESC);
CREATE INDEX idx_analytics_step ON public.analytics_eventos USING btree (step_id, criado_em DESC) WHERE (step_id IS NOT NULL);
CREATE INDEX idx_analytics_tipo ON public.analytics_eventos USING btree (evento_tipo, categoria, criado_em DESC);
CREATE INDEX idx_analytics_usuario ON public.analytics_eventos USING btree (usuario_id, criado_em DESC);
CREATE INDEX idx_assistente_permissoes_assistente ON public.cerimonialista_assistente_permissoes USING btree (assistente_id);
CREATE INDEX idx_assistente_permissoes_evento ON public.cerimonialista_assistente_permissoes USING btree (evento_id);
CREATE INDEX idx_leads_cerimonialista ON public.cerimonialista_leads USING btree (cerimonialista_id, estagio);
CREATE INDEX idx_permissoes_cerimonialista ON public.cerimonialista_permissoes USING btree (cerimonialista_id);
CREATE INDEX idx_permissoes_evento ON public.cerimonialista_permissoes USING btree (evento_id);
CREATE INDEX idx_roteiro_cerimonialista ON public.cerimonialista_roteiro_itens USING btree (cerimonialista_id);
CREATE INDEX idx_roteiro_evento ON public.cerimonialista_roteiro_itens USING btree (evento_id);
CREATE INDEX idx_roteiro_ordem ON public.cerimonialista_roteiro_itens USING btree (evento_id, ordem);
CREATE INDEX idx_cerimonialistas_ativo ON public.cerimonialistas USING btree (ativo) WHERE (ativo = true);
CREATE INDEX idx_chat_evento_id ON public.chat_mensagens USING btree (evento_id);
CREATE INDEX idx_cliques_fornecedor_data ON public.cliques_fornecedor USING btree (criado_em);
CREATE INDEX idx_cliques_fornecedor_id ON public.cliques_fornecedor USING btree (fornecedor_id);
CREATE INDEX idx_colaboradores_token ON public.colaboradores USING btree (token);
CREATE INDEX idx_configuracoes_categoria ON public.configuracoes USING btree (categoria);
CREATE INDEX idx_configuracoes_chave ON public.configuracoes USING btree (chave);
CREATE INDEX idx_contratos_evento ON public.contratos USING btree (evento_id);
CREATE INDEX idx_contratos_fornecedor ON public.contratos USING btree (fornecedor_id);
CREATE INDEX idx_contratos_status ON public.contratos USING btree (status);
CREATE INDEX idx_contratos_token ON public.contratos USING btree (token_assinatura);
CREATE INDEX idx_eventos_casal_confirmado ON public.eventos USING btree (casal_confirmado);
CREATE INDEX idx_eventos_cerimonialista_id ON public.eventos USING btree (cerimonialista_id);
CREATE INDEX idx_eventos_memoriais_id ON public.eventos USING btree (memoriais_id);
CREATE INDEX idx_eventos_usuario_id ON public.eventos USING btree (usuario_id);
CREATE INDEX idx_fornecedores_pre_criado ON public.fornecedores USING btree (evento_id, pre_criado) WHERE (pre_criado = true);
CREATE INDEX idx_forn_plat_categoria ON public.fornecedores_plataforma USING btree (categoria);
CREATE INDEX idx_forn_plat_cidade ON public.fornecedores_plataforma USING btree (cidade, estado);
CREATE INDEX idx_memoriais_evento_id ON public.memoriais USING btree (evento_id);
CREATE INDEX idx_memoriais_user_id ON public.memoriais USING btree (user_id);
CREATE INDEX idx_mensagens_evento ON public.mensagens USING btree (evento_id, criado_em DESC);
CREATE INDEX idx_mensagens_nao_lidas ON public.mensagens USING btree (evento_id, lida) WHERE (lida = false);
CREATE INDEX idx_metricas_fornecedor_id_dia ON public.metricas_fornecedor USING btree (fornecedor_id, dia);
CREATE INDEX idx_pagamentos_usuario_id ON public.pagamentos USING btree (usuario_id);
CREATE INDEX idx_tarefas_evento_gerada_auto ON public.tarefas USING btree (evento_id, gerada_auto) WHERE (gerada_auto = true);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER trigger_atualizar_media_avaliacoes
    AFTER INSERT OR DELETE OR UPDATE ON public.avaliacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_media_avaliacoes();

CREATE TRIGGER trg_assistente_permissoes_atualizado_em
    BEFORE UPDATE ON public.cerimonialista_assistente_permissoes
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_permissoes_timestamp();

CREATE TRIGGER trg_roteiro_atualizado_em
    BEFORE UPDATE ON public.cerimonialista_roteiro_itens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_atualizado_em();

CREATE TRIGGER trigger_eventos_updated_at
    BEFORE UPDATE ON public.eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_updated_at();

CREATE TRIGGER trigger_forn_plat_updated_at
    BEFORE UPDATE ON public.fornecedores_plataforma
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_updated_at();

CREATE TRIGGER trigger_memoriais_updated_at
    BEFORE UPDATE ON public.memoriais
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_updated_at();

CREATE TRIGGER tarefas_atualizado_em_trigger
    BEFORE UPDATE ON public.tarefas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tarefas_atualizado_em();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerimonialista_assistente_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerimonialista_assistentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerimonialista_financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerimonialista_fornecedores_favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerimonialista_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerimonialista_modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerimonialista_roteiro_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerimonialistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convidados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cronograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos_convidados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memoriais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas_tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- NOTA: As seguintes tabelas NÃO têm RLS ativado no banco de produção:
-- public.cerimonialista_permissoes (rowsecurity = false)
-- public.cliques_fornecedor (rowsecurity = false)
-- public.metricas_fornecedor (rowsecurity = false)

-- ============================================================
-- POLICIES
-- ============================================================

-- admins
CREATE POLICY "Admins veem admins" ON public.admins FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Apenas admins inserem admins" ON public.admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Apenas admins deletam admins" ON public.admins FOR DELETE USING (is_admin(auth.uid()));

-- analytics_eventos
CREATE POLICY "Service role e admin inserem analytics" ON public.analytics_eventos FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role e admin leem analytics" ON public.analytics_eventos FOR SELECT USING ((is_admin(auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text)));

-- avaliacoes
CREATE POLICY "Qualquer um vê avaliações" ON public.avaliacoes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Usuários inserem avaliações" ON public.avaliacoes FOR INSERT TO authenticated WITH CHECK (true);

-- cerimonialista_assistente_permissoes
CREATE POLICY "assistente_permissoes_assistente_select" ON public.cerimonialista_assistente_permissoes FOR SELECT USING ((assistente_id IN ( SELECT cerimonialista_assistentes.id FROM cerimonialista_assistentes WHERE (cerimonialista_assistentes.usuario_id = auth.uid()))));
CREATE POLICY "assistente_permissoes_casal_select" ON public.cerimonialista_assistente_permissoes FOR SELECT USING ((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = cerimonialista_assistente_permissoes.evento_id) AND (eventos.usuario_id = auth.uid())))));
CREATE POLICY "assistente_permissoes_cerimonialista_all" ON public.cerimonialista_assistente_permissoes FOR ALL USING ((EXISTS ( SELECT 1 FROM cerimonialista_assistentes ca WHERE ((ca.id = cerimonialista_assistente_permissoes.assistente_id) AND (ca.cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid())))))));

-- cerimonialista_assistentes
CREATE POLICY "ass_select" ON public.cerimonialista_assistentes FOR SELECT USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "ass_insert" ON public.cerimonialista_assistentes FOR INSERT WITH CHECK (true);
CREATE POLICY "ass_update" ON public.cerimonialista_assistentes FOR UPDATE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "ass_delete" ON public.cerimonialista_assistentes FOR DELETE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));

-- cerimonialista_financeiro
CREATE POLICY "fin_select" ON public.cerimonialista_financeiro FOR SELECT USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "fin_insert" ON public.cerimonialista_financeiro FOR INSERT WITH CHECK (true);
CREATE POLICY "fin_update" ON public.cerimonialista_financeiro FOR UPDATE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "fin_delete" ON public.cerimonialista_financeiro FOR DELETE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));

-- cerimonialista_fornecedores_favoritos
CREATE POLICY "fav_select" ON public.cerimonialista_fornecedores_favoritos FOR SELECT USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "fav_insert" ON public.cerimonialista_fornecedores_favoritos FOR INSERT WITH CHECK (true);
CREATE POLICY "fav_update" ON public.cerimonialista_fornecedores_favoritos FOR UPDATE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "fav_delete" ON public.cerimonialista_fornecedores_favoritos FOR DELETE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));

-- cerimonialista_leads
CREATE POLICY "leads_select" ON public.cerimonialista_leads FOR SELECT USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "leads_insert" ON public.cerimonialista_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_update" ON public.cerimonialista_leads FOR UPDATE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "leads_delete" ON public.cerimonialista_leads FOR DELETE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));

-- cerimonialista_modelos
CREATE POLICY "modelos_select" ON public.cerimonialista_modelos FOR SELECT USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "modelos_insert" ON public.cerimonialista_modelos FOR INSERT WITH CHECK (true);
CREATE POLICY "modelos_update" ON public.cerimonialista_modelos FOR UPDATE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "modelos_delete" ON public.cerimonialista_modelos FOR DELETE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));

-- cerimonialista_roteiro_itens
CREATE POLICY "roteiro_casal_select" ON public.cerimonialista_roteiro_itens FOR SELECT USING (((evento_id IN ( SELECT eventos.id FROM eventos WHERE (eventos.usuario_id = auth.uid()))) OR (cerimonialista_id = ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "roteiro_cerimonialista_all" ON public.cerimonialista_roteiro_itens FOR ALL USING ((cerimonialista_id = ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));

-- cerimonialistas
CREATE POLICY "cerimonialistas_select" ON public.cerimonialistas FOR SELECT USING ((usuario_id = auth.uid()));
CREATE POLICY "cerimonialistas_insert" ON public.cerimonialistas FOR INSERT WITH CHECK (true);
CREATE POLICY "cerimonialistas_update" ON public.cerimonialistas FOR UPDATE USING ((usuario_id = auth.uid()));
CREATE POLICY "cerimonialistas_delete" ON public.cerimonialistas FOR DELETE USING ((usuario_id = auth.uid()));

-- chat_mensagens
CREATE POLICY "Participantes veem mensagens" ON public.chat_mensagens FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = chat_mensagens.evento_id) AND (eventos.usuario_id = auth.uid())))) OR (auth.uid() = remetente_id) OR is_colaborador_evento(evento_id)));
CREATE POLICY "Participantes enviam mensagens" ON public.chat_mensagens FOR INSERT TO authenticated WITH CHECK (true);

-- colaboradores
CREATE POLICY "Dono vê colaboradores" ON public.colaboradores FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = colaboradores.evento_id) AND (eventos.usuario_id = auth.uid())))));
CREATE POLICY "Dono insere colaboradores" ON public.colaboradores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Dono atualiza colaboradores" ON public.colaboradores FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = colaboradores.evento_id) AND (eventos.usuario_id = auth.uid())))));
CREATE POLICY "Acesso público por token" ON public.colaboradores FOR SELECT TO anon USING ((ativo = true));
CREATE POLICY "Colaborador vê próprio registro" ON public.colaboradores FOR SELECT USING (((email = (auth.jwt() ->> 'email'::text)) AND (ativo = true)));

-- configuracoes
CREATE POLICY "Admins leem configuracoes" ON public.configuracoes FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins inserem configuracoes" ON public.configuracoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins atualizam configuracoes" ON public.configuracoes FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins deletam configuracoes" ON public.configuracoes FOR DELETE USING (is_admin(auth.uid()));

-- contratos
CREATE POLICY "contratos_select" ON public.contratos FOR SELECT USING (((EXISTS ( SELECT 1 FROM eventos e WHERE ((e.id = contratos.evento_id) AND (e.usuario_id = auth.uid())))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "contratos_insert" ON public.contratos FOR INSERT WITH CHECK (true);
CREATE POLICY "contratos_update" ON public.contratos FOR UPDATE USING (((EXISTS ( SELECT 1 FROM eventos e WHERE ((e.id = contratos.evento_id) AND (e.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));
CREATE POLICY "contratos_delete" ON public.contratos FOR DELETE USING (((EXISTS ( SELECT 1 FROM eventos e WHERE ((e.id = contratos.evento_id) AND (e.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));

-- convidados
CREATE POLICY "convidados_select" ON public.convidados FOR SELECT USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = convidados.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "convidados_insert" ON public.convidados FOR INSERT WITH CHECK (true);
CREATE POLICY "convidados_update" ON public.convidados FOR UPDATE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = convidados.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));
CREATE POLICY "convidados_delete" ON public.convidados FOR DELETE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = convidados.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));

-- cronograma
CREATE POLICY "cronograma_select" ON public.cronograma FOR SELECT USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = cronograma.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "cronograma_insert" ON public.cronograma FOR INSERT WITH CHECK (true);
CREATE POLICY "cronograma_update" ON public.cronograma FOR UPDATE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = cronograma.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));
CREATE POLICY "cronograma_delete" ON public.cronograma FOR DELETE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = cronograma.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));

-- eventos
CREATE POLICY "eventos_select" ON public.eventos FOR SELECT USING (((usuario_id = auth.uid()) OR (cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))) OR is_colaborador_evento(id)));
CREATE POLICY "eventos_insert" ON public.eventos FOR INSERT WITH CHECK (true);
CREATE POLICY "eventos_update" ON public.eventos FOR UPDATE USING ((usuario_id = auth.uid()));
CREATE POLICY "eventos_delete" ON public.eventos FOR DELETE USING ((usuario_id = auth.uid()));
CREATE POLICY "eventos_cerimonialista_select" ON public.eventos FOR SELECT USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));
CREATE POLICY "eventos_cerimonialista_update" ON public.eventos FOR UPDATE USING ((cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))));

-- financeiro
CREATE POLICY "financeiro_select" ON public.financeiro FOR SELECT USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = financeiro.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_financeiro(evento_id)));
CREATE POLICY "financeiro_insert" ON public.financeiro FOR INSERT WITH CHECK (true);
CREATE POLICY "financeiro_update" ON public.financeiro FOR UPDATE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = financeiro.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_financeiro_editor(evento_id)));
CREATE POLICY "financeiro_delete" ON public.financeiro FOR DELETE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = financeiro.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_financeiro_editor(evento_id)));

-- fornecedores
CREATE POLICY "fornecedores_select" ON public.fornecedores FOR SELECT USING (((usuario_id = auth.uid()) OR is_colaborador_evento(evento_id)));
CREATE POLICY "fornecedores_insert" ON public.fornecedores FOR INSERT WITH CHECK (true);
CREATE POLICY "fornecedores_update" ON public.fornecedores FOR UPDATE USING (((usuario_id = auth.uid()) OR is_colaborador_evento_editor(evento_id)));
CREATE POLICY "fornecedores_delete" ON public.fornecedores FOR DELETE USING ((usuario_id = auth.uid()));
CREATE POLICY "Service role pode ler fornecedores" ON public.fornecedores FOR SELECT TO service_role USING (true);

-- fornecedores_plataforma
CREATE POLICY "Qualquer um vê fornecedores ativos" ON public.fornecedores_plataforma FOR SELECT TO anon, authenticated USING ((ativo = true));
CREATE POLICY "Fornecedor vê próprio perfil" ON public.fornecedores_plataforma FOR SELECT TO authenticated USING ((auth.uid() = usuario_id));
CREATE POLICY "Fornecedor insere perfil" ON public.fornecedores_plataforma FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Fornecedor atualiza perfil" ON public.fornecedores_plataforma FOR UPDATE TO authenticated USING ((auth.uid() = usuario_id));

-- grupos_convidados
CREATE POLICY "grupos_select" ON public.grupos_convidados FOR SELECT USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = grupos_convidados.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "grupos_insert" ON public.grupos_convidados FOR INSERT WITH CHECK (true);
CREATE POLICY "grupos_update" ON public.grupos_convidados FOR UPDATE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = grupos_convidados.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));
CREATE POLICY "grupos_delete" ON public.grupos_convidados FOR DELETE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = grupos_convidados.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));

-- memoriais
CREATE POLICY "Select own memorial" ON public.memoriais FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Insert own memorial" ON public.memoriais FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update own memorial" ON public.memoriais FOR UPDATE TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Delete own memorial" ON public.memoriais FOR DELETE TO authenticated USING ((auth.uid() = user_id));

-- mensagens
CREATE POLICY "msg_select" ON public.mensagens FOR SELECT USING (((evento_id IN ( SELECT eventos.id FROM eventos WHERE (eventos.usuario_id = auth.uid()))) OR (evento_id IN ( SELECT eventos.id FROM eventos WHERE (eventos.cerimonialista_id IN ( SELECT cerimonialistas.id FROM cerimonialistas WHERE (cerimonialistas.usuario_id = auth.uid()))))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "msg_insert" ON public.mensagens FOR INSERT WITH CHECK (true);
CREATE POLICY "msg_update" ON public.mensagens FOR UPDATE USING ((remetente_id = auth.uid()));
CREATE POLICY "msg_delete" ON public.mensagens FOR DELETE USING ((remetente_id = auth.uid()));

-- mesas
CREATE POLICY "mesas_select" ON public.mesas FOR SELECT USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = mesas.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "mesas_insert" ON public.mesas FOR INSERT WITH CHECK (true);
CREATE POLICY "mesas_update" ON public.mesas FOR UPDATE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = mesas.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));
CREATE POLICY "mesas_delete" ON public.mesas FOR DELETE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = mesas.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));

-- mesas_backup
CREATE POLICY "mesas_backup_select" ON public.mesas_backup FOR SELECT USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = mesas_backup.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "mesas_backup_insert" ON public.mesas_backup FOR INSERT WITH CHECK (true);
CREATE POLICY "mesas_backup_update" ON public.mesas_backup FOR UPDATE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = mesas_backup.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));
CREATE POLICY "mesas_backup_delete" ON public.mesas_backup FOR DELETE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = mesas_backup.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));

-- mesas_tipos
CREATE POLICY "mesas_tipos_select" ON public.mesas_tipos FOR SELECT USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = mesas_tipos.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "mesas_tipos_insert" ON public.mesas_tipos FOR INSERT WITH CHECK (true);
CREATE POLICY "mesas_tipos_update" ON public.mesas_tipos FOR UPDATE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = mesas_tipos.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));
CREATE POLICY "mesas_tipos_delete" ON public.mesas_tipos FOR DELETE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = mesas_tipos.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));

-- pagamentos
CREATE POLICY "pagamentos_select" ON public.pagamentos FOR SELECT USING (((usuario_id = auth.uid()) OR is_colaborador_evento_financeiro(evento_id)));
CREATE POLICY "pagamentos_insert" ON public.pagamentos FOR INSERT WITH CHECK (true);

-- tarefas
CREATE POLICY "tarefas_select" ON public.tarefas FOR SELECT USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = tarefas.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento(evento_id)));
CREATE POLICY "tarefas_insert" ON public.tarefas FOR INSERT WITH CHECK (true);
CREATE POLICY "tarefas_update" ON public.tarefas FOR UPDATE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = tarefas.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));
CREATE POLICY "tarefas_delete" ON public.tarefas FOR DELETE USING (((EXISTS ( SELECT 1 FROM eventos WHERE ((eventos.id = tarefas.evento_id) AND (eventos.usuario_id = auth.uid())))) OR is_colaborador_evento_editor(evento_id)));