-- Nome opcional pra diferenciar duas "Edição Especial" do mesmo time/temporada
-- (ex: "Patrocinada Home" vs "Patrocinada Away"), usado no agrupamento do catálogo.
alter table products add column if not exists edition_label text;
