#!/bin/bash
# ============================================================
# FASE 2: APIs — Validar categoria contra catálogo
# ============================================================

PROJECT_DIR="."
BACKUP_DIR="$PROJECT_DIR/.backup-apis-$(date +%s)"
mkdir -p "$BACKUP_DIR"

echo "═══════════════════════════════════════════════════════"
echo "  BACKUP DOS 6 ARQUIVOS DE API"
echo "═══════════════════════════════════════════════════════"

cp "$PROJECT_DIR/pages/api/cerimonialista/financeiro.js" "$BACKUP_DIR/"
cp "$PROJECT_DIR/pages/api/contratos/criar.js" "$BACKUP_DIR/"
cp "$PROJECT_DIR/pages/api/contratos/upload.js" "$BACKUP_DIR/"
cp "$PROJECT_DIR/pages/api/tarefas/gerar.js" "$BACKUP_DIR/"
cp "$PROJECT_DIR/pages/api/fornecedores/avaliacoes.js" "$BACKUP_DIR/"
cp "$PROJECT_DIR/pages/api/fornecedores/metricas.js" "$BACKUP_DIR/"

echo "Backup salvo em: $BACKUP_DIR"
echo ""

# ============================================================
# 1. pages/api/cerimonialista/financeiro.js
# ============================================================
cat > "$PROJECT_DIR/pages/api/cerimonialista/financeiro.js" << 'EOF_API1'
import { createClient } from '@supabase/supabase-js';
import { SUBCATEGORIAS_FLAT } from '../../../utils/catalogoFornecedores';

const CATEGORIAS_VALIDAS = new Set(SUBCATEGORIAS_FLAT.map(s => s.id));

