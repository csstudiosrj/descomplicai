/**
 * Script de correção segura para StepE6CertidaoObitoNoiva.jsx
 * Substitui hardcode "noiva/cônjuge" por termos dinâmicos
 * 
 * USO: node fix_StepE6CertidaoObitoNoiva.js <caminho-do-arquivo>
 */

const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node fix_StepE6CertidaoObitoNoiva.js <caminho-do-arquivo>');
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
  /aria-label="Certidão de óbito da noiva"/g,
  'aria-label={`Certidão de óbito do(a) ${termos.pessoa1}`}'
);
content = content.replace(
  /aria-label="Certidão de óbito do cônjuge"/g,
  'aria-label={`Certidão de óbito do(a) ${termos.pessoa1}`}'
);

// 2. Título
content = content.replace(
  /"Certidão de óbito da noiva"/g,
  '{`Certidão de óbito do(a) ${termos.pessoa1}`}'
);
content = content.replace(
  /"Certidão de óbito do cônjuge"/g,
  '{`Certidão de óbito do(a) ${termos.pessoa1}`}'
);
content = content.replace(
  /"Qual a certidão de óbito da noiva\?"/g,
  '{`Qual a certidão de óbito do(a) ${termos.pessoa1}?`}'
);
content = content.replace(
  /"Qual a certidão de óbito do cônjuge\?"/g,
  '{`Qual a certidão de óbito do(a) ${termos.pessoa1}?`}'
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
