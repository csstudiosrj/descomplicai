// Cadastro de novo fornecedor no sistema
// Dependências diretas: React, next/head, next/router, Input, Button, Icon

import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { supabase } from '../../lib/supabase';

export default function FornecedorCadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cidade, setCidade] = useState('');
  const [plano, setPlano] = useState('gratuito');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro('Você precisa estar logado para se cadastrar como fornecedor.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('fornecedores_plataforma')
        .insert({
          usuario_id: user.id,
          nome_empresa: nome,
          categoria: categoria,
          cidade: cidade,
          email: email,
          plano: plano,
          ativo: plano === 'gratuito' ? false : true
        });

      if (insertError) {
        console.error('Erro ao cadastrar fornecedor:', insertError);
        setErro('Erro ao salvar cadastro. Tente novamente.');
        setLoading(false);
        return;
      }

      setEnviado(true);

      if (plano === 'gratuito') {
        router.push('/fornecedor/painel');
      } else {
        // TODO: redirecionar para checkout MP quando aprovado
        router.push('/fornecedor/painel');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Cadastro de Fornecedor — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
            Seja um fornecedor
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            Cadastre-se para receber leads qualificados de casamentos.
          </p>

          {enviado ? (
            <div style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Cadastro recebido!</h2>
              <p>Redirecionando para seu painel...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Input label="Nome da empresa" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <Input label="E-mail comercial" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Categoria (ex: Buffet, Fotografia)" value={categoria} onChange={(e) => setCategoria(e.target.value)} required />
              <Input label="Cidade de atuação" value={cidade} onChange={(e) => setCidade(e.target.value)} required />

              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', fontWeight: 'var(--font-medium)' }}>
                  Plano desejado
                </legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { value: 'gratuito', label: 'Gratuito', desc: 'Perfil invisível nas buscas — sem custo' },
                    { value: 'basico', label: 'Básico — R$ 19,90/mês', desc: 'Perfil ativo e visível para casais' },
                    { value: 'premium', label: 'Premium', desc: 'Destaque nas buscas + prioridade nos leads' }
                  ].map((p) => (
                    <label
                      key={p.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: plano === p.value ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                        backgroundColor: plano === p.value ? 'var(--color-brand-lighter)' : 'var(--color-white)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <input
                        type="radio"
                        name="plano"
                        value={p.value}
                        checked={plano === p.value}
                        onChange={(e) => setPlano(e.target.value)}
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>{p.label}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{p.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              {erro && (
                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                  {erro}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar cadastro'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
