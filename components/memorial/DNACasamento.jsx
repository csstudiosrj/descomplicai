// components/memorial/DNACasamento.jsx
// Fase 0.5 — DNA do Casamento (5 perguntas sequenciais)
// Avanco automatico, linguagem inclusiva, i18n-ready

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import Icon from '../../components/ui/Icon';
import fetchAPI from '../../utils/fetchAPI';

const PERGUNTAS = [
  {
    id: 'tipoCerimonia',
    campoBanco: 'tipo_cerimonia',
    tituloKey: 'dna.tipoCerimonia.titulo',
    ariaLabelKey: 'dna.tipoCerimonia.ariaLabel',
    opcoes: [
      { value: 'catolica', labelKey: 'dna.tipoCerimonia.opcoes.catolica', icon: 'cerimonia' },
      { value: 'evangelica', labelKey: 'dna.tipoCerimonia.opcoes.evangelica', icon: 'cerimonia' },
      { value: 'judaica', labelKey: 'dna.tipoCerimonia.opcoes.judaica', icon: 'cerimonia' },
      { value: 'espirita', labelKey: 'dna.tipoCerimonia.opcoes.espirita', icon: 'cerimonia' },
      { value: 'outra-religiosa', labelKey: 'dna.tipoCerimonia.opcoes.outraReligiosa', icon: 'cerimonia' },
      { value: 'civil', labelKey: 'dna.tipoCerimonia.opcoes.civil', icon: 'fileSignature' },
      { value: 'simbolica', labelKey: 'dna.tipoCerimonia.opcoes.simbolica', icon: 'heart' },
      { value: 'mista', labelKey: 'dna.tipoCerimonia.opcoes.mista', icon: 'sparkle' },
    ],
  },
  {
    id: 'tipoLocal',
    campoBanco: 'tipo_local',
    tituloKey: 'dna.tipoLocal.titulo',
    ariaLabelKey: 'dna.tipoLocal.ariaLabel',
    opcoes: [
      { value: 'salao', labelKey: 'dna.tipoLocal.opcoes.salao', icon: 'building' },
      { value: 'sitio-chacara', labelKey: 'dna.tipoLocal.opcoes.sitioChacara', icon: 'local' },
      { value: 'praia', labelKey: 'dna.tipoLocal.opcoes.praia', icon: 'local' },
      { value: 'hotel', labelKey: 'dna.tipoLocal.opcoes.hotel', icon: 'building' },
      { value: 'galpao-industrial', labelKey: 'dna.tipoLocal.opcoes.galpao', icon: 'building' },
      { value: 'jardim-bosque', labelKey: 'dna.tipoLocal.opcoes.jardim', icon: 'local' },
      { value: 'rooftop', labelKey: 'dna.tipoLocal.opcoes.rooftop', icon: 'local' },
      { value: 'haras', labelKey: 'dna.tipoLocal.opcoes.haras', icon: 'local' },
      { value: 'vinicola', labelKey: 'dna.tipoLocal.opcoes.vinicola', icon: 'local' },
      { value: 'outro', labelKey: 'dna.tipoLocal.opcoes.outro', icon: 'moreOptions' },
    ],
  },
  {
    id: 'estilo',
    campoBanco: 'estilo',
    tituloKey: 'dna.estilo.titulo',
    ariaLabelKey: 'dna.estilo.ariaLabel',
    opcoes: [
      { value: 'classico', labelKey: 'dna.estilo.opcoes.classico', descKey: 'dna.estilo.desc.classico', cor: '#C9A96E', icon: 'star' },
      { value: 'rustico', labelKey: 'dna.estilo.opcoes.rustico', descKey: 'dna.estilo.desc.rustico', cor: '#8B6914', icon: 'local' },
      { value: 'boho', labelKey: 'dna.estilo.opcoes.boho', descKey: 'dna.estilo.desc.boho', cor: '#D4A574', icon: 'flower' },
      { value: 'moderno', labelKey: 'dna.estilo.opcoes.moderno', descKey: 'dna.estilo.desc.moderno', cor: '#2C3E50', icon: 'grid' },
      { value: 'minimalista', labelKey: 'dna.estilo.opcoes.minimalista', descKey: 'dna.estilo.desc.minimalista', cor: '#E8E8E8', icon: 'square' },
      { value: 'industrial', labelKey: 'dna.estilo.opcoes.industrial', descKey: 'dna.estilo.desc.industrial', cor: '#5A5A5A', icon: 'building' },
      { value: 'tropical', labelKey: 'dna.estilo.opcoes.tropical', descKey: 'dna.estilo.desc.tropical', cor: '#2ECC71', icon: 'local' },
      { value: 'romantico', labelKey: 'dna.estilo.opcoes.romantico', descKey: 'dna.estilo.desc.romantico', cor: '#E8A0BF', icon: 'heart' },
      { value: 'gotico', labelKey: 'dna.estilo.opcoes.gotico', descKey: 'dna.estilo.desc.gotico', cor: '#4A235A', icon: 'sparkle' },
      { value: 'vintage', labelKey: 'dna.estilo.opcoes.vintage', descKey: 'dna.estilo.desc.vintage', cor: '#A0522D', icon: 'star' },
    ],
  },
  {
    id: 'formalidade',
    campoBanco: 'formalidade',
    tituloKey: 'dna.formalidade.titulo',
    ariaLabelKey: 'dna.formalidade.ariaLabel',
    opcoes: [
      { value: 'formal', labelKey: 'dna.formalidade.opcoes.formal', descKey: 'dna.formalidade.desc.formal', icon: 'award' },
      { value: 'semiformal', labelKey: 'dna.formalidade.opcoes.semiformal', descKey: 'dna.formalidade.desc.semiformal', icon: 'star' },
      { value: 'despojado', labelKey: 'dna.formalidade.opcoes.despojado', descKey: 'dna.formalidade.desc.despojado', icon: 'sparkle' },
    ],
  },
  {
    id: 'horarioCasamento',
    campoBanco: 'horario_casamento',
    tituloKey: 'dna.horario.titulo',
    ariaLabelKey: 'dna.horario.ariaLabel',
    opcoes: [
      { value: 'diurno', labelKey: 'dna.horario.opcoes.diurno', descKey: 'dna.horario.desc.diurno', icon: 'sparkle' },
      { value: 'por-do-sol', labelKey: 'dna.horario.opcoes.porDoSol', descKey: 'dna.horario.desc.porDoSol', icon: 'sparkle' },
      { value: 'noturno', labelKey: 'dna.horario.opcoes.noturno', descKey: 'dna.horario.desc.noturno', icon: 'sparkle' },
    ],
  },
];

