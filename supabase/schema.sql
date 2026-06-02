-- Schema Supabase para Descomplicaí
-- Execute no SQL Editor do Supabase

-- Tabela: memoriais
-- Armazena o estado do questionário por usuário

create table if not exists public.memoriais (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  estado jsonb not null default '{}',
  criado_em timestamptz default now() not null,
  atualizado_em timestamptz default now() not null,
  concluido boolean default false not null,
  
  constraint memoriais_user_id_key unique (user_id)
);

-- Índices
create index if not exists idx_memoriais_user_id on public.memoriais(user_id);

-- Trigger: atualiza updated_at automaticamente
create or replace function public.atualizar_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_memoriais_updated_at
  before update on public.memoriais
  for each row
  execute function public.atualizar_updated_at();

-- Row Level Security (RLS)
alter table public.memoriais enable row level security;

-- Política: usuários só veem/editam seus próprios memoriais
create policy "Usuários veem seus próprios memoriais"
  on public.memoriais
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários inserem seus próprios memoriais"
  on public.memoriais
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários atualizam seus próprios memoriais"
  on public.memoriais
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários deletam seus próprios memoriais"
  on public.memoriais
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Tabela: fornecedores (opcional, para gestão)
create table if not exists public.fornecedores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nome text not null,
  categoria text not null,
  status text not null default 'orcamento', -- orcamento, negociacao, contratado, cancelado
  valor numeric,
  telefone text,
  email text,
  site text,
  cidade text,
  observacoes text,
  criado_em timestamptz default now() not null,
  atualizado_em timestamptz default now() not null
);

alter table public.fornecedores enable row level security;

create policy "Usuários veem seus fornecedores"
  on public.fornecedores for select to authenticated using (auth.uid() = user_id);
create policy "Usuários inserem fornecedores"
  on public.fornecedores for insert to authenticated with check (auth.uid() = user_id);
create policy "Usuários atualizam fornecedores"
  on public.fornecedores for update to authenticated using (auth.uid() = user_id);
create policy "Usuários deletam fornecedores"
  on public.fornecedores for delete to authenticated using (auth.uid() = user_id);

-- Tabela: convidados
create table if not exists public.convidados (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nome text not null,
  email text,
  telefone text,
  status text not null default 'pendente', -- confirmado, pendente, recusado
  mesa text,
  acompanhantes integer default 0,
  restricoes text,
  criado_em timestamptz default now() not null
);

alter table public.convidados enable row level security;

create policy "Usuários veem seus convidados"
  on public.convidados for select to authenticated using (auth.uid() = user_id);
create policy "Usuários inserem convidados"
  on public.convidados for insert to authenticated with check (auth.uid() = user_id);
create policy "Usuários atualizam convidados"
  on public.convidados for update to authenticated using (auth.uid() = user_id);
create policy "Usuários deletam convidados"
  on public.convidados for delete to authenticated using (auth.uid() = user_id);

-- Tabela: tarefas (checklist)
create table if not exists public.tarefas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  texto text not null,
  feita boolean default false not null,
  categoria text not null default 'Planejamento',
  prazo date,
  responsavel text,
  ordem integer,
  criado_em timestamptz default now() not null
);

alter table public.tarefas enable row level security;

create policy "Usuários veem suas tarefas"
  on public.tarefas for select to authenticated using (auth.uid() = user_id);
create policy "Usuários inserem tarefas"
  on public.tarefas for insert to authenticated with check (auth.uid() = user_id);
create policy "Usuários atualizam tarefas"
  on public.tarefas for update to authenticated using (auth.uid() = user_id);
create policy "Usuários deletam tarefas"
  on public.tarefas for delete to authenticated using (auth.uid() = user_id);