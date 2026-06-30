#!/usr/bin/env node
/**
 * Script de auditoria de performance — Descomplicai
 * Roda Lighthouse CI e reporta scores
 * 
 * Uso: node scripts/audit-performance.js
 * Requer: npm install -g @lhci/cli
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { path: '/', name: 'Landing' },
  { path: '/vitrine', name: 'Vitrine' },
  { path: '/login', name: 'Login' },
];

const BASE_URL = process.env.BASE_URL || 'https://descomplicai.com.br';
const REPORT_DIR = path.join(process.cwd(), 'lighthouse-reports');

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

console.log('🔍 Iniciando auditoria de performance...');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log('');

const results = [];

for (const page of PAGES) {
  const url = `${BASE_URL}${page.path}`;
  const outputPath = path.join(REPORT_DIR, `${page.name.toLowerCase().replace(/\s/g, '-')}.json`);

  console.log(`\n📄 Auditando: ${page.name} (${url})`);

  try {
    const cmd = `npx lighthouse ${url} --output=json --output-path=${outputPath} --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`;
    execSync(cmd, { stdio: 'pipe', timeout: 120000 });

    const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    const scores = {
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      bestPractices: Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
    };

    results.push({ page: page.name, ...scores });

    console.log(`   ✅ Performance: ${scores.performance}`);
    console.log(`   ✅ Accessibility: ${scores.accessibility}`);
    console.log(`   ✅ Best Practices: ${scores.bestPractices}`);
    console.log(`   ✅ SEO: ${scores.seo}`);

    // Verifica metas minimas
    const metas = {
      performance: scores.performance >= 70,
      accessibility: scores.accessibility >= 90,
      bestPractices: scores.bestPractices >= 90,
      seo: scores.seo >= 90,
    };

    const allPass = Object.values(metas).every(Boolean);
    if (allPass) {
      console.log(`   🎉 Todas as metas atingidas!`);
    } else {
      console.log(`   ⚠️  Metas nao atingidas:`);
      Object.entries(metas).forEach(([key, pass]) => {
        if (!pass) console.log(`      - ${key}: ${scores[key]} (meta: ${key === 'performance' ? 70 : 90})`);
      });
    }
  } catch (err) {
    console.error(`   ❌ Erro ao auditar ${page.name}:`, err.message);
    results.push({ page: page.name, error: err.message });
  }
}

// Resumo final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA AUDITORIA');
console.log('='.repeat(60));

results.forEach((r) => {
  if (r.error) {
    console.log(`\n❌ ${r.page}: ERRO — ${r.error}`);
  } else {
    const allPass = r.performance >= 70 && r.accessibility >= 90 && r.bestPractices >= 90 && r.seo >= 90;
    console.log(`\n${allPass ? '✅' : '⚠️'}  ${r.page}`);
    console.log(`   Performance: ${r.performance}/100 ${r.performance >= 70 ? '✅' : '❌'}`);
    console.log(`   Accessibility: ${r.accessibility}/100 ${r.accessibility >= 90 ? '✅' : '❌'}`);
    console.log(`   Best Practices: ${r.bestPractices}/100 ${r.bestPractices >= 90 ? '✅' : '❌'}`);
    console.log(`   SEO: ${r.seo}/100 ${r.seo >= 90 ? '✅' : '❌'}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`📁 Relatorios salvos em: ${REPORT_DIR}`);
console.log('='.repeat(60));
