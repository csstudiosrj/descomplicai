import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../ui/Icon';
import ChatMensagem from './ChatMensagem';
import ChatInput from './ChatInput';

export default function ChatInterface({ eventoId, modo = 'casal' }) {
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [outroNome, setOutroNome] = useState('');
  const [outroOnline, setOutroOnline] = useState(false);
  const scrollRef = useRef(null);
  const containerRef = useRef(null);

  // ─── Carregar mensagens ─────────────────────────────────────
  useEffect(() => {
    if (!eventoId) return;

    async function carregar() {
      setCarregando(true);

      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('evento_id', eventoId)
        .order('criado_em', { ascending: true });

      if (error) {
        console.error('[Chat] erro ao carregar mensagens:', error);
      } else {
        setMensagens(data || []);
      }

      // Buscar nome do outro participante
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

      setCarregando(false);
    }

    carregar();
  }, [eventoId, modo]);

  // ─── Marcar mensagens como lidas ────────────────────────────
  useEffect(() => {
    if (!eventoId || !user?.id || mensagens.length === 0) return;

    const naoLidas = mensagens.filter(
      (m) => m.remetente_id !== user.id && !m.lida
    );

    if (naoLidas.length === 0) return;

    async function marcarLidas() {
      const ids = naoLidas.map((m) => m.id);
      await supabase
        .from('mensagens')
        .update({ lida: true })
        .in('id', ids);
    }

    marcarLidas();
  }, [mensagens, eventoId, user]);

  // ─── Real-time subscription ───────────────────────────────
  useEffect(() => {
    if (!eventoId) return;

    const canal = supabase
      .channel(`chat-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `evento_id=eq.${eventoId}`,
        },
        (payload) => {
          setMensagens((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mensagens',
          filter: `evento_id=eq.${eventoId}`,
        },
        (payload) => {
          setMensagens((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [eventoId]);

  // ─── Auto-scroll ────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  // ─── Enviar mensagem ────────────────────────────────────────
  const enviar = async (conteudo) => {
    if (!user?.id || !eventoId || enviando) return;

    setEnviando(true);

    const { error } = await supabase.from('mensagens').insert({
      evento_id: eventoId,
      remetente_id: user.id,
      remetente_tipo: modo,
      conteudo,
      lida: false,
    });

    if (error) {
      console.error('[Chat] erro ao enviar:', error);
    }

    setEnviando(false);
  };

  const isMe = (msg) => msg.remetente_id === user?.id;

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
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: outroOnline ? 'var(--color-success)' : 'var(--color-text-muted)',
            }}
          >
            {outroOnline ? 'Online' : ''}
          </span>
        </div>
      </header>

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

        {!carregando && mensagens.length === 0 && (
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
                <ChatMensagem mensagem={msg} isMe={isMe(msg)} />
              </React.Fragment>
            );
          })}
      </div>

      {/* Input */}
      <ChatInput onEnviar={enviar} disabled={enviando || !eventoId} />
    </div>
  );
}
