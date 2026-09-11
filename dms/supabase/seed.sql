-- ============================================================================
-- DMS Camisas - DADOS DE DEMONSTRAÇÃO (SEED)
-- ============================================================================
-- ATENÇÃO: Este arquivo popula o banco com dados FICTÍCIOS para demonstração
-- e testes. NÃO execute em ambiente de produção.
--
-- Todos os registros de demonstração usam UUIDs fixos no padrão
-- '00000000-0000-0000-0000-0000000000XX', o que os torna facilmente
-- identificáveis e referenciáveis:
--   - Produtos:            ...0001 a ...0010
--   - Clientes:             ...0101 a ...0105
--   - Vendas:                ...0201 a ...0207
--   - Itens de venda:         ...0301 em diante
--   - Pagamentos:               ...0401 em diante
--   - Movimentações de estoque:  ...0501 em diante
--
-- Para remover todos os dados de demonstração, execute o script
-- `cleanup_demo.sql` que acompanha este arquivo.
--
-- NOTA IMPORTANTE SOBRE OS TRIGGERS DO BANCO:
--   - `code` das vendas é gerado automaticamente pelo trigger
--     `generate_sale_code` (V0001, V0002, ...) — por isso NÃO informamos
--     esse campo nos INSERTs de `sales`.
--   - `amount_pending` é uma coluna gerada (total - amount_paid) — também
--     não é informada.
--   - `payment_status` é recalculado automaticamente pelo trigger
--     `update_sale_payment_status`.
--   - O trigger `process_stock_for_sale` ajusta `products.quantity`
--     automaticamente quando `sale_status` é definido/alterado para
--     'reservada', 'paga' ou 'cancelada'. Por isso os produtos são
--     inseridos com a quantidade "pré-vendas" necessária para que, depois
--     que os triggers rodarem, o estoque final fique nos valores descritos
--     nos comentários de cada produto.
--   - Algumas vendas (V0001 "entregue" e V0006 "cancelada") são inseridas
--     em duas etapas (INSERT + UPDATE) para que o trigger de estoque seja
--     acionado corretamente na transição de status desejada.
-- ============================================================================

begin;

-- ============================================================================
-- 1. PRODUTOS
-- Quantidades iniciais consideram o efeito das vendas inseridas mais abaixo,
-- de forma que o estoque final resultante fique conforme o comentário de
-- cada linha.
-- ============================================================================
insert into public.products
  (id, team, country_league, season, model, version, size, quantity, cost_price, sell_price, supplier, min_stock, sku, status)
values
  -- 1. Flamengo M: inicial 10 -> após V0001 (-1) e V0004 (-1) fica em 8
  ('00000000-0000-0000-0000-000000000001', 'Flamengo', 'Brasil - Série A', '2025/2026', 'titular', 'torcedor', 'M', 10, 89.90, 179.90, 'Fornecedor Demo Ltda', 2, 'FLAMENGO-2526-TIT-TOR-M', 'disponivel'),

  -- 2. Flamengo G: inicial 5 -> reservado (-1) e cancelado (+1) na V0006, volta a 5
  ('00000000-0000-0000-0000-000000000002', 'Flamengo', 'Brasil - Série A', '2025/2026', 'titular', 'torcedor', 'G', 5, 89.90, 179.90, 'Fornecedor Demo Ltda', 2, 'FLAMENGO-2526-TIT-TOR-G', 'disponivel'),

  -- 3. Real Madrid M: inicial 7 -> após V0001 (-1) fica em 6
  ('00000000-0000-0000-0000-000000000003', 'Real Madrid', 'Espanha - LaLiga', '2025/2026', 'titular', 'torcedor', 'M', 7, 109.90, 219.90, 'Fornecedor Demo Ltda', 2, 'REALMADRID-2526-TIT-TOR-M', 'disponivel'),

  -- 4. Barcelona G (reserva/jogador): inicial 4 -> após V0002 (-1) fica em 3
  ('00000000-0000-0000-0000-000000000004', 'Barcelona', 'Espanha - LaLiga', '2025/2026', 'reserva', 'jogador', 'G', 4, 149.90, 299.90, 'Fornecedor Demo Ltda', 1, 'BARCELONA-2526-RES-JOG-G', 'disponivel'),

  -- 5. Corinthians GG: V0003 fica em "aguardando_pagamento" (não mexe em estoque) -> permanece 4
  ('00000000-0000-0000-0000-000000000005', 'Corinthians', 'Brasil - Série A', '2025/2026', 'titular', 'torcedor', 'GG', 4, 79.90, 159.90, 'Fornecedor Demo Ltda', 2, 'CORINTHIANS-2526-TIT-TOR-GG', 'disponivel'),

  -- 6. São Paulo M (terceiro uniforme): V0007 fica em "orcamento" (não mexe em estoque) -> ESTOQUE BAIXO
  ('00000000-0000-0000-0000-000000000006', 'São Paulo', 'Brasil - Série A', '2025/2026', 'terceiro', 'torcedor', 'M', 2, 84.90, 169.90, 'Fornecedor Demo Ltda', 2, 'SAOPAULO-2526-TER-TOR-M', 'disponivel'),

  -- 7. Palmeiras P: inicial 2 -> após V0005 (-1) fica em 1 -> ESTOQUE BAIXO
  ('00000000-0000-0000-0000-000000000007', 'Palmeiras', 'Brasil - Série A', '2025/2026', 'titular', 'torcedor', 'P', 2, 89.90, 179.90, 'Fornecedor Demo Ltda', 2, 'PALMEIRAS-2526-TIT-TOR-P', 'disponivel'),

  -- 8. Manchester City G (jogador): inicial 8 -> após V0002 (-1) fica em 7
  ('00000000-0000-0000-0000-000000000008', 'Manchester City', 'Inglaterra - Premier League', '2025/2026', 'titular', 'jogador', 'G', 8, 159.90, 319.90, 'Fornecedor Demo Ltda', 2, 'MANCHESTERCITY-2526-TIT-JOG-G', 'disponivel'),

  -- 9. PSG M (reserva/torcedor): sem vendas associadas -> ESGOTADO (trigger força status ao ver quantity = 0)
  ('00000000-0000-0000-0000-000000000009', 'PSG', 'França - Ligue 1', '2025/2026', 'reserva', 'torcedor', 'M', 0, 119.90, 239.90, 'Fornecedor Demo Ltda', 2, 'PSG-2526-RES-TOR-M', 'disponivel'),

  -- 10. Seleção Brasil M: inicial 11 -> após V0004 (-1) fica em 10
  ('00000000-0000-0000-0000-000000000010', 'Seleção Brasil', 'CBF', '2025/2026', 'titular', 'torcedor', 'M', 11, 99.90, 199.90, 'Fornecedor Demo Ltda', 3, 'BRASIL-2526-TIT-TOR-M', 'disponivel');

