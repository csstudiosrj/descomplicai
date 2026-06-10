// Bloco H — Recepção: coquetel, jantar, bolo, bar, música, lembrancinhas, kit saída
import React, { useState } from 'react';
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

const ESTILOS_MUSICA = ['Sertanejo', 'Funk', 'Pop', 'Rock', 'Eletrônica', 'Samba/Pagode', 'Jazz', 'MPB', 'Forró'];
const ATIVIDADES = ['Cabine de fotos', 'DJ', 'Banda ao vivo', 'Fogos de artifício', 'Lanternas de papel', 'Dança surpresa', 'Jogos/Quiz'];
const ITENS_KIT = ['Chinelos', 'Lanche da madrugada', 'Água/energético', 'Protetor solar', 'Lenços de papel', 'Doces'];

export default function Step38Coquetel({ onSelect, estadoAtual }) {
  const estilo = estadoAtual?.estilo;
  const { etapa: etapaInterna, avancar: avancar } = useEtapaInterna(estadoAtual, CHAVES_ETAPA);
  const [dados, setDados] = useState({
    coquetel: estadoAtual?.coquetel ?? null,
    duracaoCoquetel: estadoAtual?.duracaoCoquetel || '',
    tipoJantar: estadoAtual?.tipoJantar || '',
    restricoesAlimentares: estadoAtual?.restricoesAlimentares || '',
    bolo: estadoAtual?.bolo ?? null,
    saborBolo: estadoAtual?.saborBolo || '',
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

  const toggleArray = (field, val) => {
    setDados(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(x => x !== val) : [...prev[field], val]
    }));
  };

  const confirmar = () => {
    Object.entries(dados).forEach(([k, v]) => onSelect(k, v));
  };

  const boloSugerido = estilo ? sugerirBolo(estilo) : 'Bolo branco clássico';

  // Renderiza um card com opções e descrições
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
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  {op.desc}
                </div>
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
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Restrições alimentares dos convidados?</label>
        <input
          type="text"
          value={dados.restricoesAlimentares}
          onChange={(e) => setDados(p => ({ ...p, restricoesAlimentares: e.target.value }))}
          placeholder="Vegetarianos, veganos, alérgicos a glúten/nozes..."
          style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', outline: 'none' }}
        />
      </div>
      <ButtonAvancar onClick={avancar} disabled={dados.coquetel === null || !dados.tipoJantar} />
    </div>,

    // H4-H7: Bolo, doces, bar
    <div key="h4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Bolo, doces e bar</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Bolo</label>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Sugestão: {boloSugerido}</p>
        {[{v:true,l:'Sim'}, {v:false,l:'Não'}].map(o => (
          <Card key={String(o.v)} interactive selected={dados.bolo === o.v} padding="md" onClick={() => setDados(p => ({ ...p, bolo: o.v }))} role="radio" aria-checked={dados.bolo === o.v}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{o.l}</span>
          </Card>
        ))}
      </div>
      {dados.bolo && (
        <input
          type="text"
          value={dados.saborBolo}
          onChange={(e) => setDados(p => ({ ...p, saborBolo: e.target.value }))}
          placeholder="Sabor ou descrição do bolo"
          style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', outline: 'none' }}
        />
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
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Música da festa</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[
            { valor: 'Banda ao vivo', desc: 'Músicos profissionais tocam durante toda a festa, com repertório personalizado.' },
            { valor: 'DJ', desc: 'Discotecagem profissional, com luzes e efeitos, sem intervalos.' },
            { valor: 'Banda + DJ', desc: 'Banda ao vivo nos momentos principais, DJ no restante da festa.' },
            { valor: 'Playlist própria', desc: 'Você monta a playlist e alguém controla o som durante a festa.' },
            { valor: 'Ainda não sei', desc: 'Vou decidir mais tarde.' },
          ].map(op => {
            const isSelected = dados.musicaFesta === op.valor;
            return (
              <button
                key={op.valor}
                onClick={() => setDados(p => ({ ...p, musicaFesta: op.valor }))}
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
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                    {op.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

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