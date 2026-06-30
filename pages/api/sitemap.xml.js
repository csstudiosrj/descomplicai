// pages/api/sitemap.xml.js
// Sitemap dinâmico com service role do Supabase

import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const staticUrls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/vitrine', priority: '0.9', changefreq: 'daily' },
    { loc: '/login', priority: '0.5', changefreq: 'monthly' },
    { loc: '/cadastro', priority: '0.5', changefreq: 'monthly' },
    { loc: '/memorial', priority: '0.8', changefreq: 'weekly' },
  ];

  let fornecedorUrls = [];
  try {
    const { data: fornecedores, error } = await supabaseAdmin
      .from('fornecedores')
      .select('id, atualizado_em')
      .eq('status', 'aprovado')
      .order('atualizado_em', { ascending: false });

    if (!error && fornecedores) {
      fornecedorUrls = fornecedores.map((f) => ({
        loc: `/vitrine/${f.id}`,
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: f.atualizado_em
          ? new Date(f.atualizado_em).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      }));
    }
  } catch (err) {
    console.error('[SITEMAP] Erro ao buscar fornecedores:', err);
  }

  const allUrls = [...staticUrls, ...fornecedorUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <priority>${u.priority}</priority>
    <changefreq>${u.changefreq}</changefreq>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(sitemap);
}
