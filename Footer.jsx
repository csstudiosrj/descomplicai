import Link from 'next/link';
import Icon from './Icon';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h4 className="footer-title">Descomplicaí</h4>
            <p className="footer-text">
              O jeito mais simples de organizar o casamento dos seus sonhos.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Navegação</h4>
            <ul className="footer-list">
              <li>
                <Link href="/planos" className="footer-link">Planos</Link>
              </li>
              <li>
                <Link href="/login" className="footer-link">Entrar</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Para profissionais</h4>
            <ul className="footer-list">
              <li>
                <Link href="/cerimonialista/cadastro" className="footer-link">
                  Cadastrar como cerimonialista
                </Link>
              </li>
              <li>
                <Link href="/fornecedor/cadastro" className="footer-link">
                  Cadastrar como fornecedor
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            Descomplicaí — Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
