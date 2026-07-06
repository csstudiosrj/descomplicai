import { withRateLimit, strictLimiter } from '@/lib/rateLimit.js';
/**
 * API Route — Persiste memorial no Supabase + gera financeiro sugerido
 * POST /api/memorial/salvar
 * Body: { evento_id: string, estado: Object, conteudo?: string }
 * Headers: Authorization (JWT do Supabase)
 */

import { createClient } from '@supabase/supabase-js';
import { gerarLinhasFinanceiro } from '../../../utils/gerador-financeiro';
import { trackServerEvent } from '../../../utils/trackServerEvent';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Extrai valores denormalizados do estado para sincronizar em eventos. */
function extrairDenormalizados(estado) {
  if (!estado || typeof estado !== 'object') return {};

  return {
    tipo_cerimonia: estado.tipoCerimonia || null,
    tipo_local: estado.tipoLocal || null,
    estilo: estado.estilo || null,
    total_convidados: estado.totalConvidados || null,
    faixa_orcamento: estado.orcamentoTotal ? Number(estado.orcamentoTotal) : null,
    musica_festa: estado.musicaFesta || null,
    flores: estado.flores || null,
    iluminacao: estado.iluminacao || null,
    tipo_jantar: estado.tipoJantar || null,
    tipo_bar: estado.tipoBar || null,
    formato_convite: estado.formatoConvite || null,
    estilo_vestido: estado.estiloVestido || null,
    estado_civil_noivo: estado.estadoCivilNoivo || null,
    estado_civil_noiva: estado.estadoCivilNoiva || null,
    lua_de_mel: estado.luaDeMel === true,
    memorial_concluido: true,
  };
}

async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticacao necessaria' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Valida token e extrai user
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }

  const { evento_id, estado, conteudo } = req.body;

  if (!evento_id) {
    return res.status(400).json({ error: 'evento_id e obrigatorio' });
  }
  if (!estado || typeof estado !== 'object') {
    return res.status(400).json({ error: 'Estado invalido' });
  }

  try {
    // 1. Verifica se o evento pertence ao usuario + pega orcamento
    const { data: evento, error: evtErr } = await supabaseAdmin
      .from('eventos')
      .select('id, usuario_id, orcamento')
      .eq('id', evento_id)
      .single();

    if (evtErr || !evento) {
      return res.status(404).json({ error: 'Evento nao encontrado' });
    }
    if (evento.usuario_id !== user.id) {
      return res.status(403).json({ error: 'Acesso negado ao evento' });
    }

    // 2. Gera texto markdown se nao vier do cliente
    const conteudoFinal = conteudo || gerarTextoMemorialSimples(estado);

    // 3. Upsert na tabela memoriais (por evento_id)
    // CORRECAO: coluna 'conteudo' -> 'conteudo_gerado'
    const { data: memorialUpsert, error: memErr } = await supabaseAdmin
      .from('memoriais')
      .upsert(
        {
          user_id: user.id,
          evento_id,
          estado,
          conteudo_gerado: conteudoFinal,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: 'evento_id' }
      )
      .select('id')
      .single();

    if (memErr) throw memErr;

    // 4. Sincroniza colunas denormalizadas em eventos
    const denorm = extrairDenormalizados(estado);
    const { error: syncErr } = await supabaseAdmin
      .from('eventos')
      .update({
        ...denorm,
        memoriais_id: memorialUpsert.id,
      })
      .eq('id', evento_id);

    if (syncErr) {
      console.error('[memorial/salvar] Erro ao sincronizar eventos:', syncErr);
    }

    // 5. GERA FINANCEIRO SUGERIDO
    const orcamentoTotal = Number(evento.orcamento) || Number(estado.orcamentoTotal) || 0;
    if (orcamentoTotal > 0) {
      const linhasFinanceiro = gerarLinhasFinanceiro(estado, orcamentoTotal);

      if (linhasFinanceiro.length > 0) {
        const { error: delFinErr } = await supabaseAdmin
          .from('financeiro')
          .delete()
          .eq('evento_id', evento_id)
          .eq('gerado_auto', true)
          .eq('sincronizado', false);

        if (delFinErr) {
          console.error('[memorial/salvar] Erro ao limpar financeiro antigo:', delFinErr);
        }

        const linhasCompletas = linhasFinanceiro.map((l) => ({
          ...l,
          evento_id,
          usuario_id: user.id,
        }));

        const { error: finErr } = await supabaseAdmin
          .from('financeiro')
          .insert(linhasCompletas);

        if (finErr) {
          console.error('[memorial/salvar] Erro ao inserir financeiro:', finErr);
        }
      }
    }

    // Track analytics
    await trackServerEvent({
      tipo: 'acao',
      categoria: 'memorial',
      acao: 'salvo',
      usuario_id: user.id,
      evento_id,
      req,
    });

    return res.status(200).json({
      sucesso: true,
      memorial_id: memorialUpsert.id,
      financeiro_gerado: orcamentoTotal > 0,
    });
  } catch (e) {
    console.error('[API memorial/salvar]', e);
    return res.status(500).json({ sucesso: false, erro: e.message });
  }
}

function gerarTextoMemorialSimples(estado) {
  const linhas = [];
  linhas.push('# Memorial do Casamento');
  linhas.push('');
  if (estado.nomeCasal) linhas.push(`**Casal:** ${estado.nomeCasal}`);
  if (estado.dataEvento) linhas.push(`**Data:** ${estado.dataEvento}`);
  if (estado.tipoCerimonia) linhas.push(`**Cerimonia:** ${estado.tipoCerimonia}`);
  if (estado.tipoLocal) linhas.push(`**Local:** ${estado.tipoLocal}`);
  if (estado.estilo) linhas.push(`**Estilo:** ${estado.estilo}`);
  if (estado.totalConvidados) linhas.push(`**Convidados:** ${estado.totalConvidados}`);
  linhas.push('');
  linhas.push('---');
  linhas.push('*Gerado automaticamente pelo Descomplicai*');
  return linhas.join('\n');
}
// Rate limit: strictLimiter
export default withRateLimit(_handler, strictLimiter);