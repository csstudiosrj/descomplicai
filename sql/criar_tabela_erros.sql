-- Schema da tabela de erros (fallback quando Sentry não está disponível)
-- RLS DESATIVADO - acesso via service role apenas

CREATE TABLE IF NOT EXISTS public.erros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL DEFAULT 'unknown',
  mensagem TEXT,
  stack TEXT,
  url VARCHAR(500),
  method VARCHAR(10),
  user_id UUID,
  status_code INTEGER,
  user_agent VARCHAR(500),
  ip INET,
  ambiente VARCHAR(20) DEFAULT 'production',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_erros_tipo ON public.erros(tipo);
CREATE INDEX IF NOT EXISTS idx_erros_created_at ON public.erros(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_erros_url ON public.erros(url);

-- Política RLS: desativada (acesso via service role)
ALTER TABLE public.erros DISABLE ROW LEVEL SECURITY;

-- Comentário explicativo
COMMENT ON TABLE public.erros IS 'Tabela de fallback para log de erros quando Sentry não está configurado. NÃO usar para dados sensíveis de usuários.';
