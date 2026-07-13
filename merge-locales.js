#!/usr/bin/env node
/**
 * merge-locales.js
 * Mescla as chaves perfil.* e dna.* dos patches nos arquivos memorial.json existentes
 * Uso: node merge-locales.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES = ['pt-BR', 'en', 'es'];
const BASE_DIR = path.join(__dirname, 'locales');

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function mergeLocale(locale) {
  const memorialPath = path.join(BASE_DIR, locale, 'memorial.json');
  const patchPath = path.join(BASE_DIR, locale, 'perfil_dna_patch.json');

  if (!fs.existsSync(memorialPath)) {
    console.warn(`[merge] ${memorialPath} nao encontrado. Pulando...`);
    return;
  }

  if (!fs.existsSync(patchPath)) {
    console.warn(`[merge] ${patchPath} nao encontrado. Pulando...`);
    return;
  }

  try {
    const memorial = JSON.parse(fs.readFileSync(memorialPath, 'utf-8'));
    const patch = JSON.parse(fs.readFileSync(patchPath, 'utf-8'));

    const merged = deepMerge(memorial, patch);

    // Backup do original
    const backupPath = memorialPath + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, JSON.stringify(memorial, null, 2), 'utf-8');
    console.log(`[merge] Backup criado: ${backupPath}`);

    // Escreve o mergeado
    fs.writeFileSync(memorialPath, JSON.stringify(merged, null, 2), 'utf-8');
    console.log(`[merge] ${locale}/memorial.json atualizado com sucesso!`);

    // Remove o patch (opcional — comenta se quiser manter)
    fs.unlinkSync(patchPath);
    console.log(`[merge] ${locale}/perfil_dna_patch.json removido.`);

  } catch (err) {
    console.error(`[merge] Erro ao processar ${locale}:`, err.message);
  }
}

console.log('=== Merge de locales ===\\n');
for (const locale of LOCALES) {
  mergeLocale(locale);
}
console.log('\\n=== Concluido ===');
