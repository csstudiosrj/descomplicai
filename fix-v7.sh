#!/bin/bash
# fix-v7.sh — footer discreto, linha única
# bash fix-v7.sh

set -e

echo ">>> components/ui/Footer.jsx — linha única discreta"
cat > components/ui/Footer.jsx << 'EOF'
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
EOF
echo "    Footer.jsx reescrito"

echo ""
echo ">>> styles/globals.css — estilos do footer linha única"
# Remove os blocos antigos do footer e substitui por versão compacta
awk '
/^\/\* ---------- Footer ---------- \*\// { in_footer=1 }
in_footer && /^\/\* ----------/ && !/Footer/ { in_footer=0 }
in_footer { next }
{ print }
' styles/globals.css > /tmp/globals.css && mv /tmp/globals.css styles/globals.css

cat >> styles/globals.css << 'EOF'

/* ---------- Footer linha única ---------- */
.footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-white);
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  gap: var(--space-6);
}

.footer-copyright {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.footer-nav-inline {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.footer-link {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 150ms ease;
  white-space: nowrap;
}

.footer-link:hover {
  color: var(--color-brand);
}

@media (max-width: 768px) {
  .footer-nav-inline {
    display: none;
  }
}
EOF
echo "    globals.css atualizado"

echo ""
echo "Commit e push:"
echo "  git add -A && git commit -m 'fix: footer linha unica discreta com ARXUM group' && git push"