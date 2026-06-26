/**
 * Script MASTER DEFINITIVO - LOTE 1 (RESTANTES)
 * Substitui hardcode nos 6 arquivos que faltaram
 * 
 * USO: node fix_lote1_restantes.js <diretorio-steps>
 */

const fs = require('fs');
const path = require('path');

const stepsDir = process.argv[2];
if (!stepsDir) {
  console.error('Uso: node fix_lote1_restantes.js <diretorio-steps>');
  process.exit(1);
}

const configs = [
  {
    file: 'StepD11TrajeNoivoContratado.jsx',
    replacements: [
      { from: /aria-label="Traje do noivo contratado"/g, to: 'aria-label={`Traje do ${termos.pessoa2} contratado`}' },
      { from: /Já contratou traje do noivo\?/g, to: '{`Já contratou traje do ${termos.pessoa2}?`}' },
    ]
  },
  {
    file: 'StepB9CursoNoivos.jsx',
    replacements: [
      { from: /aria-label="Curso de noivos"/g, to: 'aria-label={`Curso de ${termos.pessoa1} e ${termos.pessoa2}`}' },
      { from: /Já fez curso de noivos\?/g, to: '{`Já fez curso de ${termos.pessoa1} e ${termos.pessoa2}?`}' },
    ]
  },
  {
    file: 'StepL4CarroNoivos.jsx',
    replacements: [
      { from: /subtexto: 'Carro decorado para os noivos'/g, to: 'subtexto: `{`Carro decorado para os ${termos.pessoa1} e ${termos.pessoa2}`}`' },
      { from: /Carro dos noivos/g, to: '{`Carro dos ${termos.pessoa1} e ${termos.pessoa2}`}' },
    ]
  },
  {
    file: 'StepE14HorarioMakingOfNoivo.jsx',
    replacements: [
      { from: /Horário do making of do noivo/g, to: '{`Horário do making of do ${termos.pessoa2}`}' },
    ]
  },
  {
    file: 'Step00Casal.jsx',
    replacements: [
      { from: /label: 'Noiva e Noivo'/g, to: 'label: `{`${termos.pessoa1} e ${termos.pessoa2}`}`' },
      { from: /label: 'Duas Noivas'/g, to: 'label: `{`Duas ${termos.pessoa1}s`}`' },
      { from: /label: 'Dois Noivos'/g, to: 'label: `{`Dois ${termos.pessoa2}s`}`' },
    ]
  },
];

console.log('═══════════════════════════════════════════════════════');
console.log('  CORREÇÃO RESTANTES — LOTE 1 (6 arquivos)');
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

  for (const rep of config.replacements) {
    if (content.includes(rep.from.source || rep.from)) {
      content = content.replace(rep.from, rep.to);
      modified = true;
      console.log(`  ✅ Substituído: ${rep.from.source || rep.from}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ Arquivo salvo`);
  } else {
    console.log(`  ℹ️  Nenhuma modificação necessária`);
  }
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('  RESTANTES CONCLUÍDO');
console.log('═══════════════════════════════════════════════════════');
