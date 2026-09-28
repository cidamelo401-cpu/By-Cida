# Bruna Makdissi — experiência digital (landing + quiz + resultado)

Projeto novo, independente do `dms` (que é de outro cliente). As 4 fases do
escopo original estão prontas: dados, landing, quiz e página de resultado.
Falta persistência real (Supabase) e validação de copy pela Bruna.

## O que existe até agora

```
src/data/
  types.ts                 tipos centrais (Product, QuizAnswers, RecommendationResult...)
  services.ts               os 28 produtos do catálogo oficial (preço, regras de linguagem, etc.)
  personas.ts                as 9 personas mapeadas pela Bruna
  questions.ts                as 4 perguntas oficiais do quiz
  recommendationRules.ts        motor de recomendação determinístico (sem IA)
  whatsappTemplates.ts            geração da mensagem dinâmica de WhatsApp (com insights)
  site.ts                        contato oficial (e-mail, instagram, whatsapp)
src/styles/
  tokens.ts                referência TS dos tokens de cor/tipografia (espelha o @theme do CSS)
src/lib/
  analytics.ts             stub de eventos (console only — trocar por provedor real depois)
  quizSession.ts            handoff quiz → resultado via sessionStorage (sem backend ainda)
  insights.ts                gera os bullets "o que apareceu nas suas respostas"
  disclaimers.ts             textos públicos curados por disclaimerKind (saúde/saúde mental/veterinário)
  price.ts                    formata preço — nunca mostra valor quando sob consulta
src/components/
  Hero, PainPoints, HowItWorks, AboutBruna, CTASection, Footer, Disclaimer,
  RuledEntry (elemento de assinatura), Logo, ui/CtaButton
  quiz/ — QuizFlow, QuizProgress, QuestionCard, OptionCard, LeadCapture
  resultado/ — ResultadoView, RecommendationCard, PublicDisclaimer
src/app/
  layout.tsx, page.tsx (landing), quiz/page.tsx, resultado/page.tsx (noindex)
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
já disponível neste ambiente — não precisa reenviar). Os tokens vivem em dois
lugares em sincronia: `src/app/globals.css` (`@theme`, é o que o Tailwind v4
realmente lê) e `src/styles/tokens.ts` (referência TS para uso em JS, ex.: a
citação da Bruna). Não há `tailwind.config.ts` — Tailwind v4 não precisa dele
sem a diretiva `@config`, e ter os dois seria uma segunda fonte de verdade
para divergir.

Logos e símbolo (PNG) estão em `public/brand/` — os quatro lockups ainda
carregam o símbolo antigo embutido (pendente de regeração pela própria
skill); para logotipo grande, montar o lockup em código a partir do símbolo
novo, não usar o PNG do lockup (no cabeçalho/rodapé, em tamanho modesto, o
PNG completo é o que a skill autoriza usar direto).

Regras que mais importam para quem for montar UI daqui pra frente:
- Ouro nunca preenche botão — ação é sempre horizonte (`#CE6B4A`).
- Um bloco `noite-900` por tela, no máximo — nunca repetir. Na landing, esse
  bloco é o `Hero`; nenhum outro componente pode usar `bg-noite-900`.
- Sem cor por categoria/pilar em resultado — usar nível nomeado, não semáforo
  (vale para a futura página de resultado, Fase 4).
- Newsreader para títulos/números, Inter para corpo/interface.
- `RuledEntry` é o componente de "entrada pautada" (o elemento de assinatura
  da marca) — usar no lugar de card genérico sempre que fizer sentido.

**Todo o texto da landing é cópia provisória.** Segue as regras Verde do
`claims-e-safety.md` (sem promessa de resultado, sem "cura" literal, achados
sempre atribuídos à resposta da pessoa), mas nenhuma frase foi validada
especificamente pela Bruna ainda — isso é aprovação dela, não substituível.

Fotos reais da Bruna em `public/bruna/` (nomeadas pela categoria da
biblioteca, quando dá pra identificar):
- `bruna-sozinha-look-bege-01.jpg` — em uso na seção "Quem sou eu" (categoria 07, "primeiro contato, acolhimento")
- `bruna-com-dinheiro-prosperidade-{01,02}.jpg` — guardadas para uso futuro em contexto de dinheiro (ex.: card do tema "Dinheiro", resultado do quiz)
- `bruna-lifestyle-flor-01.jpg` — guardada para textura/respiro editorial
- `bruna-atendimento-mesa-radionica-01.jpg` — bastidor/método; **nunca perto de pontuação, resultado ou classificação** (regra da skill — o mapa físico dela se chama "Mapeamento" e teria a mesma leitura visual do resultado do quiz)

