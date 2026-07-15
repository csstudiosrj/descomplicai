import React from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import AnalyticsProvider from '../components/analytics/AnalyticsProvider';
import AcessibilidadeWidget from '../components/AcessibilidadeWidget';
import '../styles/tokens.css';
import '../styles/fontes.css';
import '../styles/globals.css';
import '../styles/cards.css';

const NO_HEADER_ROUTES = ['/admin', '/admin/[...slug]'];

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const hideHeader = NO_HEADER_ROUTES.some((route) =>
    router.pathname.startsWith(route.replace('[...slug]', ''))
  );

  const content = hideHeader ? (
    <Component {...pageProps} />
  ) : (
    <MainLayout hideFooter={router.pathname.startsWith('/memorial')}>
      <Component {...pageProps} />
    </MainLayout>
  );

  return (
    <AuthProvider>
      <AnalyticsProvider>
        {content}
        <AcessibilidadeWidget />
      </AnalyticsProvider>
    </AuthProvider>
  );
}

export default MyApp;