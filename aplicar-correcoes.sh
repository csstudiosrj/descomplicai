#!/bin/bash
# Aplicar correções — rodar na raiz do projeto no IDX
# bash aplicar-correcoes.sh

set -e

echo ">>> 1/3 Footer.jsx — remove Planos, garante Para profissionais"
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

echo ">>> 2/3 linguagemCasal.js — pessoa1/pessoa2 sem artigo embutido"
cat > utils/linguagemCasal.js << 'EOF'
// utils/linguagemCasal.js
// Adapta pronomes e termos conforme perfil do casal definido no onboarding
// Nunca hardcode "noiva/noivo" — sempre usar este utilitário

const PERFIL_MAP = {
  'noiva-noivo': {
    casal: 'os noivos',
    casalCap: 'Os noivos',
    pessoa1: 'noiva',
    pessoa2: 'noivo',
    pessoa1ComArtigo: 'a noiva',
    pessoa2ComArtigo: 'o noivo',
    pessoa1Cap: 'Noiva',
    pessoa2Cap: 'Noivo',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'os',
    artigoCap: 'Os',
    chamada: 'noivos',
    chamadaCap: 'Noivos',
    genero1: 'feminino',
    genero2: 'masculino',
  },
  'duas-noivas': {
    casal: 'as noivas',
    casalCap: 'As noivas',
    pessoa1: 'primeira noiva',
    pessoa2: 'segunda noiva',
    pessoa1ComArtigo: 'a primeira noiva',
    pessoa2ComArtigo: 'a segunda noiva',
    pessoa1Cap: 'Primeira Noiva',
    pessoa2Cap: 'Segunda Noiva',
    pronome: 'elas',
    pronomeCap: 'Elas',
    possessivo: 'delas',
    artigo: 'as',
    artigoCap: 'As',
    chamada: 'noivas',
    chamadaCap: 'Noivas',
    genero1: 'feminino',
    genero2: 'feminino',
  },
  'dois-noivos': {
    casal: 'os noivos',
    casalCap: 'Os noivos',
    pessoa1: 'primeiro noivo',
    pessoa2: 'segundo noivo',
    pessoa1ComArtigo: 'o primeiro noivo',
    pessoa2ComArtigo: 'o segundo noivo',
    pessoa1Cap: 'Primeiro Noivo',
    pessoa2Cap: 'Segundo Noivo',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'os',
    artigoCap: 'Os',
    chamada: 'noivos',
    chamadaCap: 'Noivos',
    genero1: 'masculino',
    genero2: 'masculino',
  },
  'nao-especificar': {
    casal: 'o casal',
    casalCap: 'O casal',
    pessoa1: 'primeira pessoa',
    pessoa2: 'segunda pessoa',
    pessoa1ComArtigo: 'a primeira pessoa',
    pessoa2ComArtigo: 'a segunda pessoa',
    pessoa1Cap: 'Primeira Pessoa',
    pessoa2Cap: 'Segunda Pessoa',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'o',
    artigoCap: 'O',
    chamada: 'noivos',
    chamadaCap: 'Noivos',
    genero1: 'neutro',
    genero2: 'neutro',
  },
};

/**
 * Retorna termos adaptados conforme perfil do casal.
 * @param {string} perfilCasal - valor salvo no estado (ex: 'noiva-noivo', 'duas-noivas')
 * @returns {Object} termos linguísticos
 */
export function getTermos(perfilCasal) {
  return PERFIL_MAP[perfilCasal] || PERFIL_MAP['nao-especificar'];
}

/**
 * Retorna termo específico ou fallback neutro.
 * @param {string} perfilCasal
 * @param {string} chave - ex: 'casal', 'pessoa1', 'pronome'
 * @returns {string}
 */
export function termo(perfilCasal, chave) {
  const t = getTermos(perfilCasal);
  return t[chave] || t['casal'];
}

/**
 * Adapta uma frase com placeholders.
 * Ex: adaptarFrase('Quem são {casal}?', 'duas-noivas') → 'Quem são as noivas?'
 * @param {string} frase - com placeholders entre {chave}
 * @param {string} perfilCasal
 * @returns {string}
 */
export function adaptarFrase(frase, perfilCasal) {
  const t = getTermos(perfilCasal);
  return frase.replace(/\{(\w+)\}/g, (_, chave) => t[chave] || `{${chave}}`);
}

export default { getTermos, termo, adaptarFrase };
EOF

echo ">>> 3/3 Step00Casal.jsx — labels estáticos, sem dependência de termos"
cat > components/memorial/steps/Step00Casal.jsx << 'EOF'
// Etapa 0 do memorial — coleta dos dados do casal (perfil)
// Título SEMPRE neutro: a resposta do perfil é a própria pergunta

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';

export default function Step00Casal({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);
  const OPCOES = [
    { valor: 'noiva-noivo', label: 'Noiva e Noivo', icone: 'heart', cor: 'var(--color-info-light)' },
    { valor: 'duas-noivas', label: 'Duas Noivas', icone: 'users', cor: 'var(--color-brand-lighter)' },
    { valor: 'dois-noivos', label: 'Dois Noivos', icone: 'users', cor: 'var(--color-brand-lighter)' },
    { valor: 'nao-especificar', label: 'Prefiro não especificar', icone: 'heart', cor: 'var(--color-info-light)' },
  ];

  const selecionado = estadoAtual?.perfilCasal;

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
    <div
      role="radiogroup"
      aria-label="Quem está se casando?"
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Quem está se casando?
        </h1>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: 'var(--space-4)',
        }}
      >
        {OPCOES.map((opcao) => {
          const isSelected = selecionado === opcao.valor;
          return (
            <div
              key={opcao.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === opcao.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === opcao.valor ? `0 0 0 3px ${opcao.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card
                key={opcao.valor}
                interactive
                selected={isSelected}
                padding="md"
                onClick={() => handleCardClick(opcao)}
                role="radio"
                aria-checked={isSelected}
                aria-label={opcao.label}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect('perfilCasal', opcao.valor, opcao.cor);
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isSelected ? opcao.cor : 'var(--color-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? 'var(--color-brand)' : 'var(--color-text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={opcao.icone} size={24} ariaHidden={true} />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {opcao.label}
                  </span>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Step00Casal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step00Casal };
EOF

echo ""
echo "Concluído. Arquivos alterados:"
echo "  components/ui/Footer.jsx"
echo "  utils/linguagemCasal.js"
echo "  components/memorial/steps/Step00Casal.jsx"