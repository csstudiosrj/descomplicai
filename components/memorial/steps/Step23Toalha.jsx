// Bloco F — Mesa posta: toalha, louças, talheres, taças, centro, guardanapo, cartão de lugar
// Mapeia: Step23Toalha(F1), Step24Loucas(F2), Step25Talheres(F3), Step26Tacas(F4), Step27CentroMesa(F5), Step28Guardanapo(F6), Step29CartaoLugar(F7)
// Dependências diretas: React, PropTypes, Card, sugestoes.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { sugerirToalha, sugerirLoucas, sugerirTalheres, sugerirTacas, sugerirCentroMesa, sugerirGuardanapo } from '../../../utils/sugestoes';

export default function Step23Toalha({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo;
  const paleta = estadoAtual?.paleta || [];

  const sugestoes = {
    toalha: estilo ? sugerirToalha(estilo, paleta) : 'Toalha branca',
    loucas: estilo ? sugerirLoucas(estilo) : 'Porcelana branca',
    talheres: paleta.length ? sugerirTalheres(paleta) : 'Inox polido',
    tacas: estilo ? sugerirTacas(estilo) : 'Cristal',
    centro: estilo ? sugerirCentroMesa(estilo, false) : 'Arranjo floral',
    guardanapo: estilo ? sugerirGuardanapo(estilo) : 'Linho branco',
  };

  const [confirmados, setConfirmados] = useState({
    toalha: estadoAtual?.toalha || sugestoes.toalha,
    loucas: estadoAtual?.loucas || sugestoes.loucas,
    talheres: estadoAtual?.talheres || sugestoes.talheres,
    tacas: estadoAtual?.tacas || sugestoes.tacas,
    centroMesa: estadoAtual?.centroMesa || sugestoes.centro,
    guardanapo: estadoAtual?.guardanapo || sugestoes.guardanapo,
    cartaoLugar: estadoAtual?.cartaoLugar || false,
  });

  const itens = [
    { key: 'toalha', label: 'Toalha', sugestao: sugestoes.toalha },
    { key: 'loucas', label: 'Louças', sugestao: sugestoes.loucas },
    { key: 'talheres', label: 'Talheres', sugestao: sugestoes.talheres },
    { key: 'tacas', label: 'Taças', sugestao: sugestoes.tacas },
    { key: 'centroMesa', label: 'Centro de mesa', sugestao: sugestoes.centro },
    { key: 'guardanapo', label: 'Guardanapo', sugestao: sugestoes.guardanapo },
  ];

  const handleConfirmar = () => {
    Object.entries(confirmados).forEach(([k, v]) => onSelect(k, v));
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Mesa posta
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Confirmamos sugestões automáticas baseadas no seu estilo. Ajuste o que quiser.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {itens.map(item => (
          <Card key={item.key} variant="default" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Sugestão: {item.sugestao}</div>
              </div>
              <input
                type="text"
                value={confirmados[item.key]}
                onChange={(e) => setConfirmados(prev => ({ ...prev, [item.key]: e.target.value }))}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  minWidth: '180px',
                  outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              />
            </div>
          </Card>
        ))}

        {(estadoAtual?.totalConvidados === 'medio' || estadoAtual?.totalConvidados === 'grande' || estadoAtual?.totalConvidados === 'mega' || estadoAtual?.tipoJantar === 'empatado') && (
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>Cartão de lugar</span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
                  <button key={String(o.v)} onClick={() => setConfirmados(prev => ({ ...prev, cartaoLugar: o.v }))} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: confirmados.cartaoLugar === o.v ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: confirmados.cartaoLugar === o.v ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <button
        onClick={handleConfirmar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--color-brand)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
        }}
      >
        Confirmar mesa posta
      </button>
    </div>
  );
}

Step23Toalha.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step23Toalha };