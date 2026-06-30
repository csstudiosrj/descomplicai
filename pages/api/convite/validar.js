import { createClient } from '@supabase/supabase-js';
import { trackServerEvent } from '../../../utils/trackServerEvent';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ erro: 'Token não informado' });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: convite, error } = await supabaseAdmin
      .from('convites')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !convite) {
      return res.status(404).json({ erro: 'Convite não encontrado' });
    }

    if (convite.usado_em) {
      return res.status(400).json({ erro: 'Convite já foi utilizado' });
    }

    if (new Date(convite.expira_em) < new Date()) {
      return res.status(400).json({ erro: 'Convite expirado' });
    }

    // Track analytics
    await trackServerEvent({
      tipo: 'acao',
      categoria: 'auth',
      acao: 'convite_validado',
      usuario_id: convite.usuario_id,
      req,
    });

    return res.status(200).json({
      sucesso: true,
      convite: {
        id: convite.id,
        tipo: convite.tipo,
        evento_id: convite.evento_id,
        email: convite.email,
      },
    });
  } catch (err) {
    console.error('[convite/validar] erro:', err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
}
