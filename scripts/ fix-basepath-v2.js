const fs = require('fs');
const path = require('path');

const DIRETORIOS = ['components', 'pages', 'utils', 'hooks'];
const EXTENSOES = ['.jsx', '.js'];
const EXCLUIR = ['node_modules', '.next', '.backup', '.git', '__pycache__', 'fetchAPI.js'];

const BASE_PATH = '/descomplicai';

// Helper content
const HELPER_CONTENT = `/**
 * utils/fetchAPI.js
 * Helper centralizado para chamadas de API com basePath automatico.
 *
 * O Next.js basePath (/descomplicai) nao e aplicado automaticamente
 * em fetch() do cliente. Este helper prefixa o caminho corretamente.
 *
 * Se o basePath mudar no next.config.js, altere apenas a constante
 * BASE_PATH abaixo.
 */

const BASE_PATH = '${BASE_PATH}';

/**
 * Prefixa um caminho de API com o basePath da aplicacao.
 * Funciona tanto em dev quanto em prod.
 *
 * @param {string} path - Caminho da API (ex: '/api/memorial/salvar')
 * @returns {string} Caminho completo com basePath (ex: '/descomplicai/api/memorial/salvar')
 */
export function apiPath(path) {
  if (!path || typeof path !== 'string') return path;
  if (path.startsWith('http')) return path;
  if (BASE_PATH && path.startsWith(BASE_PATH)) return path;
  return \`\${BASE_PATH}\${path}\`;
}

/**
 * Wrapper de fetch que automaticamente prefixa o basePath.
 * Aceita a mesma assinatura do fetch nativo.
 *
 * @param {string} path - Caminho da API
 * @param {RequestInit} [options] - Opcoes do fetch
 * @returns {Promise<Response>}
 */
export default function fetchAPI(path, options) {
  return fetch(apiPath(path), options);
}

export { fetchAPI, apiPath };
`;

function criarHelper() {
  const helperPath = path.join('utils', 'fetchAPI.js');
  if (fs.existsSync(helperPath)) {
    console.log('  [Helper] utils/fetchAPI.js ja existe (mantido)');
    return;
  }
  fs.mkdirSync('utils', { recursive: true });
  fs.writeFileSync(helperPath, HELPER_CONTENT, 'utf-8');
  console.log('  [Helper] Criado: utils/fetchAPI.js');
}

function calcularImportPath(arquivoPath) {
  // arquivoPath e relativo a raiz do projeto, ex: "components/memorial/MemorialOrchestrator.jsx"
  // Precisamos subir ate a raiz e depois descer em "utils/fetchAPI"
  const partes = arquivoPath.split(path.sep);
  const profundidade = partes.length - 1; // -1 porque o ultimo e o nome do arquivo

  // Subir profundidade vezes, depois descer em utils/fetchAPI
  const subir = '../'.repeat(profundidade);
  return subir + 'utils/fetchAPI';
}

function encontrarFimBlocoImports(conteudo) {
  const lines = conteudo.split('\n');
  let ultimoImport = 0;
  let emComentarioBloco = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.trim();

    if (stripped.startsWith('/*')) emComentarioBloco = true;
    if (stripped.endsWith('*/')) {
      emComentarioBloco = false;
      continue;
    }
    if (emComentarioBloco) continue;
    if (stripped.startsWith('//')) continue;

    if (stripped.startsWith('import ')) {
      ultimoImport = i + 1;
    } else if (stripped && !stripped.startsWith('//') && !stripped.startsWith('/*')) {
      if (ultimoImport > 0) break;
    }
  }

  return ultimoImport;
}

