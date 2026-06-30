// Global setup removido — nao precisa criar usuario no Supabase
// Os testes E2E usam paginas publicas ou mockam requests

module.exports = async function globalSetup(config) {
  // Nada a fazer
  console.log('[GlobalSetup] E2E configurado para rodar sem dependencias externas');
};
