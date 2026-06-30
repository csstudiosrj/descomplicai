# Estrategia de Backup — Descomplicaí

> **Contexto:** O projeto utiliza o plano **FREE** do Supabase, que nao oferece backups automaticos pagos. Esta documentacao descreve a estrategia de backup manual automatizada implementada.

---

## Opcao A: Backup Automatizado via GitHub Actions (Implementado)

O workflow `.github/workflows/backup-supabase.yml` executa automaticamente:

- **Agendamento:** Todo dia as `06:00 UTC` (03:00 BRT)
- **Disparo manual:** Via `workflow_dispatch` com opcao de tipo (schema, data, full)
- **Retencao:** Artefatos sao mantidos por **90 dias** no GitHub Actions

### Variaveis necessarias (Secrets)

| Secret | Origem | Descricao |
|--------|--------|-----------|
| `SUPABASE_URL` | Vercel / .env.local | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel / .env.local | Service role key (acesso irrestrito ao banco) |

> ⚠️ Nunca commitar a `SUPABASE_SERVICE_ROLE_KEY`. Ela deve estar apenas em secrets do GitHub e no `.env.local` local.

### O que e backupado

| Arquivo | Conteudo | Versionado? |
|---------|----------|-------------|
| `schema.sql` | Estrutura de tabelas, indices, constraints, funcoes | ✅ Sim (branch `backup/YYYY-MM-DD`) |
| `data.sql` | Dados das tabelas (producao) | ❌ Nao (apenas artifact) |

### O que NAO e backupado

- **RLS Policies:** `pg_dump` pode nao capturar todas as politicas de Row Level Security. Sempre verifique apos restore.
- **Storage Buckets:** Buckets do Supabase Storage nao sao incluidos no dump do PostgreSQL.
- **Edge Functions:** Funcoes serverless do Supabase devem ser versionadas no repositorio Git.

---

## Opcao B: Plano Pago do Supabase (Nao implementado)

O plano **Pro** do Supabase ($25/mes) inclui:

- Backups automaticos diarios
- PITR (Point-in-Time Recovery) — recuperacao ate o minuto
- Retencao de 7 dias (PITR) ou mais

**Decisao de negocio:** Migrar para o plano Pro quando o volume de dados ou a criticidade do negocio justificar o custo.

---

## Backup Local (scripts/backup.sh)

Para executar backup manualmente no ambiente de desenvolvimento:

```bash
# Backup completo (schema + dados)
./scripts/backup.sh full

# Apenas schema
./scripts/backup.sh schema

# Apenas dados
./scripts/backup.sh data
```

Os arquivos sao salvos em `backups/YYYY-MM-DD-HHMMSS/` e compactados quando `full`.

> O diretorio `backups/` esta no `.gitignore` para evitar commit acidental de dados de producao.

---

## Restore de Emergencia (scripts/restore.sh)

```bash
# Restore completo
./scripts/restore.sh backups/2026-06-30-120000/schema.sql backups/2026-06-30-120000/data.sql

# Apenas schema
./scripts/restore.sh backups/2026-06-30-120000/schema.sql
```

⚠️ **Atencao:** O restore e uma operacao destrutiva. O script exige confirmacao digitando `RESTAURAR`.

Apos o restore, verifique manualmente:
1. RLS Policies no painel do Supabase
2. Triggers e Functions
3. Storage Buckets
4. Auth Users (hashes de senha)

---

## Checklist de Seguranca

- [ ] `SUPABASE_SERVICE_ROLE_KEY` nunca commitada no repositorio
- [ ] `backups/` no `.gitignore`
- [ ] Artefatos de data.sql retidos por no maximo 90 dias
- [ ] Branch de backup (`backup/YYYY-MM-DD`) contem apenas schema.sql
- [ ] Restore testado em ambiente de staging antes de producao
