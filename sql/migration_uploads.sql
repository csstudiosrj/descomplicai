-- ============================================================
-- MIGRATION: Adiciona campos de upload as tabelas existentes
-- Arquivo: sql/migration_uploads.sql
-- ============================================================

-- Adiciona logo_url a tabela fornecedores_plataforma
ALTER TABLE public.fornecedores_plataforma
ADD COLUMN IF NOT EXISTS logo_url text;

-- Adiciona capa_url a tabela fornecedores_plataforma
ALTER TABLE public.fornecedores_plataforma
ADD COLUMN IF NOT EXISTS capa_url text;

-- Adiciona fotos_json (array de URLs) a tabela fornecedores_plataforma
-- Nota: campo fotos ja existe como jsonb, vamos usar ele
-- Se precisar de campo separado, descomente abaixo:
-- ALTER TABLE public.fornecedores_plataforma
-- ADD COLUMN IF NOT EXISTS fotos_urls jsonb DEFAULT '[]'::jsonb;

-- Adiciona referencias_uploads a tabela memoriais
ALTER TABLE public.memoriais
ADD COLUMN IF NOT EXISTS referencias_uploads jsonb DEFAULT '[]'::jsonb;

-- Adiciona anexo_url a tabela contratos
ALTER TABLE public.contratos
ADD COLUMN IF NOT EXISTS anexo_url text;

-- Adiciona anexo_nome a tabela contratos
ALTER TABLE public.contratos
ADD COLUMN IF NOT EXISTS anexo_nome text;

-- ============================================================
-- INDICES (opcional, para performance)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_fornecedores_plataforma_logo 
ON public.fornecedores_plataforma(logo_url) 
WHERE logo_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contratos_anexo 
ON public.contratos(anexo_url) 
WHERE anexo_url IS NOT NULL;

-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON COLUMN public.fornecedores_plataforma.logo_url IS 'URL da logo no UploadThing (max 200KB)';
COMMENT ON COLUMN public.fornecedores_plataforma.capa_url IS 'URL da imagem de capa no UploadThing (max 500KB)';
COMMENT ON COLUMN public.memoriais.referencias_uploads IS 'Array de URLs de imagens de referencia no UploadThing';
COMMENT ON COLUMN public.contratos.anexo_url IS 'URL do PDF anexado no UploadThing (max 10MB)';
COMMENT ON COLUMN public.contratos.anexo_nome IS 'Nome original do arquivo PDF anexado';
