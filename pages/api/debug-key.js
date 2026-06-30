export default function handler(req, res) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const masked = key ? `${key.slice(0,8)}...${key.slice(-4)}` : 'NÃO CONFIGURADA';
    res.status(200).json({ 
      hasKey: !!key,
      keyPreview: masked,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  }