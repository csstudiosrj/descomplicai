import React, { useEffect, useRef, useState } from 'react';

export default function CheckoutBricks({ preferenceId, publicKey, onPaymentSuccess, onPaymentError }) {
  const bricksContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!preferenceId || !publicKey) {
      setError('Dados de pagamento incompletos');
      setIsLoading(false);
      return;
    }

    const loadMercadoPago = async () => {
      try {
        // Carrega o SDK do Mercado Pago
        if (!window.MercadoPago) {
          const script = document.createElement('script');
          script.src = 'https://sdk.mercadopago.com/js/v2';
          script.onload = () => initBricks();
          script.onerror = () => {
            setError('Erro ao carregar o Mercado Pago');
            setIsLoading(false);
          };
          document.body.appendChild(script);
        } else {
          initBricks();
        }
      } catch (err) {
        setError('Erro ao inicializar pagamento');
        setIsLoading(false);
      }
    };

    const initBricks = async () => {
      try {
        const mp = new window.MercadoPago(publicKey, {
          locale: 'pt-BR',
        });

        const bricksBuilder = mp.bricks();

        // Cria o Card Payment Brick
        await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', {
          initialization: {
            preferenceId: preferenceId,
          },
          callbacks: {
            onReady: () => {
              setIsLoading(false);
            },
            onError: (err) => {
              console.error('[Bricks] Erro:', err);
              setError('Erro no formulário de pagamento');
              setIsLoading(false);
              onPaymentError?.(err);
            },
            onSubmit: async (cardFormData) => {
              try {
                // Processa o pagamento
                const response = await fetch('/api/pagamento/processar', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    ...cardFormData,
                    preferenceId,
                  }),
                });

                const data = await response.json();

                if (data.success) {
                  onPaymentSuccess?.(data);
                } else {
                  onPaymentError?.(data);
                }
              } catch (err) {
                console.error('[Bricks] Erro no submit:', err);
                onPaymentError?.(err);
              }
            },
          },
          customization: {
            visual: {
              style: {
                theme: 'default',
              },
            },
            paymentMethods: {
              maxInstallments: 12,
            },
          },
        });
      } catch (err) {
        console.error('[Bricks] Erro ao criar:', err);
        setError('Erro ao criar formulário de pagamento');
        setIsLoading(false);
      }
    };

    loadMercadoPago();

    // Cleanup
    return () => {
      if (window.MercadoPago && bricksContainerRef.current) {
        // O SDK não tem método de destroy, então limpamos o container
        bricksContainerRef.current.innerHTML = '';
      }
    };
  }, [preferenceId, publicKey]);

  if (error) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error)' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-brand)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-6)' }}>
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p>Carregando formulário de pagamento...</p>
        </div>
      )}
      <div 
        id="cardPaymentBrick_container" 
        ref={bricksContainerRef}
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}