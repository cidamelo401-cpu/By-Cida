# Catálogo de peças (consulte só a peça que a pessoa pediu)

Nada aqui é padrão. Uma peça só entra no vídeo se estiver em `recursos` no estilo da pessoa ou se ela pedir no briefing, e se o mapa de recursos foi aprovado. O jeito de cada uma (cor, fonte, tamanho, posição) vem do estilo dela e do que ela descrever: os números abaixo são só ponto de partida.

Toda peça vai pra lista `pecas` do `molde/edicao.py` (ou, a tela dividida, pra variável `tela`). Tempos sempre ancorados: `palavra()`, `cena()` ou batida.

---

## Texto na tela (título, chamada, texto que conta a história)

Texto parado, na fonte e no jeito da legenda da pessoa (caixa, contorno ou só a letra). Em vídeo sem fala, um por cena faz o papel da legenda.

```python
pecas.append(Headline('[o texto]', ini=T['x'], fim=T['y'], y_centro=1350, tamanho=54))
```

## Lettering (texto que se escreve no tempo da fala)

Pra abertura (headline) ou frase forte do meio. Cada palavra entra quando é falada. A pessoa decide o visual: misturar `titulo()` (fonte de títulos da marca) e `sans()`, tamanhos, cores da paleta.

```python
pecas.append(Lettering([
    ('[palavra]', sans(64, 600), TEXTO, 0, T['p1']),
    ('[PALAVRA FORTE]', titulo(150, 800), WHITE, 1, T['p2']),
], linhas_y=[1190, 1330], sai_em=T['depois'] - 0.3))     # abaixo do rosto/assunto; .ativo(t) esconde a legenda
```

## Etiquetas (palavras que a pessoa lista)

```python
pecas.append(Etiquetas([('[item 1]', T['i1'], 0), ('[item 2]', T['i2'], 0), ('[item 3]', T['i3'], 1)],
                       linhas_y=[1250, 1350], sai_em=T['fim_lista'] - 0.1))
```

## Imagem na tela (PNG, logo, print, foto)

A imagem da pessoa, em `materiais/`, aparecendo com "pop" quando ela fala do assunto. Posição e tamanho: onde não cobre o rosto/assunto.

```python
pecas.append(Imagem('materiais/[arquivo].png', T['aparece'], T['some'], centro=(540, 700), largura=420))
```

## Tela dividida com print, foto ou vídeo

Em cima o arquivo da pessoa (inteiro, com fundo desfocado; `encaixe='preencher'` corta as bordas), embaixo o vídeo.

```python
tela = TelaDividida(T['comeca'] - 0.15, T['termina'], arquivo='materiais/[arquivo].png', recorte_y=500)
```

## Animação (só se a pessoa pedir)

Desenhada em código, nas cores da marca, construída conforme a fala. Pode ser na metade de cima de uma tela dividida, por cima do vídeo, ou ocupando a tela inteira: **o lugar e o conteúdo vêm do pedido dela**. Como fazer: `referencias/animacoes.md`.

## Zoom

O zoom do estilo já está no molde (`zoom_do_estilo`). Zoom lento num plano parado (paisagem, produto, prato):

```python
LENTOS = [(T['plano_ini'], T['plano_fim'])]
# no compor, antes do zoom_do_estilo:
for a, b in LENTOS: base = zoom_lento(base, t, a, b, ate=1.08, centro=ASSUNTO)
```

## Música e cortes na batida

Só instrumental livre de direitos que a pessoa entregou (ou `som.arquivo_musica` do estilo). Música famosa: pelo Instagram, na hora de postar.

```python
from ritmo import batidas
BPM, BATIDAS = batidas('materiais/[musica].mp3')         # textos e etiquetas podem entrar NA batida: BATIDAS[n]
executar(compor, sons, musica={'arquivo': 'materiais/[musica].mp3', 'volume': 0.85})   # sem fala: alto; com fala: ~0.25
```

## Desfocar dados de terceiros (sempre que aparecer gente que não é a pessoa)

Nome, @, foto, telefone, e-mail ou conversa de outra pessoa num print. Pergunte antes e recomende desfocar. As caixas são em pixels do print original (olhe a imagem e meça).

```python
POST = desfocar('materiais/[print].png', [(x0, y0, x1, y1), (x0, y0, x1, y1)])   # devolve materiais/_prep/[print].png
```

## Efeitos sonoros

Só se `som.efeitos` for true (senão ficam mudos sozinhos). Discretos, quando algo aparece.

```python
sons.pop(T['aparece'] - 0.05)     # também: brilho (lettering), ting, sino (frase forte), whoosh (tela dividida)
```
