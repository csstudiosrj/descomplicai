import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  // Testa com service role
  const supabaseService = createClient(url, key);
  const { data: dataService, error: errorService } = await supabaseService
    .from('configuracoes')
    .select('chave')
    .limit(1);
  
  // Testa com anon key (para comparar)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseAnon = createClient(url, anonKey);
  const { data: dataAnon, error: errorAnon } = await supabaseAnon
    .from('configuracoes')
    .select('chave')
    .limit(1);
  
  res.status(200).json({
    serviceRole: {
      hasKey: !!key,
      keyPrefix: key.slice(0, 20),
      error: errorService?.message,
      data: dataService,
    },
    anon: {
      hasKey: !!anonKey,
      keyPrefix: anonKey.slice(0, 20),
      error: errorAnon?.message,
      data: dataAnon,
    },
    sameKey: key === anonKey,
  });
}