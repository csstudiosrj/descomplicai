# Changelog — Descomplicaí

> Todas as mudancas notaveis do projeto serao documentadas neste arquivo.

---

## v1.0.0 — Lancamento (2026-06-30)

### Fases 1-3: Correcoes Criticas, Seguranca e UX
- Correcoes de bugs criticos pre-lancamento
- Hardening de seguranca (rate limiting, Sentry, fallback de erros)
- Melhorias de UX nos fluxos principais

### Admin + Analytics
- Painel administrativo completo (`pages/admin/`)
- Dashboard com metricas de funil, receita e paginas mais acessadas
- Analytics batch para reducao de writes no Supabase free
- Tabela `erros` como fallback quando Sentry nao esta configurado

### SEO + Notificacoes
- Sitemap dinamico (`pages/api/sitemap.xml.js`)
- Meta tags e Open Graph em paginas publicas
- Sistema de notificacoes por e-mail (Resend)

### PWA + Acessibilidade
- App instalavel (PWA) com `next-pwa`
- Service Worker com fallback offline
- ARIA em todos os componentes UI base
- SkipLink, focus visivel, prefers-reduced-motion
- VLibras (lazy load via CDN) — desabilitado no lancamento por limite de bundle

### Testes + Performance
- Testes Jest para APIs criticas
- Testes E2E com Playwright
- Otimizacao de imagens com `next/image`
- Skeleton loading na vitrine
- Indices otimizados no Supabase

---

## v1.1.0 — Planejado

### Backup e Documentacao
- Backup automatizado do banco via GitHub Actions
- Documentacao interna (README, ERD, CONTRIBUTING, CHANGELOG)
- Scripts de backup e restore local

### Expansao de Verticais
- Suporte a novos tipos de evento alem de casamentos
- Modulos adicionais para cerimonialistas

---

## Notas de Versao

- Seguimos [Semantic Versioning](https://semver.org/lang/pt-BR/)
- `MAJOR`: Mudancas incompatíveis com versoes anteriores
- `MINOR`: Novas funcionalidades (backwards compatible)
- `PATCH`: Correcoes de bugs (backwards compatible)
