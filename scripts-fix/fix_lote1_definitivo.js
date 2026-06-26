/**
 * Script MASTER DEFINITIVO - LOTE 1
 * Substitui hardcode "noiva/noivo/casamento/casal" por termos dinâmicos
 * em 9 arquivos do memorial.
 * 
 * USO: node fix_lote1_definitivo.js <diretorio-steps>
 * Exemplo: node fix_lote1_definitivo.js ./components/memorial/steps
 */

const fs = require('fs');
const path = require('path');

const stepsDir = process.argv[2];
if (!stepsDir) {
  console.error('Uso: node fix_lote1_definitivo.js <diretorio-steps>');
  process.exit(1);
}

// ============================================
// CONFIGURAÇÃO POR ARQUIVO
// ============================================

const configs = [
  {
    file: 'StepE1EstadoCivilNoivo.jsx',
    replacements: [
      { from: /\/\/ StepE1EstadoCivilNoivo — Qual o estado civil do noivo\?/, to: '// StepE1EstadoCivilNoivo — Estado civil' },
      { from: /aria-label="Estado civil do noivo"/g, to: 'aria-label={`Estado civil do ${termos.pessoa2}`}' },
      { from: /Qual o estado civil do noivo\?/g, to: '{`Qual o estado civil do ${termos.pessoa2}?`}' },
    ],
    moveOpcoes: true,
    opcoesTemplate: `const OPCOES = [\n    { valor: "solteiro", label: \`Solteiro(a)\`, desc: \`Nunca teve \${termos.celebracao} civil\` },\n    { valor: "divorciado", label: \`Divorciado(a)\`, desc: \`Já teve \${termos.celebracao} civil anterior\` },\n    { valor: "viuvo", label: \`Viúvo(a)\`, desc: \`Cônjuge anterior faleceu\` }\n  ];`
  },
  {
    file: 'StepE7NacionalidadeNoivo.jsx',
    replacements: [
      { from: /\/\/ StepE7NacionalidadeNoivo — Qual a nacionalidade do noivo\?/, to: '// StepE7NacionalidadeNoivo — Nacionalidade' },
      { from: /aria-label="Nacionalidade do noivo"/g, to: 'aria-label={`Nacionalidade do ${termos.pessoa2}`}' },
      { from: /Qual a nacionalidade do noivo\?/g, to: '{`Qual a nacionalidade do ${termos.pessoa2}?`}' },
    ],
    moveOpcoes: true,
    opcoesTemplate: `const OPCOES = [\n    { valor: "brasileiro", label: \`Brasileiro(a)\`, desc: \`Nascido(a) no Brasil\` },\n    { valor: "outro", label: \`Outro(a)\`, desc: \`Outra nacionalidade\` }\n  ];`
  },
  {
    file: 'StepD11TrajeNoivoContratado.jsx',
    replacements: [
      { from: /\/\/ StepD11TrajeNoivoContratado — Qual o traje do noivo\?/, to: '// StepD11TrajeNoivoContratado — Traje' },
      { from: /aria-label="Traje do noivo"/g, to: 'aria-label={`Traje do ${termos.pessoa2}`}' },
      { from: /Qual o traje do noivo\?/g, to: '{`Qual o traje do ${termos.pessoa2}?`}' },
    ],
    moveOpcoes: false
  },
  {
    file: 'StepB9CursoNoivos.jsx',
    replacements: [
      { from: /\/\/ StepB9CursoNoivos — Qual o curso dos noivos\?/, to: '// StepB9CursoNoivos — Curso' },
      { from: /aria-label="Curso dos noivos"/g, to: 'aria-label={`Curso dos ${termos.pessoa1} e ${termos.pessoa2}`}' },
      { from: /Qual o curso dos noivos\?/g, to: '{`Qual o curso dos ${termos.pessoa1} e ${termos.pessoa2}?`}' },
    ],
    moveOpcoes: false
  },
  {
    file: 'StepL4CarroNoivos.jsx',
    replacements: [
      { from: /\/\/ StepL4CarroNoivos — Qual o carro dos noivos\?/, to: '// StepL4CarroNoivos — Carro' },
      { from: /aria-label="Carro dos noivos"/g, to: 'aria-label={`Carro dos ${termos.pessoa1} e ${termos.pessoa2}`}' },
      { from: /Qual o carro dos noivos\?/g, to: '{`Qual o carro dos ${termos.pessoa1} e ${termos.pessoa2}?`}' },
    ],
    moveOpcoes: false
  },
  {
    file: 'StepE6CertidaoObitoNoiva.jsx',
    replacements: [
      { from: /\/\/ StepE6CertidaoObitoNoiva — Certidão de óbito da noiva/, to: '// StepE6CertidaoObitoNoiva — Certidão de óbito' },
      { from: /aria-label="Certidão de óbito da noiva"/g, to: 'aria-label={`Certidão de óbito do(a) ${termos.pessoa1}`}' },
      { from: /Certidão de óbito da noiva/g, to: '{`Certidão de óbito do(a) ${termos.pessoa1}`}' },
    ],
    moveOpcoes: false
  },
  {
    file: 'StepE5CertidaoObitoNoivo.jsx',
    replacements: [
      { from: /\/\/ StepE5CertidaoObitoNoivo — Certidão de óbito do noivo/, to: '// StepE5CertidaoObitoNoivo — Certidão de óbito' },
      { from: /aria-label="Certidão de óbito do noivo"/g, to: 'aria-label={`Certidão de óbito do(a) ${termos.pessoa2}`}' },
      { from: /Certidão de óbito do noivo/g, to: '{`Certidão de óbito do(a) ${termos.pessoa2}`}' },
    ],
    moveOpcoes: false
  },
  {
    file: 'StepE14HorarioMakingOfNoivo.jsx',
    replacements: [
      { from: /\/\/ StepE14HorarioMakingOfNoivo — Horário do making of do noivo/, to: '// StepE14HorarioMakingOfNoivo — Horário do making of' },
      { from: /aria-label="Horário do making of do noivo"/g, to: 'aria-label={`Horário do making of do ${termos.pessoa2}`}' },
      { from: /Qual o horário do making of do noivo\?/g, to: '{`Qual o horário do making of do ${termos.pessoa2}?`}' },
    ],
    moveOpcoes: false
  },
  {
    file: 'Step00Casal.jsx',
    replacements: [
      { from: /\/\/ Step00Casal — Dados do casal/, to: '// Step00Casal — Dados do casal' },
      { from: /aria-label="Dados do casal"/g, to: 'aria-label={`Dados dos ${termos.pessoa1} e ${termos.pessoa2}`}' },
      { from: /Dados do casal/g, to: '{`Dados dos ${termos.pessoa1} e ${termos.pessoa2}`}' },
    ],
    moveOpcoes: false
  },
];

