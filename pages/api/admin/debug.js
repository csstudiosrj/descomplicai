// pages/api/admin/debug.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS para permitir leitura
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');

  const allCookies = req.headers.cookie || '';
  
  // Lista TODOS os cookies que começam com sb-
  const sbCookies = allCookies
    .split(';')
    .map(c => c.trim())
    .filter(c => c.includes('sb-') && c.includes('auth-token'));

  res.status(200).json({
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    host: req.headers.host,
    referer: req.headers.referer,
    cookieHeaderLength: allCookies.length,
    cookieHeaderPreview: allCookies.substring(0, 500),
    sbCookiesFound: sbCookies,
    sbCookiesCount: sbCookies.length,
    allCookiesParsed: allCookies.split(';').map(c => {
      const [name] = c.trim().split('=');
      return name;
    }).filter(Boolean),
  });
}