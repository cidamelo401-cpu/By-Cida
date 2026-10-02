# Despeja! — Fases 0 e 1

Fase 0: base visual. Fase 1: Despeja + Caixa Mental (dados locais, interpretação simulada). HTML, CSS e JavaScript puros (sem build, sem dependências).

## Rodar

    cd despeja
    python3 -m http.server 5173

- App: http://localhost:5173/
- Preview celular + desktop: http://localhost:5173/preview.html
- Kit de componentes: http://localhost:5173/#/kit

(Qualquer servidor estático serve. Abrir o arquivo direto, sem servidor, não funciona.)

## Estrutura

- `css/tokens.css` — cores, fontes, cantos, sombras
- `css/components.css` — tarefa, projeto, categoria, botão, bloquinho, status, chips
- `css/layout.css` — topo, navegação (celular e desktop) e telas
- `js/components.js` — componentes reutilizáveis
- `js/screens.js` — as telas (dados fictícios)
- `js/app.js` — navegação por `#/rota`
- `js/data.js` — projetos, tipos de item, ids
- `js/store.js` — armazenamento local (localStorage); ponto de troca para o Supabase
- `js/interpreter.js` — interpretação simulada do despejo; ponto de troca para a IA real
- `js/flow.js` — fluxo Despeja → revisão → Caixa Mental, voz e quebra em passos
- `css/despeja.css` — estilos da Fase 1
- `PLANO.md` — plano do MVP

## Trocar a interpretação simulada por IA (fase final)

Só duas funções em `js/interpreter.js` precisam mudar: `interpretar(texto)` e `sugerirPassos(titulo)`.
Elas devolvem `[{ titulo, tipo, projeto, grande }]` e `[string]`; o resto do app não muda.
