# Referência de design

`Maes Conexao e Natureza App.dc.html` é o **protótipo HTML original** do app, criado como design de alta fidelidade: cores, tipografia, espaçamentos e estados finais. Não é código de produção — o app em Next.js na raiz deste pacote é a recriação fiel dele.

Para abrir: precisa do runtime do ambiente de design onde foi criado. Use-o como referência visual (é possível ler os valores diretamente no markup: todos os estilos são inline).

## Diferenças intencionais entre o protótipo e o código

| Protótipo | Código Next.js | Motivo |
| --- | --- | --- |
| Navegação por estado (`state.screen`) | rotas do App Router | URLs reais, voltar do navegador |
| Moldura de iPhone (`IOSDevice`) | `.app-frame` com 402px centralizados | a moldura era só apresentação |
| Tweak "tela inicial" | não existe | servia para navegar no editor de design |
| Tweak "preço da massagem" | `NEXT_PUBLIC_PRECO_MASSAGEM` | mesma função, agora configurável |
| Checklist só em memória | `localStorage` | a mãe monta a mochila em vários momentos |
| Recortes de foto com `object-position` por tela | mantidos iguais em `HeroImage` | preservar o enquadramento aprovado |

## Escala tipográfica usada (idêntica nos dois)

Baloo 2 700: 40 / 34 / 30 / 27 / 26 / 22 / 19 / 18 / 17 / 15 / 13 px
Quicksand 500-700: 16 / 14 / 13 / 12 / 11 / 10 px
Raios: 26 / 22 / 20 / 18 / 16 / 14 / 12 / 8 / 999 px
