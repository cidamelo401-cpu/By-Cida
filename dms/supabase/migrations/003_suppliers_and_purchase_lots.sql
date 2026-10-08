-- ============================================================================
-- DMS Camisas - Fornecedores e lotes de compra
-- Migração ADITIVA: cria tabelas novas e um trigger novo em stock_movements.
-- Não altera nem remove nenhuma tabela, coluna, função, trigger ou policy
-- existente. O controle de estoque atual (products.quantity) continua sendo
-- a fonte de verdade e segue funcionando exatamente como antes.
-- ============================================================================

-- ============================================================================
-- 1. TABELA: suppliers
-- Fornecedores de camisas
-- ============================================================================
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  notes text,
  archived boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.suppliers is 'Fornecedores de camisas';

drop trigger if exists trg_suppliers_updated_at on public.suppliers;
create trigger trg_suppliers_updated_at
  before update on public.suppliers
  for each row
  execute function public.update_updated_at();

-- ============================================================================
-- 2. TABELA: purchase_lots
-- Lotes de compra: cada compra feita de um fornecedor, de um produto
-- (time+modelo+versão+tamanho) específico, com custo e quantidade próprios.
-- Isso permite que o mesmo produto tenha lotes de fornecedores diferentes
-- coexistindo em estoque, sem perder o custo/fornecedor de cada um.
-- ============================================================================
create table if not exists public.purchase_lots (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id),
  product_id uuid not null references public.products(id),
  purchase_date date not null default current_date,
  quantity integer not null check (quantity > 0),
  remaining_quantity integer not null check (remaining_quantity >= 0),
  unit_cost numeric(10,2) not null check (unit_cost >= 0),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint purchase_lots_remaining_le_quantity check (remaining_quantity <= quantity)
);

comment on table public.purchase_lots is 'Lotes de compra de produtos por fornecedor (custo e quantidade próprios)';

drop trigger if exists trg_purchase_lots_updated_at on public.purchase_lots;
create trigger trg_purchase_lots_updated_at
  before update on public.purchase_lots
  for each row
  execute function public.update_updated_at();

-- ============================================================================
-- 3. TABELA: purchase_lot_allocations
-- Registro de qual(is) lote(s) cobriram cada venda (FIFO: lote mais antigo
-- primeiro), para saber o custo/fornecedor real de cada unidade vendida.
-- ============================================================================
create table if not exists public.purchase_lot_allocations (
  id uuid primary key default gen_random_uuid(),
  stock_movement_id uuid not null references public.stock_movements(id) on delete cascade,
  purchase_lot_id uuid not null references public.purchase_lots(id),
  quantity integer not null check (quantity > 0),
  unit_cost numeric(10,2) not null,
  created_at timestamptz default now()
);

comment on table public.purchase_lot_allocations is 'Qual lote de compra foi consumido por cada movimentação de estoque (FIFO)';

-- ============================================================================
-- ÍNDICES
-- ============================================================================
create index if not exists idx_suppliers_name on public.suppliers (name);
create index if not exists idx_suppliers_archived on public.suppliers (archived);

create index if not exists idx_purchase_lots_supplier_id on public.purchase_lots (supplier_id);
create index if not exists idx_purchase_lots_product_id on public.purchase_lots (product_id);
create index if not exists idx_purchase_lots_purchase_date on public.purchase_lots (purchase_date);
create index if not exists idx_purchase_lots_remaining on public.purchase_lots (product_id, remaining_quantity);

create index if not exists idx_purchase_lot_allocations_stock_movement_id on public.purchase_lot_allocations (stock_movement_id);
create index if not exists idx_purchase_lot_allocations_purchase_lot_id on public.purchase_lot_allocations (purchase_lot_id);

-- ============================================================================
-- FUNÇÃO E TRIGGER: allocate_purchase_lots
-- Quando uma venda baixa estoque (stock_movements type = 'venda'), consome
-- os lotes de compra do produto em ordem FIFO (lote mais antigo primeiro) e
-- registra em purchase_lot_allocations qual fornecedor/custo foi usado.
-- Quando uma venda é cancelada (type = 'devolucao'), desfaz exatamente as
-- alocações feitas para aquela venda, devolvendo a quantidade aos lotes.
--
-- Esse trigger é NOVO e roda DEPOIS do trigger já existente que grava em
-- stock_movements (trg_process_stock_for_sale); ele só lê o que já foi
-- inserido lá, nunca altera products.quantity nem o fluxo de vendas.
-- Se não houver lote cadastrado para o produto (ex.: estoque antigo, sem
-- compra registrada), a venda segue normalmente e simplesmente não gera
-- nenhuma alocação de custo — nada quebra por falta de lote.
-- ============================================================================
create or replace function public.allocate_purchase_lots()
returns trigger
language plpgsql
as $$
declare
  remaining_to_allocate integer;
  lot record;
  take_qty integer;
  alloc record;
