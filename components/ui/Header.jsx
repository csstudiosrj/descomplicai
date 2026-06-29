import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';
import Icon from './Icon';

export default function Header() {
  const { user, carregando, signOut } = useAuth();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimer = useRef(null);

  const handleLogout = async () => {
    await signOut();
    setMenuAberto(false);
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setDropdownAberto(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setDropdownAberto(false), 150);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo-link" onClick={() => setMenuAberto(false)}>
          <Logo />
        </Link>

        <nav className={`header-nav ${menuAberto ? 'header-nav--open' : ''}`} aria-label="Navegacao principal">
          <ul className="header-nav-list">
            {/* Dropdown Para profissionais */}
            <li
              ref={dropdownRef}
              className="header-dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className="header-nav-link header-dropdown-toggle"
                onClick={() => setDropdownAberto(!dropdownAberto)}
                aria-expanded={dropdownAberto}
                aria-haspopup="true"
              >
                Para profissionais
                <span className={`header-dropdown-chevron ${dropdownAberto ? 'header-dropdown-chevron--open' : ''}`}>
                  <Icon name="chevronDown" size={14} />
                </span>
              </button>

              <div
                className={`header-dropdown-menu ${dropdownAberto ? 'header-dropdown-menu--open' : ''}`}
                role="menu"
              >
                <Link href="/cerimonialista/login" legacyBehavior>
                  <a
                    className="header-dropdown-item"
                    role="menuitem"
                    onClick={() => { setDropdownAberto(false); setMenuAberto(false); }}
                  >
                    <Icon name="briefcase" size={16} />
                    <span>Sou cerimonialista</span>
                  </a>
                </Link>
                <Link href="/fornecedor/login" legacyBehavior>
                  <a
                    className="header-dropdown-item"
                    role="menuitem"
                    onClick={() => { setDropdownAberto(false); setMenuAberto(false); }}
                  >
                    <Icon name="store" size={16} />
                    <span>Sou fornecedor</span>
                  </a>
                </Link>
              </div>
            </li>

            {/* Mobile: links diretos sem dropdown */}
            <li className="header-nav-item--mobile-only">
              <Link href="/cerimonialista/login" className="header-nav-link" onClick={() => setMenuAberto(false)}>
                <Icon name="briefcase" size={16} />
                Sou cerimonialista
              </Link>
            </li>
            <li className="header-nav-item--mobile-only">
              <Link href="/fornecedor/login" className="header-nav-link" onClick={() => setMenuAberto(false)}>
                <Icon name="store" size={16} />
                Sou fornecedor
              </Link>
            </li>

            {carregando ? (
              <li>
                <span className="header-nav-link" style={{ opacity: 0.5 }}>
                  Carregando...
                </span>
              </li>
            ) : user ? (
              <>
                <li>
                  <Link href="/painel" className="header-nav-link" onClick={() => setMenuAberto(false)}>
                    Painel
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="header-nav-link header-nav-link--primary"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Sair
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" className="header-nav-link header-nav-link--primary" onClick={() => setMenuAberto(false)}>
                  Entrar
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <button
          className="header-menu-toggle"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <span className="header-menu-bar" />
          <span className="header-menu-bar" />
          <span className="header-menu-bar" />
        </button>
      </div>
    </header>
  );
}