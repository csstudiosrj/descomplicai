import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../ui/Icon';
import ChatMensagem from './ChatMensagem';
import ChatInput from './ChatInput';

export default function ChatInterface({ eventoId, modo = 'casal' }) {
  const { user, supabase } = useAuth();
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [outroNome, setOutroNome] = useState('');
  const [erro, setErro] = useState(null);
  const scrollRef = useRef(null);
  const pollingRef = useRef(null);
  const ultimoIdRef = useRef(null);

  // ─── Obter token da sessão ────────────────────────────────
  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }, [supabase]);

  // ─── Carregar mensagens via API ───────────────────────────
  const carregarMensagens = useCallback(async (silencioso = false) => {
    if (!eventoId) return;
    if (!silencioso) setCarregando(true);
    setErro(null);

    try {
      const token = await getToken();
      if (!token) {
        setErro('Sessão expirada. Faça login novamente.');
        return;
      }

      const res = await fetch(`/api/mensagens/listar?evento_id=${eventoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || 'Erro ao carregar mensagens');
        return;
      }

      const lista = data.mensagens || [];
      setMensagens((prev) => {
        // Preservar estado de lida localmente se já existir
        const mapa = new Map(prev.map((m) => [m.id, m]));
        const merged = lista.map((m) => ({
          ...m,
          lida: mapa.has(m.id) ? mapa.get(m.id).lida : m.lida,
        }));
        return merged;
      });

      if (lista.length > 0) {
        ultimoIdRef.current = lista[lista.length - 1].id;
      }
    } catch (err) {
      console.error('[Chat] erro ao carregar:', err);
      setErro('Erro de conexão. Tentando novamente...');
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, [eventoId, getToken]);

  // ─── Buscar nome do outro participante ────────────────────
  useEffect(() => {
    if (!eventoId) return;

    async function buscarNome() {
      const { data: eventoData } = await supabase
        .from('eventos')
        .select('cerimonialista_id, usuario_id, nome_evento')
        .eq('id', eventoId)
        .single();

      if (eventoData) {
        if (modo === 'casal' && eventoData.cerimonialista_id) {
          const { data: cerimData } = await supabase
            .from('cerimonialistas')
            .select('nome_empresa')
            .eq('id', eventoData.cerimonialista_id)
            .single();
          setOutroNome(cerimData?.nome_empresa || 'Cerimonialista');
        } else if (modo === 'cerimonialista' && eventoData.usuario_id) {
          setOutroNome(eventoData.nome_evento || 'Casal');
        }
      }
    }

    buscarNome();
  }, [eventoId, modo, supabase]);

  // ─── Carregamento inicial ─────────────────────────────────
  useEffect(() => {
    carregarMensagens(false);
  }, [carregarMensagens]);

  // ─── Polling a cada 5 segundos ────────────────────────────
  useEffect(() => {
    if (!eventoId) return;

    pollingRef.current = setInterval(() => {
      carregarMensagens(true);
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [eventoId, carregarMensagens]);

  // ─── Marcar mensagens como lidas ao abrir ─────────────────
  useEffect(() => {
    if (!eventoId || !user?.id || mensagens.length === 0) return;

    const naoLidas = mensagens.filter(
      (m) => m.remetente_id !== user.id && !m.lida
    );

    if (naoLidas.length === 0) return;

    async function marcarLidas() {
      try {
        const token = await getToken();
        if (!token) return;

        await fetch('/api/mensagens/lida', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ evento_id: eventoId }),
        });

        // Atualizar estado local imediatamente
        setMensagens((prev) =>
          prev.map((m) =>
            m.remetente_id !== user.id && !m.lida ? { ...m, lida: true } : m
          )
        );
      } catch (err) {
        console.error('[Chat] erro ao marcar como lida:', err);
      }
    }

    marcarLidas();
  }, [mensagens, eventoId, user, getToken]);

  // ─── Auto-scroll ──────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  // ─── Enviar mensagem via API ──────────────────────────────
  const enviar = async (conteudo) => {
    if (!user?.id || !eventoId || enviando) return;

    setEnviando(true);
    setErro(null);

    try {
      const token = await getToken();
      if (!token) {
        setErro('Sessão expirada. Faça login novamente.');
        setEnviando(false);
        return;
      }

      const res = await fetch('/api/mensagens/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ evento_id: eventoId, conteudo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || 'Erro ao enviar mensagem');
        setEnviando(false);
        return;
      }

      // Adicionar mensagem localmente para feedback imediato
      if (data.mensagem) {
        setMensagens((prev) => {
          if (prev.some((m) => m.id === data.mensagem.id)) return prev;
          return [...prev, data.mensagem];
        });
      }
    } catch (err) {
      console.error('[Chat] erro ao enviar:', err);
      setErro('Erro de conexão ao enviar mensagem');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        maxHeight: '100dvh',
        background: 'var(--color-off-white)',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'var(--color-white)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-brand-lighter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="user" size={20} color="var(--color-brand)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              margin: 0,
              fontWeight: 'var(--font-semibold)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {outroNome || 'Conversa'}
          </h2>
        </div>
      </header>

      {/* Aviso de segurança */}
      <div
        style={{
          background: 'var(--color-warning-light)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-2) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          flexShrink: 0,
        }}
        role="alert"
      >
        <Icon name="shield" size={16} color="var(--color-warning)" />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-warning)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          Não compartilhe senhas ou dados bancários por aqui.
        </span>
      </div>

      {/* Área de mensagens */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'var(--space-2) 0',
          display: 'flex',
          flexDirection: 'column',
        }}
        role="log"
        aria-live="polite"
        aria-label="Mensagens da conversa"
      >
        {carregando && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
            }}
          >
            Carregando mensagens...
          </div>
        )}

        {erro && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-4)',
              color: 'var(--color-danger)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              background: 'var(--color-danger-light)',
              margin: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
            }}
            role="alert"
          >
            {erro}
          </div>
        )}

        {!carregando && mensagens.length === 0 && !erro && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-8)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-brand-lighter)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="chat" size={28} color="var(--color-brand-light)" />
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  margin: '0 0 var(--space-2)',
                }}
              >
                Nenhuma mensagem ainda
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                }}
              >
                {modo === 'casal'
                  ? 'Envie uma mensagem para seu cerimonialista.'
                  : 'Envie uma mensagem para o casal.'}
              </p>
            </div>
          </div>
        )}

        {!carregando &&
          mensagens.map((msg, idx) => {
            const mostrarData =
              idx === 0 ||
              new Date(msg.criado_em).toDateString() !==
                new Date(mensagens[idx - 1].criado_em).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {mostrarData && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 'var(--space-3) var(--space-4)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        background: 'var(--color-surface)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {new Date(msg.criado_em).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                )}
                <ChatMensagem mensagem={msg} modo={modo} />
              </React.Fragment>
            );
          })}
      </div>

      {/* Input */}
      <ChatInput onEnviar={enviar} disabled={enviando || !eventoId} />
    </div>
  );
}
