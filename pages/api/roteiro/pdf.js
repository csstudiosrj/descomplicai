import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';

/**
 * API de geracao de PDF do Roteiro do Cerimonialista
 * Usa @react-pdf/renderer — mesmo padrao do MemorialPDF
 * POST /api/roteiro/pdf
 * Body: { evento_id }
 * Header: Authorization: Bearer <token>
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  try {
    const { evento_id } = req.body;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!evento_id || !token) {
      return res.status(400).json({ erro: 'evento_id e token sao obrigatorios' });
    }

    // 1. Autenticar
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ erro: 'Nao autorizado' });
    }

    // 2. Verificar se e cerimonialista
    const { data: cerim, error: cerimError } = await supabaseAdmin
      .from('cerimonialistas')
      .select('id')
      .eq('usuario_id', user.id)
      .single();

    if (cerimError || !cerim) {
      return res.status(403).json({ erro: 'Apenas cerimonialistas podem exportar roteiro' });
    }

    const cerimonialistaId = cerim.id;

    // 3. Buscar evento
    const { data: evento, error: eventoError } = await supabaseAdmin
      .from('eventos')
      .select('id, nome_evento, data_evento, cidade, estado, memorial, cerimonialista_id')
      .eq('id', evento_id)
      .single();

    if (eventoError || !evento) {
      return res.status(404).json({ erro: 'Evento nao encontrado' });
    }

    // 4. Verificar permissao (dono ou vinculo)
    const { data: vinculo } = await supabaseAdmin
      .from('cerimonialista_eventos')
      .select('id')
      .eq('evento_id', evento_id)
      .eq('cerimonialista_id', cerimonialistaId)
      .maybeSingle();

    const isDono = evento.cerimonialista_id === cerimonialistaId;
    if (!vinculo && !isDono) {
      return res.status(403).json({ erro: 'Sem permissao para este evento' });
    }

    // 5. Buscar roteiro (cerimonialista ve TUDO)
    const { data: itens, error: itensError } = await supabaseAdmin
      .from('cerimonialista_roteiro_itens')
      .select('*')
      .eq('evento_id', evento_id)
      .eq('cerimonialista_id', cerimonialistaId)
      .order('ordem', { ascending: true })
      .order('horario', { ascending: true });

    if (itensError) {
      console.error('[PDF Roteiro] Erro ao buscar roteiro:', itensError);
      return res.status(500).json({ erro: 'Erro ao buscar roteiro' });
    }

    // 6. Extrair paleta do memorial
    let paleta = {};
    try {
      if (evento.memorial) {
        const memorial = typeof evento.memorial === 'string'
          ? JSON.parse(evento.memorial)
          : evento.memorial;
        paleta = {
          primaria: memorial.cor1 || memorial.primaria || memorial.paleta?.[0],
          secundaria: memorial.cor2 || memorial.secundaria || memorial.paleta?.[1],
          terciaria: memorial.cor3 || memorial.terciaria || memorial.paleta?.[2],
        };
      }
    } catch (e) {
      paleta = {};
    }

    // 7. Renderizar PDF com @react-pdf/renderer
    // Import dinamico para evitar carregar no client
    const { RoteiroPDF } = await import('../../../components/pdf/RoteiroPDF.jsx');

    const pdfElement = React.createElement(RoteiroPDF, {
      evento,
      itens: itens || [],
      paleta,
    });

    const stream = await renderToStream(pdfElement);
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const pdfBuffer = Buffer.concat(chunks);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="roteiro-${evento_id}.pdf"`);
    res.setHeader('Cache-Control', 'no-store');

    return res.end(pdfBuffer);

  } catch (err) {
    console.error('[PDF Roteiro] Erro fatal:', err);
    return res.status(500).json({ erro: 'Erro interno ao gerar PDF', detalhe: err.message });
  }
}
