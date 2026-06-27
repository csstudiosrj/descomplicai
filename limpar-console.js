#!/usr/bin/env node
/**
 * limpar-console.js
 * Remove console.log e console.error de debug de componentes, utils, lib, hooks e páginas React.
 * Mantém console.error em APIs (pages/api/) já padronizados nas T2/T3.
 *
 * Uso: node limpar-console.js
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['pages', 'components', 'utils', 'lib', 'hooks'];
const EXCLUDE_DIRS = ['node_modules', '.next'];

let filesModified = 0;
let consoleLogsRemoved = 0;
let consoleErrorsRemoved = 0;
let consoleErrorsKept = 0;

function replaceConsoleWithVoid0(str, methodName) {
  const pattern = new RegExp(`console\\.${methodName}\\(`);
  let result = str;
  let match;

  while ((match = pattern.exec(result)) !== null) {
    let start = match.index;
    let parenCount = 1;
    let i = match.index + match[0].length;

    while (i < result.length && parenCount > 0) {
      if (result[i] === '(') parenCount++;
      else if (result[i] === ')') parenCount--;
      i++;
    }

    while (i < result.length && /\s/.test(result[i])) i++;
    if (result[i] === ';') i++;

    result = result.slice(0, start) + 'void 0' + result.slice(i);
  }

  return result;
}

function countOccurrences(str, methodName) {
  const pattern = new RegExp(`console\\.${methodName}\\(`, 'g');
  const matches = str.match(pattern);
  return matches ? matches.length : 0;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const isApi = /[\/\\]api[\/\\]/.test(filePath);

  let lines = content.split('\n');
  let newLines = [];
  let modified = false;

  for (let line of lines) {
    const trimmed = line.trim();
    let currentLine = line;
    let lineModified = false;

    const logCount = countOccurrences(currentLine, 'log');
    if (logCount > 0) {
      consoleLogsRemoved += logCount;
      if (trimmed.startsWith('console.log(')) {
        lineModified = true;
        continue;
      } else {
        currentLine = replaceConsoleWithVoid0(currentLine, 'log');
        lineModified = true;
      }
    }

    const errorCount = countOccurrences(currentLine, 'error');
    if (errorCount > 0) {
      if (isApi) {
        consoleErrorsKept += errorCount;
      } else {
        consoleErrorsRemoved += errorCount;
        if (trimmed.startsWith('console.error(')) {
          lineModified = true;
          continue;
        } else {
          currentLine = replaceConsoleWithVoid0(currentLine, 'error');
          lineModified = true;
        }
      }
    }

    if (lineModified) modified = true;
    newLines.push(currentLine);
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    filesModified++;
    console.log(`  ✓ ${filePath}`);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      walkDir(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

console.log('=== Limpando console.log e console.error de debug ===\n');

for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
}

console.log(`\n=== Resumo ===`);
console.log(`Arquivos modificados: ${filesModified}`);
console.log(`console.log removidos: ${consoleLogsRemoved}`);
console.log(`console.error removidos (componentes/utils/lib/páginas): ${consoleErrorsRemoved}`);
console.log(`console.error mantidos (APIs pages/api/): ${consoleErrorsKept}`);
console.log(`\nPróximo passo: git diff para revisar, depois git add + commit + push`);