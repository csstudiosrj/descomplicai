# 🚀 Deploy Descomplicaí v1.0 — Guia de Produção

## TAREFA 1: DEPLOY NA VERCEL

### 1.1 Commit e Push
```bash
git add -A
git commit -m "feat: dashboard admin + analytics + configurações — lançamento v1.0"
git push origin main
```

### 1.2 Verificar Build
Acesse: https://vercel.com/dashboard
- Verifique os logs de build do projeto
- Se falhar por env vars, veja seção 1.3

### 1.3 Variáveis de Ambiente Obrigatórias
Configure na Vercel (Settings > Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
MERCADO_PAGO_ACCESS_TOKEN=TEST-...
MERCADO_PAGO_PUBLIC_KEY=TEST-...
NEXT_PUBLIC_SITE_URL=https://seu-site.vercel.app
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=descomplicai
SENTRY_PROJECT=descomplicai-web
```

---

## TAREFA 2: RATE LIMITING

### 2.1 Instalar dependências
```bash
npm install @upstash/ratelimit @upstash/redis bcryptjs
```

### 2.2 Rotas protegidas (específicas)
| Rota | Limite | Algoritmo | Prefixo Redis |
|------|--------|-----------|---------------|
| `/api/pagamento/criar` | 10 req/min | slidingWindow | `descomplicai:rl:pagamento` |
| `/api/analytics/track` | 100 req/min | slidingWindow | `descomplicai:rl:analytics` |
| `/api/cerimonialista/cadastro` | 5 req/min | slidingWindow | `descomplicai:rl:cadastro` |
| `/api/fornecedor/cadastro` | 5 req/min | slidingWindow | `descomplicai:rl:cadastro` |
| `/api/convite/validar` | 10 req/min | slidingWindow | `descomplicai:rl:convite` |

### 2.3 Rate limiting global (middleware.ts)
TODAS as rotas `/api/*` têm proteção de 60 req/min por IP via middleware.
As rotas listadas acima são excluídas do middleware para evitar dupla aplicação.

### 2.4 Como usar em novas rotas
```javascript
import { withRateLimit, strictLimiter } from "../../lib/ratelimit";

async function handler(req, res) {
  // sua lógica aqui
}

export default withRateLimit(handler, strictLimiter);
```

---

## TAREFA 3: MONITORAMENTO DE ERROS

### 3.1 Instalar Sentry
```bash
npm install @sentry/nextjs
```

### 3.2 Configurar Sentry
Os arquivos já estão criados:
- `instrumentation.ts` — registration hook (Next.js 14+)
- `sentry.client.config.js` — browser
- `sentry.server.config.js` — Node.js
- `sentry.edge.config.js` — Edge runtime
- `pages/_error.jsx` — error boundary Pages Router

O DSN é lido das env vars. Se não configurado, o SDK não inicializa.

### 3.3 Fallback (sem Sentry)
Se `SENTRY_DSN` não estiver configurado, erros são logados na tabela `erros` do Supabase.

Execute o SQL em `sql/criar_tabela_erros.sql` no SQL Editor do Supabase.

### 3.4 Capturar erros manualmente
```javascript
import { logError, withErrorCapture } from "../lib/errorLogger";

// Em API routes:
export default withErrorCapture(handler);

// Manualmente:
try {
  // código arriscado
} catch (error) {
  await logError(error, { req, userId: "uuid", extra: { tipo: "pagamento" } });
}
```

---

## COMMITS SEPARADOS

Execute os commits nesta ordem:

```bash
# Commit 1: Deploy
git add -A
git commit -m "feat: dashboard admin + analytics + configurações — lançamento v1.0"
git push origin main

# Commit 2: Rate Limiting
git add lib/ratelimit.js middleware.ts   pages/api/pagamento/criar.js pages/api/analytics/track.js   pages/api/cerimonialista/cadastro.js pages/api/fornecedor/cadastro.js   pages/api/convite/validar.js
git commit -m "security: rate limiting nas APIs críticas com @upstash/ratelimit"
git push origin main

# Commit 3: Monitoramento
git add instrumentation.ts sentry.client.config.js sentry.server.config.js   sentry.edge.config.js pages/_error.jsx lib/errorLogger.js next.config.js   sql/criar_tabela_erros.sql
git commit -m "monitoring: Sentry + fallback Supabase para log de erros"
git push origin main
```

---

## VERIFICAÇÃO PÓS-DEPLOY

- [ ] Build na Vercel: ✅ Sucesso
- [ ] Rate limit: Teste com `curl` repetido em `/api/cerimonialista/cadastro`
- [ ] Sentry: Verifique se eventos aparecem no dashboard
- [ ] Fallback: Se sem Sentry, verifique tabela `erros` no Supabase
- [ ] Middleware: Confirme que `/api/hello` retorna headers X-RateLimit-*
