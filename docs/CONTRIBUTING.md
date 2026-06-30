# Guia de Contribuicao — Descomplicaí

> Regras e padroes para todos que contribuem com o projeto.

---

## 1. Como Abrir PR

### Branch Naming

| Prefixo | Uso |
|---------|-----|
| `feat/` | Nova funcionalidade |
| `fix/` | Correcao de bug |
| `docs/` | Documentacao |
| `test/` | Testes |
| `perf/` | Performance |
| `refactor/` | Refatoracao |
| `ci/` | CI/CD |
| `security/` | Seguranca |

Exemplo: `feat/novo-step-memorial`, `fix/rate-limit-cors`

### Commits Semanticos

```
feat: nova funcionalidade
fix: correcao de bug
docs: documentacao
test: testes
perf: melhoria de performance
refactor: refatoracao de codigo
chore: tarefas de manutencao
ci: configuracao de CI/CD
security: correcao de seguranca
```

Exemplo: `feat: adiciona step de documentacao no memorial`

### PR Checklist

Antes de abrir o PR, verifique:

- [ ] Build passa na Vercel (`npm run build`)
- [ ] Testes Jest passam (`npm test`)
- [ ] Lint passa (`npm run lint`)
- [ ] Nao ha `console.log` em producao
- [ ] Nao ha mock/placeholder em funcionalidade critica
- [ ] Env vars novas estao documentadas no README
- [ ] APIs publicas usam `withRateLimit`
- [ ] APIs admin/cron usam `supabaseAdmin`
- [ ] Componentes UI tem ARIA
- [ ] Categorias usam `utils/catalogoFornecedores.js` (nunca texto livre)
- [ ] Termos de casal usam `utils/linguagemCasal.js` (pessoa1/pessoa2)

---

## 2. Padroes de Codigo

### Categorias

**SEMPRE** usar o catalogo centralizado em `utils/catalogoFornecedores.js`.

```js
// Correto
import { CATEGORIAS } from "@/utils/catalogoFornecedores";
const categoria = CATEGORIAS.FOTOGRAFIA;

// Errado
const categoria = "Fotografia";
```

> **Regra:** Nunca usar campos de texto livre para categoria em nenhum modulo (fornecedores, financeiro, checklist, tarefas, etc.).

### Termos Inclusivos

**SEMPRE** usar `utils/linguagemCasal.js` (pessoa1/pessoa2, nunca noiva/noivo).

```js
// Correto
import { getTermos } from "@/utils/linguagemCasal";
const { pessoa1, pessoa2 } = getTermos(perfil);

// Errado
const noiva = "Maria";
const noivo = "Joao";
```

### ARIA (Acessibilidade)

Todo componente UI deve ter atributos ARIA:

```jsx
// Correto
<button aria-label="Fechar modal" onClick={onClose}>
  <Icon name="x" ariaLabel="Fechar" />
</button>

// Errado
<button onClick={onClose}>X</button>
```

Requisitos minimos:
- `aria-label` em botoes sem texto visivel
- `aria-describedby` em inputs com erro
- `aria-invalid` em campos invalidos
- `role` e `aria-live` em toasts e alerts
- `aria-expanded` e `aria-selected` em dropdowns

### Rate Limit

Toda API publica deve usar `withRateLimit`:

```js
// Correto
import { withRateLimit, limiters } from "@/lib/ratelimit";
export default withRateLimit(handler, limiters.cadastro);

// Errado
export default handler;
```

### Service Role

APIs admin e cron **SEMPRE** usam `supabaseAdmin` (service role), nunca o cliente anonimo:

```js
// Correto
import { supabaseAdmin } from "@/lib/supabaseAdmin";
const { data } = await supabaseAdmin.from("admins").select("*");

// Errado
import { supabase } from "@/lib/supabase";
const { data } = await supabase.from("admins").select("*");
```

---

## 3. Checklist Antes de Merge

```markdown
- [ ] Build passa na Vercel
- [ ] Testes Jest passam
- [ ] Nao ha console.log em producao
- [ ] Nao ha mock/placeholder em funcionalidade critica
- [ ] Env vars documentadas no README
```

---

## 4. Revisao de Codigo

### O que o revisor deve verificar

1. **Seguranca:** Rate limit em APIs publicas? Service role em admin/cron?
2. **Acessibilidade:** ARIA presente? Focus visivel? Reduced motion?
3. **Performance:** Nao ha queries N+1? Indices cobertos?
4. **Qualidade:** Sem hardcode de texto? Sem console.log?
5. **Testes:** Cobertura minima de 70% para APIs novas?

### O que NAO aceitamos

- Placeholders em funcionalidade critica (ex: "em breve", "TODO")
- Mock de dados em producao
- Env vars hardcoded
- `console.log` em producao
- Texto livre para categorias
- Termos "noiva/noivo" hardcoded
