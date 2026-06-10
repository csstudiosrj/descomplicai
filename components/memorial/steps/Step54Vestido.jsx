// Bloco J — Vestuário e beleza: traje, atelier, acessórios, maquiagem/cabelo, padronização
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { sugerirVestido } from '../../../utils/sugestoes';
import useEtapaInterna from '../../../hooks/useEtapaInterna';

const CHAVES_ETAPA = ['estiloVestido', 'padronizarMadrinhas'];

// Descrições para todos os estilos de vestido possíveis (referência para as sugestões)
const DESCRICOES_VESTIDO = {
  'Cauda longa': 'Vestido com cauda longa e imponente, clássico e elegante.',
  'Renda francesa': 'Renda delicada e trabalhada, tradicionalmente usada em vestidos de noiva.',
  'Cetim estruturado': 'Tecido nobre com caimento pesado, modelagem princesa ou evasê.',
  'Renda boho': 'Renda mais solta e fluida, com mangas ou decote em V.',
  'Cauda leve': 'Cauda curta ou removível, ideal para casamentos ao ar livre.',
  'Tule natural': 'Tule macio e esvoaçante, com ar romântico e leve.',
  'Vestido fluido em crepe': 'Tecido leve e solto, sem muitos volumes, moderno e confortável.',
  'Detalhes em franja': 'Franjas aplicadas na saia ou mangas, com movimento e estilo boho.',
  'Corte reto minimalista': 'Silhueta reta e clean, sem muitos detalhes, elegante na simplicidade.',
  'Cetim pesado': 'Cetim encorpado com brilho sutil, modelagem arquitetônica.',
  'Decote arquitetônico': 'Decote estruturado e moderno, com linhas geométricas.',
  'Corte clean em crepe': 'Crepe de seda ou poliéster com corte impecável, sem rendas.',
  'Sem renda': 'Visual totalmente liso, com foco na modelagem e no caimento.',
  'Silhueta minimalista': 'Forma simples e elegante, com poucos detalhes visíveis.',
  'Vestido em renda escura': 'Renda preta ou vinho para casamentos góticos ou noturnos.',
  'Couro sintético': 'Toque moderno e ousado, para noivas que querem fugir do tradicional.',
  'Detalhes em metal': 'Aplicações metálicas (prata, ouro) no corpete ou saia.',
  'Vestido leve em chiffon': 'Chiffon esvoaçante, ideal para casamentos tropicais ou na praia.',
  'Detalhes em renda floral': 'Renda com motivos florais, combinando com a temática tropical.',
  'Princesa com saia volumosa': 'Corpete ajustado e saia ampla, o clássico vestido de princesa.',
  'Renda de chantilly': 'Renda finíssima e delicada, típica de vestidos românticos.',
  'Vestido escuro em renda': 'Renda preta ou bordô, para um visual dramático e gótico.',
  'Detalhes em veludo': 'Veludo no corpete ou nas mangas, luxuoso e quente.',
  'Cauda dramática': 'Cauda exageradamente longa, para uma entrada impactante.',
  'Renda vintage': 'Renda de inspiração antiga, com mangas bufantes ou gola alta.',
  'Detalhes em pérolas': 'Pérolas bordadas no vestido, acessório clássico e delicado.',
  'Terno slim': 'Terno de corte ajustado, moderno e elegante.',
  'Smoking moderno': 'Smoking com lapela de cetim, ideal para casamentos noturnos.',
  'Traje de linho (se praia)': 'Linho leve e natural, perfeito para casamentos na praia ou diurnos.',
  'Vestido complementar para segunda noiva': 'Modelagem que harmoniza com o vestido principal, podendo ser da mesma cor ou tecido.',
};

// Acessórios com descrições
const ACESSORIOS = [
  { nome: 'Véu', desc: 'Tecido leve preso ao cabelo, pode ser curto, médio ou longo (catedral).' },
  { nome: 'Tiara', desc: 'Arco ou coroa decorativa presa na cabeça, com pedras ou flores.' },
  { nome: 'Brincos statement', desc: 'Brincos grandes e chamativos que complementam o look.' },
  { nome: 'Pulseira', desc: 'Joia delicada ou marcante para o pulso.' },
  { nome: 'Anel de noivado visível', desc: 'Destaque para o anel, muitas vezes com manicure impecável.' },
  { nome: 'Sapato especial', desc: 'Salto, rasteira ou tênis personalizado — conforto e estilo.' },
  { nome: 'Jaqueta/capa', desc: 'Sobreposição para entrada ou saída, em renda, couro ou cetim.' },
];

