# Animação (só quando a pessoa pede)

Animação não é padrão. Ela só existe se a pessoa pediu, e **o que aparece, onde e como vem do pedido dela**: os elementos (na ordem em que ela explica), o lugar (metade de cima de uma tela dividida, por cima do vídeo, ou a tela inteira) e o clima. As cores e fontes são as da marca dela (`TEXTO`, `DESTAQUE`, `PRINCIPAL`, `SUAVE`, `ESCURO`, `titulo()`, `sans()`). Se o pedido for vago, pergunte: "o que você quer que apareça, e onde?".

A animação é desenhada em código, quadro a quadro, e **se constrói conforme a fala** (ou a batida, ou as cenas): cada elemento nasce ancorado num momento real.

## Regras pra não ficar estática nem confusa (aprendidas em animações reprovadas)

1. **Nunca abre vazia.** No primeiro quadro já tem algo vivo (um título, os lugares dos elementos). Nunca um fundo esperando a próxima palavra.
2. **Objetos e personagens, não caixinhas com texto.** O que a pessoa está explicando, desenhado: um celular, um post, um balão de fala, um caminho, um gráfico subindo, um robozinho. Tudo flutua de leve, pisca, se move.
3. **Mesmo tipo, mesmo tamanho.**
4. **Nasça 0,25 a 0,35s antes do momento** (da palavra ou da batida).
5. **Atos:** 2 a 4 cenas que acompanham a explicação. O ato anterior sai (0,4s) e **só depois** o novo entra.
6. **Texto dentro da tela**, longe das bordas e das áreas que o Instagram cobre (~250px em cima, ~420px embaixo, ~140px na direita, num 1080×1920).
7. **Contraste:** texto `ESCURO` sobre `DESTAQUE`; `TEXTO` sobre `PRINCIPAL` e sobre fundo escuro.

## Onde a animação mora

**Na metade de cima de uma tela dividida** (o vídeo embaixo):
```python
def painel(t):                      # devolve uma imagem PW x PH (1080 x 960)
    im = FUNDO.copy(); d = ImageDraw.Draw(im, 'RGBA')
    ...
    return im
tela = TelaDividida(ini, fim, painel=painel, recorte_y=500)   # deixe y > 860 livre: é onde a legenda fica
```

**Por cima do vídeo** (o vídeo continua inteiro; a animação ocupa um canto ou o espaço livre visto na `grade.jpg`):
```python
def por_cima(frame, t):
    if not (ini <= t <= fim): return
    d = ImageDraw.Draw(frame, 'RGBA')
    ...                              # nada em cima do rosto/assunto
# no compor: por_cima(frame, t) antes da legenda
```

**Na tela inteira** (o vídeo some por um momento):
```python
TELA = fundo_painel().resize((W, H))   # ou Image.new('RGB', (W, H), ESCURO)
# no compor: if ini <= t <= fim: frame = desenhar_cena(TELA.copy(), t).convert('RGBA')
```

## Peças do kit_animacao (use as que servem ao pedido)

| Peça | O que é |
|---|---|
| `fundo_painel()` | fundo escuro da paleta com brilho da cor principal. Chame **uma vez** e use `.copy()` |
| `chip(d, cx, cy, texto, a, s)` | etiqueta arredondada (translúcida; cheia: `fundo=DESTAQUE, fa=1, cor_txt=ESCURO`) |
| `balao(d, cx, cy, texto, a, s)` | balão de fala |
| `pessoa(d, x0, y0, w, h, a, falando)` | participante numa chamada |
| `doc_ic(d, x, y, a, s)` | documento |
| `agente(d, cx, cy, r, a, t, ...)` | robozinho (agentes, automação, IA) |
| `bez(p0, p1)` + `feixe(d, pts, desenho, a, t, ativo)` | caminho que se desenha e leva partículas |
| `check(d, x, y, a)` | ✓ |

Faltou um objeto? Desenhe com `ImageDraw` (retângulos arredondados, círculos, linhas, polígonos), nas cores da paleta. Curvas de movimento (de `comum.py`): `p_in` (entra suave), `pop` (entra com elástico), `sai`, `lerp`, `ease`, `mistura`.

Antes de renderizar, sempre `--stills` em 8 a 16 momentos (o primeiro quadro e cada troca de ato) e **olhe**.
