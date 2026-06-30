
-- Migration: campos trial e status no fornecedores
-- Criada: 2026-06-30

-- Adiciona campos se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fornecedores' AND column_name = 'trial_expira_em') THEN
    ALTER TABLE fornecedores ADD COLUMN trial_expira_em TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fornecedores' AND column_name = 'status') THEN
    ALTER TABLE fornecedores ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente' 
      CHECK (status IN ('pendente', 'trial', 'ativo', 'aprovado', 'reprovado', 'suspenso', 'cancelado'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fornecedores' AND column_name = 'plano') THEN
    ALTER TABLE fornecedores ADD COLUMN plano TEXT DEFAULT 'basico' 
      CHECK (plano IN ('basico', 'premium', 'vip'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fornecedores' AND column_name = 'pagamento_status') THEN
    ALTER TABLE fornecedores ADD COLUMN pagamento_status TEXT DEFAULT 'pendente'
      CHECK (pagamento_status IN ('pendente', 'pago', 'falhou', 'reembolsado'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fornecedores' AND column_name = 'aprovado_em') THEN
    ALTER TABLE fornecedores ADD COLUMN aprovado_em TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fornecedores' AND column_name = 'aprovado_por') THEN
    ALTER TABLE fornecedores ADD COLUMN aprovado_por UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Atualiza fornecedores existentes sem status
UPDATE fornecedores SET status = 'pendente' WHERE status IS NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_fornecedores_status ON fornecedores(status);
CREATE INDEX IF NOT EXISTS idx_fornecedores_trial ON fornecedores(trial_expira_em) WHERE status = 'trial';
CREATE INDEX IF NOT EXISTS idx_fornecedores_categoria ON fornecedores(categoria, subcategoria);

COMMENT ON COLUMN fornecedores.trial_expira_em IS 'Data de expiração do período de trial (7 dias após cadastro)';
COMMENT ON COLUMN fornecedores.status IS 'pendente → trial → ativo/aprovado (após pagamento e aprovação)';
