# 🧠 Despeja! — Plano do MVP

> Seu planner para tirar da cabeça e colocar a vida em ordem.

O Despeja! é um PWA mobile-first criado inicialmente para uso pessoal de uma pessoa com TDAH, mas estruturado para futuramente se tornar um produto comercial.

A proposta não é ser mais uma lista de tarefas.

O usuário despeja o que está pensando por texto ou voz. O app interpreta, organiza, separa ideias de tarefas e lembretes, quebra tarefas grandes em pequenas ações e ajuda a decidir o que fazer agora.

---

# 1. Decisões do produto

| Tema | Decisão |
|---|---|
| Nome | Despeja! |
| Promessa | Tirar as coisas da cabeça e transformá-las em próximas ações |
| Plataforma | PWA mobile-first |
| Uso inicial | Pessoal |
| Futuro | Produto comercial |
| Captura | Texto + voz |
| IA | Organiza automaticamente; usuário confirma |
| Tarefas grandes | IA sugere divisão; usuário aprova |
| Planner | Privado |
| Financeiro | Pode ser compartilhado com outro membro da família |
| Calendário | Não será recriado no app |
| Treino | Check-in simples diário |
| Dados durante construção | Locais primeiro |
| Banco/login | Supabase na fase final |

---

# 2. Fluxo principal

DESPEJA
↓
ORGANIZA
↓
QUEBRA
↓
PRIORIZA
↓
FAZ

Esse é o coração do produto.

---

# 3. Telas

## Hoje

Tela principal.

Mostrar somente o necessário para o dia:

- Precisa acontecer
- Importantes
- Rapidinhas
- Treinei hoje
- Pequeno resumo financeiro
- Botão "Me diz o que fazer"

Evitar listas gigantes.

## Despeja

Grande área de captura com duas possibilidades:

- 🎙 Falar
- ✏️ Escrever

O usuário pode falar/escrever várias coisas misturadas.

A IA identifica:

- tarefas
- ideias
- lembretes
- possíveis projetos
- possíveis prazos

O usuário revisa e confirma.

## Caixa Mental

Itens que ainda precisam de decisão.

Nada identificado pela IA deve desaparecer automaticamente.

Se uma tarefa parecer grande:

"Isso parece grandinho 👀 Quer que eu quebre em passos menores?"

A IA sugere subtarefas e o usuário aprova, edita ou rejeita.

## Projetos

Agrupa tarefas e ideias por contexto.

Exemplos iniciais:

- Pessoal
- Família
- Trabalho
- Hotel
- Mulher Além de Mãe
- ByCida

O usuário pode criar novos projetos.

Dentro de cada projeto:

- Tarefas
- Ideias
- Depois

Ideia não deve automaticamente virar tarefa.

## Semana

Não é calendário.

Mostra distribuição da carga de tarefas pelos dias.

Se algum dia estiver sobrecarregado, o app sugere redistribuição.

Nenhuma alteração acontece sem confirmação.

## Finanças

Financeiro familiar simples.

Mostrar:

- Entradas
- Gastos
- Contas futuras
- Faturas
- Saldo projetado
- Quanto ainda pode gastar
- Orçamento por categoria

Permitir lançamento extremamente rápido de gasto.

## Configurações

Gerenciar:

- projetos
- categorias financeiras
- orçamento das categorias
- cartões
- contas recorrentes
- preferências
- membros do financeiro

---

# 4. Diferencial

## Despejo mental inteligente

O usuário não precisa organizar antes de registrar.

Exemplo:

"Tenho que comprar o presente do amigo do Pedro, falar com o fotógrafo do hotel e tive uma ideia de automação pra ByCida."

O Despeja! pode sugerir:

1. Comprar presente
   Projeto: Família
   Tipo: tarefa

2. Falar com fotógrafo
   Projeto: Hotel
   Tipo: tarefa

3. Automação
   Projeto: ByCida
   Tipo: ideia

O usuário confirma antes da organização definitiva.

## Quebra de tarefas

Tarefas grandes podem ser transformadas em pequenas próximas ações.

Exemplo:

"Fazer apresentação comercial"

pode virar:

- Abrir apresentação anterior
- Listar tópicos
- Separar números
- Montar primeiro slide

Sempre mediante aprovação.

## Me diz o que fazer

Quando o usuário não souber por onde começar, toca:

"ME DIZ O QUE FAZER"

O sistema escolhe uma única próxima ação considerando:

- prioridade
- prazo
- duração
- planejamento do dia

Abre uma experiência de foco mostrando somente aquela ação.

## Reavaliação

Tarefas não realizadas não são automaticamente empurradas para amanhã.

O sistema reavalia se devem:

- voltar para Hoje
- ficar para depois
- ser reagendadas
- ser descartadas

---

# 5. Voz

No MVP não armazenar áudio.

Fluxo:

voz → reconhecimento de fala do dispositivo/navegador → texto → organização

Sempre oferecer digitação como alternativa.

---

# 6. Treino

Não criar módulo fitness.

Na tela Hoje:

