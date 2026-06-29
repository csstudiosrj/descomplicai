#!/bin/bash
# fix-v10.sh
# bash fix-v10.sh

set -e

echo ">>> styles/globals.css — footer position:fixed, altura exata"
# Remove bloco footer atual e reescreve
awk '
/^\/\* ---------- Footer linha única ---------- \*\// { skip=1 }
skip && /^\}$/ { 
  count++
  if (count >= 6) { skip=0; count=0 }
  next
}
skip { next }
{ print }
' styles/globals.css > /tmp/g.css && mv /tmp/g.css styles/globals.css

cat >> styles/globals.css << 'EOF'

/* ---------- Footer linha única ---------- */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 44px;
  border-top: 1px solid var(--color-border);
  background: var(--color-white);
  z-index: var(--z-sticky);
}

.footer-container {
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
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

echo "    CSS do footer reescrito com position:fixed"

echo ""
echo "Verificando:"
grep -A3 "\.footer {" styles/globals.css | head -6

echo ""
echo "Commit e push:"
echo "  git add -A && git commit -m 'fix: footer position fixed bottom, altura 44px exata' && git push"