
-- Migration: tabela email_logs
-- Criada: 2026-06-30

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('enviado', 'erro', 'pendente')),
  erro TEXT,
  variaveis JSONB,
  provider_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_destinatario ON email_logs(destinatario);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- RLS: apenas service role e admins podem ler
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON email_logs
  FOR ALL USING (current_setting('app.current_user_role', true) = 'service_role');

COMMENT ON TABLE email_logs IS 'Rastreamento de envios de e-mails transacionais';
