#!/bin/bash
# Correcao massiva dos problemas encontrados na auditoria
# Executa em ordem: backup -> correcoes -> verificacao

set -e  # Para em qualquer erro

echo "========================================"
echo "CORRECAO MASSIVA - $(date)"
echo "========================================"

# ============================================
# 1. BACKUP DOS ARQUIVOS ORIGINAIS
# ============================================
echo ""
echo ">> 1. Criando backups..."
mkdir -p .backups/$(date +%Y%m%d_%H%M%S)

cp next.config.mjs .backups/$(date +%Y%m%d_%H%M%S)/next.config.mjs.bak 2>/dev/null || true
cp lib/rateLimit.js .backups/$(date +%Y%m%d_%H%M%S)/rateLimit.js.bak 2>/dev/null || true
cp lib/ratelimit.js .backups/$(date +%Y%m%d_%H%M%S)/ratelimit.js.bak 2>/dev/null || true
cp pages/_document.jsx .backups/$(date +%Y%m%d_%H%M%S)/_document.jsx.bak 2>/dev/null || true
cp .env.local .backups/$(date +%Y%m%d_%H%M%S)/env.local.bak 2>/dev/null || true

echo "Backups criados em .backups/$(date +%Y%m%d_%H%M%S)/"

# ============================================
# 2. CORRIGIR next.config.mjs (usar conteudo do .js ou criar do zero)
# ============================================
echo ""
echo ">> 2. Corrigindo next.config.mjs..."

if [ -f "next.config.js" ] && [ -s "next.config.js" ]; then
    # Se next.config.js existe e tem conteudo, copia pro .mjs
    cp next.config.js next.config.mjs
    echo "✅ Copiado conteudo de next.config.js para next.config.mjs"
else
    # Cria do zero com configuracoes minimas
    cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.vercel.app' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', '@react-pdf/renderer'],
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
EOF
    echo "✅ Criado next.config.mjs do zero com PWA + source maps"
fi

# ============================================
# 3. UNIFICAR rateLimit (remover duplicidade)
# ============================================
echo ""
echo ">> 3. Unificando rateLimit..."

# Mantem o rateLimit.js (maiúsculo, usado pelas APIs) e remove ratelimit.js (minúsculo)
if [ -f "lib/rateLimit.js" ] && [ -f "lib/ratelimit.js" ]; then
    # Verifica qual tem o conteudo correto (withRateLimit)
    if grep -q "withRateLimit" lib/rateLimit.js; then
        rm lib/ratelimit.js
        echo "✅ Removido lib/ratelimit.js (duplicado). Usando lib/rateLimit.js"
    elif grep -q "withRateLimit" lib/ratelimit.js; then
        mv lib/ratelimit.js lib/rateLimit.js
        echo "✅ Renomeado lib/ratelimit.js para lib/rateLimit.js"
    else
        # Nenhum dos dois tem withRateLimit, cria um novo
        cat > lib/rateLimit.js << 'EOF'
// Rate limit em memoria (Map puro, zero dependencias externas)
// Fallback para quando @upstash/ratelimit nao esta configurado

const rateLimitMap = new Map();

function isRateLimited(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const windowKey = `${key}:${windowStart}`;
  
  const current = rateLimitMap.get(windowKey) || 0;
  if (current >= maxRequests) {
    return { limited: true, retryAfter: Math.ceil((windowStart + windowMs - now) / 1000) };
  }
  
  rateLimitMap.set(windowKey, current + 1);
  
  // Limpa janelas antigas
  for (const [k, v] of rateLimitMap.entries()) {
    if (parseInt(k.split(':')[1]) < windowStart - windowMs) {
      rateLimitMap.delete(k);
    }
  }
  
  return { limited: false };
}

export function withRateLimit(handler, limiterConfig) {
  return async (req, res) => {
    const key = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';
    const { limited, retryAfter } = isRateLimited(key, limiterConfig?.maxRequests, limiterConfig?.windowMs);
    
    if (limited) {
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', limiterConfig?.maxRequests || 10);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({ error: 'Muitas requisicoes. Tente novamente mais tarde.' });
    }
    
    return handler(req, res);
  };
}

export const pagamentoLimiter = { maxRequests: 10, windowMs: 60000 };
export const analyticsLimiter = { maxRequests: 100, windowMs: 60000 };
export const cadastroLimiter = { maxRequests: 5, windowMs: 60000 };
export const conviteLimiter = { maxRequests: 10, windowMs: 60000 };
export const strictLimiter = { maxRequests: 5, windowMs: 60000 };
EOF
        rm -f lib/ratelimit.js
        echo "✅ Criado novo lib/rateLimit.js com implementacao em memoria"
    fi
else
    echo "⚠️  Apenas um dos arquivos existe, nenhuma acao necessaria"
fi

# ============================================
# 4. CORRIGIR MANIFEST (subpath)
# ============================================
echo ""
echo ">> 4. Corrigindo referencia do manifest..."

# Verifica se o projeto usa subpath (descomplicai)
if grep -q "descomplicai" pages/_document.jsx 2>/dev/null || grep -q "descomplicai" next.config.* 2>/dev/null; then
    sed -i 's|href="/manifest.json"|href="/descomplicai/manifest.json"|g' pages/_document.jsx
    echo "✅ Manifest ajustado para /descomplicai/manifest.json"
else
    echo "ℹ️  Projeto parece usar dominio dedicado, manifest mantido em /manifest.json"
fi

# ============================================
# 5. LIMPAR CONSOLE.LOG DAS APIs
# ============================================
echo ""
echo ">> 5. Removendo console.log das APIs..."

for file in pages/api/trial.js pages/api/cerimonialista/leads.js pages/api/cerimonialista/leads/converter.js pages/api/pagamento/webhook.js; do
    if [ -f "$file" ]; then
        sed -i 's/^[[:space:]]*console\.log(.*);*//g' "$file"
        echo "✅ Limpo console.log em $file"
    fi
done

# ============================================
# 6. VERIFICAR .env.local
# ============================================
echo ""
echo ">> 6. Verificando .env.local..."

if ! grep -q "SUPABASE_ANON_KEY" .env.local 2>/dev/null; then
    echo ""
    echo "⚠️  SUPABASE_ANON_KEY nao encontrado no .env.local"
    echo "    Adicione manualmente: NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui"
    echo "    Ou execute: vercel env pull .env.local"
fi

# ============================================
# 7. VERIFICACAO FINAL
# ============================================
echo ""
echo ">> 7. Verificando correcoes..."
echo "-----------------------------------"

echo "next.config.mjs: $(wc -c < next.config.mjs) bytes"
echo "rateLimit.js: $(test -f lib/rateLimit.js && echo 'EXISTE' || echo 'FALTA')"
echo "ratelimit.js: $(test -f lib/ratelimit.js && echo 'AINDA EXISTE (ERRO!)' || echo 'REMOVIDO ✅')"
echo "Manifest: $(grep 'manifest' pages/_document.jsx | head -n 1)"

echo ""
echo "========================================"
echo "CORRECOES APLICADAS"
echo "========================================"
echo ""
echo "Proximos passos:"
echo "1. Verifique se .env.local tem NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "2. Teste local: npm run build"
echo "3. Commit: git add -A && git commit -m 'fix: correcoes massivas pos-auditoria'"
echo "4. Push: git push origin main"
echo "5. Deploy na Vercel"