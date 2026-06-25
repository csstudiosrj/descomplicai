import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { supabase } from '../../lib/supabase';

export default function PerfilCerimonialista() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista, refreshCerimonialista } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [assistentes, setAssistentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalAssistente, setModalAssistente] = useState(false);
  const [novoAssistente, setNovoAssistente] = useState({ nome: '', email: '', acesso: 'operacional' });
  const [convidando, setConvidando] = useState(false);
  const [novaFoto, setNovaFoto] = useState('');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const buscarPerfil = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/cerimonialista/perfil', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (res.ok && data.perfil) {
        setPerfil(data.perfil);
        setAssistentes(data.assistentes || []);
      } else {
        showToast(data.error || 'Erro ao carregar perfil', 'error');
      }
    } catch {
      showToast('Erro ao carregar perfil', 'error');
    } finally {
      setCarregando(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (isCerimonialista && user) {
      buscarPerfil();
    }
  }, [isCerimonialista, user, buscarPerfil]);

  const handleSalvar = async () => {
    if (!perfil) return;
    setSalvando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/cerimonialista/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          nome_empresa: perfil.nome_empresa,
          cnpj: perfil.cnpj,
          bio: perfil.bio,
          portfolio_urls: perfil.portfolio_urls,
          instagram: perfil.instagram,
          site: perfil.site,
          telefone: perfil.telefone,
          cidade: perfil.cidade,
          estado: perfil.estado,
          regiao_atuacao: perfil.regiao_atuacao,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPerfil(data.perfil);
        if (refreshCerimonialista) refreshCerimonialista();
        showToast('Perfil salvo com sucesso');
      } else {
        showToast(data.error || 'Erro ao salvar', 'error');
      }
    } catch {
      showToast('Erro ao salvar', 'error');
    } finally {
      setSalvando(false);
    }
  };

  const handleAdicionarFoto = () => {
    if (!novaFoto.trim()) return;
    const urls = perfil.portfolio_urls || [];
    if (urls.includes(novaFoto.trim())) {
      showToast('Esta foto ja esta no portfolio', 'error');
      return;
    }
    setPerfil({ ...perfil, portfolio_urls: [...urls, novaFoto.trim()] });
    setNovaFoto('');
  };

  const handleRemoverFoto = (index) => {
    const urls = [...(perfil.portfolio_urls || [])];
    urls.splice(index, 1);
    setPerfil({ ...perfil, portfolio_urls: urls });
  };

  const handleConvidarAssistente = async () => {
    if (!novoAssistente.nome.trim() || !novoAssistente.email.trim()) {
      showToast('Nome e email sao obrigatorios', 'error');
      return;
    }
    setConvidando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/cerimonialista/assistentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          nome: novoAssistente.nome.trim(),
          email: novoAssistente.email.trim(),
          acesso: novoAssistente.acesso,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssistentes([data.assistente, ...assistentes]);
        setModalAssistente(false);
        setNovoAssistente({ nome: '', email: '', acesso: 'operacional' });
        showToast('Assistente convidado com sucesso');
      } else {
        showToast(data.error || 'Erro ao convidar', 'error');
      }
    } catch {
      showToast('Erro ao convidar', 'error');
    } finally {
      setConvidando(false);
    }
  };

  const handleRemoverAssistente = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/cerimonialista/assistentes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setAssistentes(assistentes.filter((a) => a.id !== id));
        showToast('Assistente removido');
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao remover', 'error');
      }
    } catch {
      showToast('Erro ao remover', 'error');
    }
  };

  const atualizarCampo = (campo, valor) => {
    setPerfil((prev) => (prev ? { ...prev, [campo]: valor } : prev));
  };

  if (loading || carregando) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando...</p>
      </div>
    );
  }

  if (!isCerimonialista || !perfil) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-warning)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-4)' }}>
            Acesso restrito
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Esta area e exclusiva para cerimonialistas.
          </p>
          <Button variant="primary" onClick={() => router.push('/painel')} style={{ marginTop: 'var(--space-6)' }}>
            Ir para o painel do casal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Meu Perfil — Descomplicaí</title>
      </Head>

      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        <header
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--space-4) var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => router.push('/cerimonialista/painel')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Voltar ao painel"
            >
              <Icon name="back" size={22} />
            </button>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
                Meu Perfil
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Gerencie seus dados e equipe
              </p>
            </div>
          </div>
        </header>

        <main style={{ padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            <section
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-6)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <Icon name="building" size={20} color="var(--color-brand)" />
                Dados da Empresa
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Input
                  label="Nome da empresa"
                  value={perfil.nome_empresa || ''}
                  onChange={(e) => atualizarCampo('nome_empresa', e.target.value)}
                  placeholder="Ex: Cerimonial Bela Vista"
                />
                <Input
                  label="CNPJ"
                  value={perfil.cnpj || ''}
                  onChange={(e) => atualizarCampo('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    Bio
                  </label>
                  <textarea
                    value={perfil.bio || ''}
                    onChange={(e) => atualizarCampo('bio', e.target.value)}
                    placeholder="Conte um pouco sobre sua empresa..."
                    rows={4}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-border-strong)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
                <Input
                  label="Telefone"
                  value={perfil.telefone || ''}
                  onChange={(e) => atualizarCampo('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Input
                    label="Cidade"
                    value={perfil.cidade || ''}
                    onChange={(e) => atualizarCampo('cidade', e.target.value)}
                    placeholder="Sao Paulo"
                  />
                  <Input
                    label="Estado"
                    value={perfil.estado || ''}
                    onChange={(e) => atualizarCampo('estado', e.target.value)}
                    placeholder="SP"
                  />
                </div>
                <Input
                  label="Regiao de atuacao"
                  value={perfil.regiao_atuacao || ''}
                  onChange={(e) => atualizarCampo('regiao_atuacao', e.target.value)}
                  placeholder="Ex: Grande Sao Paulo, Litoral Norte"
                />
              </div>
            </section>

            <section
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-6)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <Icon name="share" size={20} color="var(--color-brand)" />
                Presenca Online
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Input
                  label="Instagram"
                  value={perfil.instagram || ''}
                  onChange={(e) => atualizarCampo('instagram', e.target.value)}
                  placeholder="@suaempresa"
                />
                <Input
                  label="Site"
                  type="url"
                  value={perfil.site || ''}
                  onChange={(e) => atualizarCampo('site', e.target.value)}
                  placeholder="https://www.suaempresa.com.br"
                />
              </div>
            </section>

            <section
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-6)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <Icon name="fotografia" size={20} color="var(--color-brand)" />
                Portfolio
              </h2>

              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <input
                  type="url"
                  value={novaFoto}
                  onChange={(e) => setNovaFoto(e.target.value)}
                  placeholder="Cole a URL da foto"
                  style={{
                    flex: 1,
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border-strong)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                    outline: 'none',
                  }}
                />
                <Button variant="secondary" onClick={handleAdicionarFoto}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Icon name="plus" size={16} />
                    Adicionar
                  </span>
                </Button>
              </div>

              {(perfil.portfolio_urls || []).length === 0 ? (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
                  Nenhuma foto no portfolio ainda.
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: 'var(--space-3)',
                  }}
                >
                  {(perfil.portfolio_urls || []).map((url, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <img
                        src={url}
                        alt={`Portfolio ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        onClick={() => handleRemoverFoto(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '24px',
                          height: '24px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-danger)',
                          color: 'var(--color-white)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        aria-label="Remover foto"
                      >
                        <Icon name="close" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <Icon name="users" size={20} color="var(--color-brand)" />
                  Equipe
                </h2>
                <Button variant="secondary" size="sm" onClick={() => setModalAssistente(true)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Icon name="userPlus" size={16} />
                    Convidar
                  </span>
                </Button>
              </div>

              {assistentes.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
                  Nenhum assistente na equipe ainda.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {assistentes.map((assistente) => (
                    <div
                      key={assistente.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-off-white)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-brand-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon name="user" size={18} color="var(--color-brand)" />
                        </div>
                        <div>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                            {assistente.nome}
                          </p>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {assistente.email}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span
                          style={{
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: assistente.acesso === 'administrador' ? 'var(--color-brand-lighter)' : 'var(--color-success-light)',
                            color: assistente.acesso === 'administrador' ? 'var(--color-brand)' : 'var(--color-success)',
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-medium)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {assistente.acesso === 'administrador' ? 'Administrador' : 'Operacional'}
                        </span>
                        <button
                          onClick={() => handleRemoverAssistente(assistente.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            padding: 'var(--space-1)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          aria-label="Remover assistente"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
              <Button variant="primary" onClick={handleSalvar} disabled={salvando}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {salvando ? (
                    <>
                      <Icon name="refreshCw" size={16} />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Icon name="save" size={16} />
                      Salvar alteracoes
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </main>
      </div>

      {modalAssistente && (
        <Modal onClose={() => setModalAssistente(false)} title="Convidar assistente">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Nome"
              value={novoAssistente.nome}
              onChange={(e) => setNovoAssistente({ ...novoAssistente, nome: e.target.value })}
              placeholder="Nome completo"
              required
            />
            <Input
              label="Email"
              type="email"
              value={novoAssistente.email}
              onChange={(e) => setNovoAssistente({ ...novoAssistente, email: e.target.value })}
              placeholder="email@exemplo.com"
              required
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                Nivel de acesso
              </label>
              <select
                value={novoAssistente.acesso}
                onChange={(e) => setNovoAssistente({ ...novoAssistente, acesso: e.target.value })}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border-strong)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                  backgroundColor: 'var(--color-white)',
                }}
              >
                <option value="operacional">Operacional — eventos e tarefas</option>
                <option value="administrador">Administrador — acesso total</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={() => setModalAssistente(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleConvidarAssistente} disabled={convidando}>
                {convidando ? 'Enviando...' : 'Enviar convite'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 'var(--z-toast)',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 300ms ease',
          }}
        >
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
