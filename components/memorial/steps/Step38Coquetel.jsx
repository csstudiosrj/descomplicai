// Bloco H — Recepção: coquetel, jantar, bolo, bar, música, lembrancinhas, kit saída
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { sugerirBolo } from '../../../utils/sugestoes';
import useEtapaInterna from '../../../hooks/useEtapaInterna';

const CHAVES_ETAPA = ['tipoJantar', 'tipoBar', 'musicaFesta'];

const TIPOS_JANTAR = [
  { valor: 'Buffet livre', desc: 'Os convidados se servem em ilhas de comida, com maior variedade e flexibilidade.' },
  { valor: 'Jantar empratado', desc: 'Refeição servida no prato, com entrada, prato principal e sobremesa.' },
  { valor: 'Estações gastronômicas', desc: 'Ilhas temáticas (massas, grelhados, risotos) espalhadas pelo salão.' },
  { valor: 'Coquetel estendido', desc: 'Apenas finger foods e canapés servidos durante toda a festa, sem jantar formal.' },
  { valor: 'Food trucks', desc: 'Carrinhos de comida gourmet estacionados no local, com opções variadas.' },
  { valor: 'Ainda não sei', desc: 'Vou decidir mais tarde.' },
];

const TIPOS_BAR = [
  { valor: 'Open bar completo', desc: 'Todas as bebidas liberadas: cerveja, vinho, destilados, refrigerantes e água.' },
  { valor: 'Open bar limitado', desc: 'Cerveja, espumante, refrigerantes e água. Sem destilados.' },
  { valor: 'Apenas espumante', desc: 'Somente espumante para o brinde, refrigerantes e água.' },
  { valor: 'Sem álcool', desc: 'Coquetéis não alcoólicos, sucos, refrigerantes e água.' },
  { valor: 'Bar de drinks autorais', desc: 'Bartender cria coquetéis exclusivos para os noivos e convidados.' },
  { valor: 'Ainda não sei', desc: 'Vou decidir mais tarde.' },
];

const DURACOES_COQUETEL = [
  { valor: '30 min', desc: 'Rápido, ideal para casamentos diurnos ou com jantar logo em seguida.' },
  { valor: '1h', desc: 'Tempo padrão, permite que os convidados cheguem e socializem.' },
  { valor: '1h30', desc: 'Para eventos maiores, com mais opções de aperitivos.' },
  { valor: 'Open bar completo', desc: 'Com bebidas liberadas durante o coquetel.' },
  { valor: 'Aperitivos apenas', desc: 'Sem bebidas alcoólicas, apenas finger foods.' },
];

const RESTRICOES_COMUNS = [
  'Vegetariano',
  'Vegano',
  'Intolerância a lactose',
  'Intolerância a glúten',
  'Alergia a nozes',
  'Alergia a frutos do mar',
  'Kosher',
  'Halal',
  'Nenhuma restrição',
];

const ESTILOS_MUSICA = ['Sertanejo', 'Funk', 'Pop', 'Rock', 'Eletrônica', 'Samba/Pagode', 'Jazz', 'MPB', 'Forró'];
const ATIVIDADES = ['Cabine de fotos', 'DJ', 'Banda ao vivo', 'Fogos de artifício', 'Lanternas de papel', 'Dança surpresa', 'Jogos/Quiz'];
const ITENS_KIT = ['Chinelos', 'Lanche da madrugada', 'Água/energético', 'Protetor solar', 'Lenços de papel', 'Doces'];