Nunca gerar uma pessoa por IA para representar a Bruna (proibido pela skill,
sem exceção) — sempre usar fotos reais da biblioteca dela.

## Quiz (Fase 3)

`/quiz`: 4 telas (uma pergunta por vez), barra de progresso, botão voltar,
avança sozinho ao selecionar uma opção, depois pede nome/WhatsApp/e-mail com
checkbox de autorização (desmarcado por padrão, LGPD). Ao enviar, calcula a
recomendação e manda pra `/resultado`.

**Pergunta 4 (disposição) ganhou uma 4ª opção: "Um processo intensivo e
concentrado".** Achado ao reler a aba Direcionamento célula por célula: a
regra 11 da planilha ("quer transformação intensa e rápida, vários temas ao
mesmo tempo" → Diagnóstico → Caminho da Transformação) não tinha nenhuma
porta de entrada nas 4 perguntas — o Caminho da Transformação (C01), um
produto real do catálogo, nunca aparecia em nenhum resultado possível.
Agora, pra dinheiro/corpo/relações, essa opção leva ao diagnóstico do tema
com o Caminho como próximo passo nomeado; pra espiritual, entra no mesmo
fluxo de "3 diagnósticos" do caso difuso, mas com o Caminho citado no "e
depois?". Pet/casa-empresa/ansiedade ignoram essa opção (a planilha não
descreve esse caminho pra esses temas) — comportamento inalterado.
**Isso mexe numa pergunta que já tinha sido aprovada pela Bruna e pelo
Jean com 3 opções — avisar eles que agora são 4.**

## Resultado (Fase 4 — revisado após feedback da Cida)

`/resultado` monta, nessa ordem: headline de identificação (tema apareceu
com mais força) · **um parágrafo de justificativa em prosa** (`lib/insights.ts
→ getResultJustification`) explicando por que esse resultado saiu, sempre
atribuído à resposta ("nas suas respostas... você contou que..."), nunca a
lista crua de respostas marcadas (isso foi removido — feedback: parecia
"responder o diagnóstico com as respostas da pessoa" em vez de vender o
produto) · o(s) produto(s) recomendado(s) com preço (só quando `preco.mode
=== 'publico'`) · disclaimer público curado quando o tema toca saúde/corpo/pet
(`lib/disclaimers.ts`) · "e depois?" · **CTA de WhatsApp sempre nomeando o
produto** ("Falar com a Bruna sobre [Produto]", usando `nomeCurto` quando o
nome oficial é longo demais pro botão) · link para refazer.

**Página é de alta conversão — ninguém sai sem produto nomeado.** O
"resultado difuso" antigo (tema espiritual + acompanhamento, sinais muito
misturados) foi removido: agora sempre oferece os 3 Diagnósticos como
opções concretas, com a Bruna ajudando a decidir por qual começar pelo
WhatsApp, em vez de terminar sem nada pra levar adiante.

Os bullets crus de resposta (`getAnswerInsights`) continuam existindo, mas
só alimentam a mensagem privada de WhatsApp (contexto pra Bruna) — nunca
aparecem na tela.

Testado com Playwright injetando sessão pra cobrir os cenários principais
(dinheiro, corpo, ansiedade, espiritual com 3 mesas, difuso→diagnósticos,
sustentação, pet, pacote de 4 Prosperidades, jornada com nome longo) —
preço/disclaimer/CTA conferidos visualmente em cada um.

Sem backend ainda: o lead fica só em `sessionStorage`. Persistência real
(Supabase) fica para uma fase futura, quando for pedida.

**Bug corrigido durante o Fase 3**: o campo `cuidadosLinguagem` do catálogo é
instrução interna para quem escreve a copy (ex.: "nunca prometer X") — nunca
renderizar isso pro visitante. Por isso a Fase 4 criou `disclaimers.ts` com
texto público curado à parte, em vez de reusar aquele campo.

## Comandos

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run dev          # servidor local
npm run build         # build de produção
```

## O que falta (fora do escopo das 4 fases originais)

- Persistência real do lead (Supabase) — hoje só sessionStorage
- Validação da copy pela Bruna (todo texto está provisório)
- Wire do Ebook (E01) na recomendação quando o preço for definido
- Rota para o Luto (T09) — hoje não é alcançável pelo quiz de 4 perguntas
