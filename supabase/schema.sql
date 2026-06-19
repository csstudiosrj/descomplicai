-- ============================================================
-- Schema Supabase — Descomplicaí
-- Gerado a partir do banco real em 19/06/2026
-- ============================================================

-- ============================================================
-- 1. TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  nota integer NOT NULL,
  comentario text,
  criado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL,
  remetente_id uuid NOT NULL,
  mensagem text NOT NULL,
  lida boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.colaboradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL,
  nome text,
  email text NOT NULL,
  telefone text,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  permissao text DEFAULT 'visualizar',
  ver_financeiro boolean DEFAULT false,
  ativo boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.convidados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  evento_id uuid,
  nome text NOT NULL,
  email text,
  telefone text,
  grupo text,
  confirmado text DEFAULT 'pendente',
  mesa text,
  mesa_id uuid,
  mesa_texto text,
  criado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cronograma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  evento_id uuid,
  horario time without time zone NOT NULL,
  atividade text NOT NULL,
  responsavel text,
  concluido boolean DEFAULT false,
  musica text,
  fornecedor_id uuid,
  visivel_cliente boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  nome_evento text,
  data_evento date,
  status text DEFAULT 'rascunho',
  plano text DEFAULT 'gratuito',
  assinatura_ativa boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  acesso_expira_em timestamp without time zone,
  acesso_iniciado_em timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.financeiro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  evento_id uuid,
  orcamento_total numeric,
  categoria text,
  descricao text,
  valor_estimado numeric,
  valor_real numeric,
  data_vencimento date,
  pago boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fornecedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  status text DEFAULT 'a_contratar',
  notas text,
  criado_em timestamp with time zone DEFAULT now(),
  contrato_assinado_em timestamp without time zone,
  contrato_assinado_ip text,
  contrato_assinado_ua text,
  visivel_cliente boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.fornecedores_plataforma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  fotos jsonb DEFAULT '[]',
  plano text DEFAULT 'gratuito',
  ativo boolean DEFAULT false,
  avaliacao_media numeric DEFAULT 0,
  total_avaliacoes integer DEFAULT 0,
  visualizacoes integer DEFAULT 0,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memoriais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  evento_id uuid,
  estado jsonb NOT NULL DEFAULT '{}',
  conteudo_gerado text,
  concluido boolean NOT NULL DEFAULT false,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  atualizado_em timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mesas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL,
  nome text NOT NULL,
  capacidade integer DEFAULT 8,
  observacoes text,
  criado_em timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  evento_id uuid,
  fornecedor_id uuid,
  tipo text NOT NULL,
  valor numeric NOT NULL,
  status text DEFAULT 'pendente',
  mp_payment_id text,
  criado_em timestamp with time zone DEFAULT now(),
  data_vencimento date,
  duracao_meses integer,
  aceite_termo_em timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  evento_id uuid,
  titulo text NOT NULL,
  descricao text,
  prazo date,
  concluida boolean DEFAULT false,
  categoria text,
  gerada_auto boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now()
);

-- ============================================================
-- 2. FOREIGN KEYS
-- ============================================================

ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores_plataforma(id) ON DELETE CASCADE;

ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.chat_mensagens
  ADD CONSTRAINT chat_mensagens_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.chat_mensagens
  ADD CONSTRAINT chat_mensagens_remetente_id_fkey FOREIGN KEY (remetente_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.colaboradores
  ADD CONSTRAINT colaboradores_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.convidados
  ADD CONSTRAINT convidados_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.convidados
  ADD CONSTRAINT convidados_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas(id) ON DELETE SET NULL;

ALTER TABLE public.convidados
  ADD CONSTRAINT convidados_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cronograma
  ADD CONSTRAINT cronograma_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.cronograma
  ADD CONSTRAINT cronograma_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id) ON DELETE SET NULL;

ALTER TABLE public.cronograma
  ADD CONSTRAINT cronograma_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.eventos
  ADD CONSTRAINT eventos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.financeiro
  ADD CONSTRAINT financeiro_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.financeiro
  ADD CONSTRAINT financeiro_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.fornecedores
  ADD CONSTRAINT fornecedores_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.fornecedores_plataforma
  ADD CONSTRAINT fornecedores_plataforma_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.memoriais
  ADD CONSTRAINT memoriais_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.memoriais
  ADD CONSTRAINT memoriais_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.mesas
  ADD CONSTRAINT mesas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores_plataforma(id) ON DELETE SET NULL;

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.tarefas
  ADD CONSTRAINT tarefas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;

