"""Etapa 4 (fim): a prévia da legenda NO SEU VÍDEO, com o motor de verdade, antes de montar qualquer recurso.

  python previa.py            -> frames/previa-legenda.jpg: a sua legenda (do meu-estilo.md) em 3 momentos do vídeo cortado
  python previa.py --todos    -> frames/previa-4-estilos.jpg: o mesmo quadro nos 4 estilos (limpa, caixa, destaque, karaokê)

É a mesma classe Legenda que o render usa: o que aparece aqui é o que vai sair no vídeo.
Roda depois do legendas.py (precisa de cortes/cortado.mp4 e legendas/blocos.json).
"""
import json, sys
from PIL import Image, ImageDraw
import motor
from motor import Legenda, W, H, sans, _quadro

blocos = json.load(open('legendas/blocos.json'))
if not blocos:
    sys.exit('vídeo sem fala: não tem legenda pra mostrar. Mostre o estilo dos textos na tela nos quadros de conferência (--stills).')
# 3 momentos: um bloco no começo, um no meio e um no fim (sempre no meio do bloco, com a legenda inteira na tela)
idx = [min(2, len(blocos) - 1), len(blocos) // 2, max(0, len(blocos) - 3)]
ts = [(blocos[i]['ini'] + blocos[i]['fim']) / 2 for i in idx]
TW = 360; TH = int(TW * H / W)


def rotulo(im, txt):
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, im.width, 34), fill=(10, 10, 10))
    d.text((im.width / 2, 17), txt, font=sans(18, 600), fill=(255, 247, 236), anchor='mm')
    return im


if '--todos' in sys.argv:
    t = ts[1]
    base = _quadro(t)
    quadros = []
    for nome in ['limpa', 'caixa', 'destaque', 'karaoke']:
        leg = Legenda(); leg.estilo = nome
        if nome == 'limpa': leg.contorno = motor.E['legenda'].get('contorno', True)
        f = base.convert('RGBA'); leg.desenhar(f, t)
        quadros.append(rotulo(f.convert('RGB').resize((TW, TH)), nome))
    saida = 'frames/previa-4-estilos.jpg'
else:
    L = motor.E['legenda']
    leg = Legenda()
    quadros = []
    for t in ts:
        f = _quadro(t).convert('RGBA'); leg.desenhar(f, t)
        quadros.append(rotulo(f.convert('RGB').resize((TW, TH)), f'{int(t // 60)}:{t % 60:04.1f}'))
    saida = 'frames/previa-legenda.jpg'
    print(f"legenda: {L.get('estilo')}, {L.get('tamanho')}, {L.get('palavras_por_vez')} palavras, "
          f"{L.get('distancia_do_fundo_px')}px do fundo, contorno {'sim' if L.get('contorno', True) else 'não'}")

m = Image.new('RGB', (TW * len(quadros), TH), (20, 20, 20))
for i, q in enumerate(quadros): m.paste(q, (i * TW, 0))
m.save(saida, quality=88)
print(saida)
