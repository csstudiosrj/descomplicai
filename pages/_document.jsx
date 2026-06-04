// HTML base com Google Fonts + VLibras integrado
// Dependências diretas: next/document

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Space+Mono:ital,wght@1,400&display=swap"
          rel="stylesheet"
        />
        <script src="https://vlibras.gov.br/app/vlibras-plugin.js" async />
      </Head>
      <body>
        <Main />
        <NextScript />
        <div vw className="enabled">
          <div vw-access-button className="active" />
          <div vw-plugin-wrapper>
            <div className="vw-plugin-top-wrapper" />
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: 'new window.VLibras.Widget("https://vlibras.gov.br/app");',
          }}
        />
      </body>
    </Html>
  );
}