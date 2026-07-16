// components/memorial/steps/StepDNA.jsx
// Step da árvore — tela de DNA/landing do memorial
// Mostra resumo do perfil e permite continuar pro fluxo principal
// Substitui a lógica de ?fase=dna quebrada

import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from '../../ui/Icon';

export default function StepDNA({ estado, onSelect }) {
  const { t } = useTranslation();

  const perfilLabels = {
    'noiva-noivo': 'Noiva e Noivo',
    'duas-noivas': 'Duas Noivas',
    'dois-noivos': 'Dois Noivos',
    'nao-especificar': 'Não especificar',
  };

  const perfilTexto = perfilLabels[estado.perfilCasal] || estado.perfilCasal;

  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
    return dataStr;
  };

  const handleContinuar = () => {
    // Avança na árvore — o próximo nó é definido na árvore (stepA4)
    onSelect('__dnaContinuar', true);
  };

  return (
    <div className="step-dna">
      <div className="dna-container">
        <header className="dna-header">
          <div className="dna-icon-wrapper">
            <Icon name="sparkles" size={48} className="dna-icon" />
          </div>
          <h1 className="dna-title">{t('dna.titulo') || 'Seu memorial está pronto'}</h1>
          <p className="dna-subtitle">
            {t('dna.subtitulo') || 'Vamos criar juntos o planejamento do seu grande dia'}
          </p>
        </header>

        <section className="dna-resumo" aria-labelledby="dna-resumo-label">
          <h2 id="dna-resumo-label" className="dna-resumo-title">
            <Icon name="fileText" size={20} />
            {t('dna.resumo.titulo') || 'Resumo do perfil'}
          </h2>

          <div className="dna-resumo-grid">
            <div className="dna-resumo-item">
              <span className="dna-resumo-label">{t('dna.resumo.perfil') || 'Perfil'}</span>
              <span className="dna-resumo-valor">{perfilTexto}</span>
            </div>

            {estado.dataCasamento && (
              <div className="dna-resumo-item">
                <span className="dna-resumo-label">{t('dna.resumo.data') || 'Data'}</span>
                <span className="dna-resumo-valor">{formatarData(estado.dataCasamento)}</span>
              </div>
            )}

            {(estado.cidade || estado.uf) && (
              <div className="dna-resumo-item">
                <span className="dna-resumo-label">{t('dna.resumo.local') || 'Local'}</span>
                <span className="dna-resumo-valor">
                  {estado.cidade}{estado.uf ? `, ${estado.uf}` : ''}
                </span>
              </div>
            )}

            {estado.totalConvidados > 0 && (
              <div className="dna-resumo-item">
                <span className="dna-resumo-label">{t('dna.resumo.convidados') || 'Convidados'}</span>
                <span className="dna-resumo-valor">{estado.totalConvidados}</span>
              </div>
            )}

            {estado.nomeEvento && (
              <div className="dna-resumo-item dna-resumo-item--full">
                <span className="dna-resumo-label">{t('dna.resumo.nomeEvento') || 'Nome do evento'}</span>
                <span className="dna-resumo-valor">{estado.nomeEvento}</span>
              </div>
            )}
          </div>
        </section>

        <div className="dna-acoes">
          <button
            type="button"
            className="dna-btn dna-btn--primary"
            onClick={handleContinuar}
          >
            <Icon name="arrowRight" size={18} />
            {t('dna.botao.continuar') || 'Continuar para o memorial'}
          </button>

          <p className="dna-dica">
            <Icon name="info" size={14} />
            {t('dna.dica') || 'Voce pode voltar e editar essas informacoes a qualquer momento'}
          </p>
        </div>
      </div>

      <style jsx>{`
        .step-dna { min-height: 100dvh; background: var(--color-surface); display: flex; align-items: center; justify-content: center; padding: var(--space-4) var(--space-3); }
        .dna-container { max-width: 520px; width: 100%; margin: 0 auto; }
        .dna-header { text-align: center; margin-bottom: var(--space-8); }
        .dna-icon-wrapper { width: 80px; height: 80px; border-radius: 50%; background: var(--color-brand-bg); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); }
        .dna-icon { color: var(--color-brand); }
        .dna-title { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-text-primary); margin: 0 0 var(--space-2); line-height: 1.2; }
        .dna-subtitle { font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text-secondary); margin: 0; }
        .dna-resumo { background: var(--color-white); border: 1.5px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-5); margin-bottom: var(--space-6); }
        .dna-resumo-title { font-family: var(--font-body); font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--color-text-primary); margin: 0 0 var(--space-4); display: flex; align-items: center; gap: var(--space-2); }
        .dna-resumo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
        .dna-resumo-item { display: flex; flex-direction: column; gap: var(--space-1); }
        .dna-resumo-item--full { grid-column: 1 / -1; }
        .dna-resumo-label { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .dna-resumo-valor { font-family: var(--font-body); font-size: var(--text-base); font-weight: var(--font-medium); color: var(--color-text-primary); }
        .dna-acoes { display: flex; flex-direction: column; gap: var(--space-3); align-items: center; }
        .dna-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-4); font-family: var(--font-body); font-size: var(--text-base); font-weight: var(--font-semibold); border: none; border-radius: var(--radius-lg); cursor: pointer; transition: all 150ms ease; }
        .dna-btn--primary { background: var(--color-brand); color: var(--color-white); }
        .dna-btn--primary:hover { background: var(--color-brand-dark); }
        .dna-dica { display: flex; align-items: center; gap: var(--space-2); font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); text-align: center; margin: 0; }
        @media (max-width: 390px) {
          .dna-resumo-grid { grid-template-columns: 1fr; }
          .dna-title { font-size: var(--text-xl); }
        }
      `}</style>
    </div>
  );
}
