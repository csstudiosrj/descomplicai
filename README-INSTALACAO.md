# Instalação — Sprint 1: Respiro Visual + Acessibilidade + Ícones

## Arquivos no pacote

| Arquivo | Ação | Prioridade |
|---------|------|------------|
| `components/memorial/BreathTransition.jsx` | Substituir | P1 |
| `components/memorial/BreathTransition.module.css` | Criar (novo) | P1 |
| `components/memorial/MemorialOrchestrator.jsx` | Substituir | P1 |
| `components/memorial/steps/Step01Modo.jsx` | Substituir | P1/P2 |
| `styles/tokens.css` | Substituir | P2 |
| `styles/globals.css` | Substituir | P2 |
| `pages/_document.jsx` | Substituir | P2 |

## Comandos para aplicar

```bash
cd ~/descomplicai
unzip -o sprint1-acessibilidade-respiro.zip
```

## O que mudou

### Prioridade 1 — Respiro Visual
- **BreathTransition** agora usa CSS Module (não mais inline styles)
- Adicionado `aria-live="polite"`, `role="status"`, texto `.sr-only` para leitores de tela
- **MemorialOrchestrator** passa a cor do card selecionado para o BreathTransition
- **Step01Modo** demonstra como passar a cor: `onSelect(campo, valor, cor)`
- `handleSelect` aceita terceiro parâmetro opcional `cor`

### Prioridade 2 — Acessibilidade
- **VLibras removido** — script do gov federal nunca funcionou. Comentário explicativo no `_document.jsx`
- **Skip-link** adicionado — teclado pode pular para conteúdo principal
- **Focus-visible** — outline visível só para navegação por teclado
- **`.sr-only`** — classe utilitária para texto exclusivo de leitores de tela
- **`tokens.css`** — adicionado `@media (prefers-reduced-motion: reduce)` e `@media (prefers-contrast: high)`
- **`globals.css`** — regras de acessibilidade globais (focus, skip-link, reduced-motion)
- **Step01Modo** — `aria-label` descritivo no Card, `role="radio"`, `aria-checked`

### Prioridade 3 — Ícones faltantes (especificação para o Claude)

Adicione ao `components/ui/Icon.jsx` quando o Claude desenhar:

```javascript
rings: (
  <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="9" cy="12" rx="4" ry="4.5" transform="rotate(-30 9 12)" />
    <ellipse cx="15" cy="12" rx="4" ry="4.5" transform="rotate(30 15 12)" />
  </g>
),

flower: (
  <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="2" />
    <path d="M12 6c1.5-2 3-2 4.5 0s0 4-4.5 4" />
    <path d="M12 6c-1.5-2-3-2-4.5 0s0 4 4.5 4" />
    <path d="M12 14c1.5 2 3 2 4.5 0s0-4-4.5-4" />
    <path d="M12 14c-1.5 2-3 2-4.5 0s0-4 4.5-4" />
    <path d="M12 14v6" />
  </g>
),

sparkle: (
  <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </g>
),
```

**Nota:** O `sparkle` já é referenciado no Step01Modo. Atualmente o Icon.jsx mostra `null` em dev (warning no console). Quando o ícone for adicionado, renderiza automaticamente.

## Próximos passos (não incluídos neste pacote)

1. **Replicar o padrão ARIA nos demais steps** — cada step deve passar `cor` no `onSelect` e ter `aria-label` nos cards
2. **Reimplementar VLibras** — quando houver uma solução estável (widget npm ou iframe)
3. **Adicionar ícones `rings`, `flower`, `sparkle`** ao `Icon.jsx` via Claude
