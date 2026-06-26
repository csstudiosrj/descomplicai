/**
 * Script de correção segura para Step00Casal.jsx
 * Substitui hardcode "casal" por termos dinâmicos
 * 
 * USO: node fix_Step00Casal.js <caminho-do-arquivo>
 */

const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node fix_Step00Casal.js <caminho-do-arquivo>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error('Arquivo não encontrado:', filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf-8');
const original = content;

// ============================================
// SUBSTITUIÇÕES
// ============================================

// 1. aria-label
content = content.replace(
  /aria-label="Dados do casal"/g,
  'aria-label={`Dados dos ${termos.pessoa1} e ${termos.pessoa2}`}'
);
content = content.replace(
  /aria-label="Informações do casal"/g,
  'aria-label={`Informações dos ${termos.pessoa1} e ${termos.pessoa2}`}'
);

// 2. Título
content = content.replace(
  /"Dados do casal"/g,
  '{`Dados dos ${termos.pessoa1} e ${termos.pessoa2}`}'
);
content = content.replace(
  /"Informações do casal"/g,
  '{`Informações dos ${termos.pessoa1} e ${termos.pessoa2}`}'
);
content = content.replace(
  /"Qual o nome do casal\?"/g,
  '{`Qual o nome dos ${termos.pessoa1} e ${termos.pessoa2}?`}'
);
content = content.replace(
  /"Sobre o casal"/g,
  '{`Sobre os ${termos.pessoa1} e ${termos.pessoa2}`}'
);

// 3. Outras ocorrências de "casal" em texto visível (não em comentários/variáveis)
// "casamento" → termos.celebracao
content = content.replace(
  /"casamento"/g,
  '{`${termos.celebracao}`}'
);

// ============================================
// VERIFICAÇÃO DE SEGURANÇA
// ============================================

if (!content.includes('import { getTermos }')) {
  console.error('ERRO: import { getTermos } não encontrado!');
  process.exit(1);
}

if (!content.includes('const { perfil, termos }')) {
  console.error('ERRO: const { perfil, termos } não encontrado!');
  process.exit(1);
}

// ============================================
// DIFF
// ============================================

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
