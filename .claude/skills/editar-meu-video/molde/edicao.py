"""MOLDE do edicao.py: o esqueleto de toda edição. Copie pra pasta do vídeo e complete com o que ESTE vídeo pede.

Aqui só tem o que vale pra qualquer vídeo e vem do estilo da pessoa: legenda (se tem fala), textos do estilo
(título, chamada final, @), zoom do estilo e efeitos. NÃO tem recurso nenhum pronto: headline, imagem, tela dividida,
animação, etiquetas, música... só entram se a pessoa pediu (estilo ou briefing) e o mapa de recursos foi aprovado.
Cada peça está em referencias/pecas.md, com o código pra copiar.
Nunca escreva cor nem fonte fixa: use a paleta (TEXTO, DESTAQUE, PRINCIPAL, SUAVE, ESCURO) e titulo()/sans().

  python edicao.py --stills 2 10 20      (OLHE frames/stills.jpg)
  python edicao.py v1
"""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/editar-meu-video/scripts'))
from motor import *            # noqa: F401,F403

E = estilo()
TEM_FALA = bool(json.load(open('legendas/blocos.json')))

# ── 1. âncoras: todo tempo vem de algo real (veja referencias/motor.md) ──
#    com fala:  palavra('palavra', segundo_aproximado_no_bruto)
#    sem fala:  cena(n)  ou uma batida da música (ritmo.batidas)
T = {}

# ── 2. onde está o assunto (na grade.jpg): o rosto, o produto, o prato, o horizonte ──
ASSUNTO = (W / 2, H / 2)

# ── 3. os textos que o ESTILO pede (E['textos']); escreva o título deste vídeo ──
TITULO = ''                    # ex.: 'o assunto em poucas palavras' (só se E['textos']['titulo_inicio'])
pecas = []
if E['textos'].get('titulo_inicio') and TITULO:
    pecas.append(Headline(TITULO, ini=0, fim=2.5, y_centro=int(H * 0.16)))
if E['textos'].get('chamada_final'):
    pecas.append(Headline(E['textos']['chamada_final'], ini=max(0, DURACAO - 3), fim=DURACAO, y_centro=int(H * 0.62)))
if E['textos'].get('arroba'):
    pecas.append(Headline(E['textos']['arroba'], ini=0, fim=DURACAO, y_centro=int(H * 0.16), tamanho=32))

# ── 4. os recursos aprovados no mapa entram aqui (referencias/pecas.md) ──
#    pecas.append(...)            letterings, imagens, etiquetas, textos por cena
tela = None                     # tela dividida, se aprovada: TelaDividida(...)
DESTAQUES = []                  # [(ini, fim)] das frases fortes, se o zoom do estilo for "destaques"

legenda = Legenda()


def compor(base, t):
    base = zoom_do_estilo(base, t, ASSUNTO, DESTAQUES)
    frame, dividida = tela.compor(base, t) if tela else (base.convert('RGBA'), False)
    for p in pecas:
        p.desenhar(frame, t)
    if TEM_FALA and not any(getattr(p, 'ativo', lambda _: False)(t) for p in pecas):   # lettering na tela: a legenda sai da frente
        if dividida: legenda.desenhar(frame, t, y_centro=905, y_fundo=952)
        else: legenda.desenhar(frame, t)
    return frame


sons = Sons()                   # mudo sozinho se o estilo tiver som.efeitos: false
executar(compor, sons)          # música: a do estilo (som.musica) ou musica={'arquivo': 'materiais/...', 'volume': ...}
