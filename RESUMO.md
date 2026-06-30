# ✅ RESUMO — Deploy + Hardening Descomplicaí v1.0

## Status das 3 Tarefas

### ✅ TAREFA 1: DEPLOY NA VERCEL
- **Script:** `deploy.sh` (git add/commit/push)
- **Verificador:** `check-env.js` (lista env vars faltando)
- **Status:** Scripts prontos. Execute no repositório real.

### ✅ TAREFA 2: RATE LIMITING (@upstash/ratelimit)
**Arquivos criados:**
- `lib/ratelimit.js` — Configuração centralizada com 5 limitadores
- `middleware.ts` — Rate limiting global (60 req/min) em todas as APIs
- `pages/api/pagamento/criar.js` — 10 req/min
- `pages/api/analytics/track.js` — 100 req/min
- `pages/api/cerimonialista/cadastro.js` — 5 req/min
- `pages/api/fornecedor/cadastro.js` — 5 req/min
- `pages/api/convite/validar.js` — 10 req/min

**Algoritmo:** Sliding Window (melhor equilíbrio precisão/performance)
**Fail-open:** Se Redis cair, requisições passam (evita downtime)

### ✅ TAREFA 3: MONITORAMENTO DE ERROS (@sentry/nextjs)
**Arquivos criados:**
- `instrumentation.ts` — Registration hook (Next.js 14+)
- `sentry.client.config.js` — Browser (Session Replay, Logs)
- `sentry.server.config.js` — Node.js (includeLocalVariables)
- `sentry.edge.config.js` — Edge runtime
- `pages/_error.jsx` — Error boundary com fallback Supabase
- `lib/errorLogger.js` — Wrapper reutilizável `logError()` e `withErrorCapture()`
- `next.config.js` — Com `withSentryConfig` (tunnel, source maps, Vercel monitors)
- `sql/criar_tabela_erros.sql` — Schema da tabela fallback

**Fallback:** Se `SENTRY_DSN` não estiver configurado, erros vão para tabela `erros` no Supabase (RLS desativado, service role).

---

## URLs Protegidas com Rate Limit

| URL | Limite | Tipo |
|-----|--------|------|
| `/api/pagamento/criar` | 10 req/min | Específico |
| `/api/analytics/track` | 100 req/min | Específico |
| `/api/cerimonialista/cadastro` | 5 req/min | Específico |
| `/api/fornecedor/cadastro` | 5 req/min | Específico |
| `/api/convite/validar` | 10 req/min | Específico |
| Todas as `/api/*` | 60 req/min | Global (middleware) |

---

## Link do Sentry / Schema Fallback

**Com Sentry configurado:**
- Dashboard: https://descomplicai.sentry.io (substitua pelo seu org)
- DSN: Configure `SENTRY_DSN` e `SENTRY_AUTH_TOKEN` na Vercel

**Sem Sentry (fallback):**
Execute no SQL Editor do Supabase:
```sql
-- Ver arquivo: sql/criar_tabela_erros.sql
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
CREATE INDEX idx_erros_tipo ON public.erros(tipo);
CREATE INDEX idx_erros_created_at ON public.erros(created_at DESC);
ALTER TABLE public.erros DISABLE ROW LEVEL SECURITY;
```

---

## Dependências a Instalar

```bash
npm install @upstash/ratelimit @upstash/redis @sentry/nextjs bcryptjs
```

## Env Vars Necessárias

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_PUBLIC_KEY=
NEXT_PUBLIC_SITE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

---

## Commits (3 separados)

```bash
# 1. Deploy
git commit -m "feat: dashboard admin + analytics + configurações — lançamento v1.0"

# 2. Rate Limiting
git commit -m "security: rate limiting nas APIs críticas com @upstash/ratelimit"

# 3. Monitoramento
git commit -m "monitoring: Sentry + fallback Supabase para log de erros"
```
