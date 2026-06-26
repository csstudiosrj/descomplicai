/**
 * Script de correção para StepE7NacionalidadeNoivo.jsx
 */

const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node fix_StepE7NacionalidadeNoivo.js <caminho-do-arquivo>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error('Arquivo não encontrado:', filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf-8');
const original = content;

console.log('\n📄 Processando: StepE7NacionalidadeNoivo.jsx');

const hasGetTermosImport = content.includes('import { getTermos }');
if (!hasGetTermosImport) {
  const lastImportMatch = content.match(/^(import\s+.*?from\s+['"][^'"]+['"];?)$/gm);
  if (lastImportMatch && lastImportMatch.length > 0) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    content = content.replace(lastImport, lastImport + "\nimport { getTermos } from '../../../utils/linguagemCasal';");
    console.log('  ✅ Injetado: import { getTermos }');
  } else {
    content = "import { getTermos } from '../../../utils/linguagemCasal';\n" + content;
    console.log('  ✅ Injetado no topo: import { getTermos }');
  }
} else {
  console.log('  ℹ️  import { getTermos } já existe');
}

const hasTermosConst = content.includes('const { perfil, termos }') ||
                       content.includes('const perfil = estadoAtual?.perfilCasal');
if (!hasTermosConst) {
  const funcMatch = content.match(/(export\s+default\s+)?function\s+\w+\s*\([^)]*\)\s*\{/);
  if (funcMatch) {
    const funcDecl = funcMatch[0];
    content = content.replace(funcDecl, funcDecl + "\n  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';\n  const termos = getTermos(perfil);");
    console.log('  ✅ Injetado: const perfil + termos');
  }
} else {
  console.log('  ℹ️  const perfil/termos já existe');
}

// Mover OPCOES/NACIONALIDADES para dentro se existir fora
const opcoesMatch = content.match(/const (OPCOES|NACIONALIDADES) = \[\s*\{[\s\S]*?\}\s*\];/);
if (opcoesMatch && content.indexOf(opcoesMatch[0]) < content.indexOf('export default function')) {
  const opcoesConst = opcoesMatch[0];
  const opcoesName = opcoesMatch[1];
  // Substituir labels masculinos
  let newOpcoes = opcoesConst
    .replace(/label: "Brasileiro"/g, 'label: `Brasileiro(a)`')
    .replace(/label: "Outro"/g, 'label: `Outro(a)`');

  content = content.replace(opcoesConst, '');
  console.log('  ✅ Removido: const ' + opcoesName + ' do topo');

  const termosLine = "const termos = getTermos(perfil);";
  content = content.replace(termosLine, termosLine + "\n\n  " + newOpcoes);
  console.log('  ✅ Inserido: const ' + opcoesName + ' dentro do componente');
}

// Substituições de hardcode
content = content.replace(
  /aria-label="Nacionalidade do noivo"/g,
  'aria-label={`Nacionalidade do ${termos.pessoa2}`}'
);
content = content.replace(
  /Qual a nacionalidade do noivo\?/g,
  '{`Qual a nacionalidade do ${termos.pessoa2}?`}'
);
content = content.replace(
  /\/\/ StepE7NacionalidadeNoivo — Qual a nacionalidade do noivo\?/,
  '// StepE7NacionalidadeNoivo — Nacionalidade'
);

content = content.replace(/\n{3,}/g, '\n\n');

function showDiff(original, modified) {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');
  console.log('\n========== DIFF ==========\n');
  for (let i = 0; i < Math.max(origLines.length, modLines.length); i++) {
    const o = origLines[i] || '';
    const m = modLines[i] || '';
    if (o !== m) {
      console.log(`--- Linha ${i + 1} ---`);
      console.log(`- ${o}`);
      console.log(`+ ${m}`);
      console.log('');
    }
  }
  console.log('==========================\n');
}

showDiff(original, content);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Arquivo salvo:', filePath);