const SABORES_BOLO = {
  classico: [
    'Bolo branco com buttercream',
    'Bolo de nozes com chantilly',
    'Bolo de baunilha com frutas vermelhas',
    'Bolo de amêndoas com doce de leite',
  ],
  rustico: [
    'Naked cake com frutas',
    'Bolo de cenoura com chocolate',
    'Bolo de mel com especiarias',
    'Bolo de laranja com calda de laranja',
  ],
  boho: [
    'Bolo semi-naked com flores',
    'Bolo de lavanda com limão',
    'Bolo de coco com abacaxi',
    'Bolo de cenoura com nozes',
  ],
  moderno: [
    'Bolo geométrico com pasta americana',
    'Bolo de chocolate amargo com ganache',
    'Bolo de mármore com drip',
    'Bolo de baunilha com mousse de maracujá',
  ],
  minimalista: [
    'Bolo liso com buttercream',
    'Bolo de baunilha com recheio de frutas',
    'Bolo de iogurte com calda cítrica',
  ],
  industrial: [
    'Bolo de concreto aparente (efeito)',
    'Bolo de chocolate com caramelo salgado',
    'Bolo de baunilha com cobertura de caramelo',
  ],
  tropical: [
    'Bolo com frutas tropicais',
    'Bolo de coco com maracujá',
    'Bolo de manga com hortelã',
    'Bolo de abacaxi caramelizado',
  ],
  romantico: [
    'Bolo com rosas de buttercream',
    'Bolo de framboesa com pistache',
    'Bolo de baunilha com lavanda',
    'Bolo de morango com chantilly',
  ],
  gotico: [
    'Bolo preto com drip vermelho',
    'Bolo de chocolate com cereja',
    'Bolo de veludo vermelho',
    'Bolo de chocolate com pimenta',
  ],
  vintage: [
    'Bolo com renda de açúcar',
    'Bolo de nozes com damasco',
    'Bolo de baunilha com creme de confeiteiro',
    'Bolo de laranja com especiarias',
  ],
};

