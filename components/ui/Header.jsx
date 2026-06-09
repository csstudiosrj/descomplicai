// components/ui/Header.jsx

import Logo from './Logo';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo-link">
          <Logo />
        </Link>
        <nav className="header-nav" aria-label="Navegação principal">
          <ul className="header-nav-list">
            <li>
              <Link href="/planos" className="header-nav-link">
                Planos
              </Link>
            </li>
            <li>
              <Link href="/login" className="header-nav-link header-nav-link--primary">
                Entrar
              </Link>
            </li>
          </ul>
        </nav>
        <button className="header-menu-toggle" aria-label="Abrir menu">
          <span className="header-menu-bar" />
          <span className="header-menu-bar" />
          <span className="header-menu-bar" />
        </button>
      </div>
    </header>
  );
}