// Maquiagens com descrições
const MAQUIAGENS = [
  { nome: 'Natural / No makeup', desc: 'Pele leve, quase sem base, realçando a beleza natural.' },
  { nome: 'Glow', desc: 'Pele iluminada, aspecto saudável e radiante, com blush e iluminador.' },
  { nome: 'Clássica', desc: 'Olhos marcados com delineado, batom neutro ou vermelho, elegante.' },
  { nome: 'Glam', desc: 'Olhos esfumados, cílios postiços, contorno marcado, bem produzida.' },
  { nome: 'Dramática', desc: 'Smoky eyes escuro, lábios escuros, visual impactante.' },
  { nome: 'Ainda não sei', desc: 'Vou decidir mais tarde com um profissional.' },
];

// Cabelos com descrições
const CABELOS = [
  { nome: 'Preso clássico', desc: 'Coque alto ou baixo, bem estruturado, com fios presos.' },
  { nome: 'Semi-preso', desc: 'Parte do cabelo preso atrás, o restante solto, romântico.' },
  { nome: 'Solto com ondas', desc: 'Cabelo solto com ondas suaves, natural e solto.' },
  { nome: 'Coque baixo', desc: 'Coque na nuca, elegante e discreto, combina com véu.' },
  { nome: 'Coque alto', desc: 'Coque no topo da cabeça, moderno e alonga a silhueta.' },
  { nome: 'Trança', desc: 'Trança embutida, lateral ou coroa, boho e delicado.' },
  { nome: 'Ainda não sei', desc: 'Vou decidir mais tarde com um profissional.' },
];

