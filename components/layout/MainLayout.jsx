import React from 'react';
import Header from '../ui/Header';

/**
 * Layout principal com Header
 * Usado em páginas que precisam de navegação:
 * /sobre, /planos, /login, /painel
 * NÃO usar em /memorial (questionário sem distrações)
 */
export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
    </>
  );
}