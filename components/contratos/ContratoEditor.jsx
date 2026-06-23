import { useState, useEffect } from 'react';

/**
 * Editor de texto do contrato.
 * Permite editar o conteúdo, visualizar preview, salvar rascunho.
 */
export default function ContratoEditor({ contrato, fornecedor, onSalvar, onFechar }) {
  const [conteudo, setConteudo] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (contrato?.conteudo) {
      setConteudo(contrato.conteudo);
    }
  }, [contrato]);

  // TODO: textarea rico ou plain text + preview renderizado

  return (
    <div>
      {/* placeholder — implementar após decisão de UX */}
    </div>
  );
}