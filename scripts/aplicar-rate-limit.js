#!/usr/bin/env node
// scripts/aplicar-rate-limit.js
// Aplica rate limit automaticamente nas APIs públicas críticas do Descomplicaí

const fs = require('fs');
const path = require('path');

// Mapeamento: arquivo → limiter a usar
const LIMITES = {
  // Cadastros (5/min) — proteção contra spam de contas
  'pages/api/cerimonialista/cadastro.js': 'cadastroLimiter',
  'pages/api/fornecedor/cadastro.js': 'cadastroLimiter',

  // Pagamentos (10/min)
  'pages/api/pagamento/criar.js': 'pagamentoLimiter',

  // Convites (10/min)
  'pages/api/convite/validar.js': 'conviteLimiter',
  'pages/api/convite/aceitar.js': 'conviteLimiter',
  'pages/api/colaborador/convidar.js': 'conviteLimiter',
  'pages/api/colaborador/validar.js': 'conviteLimiter',

  // Mensagens (20/min)
  'pages/api/mensagens/enviar.js': 'strictLimiter',

  // Memorial (30/min)
  'pages/api/memorial/salvar.js': 'strictLimiter',
  'pages/api/memorial/criar-evento.js': 'strictLimiter',

  // IA (5/min)
  'pages/api/ia/gerar-memorial.js': 'cadastroLimiter',

  // PDF (10/min)
  'pages/api/gerar-pdf.js': 'pagamentoLimiter',

  // E-mail (10/min)
  'pages/api/email/enviar.js': 'pagamentoLimiter',

  // Contratos (10/min cada)
  'pages/api/contratos/criar.js': 'pagamentoLimiter',
  'pages/api/contratos/assinar.js': 'pagamentoLimiter',
  'pages/api/contratos/assinar-noivos.js': 'pagamentoLimiter',
  'pages/api/contratos/enviar.js': 'pagamentoLimiter',

  // Cerimonialista APIs (10/min cada)
  'pages/api/cerimonialista/assistentes/convidar.js': 'conviteLimiter',
  'pages/api/cerimonialista/leads/criar.js': 'conviteLimiter',
  'pages/api/cerimonialista/modelos/salvar.js': 'conviteLimiter',
};

function aplicarRateLimit(filePath, limiterName) {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Verifica se já tem rate limit
  if (content.includes('withRateLimit')) {
    console.log(`⏭️  Já tem rate limit: ${filePath}`);
    return false;
  }

  // Verifica se tem export default
  if (!content.includes('export default')) {
    console.log(`⚠️  Sem export default: ${filePath}`);
    return false;
  }

  // Verifica se já importa do ratelimit
  const hasRatelimitImport = content.includes('lib/rateLimit') || content.includes('lib/ratelimit');

  // Determina o import path relativo
  const depth = filePath.split('/').length - 2;
  const importPrefix = '../'.repeat(depth);

  // Adiciona import se não existir
  if (!hasRatelimitImport) {
    const importLine = `import { withRateLimit, ${limiterName} } from "${importPrefix}lib/rateLimit";\n`;
    content = importLine + content;
  }

  // Caso 1: export default nomeDaFuncao;
  const exportDefaultVarRegex = /export\s+default\s+(\w+);?\s*$/m;
  const matchVar = content.match(exportDefaultVarRegex);

  if (matchVar) {
    const funcName = matchVar[1];
    content = content.replace(
      exportDefaultVarRegex,
      `// Rate limit: ${limiterName}\nexport default withRateLimit(${funcName}, ${limiterName});`
    );
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Aplicado ${limiterName} em: ${filePath}`);
    return true;
  }

  // Caso 2: export default async function handler(...)
  const exportDefaultFuncRegex = /export\s+default\s+(async\s+)?function\s+(\w+)\s*\(/;
  const matchFunc = content.match(exportDefaultFuncRegex);

  if (matchFunc) {
    const isAsync = matchFunc[1] || '';
    const funcName = matchFunc[2];
    const newFuncName = `_${funcName}`;
    content = content.replace(
      `export default ${isAsync}function ${funcName}`,
      `${isAsync}function ${newFuncName}`
    );
    content += `\n// Rate limit: ${limiterName}\nexport default withRateLimit(${newFuncName}, ${limiterName});\n`;
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Aplicado ${limiterName} em: ${filePath}`);
    return true;
  }

  // Caso 3: arrow function
  const exportDefaultArrowRegex = /export\s+default\s+(async\s*)?\(.*?=>\s*\{/;
  if (exportDefaultArrowRegex.test(content)) {
    console.log(`⚠️  Arrow function detectada, precisa de ajuste manual: ${filePath}`);
    return false;
  }

  console.log(`⚠️  Padrão não reconhecido: ${filePath}`);
  return false;
}

// === EXECUÇÃO ===
console.log('🚀 Aplicando rate limit nas APIs críticas...\n');

let aplicados = 0;
let pulados = 0;
let erros = 0;

for (const [filePath, limiterName] of Object.entries(LIMITES)) {
  const result = aplicarRateLimit(filePath, limiterName);
  if (result) aplicados++;
  else if (fs.existsSync(path.resolve(filePath))) pulados++;
  else erros++;
}

console.log(`\n📊 Resumo:`);
console.log(`   ✅ Aplicados: ${aplicados}`);
console.log(`   ⏭️  Pulados (já tinham): ${pulados}`);
console.log(`   ⚠️  Erros/arquivos não encontrados: ${erros}`);

// Verifica se precisa adicionar novos limiters no lib/rateLimit.js
const ratelimitPath = path.resolve('lib/rateLimit.js');
if (fs.existsSync(ratelimitPath)) {
  const ratelimitContent = fs.readFileSync(ratelimitPath, 'utf8');
  const limitersUsados = [...new Set(Object.values(LIMITES))];
  const limitersFaltantes = limitersUsados.filter(l => !ratelimitContent.includes(l));

  if (limitersFaltantes.length > 0) {
    console.log(`\n⚠️  Limiters faltantes em lib/rateLimit.js: ${limitersFaltantes.join(', ')}`);
    console.log(`   Adicione-os manualmente ou o script vai falhar.`);
  }
} else {
  console.log(`\n⚠️  lib/rateLimit.js não encontrado em: ${ratelimitPath}`);
}

console.log(`\n💡 Próximo passo: git diff para revisar as mudanças`);
