import React from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import AnalyticsProvider from '../components/analytics/AnalyticsProvider';
import '../styles/tokens.css';
import '../styles/globals.css';

const NO_HEADER_ROUTES = ['/memorial', '/memorial/[...slug]'];

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const hideHeader = NO_HEADER_ROUTES.some((route) =>
    router.pathname.startsWith(route.replace('[...slug]', ''))
  );

  const content = hideHeader ? (
    <Component {...pageProps} />
  ) : (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );

  return (
    <AuthProvider>
      <AnalyticsProvider>
        {content}
      </AnalyticsProvider>
    </AuthProvider>
  );
}

export default MyApp;