export default function DNACasamento() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const { t } = useTranslation();

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [eventoId, setEventoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [animando, setAnimando] = useState(false);
  const [direcao, setDirecao] = useState('next');

  useEffect(() => {
    const id = localStorage.getItem('descomplicai-evento-id');
    if (id) { setEventoId(id); }
    else if (user) {
      async function buscarEvento() {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const res = await fetchAPI('/api/eventos/meus-eventos', {
            headers: { 'Authorization': `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const eventos = await res.json();
            if (eventos?.length > 0) {
              setEventoId(eventos[0].id);
              localStorage.setItem('descomplicai-evento-id', eventos[0].id);
            }
          }
        } catch (e) { console.warn('[DNA] Erro ao buscar evento:', e); }
      }
      buscarEvento();
    }
  }, [user, supabase]);

  const perguntaAtual = PERGUNTAS[indiceAtual];
  const progresso = ((indiceAtual) / PERGUNTAS.length) * 100;

  const selecionarOpcao = useCallback(async (perguntaId, value) => {
    if (animando) return;
    const novaResposta = { ...respostas, [perguntaId]: value };
    setRespostas(novaResposta);

    if (indiceAtual === PERGUNTAS.length - 1) {
      await finalizarDNA(novaResposta);
      return;
    }

    setDirecao('next');
    setAnimando(true);
    setTimeout(() => { setIndiceAtual(prev => prev + 1); setAnimando(false); }, 400);
  }, [indiceAtual, respostas, animando]);

  const voltar = useCallback(() => {
    if (indiceAtual === 0 || animando) return;
    setDirecao('prev');
    setAnimando(true);
    setTimeout(() => { setIndiceAtual(prev => prev - 1); setAnimando(false); }, 400);
  }, [indiceAtual, animando]);

  const finalizarDNA = useCallback(async (respostasFinais) => {
    if (!eventoId) { setErro(t('dna.erros.semEvento')); return; }
    setSalvando(true); setErro('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        localStorage.setItem('descomplicai-dna-pending', JSON.stringify({ eventoId, respostas: respostasFinais }));
        router.push('/login?redirect=/memorial?fase=dna');
        return;
      }

      const res = await fetchAPI('/api/memorial/dna', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ evento_id: eventoId, ...respostasFinais }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.erro || result.error || t('dna.erros.generico'));

      localStorage.setItem('descomplicai-dna-completo', '1');
      localStorage.removeItem('descomplicai-dna-pending');
      router.push('/memorial?fase=1');
    } catch (err) {
      setErro(err.message || t('dna.erros.generico'));
      setSalvando(false);
    }
  }, [eventoId, t, supabase, router]);

  useEffect(() => {
    const pending = localStorage.getItem('descomplicai-dna-pending');
    if (pending && eventoId) {
      try {
        const p = JSON.parse(pending);
        if (p.eventoId === eventoId) finalizarDNA(p.respostas);
      } catch { localStorage.removeItem('descomplicai-dna-pending'); }
    }
  }, [eventoId, finalizarDNA]);

  if (!perguntaAtual) return null;

  return (
    <div className="dna-page">
      <div className="dna-progress" role="progressbar" aria-valuenow={indiceAtual + 1} aria-valuemin={1} aria-valuemax={PERGUNTAS.length} aria-label={t('dna.progresso.ariaLabel')}>
        <div className="dna-progress-track"><div className="dna-progress-fill" style={{ width: `${progresso}%` }} /></div>
        <span className="dna-progress-text">{indiceAtual + 1} / {PERGUNTAS.length}</span>
      </div>

      {indiceAtual > 0 && (
        <button type="button" className="dna-back" onClick={voltar} aria-label={t('common.back')}>
          <Icon name="arrowLeft" size={20} /><span>{t('common.back')}</span>
        </button>
      )}

      <div className={`dna-content ${animando ? (direcao === 'next' ? 'dna-content--exit' : 'dna-content--exit-prev') : 'dna-content--enter'}`}>
        <h1 className="dna-titulo">{t(perguntaAtual.tituloKey)}</h1>
        <div className={`dna-opcoes dna-opcoes--${perguntaAtual.id}`} role="radiogroup" aria-label={t(perguntaAtual.ariaLabelKey)}>
          {perguntaAtual.opcoes.map((opt) => {
            const isSelected = respostas[perguntaAtual.id] === opt.value;
            const isEstilo = perguntaAtual.id === 'estilo';
            return (
              <button key={opt.value} type="button" role="radio" aria-checked={isSelected}
                className={`dna-card ${isSelected ? 'dna-card--selected' : ''} ${isEstilo ? 'dna-card--estilo' : ''}`}
                onClick={() => selecionarOpcao(perguntaAtual.id, opt.value)} disabled={salvando}>
                {isEstilo && opt.cor && <span className="dna-card-swatch" style={{ backgroundColor: opt.cor }} aria-hidden="true" />}
                <Icon name={opt.icon} size={isEstilo ? 24 : 28} className="dna-card-icon" />
                <span className="dna-card-label">{t(opt.labelKey)}</span>
                {opt.descKey && <span className="dna-card-desc">{t(opt.descKey)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {erro && (
        <div className="dna-erro" role="alert"><Icon name="alert" size={18} /><span>{erro}</span></div>
      )}

      {salvando && (
        <div className="dna-salvando-overlay">
          <div className="dna-salvando-content">
            <span className="dna-salvando-spinner" aria-hidden="true" />
            <p>{t('dna.salvando')}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .dna-page { min-height: 100dvh; background: var(--color-surface); padding: var(--space-4) var(--space-3); position: relative; }
        .dna-progress { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-5); max-width: 480px; margin-left: auto; margin-right: auto; }
        .dna-progress-track { flex: 1; height: 4px; background: var(--color-border); border-radius: var(--radius-full); overflow: hidden; }
        .dna-progress-fill { height: 100%; background: var(--color-brand); border-radius: var(--radius-full); transition: width 300ms ease; }
        .dna-progress-text { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); white-space: nowrap; }
        .dna-back { display: flex; align-items: center; gap: var(--space-1); background: none; border: none; font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-secondary); cursor: pointer; padding: var(--space-2); margin-bottom: var(--space-3); max-width: 480px; margin-left: auto; margin-right: auto; }
        .dna-back:hover { color: var(--color-brand); }
        .dna-back:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; border-radius: var(--radius-sm); }
        .dna-content { max-width: 480px; margin: 0 auto; transition: opacity 300ms ease, transform 300ms ease; }
        .dna-content--enter { opacity: 1; transform: translateX(0); }
        .dna-content--exit { opacity: 0; transform: translateX(-30px); }
        .dna-content--exit-prev { opacity: 0; transform: translateX(30px); }
        .dna-titulo { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-text-primary); text-align: center; margin: 0 0 var(--space-5); line-height: 1.3; }
        .dna-opcoes { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
        .dna-opcoes--formalidade, .dna-opcoes--horarioCasamento { grid-template-columns: 1fr; }
        .dna-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4) var(--space-3); background: var(--color-white); border: 2px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; transition: all 150ms ease; text-align: center; font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-primary); position: relative; overflow: hidden; }
        .dna-card:hover { border-color: var(--color-brand-light); background: var(--color-surface); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
        .dna-card:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
        .dna-card--selected { border-color: var(--color-brand); background: var(--color-brand-bg); }
        .dna-card--estilo { padding-top: var(--space-5); }
        .dna-card-swatch { position: absolute; top: 0; left: 0; right: 0; height: 6px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
        .dna-card-icon { color: var(--color-text-muted); transition: color 150ms ease; }
        .dna-card--selected .dna-card-icon { color: var(--color-brand); }
        .dna-card-label { font-weight: var(--font-medium); line-height: 1.3; }
        .dna-card-desc { font-size: var(--text-xs); color: var(--color-text-secondary); line-height: 1.4; }
        .dna-erro { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-4); background: var(--color-error-bg); border: 1px solid var(--color-error); border-radius: var(--radius-md); font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-error); margin-top: var(--space-4); max-width: 480px; margin-left: auto; margin-right: auto; }
        .dna-salvando-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; z-index: var(--z-modal); }
        .dna-salvando-content { text-align: center; }
        .dna-salvando-content p { font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text-secondary); margin-top: var(--space-3); }
        .dna-salvando-spinner { display: inline-block; width: 40px; height: 40px; border: 3px solid var(--color-border); border-top-color: var(--color-brand); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 390px) {
          .dna-opcoes--tipoCerimonia, .dna-opcoes--tipoLocal, .dna-opcoes--estilo { grid-template-columns: 1fr 1fr; gap: var(--space-1); }
          .dna-card { padding: var(--space-3) var(--space-2); }
        }
        @media (min-width: 768px) {
          .dna-opcoes--tipoCerimonia { grid-template-columns: repeat(4, 1fr); }
          .dna-opcoes--tipoLocal { grid-template-columns: repeat(5, 1fr); }
          .dna-opcoes--estilo { grid-template-columns: repeat(5, 1fr); }
          .dna-opcoes--formalidade, .dna-opcoes--horarioCasamento { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}