export default function Step54Vestido({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo || 'classico';
  const perfil = estadoAtual?.perfilCasal || 'noiva-noivo';
  const { etapa: etapaInterna, avancar: avancar, storageKey } = useEtapaInterna(
    estadoAtual,
    CHAVES_ETAPA,
    'J'
  );

  // Sugestões dinâmicas vindas do arquivo de sugestões
  const opcoesVestido = useMemo(() => {
    const sugestoes = sugerirVestido(estilo, perfil);
    // Garante que retornamos um array, mesmo se for string única
    return Array.isArray(sugestoes) ? sugestoes : [sugestoes];
  }, [estilo, perfil]);

  const [dados, setDados] = useState({
    estiloVestido: estadoAtual?.estiloVestido || '',
    atelierContratado: estadoAtual?.atelierContratado ?? null,
    atelierNome: estadoAtual?.atelierNome || '',
    acessorios: estadoAtual?.acessorios || [],
    estiloMaquiagem: estadoAtual?.estiloMaquiagem || '',
    estiloCabelo: estadoAtual?.estiloCabelo || '',
    profissionalBeleza: estadoAtual?.profissionalBeleza ?? null,
    padronizarMadrinhas: estadoAtual?.padronizarMadrinhas ?? null,
    padronizarPadrinhos: estadoAtual?.padronizarPadrinhos ?? null,
  });

  const mostrarBeleza = perfil !== 'dois-noivos';

  const toggleArray = (field, val) => {
    setDados(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(x => x !== val) : [...prev[field], val]
    }));
  };

  const confirmar = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
    const atelierFinal = dados.atelierContratado === true ? dados.atelierNome : '';
    onSelect('atelierContratado', atelierFinal);
    Object.entries(dados).forEach(([k, v]) => {
      if (!['atelierContratado', 'atelierNome'].includes(k)) {
        onSelect(k, v);
      }
    });
  };

  const renderOpcoesComDescricao = (lista, campo) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {lista.map(op => {
        const isSelected = dados[campo] === op.nome;
        return (
          <button
            key={op.nome}
            onClick={() => setDados(p => ({ ...p, [campo]: op.nome }))}
            style={{
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
              background: isSelected ? 'var(--color-brand-lighter)' : 'var(--color-white)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              width: '100%',
            }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '22px',
              height: '22px',
              borderRadius: 'var(--radius-sm)',
              border: isSelected ? '2px solid var(--color-brand)' : '2px solid var(--color-border)',
              background: isSelected ? 'var(--color-brand)' : 'transparent',
              color: isSelected ? 'var(--color-white)' : 'transparent',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-bold)',
              marginTop: '1px',
            }} aria-hidden="true">
              {isSelected ? '✓' : ''}
            </span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: isSelected ? 'var(--font-semibold)' : 'var(--font-normal)', marginBottom: 'var(--space-1)' }}>
                {op.nome}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                {op.desc}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const etapas = [
    // J1-J3: Traje, atelier, acessórios
    <div key="j1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Vestuário e acessórios</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
          Estilo do traje principal
        </label>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Sugerimos: {opcoesVestido.join(', ')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {opcoesVestido.map(nome => {
            const isSelected = dados.estiloVestido === nome;
            const descricao = DESCRICOES_VESTIDO[nome] || '';
            return (
              <button
                key={nome}
                onClick={() => setDados(p => ({ ...p, estiloVestido: nome }))}
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-brand-lighter)' : 'var(--color-white)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  width: '100%',
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '22px',
                  height: '22px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '2px solid var(--color-brand)' : '2px solid var(--color-border)',
                  background: isSelected ? 'var(--color-brand)' : 'transparent',
                  color: isSelected ? 'var(--color-white)' : 'transparent',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-bold)',
                  marginTop: '1px',
                }} aria-hidden="true">
                  {isSelected ? '✓' : ''}
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: isSelected ? 'var(--font-semibold)' : 'var(--font-normal)', marginBottom: 'var(--space-1)' }}>
                    {nome}
                  </div>
                  {descricao && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                      {descricao}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Atelier: pergunta de sim/não com campo de texto condicional */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
          Já tem atelier ou estilista em mente?
        </label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.atelierContratado === o.v} padding="md" onClick={() => setDados(p => ({ ...p, atelierContratado: o.v, atelierNome: o.v ? p.atelierNome : '' }))} role="radio" aria-checked={dados.atelierContratado === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
        {dados.atelierContratado === true && (
          <input
            type="text"
            value={dados.atelierNome}
            onChange={(e) => setDados(p => ({ ...p, atelierNome: e.target.value }))}
            placeholder="Nome do atelier ou estilista"
            style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              outline: 'none',
            }}
          />
        )}
      </div>

      {/* Acessórios com descrições */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
          Acessórios
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {ACESSORIOS.map(ac => {
            const isSelected = dados.acessorios.includes(ac.nome);
            return (
              <button
                key={ac.nome}
                onClick={() => toggleArray('acessorios', ac.nome)}
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-brand-lighter)' : 'var(--color-white)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  width: '100%',
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '22px',
                  height: '22px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '2px solid var(--color-brand)' : '2px solid var(--color-border)',
                  background: isSelected ? 'var(--color-brand)' : 'transparent',
                  color: isSelected ? 'var(--color-white)' : 'transparent',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-bold)',
                  marginTop: '1px',
                }} aria-hidden="true">
                  {isSelected ? '✓' : ''}
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: isSelected ? 'var(--font-semibold)' : 'var(--font-normal)', marginBottom: 'var(--space-1)' }}>
                    {ac.nome}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                    {ac.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <ButtonAvancar onClick={avancar} disabled={!dados.estiloVestido || dados.atelierContratado === null} />
    </div>,

    // J4-J6: Beleza e padronização
    <div key="j4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Beleza e padronização</h2>
      
      {mostrarBeleza && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
              Estilo de maquiagem
            </label>
            {renderOpcoesComDescricao(MAQUIAGENS, 'estiloMaquiagem')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
              Estilo de cabelo
            </label>
            {renderOpcoesComDescricao(CABELOS, 'estiloCabelo')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
              Profissional de beleza contratado?
            </label>
            {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
              <Card key={String(o.v)} interactive selected={dados.profissionalBeleza === o.v} padding="md" onClick={() => setDados(p => ({ ...p, profissionalBeleza: o.v }))} role="radio" aria-checked={dados.profissionalBeleza === o.v}>
                <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
              </Card>
            ))}
          </div>
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Padronizar look das madrinhas?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.padronizarMadrinhas === o.v} padding="md" onClick={() => setDados(p => ({ ...p, padronizarMadrinhas: o.v }))} role="radio" aria-checked={dados.padronizarMadrinhas === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Padronizar look dos padrinhos?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.padronizarPadrinhos === o.v} padding="md" onClick={() => setDados(p => ({ ...p, padronizarPadrinhos: o.v }))} role="radio" aria-checked={dados.padronizarPadrinhos === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      <ButtonAvancar onClick={confirmar} disabled={dados.padronizarMadrinhas === null || dados.padronizarPadrinhos === null || (mostrarBeleza && (!dados.estiloMaquiagem || !dados.estiloCabelo || dados.profissionalBeleza === null))} />
    </div>
  ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {etapas[etapaInterna] || etapas[etapas.length - 1]}
    </div>
  );
}

function ButtonAvancar({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        alignSelf: 'flex-start',
        padding: 'var(--space-3) var(--space-6)',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        backgroundColor: disabled ? 'var(--color-border)' : 'var(--color-brand)',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-white)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-medium)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      Confirmar
    </button>
  );
}

Step54Vestido.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step54Vestido };