#!/usr/bin/env node
/**
 * substituir-hardcode-memorial.js
 * Substitui hardcode "noiva/noivo/casamento" nos steps do memorial
 * NUNCA usar sed — este script entende JSX e preserva estrutura
 */

const fs = require('fs');
const path = require('path');

const STEPS_DIR = path.resolve('components/memorial/steps');
const BACKUP_DIR = path.resolve('components/memorial/steps-backup-script');

// Arquivos do LOTE 1 (mais críticos)
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

// Cores no terminal
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function fazerBackup(arquivo) {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  const nome = path.basename(arquivo);
  const destino = path.join(BACKUP_DIR, nome);
  fs.copyFileSync(arquivo, destino);
}

function restaurarBackup(arquivo) {
  const nome = path.basename(arquivo);
  const origem = path.join(BACKUP_DIR, nome);
  if (fs.existsSync(origem)) {
    fs.copyFileSync(origem, arquivo);
    return true;
  }
  return false;
}

/**
 * Verifica se uma ocorrência de "noiva" / "noivo" / "casamento" está em contexto
 * que NÃO deve ser alterado (nome de variável, import, chave de objeto, etc.)
 */
function devePularLinha(linha) {
  const trimmed = linha.trim();
  // Pula comentários de identificação do arquivo (ex: // StepE2EstadoCivilNoiva...)
  if (/^\/\/\s*Step\w+/.test(trimmed)) return true;
  // Pula imports
  if (/^import\s/.test(trimmed)) return true;
  // Pula exports de função (nome da função)
  if (/^export\s+default\s+function\s+Step/.test(trimmed)) return true;
  // Pula linhas com estadoAtual?.estadoCivilNoiva (acesso a propriedade)
  if (/estadoAtual\?\?\.[a-zA-Z]*[Nn]oiv[ao]/.test(linha)) return true;
  if (/estadoAtual\?\.[a-zA-Z]*[Nn]oiv[ao]/.test(linha)) return true;
  // Pula declarações de variáveis com noiva/noivo no nome
  if (/\bconst\s+\w*[Nn]oiv[ao]\w*\s*=/.test(linha)) return true;
  if (/\blet\s+\w*[Nn]oiv[ao]\w*\s*=/.test(linha)) return true;
  if (/\bvar\s+\w*[Nn]oiv[ao]\w*\s*=/.test(linha)) return true;
  // Pula chaves de objeto (ex: estadoCivilNoiva:)
  if (/\w*[Nn]oiv[ao]\w*\s*:/.test(linha) && !linha.includes("'")) return true;
  // Pula nomes de arquivo em strings de import
  if (/from\s+['"]/.test(linha)) return true;
  return false;
}

/**
 * Substitui hardcode em uma linha de forma segura.
 * Só altera texto em JSX (strings entre aspas dentro de JSX ou texto entre tags).
 */
function substituirLinha(linha, numLinha) {
  if (devePularLinha(linha)) {
    return { linha, alteracoes: [] };
  }

  let novaLinha = linha;
  const alteracoes = [];

  // Padrao 1: aria-label="... noiva ..." ou aria-label='... noiva ...'
  // → aria-label={`... ${termos.pessoa1} ...`}
  const ariaMatch = novaLinha.match(/(aria-label=)(["'])([^"']*?)(noiva|noivo|casamento)([^"']*?)\2/);
  if (ariaMatch) {
    const [, attr, quote, antes, palavra, depois] = ariaMatch;
    const termo = palavra === 'noiva' ? 'termos.pessoa1' : palavra === 'noivo' ? 'termos.pessoa2' : '"celebração"';
    const replacement = palavra === 'casamento'
      ? `${attr}{\`${antes}celebração${depois}\`}`
      : `${attr}{\`${antes}\${${termo}}${depois}\`}`;
    novaLinha = novaLinha.replace(ariaMatch[0], replacement);
    alteracoes.push(`L${numLinha}: aria-label "${palavra}" → template literal`);
  }

  // Padrao 2: placeholder="... noiva ..."
  const placeholderMatch = novaLinha.match(/(placeholder=)(["'])([^"']*?)(noiva|noivo|casamento)([^"']*?)\2/);
  if (placeholderMatch) {
    const [, attr, quote, antes, palavra, depois] = placeholderMatch;
    const termo = palavra === 'noiva' ? 'termos.pessoa1' : palavra === 'noivo' ? 'termos.pessoa2' : '"celebração"';
    const replacement = palavra === 'casamento'
      ? `${attr}{\`${antes}celebração${depois}\`}`
      : `${attr}{\`${antes}\${${termo}}${depois}\`}`;
    novaLinha = novaLinha.replace(placeholderMatch[0], replacement);
    alteracoes.push(`L${numLinha}: placeholder "${palavra}" → template literal`);
  }

  // Padrao 3: title="... noiva ..."
  const titleMatch = novaLinha.match(/(title=)(["'])([^"']*?)(noiva|noivo|casamento)([^"']*?)\2/);
  if (titleMatch) {
    const [, attr, quote, antes, palavra, depois] = titleMatch;
    const termo = palavra === 'noiva' ? 'termos.pessoa1' : palavra === 'noivo' ? 'termos.pessoa2' : '"celebração"';
    const replacement = palavra === 'casamento'
      ? `${attr}{\`${antes}celebração${depois}\`}`
      : `${attr}{\`${antes}\${${termo}}${depois}\`}`;
    novaLinha = novaLinha.replace(titleMatch[0], replacement);
    alteracoes.push(`L${numLinha}: title "${palavra}" → template literal`);
  }

  // Padrao 4: texto JSX entre tags >noiva< ou >Qual o estado civil da noiva?< 
  // Isso é mais complexo — vamos fazer substituição conservadora em strings que NÃO são atributos
  // Procuramos texto entre > e < que contém as palavras
  const jsxTextMatch = novaLinha.match(/>([^<]*?)(noiva|noivo|casamento)([^<]*?)</);
  if (jsxTextMatch && alteracoes.length === 0) { // só se não já alterou atributo
    const [, antes, palavra, depois] = jsxTextMatch;
    const termo = palavra === 'noiva' ? 'termos.pessoa1' : palavra === 'noivo' ? 'termos.pessoa2' : '"celebração"';
    const replacement = palavra === 'casamento'
      ? `>${antes}celebração${depois}<`
      : `>{\`${antes}\${${termo}}${depois}\`}<`;
    // Só substitui se o texto não parece ser código (ex: não contém {} já)
    if (!antes.includes('{') && !depois.includes('}')) {
      novaLinha = novaLinha.replace(jsxTextMatch[0], replacement);
      alteracoes.push(`L${numLinha}: JSX text "${palavra}" → template literal`);
    }
  }

  // Padrao 5: label: "... noiva ..." em arrays de opções (não chave de objeto, mas valor)
  // Ex: { valor: "solteiro", label: "Solteira", desc: "Nunca casou no civil" }
  const labelMatch = novaLinha.match(/(label:\s*)(["'])([^"']*?)(noiva|noivo|casamento)([^"']*?)\2/);
  if (labelMatch) {
    const [, prefix, quote, antes, palavra, depois] = labelMatch;
    const termo = palavra === 'noiva' ? 'termos.pessoa1' : palavra === 'noivo' ? 'termos.pessoa2' : '"celebração"';
    const replacement = palavra === 'casamento'
      ? `${prefix}\`${antes}celebração${depois}\``
      : `${prefix}\`${antes}\${${termo}}${depois}\``;
    novaLinha = novaLinha.replace(labelMatch[0], replacement);
    alteracoes.push(`L${numLinha}: label "${palavra}" → template literal`);
  }

  // Padrao 6: desc: "... noiva ..." em arrays de opções
  const descMatch = novaLinha.match(/(desc:\s*)(["'])([^"']*?)(noiva|noivo|casamento)([^"']*?)\2/);
  if (descMatch) {
    const [, prefix, quote, antes, palavra, depois] = descMatch;
    const termo = palavra === 'noiva' ? 'termos.pessoa1' : palavra === 'noivo' ? 'termos.pessoa2' : '"celebração"';
    const replacement = palavra === 'casamento'
      ? `${prefix}\`${antes}celebração${depois}\``
      : `${prefix}\`${antes}\${${termo}}${depois}\``;
    novaLinha = novaLinha.replace(descMatch[0], replacement);
    alteracoes.push(`L${numLinha}: desc "${palavra}" → template literal`);
  }

  return { linha: novaLinha, alteracoes };
}

function processarArquivo(caminho, arquivo) {
  const conteudo = fs.readFileSync(caminho, 'utf-8');
  const linhas = conteudo.split('\n');
  const novasLinhas = [];
  const todasAlteracoes = [];
  let importAdicionado = false;
  let termosAdicionado = false;

  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i];
    const numLinha = i + 1;

    // Adiciona import após o último import existente
    if (!importAdicionado && /^import\s/.test(linha) && !/^import\s/.test(linhas[i + 1] || '')) {
      if (!conteudo.includes('linguagemCasal')) {
        novasLinhas.push(linha);
        novasLinhas.push("import { getTermos } from '../../../utils/linguagemCasal';");
        importAdicionado = true;
        todasAlteracoes.push(`L${numLinha}: Adicionado import linguagemCasal`);
        continue;
      }
    }

    // Adiciona const perfil/termos após a declaração da função
    if (!termosAdicionado && /export\s+default\s+function\s+\w+\s*\(/.test(linha)) {
      novasLinhas.push(linha);
      // Pula a linha de abertura da função se for na mesma linha
      if (linha.includes('{')) {
        novasLinhas.push("  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';");
        novasLinhas.push("  const termos = getTermos(perfil);");
        termosAdicionado = true;
        todasAlteracoes.push(`L${numLinha + 1}: Adicionado const perfil/termos`);
      }
      continue;
    }

    // Se a função abre na próxima linha
    if (!termosAdicionado && /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*$/.test(linhas[i - 1] || '')) {
      if (linha.trim() === '{') {
        novasLinhas.push(linha);
        novasLinhas.push("  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';");
        novasLinhas.push("  const termos = getTermos(perfil);");
        termosAdicionado = true;
        todasAlteracoes.push(`L${numLinha}: Adicionado const perfil/termos`);
        continue;
      }
    }

    const resultado = substituirLinha(linha, numLinha);
    novasLinhas.push(resultado.linha);
    todasAlteracoes.push(...resultado.alteracoes);
  }

  const novoConteudo = novasLinhas.join('\n');
  return { novoConteudo, alteracoes: todasAlteracoes };
}

function mostrarDiff(conteudoOriginal, novoConteudo, arquivo) {
  const origLinhas = conteudoOriginal.split('\n');
  const novasLinhas = novoConteudo.split('\n');
  const maxLen = Math.max(origLinhas.length, novasLinhas.length);
  let diff = '';
  for (let i = 0; i < maxLen; i++) {
    const o = origLinhas[i] || '';
    const n = novasLinhas[i] || '';
    if (o !== n) {
      diff += `L${i + 1}:\n- ${o}\n+ ${n}\n\n`;
    }
  }
  if (!diff) {
    log(`  Nenhuma alteração em ${arquivo}`, 'yellow');
  } else {
    log(`\n=== DIFF: ${arquivo} ===`, 'cyan');
    console.log(diff);
  }
  return diff;
}

// ============================================
// FLUXO PRINCIPAL
// ============================================

async function main() {
  log('═══════════════════════════════════════════════════════', 'cyan');
  log('  Script de substituição de hardcode — Memorial', 'cyan');
  log('═══════════════════════════════════════════════════════\n', 'cyan');

  // Verifica se diretório existe
  if (!fs.existsSync(STEPS_DIR)) {
    log(`ERRO: Diretório não encontrado: ${STEPS_DIR}`, 'red');
    process.exit(1);
  }

  // Cria backup geral
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Primeiro: testa em 1 arquivo
  const arquivoTeste = ARQUIVOS_LOTE1[0];
  const caminhoTeste = path.join(STEPS_DIR, arquivoTeste);

  if (!fs.existsSync(caminhoTeste)) {
    log(`Arquivo de teste não encontrado: ${caminhoTeste}`, 'red');
    process.exit(1);
  }

  log(`>>> MODO TESTE: Processando 1 arquivo primeiro`, 'yellow');
  log(`Arquivo: ${arquivoTeste}\n`, 'yellow');

  fazerBackup(caminhoTeste);
  const conteudoOriginal = fs.readFileSync(caminhoTeste, 'utf-8');
  const { novoConteudo, alteracoes } = processarArquivo(caminhoTeste, arquivoTeste);

  mostrarDiff(conteudoOriginal, novoConteudo, arquivoTeste);

  if (alteracoes.length === 0) {
    log('Nenhuma alteração necessária. Pulando.', 'yellow');
  } else {
    log(`Alterações encontradas: ${alteracoes.length}`, 'green');
    alteracoes.forEach(a => log(`  • ${a}`, 'green'));
  }

  // Pergunta confirmação
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const resposta = await new Promise(resolve => {
    rl.question('\nAplicar no arquivo de teste? (s/n/ver): ', resolve);
  });

  if (resposta.toLowerCase() === 's') {
    fs.writeFileSync(caminhoTeste, novoConteudo, 'utf-8');
    log(`\n✅ ${arquivoTeste} modificado com sucesso.`, 'green');
  } else if (resposta.toLowerCase() === 'ver') {
    log('\n--- CONTEÚDO COMPLETO ---\n', 'cyan');
    console.log(novoConteudo);
    const r2 = await new Promise(resolve => {
      rl.question('\nAplicar? (s/n): ', resolve);
    });
    if (r2.toLowerCase() === 's') {
      fs.writeFileSync(caminhoTeste, novoConteudo, 'utf-8');
      log(`\n✅ ${arquivoTeste} modificado com sucesso.`, 'green');
    } else {
      log('Cancelado. Restaurando backup...', 'yellow');
      restaurarBackup(caminhoTeste);
    }
  } else {
    log('Cancelado. Restaurando backup...', 'yellow');
    restaurarBackup(caminhoTeste);
    rl.close();
    process.exit(0);
  }

  // Pergunta se aplica nos demais
  const respostaTodos = await new Promise(resolve => {
    rl.question('\nAplicar nos outros 14 arquivos do LOTE 1? (s/n): ', resolve);
  });

  if (respostaTodos.toLowerCase() !== 's') {
    log('Operação cancelada. Apenas o arquivo de teste foi modificado.', 'yellow');
    rl.close();
    process.exit(0);
  }

  // Processa os demais
  let totalAlteracoes = 0;
  let arquivosModificados = 0;

  for (let i = 1; i < ARQUIVOS_LOTE1.length; i++) {
    const arquivo = ARQUIVOS_LOTE1[i];
    const caminho = path.join(STEPS_DIR, arquivo);

    if (!fs.existsSync(caminho)) {
      log(`⚠️  Pulando (não encontrado): ${arquivo}`, 'yellow');
      continue;
    }

    fazerBackup(caminho);
    const original = fs.readFileSync(caminho, 'utf-8');
    const { novoConteudo: novo, alteracoes: alts } = processarArquivo(caminho, arquivo);

    if (alts.length > 0) {
      fs.writeFileSync(caminho, novo, 'utf-8');
      arquivosModificados++;
      totalAlteracoes += alts.length;
      log(`✅ ${arquivo} — ${alts.length} alterações`, 'green');
    } else {
      log(`⏭️  ${arquivo} — nada a alterar`, 'yellow');
    }
  }

  rl.close();

  log('\n═══════════════════════════════════════════════════════', 'cyan');
  log('  RELATÓRIO FINAL', 'cyan');
  log('═══════════════════════════════════════════════════════', 'cyan');
  log(`Arquivos modificados: ${arquivosModificados}`, 'green');
  log(`Total de alterações: ${totalAlteracoes}`, 'green');
  log(`Backup salvo em: ${BACKUP_DIR}`, 'cyan');
  log('\nPróximo passo: npm run build', 'yellow');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
