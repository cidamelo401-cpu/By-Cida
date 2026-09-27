# Bruna Makdissi — experiência digital (landing + quiz + resultado)

Projeto novo, independente do `dms` (que é de outro cliente). Ainda não tem
páginas nem componentes — esta é a **Fase 1: estrutura de dados e conteúdo**.

## O que existe até agora

```
src/data/
  types.ts                 tipos centrais (Product, QuizAnswers, RecommendationResult...)
  services.ts               os 28 produtos do catálogo oficial (preço, regras de linguagem, etc.)
  personas.ts                as 9 personas mapeadas pela Bruna
  questions.ts                as 4 perguntas oficiais do quiz
  recommendationRules.ts        motor de recomendação determinístico (sem IA)
  whatsappTemplates.ts            geração da mensagem dinâmica de WhatsApp
```

Fonte única dos dados: **Catálogo de Produtos — Bruna Makdissi v1.0** (23/09/2026),
aprovado pela Bruna e pelo Jean. Nada foi inventado — o que não estava no
catálogo ficou de fora ou foi marcado como suposição (ver bloco de comentários
no topo de `recommendationRules.ts`).

## Decisões assumidas — aprovadas pela Cida, pendentes de validação fina com a Bruna

Estão documentadas em detalhe no topo de `src/data/recommendationRules.ts`.
Resumo:

- Não existe mesa exclusiva de "dinheiro" → usamos a Mesa das 4 Prosperidades.
- Corpo/Relações não têm jornada de entrada → nesses casos o "acessível" cai
  no próprio diagnóstico, com CTA mais leve.
- Relações + pontual sempre aponta para o Divórcio Energético — o Luto (T09)
  ainda não é alcançável pelo quiz de 4 perguntas.
- Ansiedade aponta para a Mesa DNB enquanto a Jornada gravada não estiver à
  venda (flag `ANSIEDADE_JORNADA_DISPONIVEL` em `recommendationRules.ts`).
- Espiritual + acompanhamento não tem diagnóstico único definido → resultado
  fica marcado como difuso, com CTA de WhatsApp.

## Ebook (E01)

Conteúdo finalizado. Falta só a Bruna decidir o preço (gratuito ou baixo
ticket) — `preco.mode` fica `'a_definir'` até essa decisão chegar.

## Design system

A marca segue o design system **Alvorada v1.0** (skill `bruna-makdissi-design`,
já disponível neste ambiente — não precisa reenviar). Tokens de cor e
tipografia inteiros em `src/styles/tokens.ts`, traduzidos 1:1 da referência
oficial, já ligados ao `tailwind.config.ts`. Logos e símbolo (PNG) estão em
`public/brand/` — os quatro lockups ainda carregam o símbolo antigo embutido
(pendente de regeração pela própria skill); para logotipo grande, montar o
lockup em código a partir do símbolo novo, não usar o PNG do lockup.

Regras que mais importam para quem for montar UI daqui pra frente:
- Ouro nunca preenche botão — ação é sempre horizonte (`#CE6B4A`).
- Um bloco `noite-900` por tela, no máximo — nunca repetir.
- Sem cor por categoria/pilar em resultado — usar nível nomeado, não semáforo.
- Newsreader para títulos/números, Inter para corpo/interface.

## Comandos

```bash
npm install
npm run typecheck   # tsc --noEmit
```

## Próximas fases (aguardando autorização)

2. Landing page (Hero, PainPoints, HowItWorks, AboutBruna, CTA) — com o design system aplicado
3. Quiz (4 telas + captura de lead)
4. Página de resultado + integração WhatsApp
