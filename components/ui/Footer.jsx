import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-bottom">
          <p className="footer-copyright">
            descomplicaí — Todos os direitos reservados ao{' '}
            <a
              href="https://arxum.csstudios.site"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              ARXUM
            </a>
            {' '}group
          </p>
          <nav className="footer-nav-inline" aria-label="Links do rodapé">
            <Link href="/login" className="footer-link">Entrar</Link>
            <Link href="/cerimonialista/cadastro" className="footer-link">Cadastrar como cerimonialista</Link>
            <Link href="/fornecedor/cadastro" className="footer-link">Cadastrar como fornecedor</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
