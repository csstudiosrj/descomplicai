import { withRateLimit, pagamentoLimiter } from "@/lib/rateLimit.js";
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { MemorialPDFDocument } from '../../components/pdf/MemorialPDFDocument';

/**
 * API Route: POST /api/gerar-pdf
 * Recebe dados do memorial, resolve imagens locais no servidor,
 * gera o PDF via @react-pdf/renderer e retorna como blob.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido. Use POST.' });
  }

  try {
    const { memorial, dadosEvento, qrCodeDataUri, dimensoesImagens } = req.body || {};

    if (!memorial || !dadosEvento) {
      return res.status(400).json({ erro: 'memorial e dadosEvento são obrigatórios.' });
    }

    // ── Resolve imagens locais no servidor ───────────────────────────────
    const baseImagePath = path.join(process.cwd(), 'public', 'images');

    function img(categoria, arquivo) {
      return path.join(baseImagePath, categoria, arquivo);
    }

    function getImagemLocal(categoria, chave) {
      const IMAGENS = {
        flores: {
          'Rosas': img('flores', 'rosas-1.jpg'),
          'Orquídeas': img('flores', 'flores-default-1.jpg'),
          'Lírios': img('flores', 'flores-default-2.jpg'),
          'Tulipas': img('flores', 'flores-default-3.jpg'),
          'Peônias': img('flores', 'flores-default-4.jpg'),
          'Flores do campo': img('flores', 'flores-do-campo-1.jpg'),
          'Flores secas': img('flores', 'flores-secas-1.jpg'),
          'Eucalipto': img('flores', 'flores-default-5.jpg'),
          'Hortênsias': img('flores', 'flores-default-6.jpg'),
          'Gérberas': img('flores', 'flores-default-7.jpg'),
          'Astilbe': img('flores', 'flores-default-8.jpg'),
          'Dálias': img('flores', 'flores-default-9.jpg'),
          'Chuva de ouro': img('flores', 'flores-default-10.jpg'),
          'Alstroemérias': img('flores', 'flores-default-11.jpg'),
          'Anêmonas': img('flores', 'flores-default-12.jpg'),
          'Ranúnculos': img('flores', 'flores-default-13.jpg'),
          'Lavanda': img('flores', 'flores-default-14.jpg'),
          'Margaridas': img('flores', 'flores-default-15.jpg'),
          'Gipsofila': img('flores', 'flores-default-16.jpg'),
          'Antúrios': img('flores', 'flores-default-17.jpg'),
          'Bromélias': img('flores', 'flores-default-18.jpg'),
          'Orquídeas phalaenopsis': img('flores', 'flores-default-19.jpg'),
          'Crisântemos': img('flores', 'flores-default-20.jpg'),
          'Cala': img('flores', 'flores-default-21.jpg'),
          'Proteas': img('flores', 'flores-default-22.jpg'),
          'Statice': img('flores', 'flores-default-23.jpg'),
          'Verônicas': img('flores', 'flores-default-24.jpg'),
          'Amarílis': img('flores', 'flores-default-25.jpg'),
          default: img('flores', 'flores-default-1.jpg'),
        },
        vestido: {
          'Princesa': img('vestidos', 'vestido-default-1.jpg'),
          'Sereia': img('vestidos', 'vestido-default-2.jpg'),
          'Minimalista': img('vestidos', 'vestido-minimalista-1.jpg'),
          'Boho': img('vestidos', 'vestido-boho-1.jpg'),
          'Romântico': img('vestidos', 'vestido-minimalista-2.jpg'),
          'Clássico': img('vestidos', 'vestido-minimalista-3.jpg'),
          'Moderno': img('vestidos', 'vestido-minimalista-4.jpg'),
          'Rústico': img('vestidos', 'vestido-boho-2.jpg'),
          default: img('vestidos', 'vestido-default-1.jpg'),
        },
        mesaPosta: {
          'classico': img('mesa', 'mesa-classico-1.jpg'),
          'rustico': img('mesa', 'mesa-rustico-1.jpg'),
          'romantico': img('mesa', 'mesa-romantico-1.jpg'),
          'minimalista': img('mesa', 'mesa-minimalista-1.jpg'),
          'boho': img('mesa', 'mesa-rustico-4.jpg'),
          'moderno': img('mesa', 'mesa-default-2.jpg'),
          default: img('mesa', 'mesa-classico-1.jpg'),
        },
        decoracao: {
          'classico': img('decoracao', 'decor-classico-1.jpg'),
          'rustico': img('decoracao', 'decor-rustico-1.jpg'),
          'romantico': img('decoracao', 'decor-romantico-1.jpg'),
          'minimalista': img('decoracao', 'decor-minimalista-1.jpg'),
          'boho': img('decoracao', 'decor-boho-1.jpg'),
          'moderno': img('decoracao', 'decor-moderno-1.jpg'),
          default: img('decoracao', 'decor-classico-1.jpg'),
        },
        cerimonia: {
          'classico': img('cerimonia', 'cerimonia-altar-1.jpg'),
          'rustico': img('cerimonia', 'cerimonia-corredor-3.jpg'),
          'romantico': img('cerimonia', 'cerimonia-beijo-1.jpg'),
          'minimalista': img('cerimonia', 'cerimonia-aliancas-1.jpg'),
          'boho': img('cerimonia', 'cerimonia-entrada-noiva-4.jpg'),
          'moderno': img('cerimonia', 'cerimonia-saida-1.jpg'),
          default: img('cerimonia', 'cerimonia-altar-1.jpg'),
        },
        alimentacao: {
          'classico': img('alimentacao', 'bolo-casamento-1.jpg'),
          'rustico': img('alimentacao', 'mesa-doces-1.jpg'),
          'romantico': img('alimentacao', 'mesa-doces-5.jpg'),
          'minimalista': img('alimentacao', 'coquetel-drinks-1.jpg'),
          'boho': img('alimentacao', 'mesa-doces-10.jpg'),
          'moderno': img('alimentacao', 'bolo-casamento-6.jpg'),
          default: img('alimentacao', 'bolo-casamento-1.jpg'),
        },
        entretenimento: {
          'classico': img('entretenimento', 'pista-danca-1.jpg'),
          'rustico': img('entretenimento', 'dj-banda-1.jpg'),
          'romantico': img('entretenimento', 'pista-danca-3.jpg'),
          'minimalista': img('entretenimento', 'cabine-fotos-1.jpg'),
          'boho': img('entretenimento', 'pista-danca-4.jpg'),
          'moderno': img('entretenimento', 'dj-banda-2.jpg'),
          default: img('entretenimento', 'pista-danca-1.jpg'),
        },
        local: {
          'classico': img('local', 'local-salao-1.jpg'),
          'rustico': img('local', 'local-sitio-1.jpg'),
          'romantico': img('local', 'local-jardim-1.jpg'),
          'minimalista': img('local', 'local-salao-10.jpg'),
          'boho': img('local', 'local-jardim-3.jpg'),
          'moderno': img('local', 'local-salao-5.jpg'),
          default: img('local', 'local-default-1.jpg'),
        },
        papelaria: {
          'classico': img('papelaria', 'convite-1.jpg'),
          'rustico': img('papelaria', 'placa-boas-vindas-1.jpg'),
          'romantico': img('papelaria', 'convite-5.jpg'),
          'minimalista': img('papelaria', 'menu-lugar-1.jpg'),
          'boho': img('papelaria', 'monograma-1.jpg'),
          'moderno': img('papelaria', 'convite-3.jpg'),
          default: img('papelaria', 'convite-1.jpg'),
        },
      };
      return IMAGENS[categoria]?.[chave] || IMAGENS[categoria]?.default || null;
    }

    // Monta o mapa de imagens com caminhos absolutos resolvidos no servidor
    const estilo = dadosEvento?.estilo || 'classico';
    const flores = dadosEvento?.flores || '';

    const imageMap = {
      decoracao: getImagemLocal('decoracao', estilo),
      cerimonia: getImagemLocal('cerimonia', estilo),
      flores: getImagemLocal('flores', flores),
      floresDefault: getImagemLocal('flores', 'default'),
      mesaPosta: getImagemLocal('mesaPosta', estilo),
      alimentacao: getImagemLocal('alimentacao', estilo),
      entretenimento: getImagemLocal('entretenimento', estilo),
      vestido: getImagemLocal('vestido', dadosEvento?.estiloVestido),
      vestidoDefault: getImagemLocal('vestido', 'default'),
      papelaria: getImagemLocal('papelaria', estilo),
    };

    // Renderiza o PDF no servidor
    const pdfElement = React.createElement(MemorialPDFDocument, {
      memorial,
      dadosEvento,
      qrCodeDataUri,
      dimensoesImagens,
      imageMap,
    });

    const stream = await renderToStream(pdfElement);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="memorial.pdf"');
    stream.pipe(res);

  } catch (err) {
    console.error('[API gerar-pdf] Erro:', err);
    res.status(500).json({ erro: err.message || 'Erro interno ao gerar PDF.' });
  }
}

// Rate limit: pagamentoLimiter
export default withRateLimit(_handler, pagamentoLimiter);