-- ============================================================================
-- 2. MOVIMENTAÇÕES DE ESTOQUE - ENTRADA INICIAL
-- Registra manualmente a entrada de estoque inicial de cada produto (o
-- trigger de vendas só cria movimentações do tipo 'venda'/'devolucao').
-- ============================================================================
insert into public.stock_movements
  (id, product_id, type, quantity, previous_quantity, new_quantity, reason, sale_id, created_by)
values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 'entrada', 10, 0, 10, 'Estoque inicial (dados demo)', null, null),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000002', 'entrada', 5, 0, 5, 'Estoque inicial (dados demo)', null, null),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000003', 'entrada', 7, 0, 7, 'Estoque inicial (dados demo)', null, null),
  ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000004', 'entrada', 4, 0, 4, 'Estoque inicial (dados demo)', null, null),
  ('00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000005', 'entrada', 4, 0, 4, 'Estoque inicial (dados demo)', null, null),
  ('00000000-0000-0000-0000-000000000506', '00000000-0000-0000-0000-000000000006', 'entrada', 2, 0, 2, 'Estoque inicial (dados demo)', null, null),
  ('00000000-0000-0000-0000-000000000507', '00000000-0000-0000-0000-000000000007', 'entrada', 2, 0, 2, 'Estoque inicial (dados demo)', null, null),
  ('00000000-0000-0000-0000-000000000508', '00000000-0000-0000-0000-000000000008', 'entrada', 8, 0, 8, 'Estoque inicial (dados demo)', null, null),
  ('00000000-0000-0000-0000-000000000509', '00000000-0000-0000-0000-000000000009', 'entrada', 0, 0, 0, 'Estoque inicial (dados demo) - lote esgotado na chegada', null, null),
  ('00000000-0000-0000-0000-000000000510', '00000000-0000-0000-0000-000000000010', 'entrada', 11, 0, 11, 'Estoque inicial (dados demo)', null, null);

-- ============================================================================
-- 3. CLIENTES
-- ============================================================================
insert into public.customers
  (id, name, whatsapp, instagram, city, state, favorite_team, preferred_size, notes)
values
  ('00000000-0000-0000-0000-000000000101', 'Lucas Silva', '(11) 99999-1001', '@lucas.silva', 'São Paulo', 'SP', 'Flamengo', 'M', 'Cliente de demonstração'),
  ('00000000-0000-0000-0000-000000000102', 'Maria Santos', '(21) 98888-2002', '@maria.santos', 'Rio de Janeiro', 'RJ', 'Real Madrid', 'G', 'Cliente de demonstração'),
  ('00000000-0000-0000-0000-000000000103', 'Pedro Oliveira', '(31) 97777-3003', '@pedro.oliv', 'Belo Horizonte', 'MG', 'Corinthians', 'GG', 'Cliente de demonstração'),
  ('00000000-0000-0000-0000-000000000104', 'Ana Costa', '(11) 96666-4004', '@anacosta', 'São Paulo', 'SP', 'Barcelona', 'M', 'Cliente de demonstração'),
  ('00000000-0000-0000-0000-000000000105', 'João Mendes', '(85) 95555-5005', '@joao.mendes', 'Fortaleza', 'CE', 'Palmeiras', 'P', 'Cliente de demonstração');

-- ============================================================================
-- 4. VENDAS
-- Inseridas em ordem para gerar os códigos V0001..V0007 sequencialmente.
-- ============================================================================

