#!/bin/bash
# fix-v9.sh
# bash fix-v9.sh

set -e

echo ">>> 1/2 pages/memorial/index.jsx — overflow:auto no main"
cat > pages/memorial/index.jsx << 'EOF'
import Header from '../../components/ui/Header';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';

export default function MemorialPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '52px', minHeight: '100dvh', boxSizing: 'border-box' }}>
        <MemorialOrchestrator />
      </main>
    </>
  );
}
EOF
echo "    memorial/index.jsx ok"

echo ""
echo ">>> 2/2 MemorialOrchestrator.jsx — container volta para minHeight:100%, sem flex"
sed -i "s/position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'/position: 'relative', minHeight: '100%'/" \
  components/memorial/MemorialOrchestrator.jsx
echo "    container corrigido"

echo ""
echo "Verificando:"
grep -n "minHeight\|height.*100\|overflow\|flex" components/memorial/MemorialOrchestrator.jsx | head -5
grep -n "minHeight\|overflow" pages/memorial/index.jsx

echo ""
echo "Commit e push:"
echo "  git add -A && git commit -m 'fix: layout memorial sem esmagar conteudo, footer no fluxo normal' && git push"