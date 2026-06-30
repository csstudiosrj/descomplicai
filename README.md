# PWA + Acessibilidade — Descomplicaí

Pacote de implementação completo para tornar o app instalável (PWA) e acessível.

---

## 📦 TAREFA 1: PWA (Progressive Web App)

### Passo 1 — Instalar dependência
```bash
npm install next-pwa
```

### Passo 2 — Substituir `next.config.js`
Copie o arquivo `next.config.js` daqui para a raiz do projeto, **substituindo o existente**.

> ⚠️ O arquivo novo mantém toda a configuração do Sentry e adiciona o `withPWA`.

### Passo 3 — Copiar arquivos para `public/`
```bash
cp public/manifest.json      ~/descomplicai/public/
cp public/offline.html       ~/descomplicai/public/
cp public/sw.js              ~/descomplicai/public/
cp -r public/icons/          ~/descomplicai/public/
```

### Passo 4 — Gerar ícones PNG (obrigatório para PWA)
Os arquivos SVG em `public/icons/` são placeholders. Converta para PNG:

```bash
# Com ImageMagick (instale se não tiver)
convert public/icons/icon-192x192.svg public/icons/icon-192x192.png
convert public/icons/icon-512x512.svg public/icons/icon-512x512.png

# Ou use um conversor online: https://convertio.co/svg-png/
```

> Depois de converter, **apague os .svg** e mantenha só os .png.

### Passo 5 — Atualizar `_document.jsx`
Substitua `pages/_document.jsx` pelo arquivo deste pacote. Ele adiciona:
- `<link rel="manifest" href="/manifest.json" />`
- Meta tags PWA (theme-color, apple-mobile-web-app, etc.)
- Apple touch icon

---

## ♿ TAREFA 2: Acessibilidade

### Passo 6 — Atualizar `_app.jsx`
Substitua `pages/_app.jsx` pelo arquivo deste pacote. Ele adiciona:
- `<AcessibilidadeWidget />` (botão flutuante de Libras)

### Passo 7 — Atualizar componentes UI
Substitua os arquivos em `components/ui/`:

```bash
cp components/ui/Button.jsx    ~/descomplicai/components/ui/
cp components/ui/Input.jsx     ~/descomplicai/components/ui/
cp components/ui/Card.jsx    ~/descomplicai/components/ui/
cp components/ui/Badge.jsx   ~/descomplicai/components/ui/
cp components/ui/Select.jsx  ~/descomplicai/components/ui/   # NOVO
cp components/ui/SkipLink.jsx ~/descomplicai/components/ui/  # NOVO
```

### Passo 8 — Adicionar hook
```bash
cp hooks/useReducedMotion.js ~/descomplicai/hooks/
```

### Passo 9 — Adicionar widget de acessibilidade
```bash
cp components/AcessibilidadeWidget.jsx ~/descomplicai/components/
```

### Passo 10 — Atualizar `components/ui/Icon.jsx`
O arquivo `Icon.jsx` do projeto precisa de duas alterações manuais (ver `components/ui/Icon.jsx.patch.txt`):

1. **Adicionar ícone `libras`** ao objeto `icons`:
```js
libras: (
  <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </g>
),
```

2. **Adicionar props `ariaLabel` e `role`** ao componente:
```js
export default function Icon({ name, size = 24, color = 'currentColor', className = '', ariaLabel }) {
  // ...
  return (
    <svg
      // ...props existentes...
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
```

### Passo 11 — Adicionar CSS de acessibilidade ao `globals.css`
Abra `styles/globals.css` no projeto e **cole no final** o conteúdo de `styles/globals.css.patch.css`.

> Se já existir parte do CSS de acessibilidade (skip-link, sr-only, prefers-reduced-motion), verifique duplicatas.

---

## 🧪 Testar

### Build
```bash
cd ~/descomplicai
npm run build
```

> Se der erro de `next-pwa` com middleware, o `buildExcludes` já está configurado no `next.config.js`.

### Verificar Service Worker
1. Abra o app no navegador
2. DevTools → Application → Service Workers
3. Deve aparecer `/sw.js` ou `/_next/static/...`

### Lighthouse PWA
1. DevTools → Lighthouse → PWA
2. Deve passar em "Installable"

### Testar ARIA
1. Instale a extensão **axe DevTools** no Chrome
2. Execute no modo Full Page
3. Não deve haver erros críticos nos componentes UI

---

## 📋 Resumo do que foi implementado

### PWA
| Item | Status |
|------|--------|
| next-pwa configurado | ✅ |
| manifest.json | ✅ |
| offline.html | ✅ |
| Service Worker fallback | ✅ |
| Meta tags PWA | ✅ |
| Ícones (SVG placeholder) | ✅ (converter para PNG) |
| Runtime caching estratégias | ✅ |
| Páginas privadas NÃO cacheadas | ✅ |

### Acessibilidade
| Item | Status |
|------|--------|
| Button — aria-label, aria-disabled | ✅ |
| Input — htmlFor, aria-describedby, aria-invalid | ✅ |
| Modal — role="dialog", aria-modal, focus trap, ESC | ✅ (já existia) |
| Toast — role="alert", aria-live="polite" | ✅ (já existia) |
| Card — role="article"/"button", aria-pressed | ✅ |
| Badge — aria-label automático | ✅ |
| Select — role="listbox", aria-expanded, aria-selected | ✅ (NOVO) |
| SkipLink | ✅ (NOVO) |
| Focus visível (:focus-visible) | ✅ |
| prefers-reduced-motion | ✅ |
| prefers-contrast: high | ✅ |
| VLibras lazy load | ✅ (AcessibilidadeWidget) |
| useReducedMotion hook | ✅ |

---

## 📝 Commits sugeridos

```bash
git add .
git commit -m "feat: pwa instalavel + offline fallback"

git add .
git commit -m "feat: acessibilidade aria + navegacao teclado + vlibras lazy load"
```

---

## ⚠️ Notas importantes

1. **Ícones**: Os SVGs são placeholders. Gere PNGs reais com o logo do projeto antes do lançamento.
2. **Screenshots**: O manifest.json referencia `screenshot-wide.png` e `screenshot-narrow.png`. Adicione depois.
3. **Páginas privadas**: O service worker NÃO cacheia `/api/*`, `/memorial/*`, `/painel/*`, `/admin/*`, etc.
4. **VLibras**: Só carrega em páginas públicas. Em páginas privadas o botão não aparece.
5. **Bundle**: O VLibras é carregado de CDN externo, NÃO entra no bundle da Vercel.
