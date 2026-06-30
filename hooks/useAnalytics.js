import { useCallback, useRef, useEffect } from 'react';

const SESSION_KEY = 'analytics_session_id';
const API_ENDPOINT = '/api/analytics/track';
const BATCH_INTERVAL_MS = 30000; // 30 segundos
const BATCH_MAX_SIZE = 10;

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
 * Sistema de batch de eventos de analytics.
 * Acumula eventos no cliente e envia em lote a cada 30s ou 10 eventos.
 * Reduz writes no Supabase free de N para ~1 a cada 30s.
 */
class AnalyticsBatch {
  constructor() {
    this.queue = [];
    this.timer = null;
    this.flushing = false;
    this.startTimer();
  }

  push(payload) {
    this.queue.push(payload);
    if (this.queue.length >= BATCH_MAX_SIZE) {
      this.flush();
    }
  }

  startTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => this.flush(), BATCH_INTERVAL_MS);
  }

  async flush() {
    if (this.flushing || this.queue.length === 0) return;
    this.flushing = true;
    const batch = this.queue.splice(0, this.queue.length);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch, count: batch.length }),
        signal: controller.signal,
        keepalive: true,
      });

      clearTimeout(timeout);
    } catch {
      // Silencia erros — analytics nunca quebra o app
      // Em caso de falha, os eventos sao perdidos (aceitavel para analytics)
    } finally {
      this.flushing = false;
    }
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}

let globalBatch = null;

function getBatch() {
  if (!globalBatch) globalBatch = new AnalyticsBatch();
  return globalBatch;
}

// Flush ao sair da pagina
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (globalBatch) globalBatch.flush();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && globalBatch) {
      globalBatch.flush();
    }
  });
}

/**
 * Envia evento fire-and-forget (agora via batch)
 */
async function sendEvent(payload) {
  const batch = getBatch();
  batch.push(payload);
}

/**
 * Envia via sendBeacon (garante envio ao fechar aba)
 */
function sendBeacon(payload) {
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(API_ENDPOINT, JSON.stringify({ batch: [payload], count: 1 }));
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
