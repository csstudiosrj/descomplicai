// components/memorial/steps/StepPerfil.jsx
// Step da árvore — formulário de perfil do casal
// Mobile-first, linguagem inclusiva, i18n-ready, zero emojis
// Substitui pages/memorial/perfil.jsx (página separada quebrava navegação)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from '../../../hooks/useTranslation';
import { ESTADOS, CIDADES_POR_ESTADO } from '../../../lib/estados-cidades';
import Icon from '../../ui/Icon';
import fetchAPI from '../../../utils/fetchAPI';
import { getTermos } from '../../../utils/linguagemCasal';

const PERFIL_OPTIONS = [
  { value: 'noiva-noivo', labelKey: 'perfil.options.noivaNoivo', icon: 'users' },
  { value: 'duas-noivas', labelKey: 'perfil.options.duasNoivas', icon: 'users' },
  { value: 'dois-noivos', labelKey: 'perfil.options.doisNoivos', icon: 'users' },
  { value: 'nao-especificar', labelKey: 'perfil.options.naoEspecificar', icon: 'users' },
];

const CONVIDADOS_MIN = 20;
const CONVIDADOS_MAX = 500;
const CONVIDADOS_STEP = 10;

export default function StepPerfil({ estado, onSelect }) {
  const { user, supabase } = useAuth();
  const { t } = useTranslation();
  const perfil = estado?.perfilCasal || 'nao-especificar';
  const termos = getTermos(perfil);

  const [perfilCasal, setPerfilCasal] = useState(estado.perfilCasal || '');
  const [dataCasamento, setDataCasamento] = useState(estado.dataCasamento || '');
  const [ufSelecionada, setUfSelecionada] = useState(estado.uf || '');
  const [cidadeSelecionada, setCidadeSelecionada] = useState(estado.cidade || '');
  const [totalConvidados, setTotalConvidados] = useState(estado.totalConvidados || 100);
  const [nomeEvento, setNomeEvento] = useState(estado.nomeEvento || '');

  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cardPulsando, setCardPulsando] = React.useState(null);
  const [botaoPulsando, setBotaoPulsando] = React.useState(false);

  const estados = useMemo(() => {
    return [...ESTADOS].sort((a, b) => a.nome.localeCompare(b.nome));
  }, []);

  const cidades = useMemo(() => {
    if (!ufSelecionada) return [];
    const lista = CIDADES_POR_ESTADO[ufSelecionada] || [];
    return lista.map((nome, idx) => ({ id: idx, nome }));
  }, [ufSelecionada]);

  const handleUfChange = useCallback((e) => {
    setUfSelecionada(e.target.value);
    setCidadeSelecionada('');
  }, []);

  const handleDateChange = useCallback((e) => {
    const val = e.target.value;
    if (val) {
      const partes = val.split('-');
      if (partes[0] && partes[0].length === 4) {
        setDataCasamento(val);
      }
    } else {
      setDataCasamento('');
    }
  }, []);

  const handleSliderChange = useCallback((e) => {
    setTotalConvidados(Number(e.target.value));
  }, []);

  const handleInputConvidados = useCallback((e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setTotalConvidados(Math.min(Math.max(val, CONVIDADOS_MIN), CONVIDADOS_MAX));
    }
  }, []);

  const validar = useCallback(() => {
    if (!perfilCasal) return t('perfil.erros.perfilObrigatorio');
    if (!dataCasamento) return t('perfil.erros.dataObrigatoria');
    if (!ufSelecionada || !cidadeSelecionada) return t('perfil.erros.cidadeObrigatoria');
    return null;
  }, [perfilCasal, dataCasamento, ufSelecionada, cidadeSelecionada, t]);

  const handleCardClick = (opt) => {
    if (cardPulsando) return;
    setCardPulsando(opt.value);
    setTimeout(() => {
      setPerfilCasal(opt.value);
      setCardPulsando(null);
    }, 300);
  };

  const handleSubmit = useCallback(async () => {
    if (botaoPulsando) return;
    setBotaoPulsando(true);

    const erroValidacao = validar();
    if (erroValidacao) { setErro(erroValidacao); setBotaoPulsando(false); return; }

    setEnviando(true);
    setErro('');

    try {
      if (!user) {
        const draft = {
          perfilCasal, dataCasamento, cidade: cidadeSelecionada, uf: ufSelecionada,
          totalConvidados, nomeEvento: nomeEvento?.trim() || '',
        };
        localStorage.setItem('descomplicai-perfil-draft', JSON.stringify(draft));
        onSelect('__perfilPrecisaLogin', draft);
        setEnviando(false);
        setBotaoPulsando(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setErro(t('perfil.erros.sessaoExpirada'));
        setEnviando(false);
        setBotaoPulsando(false);
        return;
      }

      const res = await fetchAPI('/api/memorial/perfil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          perfilCasal,
          dataCasamento,
          cidade: cidadeSelecionada,
          uf: ufSelecionada,
          totalConvidados,
          modoPlanejamento: 'guiado',
          nomeEvento: nomeEvento?.trim() || '',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.erro || result.error || t('perfil.erros.generico'));

      localStorage.setItem('descomplicai-evento-id', result.evento_id);
      localStorage.removeItem('descomplicai-perfil-draft');

      onSelect('perfilCasal', perfilCasal, null, {
        dataCasamento,
        cidade: cidadeSelecionada,
        uf: ufSelecionada,
        totalConvidados,
        nomeEvento: nomeEvento?.trim() || '',
        modoPlanejamento: 'guiado',
      });
    } catch (err) {
      setErro(err.message || t('perfil.erros.generico'));
      setBotaoPulsando(false);
    } finally {
      setEnviando(false);
    }
  }, [perfilCasal, dataCasamento, ufSelecionada, cidadeSelecionada, totalConvidados, nomeEvento, t, supabase, user, onSelect, validar, botaoPulsando]);

  useEffect(() => {
    if (estado.perfilCasal) return;
    const draft = localStorage.getItem('descomplicai-perfil-draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.perfilCasal) setPerfilCasal(d.perfilCasal);
        if (d.dataCasamento) setDataCasamento(d.dataCasamento);
        if (d.uf) setUfSelecionada(d.uf);
        if (d.cidade) setCidadeSelecionada(d.cidade);
        if (d.totalConvidados) setTotalConvidados(d.totalConvidados);
        if (d.nomeEvento) setNomeEvento(d.nomeEvento);
      } catch { /* ignora */ }
    }
  }, [estado.perfilCasal]);

  const isFormValid = perfilCasal && dataCasamento && ufSelecionada && cidadeSelecionada;

  return (
    <div className="step-perfil">
      <div className="perfil-container">
        <header className="perfil-header">
          <h1 className="perfil-title">{t('perfil.titulo')}</h1>
          <p className="perfil-subtitle">{t('perfil.subtitulo')}</p>
        </header>

        <section className="perfil-section" aria-labelledby="perfil-casal-label">
          <h2 id="perfil-casal-label" className="perfil-section-title">
            <Icon name="users" size={20} className="perfil-section-icon" aria-hidden="true" />
            {t('perfil.perfilCasal.titulo')}
          </h2>
          <div className="perfil-cards" role="radiogroup" aria-label={t('perfil.perfilCasal.ariaLabel')}>
            {PERFIL_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                style={{
                  transition: 'transform 300ms ease, box-shadow 300ms ease',
                  transform: cardPulsando === opt.value ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: cardPulsando === opt.value ? '0 0 0 3px var(--color-brand)' : 'none',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={perfilCasal === opt.value}
                  aria-label={t(opt.labelKey)}
                  className={`perfil-card ${perfilCasal === opt.value ? 'perfil-card--selected' : ''}`}
                  onClick={() => handleCardClick(opt)}
                >
                  <Icon name={opt.icon} size={28} className="perfil-card-icon" aria-hidden="true" />
                  <span className="perfil-card-label">{t(opt.labelKey)}</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="perfil-section" aria-labelledby="perfil-data-label">
          <h2 id="perfil-data-label" className="perfil-section-title">
            <Icon name="calendar" size={20} className="perfil-section-icon" aria-hidden="true" />
            {t('perfil.dataCasamento.titulo')}
          </h2>
          <input
            type="date"
            className="perfil-input perfil-input--date"
            value={dataCasamento}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            aria-label={t('perfil.dataCasamento.ariaLabel')}
          />
        </section>

        <section className="perfil-section" aria-labelledby="perfil-cidade-label">
          <h2 id="perfil-cidade-label" className="perfil-section-title">
            <Icon name="mapPin" size={20} className="perfil-section-icon" aria-hidden="true" />
            {t('perfil.cidade.titulo')}
          </h2>
          <div className="perfil-cidade-row">
            <select
              className="perfil-select perfil-select--uf"
              value={ufSelecionada}
              onChange={handleUfChange}
              aria-label={t('perfil.cidade.ufLabel')}
            >
              <option value="">UF</option>
              {estados.map((est) => (
                <option key={est.sigla} value={est.sigla}>{est.nome} ({est.sigla})</option>
              ))}
            </select>
            <select
              className="perfil-select"
              value={cidadeSelecionada}
              onChange={(e) => setCidadeSelecionada(e.target.value)}
              disabled={!ufSelecionada}
              aria-label={t('perfil.cidade.ariaLabel')}
            >
              <option value="">
                {ufSelecionada ? 'Selecione a cidade' : 'Selecione o estado primeiro'}
              </option>
              {cidades.map((cidade) => (
                <option key={cidade.id} value={cidade.nome}>
                  {cidade.nome}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="perfil-section" aria-labelledby="perfil-convidados-label">
          <h2 id="perfil-convidados-label" className="perfil-section-title">
            <Icon name="users" size={20} className="perfil-section-icon" aria-hidden="true" />
            {t('perfil.totalConvidados.titulo')}
          </h2>
          <div className="perfil-slider-row">
            <input
              type="range" className="perfil-slider"
              min={CONVIDADOS_MIN} max={CONVIDADOS_MAX} step={CONVIDADOS_STEP}
              value={totalConvidados} onChange={handleSliderChange}
              aria-label={t('perfil.totalConvidados.ariaLabel')}
            />
            <input
              type="number" className="perfil-input perfil-input--number"
              min={CONVIDADOS_MIN} max={CONVIDADOS_MAX}
              value={totalConvidados} onChange={handleInputConvidados}
              aria-label={t('perfil.totalConvidados.inputLabel')}
            />
          </div>
          <p className="perfil-hint">{t('perfil.totalConvidados.hint', { count: totalConvidados })}</p>
        </section>

        <section className="perfil-section" aria-labelledby="perfil-nome-label">
          <h2 id="perfil-nome-label" className="perfil-section-title">
            <Icon name="edit" size={20} className="perfil-section-icon" aria-hidden="true" />
            {t('perfil.nomeEvento.titulo')}
            <span className="perfil-optional">{t('common.optional')}</span>
          </h2>
          <input
            type="text"
            className="perfil-input"
            value={nomeEvento}
            onChange={(e) => setNomeEvento(e.target.value)}
            placeholder=""
            aria-label={t('perfil.nomeEvento.ariaLabel')}
            maxLength={100}
          />
        </section>

        {erro && (
          <div className="perfil-erro" role="alert">
            <Icon name="alert" size={18} aria-hidden="true" />
            <span>{erro}</span>
          </div>
        )}

        <button
          type="button"
          className={`perfil-submit ${isFormValid ? 'perfil-submit--active' : 'perfil-submit--disabled'}`}
          onClick={handleSubmit}
          disabled={!isFormValid || enviando}
          aria-busy={enviando}
          aria-label={termos.botaoComecar || t('perfil.botao.comecar') || 'Começar'}
          style={{
            transition: 'transform 300ms ease, box-shadow 300ms ease',
            transform: botaoPulsando ? 'scale(1.03)' : 'scale(1)',
            boxShadow: botaoPulsando ? '0 0 0 3px var(--color-brand)' : 'none',
          }}
        >
          {enviando ? (
            <><span className="perfil-submit-spinner" aria-hidden="true" />{t('perfil.botao.carregando')}</>
          ) : (
            <>{t('perfil.botao.comecar')}<Icon name="arrowRight" size={18} aria-hidden="true" /></>
          )}
        </button>
      </div>

      <style jsx>{`\
        .step-perfil { min-height: 100dvh; background: var(--color-surface); padding: var(--space-4) var(--space-3); padding-bottom: calc(var(--space-4) + 80px); }
        .perfil-container { max-width: 480px; margin: 0 auto; }
        .perfil-header { text-align: center; margin-bottom: var(--space-6); }
        .perfil-title { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-text-primary); margin: 0 0 var(--space-2); line-height: 1.2; }
        .perfil-subtitle { font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text-secondary); margin: 0; }
        .perfil-section { margin-bottom: var(--space-5); }
        .perfil-section-title { font-family: var(--font-body); font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--color-text-primary); margin: 0 0 var(--space-3); display: flex; align-items: center; gap: var(--space-2); }
        .perfil-section-icon { color: var(--color-brand); flex-shrink: 0; }
        .perfil-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
        .perfil-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4) var(--space-3); background: var(--color-white); border: 2px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; transition: all 150ms ease; text-align: center; font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-primary); width: 100%; }
        .perfil-card:hover { border-color: var(--color-brand-light); background: var(--color-surface); }
        .perfil-card:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
        .perfil-card--selected { border-color: var(--color-brand); background: var(--color-brand-bg); color: var(--color-brand); }
        .perfil-card--selected .perfil-card-icon { color: var(--color-brand); }
        .perfil-card-icon { color: var(--color-text-muted); transition: color 150ms ease; }
        .perfil-card-label { font-weight: var(--font-medium); }
        .perfil-input, .perfil-select { width: 100%; padding: var(--space-3) var(--space-4); font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text-primary); background: var(--color-white); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); transition: border-color 150ms ease; }
        .perfil-input:focus-visible, .perfil-select:focus-visible { outline: none; border-color: var(--color-brand); }
        .perfil-input--date { min-height: 48px; }
        .perfil-cidade-row { display: flex; gap: var(--space-2); }
        .perfil-select--uf { flex: 0 0 140px; min-width: 140px; }
        .perfil-slider-row { display: flex; align-items: center; gap: var(--space-3); }
        .perfil-slider { flex: 1; -webkit-appearance: none; appearance: none; height: 6px; background: var(--color-border); border-radius: var(--radius-full); outline: none; }
        .perfil-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; background: var(--color-brand); border-radius: 50%; cursor: pointer; border: 2px solid var(--color-white); box-shadow: var(--shadow-sm); }
        .perfil-slider::-moz-range-thumb { width: 22px; height: 22px; background: var(--color-brand); border-radius: 50%; cursor: pointer; border: 2px solid var(--color-white); box-shadow: var(--shadow-sm); }
        .perfil-input--number { flex: 0 0 80px; text-align: center; padding: var(--space-2) var(--space-3); }
        .perfil-hint { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); margin: var(--space-1) 0 0; }
        .perfil-optional { font-size: var(--text-xs); font-weight: var(--font-normal); color: var(--color-text-muted); margin-left: var(--space-1); }
        .perfil-erro { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-4); background: var(--color-error-bg); border: 1px solid var(--color-error); border-radius: var(--radius-md); font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-error); margin-bottom: var(--space-4); }
        .perfil-submit { width: 100%; display: flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-4); font-family: var(--font-body); font-size: var(--text-base); font-weight: var(--font-semibold); border: none; border-radius: var(--radius-lg); cursor: pointer; transition: all 150ms ease; margin-top: var(--space-4); }
        .perfil-submit--active { background: var(--color-brand); color: var(--color-white); }
        .perfil-submit--active:hover { background: var(--color-brand-dark); }
        .perfil-submit--disabled { background: var(--color-border); color: var(--color-text-muted); cursor: not-allowed; }
        .perfil-submit-spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 390px) {
          .perfil-cards { grid-template-columns: 1fr 1fr; gap: var(--space-1); }
          .perfil-card { padding: var(--space-3) var(--space-2); }
          .perfil-cidade-row { flex-direction: column; }
          .perfil-select--uf { flex: 1; min-width: auto; }
        }
      `}</style>
    </div>
  );
}
