# DOCUMENTO DE TRANSFERÊNCIA — Tarefa 3 (Descomplicaí)
> Cole este documento INTEIRO no início do chat novo para continuar de onde paramos.

## REGRAS DO USUÁRIO (rigorosas — respeitar sempre)
1. Usuário NÃO É DEV. Projeto no IDX (~/descomplicai) com deploy na Vercel/GitHub.
2. SEMPRE pedir os códigos originais via bash curto antes de começar (ou arquivo por arquivo pelo editor se o terminal cortar).
3. SEMPRE entregar os arquivos INTEIROS com as modificações, em ZIP (estrutura de pastas components/memorial/steps/... pronta pra descompactar na raiz).
4. NUNCA escrever código sem autorização explícita do usuário.
5. Fornecer bash SEPARADO para descompactar e bash SEPARADO para commit/push.

## OBJETIVO DA TAREFA 3
Replicar em TODOS os steps do memorial o padrão:
1. `import { getTermos } from "../../../utils/linguagemCasal";`
2. Dentro do componente: `const perfil = estadoAtual?.perfilCasal || "nao-especificar";` + `const termos = getTermos(perfil);` (padrão separado, NÃO destructuring)
3. Pulso visual: `cardPulsando` + `handleCardClick` com debounce 350ms + style inline (transition/transform/boxShadow) — já existe na maioria, só verificar
4. ARIA: `aria-hidden` em ícones decorativos, `aria-label` nos radiogroups/cards

## utils/linguagemCasal.js (JÁ EXISTE — NÃO MODIFICAR)
- Assinaturas: `getTermos()` | `getTermos('noiva-noivo')` | `getTermos('15anos','debutante')` | `termo(...)` | `adaptarFrase(...)`
- Perfis de casamento: 'noiva-noivo', 'duas-noivas', 'dois-noivos', 'nao-especificar'
- Outros tipos de evento: 15anos, barmitzvah, batmitzvah, formatura (cada um com seus perfis)
- Chaves REAIS retornadas: casal, casalCap, pessoa1, pessoa2, pessoa1ComArtigo, pessoa2ComArtigo, pronome, possessivo, artigo, chamada, damas, pajens, pais, cavalheiros, rabino, turma, professor, paraninfo (+ versões Cap)
- NÃO existem chaves por step (ex.: 'tipoFlores') — ver "Padronização de aria-label" abaixo

## PADRONIZAÇÃO DE aria-label (acordada com o usuário — Opção A)
`aria-label={termos?.<chaveDoStep> || "<texto original>"}` — a chave ainda não existe no util, então o fallback preserva o texto original e NADA QUEBRA. Quando o util for expandido no futuro, os labels viram dinâmicos automaticamente.

## FIX JÁ APLICADO NO MemorialOrchestrator.jsx
- Problema: orchestrator passava `estado={estado}` mas os steps leem `estadoAtual?.perfilCasal`
- Correção entregue: adicionada a linha `estadoAtual={estado}` no render do `<StepComponent>` (ambas as props coexistem)
- Status: ZIP entregue, aguardando commit pelo usuário

## COBERTURA getTermos (status)
- Total de arquivos na pasta steps: ~142 | COM getTermos: 104 | SEM: 38 (1 é backup → 37 steps reais)
- Após o LOTE 2 (entregue neste chat): 109 com / 32 sem
- LOTE 1 (9 arquivos, já tinham o padrão antes): StepE1, StepE7, StepD11, StepB9, StepL4, StepE6, StepE5, StepE14, Step00
- Já entregues neste chat: StepC7GeradorLocal, StepC8ReservouLocalCerimonia, StepC9ReservouLocalFesta, StepD10VestidoContratado, StepD12CerimonialistaContratado (lote inicial) + StepD1TipoFlores, StepD2TipoIluminacao, StepD3MobiliarioQual, StepD4FotografoContratado, StepD5FilmagemContratada (LOTE 2)
- Housekeeping pendente: mover `components/memorial/steps/Step00Casal.jsx.backup.20260711_012244` para `backups_steps/` (não é step, suja os greps)

## PRÓXIMOS LOTES (32 steps SEM getTermos) — pedir originais, aplicar padrão, ZIP, commit
- LOTE 3: StepD6BuffetContratado, StepD7DecoracaoContratada, StepD8MusicaContratada, StepD9EspacoContratado, StepD13TransporteContratado
- LOTE 4: StepD14PapelariaContratada, StepD15CabineFotos, StepD16Drone, StepD17AnimacaoInfantil, StepD18VestidoComprado
- LOTE 5: StepD19TesteBeleza, StepD20ConvitesEncomendados, StepD21SaveTheDate, StepD22Lembrancinhas, StepD23KitSaida
- LOTE 6: StepE11FormaPagamento, StepE12CronogramaDia, StepE15DestinoLuaDeMel, StepE16LuaDeMelReservada, StepE17PassaporteValido
- LOTE 7: StepE18Visto, StepE19Vacinas, StepG8MesaFrios, StepG9BebidasPorPessoa, StepG10MenuInfantil
- LOTE 8: StepH3FogosSparklers, StepH4MesaDocesExposta, StepI6QuantasMadrinhas, StepL1Aliancas, StepL5TransporteConvidados, StepL6Seguranca, StepM1LuaDeMel

## BASH MODELO PARA PEDIR ORIGINAIS (por lote)
cd ~/descomplicai/components/memorial/steps && for f in NOME1.jsx NOME2.jsx ...; do echo ">>> === $f ==="; cat $f; echo "<<< === FIM $f ==="; echo ""; done
(Se o terminal cortar: abrir arquivo por arquivo no editor do IDX, Ctrl+A, Ctrl+C, colar com marcadores >>> === nome === / <<< === FIM nome ===)

## BASH MODELO DE DESCOMPACTAÇÃO
cd ~/descomplicai && unzip -o NOME_DO_LOTE.zip && rm NOME_DO_LOTE.zip

## BASH MODELO DE COMMIT/PUSH (SEPARADO — só após testar no navegador)
cd ~/descomplicai && git add <arquivos> && git commit -m "Tarefa 3: getTermos + pulso + ARIA (LOTE X)" && git push

## VALIDAÇÃO ANTES DE ENTREGAR CADA ARQUIVO
- `import { getTermos }` presente | `perfil`/`termos` no padrão separado | pulso intacto | aria-label dinâmico com fallback | chaves {} e () balanceadas | nenhuma lógica de step reescrita
