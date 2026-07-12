import React, { useState } from 'react';

const CARTOES_TESTE = [
  { bandeira: 'visa', numero: '5031 4332 1540 6351', cvv: '123', validade: '11/30', nome: 'APRO' },
  { bandeira: 'mastercard', numero: '5031 7557 3453 0604', cvv: '123', validade: '11/30', nome: 'APRO' },
  { bandeira: 'amex', numero: '3753 651535 56885', cvv: '1234', validade: '11/30', nome: 'APRO' },
];

export default function CheckoutTransparente({ valor, onPaymentSuccess, onPaymentError }) {
  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: '',
    parcelas: '1',
  });
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  const formatarNumero = (valor) => {
    const v = valor.replace(/\s/g, '').replace(/\D/g, '');
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.slice(i, i + 4));
    }
    return parts.join(' ').slice(0, 19);
  };

  const formatarValidade = (valor) => {
    const v = valor.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const detectarBandeira = (numero) => {
    const n = numero.replace(/\s/g, '');
    if (n.startsWith('4')) return 'visa';
    if (n.startsWith('5')) return 'mastercard';
    if (n.startsWith('3')) return 'amex';
    if (n.startsWith('6')) return 'elo';
    return 'visa';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setProcessando(true);

    try {
      // Para teste, usamos os cartões de teste do MP
      // Em produção, aqui você usaria o SDK do MP para tokenizar o cartão
      // Mas para simplificar em teste, vamos usar a API direta com os dados

      const numeroLimpo = dadosCartao.numero.replace(/\s/g, '');
      const bandeira = detectarBandeira(numeroLimpo);

      // Verifica se é cartão de teste válido
      const cartaoTeste = CARTOES_TESTE.find(c => c.numero.replace(/\s/g, '') === numeroLimpo);

      if (!cartaoTeste) {
        throw new Error('Use um cartão de teste válido do Mercado Pago');
      }

      // Chama a API de pagamento
      const response = await fetch('/api/pagamento/transparente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardToken: 'TEST_TOKEN', // Em produção, tokeniza com SDK
          paymentMethodId: bandeira,
          installments: dadosCartao.parcelas,
          // Os outros dados (tipo, usuarioId, etc.) vêm do componente pai
          // Precisamos passar esses dados via props
        }),
      });

      const data = await response.json();

      if (data.success) {
        onPaymentSuccess?.(data);
      } else {
        throw new Error(data.detalhe || 'Pagamento não aprovado');
      }
    } catch (err) {
      setErro(err.message);
      onPaymentError?.(err);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: 'var(--space-6)' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
        Pagamento com Cartão
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
        Valor: <strong>R$ {valor?.toFixed(2).replace('.', ',')}</strong>
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
            Número do cartão
          </label>
          <input
            type="text"
            value={dadosCartao.numero}
            onChange={(e) => setDadosCartao({ ...dadosCartao, numero: formatarNumero(e.target.value) })}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            required
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-base)',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
            Nome no cartão
          </label>
          <input
            type="text"
            value={dadosCartao.nome}
            onChange={(e) => setDadosCartao({ ...dadosCartao, nome: e.target.value.toUpperCase() })}
            placeholder="NOME COMO ESTA NO CARTAO"
            required
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-base)',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
              Validade (MM/AA)
            </label>
            <input
              type="text"
              value={dadosCartao.validade}
              onChange={(e) => setDadosCartao({ ...dadosCartao, validade: formatarValidade(e.target.value) })}
              placeholder="MM/AA"
              maxLength={5}
              required
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-base)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
              CVV
            </label>
            <input
              type="text"
              value={dadosCartao.cvv}
              onChange={(e) => setDadosCartao({ ...dadosCartao, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="123"
              maxLength={4}
              required
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-base)',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
            Parcelas
          </label>
          <select
            value={dadosCartao.parcelas}
            onChange={(e) => setDadosCartao({ ...dadosCartao, parcelas: e.target.value })}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-base)',
              backgroundColor: '#fff',
            }}
          >
            <option value="1">1x R$ {valor?.toFixed(2).replace('.', ',')} (sem juros)</option>
            <option value="2">2x R$ {(valor / 2).toFixed(2).replace('.', ',')}</option>
            <option value="3">3x R$ {(valor / 3).toFixed(2).replace('.', ',')}</option>
            <option value="6">6x R$ {(valor / 6).toFixed(2).replace('.', ',')}</option>
            <option value="12">12x R$ {(valor / 12).toFixed(2).replace('.', ',')}</option>
          </select>
        </div>

        {erro && (
          <div style={{ padding: 'var(--space-3)', backgroundColor: '#FEE2E2', borderRadius: 'var(--radius-md)', color: '#DC2626', fontSize: 'var(--text-sm)' }}>
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={processando}
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            background: processando ? 'var(--color-text-muted)' : 'var(--color-brand)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            cursor: processando ? 'not-allowed' : 'pointer',
          }}
        >
          {processando ? 'Processando...' : `Pagar R$ ${valor?.toFixed(2).replace('.', ',')}`}
        </button>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Pagamento processado pelo Mercado Pago
          </p>
        </div>
      </form>
    </div>
  );
}