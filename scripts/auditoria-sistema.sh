#!/bin/bash
# Auditoria completa do sistema Descomplicaí
# Gera relatorio em /tmp/auditoria-descomplicai.txt

REPORT="/tmp/auditoria-descomplicai.txt"
echo "AUDITORIA SISTEMA DESCOMPLICAI - $(date)" > $REPORT
echo "========================================" >> $REPORT

echo "" >> $REPORT
echo "## 1. ESTRUTURA DE PASTAS CRITICAS" >> $REPORT
echo "-----------------------------------" >> $REPORT
for dir in components pages lib utils hooks context public scripts docs e2e __tests__ .github; do
  if [ -d "$dir" ]; then
    echo "✅ $dir/ existe ($(find $dir -type f | wc -l) arquivos)" >> $REPORT
  else
    echo "❌ $dir/ NAO EXISTE" >> $REPORT
  fi
done

echo "" >> $REPORT
echo "## 2. ARQUIVOS CRITICOS DE CONFIGURACAO" >> $REPORT
echo "-----------------------------------" >> $REPORT
for file in next.config.mjs next.config.js package.json .env.local .env.example public/manifest.json public/robots.txt instrumentation.ts sentry.client.config.js sentry.server.config.js sentry.edge.config.js; do
  if [ -f "$file" ]; then
    echo "✅ $file existe ($(wc -c < $file) bytes)" >> $REPORT
  else
    echo "❌ $file NAO EXISTE" >> $REPORT
  fi
done

echo "" >> $REPORT
echo "## 3. DUPLICIDADE DE ARQUIVOS (case sensitive)" >> $REPORT
echo "-----------------------------------" >> $REPORT
echo "Arquivos rateLimit:" >> $REPORT
ls -la lib/rate* 2>/dev/null >> $REPORT || echo "Nenhum encontrado" >> $REPORT

echo "" >> $REPORT
echo "## 4. IMPORTS SUSPEITOS (ratelimit vs rateLimit)" >> $REPORT
echo "-----------------------------------" >> $REPORT
echo "Importando de 'ratelimit' (minusculo):" >> $REPORT
grep -rn "from.*ratelimit" . --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "rateLimit" | grep -v node_modules | head -n 10 >> $REPORT
echo "" >> $REPORT
echo "Importando de 'rateLimit' (maiusculo):" >> $REPORT
grep -rn "from.*rateLimit" . --include="*.js" --include="*.jsx" 2>/dev/null | grep -v node_modules | head -n 10 >> $REPORT

echo "" >> $REPORT
echo "## 5. STEPS DO MEMORIAL COM .map() SUSPEITO" >> $REPORT
echo "-----------------------------------" >> $REPORT
grep -rn "\.map(" components/memorial/steps/ --include="*.jsx" 2>/dev/null | head -n 20 >> $REPORT

echo "" >> $REPORT
echo "## 6. MANIFEST E PWA" >> $REPORT
echo "-----------------------------------" >> $REPORT
echo "Manifest em public/:" >> $REPORT
ls -la public/manifest.json 2>/dev/null >> $REPORT || echo "NAO EXISTE" >> $REPORT
echo "" >> $REPORT
echo "Referencia no _document:" >> $REPORT
grep -n "manifest" pages/_document.jsx 2>/dev/null >> $REPORT || grep -n "manifest" pages/_document.js 2>/dev/null >> $REPORT || echo "NAO ACHOU" >> $REPORT
echo "" >> $REPORT
echo "next-pwa em package.json:" >> $REPORT
grep "next-pwa" package.json >> $REPORT || echo "NAO INSTALADO" >> $REPORT

echo "" >> $REPORT
echo "## 7. SUPABASE E ENV" >> $REPORT
echo "-----------------------------------" >> $REPORT
echo "Variaveis em .env.local:" >> $REPORT
cat .env.local 2>/dev/null | grep -E "SUPABASE|NEXT_PUBLIC|RESEND|SENTRY|MERCADO_PAGO|CRON_SECRET" >> $REPORT || echo "VAZIO OU NAO EXISTE" >> $REPORT

echo "" >> $REPORT
echo "## 8. GIT STATUS" >> $REPORT
echo "-----------------------------------" >> $REPORT
git status --short 2>/dev/null >> $REPORT || echo "SEM GIT" >> $REPORT
echo "" >> $REPORT
echo "Ultimos 5 commits:" >> $REPORT
git log --oneline -5 2>/dev/null >> $REPORT || echo "SEM GIT" >> $REPORT

echo "" >> $REPORT
echo "## 9. DEPENDENCIAS FALTANTES OU DESATUALIZADAS" >> $REPORT
echo "-----------------------------------" >> $REPORT
echo "Dependencias no package.json:" >> $REPORT
grep -E '"next"|"react"|"next-pwa"|"@sentry/nextjs"|"resend"|"mercadopago"|"uploadthing"|"@upstash/ratelimit"' package.json >> $REPORT

echo "" >> $REPORT
echo "## 10. PAGINAS/APIs CRITICAS" >> $REPORT
echo "-----------------------------------" >> $REPORT
for page in pages/api/pagamento/criar.js pages/api/memorial/salvar.js pages/api/email/enviar.js pages/api/convite/validar.js pages/api/cerimonialista/cadastro.js pages/api/fornecedor/cadastro.js pages/api/contratos/assinar.js pages/api/gerar-pdf.js pages/api/ia/gerar-memorial.js; do
  if [ -f "$page" ]; then
    echo "✅ $page" >> $REPORT
  else
    echo "❌ $page NAO EXISTE" >> $REPORT
  fi
done

echo "" >> $REPORT
echo "## 11. COMPONENTES MEMORIAL CRITICOS" >> $REPORT
echo "-----------------------------------" >> $REPORT
for comp in components/memorial/MemorialOrchestrator.jsx components/memorial/BreathTransition.jsx components/memorial/ProgressBar.jsx components/memorial/BackButton.jsx; do
  if [ -f "$comp" ]; then
    echo "✅ $comp ($(wc -l < $comp) linhas)" >> $REPORT
  else
    echo "❌ $comp NAO EXISTE" >> $REPORT
  fi
done

echo "" >> $REPORT
echo "## 12. VERIFICACAO DE ERROS COMUNS" >> $REPORT
echo "-----------------------------------" >> $REPORT
echo "Console.log em APIs (deveria ser removido):" >> $REPORT
grep -rn "console.log" pages/api/ --include="*.js" 2>/dev/null | head -n 5 >> $REPORT || echo "Nenhum encontrado" >> $REPORT
echo "" >> $REPORT
echo "Catch vazio:" >> $REPORT
grep -rn "catch.*{}" pages/api/ --include="*.js" 2>/dev/null | head -n 5 >> $REPORT || echo "Nenhum encontrado" >> $REPORT

echo "" >> $REPORT
echo "========================================" >> $REPORT
echo "AUDITORIA CONCLUIDA" >> $REPORT
echo "Relatorio salvo em: $REPORT" >> $REPORT

cat $REPORT