# O motor: as peças do edicao.py

O `edicao.py` de cada vídeo importa o motor e monta o quadro. Esqueleto: `molde/edicao.py`. Cada recurso, com o código: `referencias/pecas.md`.

```python
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/editar-meu-video/scripts'))
from motor import *            # peças, tempo, paleta e fontes da pessoa
from kit_animacao import *     # só se tiver animação no painel
```

## Cores e fontes: sempre as da pessoa

Tudo sai do `meu-estilo.md` dela. **Nunca escreva cor nem fonte fixa no edicao.py.**

| Nome | De onde vem | Pra quê |
|---|---|---|
| `TEXTO` | a cor mais clara de `marca.cores` (ou branco) | textos nas animações |
| `DESTAQUE` | `legenda.cor_destaque`, ou a cor viva e clara da marca | pílulas, palavras fortes, partículas |
| `PRINCIPAL` | a cor forte e escura da marca | personagens, círculos, brilho do painel |
| `SUAVE` | mistura de destaque e principal | bordas e detalhes |
| `ESCURO` | a cor mais escura da marca, quase preta | fundo do painel |
| `WHITE` | branco | letterings sobre o vídeo |
| `titulo(tam, peso, italico)` | `marca.fonte_titulos_arquivo`, ou a fonte instalada com o nome `marca.fonte_titulos` | headline e frases fortes. Sem fonte de título: a de texto, mais pesada |
| `sans(tam, peso)` | a fonte da legenda (`legenda.fonte_arquivo` ou `legenda.fonte`); sem ela, a fonte padrão do computador | textos menores, rótulos |

Sem cores na marca, a paleta é neutra (preto, branco e um amarelo de destaque). `paleta()` mostra o que foi escolhido.

## Tempo: sempre ancorado na fala

| Função | O que faz |
|---|---|
| `palavra('método', 30)` | segundo do vídeo **final** em que a pessoa fala "método", procurando a partir do segundo 30 do **bruto** |
| `tb(150.06)` | converte um tempo do bruto pro tempo final |
| `DURACAO` | duração do vídeo final |
| `CORTES_FINAIS` | onde cada corte acontece no vídeo final |
| `cena(3)` | quando a cena 3 (de `cortes/cenas.json`) entra no vídeo final. Pra vídeo sem fala |
| `batidas('materiais/musica.mp3')` (de `ritmo`) | `(bpm, [tempos])` das batidas da música: textos e etiquetas entram NA batida |

O segundo argumento de `palavra()` é a posição aproximada no bruto (veja `legendas/transcricao.txt`). Ele evita pegar a palavra errada quando ela se repete. Se a palavra não existir, dá erro com a dica: não chute um número no lugar.

## Peças

**`Lettering(palavras, linhas_y, sai_em, estrelas=False)`**: texto que se escreve palavra por palavra no tempo da fala.
- `palavras`: lista de `(texto, fonte, cor, linha, tempo)`. Ex.: `('o método', titulo(150, 800), WHITE, 1, T['metodo'])`.
- `linhas_y`: o centro de cada linha, em pixels. **No vertical, abaixo do queixo** (olhe a `grade.jpg`) e acima de ~1550.
- `sai_em`: quando começa a sair (0,3s de saída). `estrelas=True`: estrelinhas na cor de destaque nas pontas.
- `.desenhar(frame, t)` · `.ativo(t)`: True enquanto está na tela (pra esconder a legenda, que repetiria a frase)

**`Etiquetas([(texto, tempo, linha), ...], linhas_y, sai_em, tamanho=40)`**: palavras que a pessoa lista aparecendo uma a uma, em pílulas na cor de destaque. `.desenhar(frame, t)` · `.ativo(t)`.

**`Headline(texto, ini, fim, y_centro, tamanho=44)`**: texto parado em bloco, na fonte e no espaçamento da legenda. Serve pro título do começo, a chamada final, o @ (`E['textos']`) e, em vídeo sem fala, pros textos que contam a história. Lê em qualquer fundo do jeito da legenda da pessoa (caixa na cor dela, sombra suave, ou só a letra); force com `caixa=True` ou `sombra=True` se o fundo for claro.

