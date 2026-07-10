// hooks/useTranslation.js
// Hook de internacionalização para o memorial e eventos
// Nenhuma dependência externa — puro React + dynamic import
// Suporta dot notation, interpolação e fallback automático

import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_LOCALE = 'pt-BR';
const DEFAULT_TIPO_EVENTO = 'casamento';

// Cache de JSONs carregados para evitar re-fetch
const cache = new Map();

/**
 * Resolve o caminho de um objeto usando dot notation.
 * @private
 * @param {Object} obj
 * @param {string} path — ex: "steps.step00.title"
 * @returns {any}
 */
function _getPath(obj, path) {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
}

/**
 * Interpola variáveis em uma string.
 * Ex: "Olá, {name}!" + {name: "João"} → "Olá, João!"
 * @private
 * @param {string} str
 * @param {Object} vars
 * @returns {string}
 */
function _interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`;
  });
}

/**
 * Hook de tradução para o memorial e eventos.
 *
 * @param {string} [tipoEvento='casamento'] — 'casamento' | '15anos' | 'barmitzvah' | 'batmitzvah' | 'formatura'
 * @returns {Object} { t, locale, setLocale, tipoEvento, loading, error }
 *
 * @example
 * const { t } = useTranslation('casamento');
 * t('steps.step00.title'); // → "Quem está se casando?"
 * t('hello', { name: 'João' }); // → interpolação
 */
export function useTranslation(tipoEvento = DEFAULT_TIPO_EVENTO) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tipoRef = useRef(tipoEvento);

  // Atualiza ref quando tipoEvento muda
  useEffect(() => {
    tipoRef.current = tipoEvento;
  }, [tipoEvento]);

  // Carrega o JSON correto
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const cacheKey = `${locale}:${tipoEvento}`;

      // Verifica cache
      if (cache.has(cacheKey)) {
        if (!cancelled) {
          setData(cache.get(cacheKey));
          setLoading(false);
        }
        return;
      }

      try {
        // Tenta carregar o JSON específico do tipo de evento
        let module;
        try {
          module = await import(`../locales/${locale}/${tipoEvento}.json`);
        } catch (e) {
          // Fallback: tenta memorial.json se o específico não existir
          module = await import(`../locales/${locale}/memorial.json`);
        }

        const json = module.default || module;

        if (!cancelled) {
          cache.set(cacheKey, json);
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          // Fallback silencioso: não quebra, retorna chave
          setData({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [locale, tipoEvento]);

  /**
   * Traduz uma chave usando dot notation.
   * Se a chave não existir, retorna a própria chave.
   * Suporta interpolação de variáveis.
   *
   * @param {string} key — ex: "steps.step00.title"
   * @param {Object} [vars] — variáveis para interpolação { name: "João" }
   * @returns {string}
   */
  const t = useCallback((key, vars) => {
    if (!key) return '';
    const value = _getPath(data, key);
    if (value === undefined || value === null) return key;
    if (typeof value !== 'string') return String(value);
    return _interpolate(value, vars);
  }, [data]);

  /**
   * Muda o idioma ativo.
   * @param {string} newLocale — ex: 'pt-BR', 'en', 'es'
   */
  const setLocale = useCallback((newLocale) => {
    setLocaleState(newLocale);
  }, []);

  return {
    t,
    locale,
    setLocale,
    tipoEvento,
    loading,
    error,
  };
}

export default useTranslation;
