# Respiro Visual — VERSÃO INTENSA

## O que mudou (agora você VAI ver)

### BreathTransition (overlay global)
- Opacidade: 0.20 → **0.40** (2x mais visível)
- Duração: 400ms → **500ms** (mais tempo para perceber)
- Adicionado: `backdrop-filter: blur(2px) brightness(0.94)` — fundo fica levemente escurecido e desfocado
- Adicionado: **glow central** — círculo de luz colorida que expande no centro da tela
- Sem scale/zoom (nunca mais)

### Step01Modo (pulso no card — efeito real do PRD)
- Quando clica no card, ele faz **scale(1.04)** + **box-shadow colorida** por 350ms
- Só avança para próxima etapa **depois** do pulso
- Bloqueia cliques duplos durante a animação
- O card "reage" ao toque — é isso que o PRD pede: "o card pulsa suavemente"

### MemorialOrchestrator
- Delay aumentado: 220ms → **500ms** (tempo suficiente para ver o efeito)

## Como testar
1. Vá para o Step01Modo ("Como vocês preferem planejar?")
2. Clique em "Me guiem" ou "Já tenho referências"
3. Você deve ver:
   - O card **cresce levemente** e ganha uma **sombra colorida** (pulso)
   - A tela inteira fica com uma **nuance de cor** (overlay)
   - Um **círculo de luz** expande no centro (glow)
   - Depois de meio segundo, avança para próxima etapa

## Para replicar o pulso nos outros steps
Copie o padrão do Step01Modo:
```javascript
const [cardPulsando, setCardPulsando] = useState(null);

const handleClick = (opcao) => {
  if (cardPulsando) return;
  setCardPulsando(opcao.valor);
  setTimeout(() => {
    onSelect('campo', opcao.valor, opcao.cor);
    setCardPulsando(null);
  }, 350);
};

// No Card:
style={{
  transform: isPulsando ? 'scale(1.04)' : 'scale(1)',
  boxShadow: isPulsando ? `0 0 0 4px ${opcao.corPulso}, 0 8px 32px ${opcao.corPulso}` : 'var(--shadow-sm)',
}}
```
