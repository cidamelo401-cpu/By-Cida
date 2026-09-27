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

## Decisões assumidas que precisam de validação

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

## Comandos

```bash
npm install
npm run typecheck   # tsc --noEmit
```

## Próximas fases (aguardando autorização)

2. Landing page (Hero, PainPoints, HowItWorks, AboutBruna, CTA)
3. Quiz (4 telas + captura de lead)
4. Página de resultado + integração WhatsApp
