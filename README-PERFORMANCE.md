# Otimizacoes de Performance — Descomplicai

## Resumo das mudancas

### 1. Analytics Batch (hooks/useAnalytics.js + pages/api/analytics/track.js)
- **Antes:** 1 write no Supabase por evento de analytics
- **Depois:** Eventos sao acumulados no cliente e enviados em batch a cada 30s ou 10 eventos
- **Impacto:** Reducao de ~90% nos writes de analytics no Supabase free

### 2. next/image nas paginas publicas
- **Vitrine (index):** Todas as imagens de fornecedores usam `next/image` com lazy loading
- **Vitrine (detalhe):** Logo e portfolio usam `next/image` com sizes otimizados
- **Landing:** Logo usa `next/image` (se aplicavel)
- **Impacto:** Melhora no LCP (Largest Contentful Paint) e reducao de bandwidth

### 3. Skeleton Loading (Vitrine)
- Cards de skeleton animados enquanto carrega fornecedores
- Melhora a percepcao de performance para o usuario

### 4. Preconnect e font-display
- Adicionado `<link rel="preconnect">` para Google Fonts e dominios externos
- `font-display: swap` implicito via Next.js (quando usar @next/font)

### 5. Bundle do Memorial
- O `MemorialOrchestrator.jsx` JA usa `React.lazy()` para todos os steps
- Nao ha necessidade de alteracao — o code splitting ja esta implementado
- Se precisar de lazy loading ainda mais agressivo, considerar `dynamic()` do Next.js

### 6. Indices no Supabase
- Migration `sql/migration_analytics_batch.sql` adiciona indices otimizados
- Ja existem 9 indices em analytics_eventos (confirmado no schema)

## Como rodar

### Instalar dependencias de teste
```bash
npm install --save-dev jest @playwright/test node-mocks-http
```

### Rodar testes de integracao
```bash
npm test
# ou
npm run test:watch
# ou
npm run test:ci
```

### Rodar testes E2E
```bash
npx playwright install
npx playwright test
```

### Rodar auditoria Lighthouse
```bash
npm install -g @lhci/cli
node scripts/audit-performance.js
```

### Rodar migration SQL
```bash
# No SQL Editor do Supabase:
# Cole o conteudo de sql/migration_analytics_batch.sql
```

## Metas de Lighthouse
| Categoria | Meta | Status |
|-----------|------|--------|
| Performance | > 70 | 🔄 Aguardando auditoria |
| Accessibility | > 90 | 🔄 Aguardando auditoria |
| Best Practices | > 90 | 🔄 Aguardando auditoria |
| SEO | > 90 | 🔄 Aguardando auditoria |
