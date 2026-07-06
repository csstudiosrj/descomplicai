
// === INSTRUÇÕES DE MODIFICAÇÃO ===
// Arquivo: components/memorial/MemorialOrchestrator.jsx
//
// 1. ADICIONAR import de fetchAPI (se ainda não existir):
//    Verifique se já tem: import fetchAPI from '../../utils/fetchAPI';
//    Se não tiver, adicione junto com os outros imports.
//
// 2. ADICIONAR estado salvandoDraft no useState:
//    const [salvandoDraft, setSalvandoDraft] = useState(false);
//
// 3. SUBSTITUIR a função handleIrParaLogin (linha ~310) por:

const handleIrParaLogin = async (destino) => {
  setSalvandoDraft(true);
  try {
    // 1. Salva draft no Supabase
    let draftToken = null;
    try {
      const res = await fetchAPI('/api/memorial/salvar-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      const result = await res.json();
      if (result.sucesso) {
        draftToken = result.draft_token;
      }
    } catch (draftErr) {
      console.warn('[MemorialOrchestrator] Erro ao salvar draft:', draftErr);
    }

    // 2. Redireciona para login ou cadastro com draft_id
    const query = draftToken ? `?draft_id=${encodeURIComponent(draftToken)}` : '';
    router.push(`${destino}${query}&redirect=${encodeURIComponent('/memorial')}`);
  } catch (err) {
    console.error('[MemorialOrchestrator] Erro ao redirecionar:', err);
    router.push(`${destino}?redirect=${encodeURIComponent('/memorial')}`);
  } finally {
    setSalvandoDraft(false);
  }
};

// 4. ADICIONAR overlay de loading no JSX (dentro do return, antes do carregandoAuth check):
//    Cole este bloco logo após o {salvandoAgora && ...}:

{salvandoDraft && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
  }}>
    <div style={{
      padding: 'var(--space-4) var(--space-6)',
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    }}>
      Salvando seu progresso...
    </div>
  </div>
)}

// 5. REMOVER o sessionStorage.setItem do handleIrParaLogin antigo
//    (já está substituído no passo 3)
