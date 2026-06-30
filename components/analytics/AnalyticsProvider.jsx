import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAnalytics } from '@/hooks/useAnalytics';

const AnalyticsContext = createContext(null);

export function useAnalyticsContext() {
  return useContext(AnalyticsContext);
}

/**
 * Provider que rastreia automaticamente:
 * - Pageviews em toda navegação (router.events)
 * - Tempo na página (mount → unmount)
 * - Gera sessao_id no primeiro render
 */
export default function AnalyticsProvider({ children }) {
  const router = useRouter();
  const analytics = useAnalytics();
  const startTimeRef = useRef(null);
  const currentPageRef = useRef(null);

  // Gera sessao_id no primeiro render (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SESSION_KEY = 'analytics_session_id';
      if (!localStorage.getItem(SESSION_KEY)) {
        const sid = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(SESSION_KEY, sid);
      }
    }
  }, []);

  // Rastreia pageviews em toda mudança de rota
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Envia tempo da página anterior antes de trocar
      if (startTimeRef.current && currentPageRef.current) {
        const segundos = (Date.now() - startTimeRef.current) / 1000;
        analytics.trackTimeOnPage(currentPageRef.current, segundos);
      }

      // Registra novo pageview
      analytics.trackPageview(url);
      currentPageRef.current = url;
      startTimeRef.current = Date.now();
    };

    // Pageview inicial
    if (router.pathname) {
      analytics.trackPageview(router.pathname);
      currentPageRef.current = router.pathname;
      startTimeRef.current = Date.now();
    }

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, router.pathname, analytics]);

  // Rastreia tempo ao fechar a aba (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (startTimeRef.current && currentPageRef.current) {
        const segundos = (Date.now() - startTimeRef.current) / 1000;
        analytics.trackTimeOnPage(currentPageRef.current, segundos);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [analytics]);

  // Rastreia tempo ao mudar de aba (visibilitychange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && startTimeRef.current && currentPageRef.current) {
        const segundos = (Date.now() - startTimeRef.current) / 1000;
        analytics.trackTimeOnPage(currentPageRef.current, segundos);
      } else if (document.visibilityState === 'visible') {
        // Reset do timer ao voltar para a aba
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}
