import { useCallback, useRef, useEffect } from 'react';

const SESSION_KEY = 'analytics_session_id';
const API_ENDPOINT = '/api/analytics/track';

function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function clearSessionId() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Envia evento fire-and-forget (não bloqueia UI)
 */
async function sendEvent(payload) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true,
    });

    clearTimeout(timeout);
  } catch {
    // Silencia erros — analytics nunca quebra o app
  }
}

/**
 * Envia via sendBeacon (garante envio ao fechar aba)
 */
function sendBeacon(payload) {
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(API_ENDPOINT, JSON.stringify(payload));
    } catch {
      // fallback silencioso
    }
  }
}

export function useAnalytics() {
  const sessaoId = useRef(typeof window !== 'undefined' ? getSessionId() : null);

  const trackPageview = useCallback((pagina, extra = {}) => {
    if (!sessaoId.current) return;
    sendEvent({
      sessao_id: sessaoId.current,
      evento_tipo: 'pageview',
      pagina,
      ...extra,
    });
  }, []);

  const trackStep = useCallback((stepId, acao, extra = {}) => {
    if (!sessaoId.current) return;
    sendEvent({
      sessao_id: sessaoId.current,
      evento_tipo: 'step_memorial',
      categoria: 'memorial',
      acao,
      step_id: stepId,
      ...extra,
    });
  }, []);

  const trackEvent = useCallback((tipo, categoria, acao, dados = {}) => {
    if (!sessaoId.current) return;
    sendEvent({
      sessao_id: sessaoId.current,
      evento_tipo: tipo,
      categoria,
      acao,
      dados,
    });
  }, []);

  const trackTimeOnPage = useCallback((pagina, segundos, extra = {}) => {
    if (!sessaoId.current) return;
    const payload = {
      sessao_id: sessaoId.current,
      evento_tipo: 'tempo',
      pagina,
      tempo_na_pagina: Math.round(segundos),
      ...extra,
    };
    // Usa beacon se for um envio de unmount (página sendo fechada)
    if (document.visibilityState === 'hidden') {
      sendBeacon(payload);
    } else {
      sendEvent(payload);
    }
  }, []);

  const trackCheckout = useCallback((acao, valor = null, extra = {}) => {
    if (!sessaoId.current) return;
    sendEvent({
      sessao_id: sessaoId.current,
      evento_tipo: 'checkout',
      categoria: 'pagamento',
      acao,
      valor,
      ...extra,
    });
  }, []);

  const trackLogin = useCallback((sucesso, extra = {}) => {
    if (!sessaoId.current) return;
    sendEvent({
      sessao_id: sessaoId.current,
      evento_tipo: 'acao',
      categoria: 'auth',
      acao: sucesso ? 'login_sucesso' : 'login_falha',
      ...extra,
    });
  }, []);

  return {
    trackPageview,
    trackStep,
    trackEvent,
    trackTimeOnPage,
    trackCheckout,
    trackLogin,
  };
}

export default useAnalytics;
