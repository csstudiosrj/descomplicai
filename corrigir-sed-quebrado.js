#!/usr/bin/env node
/**
 * corrigir-sed-quebrado.js
 * Restaura o texto que o sed quebrou e substitui hardcode corretamente.
 */

const fs = require('fs');
const path = require('path');

const STEPS_DIR = path.resolve('components/memorial/steps');
const BACKUP_DIR = path.resolve('components/memorial/steps-backup-correcao');

// Mapeamento de correções: arquivo -> { padrão -> substituição }
// Cada entrada tem: o texto quebrado pelo sed, e o texto correto com termos
const CORRECOES = {
  'StepE2EstadoCivilNoiva.jsx': {
    // Comentário quebrado
    '// StepE2EstadoCivilNoiva — Qual o estado civil da ?':
      '// StepE2EstadoCivilNoiva — Qual o estado civil da {termos.pessoa1}?',
    // aria-label quebrado
    'aria-label="Escolha uma opção"':
      'aria-label={`Estado civil da ${termos.pessoa1}`}',
    // Título quebrado
    'Qual o estado civil da ?':
      '{`Qual o estado civil da ${termos.pessoa1}?`}',
    // Desc que o sed trocou "casamento" por "evento"
    'Já teve evento civil anterior':
      '{`Já teve ${termos.celebracao} civil anterior`}',
  },
  'StepE8NacionalidadeNoiva.jsx': {
    '// StepE8NacionalidadeNoiva — Qual a nacionalidade da ?':
      '// StepE8NacionalidadeNoiva — Qual a nacionalidade da {termos.pessoa1}?',
    'aria-label="Nacionalidade da ?"':
      'aria-label={`Nacionalidade da ${termos.pessoa1}`}',
    'Qual a nacionalidade da ?':
      '{`Qual a nacionalidade da ${termos.pessoa1}?`}',
  },
  'StepE13HorarioMakingOfNoiva.jsx': {
    '// StepE13HorarioMakingOfNoiva — Horário do making of da ':
      '// StepE13HorarioMakingOfNoiva — Horário do making of da {termos.pessoa1}',
  },
  'StepE4CertidaoDivorcioNoiva.jsx': {
    '// StepE4CertidaoDivorcioNoiva — Certidão de evento anterior com averbação de divórcio?':
      '// StepE4CertidaoDivorcioNoiva — Certidão de {termos.celebracao} anterior com averbação de divórcio?',
  },
  'StepE3CertidaoDivorcioNoivo.jsx': {
    '// StepE3CertidaoDivorcioNoivo — Certidão de evento anterior com averbação de divórcio?':
      '// StepE3CertidaoDivorcioNoivo — Certidão de {termos.celebracao} anterior com averbação de divórcio?',
  },
  'StepE10QuemPaga.jsx': {
    '// StepE10QuemPaga — Quem está pagando o evento?':
      '// StepE10QuemPaga — Quem está pagando o {termos.celebracao}?',
  },
};

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

function processarArquivo(caminho, arquivo) {
  let conteudo = fs.readFileSync(caminho, 'utf-8');
  const correcoes = CORRECOES[arquivo];
  if (!correcoes) {
    return { modificado: false, alteracoes: [] };
  }

  const alteracoes = [];
  for (const [quebrado, correto] of Object.entries(correcoes)) {
    if (conteudo.includes(quebrado)) {
      conteudo = conteudo.replace(quebrado, correto);
      alteracoes.push(`  "${quebrado.substring(0, 50)}..." → "${correto.substring(0, 50)}..."`);
    }
  }

  return { modificado: alteracoes.length > 0, novoConteudo: conteudo, alteracoes };
}

async function main() {
  log('═══════════════════════════════════════════════════════', 'cyan');
  log('  Correção de texto quebrado pelo sed', 'cyan');
  log('═══════════════════════════════════════════════════════\n', 'cyan');

  if (!fs.existsSync(STEPS_DIR)) {
    log(`ERRO: Diretório não encontrado: ${STEPS_DIR}`, 'red');
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let totalArquivos = 0;
  let totalAlteracoes = 0;

  for (const [arquivo, correcoes] of Object.entries(CORRECOES)) {
    const caminho = path.join(STEPS_DIR, arquivo);
    if (!fs.existsSync(caminho)) {
      log(`⚠️  Arquivo não encontrado: ${arquivo}`, 'yellow');
      continue;
    }

    fazerBackup(caminho);
    const { modificado, novoConteudo, alteracoes } = processarArquivo(caminho, arquivo);

    if (!modificado) {
      log(`⏭️  ${arquivo} — nada a corrigir`, 'yellow');
      continue;
    }

    log(`\n=== ${arquivo} ===`, 'cyan');
    alteracoes.forEach(a => log(a, 'green'));

    const resposta = await new Promise(resolve => {
      rl.question(`\nAplicar correções em ${arquivo}? (s/n): `, resolve);
    });

    if (resposta.toLowerCase() === 's') {
      fs.writeFileSync(caminho, novoConteudo, 'utf-8');
      log(`✅ ${arquivo} corrigido.`, 'green');
      totalArquivos++;
      totalAlteracoes += alteracoes.length;
    } else {
      log(`❌ ${arquivo} pulado.`, 'yellow');
      restaurarBackup(caminho);
    }
  }

  rl.close();

  log('\n═══════════════════════════════════════════════════════', 'cyan');
  log('  RELATÓRIO', 'cyan');
  log('═══════════════════════════════════════════════════════', 'cyan');
  log(`Arquivos corrigidos: ${totalArquivos}`, 'green');
  log(`Total de correções: ${totalAlteracoes}`, 'green');
  log(`Backup em: ${BACKUP_DIR}`, 'cyan');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
