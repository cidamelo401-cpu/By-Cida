# Escopo atual — o que mudou depois do handoff

O código em `app/` foi gerado quando o app ainda vendia vagas. Depois disso o escopo
mudou. O protótipo em `design-reference/` está atualizado; **o código ainda não**.
Esta é a lista do que precisa ser alinhado.

## 1. O app não vende mais nada

O app é distribuído **só para quem já comprou e pagou**. A organizadora manda o link
no grupo de WhatsApp das participantes.

- Fora: escolha de lote, preço da vaga, barra de vagas, botão "Garantir minha vaga",
  checkout do Asaas para inscrição.
- `components/LoteOption.tsx` não é mais usado — pode apagar.
- `LOTES` saiu de `services/eventData.ts`.
- A rota `app/inscricao/` deixa de ser um formulário e passa a ser **"Minha vaga"**:
  um comprovante (nome, código, data do pagamento, lote em que entrou) mais a lista
  do que já está incluso.

## 2. Nova tela de entrada (cadastro)

Primeira coisa que a participante vê. Dois campos, **nome** e **WhatsApp**, e o botão
"Entrar no app" — que só ativa quando os dois estão válidos (nome com 3+ caracteres,
telefone com 10+ dígitos).

- No protótipo o cadastro é gravado em `localStorage` (chave `mcn_participante`).
  **Isso é provisório**: o objetivo é virar CRM, então precisa ir para um banco.
- A barra de abas fica escondida nessa tela.
- Há um "Sair" na home e um "limpar cadastro" na tela de entrada.
- Depois de entrar, o nome aparece na saudação da home e no cartão "Minha vaga".
- Não existe verificação contra a lista de quem pagou. Decisão pendente da
  organizadora: barrar quem não está na lista, ou deixar entrar e conferir depois.

## 3. Massagem: agenda de duas massagistas + Pix

Substitui a grade antiga de 6 horários.

- **Denise** e **Ligia** atendem em paralelo, blocos de 30 minutos, das 10h30 às 16h30.
- A grade tem uma linha por bloco e duas colunas, uma por massagista.
- Horário ocupado mostra o **nome de quem agendou** e não é clicável.
- O bloco das 14h está marcado como `almoço` nas duas colunas.
- Dados reais em `SLOTS_MASSAGEM` (planilha de 14/09). String vazia = livre.
- Fluxo: escolher horário → resumo com valor → **Pix** (QR + chave copiável) →
  "Já fiz o pagamento" → estado "Em conferência".
- **O QR do protótipo é um placeholder.** Em produção precisa ser um QR Pix de verdade,
  gerado com o valor já preenchido (payload BR Code / EMV). A conferência do comprovante
  é manual pela organizadora, a menos que ela decida integrar.
- Preço no protótipo: **R$ 60**. Chave Pix: `61477650000117`. Confirmar as duas.

## 4. Facilitadoras com bio, foto e Instagram

O cartão agora tem foto redonda de 96px, nome, o que ela conduz, um parágrafo de bio e
um botão que abre o Instagram dela em nova aba.

- Os campos `foto` e `bio` estão **vazios de propósito** em `services/eventData.ts`.
  Não inventar bio: o texto vem da organizadora.
- Enquanto `bio` está vazia, o parágrafo não é renderizado.
- No protótipo as fotos entram por drag-and-drop (`image-slot.js`). No app real são
  arquivos em `public/img/`.

## 5. PWA

Arquivos já escritos, **ainda não ligados**:

- `public/manifest.json` — nome, cores, ícones.
- `public/sw.js` — cache-first para o shell e as fotos, network-first para navegação,
  com fallback no cache. Importa porque o sinal de celular no sítio é fraco.
- `components/RegisterServiceWorker.tsx` — registra o SW só em produção.

Falta: montar `<RegisterServiceWorker />` em `app/layout.tsx`, referenciar o manifest
no `metadata` do layout, e criar `public/icon-192.png` e `public/icon-512.png`.

## 6. O que continua valendo do CLAUDE.md

Paleta, tipografia (Baloo 2 + Quicksand), regra de uso das fotos com legenda gravada,
alvos de toque de 44px, textos não reescritos, checklist pessoal por dispositivo.
