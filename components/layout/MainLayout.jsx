import React from 'react';
import Header from '../ui/Header';
import Footer from '../ui/Footer';

/**
 * Layout principal com Header e Footer
 * Usado em paginas que precisam de navegacao:
 * /sobre, /planos, /login, /painel, /landing
 * NAO usar em /memorial (questionario sem distracoes)
 */
export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