**`Legenda()`**: lê `legendas/blocos.json` e o estilo (limpa/caixa/destaque/karaokê, fonte, tamanho, contorno, cores, altura).
- `.desenhar(frame, t)`: na altura do estilo (`distancia_do_fundo_px`)
- `.desenhar(frame, t, y_centro=905, y_fundo=952)`: na tela dividida, na faixa escura do painel, **nunca em cima do rosto**
- `.fundo_px = 700`: muda a altura **só neste vídeo** (ex.: a mão cobre a legenda). Pra sempre: no estilo.

**`zoom_lento(base, t, ini, fim, de=1.0, ate=1.08, centro)`**: aproximação lenta e contínua num trecho ("Ken Burns"). Dá vida a plano parado sem fala: paisagem, produto, prato, foto.

**`zoom_do_estilo(base, t, centro, destaques)`**: o zoom do jeito que a pessoa escolheu em `zoom.modo` (nenhum; só nos `destaques` [(ini, fim)], suave; ou alternando a cada corte, seco). Intensidade do estilo. `zoom(base, t, intervalos, centro)` é o zoom suave manual.

**`TelaDividida(ini, fim, painel=func, recorte_y=500)`** ou **`TelaDividida(ini, fim, arquivo='materiais/tela.png')`**
- metade de cima: `painel(t)` devolve uma imagem 1080×960, ou um print/vídeo de `materiais/` (.png, .jpg, .mp4, .mov). Com arquivo, `encaixe='inteiro'` (padrão) mostra o print INTEIRO com ele mesmo desfocado no fundo (print de celular é em pé: preencher cortaria o topo e o pé); `encaixe='preencher'` corta as bordas. Sempre com faixa escura embaixo, pra legenda ler em cima de print claro
- metade de baixo: o vídeo (a pessoa, o produto, a paisagem), recortado a partir de `recorte_y` (escolha pra o rosto ficar no terço de cima da metade de baixo)
- `.compor(base, t)` devolve `(frame, dividida)`: use `dividida` pra decidir onde vai a legenda
- entra e sai deslizando (0,45s)

**`Imagem('materiais/logo.png', ini, fim, centro=(540, 700), largura=300)`**: PNG/print com "pop" e sombra suave.

**`Sons()`**: `brilho(t)`, `ting(t)`, `sino(t)`, `pop(t)`, `whoosh(t)`. Discretos. Se o estilo tiver `som.efeitos: false`, ficam mudos sozinhos.

**`executar(compor, sons, musica=None)`**: `--stills t1 t2` gera `frames/stills.jpg`; `v1` renderiza. A música vem do estilo (`som.musica` + `som.arquivo_musica`) ou do argumento (`musica={'arquivo': 'materiais/x.mp3', 'volume': 0.85}`): instrumental com ducking (abaixa quando alguém fala), fade no fim, e a mistura toda vai pro volume padrão. Em vídeo sem fala a música é o som principal: volume alto (0,8 a 0,9) e `"audio": "baixo"` ou `"sem_som"` no pedido.

## A função compor

```python
def compor(base, t):
    base = zoom_do_estilo(base, t, ROSTO, DESTAQUES)
    frame, dividida = tela.compor(base, t)
    headline.desenhar(frame, t)
    etiquetas.desenhar(frame, t)
    if headline.ativo(t) or etiquetas.ativo(t): return frame     # a legenda não repete o lettering
    if dividida: legenda.desenhar(frame, t, y_centro=905, y_fundo=952)
    else: legenda.desenhar(frame, t)
    return frame
```

A ordem importa: o que vem depois fica por cima. Legenda por último.

## Medidas de referência (vertical 1080×1920)

| O quê | Valor | Por quê |
|---|---|---|
| legenda | a altura do estilo (padrão ~430px do fundo) | abaixo disso o Instagram cobre com o @ e a legenda do post |
| botões do Instagram | ~140px da direita, metade de baixo | nada importante ali |
| topo | ~250px | nome do perfil e áudio |
| lettering | abaixo do queixo, acima de ~1550 | não cobre a boca nem a faixa de baixo |
| zoom | 11% a 19% | menos não se vê, mais parece tremido |
| velocidade | até 1.2x | acima a voz distorce |