-- ----------------------------------------------------------------------
-- V0001 - Lucas Silva - Flamengo M + Real Madrid M - PAGA -> ENTREGUE
-- Inserida como 'paga' (o trigger de estoque decrementa o estoque) e, em
-- seguida, atualizada para 'entregue' (transição que não mexe em estoque).
-- ----------------------------------------------------------------------
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, payment_method, sale_status, tracking_code, notes)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'whatsapp', 0, 0, 399.80, 399.80, 'pix', 'paga', 'BR123456789DEMO', 'Venda de demonstração - kit completo Flamengo + Real Madrid');

update public.sales
set sale_status = 'entregue'
where id = '00000000-0000-0000-0000-000000000201';

-- ----------------------------------------------------------------------
-- V0002 - Maria Santos - Barcelona G + Man City G - PAGA
-- ----------------------------------------------------------------------
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, payment_method, sale_status, notes)
values
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 'instagram', 20.00, 25.00, 624.80, 624.80, 'credito', 'paga', 'Venda de demonstração - com desconto e frete');

-- ----------------------------------------------------------------------
-- V0003 - Pedro Oliveira - Corinthians GG - AGUARDANDO PAGAMENTO (parcial)
-- ----------------------------------------------------------------------
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, payment_method, sale_status, due_date, notes)
values
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', 'whatsapp', 0, 0, 159.90, 80.00, 'pix', 'aguardando_pagamento', current_date + interval '7 days', 'Venda de demonstração - pagamento parcial (sinal)');

-- ----------------------------------------------------------------------
-- V0004 - Ana Costa - Flamengo M + Brasil M - RESERVADA (ativa, prazo futuro)
-- ----------------------------------------------------------------------
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, sale_status, reservation_deadline, notes)
values
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000104', 'instagram', 0, 0, 379.80, 0, 'reservada', now() + interval '3 days', 'Venda de demonstração - reserva ativa');

-- ----------------------------------------------------------------------
-- V0005 - João Mendes - Palmeiras P - RESERVADA (vencida, prazo no passado)
-- ----------------------------------------------------------------------
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, sale_status, reservation_deadline, notes)
values
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000105', 'whatsapp', 0, 0, 179.90, 0, 'reservada', now() - interval '2 days', 'Venda de demonstração - reserva vencida (não retirada no prazo)');

-- ----------------------------------------------------------------------
-- V0006 - Lucas Silva - Flamengo G - RESERVADA -> CANCELADA
-- Inserida como 'reservada' (decrementa estoque) e depois cancelada
-- (o trigger restaura o estoque automaticamente).
-- ----------------------------------------------------------------------
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, sale_status, reservation_deadline, notes)
values
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000101', 'whatsapp', 0, 0, 179.90, 0, 'reservada', now() + interval '1 day', 'Venda de demonstração - reserva que foi cancelada');

update public.sales
set sale_status = 'cancelada', notes = 'Venda de demonstração - cancelada: cliente desistiu da compra'
where id = '00000000-0000-0000-0000-000000000206';

-- ----------------------------------------------------------------------
-- V0007 - Maria Santos - São Paulo M - ORÇAMENTO (ainda não confirmado)
-- ----------------------------------------------------------------------
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, sale_status, notes)
values
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000102', 'instagram', 0, 0, 169.90, 0, 'orcamento', 'Venda de demonstração - orçamento enviado, aguardando confirmação do cliente');

-- ============================================================================
-- 5. ITENS DE VENDA
-- unit_price e cost_price são "fotografias" dos preços do produto no
-- momento da venda.
-- ============================================================================
insert into public.sale_items
  (id, sale_id, product_id, quantity, unit_price, cost_price)
values
  -- V0001: Flamengo M + Real Madrid M
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 1, 179.90, 89.90),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000003', 1, 219.90, 109.90),

  -- V0002: Barcelona G + Man City G
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000004', 1, 299.90, 149.90),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000008', 1, 319.90, 159.90),

  -- V0003: Corinthians GG
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000005', 1, 159.90, 79.90),

  -- V0004: Flamengo M + Brasil M
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 1, 179.90, 89.90),
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000010', 1, 199.90, 99.90),

  -- V0005: Palmeiras P
  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000007', 1, 179.90, 89.90),

  -- V0006: Flamengo G (venda cancelada)
  ('00000000-0000-0000-0000-000000000309', '00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000002', 1, 179.90, 89.90),

  -- V0007: São Paulo M
  ('00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000006', 1, 169.90, 84.90);

-- ============================================================================
-- 6. PAGAMENTOS
-- Apenas para as vendas que tiveram algum valor recebido.
-- ============================================================================
insert into public.payments
  (id, sale_id, amount, method, notes)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', 399.80, 'pix', 'Pagamento integral via Pix (dados demo)'),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000202', 624.80, 'credito', 'Pagamento integral no cartão de crédito (dados demo)'),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000203', 80.00, 'pix', 'Sinal / pagamento parcial via Pix (dados demo)');

commit;

-- ============================================================================
-- FIM DOS DADOS DE DEMONSTRAÇÃO
-- ============================================================================
