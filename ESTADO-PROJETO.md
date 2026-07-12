# Descomplicaí — Estado Real do Projeto
**Documento vivo — colar no início de QUALQUER sessão nova (Claude ou Kimi)**
**Atualizado: 11/07/2026**

---

## CONTEXTO GERAL

Plataforma brasileira de planejamento de casamentos.
Stack: Next.js Pages Router, Supabase, Vercel.
URL dev: `arxum.csstudios.site/descomplicai`
Repo: github.com/csstudiosrj/descomplicai

**Decisão tomada:** fazer tudo certo antes de lançar. Não há urgência de data.

---

## DECISÕES ARQUITETURAIS FECHADAS

### Pagamento
- Mercado Pago SDK descartado — botão de pagar nunca fica ativo no Sandbox (bug confirmado pelo suporte deles)
- Substituir por **link de pagamento** (cartão + PIX)
- Stripe descartado para lançamento (repasse lento para contas novas)

### Questionário — Reestruturação Pendente
- Estrutura atual: ~145 steps lineares com condicionais manuais — QUEBRADA
- Algoritmo foi desenhado para 60 perguntas e nunca foi redesenhado
- Dezenas de steps nunca aparecem por condicionais fora de ordem
- **Decisão tomada:** reestruturar para modelo Fase 1 + Fase 2

**Fase 1 — Swipe (sim/não)**
Interface estilo Tinder. Perguntas binárias. Uma imagem grande por pergunta.
Composição segura no centro (funciona em qualquer tamanho de tela sem cortar).

**Fase 2 — Aprofundamento**
Cada "sim" da Fase 1 abre ramo de perguntas específicas.
Cards menores com imagens de fundo abstratas.
Motor orientado por config exportado de cada step — não lista manual.

**Cadastro/Perfil (antes do questionário)**
Coleta: nome do casal, data prevista, cidade, orçamento estimado.
Evento criado no banco AQUI — resolve bug de evento null no pagamento.

### Motor do Questionário — Novo Modelo
Cada step exporta sua própria config:
```javascript
export const config = {
  id: 'stepB5',
  fase: 1, // 1=swipe, 2=aprofundamento
  tipo: 'binario', // binario | multipla-escolha | texto-livre | confirmacao
  dependeDe: { tipoCerimonia: ['catolica', 'evangelica'] },
  campo: 'criancasCerimonia',
}
```
O algoritmo lê os configs automaticamente — nunca mais lista manual.

---

## ESTADO ATUAL DOS MÓDULOS

### ✅ Funcionando (não mexer)
- Painel dos noivos: dashboard, fornecedores, financeiro, convidados, mesas, checklist, cronograma, contratos, chat
- Portal do cerimonialista: painel, funil Kanban, eventos, biblioteca, financeiro, roteiro, assistentes, chat, convites, espelho
- Portal do fornecedor: painel, cadastro, vitrine, métricas
- Admin: login, dashboard com dados reais, proteção de rota
- Auth: login, cadastro, logout (limpa localStorage), signOut
- Header: "Para profissionais" com dropdown
- Rodapé: links para profissionais
- Landing: `/landing` separada, `/` redireciona pro memorial

### ⚠️ Funcionando com bugs
- **Questionário:** fluxo básico funciona mas dezenas de steps nunca aparecem
- **Pagamento:** checkpoint do MP quebrado — substituir por link de pagamento

### ❌ Não testado / nunca validado
- Painel do cerimonialista (nunca conseguiu acessar para testar)
- Painel do fornecedor (nunca conseguiu acessar para testar)
- Fluxo completo questionário → pagamento → painel

---

## PROBLEMAS MAPEADOS NOS STEPS

### Steps sem ícone (91 arquivos)
Precisam de ícone ou imagem de fundo. Lista completa:
Step02NomeCasal, Step03Data, Step04Cidade, Step05Convidados, Step06Orcamento,
Step07aCatolica, Step07bEvangelica, Step07cJudaica, Step07dSimbolica,
Step09MesmoLocal, Step11bTransporte, Step11PlanoChuva, Step12Estilo,
Step13Formalidade, Step14Paleta, Step15Tom, Step16Referencias, Step23Toalha,
Step60Fornecedores, StepA6~A16 (11 steps), StepB8~B18 (11 steps),
StepC6~C15 (8 steps), StepD2~D23 (22 steps), StepE1~E19 (19 steps), StepI6

