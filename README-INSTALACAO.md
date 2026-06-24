# Instalação — Respiro Visual + Linguagem Inclusiva

## Arquivos no pacote

| Arquivo | Ação | O que resolve |
|---------|------|---------------|
| `utils/linguagemCasal.js` | Criar (novo) | Utilitário de linguagem inclusiva — nunca mais hardcode "noiva/noivo" |
| `components/memorial/BreathTransition.jsx` | Substituir | Respiro redesenhado: fade suave de cor, sem zoom |
| `components/memorial/BreathTransition.module.css` | Substituir | CSS com animação de respiração (inspira → expira) |
| `components/memorial/steps/Step00Casal.jsx` | Substituir | Título adapta conforme perfil do casal |
| `components/memorial/steps/Step02NomeCasal.jsx` | Substituir | Placeholders dos inputs adaptam conforme gênero |

## Comandos

```bash
cd ~/descomplicai
unzip -o sprint1-respiro-linguagem.zip
```

## O que mudou

### Respiro visual — agora elegante
- ❌ **Removido:** scale/zoom mecânico (parecia PowerPoint)
- ✅ **Novo:** overlay colorido faz fade suave — opacidade 0 → 0.20 → 0 em 400ms
- Ciclo: inspira (200ms) → expira (200ms) — como um respirar real
- Sem distorção de layout, sem zoom abrupto

### Linguagem inclusiva — zero hardcode
- `utils/linguagemCasal.js` centraliza todos os termos
- Suporta: `noiva-noivo`, `duas-noivas`, `dois-noivos`, `nao-especificar`
- Termos disponíveis: `casal`, `pessoa1`, `pessoa2`, `pronome`, `possessivo`, `artigo`, `chamada`, `genero1`, `genero2`
- `adaptarFrase('Quem são {casal}?', 'duas-noivas')` → `"Quem são as noivas?"`

### Step00Casal
- Título muda conforme perfil: "Quem está se casando?" (neutro) → "Quem são as noivas?" (duas noivas)
- Placeholder dos inputs adapta: "Ex: Ana" (feminino) / "Ex: Pedro" (masculino)

### Step02NomeCasal
- Labels dos inputs permanecem neutras ("primeira pessoa" / "segunda pessoa")
- Placeholders adaptam conforme gênero do perfil

## Próximos passos

Replicar o padrão nos demais steps quando fizer a auditoria completa de hardcode:
```javascript
import { adaptarFrase } from '../../../utils/linguagemCasal';
// ...
const titulo = adaptarFrase('Como {pronomeCap} preferem planejar?', perfil);
```