export default function Step38Coquetel({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo || 'classico';
  const { etapa: etapaInterna, avancar: avancar, storageKey } = useEtapaInterna(
    estadoAtual,
    CHAVES_ETAPA,
    'H'  // blocoId para persistência
  );
  const [dados, setDados] = useState({
    coquetel: estadoAtual?.coquetel ?? null,
    duracaoCoquetel: estadoAtual?.duracaoCoquetel || '',
    tipoJantar: estadoAtual?.tipoJantar || '',
    restricoesAlimentares: estadoAtual?.restricoesAlimentares || [],
    restricaoOutra: '',
    bolo: estadoAtual?.bolo ?? null,
    saborBolo: estadoAtual?.saborBolo || '',
    saborBoloOutro: '',
    mesaDoces: estadoAtual?.mesaDoces ?? null,
    bemCasados: estadoAtual?.bemCasados ?? null,
    tipoBar: estadoAtual?.tipoBar || '',
    bartender: estadoAtual?.bartender ?? null,
    musicaFesta: estadoAtual?.musicaFesta || '',
    estiloMusical: estadoAtual?.estiloMusical || [],
    atividadesEntretenimento: estadoAtual?.atividadesEntretenimento || [],
    lembrancinhas: estadoAtual?.lembrancinhas ?? null,
    kitSaida: estadoAtual?.kitSaida ?? null,
    itensKitSaida: estadoAtual?.itensKitSaida || [],
  });

  const opcoesBolo = useMemo(() => {
    const base = SABORES_BOLO[estilo] || SABORES_BOLO.classico;
    const sugestaoPrincipal = sugerirBolo(estilo) || base[0];
    return [sugestaoPrincipal, ...base.filter(s => s !== sugestaoPrincipal)];
  }, [estilo]);

  const toggleArray = (field, val) => {
    setDados(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(x => x !== val) : [...prev[field], val]
    }));
  };

  const handleRestricaoToggle = (r) => {
    setDados(prev => {
      let novas = [...prev.restricoesAlimentares];
      if (r === 'Nenhuma restrição') {
        novas = prev.restricoesAlimentares.includes('Nenhuma restrição') ? [] : ['Nenhuma restrição'];
      } else {
        novas = novas.filter(x => x !== 'Nenhuma restrição');
        if (novas.includes(r)) {
          novas = novas.filter(x => x !== r);
        } else {
          novas.push(r);
        }
      }
      return { ...prev, restricoesAlimentares: novas };
    });
  };

  const confirmar = () => {
    // Limpa a etapa interna do localStorage ao sair do bloco
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }

    const restricoes = dados.restricoesAlimentares.includes('Outra')
      ? [...dados.restricoesAlimentares.filter(r => r !== 'Outra'), dados.restricaoOutra].filter(Boolean)
      : dados.restricoesAlimentares;
    onSelect('restricoesAlimentares', restricoes);

    let saborFinal = dados.saborBolo;
    if (dados.saborBolo === 'Outro sabor') {
      saborFinal = dados.saborBoloOutro || '';
    }
    onSelect('saborBolo', saborFinal);

    Object.entries(dados).forEach(([k, v]) => {
      if (!['restricoesAlimentares', 'restricaoOutra', 'saborBolo', 'saborBoloOutro'].includes(k)) {
        onSelect(k, v);
      }
    });
  };

  const renderOpcoes = (lista, campo, titulo, subtitulo) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {titulo && (
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
          {titulo}
        </label>
      )}
      {subtitulo && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {subtitulo}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {lista.map(op => {
          const isSelected = dados[campo] === op.valor;
          return (
            <button
              key={op.valor}
              onClick={() => setDados(p => ({ ...p, [campo]: op.valor }))}
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
                  {op.valor}
                </div>
                {op.desc && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                    {op.desc}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const etapas = [
    // H1-H3: Coquetel, jantar, restrições
    <div key="h1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Recepção — Alimentação</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Coquetel de entrada?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.coquetel === o.v} padding="md" onClick={() => setDados(p => ({ ...p, coquetel: o.v }))} role="radio" aria-checked={dados.coquetel === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      {dados.coquetel && renderOpcoes(DURACOES_COQUETEL, 'duracaoCoquetel', 'Duração / tipo do coquetel')}

      {renderOpcoes(TIPOS_JANTAR, 'tipoJantar', 'Tipo de jantar', 'Cada estilo cria uma experiência diferente para os convidados.')}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
          Restrições alimentares dos convidados
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {RESTRICOES_COMUNS.map(r => {
            const selected = dados.restricoesAlimentares.includes(r);
            return (
              <button
                key={r}
                onClick={() => handleRestricaoToggle(r)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  border: selected ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                  background: selected ? 'var(--color-brand-lighter)' : 'var(--color-white)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                }}
              >
                {r}
              </button>
            );
          })}
          <button
            onClick={() => handleRestricaoToggle('Outra')}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              border: dados.restricoesAlimentares.includes('Outra') ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
              background: dados.restricoesAlimentares.includes('Outra') ? 'var(--color-brand-lighter)' : 'var(--color-white)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
            }}
          >
            Outra
          </button>
        </div>
        {dados.restricoesAlimentares.includes('Outra') && (
          <input
            type="text"
            value={dados.restricaoOutra}
            onChange={(e) => setDados(p => ({ ...p, restricaoOutra: e.target.value }))}
            placeholder="Descreva a restrição adicional"
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
      <ButtonAvancar onClick={avancar} disabled={dados.coquetel === null || !dados.tipoJantar} />
    </div>,

    // H4-H7: Bolo, doces, bar
    <div key="h4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Bolo, doces e bar</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Bolo</label>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Sugestão: {opcoesBolo[0]}
        </p>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.bolo === o.v} padding="md" onClick={() => setDados(p => ({ ...p, bolo: o.v }))} role="radio" aria-checked={dados.bolo === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>

      {dados.bolo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
            Escolha o sabor do bolo
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {opcoesBolo.map(sabor => {
              const isSelected = dados.saborBolo === sabor;
              return (
                <button
                  key={sabor}
                  onClick={() => setDados(p => ({ ...p, saborBolo: sabor, saborBoloOutro: '' }))}
                  style={{
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
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
                  }} aria-hidden="true">
                    {isSelected ? '✓' : ''}
                  </span>
                  <span>{sabor}</span>
                </button>
              );
            })}
            <button
              onClick={() => setDados(p => ({ ...p, saborBolo: 'Outro sabor', saborBoloOutro: '' }))}
              style={{
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: dados.saborBolo === 'Outro sabor' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                background: dados.saborBolo === 'Outro sabor' ? 'var(--color-brand-lighter)' : 'var(--color-white)',
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
                border: dados.saborBolo === 'Outro sabor' ? '2px solid var(--color-brand)' : '2px solid var(--color-border)',
                background: dados.saborBolo === 'Outro sabor' ? 'var(--color-brand)' : 'transparent',
                color: dados.saborBolo === 'Outro sabor' ? 'var(--color-white)' : 'transparent',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-bold)',
              }} aria-hidden="true">
                {dados.saborBolo === 'Outro sabor' ? '✓' : ''}
              </span>
              <span>Outro sabor</span>
            </button>
          </div>
          {dados.saborBolo === 'Outro sabor' && (
            <input
              type="text"
              value={dados.saborBoloOutro}
              onChange={(e) => setDados(p => ({ ...p, saborBoloOutro: e.target.value }))}
              placeholder="Qual sabor de bolo?"
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
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Mesa de doces?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.mesaDoces === o.v} padding="md" onClick={() => setDados(p => ({ ...p, mesaDoces: o.v }))} role="radio" aria-checked={dados.mesaDoces === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Bem-casados?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.bemCasados === o.v} padding="md" onClick={() => setDados(p => ({ ...p, bemCasados: o.v }))} role="radio" aria-checked={dados.bemCasados === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>

      {renderOpcoes(TIPOS_BAR, 'tipoBar', 'Bar', 'Defina o que será servido para seus convidados.')}

      {dados.tipoBar && dados.tipoBar !== 'Apenas espumante' && dados.tipoBar !== 'Sem álcool' && dados.tipoBar !== 'Ainda não sei' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Bartender profissional?</label>
          {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
            <Card key={String(o.v)} interactive selected={dados.bartender === o.v} padding="sm" onClick={() => setDados(p => ({ ...p, bartender: o.v }))} role="radio" aria-checked={dados.bartender === o.v}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>{o.l}</span>
            </Card>
          ))}
        </div>
      )}
      <ButtonAvancar onClick={avancar} disabled={dados.bolo === null || dados.mesaDoces === null || dados.bemCasados === null || !dados.tipoBar} />
    </div>,

    // H8-H11a: Música, entretenimento, lembrancinhas, kit
    <div key="h8" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Festa e lembranças</h2>
      
      {renderOpcoes([
        { valor: 'Banda ao vivo', desc: 'Músicos profissionais tocam durante toda a festa, com repertório personalizado.' },
        { valor: 'DJ', desc: 'Discotecagem profissional, com luzes e efeitos, sem intervalos.' },
        { valor: 'Banda + DJ', desc: 'Banda ao vivo nos momentos principais, DJ no restante da festa.' },
        { valor: 'Playlist própria', desc: 'Você monta a playlist e alguém controla o som durante a festa.' },
        { valor: 'Ainda não sei', desc: 'Vou decidir mais tarde.' },
      ], 'musicaFesta', 'Música da festa')}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Estilos musicais</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {ESTILOS_MUSICA.map(e => (
            <button key={e} onClick={() => toggleArray('estiloMusical', e)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.estiloMusical.includes(e) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.estiloMusical.includes(e) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Atividades e entretenimento</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {ATIVIDADES.map(a => (
            <button key={a} onClick={() => toggleArray('atividadesEntretenimento', a)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.atividadesEntretenimento.includes(a) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.atividadesEntretenimento.includes(a) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Lembrancinhas?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.lembrancinhas === o.v} padding="md" onClick={() => setDados(p => ({ ...p, lembrancinhas: o.v }))} role="radio" aria-checked={dados.lembrancinhas === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Kit saída?</label>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.kitSaida === o.v} padding="md" onClick={() => setDados(p => ({ ...p, kitSaida: o.v }))} role="radio" aria-checked={dados.kitSaida === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      {dados.kitSaida && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Itens do kit</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {ITENS_KIT.map(i => (
              <button key={i} onClick={() => toggleArray('itensKitSaida', i)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: dados.itensKitSaida.includes(i) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)', background: dados.itensKitSaida.includes(i) ? 'var(--color-brand-lighter)' : 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                {i}
              </button>
            ))}
          </div>
        </div>
      )}
      <ButtonAvancar onClick={confirmar} disabled={!dados.musicaFesta || dados.lembrancinhas === null || dados.kitSaida === null} />
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

Step38Coquetel.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step38Coquetel };