#!/usr/bin/env node
// scripts/corrigir-imports-rate-limit.js
// Corrige os paths de import do lib/ratelimit que o script anterior errou

const fs = require('fs');
const path = require('path');

// Mapeamento: arquivo → path correto do import
const CORRECOES = {
  // 4 níveis (pages/api/cerimonialista/assistentes/convidar.js → ../../../lib/ratelimit)
  'pages/api/cerimonialista/assistentes/convidar.js': '../../../lib/ratelimit',
  'pages/api/cerimonialista/leads/criar.js': '../../../lib/ratelimit',
  'pages/api/cerimonialista/modelos/salvar.js': '../../../lib/ratelimit',

  // 3 níveis (pages/api/colaborador/convidar.js → ../../lib/ratelimit) — JÁ ESTÁ CERTO
  // Mas vamos verificar

  // 2 níveis (pages/api/contratos/criar.js → ../../lib/ratelimit) — JÁ ESTÁ CERTO
  // Mas vamos verificar

  // 1 nível (pages/api/gerar-pdf.js → ../lib/ratelimit) — JÁ ESTÁ CERTO
  // Mas vamos verificar
};

// Lista de todos os arquivos que precisam ser verificados
const ARQUIVOS = [
  'pages/api/cerimonialista/assistentes/convidar.js',
  'pages/api/cerimonialista/leads/criar.js',
  'pages/api/cerimonialista/modelos/salvar.js',
  'pages/api/colaborador/convidar.js',
  'pages/api/colaborador/validar.js',
  'pages/api/contratos/assinar-noivos.js',
  'pages/api/contratos/assinar.js',
  'pages/api/contratos/criar.js',
  'pages/api/contratos/enviar.js',
  'pages/api/convite/aceitar.js',
  'pages/api/email/enviar.js',
  'pages/api/fornecedor/cadastro.js',
  'pages/api/gerar-pdf.js',
  'pages/api/ia/gerar-memorial.js',
  'pages/api/memorial/salvar.js',
  'pages/api/mensagens/enviar.js',
  'pages/api/pagamento/criar.js',
];

function calcularImportPath(filePath) {
  // Conta quantos níveis de pasta além de pages/api/
  const partes = filePath.replace('pages/api/', '').split('/');
  const niveis = partes.length - 1; // -1 porque o último é o arquivo
  
  // lib/ratelimit está na raiz, então precisamos subir (niveis + 1) níveis
  // pages/api/x.js → ../lib/ratelimit (1 nível + 1 = 2? Não...)
  
  // Na verdade:
  // pages/api/gerar-pdf.js → ../lib/ratelimit (1 nível acima de api)
  // pages/api/contratos/criar.js → ../../lib/ratelimit (2 níveis: api → contratos)
  // pages/api/colaborador/convidar.js → ../../lib/ratelimit (2 níveis)
  // pages/api/cerimonialista/assistentes/convidar.js → ../../../lib/ratelimit (3 níveis)
  
  const depth = partes.length; // número de pastas + arquivo
  // depth 1 = pages/api/arquivo.js → ../lib
  // depth 2 = pages/api/pasta/arquivo.js → ../../lib
  // depth 3 = pages/api/pasta/subpasta/arquivo.js → ../../../lib
  
  return '../'.repeat(depth) + 'lib/ratelimit';
}

function corrigirArquivo(filePath) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Não encontrado: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const importPathCorreto = calcularImportPath(filePath);
  
  // Regex para encontrar o import errado do ratelimit
  const regex = /import\s+\{\s*withRateLimit,\s*\w+Limiter\s*\}\s+from\s+["'][^"']*lib\/ratelimit["'];?/;
  
  if (!regex.test(content)) {
    console.log(`⏭️  Sem import de ratelimit: ${filePath}`);
    return false;
  }

  const novoImport = `import { withRateLimit, ${extrairLimiterName(content)} } from "${importPathCorreto}";`;
  
  content = content.replace(regex, novoImport);
  
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Corrigido: ${filePath} → ${importPathCorreto}`);
  return true;
}

function extrairLimiterName(content) {
  const match = content.match(/withRateLimit,\s*(\w+Limiter)/);
  return match ? match[1] : 'strictLimiter';
}

// === EXECUÇÃO ===
console.log('🔧 Corrigindo imports de rate limit...\n');

let corrigidos = 0;
let pulados = 0;

for (const filePath of ARQUIVOS) {
  const result = corrigirArquivo(filePath);
  if (result) corrigidos++;
  else pulados++;
}

console.log(`\n📊 Resumo:`);
console.log(`   ✅ Corrigidos: ${corrigidos}`);
console.log(`   ⏭️  Pulados: ${pulados}`);