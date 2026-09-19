-- ============================================================================
-- Pijamas Digital - DADOS DE DEMONSTRAÇÃO (SEED)
-- ============================================================================
-- ATENÇÃO: Este arquivo popula o banco com dados FICTÍCIOS para demonstração
-- e testes. NÃO execute em ambiente de produção.
-- ============================================================================

begin;

-- ============================================================================
-- 1. PRODUTOS
-- ============================================================================
insert into public.products
  (id, name, collection, color, model, fabric, pattern, size, quantity, cost_price, sell_price, supplier, min_stock, sku, status)
values
  ('00000000-0000-0000-0000-000000000001', 'Conjunto Floral Verão', 'Verão 2025', 'Rosa', 'conjunto', 'algodao', 'floral', 'M', 10, 45.00, 119.90, 'Fornecedor Demo Ltda', 2, 'CONJ-VER25-ROSA-ALG-M', 'disponivel'),
  ('00000000-0000-0000-0000-000000000002', 'Conjunto Floral Verão', 'Verão 2025', 'Rosa', 'conjunto', 'algodao', 'floral', 'G', 5, 45.00, 119.90, 'Fornecedor Demo Ltda', 2, 'CONJ-VER25-ROSA-ALG-G', 'disponivel'),
  ('00000000-0000-0000-0000-000000000003', 'Camisola Cetim Luxo', 'Noivas', 'Branco', 'camisola', 'cetim', 'liso', 'M', 7, 65.00, 189.90, 'Fornecedor Demo Ltda', 2, 'CAM-NOIV-BRANCO-CET-M', 'disponivel'),
  ('00000000-0000-0000-0000-000000000004', 'Short Doll Seda Premium', 'Inverno 2025', 'Azul Marinho', 'short_doll', 'seda', 'liso', 'G', 4, 85.00, 249.90, 'Fornecedor Demo Ltda', 1, 'SD-INV25-AZUL-SED-G', 'disponivel'),
  ('00000000-0000-0000-0000-000000000005', 'Conjunto Xadrez Inverno', 'Inverno 2025', 'Vermelho', 'conjunto', 'fleece', 'xadrez', 'GG', 4, 55.00, 149.90, 'Fornecedor Demo Ltda', 2, 'CONJ-INV25-VERM-FLE-GG', 'disponivel'),
  ('00000000-0000-0000-0000-000000000006', 'Baby Doll Rendado', 'Dia das Mães 2025', 'Lavanda', 'baby_doll', 'seda', 'liso', 'M', 2, 70.00, 179.90, 'Fornecedor Demo Ltda', 2, 'BD-MAE25-LAV-SED-M', 'disponivel'),
  ('00000000-0000-0000-0000-000000000007', 'Roupão Fleece Aconchego', 'Inverno 2025', 'Cinza', 'roupao', 'fleece', 'liso', 'P', 2, 60.00, 159.90, 'Fornecedor Demo Ltda', 2, 'ROU-INV25-CINZA-FLE-P', 'disponivel'),
  ('00000000-0000-0000-0000-000000000008', 'Conjunto Listrado Clássico', 'Primavera 2025', 'Azul Claro', 'conjunto', 'malha', 'listrado', 'G', 8, 40.00, 109.90, 'Fornecedor Demo Ltda', 2, 'CONJ-PRI25-AZULCL-MAL-G', 'disponivel'),
  ('00000000-0000-0000-0000-000000000009', 'Camisola Estampada Tropical', 'Verão 2025', 'Verde', 'camisola', 'algodao', 'estampado', 'M', 0, 50.00, 139.90, 'Fornecedor Demo Ltda', 2, 'CAM-VER25-VERDE-ALG-M', 'disponivel'),
  ('00000000-0000-0000-0000-000000000010', 'Conjunto Natal Família', 'Natal 2024', 'Vermelho', 'conjunto', 'algodao', 'estampado', 'M', 11, 48.00, 129.90, 'Fornecedor Demo Ltda', 3, 'CONJ-NAT24-VERM-ALG-M', 'disponivel');

-- ============================================================================
-- 2. MOVIMENTAÇÕES DE ESTOQUE - ENTRADA INICIAL
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
  ('00000000-0000-0000-0000-000000000509', '00000000-0000-0000-0000-000000000009', 'entrada', 0, 0, 0, 'Estoque inicial (dados demo) - esgotado', null, null),
  ('00000000-0000-0000-0000-000000000510', '00000000-0000-0000-0000-000000000010', 'entrada', 11, 0, 11, 'Estoque inicial (dados demo)', null, null);

-- ============================================================================
-- 3. CLIENTES
-- ============================================================================
insert into public.customers
  (id, name, whatsapp, instagram, city, state, preferred_style, preferred_size, notes)
