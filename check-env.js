const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'MERCADO_PAGO_ACCESS_TOKEN',
  'MERCADO_PAGO_PUBLIC_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN'
];

const missing = requiredEnvVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ VARIÁVEIS DE AMBIENTE FALTANDO:');
  missing.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis de ambiente estão configuradas');
}
