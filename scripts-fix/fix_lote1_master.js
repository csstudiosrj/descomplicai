/**
 * Script master de correção — LOTE 1 (9 arquivos)
 * Executa todos os scripts de substituição em sequência
 * 
 * USO: node fix_lote1_master.js <diretorio-steps>
 * Exemplo: node fix_lote1_master.js ./components/memorial/steps
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const stepsDir = process.argv[2];
if (!stepsDir) {
  console.error('Uso: node fix_lote1_master.js <diretorio-steps>');
  console.error('Exemplo: node fix_lote1_master.js ./components/memorial/steps');
  process.exit(1);
}

if (!fs.existsSync(stepsDir)) {
  console.error('Diretório não encontrado:', stepsDir);
  process.exit(1);
}

const scripts = [
  { name: 'StepE1EstadoCivilNoivo.jsx', script: 'fix_StepE1EstadoCivilNoivo.js' },
  { name: 'StepE7NacionalidadeNoivo.jsx', script: 'fix_StepE7NacionalidadeNoivo.js' },
  { name: 'StepD11TrajeNoivoContratado.jsx', script: 'fix_StepD11TrajeNoivoContratado.js' },
  { name: 'StepB9CursoNoivos.jsx', script: 'fix_StepB9CursoNoivos.js' },
  { name: 'StepL4CarroNoivos.jsx', script: 'fix_StepL4CarroNoivos.js' },
  { name: 'StepE6CertidaoObitoNoiva.jsx', script: 'fix_StepE6CertidaoObitoNoiva.js' },
  { name: 'StepE5CertidaoObitoNoivo.jsx', script: 'fix_StepE5CertidaoObitoNoivo.js' },
  { name: 'StepE14HorarioMakingOfNoivo.jsx', script: 'fix_StepE14HorarioMakingOfNoivo.js' },
  { name: 'Step00Casal.jsx', script: 'fix_Step00Casal.js' },
];

const scriptsDir = __dirname;

console.log('═══════════════════════════════════════════════════════');
console.log('  CORREÇÃO LOTE 1 — 9 ARQUIVOS');
console.log('═══════════════════════════════════════════════════════\n');

for (const item of scripts) {
  const filePath = path.join(stepsDir, item.name);
  const scriptPath = path.join(scriptsDir, item.script);

  console.log(`\n▶ ${item.name}`);
  console.log('  ───────────────────────────────────────');

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Arquivo não encontrado: ${filePath}`);
    continue;
  }

  if (!fs.existsSync(scriptPath)) {
    console.log(`  ⚠️  Script não encontrado: ${scriptPath}`);
    continue;
  }

  try {
    execSync(`node "${scriptPath}" "${filePath}"`, { stdio: 'inherit' });
    console.log(`  ✅ Concluído`);
  } catch (err) {
    console.log(`  ❌ Erro: ${err.message}`);
  }
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('  LOTE 1 CONCLUÍDO');
console.log('═══════════════════════════════════════════════════════');
console.log('\nPróximos passos:');
console.log('  1. npm run build');
console.log('  2. git add . && git commit -m "fix: substitui hardcode noiva/noivo/casamento por termos dinâmicos (lote 1)"');
console.log('  3. git push');
