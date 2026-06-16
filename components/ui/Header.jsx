// components/ui/Header.jsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';

export default function Header() {
  const { user, carregando, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

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
            {carregando ? (
              <li>
                <span className="header-nav-link" style={{ opacity: 0.5 }}>
                  Carregando...
                </span>
              </li>
            ) : user ? (
              <>
                <li>
                  <Link href="/painel" className="header-nav-link">
                    Painel
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="header-nav-link header-nav-link--primary"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Sair
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" className="header-nav-link header-nav-link--primary">
                  Entrar
                </Link>
              </li>
            )}
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