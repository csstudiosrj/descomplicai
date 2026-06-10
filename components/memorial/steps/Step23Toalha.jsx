// components/memorial/steps/Step23Toalha.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { sugerirToalha, sugerirLoucas, sugerirTalheres, sugerirTacas, sugerirCentroMesa, sugerirGuardanapo } from '../../../utils/sugestoes';

// Mapeamento de opções alternativas por categoria (baseado em estilo/paleta)
const alternativas = {
  toalha: {
    default: 'Linho cru',
    opcoes: [
      { valor: 'Linho cru', cor: '#E8E0D5', desc: 'Natural e rústico' },
      { valor: 'Branco com renda', cor: '#FFFFFF', desc: 'Clássico romântico' },
      { valor: 'Juta', cor: '#C4A882', desc: 'Rústico e sustentável' },
      { valor: 'Sem toalha (mesa aparente)', cor: '#8B6F5E', desc: 'Moderno e minimalista' },
    ],
  },
  loucas: {
    default: 'Porcelana branca',
    opcoes: [
      { valor: 'Porcelana branca', cor: '#FFFFFF', desc: 'Elegante e atemporal' },
      { valor: 'Cerâmica artesanal', cor: '#D9B382', desc: 'Bordas orgânicas' },
      { valor: 'Vidro fumê', cor: '#A9A9A9', desc: 'Moderno e sofisticado' },
      { valor: 'Colorida (açafrão/verde)', cor: '#E8A317', desc: 'Tropical e vibrante' },
    ],
  },
  talheres: {
    default: 'Inox polido',
    opcoes: [
      { valor: 'Inox polido', cor: '#C0C0C0', desc: 'Contemporâneo' },
      { valor: 'Dourado fosco', cor: '#D4AF37', desc: 'Quente e elegante' },
      { valor: 'Prateado', cor: '#E0E0E0', desc: 'Frio e neutro' },
      { valor: 'Preto fosco', cor: '#2F2F2F', desc: 'Dramático e moderno' },
    ],
  },
  tacas: {
    default: 'Cristal',
    opcoes: [
      { valor: 'Cristal', cor: '#E0E8F0', desc: 'Transparente clássico' },
      { valor: 'Borda dourada', cor: '#D4AF37', desc: 'Toque de luxo' },
      { valor: 'Fumê', cor: '#696969', desc: 'Moderno e ousado' },
      { valor: 'Verde', cor: '#2E5E4E', desc: 'Vintage e colorido' },
    ],
  },
  centroMesa: {
    default: 'Arranjo floral baixo',
    opcoes: [
      { valor: 'Arranjo floral baixo', cor: '#B56576', desc: 'Romântico e conversa livre' },
      { valor: 'Velas agrupadas', cor: '#F5DEB3', desc: 'Aconchegante e íntimo' },
      { valor: 'Lanternas', cor: '#A0522D', desc: 'Rústico e charmoso' },
      { valor: 'Geométrico/escultural', cor: '#708090', desc: 'Moderno e impactante' },
    ],
  },
  guardanapo: {
    default: 'Linho branco',
    opcoes: [
      { valor: 'Linho branco', cor: '#FFFFFF', desc: 'Discreto e elegante' },
      { valor: 'Nó simples com fita', cor: '#DDB892', desc: 'Boho e delicado' },
      { valor: 'Porta-guardanapo metálico', cor: '#C0C0C0', desc: 'Industrial e moderno' },
      { valor: 'Dobra reta com monograma', cor: '#F5F5DC', desc: 'Clássico personalizado' },
    ],
  },
};

