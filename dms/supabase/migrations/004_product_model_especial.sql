-- Adiciona a opção "Edição Especial" ao campo model dos produtos
alter table products drop constraint if exists products_model_check;
alter table products add constraint products_model_check
  check (model in ('titular', 'reserva', 'terceiro', 'goleiro', 'treino', 'especial'));
