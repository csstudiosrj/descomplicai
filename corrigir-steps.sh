#!/bin/bash
# Correção em lote dos Step*.jsx - problemas de referência e termos

set -e

echo "▶️ Corrigindo arquivos Step*.jsx..."

# Garante que a pasta existe
mkdir -p components/memorial/steps

# ============================================================
# 1. Step05Convidados - corrige map (o -> o)
cat > components/memorial/steps/Step05Convidados.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/Step05Convidados.jsx
 * ========================================== */\n
// B4 — Número de convidados
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: 'micro', label: 'Micro', sub: 'Até 20 pessoas', desc: 'Só os mais próximos' },
  { valor: 'intimo', label: 'Íntimo', sub: '20 a 50 pessoas', desc: 'Família e amigos queridos' },
  { valor: 'medio', label: 'Médio', sub: '50 a 100 pessoas', desc: 'Celebração completa' },
  { valor: 'grande', label: 'Grande', sub: '100 a 200 pessoas', desc: 'Festa memorável' },
  { valor: 'mega', label: 'Mega', sub: 'Acima de 200', desc: 'Grande celebração' },
];

export default function Step05Convidados({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.totalConvidados;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Número de convidados" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Quantos convidados?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-brand)', fontWeight: 'var(--font-medium)' }}>{o.sub}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Step05Convidados.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step05Convidados };
EOF

# ============================================================
# 2. Step06Orcamento - corrige map
cat > components/memorial/steps/Step06Orcamento.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/Step06Orcamento.jsx
 * ========================================== */\n
// B5 — Faixa de orçamento
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: 'ate-20k', label: 'Até R$ 20 mil', desc: 'Evento econômico' },
  { valor: '20k-50k', label: 'R$ 20 mil a 50 mil', desc: 'Padrão brasileiro' },
  { valor: '50k-90k', label: 'R$ 50 mil a 90 mil', desc: 'Confortável' },
  { valor: '90k-150k', label: 'R$ 90 mil a 150 mil', desc: 'Premium' },
  { valor: '150k-300k', label: 'R$ 150 mil a 300 mil', desc: 'Luxo' },
  { valor: 'acima-300k', label: 'Acima de R$ 300 mil', desc: 'Alto padrão' },
  { valor: 'nao-informar', label: 'Prefiro não informar', desc: 'Definimos depois' },
];

export default function Step06Orcamento({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.faixaOrcamento;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Orçamento do evento" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Qual o orçamento estimado?
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Isso nos ajuda a sugerir fornecedores na faixa certa. Pode mudar depois.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="md" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Step06Orcamento.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step06Orcamento };
EOF

# ============================================================
# 3. Step13Formalidade - corrige map
cat > components/memorial/steps/Step13Formalidade.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/Step13Formalidade.jsx
 * ========================================== */\n
// D2 — Formalidade do evento
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: 'formal', label: 'Formal', desc: 'Black tie, vestido longo, terno escuro' },
  { valor: 'semiformal', label: 'Semi-formal', desc: 'Elegante mas não rígido' },
  { valor: 'despojado', label: 'Despojado', desc: 'Conforto e personalidade' },
];