values
  ('00000000-0000-0000-0000-000000000101', 'Lucas Silva', '(11) 99999-1001', '@lucas.silva', 'São Paulo', 'SP', 'Conjunto', 'M', 'Cliente de demonstração'),
  ('00000000-0000-0000-0000-000000000102', 'Maria Santos', '(21) 98888-2002', '@maria.santos', 'Rio de Janeiro', 'RJ', 'Camisola', 'G', 'Cliente de demonstração'),
  ('00000000-0000-0000-0000-000000000103', 'Pedro Oliveira', '(31) 97777-3003', '@pedro.oliv', 'Belo Horizonte', 'MG', 'Conjunto', 'GG', 'Cliente de demonstração'),
  ('00000000-0000-0000-0000-000000000104', 'Ana Costa', '(11) 96666-4004', '@anacosta', 'São Paulo', 'SP', 'Short Doll', 'M', 'Cliente de demonstração'),
  ('00000000-0000-0000-0000-000000000105', 'João Mendes', '(85) 95555-5005', '@joao.mendes', 'Fortaleza', 'CE', 'Roupão', 'P', 'Cliente de demonstração');

-- ============================================================================
-- 4. VENDAS
-- ============================================================================

-- V0001 - Lucas Silva - Conjunto Floral M + Camisola Cetim M - PAGA -> ENTREGUE
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, payment_method, sale_status, tracking_code, notes)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'whatsapp', 0, 0, 309.80, 309.80, 'pix', 'paga', 'BR123456789DEMO', 'Venda demo - Conjunto Floral + Camisola Cetim');

update public.sales
set sale_status = 'entregue'
where id = '00000000-0000-0000-0000-000000000201';

-- V0002 - Maria Santos - Short Doll Seda G + Conjunto Listrado G - PAGA
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, payment_method, sale_status, notes)
values
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 'instagram', 20.00, 25.00, 364.80, 364.80, 'credito', 'paga', 'Venda demo - com desconto e frete');

-- V0003 - Pedro Oliveira - Conjunto Xadrez GG - AGUARDANDO PAGAMENTO
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, payment_method, sale_status, due_date, notes)
values
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', 'whatsapp', 0, 0, 149.90, 80.00, 'pix', 'aguardando_pagamento', current_date + interval '7 days', 'Venda demo - pagamento parcial');

-- V0004 - Ana Costa - Conjunto Floral M + Conjunto Natal M - RESERVADA
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, sale_status, reservation_deadline, notes)
values
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000104', 'instagram', 0, 0, 249.80, 0, 'reservada', now() + interval '3 days', 'Venda demo - reserva ativa');

-- V0005 - João Mendes - Roupão Fleece P - RESERVADA (vencida)
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, sale_status, reservation_deadline, notes)
values
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000105', 'whatsapp', 0, 0, 159.90, 0, 'reservada', now() - interval '2 days', 'Venda demo - reserva vencida');

-- V0006 - Lucas Silva - Conjunto Floral G - RESERVADA -> CANCELADA
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, sale_status, reservation_deadline, notes)
values
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000101', 'whatsapp', 0, 0, 119.90, 0, 'reservada', now() + interval '1 day', 'Venda demo - reserva cancelada');

update public.sales
set sale_status = 'cancelada', notes = 'Venda demo - cancelada: cliente desistiu'
where id = '00000000-0000-0000-0000-000000000206';

-- V0007 - Maria Santos - Baby Doll Rendado M - ORÇAMENTO
insert into public.sales
  (id, customer_id, channel, discount, shipping, total, amount_paid, sale_status, notes)
values
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000102', 'instagram', 0, 0, 179.90, 0, 'orcamento', 'Venda demo - orçamento aguardando confirmação');

-- ============================================================================
-- 5. ITENS DE VENDA
-- ============================================================================
insert into public.sale_items
  (id, sale_id, product_id, quantity, unit_price, cost_price)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 1, 119.90, 45.00),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000003', 1, 189.90, 65.00),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000004', 1, 249.90, 85.00),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000008', 1, 109.90, 40.00),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000005', 1, 149.90, 55.00),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 1, 119.90, 45.00),
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000010', 1, 129.90, 48.00),
  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000007', 1, 159.90, 60.00),
  ('00000000-0000-0000-0000-000000000309', '00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000002', 1, 119.90, 45.00),
  ('00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000006', 1, 179.90, 70.00);

-- ============================================================================
-- 6. PAGAMENTOS
-- ============================================================================
insert into public.payments
  (id, sale_id, amount, method, notes)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', 309.80, 'pix', 'Pagamento integral via Pix (dados demo)'),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000202', 364.80, 'credito', 'Pagamento integral no cartão (dados demo)'),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000203', 80.00, 'pix', 'Sinal via Pix (dados demo)');

commit;
