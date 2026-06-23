import { useState } from 'react';

/**
 * Card de contrato na listagem.
 * Exibe: fornecedor, categoria, status, data de criação, ações.
 */
export default function ContratoCard({ contrato, fornecedor, onEditar, onEnviar, onVisualizar }) {
  const [expandido, setExpandido] = useState(false);

  // TODO: renderizar card compacto com dados do contrato

  return (
    <div>
      {/* placeholder — implementar após decisão de layout */}
    </div>
  );
}