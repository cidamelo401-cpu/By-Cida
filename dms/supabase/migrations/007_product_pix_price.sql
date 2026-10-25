-- Preço opcional no Pix (com desconto), exibido no catálogo público junto
-- com o preço à vista e o parcelamento em 3x sem juros.
alter table products add column if not exists pix_price numeric;
