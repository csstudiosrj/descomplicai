// lib/extractSupabaseToken.js

/**
 * Extrai o token JWT do Supabase de cookies chunkados.
 * O Supabase chunka o token em múltiplos cookies quando é grande:
 * sb-<ref>-auth-token.0, sb-<ref>-auth-token.1, etc.
 */
export function extractSupabaseToken(req) {
    const cookieHeader = req.headers.cookie || '';
    if (!cookieHeader) return null;
  
    const cookies = {};
    cookieHeader.split(';').forEach(pair => {
      const [name, ...rest] = pair.trim().split('=');
      if (name) cookies[name.trim()] = rest.join('=').trim();
    });
  
    // 1. Tentar cookie não-chunkado (token pequeno)
    const nonChunked = Object.keys(cookies).find(k => 
      k.startsWith('sb-') && k.endsWith('-auth-token') && !k.includes('.')
    );
    if (nonChunked) {
      return decodeURIComponent(cookies[nonChunked]);
    }
  
    // 2. Juntar cookies chunkados (.0, .1, .2...)
    const chunks = Object.keys(cookies)
      .filter(k => k.startsWith('sb-') && k.match(/-auth-token\.\d+$/))
      .sort((a, b) => {
        const numA = parseInt(a.split('.').pop(), 10);
        const numB = parseInt(b.split('.').pop(), 10);
        return numA - numB;
      });
  
    if (chunks.length === 0) return null;
  
    let token = chunks.map(k => decodeURIComponent(cookies[k])).join('');
  
    // 3. Remover prefixo base64- se existir
    if (token.startsWith('base64-')) {
      token = token.slice(7);
    }
  
    // 4. Tentar decodificar de base64 (Supabase às vezes codifica)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      // Se decodificou para JSON válido, é o session object
      const parsed = JSON.parse(decoded);
      if (parsed.access_token) return parsed.access_token;
      if (parsed.token) return parsed.token;
      // Se não tem access_token, pode ser o token direto em base64
      return token;
    } catch {
      // Não é base64/JSON, retorna o token cru
      return token;
    }
  }
  
  /**
   * Extrai o session object completo (não só o access_token)
   */
  export function extractSupabaseSession(req) {
    const cookieHeader = req.headers.cookie || '';
    if (!cookieHeader) return null;
  
    const cookies = {};
    cookieHeader.split(';').forEach(pair => {
      const [name, ...rest] = pair.trim().split('=');
      if (name) cookies[name.trim()] = rest.join('=').trim();
    });
  
    const chunks = Object.keys(cookies)
      .filter(k => k.startsWith('sb-') && k.match(/-auth-token\.\d+$/))
      .sort((a, b) => {
        const numA = parseInt(a.split('.').pop(), 10);
        const numB = parseInt(b.split('.').pop(), 10);
        return numA - numB;
      });
  
    let raw = '';
    if (chunks.length > 0) {
      raw = chunks.map(k => decodeURIComponent(cookies[k])).join('');
    } else {
      const nonChunked = Object.keys(cookies).find(k => 
        k.startsWith('sb-') && k.endsWith('-auth-token') && !k.includes('.')
      );
      if (nonChunked) raw = decodeURIComponent(cookies[nonChunked]);
    }
  
    if (!raw) return null;
  
    if (raw.startsWith('base64-')) raw = raw.slice(7);
  
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return { access_token: raw };
    }
  }