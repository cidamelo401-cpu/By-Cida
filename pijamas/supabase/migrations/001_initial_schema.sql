-- ============================================================================
-- Pijamas Digital - Migração inicial do banco de dados
-- Sistema de gestão de estoque e vendas de pijamas
-- ============================================================================

-- Extensão necessária para gen_random_uuid()
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. TABELA: profiles
-- Perfis de usuários vinculados ao auth.users do Supabase
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'operator')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.profiles is 'Perfis de usuários do sistema (admin ou operador)';

-- ============================================================================
-- 2. TABELA: products
-- Pijamas em estoque
-- ============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  collection text,
  color text,
  model text not null check (model in ('conjunto', 'camisola', 'short_doll', 'baby_doll', 'roupao')),
  fabric text not null check (fabric in ('algodao', 'seda', 'cetim', 'fleece', 'malha')),
  pattern text check (pattern in ('liso', 'listrado', 'floral', 'xadrez', 'estampado', 'personalizado')),
  size text not null check (size in ('PP', 'P', 'M', 'G', 'GG', 'XGG')),
  quantity integer not null default 0 check (quantity >= 0),
  cost_price numeric(10,2) not null,
  sell_price numeric(10,2) not null,
  supplier text,
  photo_url text,
  notes text,
  min_stock integer not null default 2,
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'esgotado', 'sob_encomenda')),
  sku text unique not null,
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.products is 'Produtos (pijamas) em estoque';

-- ============================================================================
-- 3. TABELA: customers
-- Clientes
-- ============================================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text,
  instagram text,
  city text,
  state char(2),
  preferred_style text,
  preferred_size text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.customers is 'Clientes da loja';

-- ============================================================================
-- 4. TABELA: sales
-- Vendas / orçamentos
-- ============================================================================
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  customer_id uuid references public.customers(id),
  channel text check (channel in ('whatsapp', 'instagram')),
  discount numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  total numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  amount_pending numeric(10,2) generated always as (total - amount_paid) stored,
  payment_method text check (payment_method in ('pix', 'dinheiro', 'credito', 'debito', 'transferencia', 'outro')),
  payment_status text not null default 'pendente' check (payment_status in ('pendente', 'parcial', 'pago')),
  sale_status text not null default 'orcamento' check (sale_status in ('orcamento', 'reservada', 'aguardando_pagamento', 'paga', 'enviada', 'entregue', 'cancelada')),
  tracking_code text,
  due_date date,
  notes text,
  reservation_deadline timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.sales is 'Vendas e orçamentos';

-- ============================================================================
-- 5. TABELA: sale_items
-- Itens de cada venda
-- ============================================================================
create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references public.sales(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  cost_price numeric(10,2) not null, -- snapshot do custo do produto no momento da venda
  created_at timestamptz default now()
);

comment on table public.sale_items is 'Itens vendidos em cada venda, com preço de custo congelado';

-- ============================================================================
-- 6. TABELA: payments
-- Pagamentos recebidos por venda
-- ============================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references public.sales(id),
  amount numeric(10,2) not null,
  method text check (method in ('pix', 'dinheiro', 'credito', 'debito', 'transferencia', 'outro')),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

comment on table public.payments is 'Pagamentos recebidos referentes a cada venda';

