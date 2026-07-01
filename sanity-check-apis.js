const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, 'pages', 'api');
const RESULTS = {
  consoleLog: [],
  mockPlaceholder: [],
  adminWithoutServiceRole: [],
  noRateLimit: [],
  webhookWithoutValidation: [],
  hardcodedSecrets: [],
  emptyCatch: [],
  rawSql: [],
  totalFiles: 0
};

const MOCK_PATTERNS = [
  /mock/i, /placeholder/i, /TODO/i, /FIXME/i, /hardcoded/i,
  /fake/i, /dummy/i, /teste.*dados/i, /dados.*teste/i,
  /\btest\b/i, /\btesting\b/i, /exemplo/i, /example/i
];

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/i,  // Stripe keys
  /pk-[a-zA-Z0-9]{20,}/i,  // Stripe public keys
  /[a-f0-9]{32,}/i,        // Generic hex tokens
  /password\s*[:=]\s*["'][^"']+["']/i,
  /token\s*[:=]\s*["'][^"']+["']/i,
  /secret\s*[:=]\s*["'][^"']+["']/i
];

function scanFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  RESULTS.totalFiles++;

  const isAdmin = relativePath.includes('/admin/');
  const isWebhook = relativePath.includes('webhook') || relativePath.includes('mercado-pago');
  const isPublic = !isAdmin && !relativePath.includes('cron/');

  // 1. console.log
  lines.forEach((line, idx) => {
    if (line.includes('console.log')) {
      RESULTS.consoleLog.push({ file: relativePath, line: idx + 1, text: line.trim() });
    }
  });

  // 2. mock/placeholder
  lines.forEach((line, idx) => {
    MOCK_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        RESULTS.mockPlaceholder.push({ file: relativePath, line: idx + 1, text: line.trim() });
      }
    });
  });

  // 3. API admin sem supabaseAdmin/service_role
  if (isAdmin) {
    const hasServiceRole = content.includes('supabaseAdmin') || 
                           content.includes('service_role') ||
                           content.includes('SERVICE_ROLE');
    if (!hasServiceRole) {
      RESULTS.adminWithoutServiceRole.push({ file: relativePath });
    }
  }

  // 4. Rate limiting (APIs públicas)
  if (isPublic && !isWebhook) {
    const hasRateLimit = content.includes('rateLimit') || 
                         content.includes('rate-limit') ||
                         content.includes('throttle') ||
                         content.includes('burst') ||
                         content.includes('ipLimit');
    if (!hasRateLimit) {
      RESULTS.noRateLimit.push({ file: relativePath });
    }
  }

  // 5. Webhook sem validação de assinatura
  if (isWebhook) {
    const hasValidation = content.includes('signature') || 
                          content.includes('x-signature') ||
                          content.includes('verify') ||
                          content.includes('validar') ||
                          content.includes('hmac') ||
                          content.includes('secret');
    if (!hasValidation) {
      RESULTS.webhookWithoutValidation.push({ file: relativePath });
    }
  }

  // 6. Hardcoded secrets
  lines.forEach((line, idx) => {
    SECRET_PATTERNS.forEach(pattern => {
      if (pattern.test(line) && !line.includes('process.env')) {
        RESULTS.hardcodedSecrets.push({ file: relativePath, line: idx + 1, text: line.trim() });
      }
    });
  });

  // 7. catch vazio
  lines.forEach((line, idx) => {
    if (/catch\s*\(/.test(line)) {
      const nextLine = lines[idx + 1] || '';
      if (nextLine.trim() === '}' || nextLine.trim() === '') {
        RESULTS.emptyCatch.push({ file: relativePath, line: idx + 1 });
      }
    }
  });

  // 8. SQL raw (injeção SQL)
  lines.forEach((line, idx) => {
    if (/\.query\s*\(/.test(line) && !line.includes('?') && !line.includes('$')) {
      RESULTS.rawSql.push({ file: relativePath, line: idx + 1, text: line.trim() });
    }
  });
}

function walkDir(dir, basePath = '') {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, relativePath);
    } else if (/\.(js|ts|jsx|tsx)$/.test(item)) {
      scanFile(fullPath, relativePath);
    }
  }
}

// Executar
walkDir(API_DIR);

// Relatório
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║       SANITY CHECK - APIs (Descomplicaí)                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`\nTotal de arquivos analisados: ${RESULTS.totalFiles}\n`);

function printSection(title, items, emoji) {
  console.log(`${emoji} ${title} (${items.length})`);
  if (items.length === 0) {
    console.log('   ✅ Nenhum problema encontrado\n');
    return;
  }
  items.forEach(item => {
    const lineInfo = item.line ? `:${item.line}` : '';
    const textInfo = item.text ? ` | ${item.text.substring(0, 80)}` : '';
    console.log(`   ❌ ${item.file}${lineInfo}${textInfo}`);
  });
  console.log('');
}

printSection('console.log em APIs', RESULTS.consoleLog, '📝');
printSection('mock/placeholder/TODO/FIXME', RESULTS.mockPlaceholder, '🎭');
printSection('API admin SEM supabaseAdmin/service_role', RESULTS.adminWithoutServiceRole, '🔒');
printSection('API pública SEM rate limiting', RESULTS.noRateLimit, '⏱️');
printSection('Webhook SEM validação de assinatura', RESULTS.webhookWithoutValidation, '💳');
printSection('Secrets hardcoded', RESULTS.hardcodedSecrets, '🔑');
printSection('catch() vazio', RESULTS.emptyCatch, '🐛');
printSection('SQL raw (possível injeção)', RESULTS.rawSql, '💉');

// Salvar relatório
const reportPath = path.join(__dirname, 'sanity-check-apis-report.txt');
const reportLines = [
  'SANITY CHECK APIs - Relatório',
  `Data: ${new Date().toISOString()}`,
  `Total arquivos: ${RESULTS.totalFiles}`,
  '',
  'RESUMO:',
  `- console.log: ${RESULTS.consoleLog.length}`,
  `- mock/placeholder: ${RESULTS.mockPlaceholder.length}`,
  `- admin sem service_role: ${RESULTS.adminWithoutServiceRole.length}`,
  `- sem rate limit: ${RESULTS.noRateLimit.length}`,
  `- webhook sem validação: ${RESULTS.webhookWithoutValidation.length}`,
  `- secrets hardcoded: ${RESULTS.hardcodedSecrets.length}`,
  `- catch vazio: ${RESULTS.emptyCatch.length}`,
  `- SQL raw: ${RESULTS.rawSql.length}`,
  '',
  'DETALHES:',
  JSON.stringify(RESULTS, null, 2)
];
fs.writeFileSync(reportPath, reportLines.join('\n'));
console.log(`\n📄 Relatório salvo em: ${reportPath}`);