# CLAUDE.md — Mães, Conexão e Natureza

Contexto permanente do projeto. Leia este arquivo antes de qualquer alteração.

## 1. Objetivo do aplicativo

PWA do evento presencial **Mães, Conexão e Natureza**, 3ª edição, no **Sítio Anju** (Mata Atlântica, Grande São Paulo), em **17 de outubro, das 10h às 17h**.

**O app não vende vagas.** Ele é distribuído só para quem já pagou — a organizadora manda o link no grupo do WhatsApp.

## 2. Fluxo principal

1. Participante abre o link → tela de **cadastro** (nome + WhatsApp) → dados salvos em `localStorage` (provisório, futuro CRM).
2. Após cadastro → **home** com saudação, card "Minha vaga", atalhos para programação, massagem, facilitadoras, local, mochila, galeria.
3. **Massagem**: grade com Denise e Ligia em paralelo, 30 min, R$ 60. Pagamento via Pix (chave copiável). Confirmação manual pela organizadora.
4. **Offline**: service worker cacheia todo o shell + fotos. O sinal no sítio é fraco.

## 3. Arquitetura

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**
- PWA com service worker e manifest
- Dados em `services/eventData.ts` (mock). Nenhum backend conectado.
- Cadastro e checklist em `localStorage`
- Layout mobile-first, max 402px

## 4. NÃO alterar sem autorização

- Textos, paleta (Baloo 2 + Quicksand), hexadecimais do `tailwind.config.ts`
- Regra de uso das fotos: só `cachoeira.jpeg` pode ser recortada como fundo
- Layout e ordem das telas/abas
- Dados a confirmar com organizadora (ver `docs/ESCOPO-ATUAL.md`)