-- ============================================================================
-- 7. TABELA: stock_movements
-- Movimentações de estoque
-- ============================================================================
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  type text not null check (type in ('entrada', 'venda', 'troca', 'devolucao', 'perda', 'avaria', 'ajuste')),
  quantity integer not null,
  previous_quantity integer not null,
  new_quantity integer not null,
  reason text,
  sale_id uuid references public.sales(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

comment on table public.stock_movements is 'Histórico de movimentações de estoque';

-- ============================================================================
-- 8. TABELA: sale_status_history
-- Histórico de mudanças de status das vendas
-- ============================================================================
create table if not exists public.sale_status_history (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references public.sales(id),
  previous_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

comment on table public.sale_status_history is 'Histórico de alterações de status de cada venda';

-- ============================================================================
-- ÍNDICES
-- ============================================================================
create index if not exists idx_products_name on public.products (name);
create index if not exists idx_products_collection on public.products (collection);
create index if not exists idx_products_sku on public.products (sku);
create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_archived on public.products (archived);

create index if not exists idx_customers_name on public.customers (name);
create index if not exists idx_customers_whatsapp on public.customers (whatsapp);
create index if not exists idx_customers_instagram on public.customers (instagram);

create index if not exists idx_sales_customer_id on public.sales (customer_id);
create index if not exists idx_sales_sale_status on public.sales (sale_status);
create index if not exists idx_sales_payment_status on public.sales (payment_status);
create index if not exists idx_sales_created_at on public.sales (created_at);

create index if not exists idx_sale_items_sale_id on public.sale_items (sale_id);
create index if not exists idx_sale_items_product_id on public.sale_items (product_id);

create index if not exists idx_stock_movements_product_id on public.stock_movements (product_id);
create index if not exists idx_stock_movements_type on public.stock_movements (type);
create index if not exists idx_stock_movements_created_at on public.stock_movements (created_at);

create index if not exists idx_sale_status_history_sale_id on public.sale_status_history (sale_id);

-- ============================================================================
-- FUNÇÃO E TRIGGER: update_updated_at
-- Atualiza automaticamente o campo updated_at em qualquer UPDATE
-- ============================================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row
  execute function public.update_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
  before update on public.customers
  for each row
  execute function public.update_updated_at();

drop trigger if exists trg_sales_updated_at on public.sales;
create trigger trg_sales_updated_at
  before update on public.sales
  for each row
  execute function public.update_updated_at();

-- ============================================================================
-- FUNÇÃO E TRIGGER: generate_sale_code
-- Gera automaticamente um código sequencial para a venda (V0001, V0002, ...)
-- ============================================================================
create or replace function public.generate_sale_code()
returns trigger
language plpgsql
as $$
declare
  next_number integer;
begin
  if new.code is not null then
    return new;
  end if;

  -- Extrai o maior número já usado nos códigos existentes (padrão V0001)
  select coalesce(max(cast(substring(code from 2) as integer)), 0) + 1
  into next_number
  from public.sales
  where code ~ '^V[0-9]+$';

  new.code := 'V' || lpad(next_number::text, 4, '0');

  return new;
end;
$$;

drop trigger if exists trg_generate_sale_code on public.sales;
create trigger trg_generate_sale_code
  before insert on public.sales
  for each row
  execute function public.generate_sale_code();

-- ============================================================================
-- FUNÇÃO: process_stock_for_sale
-- Controla as movimentações de estoque de forma transacional quando o
-- status de uma venda muda. Usa FOR UPDATE para evitar condições de corrida.
-- ============================================================================
create or replace function public.process_stock_for_sale()
returns trigger
language plpgsql
as $$
declare
  item record;
  prod record;
begin
  -- Só processa se o status realmente mudou (ou é um insert com status inicial relevante)
  if tg_op = 'UPDATE' and old.sale_status = new.sale_status then
    return new;
  end if;

  -- --------------------------------------------------------------------
  -- Caso 1: status muda PARA 'reservada' -> reserva estoque (decrementa)
  -- --------------------------------------------------------------------
  if new.sale_status = 'reservada' and (tg_op = 'INSERT' or old.sale_status is distinct from 'reservada') then
    -- Evita dupla decrementação: só decrementa se vindo de status que ainda não decrementou estoque
    if tg_op = 'INSERT' or old.sale_status in ('orcamento', 'aguardando_pagamento') or old.sale_status is null then
      for item in
        select si.product_id, si.quantity
        from public.sale_items si
        where si.sale_id = new.id
      loop
        select * into prod from public.products where id = item.product_id for update;

        if prod.quantity < item.quantity then
          raise exception 'Estoque insuficiente para o produto % (disponível: %, solicitado: %)',
            item.product_id, prod.quantity, item.quantity;
        end if;

        update public.products
        set quantity = quantity - item.quantity
        where id = item.product_id;

        insert into public.stock_movements (
          product_id, type, quantity, previous_quantity, new_quantity, reason, sale_id, created_by
        ) values (
          item.product_id, 'venda', -item.quantity, prod.quantity, prod.quantity - item.quantity,
          'Reserva de estoque para venda ' || new.code, new.id, new.created_by
        );
      end loop;
    end if;

  -- --------------------------------------------------------------------
  -- Caso 2: status muda PARA 'paga'
  -- --------------------------------------------------------------------
  elsif new.sale_status = 'paga' and (tg_op = 'INSERT' or old.sale_status is distinct from 'paga') then

    if tg_op = 'UPDATE' and old.sale_status = 'reservada' then
      -- Estoque já foi decrementado na reserva; apenas registra o log, sem nova baixa
      insert into public.sale_status_history (sale_id, previous_status, new_status, changed_by)
      values (new.id, old.sale_status, new.sale_status, new.created_by)
      on conflict do nothing;
      -- (o registro completo do histórico é feito pelo trigger record_sale_status_change)
    else
      -- Vindo de outro status (orcamento, aguardando_pagamento, etc.) -> decrementa estoque agora
      for item in
        select si.product_id, si.quantity
        from public.sale_items si
        where si.sale_id = new.id
      loop
        select * into prod from public.products where id = item.product_id for update;

        if prod.quantity < item.quantity then
          raise exception 'Estoque insuficiente para o produto % (disponível: %, solicitado: %)',
            item.product_id, prod.quantity, item.quantity;
        end if;

        update public.products
        set quantity = quantity - item.quantity
        where id = item.product_id;

        insert into public.stock_movements (
          product_id, type, quantity, previous_quantity, new_quantity, reason, sale_id, created_by
        ) values (
          item.product_id, 'venda', -item.quantity, prod.quantity, prod.quantity - item.quantity,
          'Baixa de estoque para venda ' || new.code, new.id, new.created_by
        );
      end loop;
    end if;

  -- --------------------------------------------------------------------
  -- Caso 3: status muda PARA 'cancelada' vindo de 'reservada' ou 'paga'
  -- -> restaura o estoque que havia sido decrementado
  -- --------------------------------------------------------------------
  elsif new.sale_status = 'cancelada' and tg_op = 'UPDATE' and old.sale_status in ('reservada', 'paga') then
    for item in
      select si.product_id, si.quantity
      from public.sale_items si
      where si.sale_id = new.id
    loop
      select * into prod from public.products where id = item.product_id for update;

      update public.products
      set quantity = quantity + item.quantity
      where id = item.product_id;

      insert into public.stock_movements (
        product_id, type, quantity, previous_quantity, new_quantity, reason, sale_id, created_by
      ) values (
        item.product_id, 'devolucao', item.quantity, prod.quantity, prod.quantity + item.quantity,
        'Cancelamento da venda ' || new.code || ' - estoque restaurado', new.id, new.created_by
      );
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_process_stock_for_sale on public.sales;
create trigger trg_process_stock_for_sale
  after insert or update of sale_status on public.sales
  for each row
  execute function public.process_stock_for_sale();

-- ============================================================================
-- FUNÇÃO E TRIGGER: record_sale_status_change
-- Registra no histórico toda alteração de status de uma venda
-- ============================================================================
create or replace function public.record_sale_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.sale_status_history (sale_id, previous_status, new_status, changed_by)
    values (new.id, null, new.sale_status, new.created_by);
  elsif tg_op = 'UPDATE' and old.sale_status is distinct from new.sale_status then
    insert into public.sale_status_history (sale_id, previous_status, new_status, changed_by)
    values (new.id, old.sale_status, new.sale_status, new.created_by);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_record_sale_status_change on public.sales;
create trigger trg_record_sale_status_change
  after insert or update of sale_status on public.sales
  for each row
  execute function public.record_sale_status_change();

-- ============================================================================
-- FUNÇÃO E TRIGGER: update_product_status
-- Define automaticamente o status do produto com base na quantidade
-- ============================================================================
create or replace function public.update_product_status()
returns trigger
language plpgsql
as $$
begin
  if new.quantity <= 0 then
    new.status := 'esgotado';
  elsif new.status = 'esgotado' and new.quantity > 0 then
    -- volta a ficar disponível quando o estoque é reabastecido
    new.status := 'disponivel';
  end if;
  -- Se o status já estiver como 'reservado', mantém (definido manualmente/por outra lógica)

  return new;
end;
$$;

drop trigger if exists trg_update_product_status on public.products;
create trigger trg_update_product_status
  before insert or update of quantity on public.products
  for each row
  execute function public.update_product_status();

-- ============================================================================
-- FUNÇÃO E TRIGGER: update_sale_payment_status
-- Recalcula o payment_status da venda com base em amount_paid x total
-- ============================================================================
create or replace function public.update_sale_payment_status()
returns trigger
language plpgsql
as $$
begin
  if new.amount_paid <= 0 then
    new.payment_status := 'pendente';
  elsif new.amount_paid >= new.total and new.total > 0 then
    new.payment_status := 'pago';
  else
    new.payment_status := 'parcial';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_update_sale_payment_status on public.sales;
create trigger trg_update_sale_payment_status
  before insert or update of amount_paid, total on public.sales
  for each row
  execute function public.update_sale_payment_status();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments enable row level security;
alter table public.stock_movements enable row level security;
alter table public.sale_status_history enable row level security;

-- Função auxiliar: verifica se o usuário autenticado é admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_insert_all" on public.profiles;
create policy "profiles_insert_all" on public.profiles
  for insert to authenticated with check (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated using (public.is_admin());

-- ----------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  for select to authenticated using (true);

drop policy if exists "products_insert_all" on public.products;
create policy "products_insert_all" on public.products
  for insert to authenticated with check (true);

drop policy if exists "products_update_all" on public.products;
create policy "products_update_all" on public.products
  for update to authenticated using (true) with check (true);

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin" on public.products
  for delete to authenticated using (public.is_admin());

-- ----------------------------------------------------------------------
-- customers
-- ----------------------------------------------------------------------
drop policy if exists "customers_select_all" on public.customers;
create policy "customers_select_all" on public.customers
  for select to authenticated using (true);

drop policy if exists "customers_insert_all" on public.customers;
create policy "customers_insert_all" on public.customers
  for insert to authenticated with check (true);

drop policy if exists "customers_update_all" on public.customers;
create policy "customers_update_all" on public.customers
  for update to authenticated using (true) with check (true);

drop policy if exists "customers_delete_admin" on public.customers;
create policy "customers_delete_admin" on public.customers
  for delete to authenticated using (public.is_admin());

-- ----------------------------------------------------------------------
-- sales
-- ----------------------------------------------------------------------
drop policy if exists "sales_select_all" on public.sales;
create policy "sales_select_all" on public.sales
  for select to authenticated using (true);

drop policy if exists "sales_insert_all" on public.sales;
create policy "sales_insert_all" on public.sales
  for insert to authenticated with check (true);

drop policy if exists "sales_update_all" on public.sales;
create policy "sales_update_all" on public.sales
  for update to authenticated using (true) with check (true);

drop policy if exists "sales_delete_admin" on public.sales;
create policy "sales_delete_admin" on public.sales
  for delete to authenticated using (public.is_admin());

-- ----------------------------------------------------------------------
-- sale_items
-- ----------------------------------------------------------------------
drop policy if exists "sale_items_select_all" on public.sale_items;
create policy "sale_items_select_all" on public.sale_items
  for select to authenticated using (true);

drop policy if exists "sale_items_insert_all" on public.sale_items;
create policy "sale_items_insert_all" on public.sale_items
  for insert to authenticated with check (true);

drop policy if exists "sale_items_update_all" on public.sale_items;
create policy "sale_items_update_all" on public.sale_items
  for update to authenticated using (true) with check (true);

drop policy if exists "sale_items_delete_admin" on public.sale_items;
create policy "sale_items_delete_admin" on public.sale_items
  for delete to authenticated using (public.is_admin());

-- ----------------------------------------------------------------------
-- payments
-- ----------------------------------------------------------------------
drop policy if exists "payments_select_all" on public.payments;
create policy "payments_select_all" on public.payments
  for select to authenticated using (true);

drop policy if exists "payments_insert_all" on public.payments;
create policy "payments_insert_all" on public.payments
  for insert to authenticated with check (true);

drop policy if exists "payments_update_all" on public.payments;
create policy "payments_update_all" on public.payments
  for update to authenticated using (true) with check (true);

drop policy if exists "payments_delete_admin" on public.payments;
create policy "payments_delete_admin" on public.payments
  for delete to authenticated using (public.is_admin());

-- ----------------------------------------------------------------------
-- stock_movements
-- ----------------------------------------------------------------------
drop policy if exists "stock_movements_select_all" on public.stock_movements;
create policy "stock_movements_select_all" on public.stock_movements
  for select to authenticated using (true);

drop policy if exists "stock_movements_insert_all" on public.stock_movements;
create policy "stock_movements_insert_all" on public.stock_movements
  for insert to authenticated with check (true);

drop policy if exists "stock_movements_update_all" on public.stock_movements;
create policy "stock_movements_update_all" on public.stock_movements
  for update to authenticated using (true) with check (true);

drop policy if exists "stock_movements_delete_admin" on public.stock_movements;
create policy "stock_movements_delete_admin" on public.stock_movements
  for delete to authenticated using (public.is_admin());

-- ----------------------------------------------------------------------
-- sale_status_history
-- ----------------------------------------------------------------------
drop policy if exists "sale_status_history_select_all" on public.sale_status_history;
create policy "sale_status_history_select_all" on public.sale_status_history
  for select to authenticated using (true);

drop policy if exists "sale_status_history_insert_all" on public.sale_status_history;
create policy "sale_status_history_insert_all" on public.sale_status_history
  for insert to authenticated with check (true);

drop policy if exists "sale_status_history_update_all" on public.sale_status_history;
create policy "sale_status_history_update_all" on public.sale_status_history
  for update to authenticated using (true) with check (true);

drop policy if exists "sale_status_history_delete_admin" on public.sale_status_history;
create policy "sale_status_history_delete_admin" on public.sale_status_history
  for delete to authenticated using (public.is_admin());

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
