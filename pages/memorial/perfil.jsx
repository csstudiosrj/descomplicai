// pages/memorial/perfil.jsx
// Fase 0 — Cadastro/Perfil do evento
// Mobile-first, linguagem inclusiva, i18n-ready, zero emojis

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { listarEstados, listarCidadesPorEstado } from '../../lib/ibge';
import Icon from '../../components/ui/Icon';
import fetchAPI from '../../utils/fetchAPI';

const PERFIL_OPTIONS = [
  { value: 'noiva-noivo', labelKey: 'perfil.options.noivaNoivo', icon: 'users' },
  { value: 'duas-noivas', labelKey: 'perfil.options.duasNoivas', icon: 'users' },
  { value: 'dois-noivos', labelKey: 'perfil.options.doisNoivos', icon: 'users' },
  { value: 'nao-especificar', labelKey: 'perfil.options.naoEspecificar', icon: 'users' },
];

const CONVIDADOS_MIN = 20;
const CONVIDADOS_MAX = 500;
const CONVIDADOS_STEP = 10;

export default function PerfilPage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const { t } = useTranslation();

  const [perfilCasal, setPerfilCasal] = useState('');
  const [dataCasamento, setDataCasamento] = useState('');
  const [ufSelecionada, setUfSelecionada] = useState('');
  const [cidadeInput, setCidadeInput] = useState('');
  const [totalConvidados, setTotalConvidados] = useState(100);
  const [nomeEvento, setNomeEvento] = useState('');

  const [estados, setEstados] = useState([]);
  const [todasCidades, setTodasCidades] = useState([]);
  const [carregandoCidades, setCarregandoCidades] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const autocompleteRef = useRef(null);
  const cidadeInputRef = useRef(null);

  // Carrega estados (IBGE)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const ests = await listarEstados();
        if (!cancelled) setEstados(ests.sort((a, b) => a.nome.localeCompare(b.nome)));
      } catch (e) {
        console.warn('[Perfil] Erro ao carregar estados:', e);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Carrega cidades quando UF muda
  useEffect(() => {
    if (!ufSelecionada) { setTodasCidades([]); setCidadeInput(''); return; }
    let cancelled = false;
    setCarregandoCidades(true);
    async function load() {
      try {
        const cids = await listarCidadesPorEstado(ufSelecionada);
        if (!cancelled) setTodasCidades(cids);
      } catch (e) {
        console.warn('[Perfil] Erro ao carregar cidades:', e);
      } finally {
        if (!cancelled) setCarregandoCidades(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [ufSelecionada]);

  // Autocomplete de cidades — useMemo para performance
  const cidadesFiltradas = useMemo(() => {
    if (!cidadeInput || cidadeInput.length < 2 || !todasCidades.length) return [];
    const termo = cidadeInput.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return todasCidades
      .filter(c => {
        const nome = c.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return nome.includes(termo);
      })
      .slice(0, 8);
  }, [cidadeInput, todasCidades]);

  const mostrarAutocomplete = cidadesFiltradas.length > 0 && cidadeInput.length >= 2;

  // Fecha autocomplete ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        // Fecha sem setState direto no evento
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selecionarCidade = useCallback((cidade) => {
    setCidadeInput(cidade.nome);
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

  // Validacao do date picker — limita ano a 4 digitos
  const handleDateChange = useCallback((e) => {
    const val = e.target.value;
    if (val) {
      const ano = val.split('-')[0];
      if (ano && ano.length <= 4) {
        setDataCasamento(val);
      }
    } else {
      setDataCasamento('');
    }
  }, []);

  const validar = useCallback(() => {
    if (!perfilCasal) return t('perfil.erros.perfilObrigatorio');
    if (!dataCasamento) return t('perfil.erros.dataObrigatoria');
    if (!ufSelecionada || !cidadeInput.trim()) return t('perfil.erros.cidadeObrigatoria');
    return null;
  }, [perfilCasal, dataCasamento, ufSelecionada, cidadeInput, t]);

  const handleSubmit = useCallback(async () => {
    const erroValidacao = validar();
    if (erroValidacao) { setErro(erroValidacao); return; }

    setEnviando(true);
    setErro('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        const draft = {
          perfilCasal, dataCasamento, cidade: cidadeInput, uf: ufSelecionada,
          totalConvidados,
        };
        localStorage.setItem('descomplicai-perfil-draft', JSON.stringify(draft));
        router.push('/login?redirect=/memorial/perfil');
        return;
      }

      const res = await fetchAPI('/api/memorial/perfil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          perfilCasal, dataCasamento, cidade: cidadeInput, uf: ufSelecionada,
          totalConvidados,
          modoPlanejamento: 'guiado',
          nomeEvento: nomeEvento?.trim() || '',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.erro || result.error || t('perfil.erros.generico'));

      localStorage.setItem('descomplicai-evento-id', result.evento_id);
      localStorage.removeItem('descomplicai-perfil-draft');
      router.push('/memorial?fase=dna');
    } catch (err) {
      setErro(err.message || t('perfil.erros.generico'));
    } finally {
      setEnviando(false);
    }
  }, [perfilCasal, dataCasamento, ufSelecionada, cidadeInput, totalConvidados, nomeEvento, t, supabase, router, validar]);

  // Restaura draft se existir
  useEffect(() => {
    const draft = localStorage.getItem('descomplicai-perfil-draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.perfilCasal) setPerfilCasal(d.perfilCasal);
        if (d.dataCasamento) setDataCasamento(d.dataCasamento);
        if (d.uf) setUfSelecionada(d.uf);
        if (d.cidade) setCidadeInput(d.cidade);
        if (d.totalConvidados) setTotalConvidados(d.totalConvidados);
      } catch { /* ignora */ }
    }
  }, []);

  const isFormValid = perfilCasal && dataCasamento && ufSelecionada && cidadeInput.trim();

  return (
    <div className="perfil-page">
      <div className="perfil-container">
        <header className="perfil-header">
          <h1 className="perfil-title">{t('perfil.titulo')}</h1>
          <p className="perfil-subtitle">{t('perfil.subtitulo')}</p>
        </header>

        <section className="perfil-section" aria-labelledby="perfil-casal-label">
          <h2 id="perfil-casal-label" className="perfil-section-title">
            <Icon name="users" size={20} className="perfil-section-icon" />
            {t('perfil.perfilCasal.titulo')}
          </h2>
          <div className="perfil-cards" role="radiogroup" aria-label={t('perfil.perfilCasal.ariaLabel')}>
            {PERFIL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={perfilCasal === opt.value}
                className={`perfil-card ${perfilCasal === opt.value ? 'perfil-card--selected' : ''}`}
                onClick={() => setPerfilCasal(opt.value)}
              >
                <Icon name={opt.icon} size={28} className="perfil-card-icon" />
                <span className="perfil-card-label">{t(opt.labelKey)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="perfil-section" aria-labelledby="perfil-data-label">
          <h2 id="perfil-data-label" className="perfil-section-title">
            <Icon name="calendar" size={20} className="perfil-section-icon" />
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
            <Icon name="mapPin" size={20} className="perfil-section-icon" />
            {t('perfil.cidade.titulo')}
          </h2>
          <div className="perfil-cidade-row">
            <select
              className="perfil-select perfil-select--uf"
              value={ufSelecionada}
              onChange={(e) => { setUfSelecionada(e.target.value); setCidadeInput(''); }}
              aria-label={t('perfil.cidade.ufLabel')}
            >
              <option value="">{t('perfil.cidade.ufPlaceholder')}</option>
              {estados.map((est) => (
                <option key={est.sigla} value={est.sigla}>{est.nome} ({est.sigla})</option>
              ))}
            </select>
            <div className="perfil-autocomplete-wrapper" ref={autocompleteRef}>
              <input
                ref={cidadeInputRef}
                type="text"
                className="perfil-input perfil-input--cidade"
                value={cidadeInput}
                onChange={(e) => setCidadeInput(e.target.value)}
                placeholder={ufSelecionada ? t('perfil.cidade.placeholder') : t('perfil.cidade.ufFirst')}
                aria-label={t('perfil.cidade.ariaLabel')}
                disabled={!ufSelecionada || carregandoCidades}
                autoComplete="off"
              />
              {carregandoCidades && (
                <div className="perfil-autocomplete-loading">Carregando cidades...</div>
              )}
              {mostrarAutocomplete && !carregandoCidades && (
                <ul className="perfil-autocomplete-list" role="listbox">
                  {cidadesFiltradas.map((cidade) => (
                    <li
                      key={cidade.id}
                      role="option"
                      className="perfil-autocomplete-item"
                      onMouseDown={(e) => { e.preventDefault(); selecionarCidade(cidade); }}
                    >
                      {cidade.nome}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="perfil-section" aria-labelledby="perfil-convidados-label">
          <h2 id="perfil-convidados-label" className="perfil-section-title">
            <Icon name="users" size={20} className="perfil-section-icon" />
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
            <Icon name="edit" size={20} className="perfil-section-icon" />
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
            <Icon name="alert" size={18} />
            <span>{erro}</span>
          </div>
        )}

        <button
          type="button"
          className={`perfil-submit ${isFormValid ? 'perfil-submit--active' : 'perfil-submit--disabled'}`}
          onClick={handleSubmit}
          disabled={!isFormValid || enviando}
          aria-busy={enviando}
        >
          {enviando ? (
            <><span className="perfil-submit-spinner" aria-hidden="true" />{t('perfil.botao.carregando')}</>
          ) : (
            <>{t('perfil.botao.comecar')}<Icon name="arrowRight" size={18} /></>
          )}
        </button>
      </div>

      <style jsx>{`
        .perfil-page { min-height: 100dvh; background: var(--color-surface); padding: var(--space-4) var(--space-3); padding-bottom: calc(var(--space-4) + 80px); }
        .perfil-container { max-width: 480px; margin: 0 auto; }
        .perfil-header { text-align: center; margin-bottom: var(--space-6); }
        .perfil-title { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-text-primary); margin: 0 0 var(--space-2); line-height: 1.2; }
        .perfil-subtitle { font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text-secondary); margin: 0; }
        .perfil-section { margin-bottom: var(--space-5); }
        .perfil-section-title { font-family: var(--font-body); font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--color-text-primary); margin: 0 0 var(--space-3); display: flex; align-items: center; gap: var(--space-2); }
        .perfil-section-icon { color: var(--color-brand); flex-shrink: 0; }
        .perfil-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
        .perfil-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4) var(--space-3); background: var(--color-white); border: 2px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; transition: all 150ms ease; text-align: center; font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-primary); }
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
        .perfil-autocomplete-wrapper { flex: 1; position: relative; }
        .perfil-autocomplete-list { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-md); max-height: 200px; overflow-y: auto; z-index: var(--z-dropdown); list-style: none; margin: 0; padding: var(--space-1) 0; }
        .perfil-autocomplete-item { padding: var(--space-2) var(--space-3); cursor: pointer; font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-primary); transition: background 100ms ease; }
        .perfil-autocomplete-item:hover, .perfil-autocomplete-item:focus-visible { background: var(--color-surface); outline: none; }
        .perfil-autocomplete-loading { position: absolute; top: calc(100% + 4px); left: 0; right: 0; padding: var(--space-2) var(--space-3); background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-xs); color: var(--color-text-muted); z-index: var(--z-dropdown); }
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
