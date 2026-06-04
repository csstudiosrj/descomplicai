import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';

/**
 * Header do Descomplicaí
 * - Logo tipográfico
 * - Links: Planos, Entrar
 * - Mobile first (390px base)
 * - Zero emojis
 * - ARIA labels em todos os elementos interativos
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <Link href="/" className="header-logo-link" aria-label="Ir para página inicial">
          <Logo />
        </Link>

        <nav className="header-nav" aria-label="Navegação principal">
          <ul className="header-nav-list">
            <li>
              <Link href="/planos" className="header-nav-link" aria-label="Ver planos de preço">
                Planos
              </Link>
            </li>
            <li>
              <Link href="/login" className="header-nav-link header-nav-link--primary" aria-label="Entrar na conta">
                Entrar
              </Link>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          className="header-menu-toggle"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="header-mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="header-menu-bar" aria-hidden="true" />
          <span className="header-menu-bar" aria-hidden="true" />
          <span className="header-menu-bar" aria-hidden="true" />
        </button>
      </div>

      {menuOpen && (
        <div id="header-mobile-menu" className="header-mobile-menu">
          <ul className="header-mobile-list">
            <li>
              <Link href="/planos" className="header-mobile-link" aria-label="Ver planos de preço" onClick={() => setMenuOpen(false)}>
                Planos
              </Link>
            </li>
            <li>
              <Link href="/login" className="header-mobile-link header-mobile-link--primary" aria-label="Entrar na conta" onClick={() => setMenuOpen(false)}>
                Entrar
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}