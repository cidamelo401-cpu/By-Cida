# PROJECT.md — documentação funcional

## 1. Visão geral do produto

App mobile (web) do evento presencial **Mães, Conexão e Natureza**, 3ª edição, no Sítio Anju, em 17 de outubro, das 10h às 17h. Público: mães adultas, uso quase exclusivamente no celular. O app acompanha o ciclo completo: descobrir o evento, comprar a vaga, se preparar, viver o dia e conviver com o grupo.

Objetivos, nesta ordem: **vender vagas**, **reduzir dúvidas antes do evento**, **guiar o dia**, **vender a massagem**, **manter a comunidade viva**.

## 2. Módulos

| Módulo | Rotas | Estado |
| --- | --- | --- |
| Vitrine e venda | `/`, `/inscricao` | UI completa, pagamento por link externo |
| Preparação | `/checklist`, `/local`, `/facilitadoras` | UI completa; mapa sem ação |
| Guia do dia | `/programa` | UI completa, conteúdo a confirmar |
| Serviços pagos no dia | `/massagem` | UI completa, reserva não persiste |
| Comunidade e memória | `/mural`, `/galeria` | leitura apenas |

## 3. Funcionalidades por módulo

### 3.1 Vitrine e venda
- **Home:** hero fotográfico com selos "3ª edição" e "Poucas vagas"; título, data, horário e local; card do lote vigente com preço, "3 refeições inclusas", barra de progresso de vagas e contador "16 de 25 vagas preenchidas"; CTA "Garantir minha vaga"; grade de atalhos (Programação, Massagem, Facilitadoras, Local, Mochila) e link para a galeria.
- **Inscrição:** seleção de um entre três lotes (radio exclusivo); lista de itens inclusos; bloco explicando formas de pagamento; total que reage ao lote escolhido; botão "Ir para o pagamento" abrindo o checkout Asaas em nova aba; aviso "Ambiente seguro Asaas · reembolso até 7 dias".

### 3.2 Preparação
- **Minha mochila:** 7 itens marcáveis; contador "X de 7 itens separados"; marcado risca o texto e esvanece; persiste no dispositivo; nota sobre a foto de infância usada no encerramento.
- **Local e como chegar:** hero "Sítio Anju"; endereço; botões "Abrir no mapa" e "Copiar endereço" (sem ação); bloco "Como chegar" com tempo de viagem e aviso de estrada de terra; atalho "Procurar carona no mural"; bloco "Bom saber" (estacionamento, sinal fraco, cachoeira, evento sem crianças).
- **Facilitadoras:** 4 cartões (nome, papel no dia, @ do Instagram).

### 3.3 Guia do dia
- **Programação:** 9 blocos das 10:00 às 16:40, cada um com hora, título, descrição e responsável; faixa colorida por tipo de momento (refeição, dinâmica, natureza, corpo, oficina).

### 3.4 Serviços pagos no dia
- **Massagem:** duração 30 min e preço R$ 90 "à parte da vaga"; 6 horários em grade; ocupados desabilitados; ao escolher, aparece o resumo verde com horário, valor, CTA "Pagar e confirmar" e o aviso de reserva por 20 minutos.

### 3.5 Comunidade e memória
- **Mural:** campo "Escrever para o grupo…" (visual); aviso amarelo das facilitadoras; posts com autora, tempo, texto, reações e "Responder".
- **Galeria:** posts das edições anteriores em grade 4:5 e uma foto grande ao final.

## 4. Fluxos de usuário

**A. Compra da vaga**
Home → toca "Garantir minha vaga" → Inscrição → escolhe lote → confere total → "Ir para o pagamento" → checkout Asaas (fora do app) → confirmação por e-mail.

**B. Preparação**
Home → "O que levar na mochila" → marca itens (persistem) → volta → "Local e como chegar" → lê como chegar → "Procurar carona no mural" → Mural.

**C. Dia do evento**
Aba Programa → acompanha os momentos. Na pausa da tarde: aba Massagem → escolhe horário livre → "Pagar e confirmar" → checkout.

**D. Comunidade**
Aba Comunidade → lê o aviso das facilitadoras e os recados → (futuro) escreve e responde.

## 5. Regras de negócio

Ver `CLAUDE.md` seção 4 (fonte única). Resumo: lotes com prazo e preço próprios; 25 vagas; total = preço do lote; massagem paga à parte, 30 min, 1 pessoa por horário, reserva expira em 20 min; pagamento pelo Asaas com reembolso até 7 dias; confirmação por e-mail libera o app do dia; evento só para mães; checklist é pessoal e local.

## 6. Permissões

Hoje **não há autenticação**: todo o app é público e somente leitura, exceto interações locais (lote, checklist, horário).

Modelo previsto:

| Papel | Permissões previstas |
| --- | --- |
| Visitante | ver vitrine, programação, facilitadoras, local, galeria; iniciar pagamento |
| Participante confirmada | tudo acima + checklist sincronizado, escrever/reagir no mural, reservar massagem |
| Facilitadora | publicar aviso destacado no mural |
| Organizadora | gerenciar evento, lotes, programação, vagas, reservas e avisos |
| Massoterapeuta | ver e fechar a própria agenda do dia |

## 7. Dependências entre funcionalidades

- **Mural (escrever) e checklist sincronizado** dependem de autenticação.
- **Reserva de massagem persistente** depende de banco + trava de concorrência; a expiração de 20 min depende de job/agendador.
- **Contador de vagas real** e **lote vigente automático** dependem de `inscricoes` + `pagamentos` confirmados.
- **Confirmação de pagamento** depende do webhook do Asaas.
- **Ingresso/check-in** (não implementado) depende de inscrição confirmada.
- **Galeria com upload** depende de storage e moderação.
- **"Abrir no mapa"** depende de coordenadas confirmadas do sítio.
