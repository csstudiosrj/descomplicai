#!/bin/bash
# Correcoes v3 — sem python3, apenas bash/sed
# bash aplicar-correcoes-v3.sh

set -e

echo ">>> 1/3 styles/globals.css — adiciona .footer-section"
if grep -q '\.footer-section' styles/globals.css; then
  echo "    .footer-section já existe, pulando"
else
  sed -i 's/\.footer-title {/.footer-section {\n  display: flex;\n  flex-direction: column;\n}\n\n.footer-title {/' styles/globals.css
  echo "    .footer-section adicionado"
fi

echo ">>> 2/3 pages/memorial/index.jsx — overflow: hidden no main"
cat > pages/memorial/index.jsx << 'EOF'
import Header from '../../components/ui/Header';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';

export default function MemorialPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '52px', height: '100dvh', boxSizing: 'border-box', overflow: 'hidden' }}>
        <MemorialOrchestrator />
      </main>
    </>
  );
}
EOF

echo ">>> 3/3 components/ui/Footer.jsx — sem import Icon morto"
cat > components/ui/Footer.jsx << 'EOF'
import Link from 'next/link';

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
EOF

echo ""
echo "Concluído. Arquivos alterados:"
echo "  styles/globals.css"
echo "  pages/memorial/index.jsx"
echo "  components/ui/Footer.jsx"