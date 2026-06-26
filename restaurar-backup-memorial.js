#!/usr/bin/env node
/**
 * restaurar-backup-memorial.js
 * Restaura os arquivos do memorial a partir do backup
 */

const fs = require('fs');
const path = require('path');

const STEPS_DIR = path.resolve('components/memorial/steps');
const BACKUP_DIR = path.resolve('components/memorial/steps-backup-script');

const ARQUIVOS_LOTE1 = [
  'StepE2EstadoCivilNoiva.jsx',
  'StepE1EstadoCivilNoivo.jsx',
  'StepE10QuemPaga.jsx',
  'StepE8NacionalidadeNoiva.jsx',
  'StepE7NacionalidadeNoivo.jsx',
  'StepE4CertidaoDivorcioNoiva.jsx',
  'StepE3CertidaoDivorcioNoivo.jsx',
  'StepD11TrajeNoivoContratado.jsx',
  'StepB9CursoNoivos.jsx',
  'StepL4CarroNoivos.jsx',
  'StepE6CertidaoObitoNoiva.jsx',
  'StepE5CertidaoObitoNoivo.jsx',
  'StepE14HorarioMakingOfNoivo.jsx',
  'StepE13HorarioMakingOfNoiva.jsx',
  'Step00Casal.jsx',
];

console.log('Restaurando backup dos arquivos do memorial...\n');

let restaurados = 0;
let naoEncontrados = 0;

for (const arquivo of ARQUIVOS_LOTE1) {
  const origem = path.join(BACKUP_DIR, arquivo);
  const destino = path.join(STEPS_DIR, arquivo);

  if (fs.existsSync(origem)) {
    fs.copyFileSync(origem, destino);
    console.log(`✅ Restaurado: ${arquivo}`);
    restaurados++;
  } else {
    console.log(`⚠️  Backup não encontrado: ${arquivo}`);
    naoEncontrados++;
  }
}

console.log(`\n${restaurados} arquivos restaurados, ${naoEncontrados} não encontrados.`);
console.log(`Backup em: ${BACKUP_DIR}`);