function ItemMesaPosta({ titulo, sugestao, categoria, selecionado, onSelect }) {
  const [expandido, setExpandido] = useState(false);
  const opcoes = alternativas[categoria]?.opcoes || [];

  const handleToggle = () => setExpandido(!expandido);
  const handleSelect = (valor) => {
    onSelect(valor);
    setExpandido(false);
  };

  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <Card
        interactive
        padding="md"
        onClick={handleToggle}
        selected={expandido}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
              {titulo}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Sugestão: {sugestao}
            </div>
          </div>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: opcoes.find(o => o.valor === selecionado)?.cor || '#ccc',
              border: '2px solid var(--color-border)',
              flexShrink: 0,
            }}
          />
        </div>
      </Card>
      {expandido && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)', paddingLeft: 'var(--space-4)' }}>
          {opcoes.map(op => (
            <button
              key={op.valor}
              onClick={() => handleSelect(op.valor)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                border: selecionado === op.valor ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                background: selecionado === op.valor ? 'var(--color-brand-lighter)' : 'var(--color-white)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
              }}
            >
              <span style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: op.cor,
                display: 'inline-block',
              }} />
              {op.valor}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Step23Toalha({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo;
  const paleta = estadoAtual?.paleta || [];

  const sugestoes = {
    toalha: sugerirToalha(estilo, paleta) || alternativas.toalha.default,
    loucas: sugerirLoucas(estilo) || alternativas.loucas.default,
    talheres: paleta.length ? sugerirTalheres(paleta) : alternativas.talheres.default,
    tacas: sugerirTacas(estilo) || alternativas.tacas.default,
    centroMesa: sugerirCentroMesa(estilo, false) || alternativas.centroMesa.default,
    guardanapo: sugerirGuardanapo(estilo) || alternativas.guardanapo.default,
  };

  const [selecionados, setSelecionados] = useState({
    toalha: estadoAtual?.toalha || sugestoes.toalha,
    loucas: estadoAtual?.loucas || sugestoes.loucas,
    talheres: estadoAtual?.talheres || sugestoes.talheres,
    tacas: estadoAtual?.tacas || sugestoes.tacas,
    centroMesa: estadoAtual?.centroMesa || sugestoes.centroMesa,
    guardanapo: estadoAtual?.guardanapo || sugestoes.guardanapo,
    cartaoLugar: estadoAtual?.cartaoLugar ?? false,
  });

  const atualizar = (campo, valor) => {
    setSelecionados(prev => ({ ...prev, [campo]: valor }));
  };

  const confirmar = () => {
    Object.entries(selecionados).forEach(([k, v]) => onSelect(k, v));
  };

  const cartaoVisivel = ['medio', 'grande', 'mega'].includes(estadoAtual?.totalConvidados) || estadoAtual?.tipoJantar === 'empatado';

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Mesa posta
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Sugestões baseadas no seu estilo. Toque em cada item para ver alternativas.
      </p>

      <ItemMesaPosta titulo="Toalha" sugestao={sugestoes.toalha} categoria="toalha" selecionado={selecionados.toalha} onSelect={(v) => atualizar('toalha', v)} />
      <ItemMesaPosta titulo="Louças" sugestao={sugestoes.loucas} categoria="loucas" selecionado={selecionados.loucas} onSelect={(v) => atualizar('loucas', v)} />
      <ItemMesaPosta titulo="Talheres" sugestao={sugestoes.talheres} categoria="talheres" selecionado={selecionados.talheres} onSelect={(v) => atualizar('talheres', v)} />
      <ItemMesaPosta titulo="Taças" sugestao={sugestoes.tacas} categoria="tacas" selecionado={selecionados.tacas} onSelect={(v) => atualizar('tacas', v)} />
      <ItemMesaPosta titulo="Centro de mesa" sugestao={sugestoes.centroMesa} categoria="centroMesa" selecionado={selecionados.centroMesa} onSelect={(v) => atualizar('centroMesa', v)} />
      <ItemMesaPosta titulo="Guardanapo" sugestao={sugestoes.guardanapo} categoria="guardanapo" selecionado={selecionados.guardanapo} onSelect={(v) => atualizar('guardanapo', v)} />

      {cartaoVisivel && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>Cartão de lugar</span>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
              <button
                key={String(o.v)}
                onClick={() => atualizar('cartaoLugar', o.v)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: selecionados.cartaoLugar === o.v ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)',
                  background: selecionados.cartaoLugar === o.v ? 'var(--color-brand-lighter)' : 'var(--color-white)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                }}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={confirmar}
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