// ============================================
// PROCESSAMENTO
// ============================================

console.log('═══════════════════════════════════════════════════════');
console.log('  CORREÇÃO DEFINITIVA — LOTE 1 (9 arquivos)');
console.log('═══════════════════════════════════════════════════════\n');

for (const config of configs) {
  const filePath = path.join(stepsDir, config.file);
  console.log(`\n▶ ${config.file}`);
  console.log('  ───────────────────────────────────────');

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Arquivo não encontrado: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  let modified = false;

  // Aplicar replacements
  for (const rep of config.replacements) {
    if (content.includes(rep.from.source || rep.from)) {
      content = content.replace(rep.from, rep.to);
      modified = true;
      console.log(`  ✅ Substituído: ${rep.from.source || rep.from}`);
    }
  }

  // Mover OPCOES para dentro do componente se necessário
  if (config.moveOpcoes) {
    const opcoesMatch = content.match(/const OPCOES = \[\s*\{[\s\S]*?\}\s*\];/);
    if (opcoesMatch && content.indexOf(opcoesMatch[0]) < content.indexOf('export default function')) {
      content = content.replace(opcoesMatch[0], '');
      console.log('  ✅ Removido: const OPCOES do topo');

      const termosLine = "const termos = getTermos(perfil);";
      content = content.replace(termosLine, termosLine + "\n\n  " + config.opcoesTemplate);
      console.log('  ✅ Inserido: const OPCOES dentro do componente');
      modified = true;
    }
  }

  // Limpar linhas em branco duplicadas
  content = content.replace(/\n{3,}/g, '\n\n');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ Arquivo salvo`);
  } else {
    console.log(`  ℹ️  Nenhuma modificação necessária`);
  }
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('  LOTE 1 CONCLUÍDO');
console.log('═══════════════════════════════════════════════════════');
console.log('\nPróximos passos:');
console.log('  1. npm run build');
console.log('  2. git add . && git commit -m "fix: substitui hardcode noiva/noivo/casamento por termos dinâmicos (lote 1)" && git push');
