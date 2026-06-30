// HTML base com Google Fonts + Meta tags PWA
// VLibras removido do bundle — carregado via lazy load em AcessibilidadeWidget
// Dependências diretas: next/document

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Space+Mono:ital,wght@1,400&display=swap"
          rel="stylesheet"
        />

        {/* PWA — Manifest e Theme Color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B6F5E" />
        <meta name="msapplication-TileColor" content="#8B6F5E" />

        {/* Apple Mobile Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Descomplicaí" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="mask-icon" href="/icons/icon-192x192.png" color="#8B6F5E" />

        {/* Microsoft */}
        <meta name="msapplication-config" content="none" />

        {/* SEO / Social */}
        <meta name="description" content="Organize seu casamento sem estresse. Descomplicaí é o planejador completo para casais." />
        <meta name="application-name" content="Descomplicaí" />
      </Head>
      <body aria-label="Descomplicaí — Planejador de casamentos">
        <a href="#main-content" className="skip-link">Pular para conteúdo principal</a>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
