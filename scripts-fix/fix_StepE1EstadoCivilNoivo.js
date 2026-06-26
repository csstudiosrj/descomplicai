/**
 * Script de correção DEFINITIVO para StepE1EstadoCivilNoivo.jsx
 * Não aborta. Faz as substituições direto.
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

console.log('\n📄 Processando: StepE1EstadoCivilNoivo.jsx');

// ============================================
// SUBSTITUIÇÕES DIRETAS (sem verificação de segurança)
// ============================================

// 1. Comentário do topo
content = content.replace(
  /\/\/ StepE1EstadoCivilNoivo — Qual o estado civil do noivo\?/,
  '// StepE1EstadoCivilNoivo — Estado civil'
);

// 2. aria-label
content = content.replace(
  /aria-label="Estado civil do noivo"/g,
  'aria-label={`Estado civil do ${termos.pessoa2}`}'
);

// 3. Título h1
content = content.replace(
  /Qual o estado civil do noivo\?/g,
  '{`Qual o estado civil do ${termos.pessoa2}?`}'
);

// 4. MOVER OPCOES PARA DENTRO DO COMPONENTE
const opcoesMatch = content.match(/const OPCOES = \[\s*\{[\s\S]*?\}\s*\];/);
if (opcoesMatch && content.indexOf(opcoesMatch[0]) < content.indexOf('export default function')) {
  content = content.replace(opcoesMatch[0], '');
  console.log('  ✅ Removido: const OPCOES do topo');

  const termosLine = "const termos = getTermos(perfil);";
  const newOpcoes = `const OPCOES = [\n    { valor: "solteiro", label: \`Solteiro(a)\`, desc: \`Nunca teve \${termos.celebracao} civil\` },\n    { valor: "divorciado", label: \`Divorciado(a)\`, desc: \`Já teve \${termos.celebracao} civil anterior\` },\n    { valor: "viuvo", label: \`Viúvo(a)\`, desc: \`Cônjuge anterior faleceu\` }\n  ];`;
  content = content.replace(termosLine, termosLine + "\n\n  " + newOpcoes);
  console.log('  ✅ Inserido: const OPCOES dentro do componente');
}

// 5. Limpar linhas em branco duplicadas
content = content.replace(/\n{3,}/g, '\n\n');

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
