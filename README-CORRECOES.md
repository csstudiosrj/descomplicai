# Correções Visuais — Sprint 1

## O que foi corrigido

### 1. BackButton sumido
**Problema:** Ícone `arrow-left` não existe no Icon.jsx (o correto é `arrowLeft` camelCase). Além disso, botão transparente com opacidade 0.4 era invisível.

**Correção:**
- Trocado `name="arrow-left"` → `name="arrowLeft"`
- Adicionado fundo branco + sombra + borda visível
- Opacidade quando disabled: 0.5 (era 0.4)
- Hover: scale 1.08 + cor de fundo brand-lighter
- Botão agora é um círculo branco com sombra, visível em qualquer fundo

### 2. BreathTransition imperceptível
**Problema:** Overlay 0.12 opacidade + scale 1.02 eram muito sutis. Ninguém percebia.

**Correção:**
- Overlay: 0.12 → **0.22** (mais visível)
- Scale: 1.02 → **1.035** (mais perceptível)
- Adicionado `backdrop-filter: brightness(0.97)` — dá sensação de "pulsar" sutil
- Mantido 220ms de duração (não é sobre velocidade, é sobre intensidade)

### 3. Ícones faltantes nos steps
**Problema:** `heart` e `sparkle` não existem no Icon.jsx.

**Correção:** Steps agora referenciam os ícones corretamente. Quando o Claude adicionar `heart` e `sparkle` ao Icon.jsx, renderizam automaticamente. Atualmente aparecem como espaço vazio (não quebra o layout).

**Ícones para o Claude desenhar (adicionar ao Icon.jsx):**
```javascript
heart: (
  <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </g>
),
sparkle: (
  <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </g>
),
```

### 4. Step00Casal — passando cor
Agora passa `cor` no `onSelect` (mesmo padrão do Step01Modo), para o BreathTransition usar a cor correta no respiro.

## Comandos
```bash
cd ~/descomplicai
unzip -o sprint1-correcoes-visuais.zip
```
