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
  resultContent.ts               conteúdo editorial de cada tela de resultado (fonte: matriz da Cida)
  whatsappTemplates.ts            geração da mensagem dinâmica de WhatsApp (com insights)
  site.ts                        contato oficial (e-mail, instagram, whatsapp)
src/styles/
  tokens.ts                referência TS dos tokens de cor/tipografia (espelha o @theme do CSS)
src/lib/
  analytics.ts             stub de eventos (console only — trocar por provedor real depois)
  quizSession.ts            handoff quiz → resultado via sessionStorage (sem backend ainda)
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
- Relações + pontual sempre aponta para o Divórcio Energético.
- Ansiedade aponta para a Mesa DNB enquanto a Jornada gravada não estiver à
  venda (flag `ANSIEDADE_JORNADA_DISPONIVEL` em `recommendationRules.ts`).
- Espiritual + acompanhamento não tem diagnóstico único definido → usa o
  mesmo conteúdo do Caminho da Transformação (C01) de "espiritual +
  intensivo" (ver seção "Resultado" abaixo — mudou com a Matriz de Conteúdo).

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

`/quiz`: até 4 telas (uma pergunta por vez — 2 telas pra quem escolhe "Luto",
ver abaixo), barra de progresso, botão voltar, avança sozinho ao selecionar
uma opção, depois pede nome/WhatsApp/e-mail com checkbox de autorização
(desmarcado por padrão, LGPD). Ao enviar, calcula a recomendação e manda
pra `/resultado`.

**Pergunta 4 (disposição) ganhou uma 4ª opção: "Um processo intensivo e
concentrado".** Achado ao reler a aba Direcionamento célula por célula: a
regra 11 da planilha ("quer transformação intensa e rápida, vários temas ao
mesmo tempo" → Diagnóstico → Caminho da Transformação) não tinha nenhuma
porta de entrada nas 4 perguntas — o Caminho da Transformação (C01), um
produto real do catálogo, nunca aparecia em nenhum resultado possível.
Pra dinheiro/corpo/relações, essa opção leva ao diagnóstico do tema, com o
Caminho da Transformação citado como próximo passo dentro da própria
explicação do produto (ver seção "Resultado"); pra espiritual, o Caminho da
Transformação (C01) É o resultado principal direto (mudou depois da Matriz
de Conteúdo — ver seção "Resultado"). Pet/casa-empresa/ansiedade ignoram
essa opção (a planilha não descreve esse caminho pra esses temas) —
comportamento inalterado.
**Isso mexe numa pergunta que já tinha sido aprovada pela Bruna e pelo
Jean com 3 opções — avisar eles que agora são 4.**

**Pergunta 1 (tema) ganhou uma 8ª opção: "Luto".** Antes o Luto (Mesa do
Luto, Morte e Encaminhamento, T09) existia no catálogo mas não tinha porta
de entrada no quiz — a combinação mais próxima, relações + pontual, sempre
caía no Divórcio Energético. Agora "Luto" é um tema próprio em Q1 e leva
direto para T09, ignorando momento/histórico/disposição (é uma mesa avulsa,
sem diagnóstico/mentoria correspondente — mesmo padrão de Pet e Casa/empresa).
O texto de "Cuidado" próprio de T09 (ver `resultContent.ts`) já segue a
instrução do catálogo de nunca soar como substituto de apoio psicológico.
**Isso mexe numa pergunta que já tinha sido aprovada pela Bruna e pelo
Jean com 7 opções — avisar eles que agora são 8.**

**Quem escolhe "Luto", "Pet" ou "Casa ou empresa" responde só 2 perguntas
(tema + momento), não 4.** Os três têm resultado fixo no motor (sempre a
mesma mesa avulsa) — histórico e disposição não mudam nada, então pedir as
duas era fricção sem propósito. Pedido direto da Cida pro luto, estendido
pro pet e pra casa/empresa pela mesma razão. A lista de temas do fluxo curto
vive em `SHORT_FLOW_TEMAS` (`questions.ts`) — hoje
`['luto', 'pet', 'casa_empresa']` — e o quiz pula pra captura de lead assim
que a pessoa responde o momento
(`SHORT_QUESTIONS` em `QuizFlow.tsx`); a barra de progresso mostra "1 de 2"
e "2 de 2" nesse caminho. Os insights de `resultContent.ts` (ver seção
"Resultado" abaixo) são filtrados por resposta real, então esses temas nunca
mostram um insight de disposição/histórico que a pessoa não respondeu.
**Decisão explícita da Cida, com trade-off consciente**: quem já concluiu
mentoria ou o Caminho da Transformação e escolhe um desses temas não é mais
desviado pra Sustentação (M06) — a regra de prioridade por histórico existe,
mas como essa pergunta não é feita nesse caminho, ela nunca dispara aqui. Vai
sempre direto pra mesa do tema escolhido.

## Resultado (Fase 4 → reestruturado com a Matriz de Conteúdo da Cida)

`/resultado` foi inteiramente reconstruído em cima da **"Matriz de conteúdo
dos resultados — Direcionamento Bruna Makdissi"** (arquivo enviado pela
Cida) — não é mais texto genérico `{tema} + {produto}`, é conteúdo editorial
próprio por produto, transcrito literal em `src/data/resultContent.ts`
(28 entradas, uma por produto do catálogo). Nenhum texto foi alterado,
resumido ou parafraseado.