begin
  if new.type = 'venda' then
    remaining_to_allocate := -new.quantity; -- quantity de 'venda' é gravado negativo

    for lot in
      select * from public.purchase_lots
      where product_id = new.product_id and remaining_quantity > 0
      order by purchase_date asc, created_at asc
      for update
    loop
      exit when remaining_to_allocate <= 0;

      take_qty := least(remaining_to_allocate, lot.remaining_quantity);

      update public.purchase_lots
      set remaining_quantity = remaining_quantity - take_qty
      where id = lot.id;

      insert into public.purchase_lot_allocations (stock_movement_id, purchase_lot_id, quantity, unit_cost)
      values (new.id, lot.id, take_qty, lot.unit_cost);

      remaining_to_allocate := remaining_to_allocate - take_qty;
    end loop;

  elsif new.type = 'devolucao' and new.sale_id is not null then
    for alloc in
      select pla.id, pla.purchase_lot_id, pla.quantity
      from public.purchase_lot_allocations pla
      join public.stock_movements sm on sm.id = pla.stock_movement_id
      where sm.sale_id = new.sale_id and sm.product_id = new.product_id and sm.type = 'venda'
      order by pla.created_at desc
    loop
      update public.purchase_lots
      set remaining_quantity = remaining_quantity + alloc.quantity
      where id = alloc.purchase_lot_id;

      delete from public.purchase_lot_allocations where id = alloc.id;
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_allocate_purchase_lots on public.stock_movements;
create trigger trg_allocate_purchase_lots
  after insert on public.stock_movements
  for each row
  execute function public.allocate_purchase_lots();

-- ============================================================================
-- FUNÇÃO E TRIGGER: create_stock_movement_for_purchase_lot
-- Ao cadastrar um novo lote de compra, registra automaticamente uma entrada
-- de estoque (stock_movements type = 'entrada') e soma a quantidade comprada
-- em products.quantity — assim o lote já entra no estoque disponível do
-- produto sem precisar de um passo manual separado.
-- ============================================================================
create or replace function public.create_stock_movement_for_purchase_lot()
returns trigger
language plpgsql
as $$
declare
  prod record;
begin
  select * into prod from public.products where id = new.product_id for update;

  update public.products
  set quantity = quantity + new.quantity
  where id = new.product_id;

  insert into public.stock_movements (
    product_id, type, quantity, previous_quantity, new_quantity, reason, created_by
  ) values (
    new.product_id, 'entrada', new.quantity, prod.quantity, prod.quantity + new.quantity,
    'Compra registrada (lote ' || new.id || ')', new.created_by
  );

  return new;
end;
$$;

drop trigger if exists trg_create_stock_movement_for_purchase_lot on public.purchase_lots;
create trigger trg_create_stock_movement_for_purchase_lot
  after insert on public.purchase_lots
  for each row
  execute function public.create_stock_movement_for_purchase_lot();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Mesmo padrão já usado nas demais tabelas do sistema.
-- ============================================================================
alter table public.suppliers enable row level security;
alter table public.purchase_lots enable row level security;
alter table public.purchase_lot_allocations enable row level security;

drop policy if exists "suppliers_select_all" on public.suppliers;
create policy "suppliers_select_all" on public.suppliers
  for select to authenticated using (true);

drop policy if exists "suppliers_insert_all" on public.suppliers;
create policy "suppliers_insert_all" on public.suppliers
  for insert to authenticated with check (true);

drop policy if exists "suppliers_update_all" on public.suppliers;
create policy "suppliers_update_all" on public.suppliers
  for update to authenticated using (true) with check (true);

drop policy if exists "suppliers_delete_admin" on public.suppliers;
create policy "suppliers_delete_admin" on public.suppliers
  for delete to authenticated using (public.is_admin());

drop policy if exists "purchase_lots_select_all" on public.purchase_lots;
create policy "purchase_lots_select_all" on public.purchase_lots
  for select to authenticated using (true);

drop policy if exists "purchase_lots_insert_all" on public.purchase_lots;
create policy "purchase_lots_insert_all" on public.purchase_lots
  for insert to authenticated with check (true);

drop policy if exists "purchase_lots_update_all" on public.purchase_lots;
create policy "purchase_lots_update_all" on public.purchase_lots
  for update to authenticated using (true) with check (true);

drop policy if exists "purchase_lots_delete_admin" on public.purchase_lots;
create policy "purchase_lots_delete_admin" on public.purchase_lots
  for delete to authenticated using (public.is_admin());

drop policy if exists "purchase_lot_allocations_select_all" on public.purchase_lot_allocations;
create policy "purchase_lot_allocations_select_all" on public.purchase_lot_allocations
  for select to authenticated using (true);

drop policy if exists "purchase_lot_allocations_insert_all" on public.purchase_lot_allocations;
create policy "purchase_lot_allocations_insert_all" on public.purchase_lot_allocations
  for insert to authenticated with check (true);

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
