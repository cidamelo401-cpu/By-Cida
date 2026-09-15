# DATABASE.md — esquema proposto (não conectado)

Nada disso está implementado. **Não criar banco, ORM ou migração sem autorização.**
Os tipos TypeScript equivalentes já existem em `types/index.ts`.

## Dados mockados hoje

| Onde | Conteúdo | Vira tabela |
| --- | --- | --- |
| `EVENTO` | evento, data, local, 25 vagas, 16 preenchidas | `eventos` |
| `LOTES` | 3 lotes com prazo e preço | `lotes` |
| `INCLUI` | 4 itens inclusos | `eventos.inclui` (jsonb) ou `evento_inclui` |
| `PROGRAMA` | 9 momentos do dia | `programacao` |
| `FACILITADORAS` | 4 facilitadoras | `facilitadoras` |
| `CHECKLIST` + `CHECKLIST_NOTA` | 7 itens e a nota | `checklist_itens` |
| marcações do checklist | `localStorage` (`mcn.checklist.v1`) | `checklist_marcacoes` |
| `SLOTS_MASSAGEM` | 6 horários, 2 ocupados | `massagem_slots` + `massagem_reservas` |
| `MURAL` + `AVISO_MURAL` | 3 posts e 1 aviso | `mural_posts` |
| `GALERIA` | 6 fotos com legenda gravada + 1 limpa | `galeria_fotos` |

Todos são **valores de protótipo**, vários ainda não confirmados pela organizadora (ver `CLAUDE.md` seção 13).

## Esquema sugerido (Postgres)

```sql
create table eventos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  edicao int not null,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  local text not null,
  endereco text,
  latitude numeric, longitude numeric,
  vagas_totais int not null,
  inclui jsonb not null default '[]',
  criado_em timestamptz default now()
);

create table lotes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos(id) on delete cascade,
  nome text not null,
  prazo_inicio date, prazo_fim date,
  preco_centavos int not null,
  vagas_limite int,
  ativo boolean not null default true
);

create table participantes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  telefone text,
  criado_em timestamptz default now()
);

create table inscricoes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos(id),
  lote_id uuid not null references lotes(id),
  participante_id uuid not null references participantes(id),
  status text not null default 'pendente',   -- pendente | confirmada | cancelada
  criado_em timestamptz default now(),
  unique (evento_id, participante_id)
);

create table pagamentos (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid references inscricoes(id) on delete cascade,
  reserva_id uuid,                            -- quando o pagamento é de massagem
  provedor text not null default 'asaas',
  provedor_cobranca_id text,
  valor_centavos int not null,
  metodo text,                                -- pix | cartao | boleto
  status text not null default 'pendente',    -- pendente | pago | expirado | reembolsado
  pago_em timestamptz,
  criado_em timestamptz default now()
);

create table programacao (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos(id) on delete cascade,
  hora time not null,
  titulo text not null,
  descricao text,
  responsavel text,
  cor text,
  ordem int not null
);

create table facilitadoras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  papel text,
  instagram text,
  iniciais text,
  cor text,
  foto_url text
);

create table checklist_itens (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos(id) on delete cascade,
  texto text not null,
  ordem int not null
);

create table checklist_marcacoes (
  participante_id uuid not null references participantes(id) on delete cascade,
  item_id uuid not null references checklist_itens(id) on delete cascade,
  marcado boolean not null default false,
  atualizado_em timestamptz default now(),
  primary key (participante_id, item_id)
);

create table massagem_slots (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos(id) on delete cascade,
  hora time not null,
  duracao_min int not null default 30,
  preco_centavos int not null,
  unique (evento_id, hora)
);

create table massagem_reservas (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references massagem_slots(id) on delete cascade,
  participante_id uuid not null references participantes(id),
  status text not null default 'reservado',   -- reservado | pago | expirado | cancelado
  expira_em timestamptz not null,             -- criado_em + 20 minutos
  criado_em timestamptz default now(),
  unique (slot_id) where (status in ('reservado','pago'))
);

create table mural_posts (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos(id) on delete cascade,
  autor_id uuid references participantes(id),
  autor_facilitadora_id uuid references facilitadoras(id),
  texto text not null,
  destaque boolean not null default false,     -- aviso amarelo das facilitadoras
  resposta_a uuid references mural_posts(id),
  criado_em timestamptz default now()
);

create table mural_reacoes (
  post_id uuid not null references mural_posts(id) on delete cascade,
  participante_id uuid not null references participantes(id) on delete cascade,
  primary key (post_id, participante_id)
);

create table galeria_fotos (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references eventos(id),
  url text not null,
  alt text,
  legenda_gravada boolean not null default false,  -- não recortar como fundo
  ordem int
);
```

Notas:

- `unique (slot_id) where (...)` deve virar índice parcial único — garante 1 mãe por horário.
- Vagas preenchidas = `count(inscricoes where status = 'confirmada')`; não guardar contador duplicado.
- Lote vigente = lote ativo com `prazo_fim >= hoje`, menor preço primeiro.
- `legenda_gravada` existe porque as fotos com legenda de Instagram não podem ser recortadas.