function validarCategoria(categoria) {
  if (!categoria) return null;
  const limpa = categoria.trim();
  if (!limpa) return null;
  if (!CATEGORIAS_VALIDAS.has(limpa)) {
    return { erro: `Categoria invalida: "${limpa}"` };
  }
  return limpa;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuracao do Supabase incompleta' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao nao fornecido' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }

  const { data: cerimonialista, error: cerimError } = await supabase
    .from('cerimonialistas')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  if (cerimError || !cerimonialista) {
    return res.status(403).json({ error: 'Usuario nao e cerimonialista' });
  }

  const cerimonialistaId = cerimonialista.id;

  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('cerimonialista_financeiro')
          .select('*')
          .eq('cerimonialista_id', cerimonialistaId)
          .order('data_vencimento', { ascending: false });

        if (error) throw error;
        return res.status(200).json({ lancamentos: data || [] });
      }

      case 'POST': {
        const { evento_id, tipo, categoria, descricao, valor, data_vencimento, pago } = req.body;

        if (!tipo || !valor) {
          return res.status(400).json({ error: 'Tipo e valor sao obrigatorios' });
        }

        const catValidada = validarCategoria(categoria);
        if (catValidada && typeof catValidada === 'object' && catValidada.erro) {
          return res.status(400).json({ error: catValidada.erro });
        }

        const { data, error } = await supabase
          .from('cerimonialista_financeiro')
          .insert({
            cerimonialista_id: cerimonialistaId,
            evento_id: evento_id || null,
            tipo,
            categoria: catValidada,
            descricao: descricao?.trim() || null,
            valor: parseFloat(valor),
            data_vencimento: data_vencimento || null,
            pago: pago || false,
          })
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json({ lancamento: data });
      }

      case 'PUT': {
        const { id, ...updates } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do lancamento e obrigatorio' });
        }

        const { data: existing, error: checkError } = await supabase
          .from('cerimonialista_financeiro')
          .select('id')
          .eq('id', id)
          .eq('cerimonialista_id', cerimonialistaId)
          .single();

        if (checkError || !existing) {
          return res.status(403).json({ error: 'Lancamento nao encontrado ou sem permissao' });
        }

        const cleanUpdates = {};
        if (updates.evento_id !== undefined) cleanUpdates.evento_id = updates.evento_id || null;
        if (updates.tipo !== undefined) cleanUpdates.tipo = updates.tipo;
        if (updates.categoria !== undefined) {
          const catValidada = validarCategoria(updates.categoria);
          if (catValidada && typeof catValidada === 'object' && catValidada.erro) {
            return res.status(400).json({ error: catValidada.erro });
          }
          cleanUpdates.categoria = catValidada;
        }
        if (updates.descricao !== undefined) cleanUpdates.descricao = updates.descricao?.trim() || null;
        if (updates.valor !== undefined) cleanUpdates.valor = parseFloat(updates.valor);
        if (updates.data_vencimento !== undefined) cleanUpdates.data_vencimento = updates.data_vencimento || null;
        if (updates.pago !== undefined) cleanUpdates.pago = updates.pago;

        const { data, error } = await supabase
          .from('cerimonialista_financeiro')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ lancamento: data });
      }

      case 'DELETE': {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do lancamento e obrigatorio' });
        }

        const { error } = await supabase
          .from('cerimonialista_financeiro')
          .delete()
          .eq('id', id)
          .eq('cerimonialista_id', cerimonialistaId);

        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
    }
  } catch (err) {
    console.error('[API financeiro]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
EOF_API1

echo "[1/6] financeiro.js atualizado"

# ============================================================
# 2. pages/api/contratos/criar.js
# ============================================================
cat > "$PROJECT_DIR/pages/api/contratos/criar.js" << 'EOF_API2'
import { createClient } from '@supabase/supabase-js';
import { SUBCATEGORIAS_FLAT } from '../../../utils/catalogoFornecedores';

const CATEGORIAS_VALIDAS = new Set(SUBCATEGORIAS_FLAT.map(s => s.id));

function validarCategoria(categoria) {
  if (!categoria) return null;
  const limpa = categoria.trim();
  if (!limpa) return null;
  if (!CATEGORIAS_VALIDAS.has(limpa)) {
    return { erro: `Categoria invalida: "${limpa}"` };
  }
  return limpa;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  const { evento_id, fornecedor_id, tipo, categoria, conteudo } = req.body;

  if (!evento_id || !fornecedor_id || !tipo || !conteudo) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  const catValidada = validarCategoria(categoria);
  if (catValidada && typeof catValidada === 'object' && catValidada.erro) {
    return res.status(400).json({ erro: catValidada.erro });
  }

  try {
    const { data, error } = await supabase
      .from('contratos')
      .insert({
        evento_id,
        fornecedor_id,
        tipo,
        categoria: catValidada,
        status: 'rascunho',
        conteudo,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ contrato: data });
  } catch (err) {
    console.error('Erro ao criar contrato:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}
EOF_API2

echo "[2/6] contratos/criar.js atualizado"

# ============================================================
# 3. pages/api/contratos/upload.js
# ============================================================
cat > "$PROJECT_DIR/pages/api/contratos/upload.js" << 'EOF_API3'
import { createClient } from '@supabase/supabase-js';
import { SUBCATEGORIAS_FLAT } from '../../../utils/catalogoFornecedores';

const CATEGORIAS_VALIDAS = new Set(SUBCATEGORIAS_FLAT.map(s => s.id));

function validarCategoria(categoria) {
  if (!categoria) return null;
  const limpa = categoria.trim();
  if (!limpa) return null;
  if (!CATEGORIAS_VALIDAS.has(limpa)) {
    return { erro: `Categoria invalida: "${limpa}"` };
  }
  return limpa;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  const { evento_id, fornecedor_id, pdf_url, categoria, conteudo } = req.body;
  if (!evento_id || !fornecedor_id || !pdf_url) {
    return res.status(400).json({ erro: 'Dados incompletos (evento_id, fornecedor_id, pdf_url)' });
  }

  const catValidada = validarCategoria(categoria);
  if (catValidada && typeof catValidada === 'object' && catValidada.erro) {
    return res.status(400).json({ erro: catValidada.erro });
  }

  try {
    const { data, error } = await supabase
      .from('contratos')
      .insert({
        evento_id,
        fornecedor_id,
        tipo: 'upload_fornecedor',
        categoria: catValidada,
        status: 'enviado',
        conteudo: conteudo || null,
        pdf_url,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ contrato: data });
  } catch (err) {
    console.error('Erro ao criar contrato upload:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}
EOF_API3

echo "[3/6] contratos/upload.js atualizado"

# ============================================================
# 4. pages/api/tarefas/gerar.js
# ============================================================
cat > "$PROJECT_DIR/pages/api/tarefas/gerar.js" << 'EOF_API4'
import { createClient } from '@supabase/supabase-js';
import { gerarTarefasContextualizadas } from '../../../utils/gerador-tarefas';
import { TAREFAS_PADRAO } from '../../../utils/tarefasPadrao';
import { SUBCATEGORIAS_FLAT, CATALOGO_FORNECEDORES } from '../../../utils/catalogoFornecedores';

const CATEGORIAS_VALIDAS = new Set(SUBCATEGORIAS_FLAT.map(s => s.id));
const CATEGORIAS_PRINCIPAIS_VALIDAS = new Set(CATALOGO_FORNECEDORES.map(c => c.id));

function normalizarCategoria(categoria) {
  if (!categoria) return null;
  const limpa = String(categoria).trim();
  if (!limpa) return null;
  if (CATEGORIAS_VALIDAS.has(limpa)) return limpa;
  return 'outro';
}

function normalizarCategoriaPrincipal(categoriaPrincipal) {
  if (!categoriaPrincipal) return null;
  const limpa = String(categoriaPrincipal).trim();
  if (!limpa) return null;
  if (CATEGORIAS_PRINCIPAIS_VALIDAS.has(limpa)) return limpa;
  return 'outro';
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  const { evento_id, data_evento, usuario_id, forcar_regeneracao } = req.body;

  if (!evento_id || !data_evento) {
    return res.status(400).json({ erro: 'evento_id e data_evento sao obrigatorios' });
  }

  const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, key);

  try {
    let uid = usuario_id;
    if (!uid) {
      const { data: evt } = await supabase
        .from('eventos')
        .select('usuario_id')
        .eq('id', evento_id)
        .single();
      uid = evt?.usuario_id;
    }
    if (!uid) {
      return res.status(400).json({ erro: 'usuario_id nao encontrado' });
    }

    if (!forcar_regeneracao) {
      const { data: existentes, error: errCheck } = await supabase
        .from('tarefas')
        .select('id')
        .eq('evento_id', evento_id)
        .eq('gerada_auto', true)
        .limit(1);

      if (errCheck) throw errCheck;
      if (existentes && existentes.length > 0) {
        return res.status(200).json({ sucesso: true, criadas: 0, mensagem: 'Tarefas ja existem' });
      }
    }

    const { data: memorial, error: memErr } = await supabase
      .from('memoriais')
      .select('estado')
      .eq('evento_id', evento_id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (memErr) console.error('[gerar-tarefas] Erro ao buscar memorial:', memErr);

    let tarefasParaInserir = [];

    if (memorial?.estado) {
      const estado = typeof memorial.estado === 'string' ? JSON.parse(memorial.estado) : memorial.estado;
      const contextualizadas = gerarTarefasContextualizadas(estado, data_evento);

      tarefasParaInserir = contextualizadas.map((t) => ({
        evento_id,
        usuario_id: uid,
        titulo: t.titulo,
        descricao: t.descricao,
        categoria: normalizarCategoria(t.categoria),
        categoria_principal: normalizarCategoriaPrincipal(t.categoria_principal),
        prazo: t.prazo,
        concluida: t.concluida,
        gerada_auto: true,
        prioridade: t.prioridade,
      }));
    }

    if (tarefasParaInserir.length === 0) {
      const dataEvento = new Date(data_evento + 'T00:00:00');

      tarefasParaInserir = TAREFAS_PADRAO.map((t) => {
        const dataPrazo = new Date(dataEvento);
        dataPrazo.setDate(dataPrazo.getDate() - t.diasAntes);
        return {
          evento_id,
          usuario_id: uid,
          titulo: t.titulo,
          descricao: t.descricao,
          categoria: normalizarCategoria(t.categoria),
          prazo: dataPrazo.toISOString().split('T')[0],
          concluida: false,
          gerada_auto: true,
        };
      });
    }

    if (forcar_regeneracao) {
      const { error: delErr } = await supabase
        .from('tarefas')
        .delete()
        .eq('evento_id', evento_id)
        .eq('gerada_auto', true);
      if (delErr) console.error('[gerar-tarefas] Erro ao deletar antigas:', delErr);
    }

    const { error } = await supabase.from('tarefas').insert(tarefasParaInserir);
    if (error) throw error;

    return res.status(201).json({
      sucesso: true,
      criadas: tarefasParaInserir.length,
      contextualizadas: tarefasParaInserir[0]?.categoria_principal !== undefined,
    });
  } catch (err) {
    console.error('[gerar-tarefas]', err);
    return res.status(500).json({ erro: 'Erro ao gerar tarefas', detalhe: err.message });
  }
}
EOF_API4

echo "[4/6] tarefas/gerar.js atualizado"

# ============================================================
# 5. pages/api/fornecedores/avaliacoes.js
# ============================================================
cat > "$PROJECT_DIR/pages/api/fornecedores/avaliacoes.js" << 'EOF_API5'
import { createClient } from '@supabase/supabase-js';
import { getLabelSubcategoria } from '../../../utils/catalogoFornecedores';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: fornecedor } = await supabase
      .from('fornecedores_plataforma')
      .select('id, categoria, avaliacao_media, total_avaliacoes')
      .eq('usuario_id', user.id)
      .single();

    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor not found' });
    }

    const { data: avaliacoes } = await supabase
      .from('avaliacoes')
      .select('id, nota, comentario, nome_casal, criado_em')
      .eq('fornecedor_id', fornecedor.id)
      .order('criado_em', { ascending: false })
      .limit(5);

    const { data: mediaCategoria } = await supabase
      .from('fornecedores_plataforma')
      .select('avaliacao_media')
      .eq('categoria', fornecedor.categoria)
      .gt('total_avaliacoes', 0);

    const mediaCat = mediaCategoria?.length 
      ? (mediaCategoria.reduce((acc, f) => acc + Number(f.avaliacao_media), 0) / mediaCategoria.length).toFixed(1)
      : '0.0';

    res.status(200).json({
      avaliacoes: avaliacoes || [],
      mediaFornecedor: Number(fornecedor.avaliacao_media) || 0,
      totalAvaliacoes: fornecedor.total_avaliacoes,
      mediaCategoria: mediaCat,
      categoriaLabel: getLabelSubcategoria(fornecedor.categoria)
    });
  } catch (err) {
    console.error('[API avaliacoes] erro:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
EOF_API5

echo "[5/6] fornecedores/avaliacoes.js atualizado"

# ============================================================
# 6. pages/api/fornecedores/metricas.js
# ============================================================
cat > "$PROJECT_DIR/pages/api/fornecedores/metricas.js" << 'EOF_API6'
import { createClient } from '@supabase/supabase-js';
import { getLabelSubcategoria } from '../../../utils/catalogoFornecedores';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: fornecedor } = await supabase
      .from('fornecedores_plataforma')
      .select('id, nome_empresa, visualizacoes, avaliacao_media, total_avaliacoes, plano, ativo, cidade, categoria')
      .eq('usuario_id', user.id)
      .single();

    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor not found' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgoDate = thirtyDaysAgo.split('T')[0];

    const { data: cliques } = await supabase
      .from('cliques_fornecedor')
      .select('tipo')
      .eq('fornecedor_id', fornecedor.id)
      .gte('criado_em', thirtyDaysAgo);

    const { data: metricasDiarias } = await supabase
      .from('metricas_fornecedor')
      .select('dia, visualizacoes, cliques')
      .eq('fornecedor_id', fornecedor.id)
      .gte('dia', thirtyDaysAgoDate)
      .order('dia', { ascending: true });

    const dadosGrafico = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const diaStr = d.toISOString().split('T')[0];
      const metrica = metricasDiarias?.find(m => m.dia === diaStr);
      dadosGrafico.push({
        dia: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        valor: metrica?.visualizacoes || 0
      });
    }

    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    const { count: oportunidadesCount } = await supabase
      .from('eventos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rascunho')
      .gte('data_evento', new Date().toISOString().split('T')[0])
      .lte('data_evento', sixMonthsFromNow.toISOString().split('T')[0]);

    res.status(200).json({
      fornecedor: {
        nomeEmpresa: fornecedor.nome_empresa,
        plano: fornecedor.plano,
        ativo: fornecedor.ativo,
        cidade: fornecedor.cidade,
        categoria: fornecedor.categoria,
        categoriaLabel: getLabelSubcategoria(fornecedor.categoria)
      },
      metricas: {
        visualizacoes: fornecedor.visualizacoes,
        cliques: cliques?.length || 0,
        avaliacaoMedia: Number(fornecedor.avaliacao_media) || 0,
        totalAvaliacoes: fornecedor.total_avaliacoes
      },
      grafico: dadosGrafico,
      oportunidades: oportunidadesCount || 0
    });
  } catch (err) {
    console.error('[API metricas] erro:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
EOF_API6

echo "[6/6] fornecedores/metricas.js atualizado"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  FASE 2 CONCLUIDA — 6 APIs ATUALIZADAS"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Backup em: $BACKUP_DIR"
echo ""
echo "Resumo das mudancas:"
echo "  - financeiro.js: valida categoria no POST/PUT, retorna 400 se invalida"
echo "  - contratos/criar.js: valida categoria, retorna 400 se invalida"
echo "  - contratos/upload.js: valida categoria, retorna 400 se invalida"
echo "  - tarefas/gerar.js: normaliza categoria/categoria_principal, fallback 'outro'"
echo "  - avaliacoes.js: adiciona categoriaLabel na resposta"
echo "  - metricas.js: adiciona categoriaLabel na resposta"
echo ""
echo "Proximo: commit/push para Vercel e testar no deploy."