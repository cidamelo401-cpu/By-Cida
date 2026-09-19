-- ============================================================================
-- DMS Camisas - LIMPEZA DOS DADOS DE DEMONSTRAÇÃO
-- ============================================================================
-- Remove todos os registros inseridos por `seed.sql`, identificados pelos
-- UUIDs fixos no padrão '00000000-0000-0000-0000-0000000000XX'.
--
-- Execute este script para reverter completamente o seed de demonstração.
-- A ordem dos DELETEs respeita as dependências de chave estrangeira
-- (tabelas filhas antes das tabelas pai).
-- ============================================================================

begin;

-- 1. Histórico de status das vendas de demonstração
delete from public.sale_status_history
where sale_id in (
  select id from public.sales where id::text like '00000000-0000-0000-0000-0000000002%'
);

-- 2. Pagamentos das vendas de demonstração
delete from public.payments
where id::text like '00000000-0000-0000-0000-0000000004%'
   or sale_id in (
     select id from public.sales where id::text like '00000000-0000-0000-0000-0000000002%'
   );

-- 3. Itens das vendas de demonstração
delete from public.sale_items
where id::text like '00000000-0000-0000-0000-0000000003%'
   or sale_id in (
     select id from public.sales where id::text like '00000000-0000-0000-0000-0000000002%'
   );

-- 4. Movimentações de estoque geradas manualmente (entradas) e pelas
--    vendas de demonstração (do trigger process_stock_for_sale)
delete from public.stock_movements
where id::text like '00000000-0000-0000-0000-0000000005%'
   or sale_id in (
     select id from public.sales where id::text like '00000000-0000-0000-0000-0000000002%'
   )
   or product_id in (
     select id from public.products where id::text like '00000000-0000-0000-0000-0000000000%'
   );

-- 5. Vendas de demonstração
delete from public.sales
where id::text like '00000000-0000-0000-0000-0000000002%';

-- 6. Clientes de demonstração
delete from public.customers
where id::text like '00000000-0000-0000-0000-0000000001%';

-- 7. Produtos de demonstração
delete from public.products
where id::text like '00000000-0000-0000-0000-0000000000%';

commit;

-- ============================================================================
-- FIM DA LIMPEZA
-- ============================================================================
