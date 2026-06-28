#!/bin/bash
# Correcoes v2 — rodar na raiz do projeto no IDX
# bash aplicar-correcoes-v2.sh

set -e

echo ">>> 1/3 styles/globals.css — adiciona footer-section ao CSS"
# Adiciona .footer-section logo após .footer-grid no CSS
python3 - << 'PYEOF'
with open('styles/globals.css', 'r') as f:
    content = f.read()

# Insere footer-section após o bloco .footer-grid
footer_section = """
.footer-section {
  display: flex;
  flex-direction: column;
}
"""

target = '.footer-grid {'
if '.footer-section' not in content:
    # Acha o fim do bloco .footer-grid e insere depois
    idx = content.find('.footer-title {')
    if idx != -1:
        content = content[:idx] + footer_section.lstrip('\n') + '\n' + content[idx:]
        with open('styles/globals.css', 'w') as f:
            f.write(content)
        print('footer-section adicionado ao globals.css')
    else:
        print('AVISO: nao encontrou posicao para inserir footer-section')
else:
    print('footer-section ja existe no CSS, pulando')
PYEOF

echo ">>> 2/3 pages/memorial/index.jsx — remove paddingTop duplicado do main"
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

echo ">>> 3/3 components/ui/Footer.jsx — reescreve sem import Icon, com footer-section explícito"
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
echo "  styles/globals.css  — .footer-section adicionado"
echo "  pages/memorial/index.jsx — overflow: hidden no main"
echo "  components/ui/Footer.jsx — sem import Icon morto"