### Steps com texto livre (13 arquivos)
Estes NÃO são binários — ficam na Fase 2 ou no Cadastro/Perfil:
Step02NomeCasal → **mover para Cadastro/Perfil**
Step07aCatolica, Step07bEvangelica → campo livre dentro de step de múltipla escolha
Step12Estilo → tem upload de referências (modo ativo)
Step16Referencias → upload/link Pinterest (modo ativo)
StepA15TradicaoFamiliar, StepA16RestricaoCultural → texto livre — Fase 2
StepA7TempoJuntos → texto livre — Fase 2
StepB16DefiniramEntrada → texto livre — Fase 2
StepC12ConvidadosForaCidade → numérico — Fase 2
StepE13HorarioMakingOfNoiva, StepE14HorarioMakingOfNoivo → horário — Fase 2
StepE15DestinoLuaDeMel → texto livre — Fase 2

### Problema do algoritmo
- Condicionais verificam campos que ainda não foram preenchidos (dependência fora de ordem)
- Exemplo: StepD1 verifica `estado.flores` mas flores só é perguntado depois no Bloco E
- Resultado: ~95 steps nunca aparecem para ninguém
- Solução: novo motor com config por step (ver acima)

---

## ORDEM DE TRABALHO — O QUE FAZER AGORA

### ETAPA 1 — Pagamento (rápido, desbloqueia os testes)
1. Remover integração MP SDK do `pages/memorial/conclusao.jsx`
2. Substituir por link de pagamento (PIX + cartão) hardcoded temporariamente
3. Testar fluxo completo questionário → conclusão → link de pagamento

### ETAPA 2 — Cadastro/Perfil antes do questionário
1. Criar `pages/memorial/perfil.jsx` — coleta nome, data, cidade, orçamento
2. Criar evento no banco AQUI após login
3. Redirecionar para `/memorial` após criar evento
4. Remover criação de evento de dentro do questionário

### ETAPA 3 — Novo motor do questionário
1. Definir config de cada step (fase, tipo, dependeDe, campo)
2. Reescrever `utils/algoritmo.js` para ler configs automaticamente
3. Reescrever `components/memorial/MemorialOrchestrator.jsx` para Fase 1 + Fase 2
4. NÃO mexer nos componentes visuais dos steps — só adicionar export config

### ETAPA 4 — Imagens dos cards
1. Fase 1 (swipe): 1 imagem grande por pergunta, composição segura no centro
2. Fase 2 (aprofundamento): imagens abstratas nos cards menores
3. Geração: SVG abstratos ou ChatGPT em lotes

### ETAPA 5 — Validação completa
1. Testar questionário completo
2. Testar painel cerimonialista
3. Testar painel fornecedor
4. Testar fluxo de pagamento

---

## REGRAS ABSOLUTAS (nunca quebrar)

- Zero hex hardcoded — sempre variáveis CSS
- Zero emojis — ícones via `components/ui/Icon.jsx`
- Zero middleware — proteção de rota via `getServerSideProps` ou client-side
- Zero bibliotecas novas sem autorização
- Mobile-first 390px base
- Linguagem inclusiva — nunca "noiva/noivo" hardcoded
- `/` continua redirecionando pro memorial — não mudar
- Pedir arquivo original antes de modificar qualquer coisa
- Confirmar cada etapa antes de avançar para a próxima
- Nunca reescrever um módulo inteiro de uma vez — sempre por partes

---

## ARQUIVOS CRÍTICOS — NÃO MEXER SEM AUTORIZAÇÃO

- `context/AuthContext.jsx` — auth, logout, detecção de tipo de usuário
- `utils/algoritmo.js` — motor de navegação do questionário
- `components/memorial/MemorialOrchestrator.jsx` — orquestrador do questionário
- `next.config.js` — basePath, CSP, imagens
- `pages/index.js` — redirect para /memorial (não virar landing)

---

## VARIÁVEIS DE AMBIENTE NECESSÁRIAS (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MP_ACCESS_TOKEN (manter mas não usar no SDK)
NEXT_PUBLIC_SITE_URL=https://arxum.csstudios.site/descomplicai
NEXT_PUBLIC_BASE_PATH=/descomplicai
```

---

*Cole este documento no início de qualquer sessão nova antes de fazer qualquer pergunta ou tarefa.*