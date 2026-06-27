-- SQL: Criar tabela fornecedores_plataforma (se não existir)
-- Execute no Supabase SQL Editor antes de deploy

-- Verificar se a tabela já existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'fornecedores_plataforma'
  ) THEN
    CREATE TABLE fornecedores_plataforma (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      nome_empresa text NOT NULL,
      categoria text NOT NULL,
      cidade text NOT NULL,
      estado text NOT NULL,
      email text NOT NULL,
      telefone text,
      site text,
      instagram text,
      descricao text,
      ativo boolean DEFAULT false,
      plano text DEFAULT 'gratuito',
      criado_em timestamp with time zone DEFAULT now()
    );

    -- Índices
    CREATE INDEX idx_fornecedores_plataforma_usuario_id ON fornecedores_plataforma(usuario_id);
    CREATE INDEX idx_fornecedores_plataforma_categoria ON fornecedores_plataforma(categoria);
    CREATE INDEX idx_fornecedores_plataforma_cidade ON fornecedores_plataforma(cidade);
    CREATE INDEX idx_fornecedores_plataforma_ativo ON fornecedores_plataforma(ativo);

    -- RLS (Row Level Security)
    ALTER TABLE fornecedores_plataforma ENABLE ROW LEVEL SECURITY;

    -- Política: usuário pode ver apenas seus próprios dados
    CREATE POLICY "Usuário vê próprio fornecedor" ON fornecedores_plataforma
      FOR SELECT USING (auth.uid() = usuario_id);

    -- Política: usuário pode atualizar apenas seus próprios dados
    CREATE POLICY "Usuário atualiza próprio fornecedor" ON fornecedores_plataforma
      FOR UPDATE USING (auth.uid() = usuario_id);

    -- Política: service role pode tudo (para APIs)
    CREATE POLICY "Service role full access" ON fornecedores_plataforma
      FOR ALL USING (current_user = 'supabase_admin');

    RAISE NOTICE 'Tabela fornecedores_plataforma criada com sucesso.';
  ELSE
    RAISE NOTICE 'Tabela fornecedores_plataforma já existe. Verificando colunas...';

    -- Adicionar colunas que possam estar faltando
    ALTER TABLE fornecedores_plataforma 
      ADD COLUMN IF NOT EXISTS site text,
      ADD COLUMN IF NOT EXISTS instagram text,
      ADD COLUMN IF NOT EXISTS descricao text,
      ADD COLUMN IF NOT EXISTS plano text DEFAULT 'gratuito',
      ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT false;
  END IF;
END $$;
