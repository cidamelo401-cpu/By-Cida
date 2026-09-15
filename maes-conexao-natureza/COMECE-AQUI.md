# COMECE-AQUI.md

Cole a mensagem abaixo no Claude Code, dentro desta pasta. Ela dá o contexto todo.

---

**Mensagem para o Claude Code:**

> Leia `CLAUDE.md` e `docs/ESCOPO-ATUAL.md` antes de mexer em qualquer coisa.
>
> Este é o app das participantes já confirmadas do evento Mães, Conexão e Natureza
> (17 de outubro, Sítio Anju). Não há venda de ingresso dentro do app.
>
> O que eu preciso, nesta ordem:
>
> 1. Rodar local (`npm install` && `npm run dev`) e conferir se as 9 telas abrem.
> 2. Alinhar o código com o protótipo atual em `design-reference/` — ele é a verdade
>    visual e mudou depois que este código foi gerado (ver `docs/ESCOPO-ATUAL.md`).
> 3. Fazer o cadastro de nome + WhatsApp gravar de verdade num banco, para virar
>    minha lista de participantes.
> 4. Transformar em PWA (os arquivos já estão em `public/manifest.json` e
>    `public/sw.js`, falta ligar).
> 5. Publicar na Vercel e me dar o link.
>
> Antes de começar o item 3, me explique as opções de banco em linguagem simples e
> espere eu escolher.

---

## O que tem nesta pasta

| Pasta | O que é |
| --- | --- |
| `design-reference/` | o protótipo visual atual, abre no navegador. É a referência de como cada tela deve ficar |
| `app/` | as 9 telas em Next.js |
| `components/` | peças de interface reutilizadas |
| `services/eventData.ts` | todo o conteúdo: programação, facilitadoras, checklist, agenda da massagem |
| `public/img/` | as fotos do evento |
| `public/manifest.json`, `public/sw.js` | os arquivos de PWA, prontos e ainda desligados |
| `CLAUDE.md` | contexto permanente do projeto |
| `docs/ESCOPO-ATUAL.md` | o que mudou depois do handoff — leia junto com o CLAUDE.md |
| `docs/DATABASE.md` | esquema de banco proposto, nada conectado |

## O que ainda depende de você

1. **Bios das facilitadoras** — os campos `bio` em `services/eventData.ts` estão vazios.
2. **Fotos das facilitadoras** — salve cada uma como `public/img/fac-ana.jpeg`,
   `fac-lethycia.jpeg`, `fac-anastacia.jpeg`, `fac-fabiana.jpeg` e preencha o campo `foto`.
3. **Ícone do app** — precisa de `public/icon-192.png` e `public/icon-512.png`
   (quadrados, fundo cheio). Sem eles o PWA instala com ícone genérico.
4. **Chave Pix** — confirmar `CHAVE_PIX` em `services/eventData.ts`.
5. **Preço da massagem** — hoje R$ 60 no código.
