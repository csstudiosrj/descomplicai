import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import {
  CATEGORIAS_PRINCIPAIS,
} from '../../utils/catalogoFornecedores';

export default function BibliotecaFornecedoresModal({ favorito, cerimonialistaId, onClose, onSalvo }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('outro');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [notas, setNotas] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (favorito) {
      setNome(favorito.nome_fornecedor || '');
      setCategoria(favorito.categoria || 'outro');
      setTelefone(favorito.telefone || '');
      setEmail(favorito.email || '');
      setInstagram(favorito.instagram || '');
      setNotas(favorito.notas_internas || '');
    } else {
      setNome('');
      setCategoria('outro');
      setTelefone('');
      setEmail('');
      setInstagram('');
      setNotas('');
    }
    setErro('');
  }, [favorito]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Nome do fornecedor e obrigatorio');
      return;
    }

    setSalvando(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setErro('Sessao expirada. Faca login novamente.');
        setSalvando(false);
        return;
      }

      const payload = {
        id: favorito?.id,
        nome_fornecedor: nome.trim(),
        categoria,
        telefone: telefone.trim() || null,
        email: email.trim() || null,
        instagram: instagram.trim() || null,
        notas_internas: notas.trim() || null,
      };

      const res = await fetch('/api/cerimonialista/favoritos/salvar', {
        method: favorito ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        onSalvo();
        onClose();
      } else {
        setErro(json.error || 'Erro ao salvar');
      }
    } catch (err) {
      setErro('Erro de conexao. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={favorito ? 'Editar fornecedor favorito' : 'Adicionar fornecedor aos favoritos'}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {erro && (
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <Icon name="alertCircle" size={16} />
            {erro}
          </div>
        )}

        <Input
          label="Nome do fornecedor *"
          placeholder="Ex: Buffet Gourmet"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
            Categoria *
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border-strong)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-white)',
              outline: 'none',
            }}
          >
            {CATEGORIAS_PRINCIPAIS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Telefone"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="contato@fornecedor.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Instagram"
          placeholder="@fornecedor"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
            Notas internas
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Observacoes, valores, preferencias..."
            rows={3}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border-strong)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" loading={salvando} type="submit">
            {salvando ? 'Salvando...' : (favorito ? 'Atualizar' : 'Adicionar')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