🏋️ Movimento de hoje
○ Ainda não treinei
✓ Treinei hoje

Guardar apenas a data.

Pode mostrar:

"3 treinos esta semana"

---

# 7. Financeiro

## Gastos

Guardar:

- valor
- descrição
- categoria
- data
- pessoa que gastou
- forma de pagamento
- cartão, quando aplicável

Registro deve levar poucos segundos.

## Categorias

Cada categoria pode ter orçamento mensal.

Exemplo:

Alimentação
R$ 920 / R$ 1.500
R$ 580 disponíveis

## Cartões

Guardar:

- nome
- dia de fechamento
- dia de vencimento

O sistema calcula automaticamente em qual fatura a compra entra.

## Parcelamentos

Registrar compra apenas uma vez.

Guardar:

- valor total
- número de parcelas
- valor da parcela
- cartão
- primeira fatura

Projetar automaticamente as parcelas futuras.

## Contas recorrentes

Guardar:

- descrição
- valor
- vencimento
- recorrência

## Entradas

Guardar:

- valor
- origem
- data

## Resumo

Mostrar:

Entrou
- Gastou
- Ainda vai sair
- Faturas
- Saldo projetado
- Quanto ainda pode gastar

---

# 8. Privacidade

Planner pertence ao usuário.

Financeiro pertence a um grupo familiar.

Outro membro da família pode acessar os dados financeiros sem acessar:

- tarefas
- ideias
- projetos
- despejos
- planejamento pessoal

---

# 9. O que o app guarda

Usuário:
nome, email, preferências

Projeto:
nome, ícone, cor, usuário

Despejo:
texto original, transcrição quando houver voz, data, status

Item identificado:
tipo, texto, projeto sugerido, prazo sugerido, aprovação

Tarefa:
título, projeto, prazo, prioridade, duração, status

Subtarefa:
tarefa principal, título, status, ordem

Ideia:
texto, projeto, data

Lembrete:
texto, data

Planejamento diário:
data, tarefas selecionadas

Treino:
usuário, data

Grupo financeiro:
nome, membros

Categoria:
nome, orçamento mensal

Gasto:
valor, descrição, categoria, data, responsável, forma de pagamento

Cartão:
nome, fechamento, vencimento

Parcelamento:
compra, valor total, parcelas, cartão

Entrada:
valor, origem, data

Conta recorrente:
descrição, valor, vencimento, recorrência

---

# 10. Identidade visual

Conceito:

"Papelaria digital divertida para adultos."

Inspirada na referência visual fornecida pela usuária, sem copiar seu layout.

Características:

- divertida
- alegre
- acolhedora
- criativa
- organizada sem parecer corporativa
- adulta sem ser séria demais

Paleta:

- creme como fundo principal
- rosa
- azul
- amarelo
- verde
- grafite para textos

Usar cores para criar orientação visual, não poluição.

Elementos:

- cards lembrando bloquinhos
- marca-texto
- pequenos rabiscos
- contornos orgânicos
- cantos arredondados
- ícones simples
- microinterações

Tipografia:

Fonte principal muito legível.

Fonte manuscrita/criativa somente para:
- títulos
- pequenas frases
- destaques

Nunca usar fonte decorativa em textos longos.

Evitar:
- aparência infantil
- dashboard corporativo
- excesso de informação
- estética genérica de SaaS
- excesso de cards

---

# 11. Personalidade

Linguagem curta, humana e divertida.

Exemplos:

"Seu cérebro abriu 17 abas. Pode despejar."

"Isso parece grandinho 👀"

"Bonita essa lista de prioridades. Agora vamos escolher poucas."

"Isso não precisa virar problema de hoje."

Humor nunca deve atrapalhar a compreensão.

---

# 12. Fases

## Fase 0 — Setup + identidade + preview

- projeto
- design system
- navegação
- componentes básicos
- responsividade
- preview duplo celular + desktop

## Fase 1 — Despeja + Caixa Mental

- captura por texto
- captura por voz quando suportada
- interpretação simulada inicialmente
- tarefas / ideias / lembretes
- revisão
- confirmação
- Caixa Mental

## Fase 2 — Organização e execução

- projetos
- tarefas
- subtarefas
- quebra de tarefas
- Hoje
- prioridades
- "Me diz o que fazer"
- modo foco

## Fase 3 — Semana

- distribuição semanal
- reavaliação de pendências
- sugestões de redistribuição
- check-in de treino

## Fase 4 — Financeiro

- gastos
- categorias
- orçamento
- entradas
- contas recorrentes
- cartões
- fechamento/vencimento
- parcelamentos
- faturas
- projeções

## Fase Final — Produto real

- Supabase
- autenticação
- isolamento dos dados pessoais
- grupo financeiro compartilhado
- permissões
- integração real de IA
- revisão de voz/fallback
- deploy Vercel
- configuração PWA

---

# 13. Versão 2

Não construir agora:

- integração Google Calendar
- integração bancária
- investimentos
- controle fitness completo
- gamificação
- relatórios avançados
- notificações sofisticadas
- automações externas
