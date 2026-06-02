// HTML base com VLibras integrado
// Dependências diretas: next/document

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
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