Toda tela de um produto só (a grande maioria dos resultados) segue as 8
seções da matriz, nessa ordem:

1. **Seu direcionamento** — headline própria do produto (`direcionamento`)
2. **Entendendo esse momento** — explicação do tema, sem diagnosticar nem prometer (`entendendoEsseMomento`)
3. **O que suas respostas mostraram** — 2 a 4 insights, filtrados pelas respostas reais (`getInsightsFor`)
4. **[Caminho label]** + nome do produto + explicação (`caminhoLabel`, `productHeading`, `productExplanation` — o rótulo varia por produto: "um caminho possível", "um caminho possível de continuidade", "um primeiro passo possível")
5. **Como funciona** — formato, duração, entregáveis (`comoFunciona`)
6. **Investimento** — valor literal do catálogo, ou "Sob consulta." pras mentorias/Caminho/Sustentação (nunca omitido — a matriz pede pra mostrar o texto, só não o número)
7. **Cuidado** — quando o produto tem (nem todos têm; ex.: Sustentação e Ebook não)
8. **CTA** — texto do botão específico por produto (ex.: "Agendar meu diagnóstico", "Quero conversar com a Bruna")

**O antigo sistema de `disclaimerKind` (4 categorias genéricas em
`lib/disclaimers.ts`) foi removido** — cada produto já tem seu próprio texto
de "Cuidado" na matriz, mais preciso que qualquer categoria genérica.
`professionalSupportNotice` continua existindo só pra dar destaque visual
maior ao cuidado da ansiedade (`PublicDisclaimer` com `destaque`).

**Insight por resposta, não por produto**: cada bullet de "O que suas
respostas mostraram" tem uma condição (`when`) opcional em
`resultContent.ts` — quando um produto é alcançado por mais de uma
disposição (ex.: Diagnóstico Financeiro serve tanto pra quem quer
"acompanhamento" quanto pra quem quer "processo intensivo"), o bullet que
menciona "acompanhamento individual" só aparece pra quem realmente
respondeu isso. Testado nos dois casos com Playwright.

**Dois resultados que a matriz não cobria com um bloco próprio, decisões da
Cida** (documentadas também no topo de `recommendationRules.ts`):
- **Espiritual + intensivo**: a matriz já tinha um bloco do Caminho da
  Transformação (C01) que descreve exatamente esse caso ("mais de uma área
  parece estar pedindo atenção, e você busca um processo concentrado") —
  agora C01 é o resultado principal direto, não só um "próximo passo"
  citado em texto depois de um diagnóstico genérico.
- **Espiritual + acompanhamento**: a matriz não tem bloco próprio pra esse
  caso. Decisão da Cida: reusar o mesmo bloco do Caminho da Transformação —
  é o único conteúdo que fala de "mais de uma área" sem cravar um tema, mesmo
  o encaixe não sendo perfeito (essa pessoa quer acompanhamento, não
  processo intensivo).

**Resultado com mais de um produto ao mesmo tempo** — hoje só acontece em
espiritual + pontual (3 mesas: DNA Sistêmica, Cirurgia Espiritual, Mesa do
Milagre). Decisão da Cida: mostrar as 3 fichas completas de produto (nome,
explicação, como funciona, investimento, cuidado) uma embaixo da outra, sem
repetir headline/explicação de tema 3 vezes — só o "Direcionamento pronto"
uma vez e o texto (já existente antes desta matriz) "São três mesas
diferentes... a Bruna ajuda a escolher pelo WhatsApp".

**"E depois?" (nextStepNote) saiu da tela.** Antes existia uma seção
solta linkando o próximo produto (texto que eu tinha escrito, fora da
matriz oficial). Removida da tela — a matriz não tem essa seção, e muitos
produtos (D01, D02, D03, C01) já citam o próprio próximo passo dentro do
parágrafo de explicação do produto. `nextStepNote` continua existindo só
como contexto privado na mensagem de WhatsApp pra Bruna, nunca visível na
tela.

**Ponto pra validar com a Bruna** (achei ao implementar, não corrigi
sozinha): o bloco da Mesa das 4 Prosperidades (T03) na matriz tem headline
"Mais de uma área da sua vida parece pedir atenção ao mesmo tempo" — mas
hoje o motor só entrega T03 pra quem respondeu tema **Dinheiro** + pontual
(um tema só, não vários). O texto da matriz não foi alterado (segue a regra
de não inventar), mas o encaixe com a pergunta 1 do quiz está estranho —
avisar a Bruna.

Testado com Playwright clicando o fluxo real (não injeção) em 22 cenários —
toda regra de `recommendationRules.ts` — mais a checagem específica da
filtragem de insights por resposta. Telas conferidas visualmente (luto,
diagnóstico financeiro, trio espiritual).

Sem backend ainda: o lead fica só em `sessionStorage`. Persistência real
(Supabase) fica para uma fase futura, quando for pedida.

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
