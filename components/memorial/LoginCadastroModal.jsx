/* ==========================================
 * ARQUIVO: components/memorial/LoginCadastroModal.jsx
 * ==========================================
 * Modal de login/cadastro embutido no fluxo do memorial.
 * CORRECAO 07/07: Adiciona emailRedirectTo no cadastro para
 * redirecionar corretamente apos confirmacao de email.
 * CORRECAO 12/07: Cria evento automatico apos cadastro confirmado.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import fetchAPI from '../../utils/fetchAPI';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://arxum.csstudios.site';

const TABS = [
  { id: 'entrar', label: 'Entrar' },
  { id: 'cadastrar', label: 'Criar conta' },
];

export default function LoginCadastroModal({ isOpen, onLoginSuccess, onClose }) {
  const { login, cadastrar, supabase } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);
  const [emailConfirmacao, setEmailConfirmacao] = useState('');

  const intervalRef = useRef(null);
  const abortPollingRef = useRef(false);

  // Limpa polling ao desmontar ou fechar modal
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      abortPollingRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      abortPollingRef.current = true;
    }
  }, [isOpen]);

  const resetarFormulario = useCallback(() => {
    setNome('');
    setEmail('');
    setSenha('');
    setErro('');
    setLoading(false);
    setAguardandoConfirmacao(false);
    setEmailConfirmacao('');
    abortPollingRef.current = false;
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetarFormulario();
    }
  }, [isOpen, resetarFormulario]);

  // ============================================================
  // Cria evento automatico se nao existir, depois fecha modal
  // ============================================================
  const handleLoginSuccessComEvento = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.id) {
        console.error('Sessao nao encontrada apos login:', sessionError);
        onLoginSuccess();
        return;
      }

      const { data: eventoExistente } = await supabase
        .from('eventos')
        .select('id')
        .eq('usuario_id', session.user.id)
        .single();

      if (!eventoExistente) {
        const { error: insertError } = await supabase.from('eventos').insert({
          usuario_id: session.user.id,
          nome_evento: 'Meu Casamento',
          status: 'memorial',
          plano: 'trial',
          acesso_iniciado_em: new Date().toISOString(),
          acesso_expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          criado_em: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Erro ao criar evento automatico:', insertError);
        } else {
          console.log('Evento criado com sucesso para usuario:', session.user.id);
        }
      } else {
        console.log('Evento ja existente para usuario:', session.user.id);
      }
    } catch (e) {
      console.error('Erro no fluxo de criacao de evento:', e);
    } finally {
      onLoginSuccess();
    }
  }, [supabase, onLoginSuccess]);

  // ============================================================
  // Polling de sessao: detecta confirmacao de email em outra aba
  // ============================================================
  const iniciarPollingSessao = useCallback(() => {
    if (intervalRef.current) return;

    const verificar = async () => {
      if (abortPollingRef.current) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          abortPollingRef.current = true;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          await handleLoginSuccessComEvento();
        }
      } catch (e) {
        // Silencioso
      }
    };

    verificar();
    intervalRef.current = setInterval(verificar, 3000);
  }, [supabase, handleLoginSuccessComEvento]);

  // ============================================================
  // Login
  // ============================================================
  async function handleLogin(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const { data, error } = await login(email, senha);
      if (error) throw error;

      if (data?.session?.access_token) {
        await handleLoginSuccessComEvento();
        return;
      }

      setErro('Nao foi possivel iniciar a sessao. Tente novamente.');
      setLoading(false);
    } catch (err) {
      setErro(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      setLoading(false);
    }
  }

  // ============================================================
  // Cadastro — CORRECAO: adiciona emailRedirectTo
  // ============================================================
  async function handleCadastro(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // CORRECAO: URL absoluta com basePath /descomplicai
      const redirectTo = `${SITE_URL}/descomplicai/memorial`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;

      const session = data?.session;

      if (session?.access_token) {
        // Confirmacao automatica (ambiente de dev)
        await handleLoginSuccessComEvento();
        return;
      }

      // Precisa confirmar email
      setAguardandoConfirmacao(true);
      setEmailConfirmacao(email);
      setLoading(false);
      iniciarPollingSessao();
    } catch (err) {
      setErro(err.message || 'Erro ao criar conta. Tente novamente.');
      setLoading(false);
    }
  }

  async function handleReenviarEmail() {
    setLoading(true);
    setErro('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailConfirmacao,
      });
      if (error) throw error;
      alert('Email reenviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setErro(err.message || 'Erro ao reenviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerificarAgora() {
    setLoading(true);
    setErro('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        abortPollingRef.current = true;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        await handleLoginSuccessComEvento();
        return;
      }
      setErro('Ainda nao detectamos a confirmacao. Verifique seu email e clique no link.');
    } catch (err) {
      setErro('Erro ao verificar sessao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // Tela de "Aguardando confirmacao"
  // ============================================================
  if (aguardandoConfirmacao) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => { /* obrigatorio */ }}
        title="Quase la!"
        size="md"
        hideCloseButton={true}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-5)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" fill="var(--color-success)" />
            </svg>
          </div>

          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)',
            }}>
              Confirme seu email
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              fontSize: 'var(--text-base)',
            }}>
              Enviamos um link de confirmacao para{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>{emailConfirmacao}</strong>.
              <br /><br />
              Clique no link do email para ativar sua conta e continuar planejando seu casamento.
              <br /><br />
              <em style={{ fontSize: 'var(--text-sm)' }}>
                Assim que confirmar, o memorial continuara automaticamente.
              </em>
            </p>
          </div>

          <div style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            width: '100%',
            textAlign: 'left',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-3)',
              textAlign: 'center',
            }}>
              Dicas:
            </p>
            <ul style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.8,
              paddingLeft: 'var(--space-5)',
              margin: 0,
            }}>
              <li>Verifique sua caixa de <strong>spam</strong> ou <strong>promocoes</strong></li>
              <li>O link expira em 24 horas</li>
              <li>Se nao recebeu, clique em reenviar abaixo</li>
              <li>Pode confirmar em qualquer dispositivo</li>
            </ul>
          </div>

          {erro && (
            <div role="alert" style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              width: '100%',
            }}>{erro}</div>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            width: '100%',
          }}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              onClick={handleVerificarAgora}
            >
              Ja confirmei — verificar agora
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              loading={loading}
              onClick={handleReenviarEmail}
            >
              Reenviar email de confirmacao
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // ============================================================
  // Tela principal: abas Entrar / Cadastrar
  // ============================================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { /* obrigatorio no primeiro acesso */ }}
      title=""
      size="md"
      hideCloseButton={true}
    >
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-1)',
        }}>
          Descomplicai
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-base)',
        }}>
          Salve seu progresso e continue de onde parar
        </p>
      </div>

      {/* Abas */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 'var(--space-5)',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setAbaAtiva(tab.id);
              setErro('');
            }}
            style={{
              flex: 1,
              padding: 'var(--space-3) var(--space-4)',
              background: 'none',
              border: 'none',
              borderBottom: abaAtiva === tab.id ? '2px solid var(--color-brand)' : '2px solid transparent',
              color: abaAtiva === tab.id ? 'var(--color-brand)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              fontWeight: abaAtiva === tab.id ? 'var(--font-semibold)' : 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'color 150ms ease, border-color 150ms ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Formulario */}
      <form
        onSubmit={abaAtiva === 'entrar' ? handleLogin : handleCadastro}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {abaAtiva === 'cadastrar' && (
          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        )}

        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Minimo 6 caracteres"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          hint={abaAtiva === 'cadastrar' ? 'Minimo 6 caracteres' : undefined}
        />

        {erro && (
          <div role="alert" style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
          }}>{erro}</div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          {abaAtiva === 'entrar'
            ? (loading ? 'Entrando...' : 'Entrar')
            : (loading ? 'Criando conta...' : 'Criar conta')
          }
        </Button>
      </form>

      <p style={{
        textAlign: 'center',
        marginTop: 'var(--space-5)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
      }}>
        {abaAtiva === 'entrar' ? (
          <>
            Nao tem conta?{' '}
            <button
              onClick={() => { setAbaAtiva('cadastrar'); setErro(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-brand)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                padding: 0,
              }}
            >
              Cadastre-se
            </button>
          </>
        ) : (
          <>
            Ja tem conta?{' '}
            <button
              onClick={() => { setAbaAtiva('entrar'); setErro(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-brand)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                padding: 0,
              }}
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </Modal>
  );
}