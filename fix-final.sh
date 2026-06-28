#!/bin/bash
# diagnostico + correcao forçada
# bash fix-final.sh

echo "=== STATUS DOS ARQUIVOS ==="

echo ""
echo "-- styles/globals.css: footer-section --"
grep -n "footer-section\|footer-title\|footer-grid" styles/globals.css || echo "NAO ENCONTRADO"

echo ""
echo "-- components/ui/Footer.jsx: primeiras 5 linhas --"
head -5 components/ui/Footer.jsx

echo ""
echo "-- pages/memorial/index.jsx --"
cat pages/memorial/index.jsx

echo ""
echo "=== APLICANDO CORRECOES ==="

echo ""
echo ">>> globals.css: inserindo .footer-section se ausente"
if grep -q "footer-section" styles/globals.css; then
  echo "    ja existe"
else
  # Cria arquivo temporário com a inserção
  awk '/\.footer-title \{/ { 
    print ".footer-section {"
    print "  display: flex;"
    print "  flex-direction: column;"
    print "}"
    print ""
  }
  { print }' styles/globals.css > styles/globals.css.tmp && mv styles/globals.css.tmp styles/globals.css
  echo "    inserido via awk"
fi

echo ""
echo ">>> Verificando resultado:"
grep -n "footer-section\|footer-title" styles/globals.css

echo ""
echo ">>> Footer.jsx:"
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
echo "    Footer.jsx reescrito"

echo ""
echo ">>> pages/memorial/index.jsx:"
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
echo "    memorial/index.jsx reescrito"

echo ""
echo "=== REINICIANDO DEV SERVER ==="
# Mata o processo next dev se estiver rodando
pkill -f "next dev" 2>/dev/null && echo "next dev encerrado" || echo "next dev nao estava rodando"

echo ""
echo "Pronto. Abra um novo terminal e rode: npm run dev"
echo "Ou use o botao de restart do IDX."