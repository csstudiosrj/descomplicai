import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';

export default function Header() {
  const { user, carregando, signOut } = useAuth();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setMenuAberto(false);
    router.push('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo-link" onClick={() => setMenuAberto(false)}>
          <Logo />
        </Link>
        
        <nav className={`header-nav ${menuAberto ? 'header-nav--open' : ''}`} aria-label="Navegação principal">
          <ul className="header-nav-list">
            <li>
              <Link href="/planos" className="header-nav-link" onClick={() => setMenuAberto(false)}>
                Planos
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