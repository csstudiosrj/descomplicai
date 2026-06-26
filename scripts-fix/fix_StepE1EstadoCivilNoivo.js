/**
 * Script de correção segura para StepE1EstadoCivilNoivo.jsx
 * Substitui hardcode "noivo/noiva/casamento" por termos dinâmicos
 * 
 * USO: node fix_StepE1EstadoCivilNoivo.js <caminho-do-arquivo>
 */

const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node fix_StepE1EstadoCivilNoivo.js <caminho-do-arquivo>');
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

// 1. aria-label do fieldset
content = content.replace(
  /aria-label="Estado civil do noivo"/g,
  'aria-label={`Estado civil do ${termos.pessoa2}`}'
);

// 2. Título da pergunta
content = content.replace(
  /"Qual o estado civil do noivo\?"/g,
  '{`Qual o estado civil do ${termos.pessoa2}?`}'
);

// 3. Descrição/subtítulo
content = content.replace(
  /"Já teve evento civil anterior"/g,
  '{`Já teve ${termos.celebracao} civil anterior`}'
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