function adicionarImport(conteudo, importPath) {
  if (/import\s+.*fetchAPI.*from\s+["\'].*fetchAPI["\']/.test(conteudo)) {
    return conteudo;
  }

  const lines = conteudo.split('\n');
  const insertIdx = encontrarFimBlocoImports(conteudo);

  const temAspasDuplas = /import\s+.*from\s+"/.test(conteudo);
  const importLine = temAspasDuplas
    ? `import fetchAPI from "${importPath}";`
    : `import fetchAPI from '${importPath}';`;

  lines.splice(insertIdx, 0, importLine);
  return lines.join('\n');
}

function substituirFetchs(conteudo) {
  // fetch('/api/...) -> fetchAPI('/api/...)
  conteudo = conteudo.replace(/(?<!fetchAPI)\bfetch\s*\(\s*(\'\/api\/)/g, 'fetchAPI($1');
  // fetch(`/api/...) -> fetchAPI(`/api/...)
  conteudo = conteudo.replace(/(?<!fetchAPI)\bfetch\s*\(\s*(`\/api\/)/g, 'fetchAPI($1');
  // fetch("/api/...) -> fetchAPI("/api/...)
  conteudo = conteudo.replace(/(?<!fetchAPI)\bfetch\s*\(\s*("\/api\/)/g, 'fetchAPI($1');
  return conteudo;
}

function processarArquivo(arquivoPath, backupDir) {
  let conteudo;
  try {
    conteudo = fs.readFileSync(arquivoPath, 'utf-8');
  } catch (e) {
    console.log(`  [ERRO] Nao foi possivel ler ${arquivoPath}: ${e.message}`);
    return false;
  }

  const temFetch = /fetch\s*\(\s*['"`]\/api\//.test(conteudo);
  if (!temFetch) return false;

  // Backup
  const nomeBase = path.basename(arquivoPath);
  let backupPath = path.join(backupDir, nomeBase);
  let contador = 1;
  while (fs.existsSync(backupPath)) {
    backupPath = path.join(backupDir, `${path.parse(nomeBase).name}_${contador}${path.parse(nomeBase).ext}`);
    contador++;
  }
  fs.mkdirSync(backupDir, { recursive: true });
  fs.copyFileSync(arquivoPath, backupPath);

  // Adiciona import no topo
  const relPath = path.relative(process.cwd(), arquivoPath);
  const importPath = calcularImportPath(relPath);
  conteudo = adicionarImport(conteudo, importPath);

  // Substitui fetchs
  conteudo = substituirFetchs(conteudo);

  try {
    fs.writeFileSync(arquivoPath, conteudo, 'utf-8');
    return true;
  } catch (e) {
    console.log(`  [ERRO] Nao foi possivel escrever ${arquivoPath}: ${e.message}`);
    fs.copyFileSync(backupPath, arquivoPath);
    return false;
  }
}

function main() {
  console.log('='.repeat(50));
  console.log('  FIX BASEPATH v2 — Correcao de caminho do import');
  console.log('='.repeat(50));
  console.log();

  if (!fs.existsSync('next.config.js')) {
    console.log('ERRO: Execute na raiz do projeto');
    process.exit(1);
  }

  console.log('[1/4] Criando helper utils/fetchAPI.js...');
  criarHelper();

  const backupDir = path.join('.backup', 'fix-basepath-v2');
  fs.mkdirSync(backupDir, { recursive: true });

  console.log();
  console.log('[2/4] Encontrando arquivos...');

  const arquivos = [];
  for (const dirName of DIRETORIOS) {
    const dirPath = path.join(process.cwd(), dirName);
    if (!fs.existsSync(dirPath)) continue;

    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (EXCLUIR.some(e => entry.name.includes(e))) continue;
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (!EXTENSOES.includes(ext)) continue;
          if (entry.name === 'fetchAPI.js') continue;
          try {
            const conteudo = fs.readFileSync(fullPath, 'utf-8');
            if (/fetch\s*\(\s*['"`]\/api\//.test(conteudo)) {
              arquivos.push(fullPath);
            }
          } catch {}
        }
      }
    }
    scanDir(dirPath);
  }

  console.log(`      ${arquivos.length} arquivos encontrados`);

  if (arquivos.length === 0) {
    console.log('Nenhum arquivo encontrado. Nada a fazer.');
    process.exit(0);
  }

  console.log();
  console.log('[3/4] Aplicando correcao...');

  let modificados = 0;
  for (let i = 0; i < arquivos.length; i++) {
    const arquivo = arquivos[i];
    const relPath = path.relative(process.cwd(), arquivo);
    console.log(`      [${i + 1}/${arquivos.length}] ${relPath}`);
    if (processarArquivo(arquivo, backupDir)) {
      modificados++;
    }
  }

  console.log();
  console.log('[4/4] Verificando...');

  const restantes = [];
  for (const dirName of DIRETORIOS) {
    const dirPath = path.join(process.cwd(), dirName);
    if (!fs.existsSync(dirPath)) continue;

    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (EXCLUIR.some(e => entry.name.includes(e))) continue;
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (!EXTENSOES.includes(ext)) continue;
          if (entry.name === 'fetchAPI.js') continue;
          try {
            const conteudo = fs.readFileSync(fullPath, 'utf-8');
            const hasFetch = /fetch\s*\(\s*['"`]\/api\//.test(conteudo);
            const hasFetchAPI = conteudo.includes('fetchAPI');
            if (hasFetch && !hasFetchAPI) {
              restantes.push(path.relative(process.cwd(), fullPath));
            }
          } catch {}
        }
      }
    }
    scanDir(dirPath);
  }

  if (restantes.length > 0) {
    console.log('ALERTA: Ainda existem fetch nao substituidos:');
    for (const r of restantes) console.log(`  - ${r}`);
  } else {
    console.log('      Nenhum fetch restante.');
  }

  console.log();
  console.log('='.repeat(50));
  console.log('  Concluido!');
  console.log('='.repeat(50));
  console.log(`Arquivos: ${arquivos.length} | Modificados: ${modificados}`);
  console.log(`Backups: ${backupDir}`);
  console.log();
  console.log('Proximos passos:');
  console.log('  1. Verifique 3 arquivos: head -15 components/memorial/MemorialOrchestrator.jsx');
  console.log('  2. npm run build');
  console.log('  3. Se passar: git add . && git commit -m "fix: basePath em todas as chamadas de API"');
  console.log('  4. git push');
  console.log();
}

main();