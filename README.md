# Correção Missão 1 — Gerador de Tarefas (FINAL)

## Arquivo alterado
- `utils/gerador-tarefas.js`

## Mudanças desde a versão base

### Correções da Missão 2 (já aplicadas)
- saveTheDate === true → saveTheDate === 'sim'
- lembrancinhas !== true → lembrancinhas === 'sim'
- kitSaida !== true → kitSaida === 'sim'
- 6 campos fantasmas removidos das regras
- criancasCerimonia padronizado para boolean
- Função helper isDestinoInternacional() adicionada

### Regras adicionadas na Missão 1 (esta versão)
- E3: Obter certidão de divórcio do noivo
- E4: Obter certidão de divórcio da noiva
- E5: Obter certidão de óbito do cônjuge anterior do noivo
- E6: Obter certidão de óbito do cônjuge anterior da noiva
- E9: Verificar documentação para estrangeiro
- E10: Definir quem paga o casamento
- E12: Montar cronograma do dia do casamento
- E13: Definir horário do making of da noiva
- E14: Definir horário do making of do noivo
- D19: Agendar teste de beleza

### Regras já existentes (não alteradas)
- D9: Contratar espaço
- D13: Contratar transporte dos noivos
- E19: Verificar vacinas (lua de mel internacional)

## Total de regras: 84

## Como aplicar
```bash
cd ~/descomplicai && unzip -o correcoes-gerador-missao1-FINAL.zip
```