export default function Step13Formalidade({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.formalidade;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Formalidade do evento" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Qual a formalidade?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Step13Formalidade.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step13Formalidade };
EOF

# ============================================================
# 4. StepA10TemFilhos - corrige map e adiciona termos? (não usa termos)
cat > components/memorial/steps/StepA10TemFilhos.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepA10TemFilhos.jsx
 * ========================================== */\n
// StepA10TemFilhos — Já têm filhos?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já temos filhos" },
  { valor: "nao", label: "Não", desc: "Ainda não temos filhos" }
];

export default function StepA10TemFilhos({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.temFilhos;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Tem filhos" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já têm filhos?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepA10TemFilhos.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA10TemFilhos };
EOF

# ============================================================
# 5. StepA11TemAnimais - corrige map
cat > components/memorial/steps/StepA11TemAnimais.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepA11TemAnimais.jsx
 * ========================================== */\n
// StepA11TemAnimais — Há animais de estimação?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Temos pets em casa" },
  { valor: "nao", label: "Não", desc: "Não temos animais" }
];

export default function StepA11TemAnimais({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.temAnimais;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Animais de estimação" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Há animais de estimação?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepA11TemAnimais.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA11TemAnimais };
EOF

# ============================================================
# 6. StepA12GostamDeFazer - corrige map e adiciona termos? (não usa termos)
cat > components/memorial/steps/StepA12GostamDeFazer.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepA12GostamDeFazer.jsx
 * ========================================== */\n
// StepA12GostamDeFazer — O que gostam de fazer juntos?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "viajar", label: "Viajar", desc: "Explorar novos lugares" },
  { valor: "cozinhar", label: "Cozinhar", desc: "Criar receitas juntos" },
  { valor: "esportes", label: "Esportes", desc: "Atividades físicas" },
  { valor: "arte", label: "Arte", desc: "Museus, teatro, cinema" },
  { valor: "musica", label: "Música", desc: "Shows e festivais" },
  { valor: "natureza", label: "Natureza", desc: "Trilhas, praia, camping" },
  { valor: "tecnologia", label: "Tecnologia", desc: "Games, gadgets, inovação" },
  { valor: "outros", label: "Outros", desc: "Outras atividades" }
];

export default function StepA12GostamDeFazer({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const [selecionadas, setSelecionadas] = useState(estadoAtual?.gostamDeFazer || []);

  const toggle = (valor) => {
    if (selecionadas.includes(valor)) {
      setSelecionadas(selecionadas.filter((v) => v !== valor));
    } else {
      setSelecionadas([...selecionadas, valor]);
    }
  };

  const handleConfirmar = () => {
    onSelect('gostamDeFazer', selecionadas);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        O que gostam de fazer juntos?
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Selecione todas as opções que combinam com vocês.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionadas.includes(o.valor);
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => toggle(o.valor)} role="checkbox" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(o.valor); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <button
        aria-label="Confirmar resposta" onClick={handleConfirmar}
        disabled={selecionadas.length === 0}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: selecionadas.length > 0 ? 'var(--color-brand)' : 'var(--color-border)',
          color: selecionadas.length > 0 ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: selecionadas.length > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

StepA12GostamDeFazer.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA12GostamDeFazer };
EOF

# ============================================================
# 7. StepA13PersonalidadeNoivo - corrige map
cat > components/memorial/steps/StepA13PersonalidadeNoivo.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepA13PersonalidadeNoivo.jsx
 * ========================================== */\n
// StepA13PersonalidadeNoivo — Personalidade da pessoa 2
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "extrovertido", label: "Extrovertido", desc: "Energia contagiante" },
  { valor: "introvertido", label: "Introvertido", desc: "Prefere intimidade" },
  { valor: "pratico", label: "Prático", desc: "Focado em resultados" },
  { valor: "sonhador", label: "Sonhador", desc: "Criativo e idealista" },
  { valor: "organizado", label: "Organizado", desc: "Planejador nato" },
  { valor: "despojado", label: "Despojado", desc: "Leve e espontâneo" }
];

export default function StepA13PersonalidadeNoivo({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.personalidadeNoivo;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Personalidade da pessoa 2" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Personalidade da pessoa 2
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepA13PersonalidadeNoivo.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA13PersonalidadeNoivo };
EOF

# ============================================================
# 8. StepA14PersonalidadeNoiva - corrige map
cat > components/memorial/steps/StepA14PersonalidadeNoiva.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepA14PersonalidadeNoiva.jsx
 * ========================================== */\n
// StepA14PersonalidadeNoiva — Personalidade da pessoa 1
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "extrovertido", label: "Extrovertida", desc: "Energia contagiante" },
  { valor: "introvertido", label: "Introvertida", desc: "Prefere intimidade" },
  { valor: "pratico", label: "Prática", desc: "Focada em resultados" },
  { valor: "sonhador", label: "Sonhadora", desc: "Criativa e idealista" },
  { valor: "organizado", label: "Organizada", desc: "Planejadora nato" },
  { valor: "despojado", label: "Despojada", desc: "Leve e espontânea" }
];

export default function StepA14PersonalidadeNoiva({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.personalidadeNoiva;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Personalidade da pessoa 1" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Personalidade da pessoa 1
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepA14PersonalidadeNoiva.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA14PersonalidadeNoiva };
EOF

# ============================================================
# 9. StepA9ComoSeConheceram - corrige map
cat > components/memorial/steps/StepA9ComoSeConheceram.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepA9ComoSeConheceram.jsx
 * ========================================== */\n
// StepA9ComoSeConheceram — Como se conheceram?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "trabalho", label: "Trabalho", desc: "No ambiente profissional" },
  { valor: "faculdade", label: "Faculdade", desc: "Na vida acadêmica" },
  { valor: "amigos", label: "Amigos", desc: "Por amigos em comum" },
  { valor: "familia", label: "Família", desc: "Conhecidos da família" },
  { valor: "app", label: "App", desc: "Aplicativo de relacionamento" },
  { valor: "viagem", label: "Viagem", desc: "Em uma viagem" },
  { valor: "outros", label: "Outros", desc: "Outra história especial" }
];

export default function StepA9ComoSeConheceram({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.comoSeConheceram;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Como se conheceram" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Como se conheceram?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepA9ComoSeConheceram.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA9ComoSeConheceram };
EOF

# ============================================================
# 10. StepA8MoramJuntos - corrige map
cat > components/memorial/steps/StepA8MoramJuntos.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepA8MoramJuntos.jsx
 * ========================================== */\n
// StepA8MoramJuntos — Já moram juntos?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já dividimos o mesmo lar" },
  { valor: "nao", label: "Não", desc: "Ainda moramos separados" }
];

export default function StepA8MoramJuntos({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.moramJuntos;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Moram juntos" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já moram juntos?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepA8MoramJuntos.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA8MoramJuntos };
EOF

# ============================================================
# 11. StepB10EscolheuPadre - corrige map
cat > components/memorial/steps/StepB10EscolheuPadre.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB10EscolheuPadre.jsx
 * ========================================== */\n
// StepB10EscolheuPadre — Já escolheu padre/paróquia?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já escolhi o padre e a paróquia" },
  { valor: "nao", label: "Não", desc: "Ainda não escolhi" }
];

export default function StepB10EscolheuPadre({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.escolheuPadre;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Padre/paróquia escolhido" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já escolheu padre/paróquia?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB10EscolheuPadre.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB10EscolheuPadre };
EOF

# ============================================================
# 12. StepB11ReservouTemplo - corrige map
cat > components/memorial/steps/StepB11ReservouTemplo.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB11ReservouTemplo.jsx
 * ========================================== */\n
// StepB11ReservouTemplo — Já reservou data no templo?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já reservei a data no templo" },
  { valor: "nao", label: "Não", desc: "Ainda não reservei" }
];

export default function StepB11ReservouTemplo({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.reservouTemplo;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Reserva do templo" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já reservou data no templo?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB11ReservouTemplo.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB11ReservouTemplo };
EOF

# ============================================================
# 13. StepB12DefiniuChupa - corrige map
cat > components/memorial/steps/StepB12DefiniuChupa.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB12DefiniuChupa.jsx
 * ========================================== */\n
// StepB12DefiniuChupa — Já definiu se haverá chupá?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Quero ter chupá na cerimônia" },
  { valor: "nao", label: "Não", desc: "Não teremos chupá" }
];

export default function StepB12DefiniuChupa({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.definiuChupa;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Chupá definido" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já definiu se haverá chupá?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB12DefiniuChupa.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB12DefiniuChupa };
EOF

# ============================================================
# 14. StepB13EscolheuCelebrante - corrige map
cat > components/memorial/steps/StepB13EscolheuCelebrante.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB13EscolheuCelebrante.jsx
 * ========================================== */\n
// StepB13EscolheuCelebrante — Já escolheu celebrante laico?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já escolhi o celebrante" },
  { valor: "nao", label: "Não", desc: "Ainda não escolhi" }
];

export default function StepB13EscolheuCelebrante({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.escolheuCelebrante;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Celebrante laico escolhido" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já escolheu celebrante laico?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB13EscolheuCelebrante.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB13EscolheuCelebrante };
EOF

# ============================================================
# 15. StepB14AgendouCartorio - corrige map
cat > components/memorial/steps/StepB14AgendouCartorio.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB14AgendouCartorio.jsx
 * ========================================== */\n
// StepB14AgendouCartorio — Já agendou no cartório?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já agendei a data no cartório" },
  { valor: "nao", label: "Não", desc: "Ainda não agendei" }
];

export default function StepB14AgendouCartorio({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.agendouCartorio;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Agendamento no cartório" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já agendou no cartório?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB14AgendouCartorio.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB14AgendouCartorio };
EOF

# ============================================================
# 16. StepB15PadrinhosEscolhidos - corrige map
cat > components/memorial/steps/StepB15PadrinhosEscolhidos.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB15PadrinhosEscolhidos.jsx
 * ========================================== */\n
// StepB15PadrinhosEscolhidos — Já escolheu padrinhos para a cerimônia?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já escolhi os padrinhos" },
  { valor: "nao", label: "Não", desc: "Ainda não escolhi" }
];

export default function StepB15PadrinhosEscolhidos({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.padrinhosEscolhidosCerimonia;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Padrinhos escolhidos" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já escolheu padrinhos para a cerimônia?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB15PadrinhosEscolhidos.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB15PadrinhosEscolhidos };
EOF

# ============================================================
# 17. StepB17MusicosCerimonia - corrige map
cat > components/memorial/steps/StepB17MusicosCerimonia.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB17MusicosCerimonia.jsx
 * ========================================== */\n
// StepB17MusicosCerimonia — Já definiu músicos da cerimônia?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "coral", label: "Coral", desc: "Coral para a cerimônia" },
  { valor: "quarteto", label: "Quarteto", desc: "Quarteto de cordas" },
  { valor: "violonista", label: "Violonista", desc: "Solo de violão/violino" },
  { valor: "playlist", label: "Playlist", desc: "Música gravada" },
  { valor: "a_definir", label: "A definir", desc: "Ainda não decidi" }
];

export default function StepB17MusicosCerimonia({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.musicosCerimonia;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Músicos da cerimônia" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já definiu músicos da cerimônia?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB17MusicosCerimonia.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB17MusicosCerimonia };
EOF

# ============================================================
# 18. StepB18CertidaoBatismo - corrige map
cat > components/memorial/steps/StepB18CertidaoBatismo.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB18CertidaoBatismo.jsx
 * ========================================== */\n
// StepB18CertidaoBatismo — Certidão de batismo atualizada?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Tenho certidão com menos de 3 meses" },
  { valor: "nao", label: "Não", desc: "Preciso solicitar atualização" }
];

export default function StepB18CertidaoBatismo({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.certidaoBatismo;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Certidão de batismo" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Certidão de batismo atualizada?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB18CertidaoBatismo.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB18CertidaoBatismo };
EOF

# ============================================================
# 19. StepB8ReservouIgreja - corrige map
cat > components/memorial/steps/StepB8ReservouIgreja.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB8ReservouIgreja.jsx
 * ========================================== */\n
// StepB8ReservouIgreja — Já reservou a igreja/templo/cartório?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já reservei o local" },
  { valor: "nao", label: "Não", desc: "Ainda não reservei" }
];

export default function StepB8ReservouIgreja({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.reservouIgreja;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Reserva do local da cerimônia" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já reservou a igreja/templo/cartório?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB8ReservouIgreja.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB8ReservouIgreja };
EOF

# ============================================================
# 20. StepB9CursoNoivos - corrige map (e já tem termos)
cat > components/memorial/steps/StepB9CursoNoivos.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepB9CursoNoivos.jsx
 * ========================================== */\n
// StepB9CursoNoivos — {`Já fez curso de ${termos.pessoa1} e ${termos.pessoa2}?`}
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { getTermos } from '../../../utils/linguagemCasal';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Curso concluído" },
  { valor: "em_andamento", label: "Em andamento", desc: "Estou fazendo o curso" },
  { valor: "nao_iniciado", label: "Não iniciado", desc: "Ainda não comecei" }
];

export default function StepB9CursoNoivos({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);
  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';
  const termos = getTermos(perfil);

  const selecionado = estadoAtual?.cursoNoivos;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label={`Curso de ${termos.pessoa1} e ${termos.pessoa2}`} style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        {`Já fez curso de ${termos.pessoa1} e ${termos.pessoa2}?`}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepB9CursoNoivos.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepB9CursoNoivos };
EOF

# ============================================================
# 21. StepC10VerificouMare - corrige map
cat > components/memorial/steps/StepC10VerificouMare.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepC10VerificouMare.jsx
 * ========================================== */\n
// StepC10VerificouMare — Já verificou maré e vento?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já verifiquei condições da praia" },
  { valor: "nao", label: "Não", desc: "Ainda não verifiquei" }
];

export default function StepC10VerificouMare({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.verificouMare;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Maré e vento verificados" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já verificou maré e vento?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepC10VerificouMare.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepC10VerificouMare };
EOF

# ============================================================
# 22. StepC11ListaPreliminar - corrige map
cat > components/memorial/steps/StepC11ListaPreliminar.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepC11ListaPreliminar.jsx
 * ========================================== */\n
// StepC11ListaPreliminar — Já tem lista preliminar de convidados?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já tenho uma lista inicial" },
  { valor: "nao", label: "Não", desc: "Ainda não fiz a lista" }
];

export default function StepC11ListaPreliminar({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.listaPreliminar;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Lista preliminar de convidados" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já tem lista preliminar de convidados?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepC11ListaPreliminar.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepC11ListaPreliminar };
EOF

# ============================================================
# 23. StepC13HotelIndicacao - corrige map
cat > components/memorial/steps/StepC13HotelIndicacao.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepC13HotelIndicacao.jsx
 * ========================================== */\n
// StepC13HotelIndicacao — Precisam de indicação de hotel?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Queremos indicar hotéis para os convidados" },
  { valor: "nao", label: "Não", desc: "Não precisamos de indicação" }
];

export default function StepC13HotelIndicacao({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.hotelIndicacao;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Indicação de hotel" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Precisam de indicação de hotel?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepC13HotelIndicacao.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepC13HotelIndicacao };
EOF

# ============================================================
# 24. StepC14HorarioFesta - corrige map
cat > components/memorial/steps/StepC14HorarioFesta.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepC14HorarioFesta.jsx
 * ========================================== */\n
// StepC14HorarioFesta — Qual o horário da festa?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "almoco", label: "Almoço", desc: "Celebração durante o dia" },
  { valor: "tarde", label: "Tarde", desc: "Início à tarde" },
  { valor: "noite", label: "Noite", desc: "Festa noturna" },
  { valor: "madrugada", label: "Madrugada", desc: "Até de madrugada" }
];

export default function StepC14HorarioFesta({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.horarioFesta;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Horário da festa" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Qual o horário da festa?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepC14HorarioFesta.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepC14HorarioFesta };
EOF

# ============================================================
# 25. StepC15DuracaoCoquetel - corrige map
cat > components/memorial/steps/StepC15DuracaoCoquetel.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepC15DuracaoCoquetel.jsx
 * ========================================== */\n
// StepC15DuracaoCoquetel — Qual a duração do coquetel?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "30min", label: "30 minutos", desc: "Coquetel rápido" },
  { valor: "1h", label: "1 hora", desc: "Coquetel padrão" },
  { valor: "mais", label: "Mais de 1h", desc: "Coquetel estendido" }
];

export default function StepC15DuracaoCoquetel({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.duracaoCoquetel;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Duração do coquetel" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Qual a duração do coquetel?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepC15DuracaoCoquetel.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepC15DuracaoCoquetel };
EOF

# ============================================================
# 26. StepC8ReservouLocalCerimonia - corrige map
cat > components/memorial/steps/StepC8ReservouLocalCerimonia.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepC8ReservouLocalCerimonia.jsx
 * ========================================== */\n
// StepC8ReservouLocalCerimonia — Já reservou o local da cerimônia?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já reservei o local da cerimônia" },
  { valor: "nao", label: "Não", desc: "Ainda não reservei" }
];

export default function StepC8ReservouLocalCerimonia({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.reservouLocalCerimonia;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Reserva do local da cerimônia" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já reservou o local da cerimônia?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepC8ReservouLocalCerimonia.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepC8ReservouLocalCerimonia };
EOF

# ============================================================
# 27. StepC9ReservouLocalFesta - corrige map
cat > components/memorial/steps/StepC9ReservouLocalFesta.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepC9ReservouLocalFesta.jsx
 * ========================================== */\n
// StepC9ReservouLocalFesta — Já reservou o local da festa?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já reservei o local da festa" },
  { valor: "nao", label: "Não", desc: "Ainda não reservei" },
  { valor: "mesmo", label: "É o mesmo", desc: "Cerimônia e festa no mesmo local" }
];

export default function StepC9ReservouLocalFesta({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.reservouLocalFesta;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Reserva do local da festa" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já reservou o local da festa?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepC9ReservouLocalFesta.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepC9ReservouLocalFesta };
EOF

# ============================================================
# 28. StepD10VestidoContratado - corrige map
cat > components/memorial/steps/StepD10VestidoContratado.jsx <<'EOF'
/* ==========================================
 * ARQUIVO: components/memorial/steps/StepD10VestidoContratado.jsx
 * ========================================== */\n
// StepD10VestidoContratado — Já contratou vestido/atelier?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Já tenho atelier" },
  { valor: "nao", label: "Não", desc: "Ainda não contratei" }
];

export default function StepD10VestidoContratado({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);

  const selecionado = estadoAtual?.vestidoContratado;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Vestido contratado" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Já contratou vestido/atelier?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
                  {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepD10VestidoContratado.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepD10VestidoContratado };
EOF

# ============================================================
# 29.