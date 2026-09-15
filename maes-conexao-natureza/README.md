# Mães, Conexão e Natureza — app do evento

App em Next.js 14 + TypeScript + Tailwind do evento no Sítio Anju (17 de outubro, 10h às 17h).
Nove telas, mobile-first, sem backend: os dados são mocks tipados em `services/eventData.ts`.

## Rodar

```bash
npm install
cp .env.example .env.local
npm run dev      # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`.

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Home / capa do evento |
| `/inscricao` | Escolha de lote e pagamento |
| `/programa` | Programação do dia |
| `/facilitadoras` | Quem conduz |
| `/local` | Local e como chegar |
| `/checklist` | Minha mochila |
| `/massagem` | Agendamento da massagem |
| `/galeria` | Edições anteriores |
| `/mural` | Mural da comunidade |

Abas fixas: Início, Programa, Massagem, Comunidade.

## Estrutura

```
app/ components/ lib/ services/ types/ public/img/ docs/ design-reference/
```

## Antes de mexer

Leia **`CLAUDE.md`** — objetivo, regras de negócio, decisões visuais e a lista do que não deve mudar sem autorização.
Documentação funcional em **`docs/PROJECT.md`**; esquema de banco proposto (não conectado) em **`docs/DATABASE.md`**.

## Sobre o conteúdo

Os arquivos em `design-reference/` são o protótipo HTML original — referência visual, não código de produção.
Parte dos dados (horários da programação, valores, horários de massagem, posts do mural, endereço) foi **proposta no protótipo e ainda não confirmada** pela organizadora. Não trate como dado real.

## Fotos

As fotos em `public/img/` são do evento. Apenas `cachoeira.jpeg` não tem legenda de Instagram gravada — é a única usada como fundo recortado. As outras aparecem inteiras na galeria.
