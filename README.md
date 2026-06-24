# Correções Missão 2 — Consistência de Campos

## Como aplicar

1. Faça backup dos arquivos originais (ou use git)
2. Descompacte este ZIP na raiz do projeto (sobrescreve os arquivos existentes)
3. Reinicie o servidor de desenvolvimento

## Arquivos alterados

### Steps (4 arquivos)
- `components/memorial/steps/StepH4MesaDocesExposta.jsx`
  - valor: 'True'/'False' → true/false (boolean)
- `components/memorial/steps/StepI5MudancaLook.jsx`
  - valor: 'True'/'False' → true/false (boolean)
- `components/memorial/steps/StepB5CriancasCerimonia.jsx`
  - valor: 'True'/'False' → true/false (boolean)
- `components/memorial/steps/StepG8MesaFrios.jsx`
  - valor: 'True'/'False' → true/false (boolean)

### Algoritmo (1 arquivo)
- `utils/algoritmo.js`
  - mobiliarioQual !== true → !estado.mobiliarioQual (falsy check)

### Gerador de Tarefas (1 arquivo)
- `utils/gerador-tarefas.js`
  - saveTheDate === true → saveTheDate === 'sim'
  - lembrancinhas !== true && !== 'ja_tenho' → lembrancinhas === 'sim'
  - kitSaida !== true && !== 'nao_vou_ter' → kitSaida === 'sim'
  - 6 regras com campos fantasmas simplificadas (removida dependência de campos inexistentes)
  - criancasCerimonia === true || === 'sim' → === true

### Estado Inicial (1 arquivo)
- `hooks/useMemorial.js`
  - Adicionados: saveTheDateEnviado, fotografoLuaDeMel, transporteNoivosContratado

## Testar após aplicar

1. Percorrer o fluxo e verificar se steps H4, I5, B5, G8 aparecem corretamente
2. Verificar se tarefas de mesa de doces, mudança de look, crianças na cerimônia, mesa de frios são geradas
3. Verificar se tarefas de lembrancinhas e kit de saída só aparecem quando usuário responde "sim"
