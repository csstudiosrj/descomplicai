import { useState, useEffect } from 'react';

export default function WizardPasso3({ tiposSelecionados, grupos, mesasGeradas, onChange, onSalvar, onVoltar }) {
  const [rotulos, setRotulos] = useState({});

  useEffect(() => {
    if (mesasGeradas.length > 0) {
      const map = {};
      mesasGeradas.forEach(m => { map[m.numero] = m.rotulo; });
      setRotulos(map);
      return;
    }

    let numero = 1;
    const geradas = [];

    tiposSelecionados.forEach(tipo => {
      for (let i = 0; i < tipo.quantidade; i++) {
        geradas.push({
          numero: numero++,
          nomeTipo: tipo.nome,
          formato: tipo.formato,
          capacidade: tipo.capacidade,
          rotulo: '',
        });
      }
    });

    const nomesGrupos = grupos.map(g => g.nome);
    geradas.forEach((mesa, idx) => {
      if (nomesGrupos[idx]) {
        mesa.rotulo = nomesGrupos[idx];
      }
    });

    onChange(geradas);
    const map = {};
    geradas.forEach(m => { map[m.numero] = m.rotulo; });
    setRotulos(map);
  }, []);

  useEffect(() => {
    if (mesasGeradas.length > 0) {
      const map = {};
      mesasGeradas.forEach(m => { map[m.numero] = m.rotulo; });
      setRotulos(map);
    }
  }, [mesasGeradas]);

  const atualizarRotulo = (numero, valor) => {
    setRotulos(prev => ({ ...prev, [numero]: valor }));
    const atualizadas = mesasGeradas.map(m =>
      m.numero === numero ? { ...m, rotulo: valor } : m
    );
    onChange(atualizadas);
  };

  const totalCapacidade = mesasGeradas.reduce((acc, m) => acc + m.capacidade, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
        }}>
          O sistema organizou suas mesas
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
        }}>
          {mesasGeradas.length} mesas · {totalCapacidade} lugares totais
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '50vh',
        overflow: 'auto',
        padding: '4px',
      }}>
        {mesasGeradas.map((mesa) => (
          <div
            key={mesa.numero}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--color-white)',
              borderRadius: '10px',
              padding: '12px 16px',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: mesa.formato === 'redonda' ? '50%' : mesa.formato === 'quadrada' ? '8px' : '4px',
              border: '2px solid var(--color-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-brand)',
              flexShrink: 0,
            }}>
              {mesa.numero}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
              }}>
                {mesa.nomeTipo}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
              }}>
                {mesa.capacidade} lugares
              </div>
            </div>

            <input
              type="text"
              placeholder="Rotulo (ex: Familia Noivo)"
              value={rotulos[mesa.numero] || ''}
              onChange={(e) => atualizarRotulo(mesa.numero, e.target.value)}
              style={{
                flex: '0 0 180px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                background: 'var(--color-off-white)',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={onVoltar}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-off-white)',
            color: 'var(--color-text-primary)',
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          Voltar
        </button>
        <button
          onClick={onSalvar}
          style={{
            padding: '12px 32px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--color-brand)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          Salvar configuracao
        </button>
      </div>
    </div>
  );
}