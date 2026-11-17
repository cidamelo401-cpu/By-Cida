-- Permite excluir um lote de compra (ex: lançamento de teste), desfazendo
-- o efeito que ele teve no estoque. Só permite excluir lotes que ainda não
-- tiveram nenhuma unidade vendida (remaining_quantity = quantity e sem
-- alocação em purchase_lot_allocations) — assim nunca se perde o histórico
-- de custo/fornecedor de uma venda já feita. Restrito a admin, mesmo padrão
-- já usado pra excluir fornecedor/lote diretamente na tabela.
create or replace function public.delete_purchase_lot(p_lot_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  lot record;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem excluir compras.';
  end if;

  select * into lot from public.purchase_lots where id = p_lot_id for update;
  if not found then
    raise exception 'Lote de compra não encontrado.';
  end if;

  if lot.remaining_quantity <> lot.quantity
     or exists (select 1 from public.purchase_lot_allocations where purchase_lot_id = p_lot_id) then
    raise exception 'Não é possível excluir: parte desse lote já foi vendida.';
  end if;

  update public.products
  set quantity = quantity - lot.quantity
  where id = lot.product_id;

  insert into public.stock_movements (
    product_id, type, quantity, previous_quantity, new_quantity, reason, created_by
  )
  select p.id, 'ajuste', -lot.quantity, p.quantity + lot.quantity, p.quantity,
         'Exclusão de compra (lote ' || lot.id || ')', auth.uid()
  from public.products p where p.id = lot.product_id;

  delete from public.purchase_lots where id = p_lot_id;
end;
$$;

grant execute on function public.delete_purchase_lot(uuid) to authenticated;