ALTER TABLE public.tarefas
  ADD CONSTRAINT tarefas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- 3. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_chat_evento_id ON public.chat_mensagens(evento_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_token ON public.colaboradores(token);
CREATE INDEX IF NOT EXISTS idx_eventos_usuario_id ON public.eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_forn_plat_categoria ON public.fornecedores_plataforma(categoria);
CREATE INDEX IF NOT EXISTS idx_forn_plat_cidade ON public.fornecedores_plataforma(cidade, estado);
CREATE INDEX IF NOT EXISTS idx_memoriais_user_id ON public.memoriais(user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_usuario_id ON public.pagamentos(usuario_id);

-- ============================================================
-- 4. TRIGGERS (updated_at)
-- ============================================================

CREATE OR REPLACE FUNCTION public.atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_updated_at();

CREATE TRIGGER trigger_forn_plat_updated_at
  BEFORE UPDATE ON public.fornecedores_plataforma
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_updated_at();

CREATE TRIGGER trigger_memoriais_updated_at
  BEFORE UPDATE ON public.memoriais
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_updated_at();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convidados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cronograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memoriais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- --- AVALIACOES ---
CREATE POLICY "avaliacoes_select" ON public.avaliacoes FOR SELECT USING (true);
CREATE POLICY "avaliacoes_insert" ON public.avaliacoes FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- --- CHAT_MENSAGENS ---
CREATE POLICY "chat_select" ON public.chat_mensagens FOR SELECT USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = chat_mensagens.evento_id AND eventos.usuario_id = auth.uid())
  OR auth.uid() = remetente_id
);
CREATE POLICY "chat_insert" ON public.chat_mensagens FOR INSERT WITH CHECK (auth.uid() = remetente_id);

-- --- COLABORADORES ---
CREATE POLICY "colaboradores_select_public" ON public.colaboradores FOR SELECT TO anon USING (ativo = true);
CREATE POLICY "colaboradores_select" ON public.colaboradores FOR SELECT USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = colaboradores.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "colaboradores_insert" ON public.colaboradores FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = colaboradores.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "colaboradores_update" ON public.colaboradores FOR UPDATE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = colaboradores.evento_id AND eventos.usuario_id = auth.uid())
);

-- --- CONVIDADOS ---
CREATE POLICY "convidados_select" ON public.convidados FOR SELECT USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = convidados.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "convidados_insert" ON public.convidados FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = convidados.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "convidados_update" ON public.convidados FOR UPDATE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = convidados.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "convidados_delete" ON public.convidados FOR DELETE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = convidados.evento_id AND eventos.usuario_id = auth.uid())
);

-- --- CRONOGRAMA ---
CREATE POLICY "cronograma_select" ON public.cronograma FOR SELECT USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = cronograma.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "cronograma_insert" ON public.cronograma FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = cronograma.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "cronograma_update" ON public.cronograma FOR UPDATE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = cronograma.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "cronograma_delete" ON public.cronograma FOR DELETE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = cronograma.evento_id AND eventos.usuario_id = auth.uid())
);

-- --- EVENTOS ---
CREATE POLICY "eventos_select" ON public.eventos FOR SELECT USING (usuario_id = auth.uid());
CREATE POLICY "eventos_insert" ON public.eventos FOR INSERT WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "eventos_update" ON public.eventos FOR UPDATE USING (usuario_id = auth.uid());
CREATE POLICY "eventos_delete" ON public.eventos FOR DELETE USING (usuario_id = auth.uid());

-- --- FINANCEIRO ---
CREATE POLICY "financeiro_select" ON public.financeiro FOR SELECT USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = financeiro.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "financeiro_insert" ON public.financeiro FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = financeiro.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "financeiro_update" ON public.financeiro FOR UPDATE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = financeiro.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "financeiro_delete" ON public.financeiro FOR DELETE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = financeiro.evento_id AND eventos.usuario_id = auth.uid())
);

-- --- FORNECEDORES ---
CREATE POLICY "fornecedores_select" ON public.fornecedores FOR SELECT USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = fornecedores.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "fornecedores_insert" ON public.fornecedores FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = fornecedores.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "fornecedores_update" ON public.fornecedores FOR UPDATE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = fornecedores.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "fornecedores_delete" ON public.fornecedores FOR DELETE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = fornecedores.evento_id AND eventos.usuario_id = auth.uid())
);

-- --- FORNECEDORES_PLATAFORMA ---
CREATE POLICY "forn_plat_select_public" ON public.fornecedores_plataforma FOR SELECT TO anon USING (ativo = true);
CREATE POLICY "forn_plat_select" ON public.fornecedores_plataforma FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "forn_plat_insert" ON public.fornecedores_plataforma FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "forn_plat_update" ON public.fornecedores_plataforma FOR UPDATE USING (auth.uid() = usuario_id);

-- --- MEMORIAIS ---
CREATE POLICY "memoriais_select" ON public.memoriais FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "memoriais_insert" ON public.memoriais FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "memoriais_update" ON public.memoriais FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "memoriais_delete" ON public.memoriais FOR DELETE USING (user_id = auth.uid());

-- --- MESAS ---
CREATE POLICY "mesas_select" ON public.mesas FOR SELECT USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = mesas.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "mesas_insert" ON public.mesas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = mesas.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "mesas_update" ON public.mesas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = mesas.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "mesas_delete" ON public.mesas FOR DELETE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = mesas.evento_id AND eventos.usuario_id = auth.uid())
);

-- --- PAGAMENTOS ---
CREATE POLICY "pagamentos_select" ON public.pagamentos FOR SELECT USING (usuario_id = auth.uid());
CREATE POLICY "pagamentos_insert" ON public.pagamentos FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- --- TAREFAS ---
CREATE POLICY "tarefas_select" ON public.tarefas FOR SELECT USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = tarefas.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "tarefas_insert" ON public.tarefas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = tarefas.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "tarefas_update" ON public.tarefas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = tarefas.evento_id AND eventos.usuario_id = auth.uid())
);
CREATE POLICY "tarefas_delete" ON public.tarefas FOR DELETE USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = tarefas.evento_id AND eventos.usuario_id = auth.uid())
);