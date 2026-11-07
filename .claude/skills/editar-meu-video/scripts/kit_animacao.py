"""Peças de animação pro painel da tela dividida: agente (robozinho), chip, balão de fala, pessoa em chamada,
documento, feixe com partículas. Tudo desenhado em código, sem programa de edição.

Use dentro de uma função painel(t) que devolve uma imagem PW x PH (a metade de cima do vídeo):
    from kit_animacao import *
    FUNDO = fundo_painel()
    def painel(t):
        im = FUNDO.copy(); d = ImageDraw.Draw(im, 'RGBA')
        agente(d, 540, 400, 70 * pop(t, 3.0), 1, t, badge='doc')
        return im
Veja referencias/animacoes.md.
"""
import math
import numpy as np
from PIL import Image, ImageDraw
from comum import *          # noqa: F401,F403
from comum import medidas

PW, PH = medidas()[0], medidas()[1] // 2


def fundo_painel():
    """Fundo escuro (da paleta da pessoa) com brilho da cor principal e pontinhos. Chame UMA vez (é lento) e use .copy() em cada quadro."""
    y, x = np.mgrid[0:PH, 0:PW].astype(np.float32)
    base = np.ones((PH, PW, 3), np.float32) * np.array(ESCURO, np.float32)
    g1 = np.exp(-(((x - 120) / 520) ** 2 + ((y - 900) / 420) ** 2))[..., None] * np.array([v * 0.75 for v in PRINCIPAL], np.float32)
    g2 = np.exp(-(((x - 980) / 420) ** 2 + ((y - 80) / 300) ** 2))[..., None] * np.array([v * 0.16 for v in SUAVE], np.float32)
    im = Image.fromarray(np.clip(base + g1 + g2, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im, 'RGBA')
    for gx in range(30, PW, 48):
        for gy in range(30, 850, 48): d.ellipse((gx - 1, gy - 1, gx + 1, gy + 1), fill=(255, 247, 236, 16))
    d.line((0, PH - 1, PW, PH - 1), fill=rgba(DESTAQUE, 0.24), width=2)
    return im

F_TIT = sans(32, 600, 24); F_SUB = sans(26, 500, 14); F_CHIP = sans(25, 600, 14); F_MINI = sans(22, 600, 14)


def chip(d, cx, cy, txt, a, s=1.0, cor_txt=TEXTO, fundo=TEXTO, fa=0.10, borda=SUAVE, ba=0.55, font=None, centro=True):
    font = font or F_CHIP
    w = font.getlength(txt) + 34; h = 46
    w2, h2 = w * s / 2, h * s / 2
    x0 = cx - w2 if centro else cx
    d.rounded_rectangle((x0, cy - h2, x0 + 2 * w2, cy + h2), radius=int(23 * s), fill=rgba(fundo, fa * a), outline=rgba(borda, ba * a), width=2)
    if s > 0.6: d.text((x0 + w2, cy), txt, font=font, fill=rgba(cor_txt, a), anchor='mm')
    return w


def check(d, x, y, a, s=1.0):
    d.line([(x, y), (x + 7 * s, y + 8 * s), (x + 20 * s, y - 8 * s)], fill=rgba(DESTAQUE, a), width=4)


def piscada(t, fase):
    c = (t + fase) % 3.4
    return 0.12 if c < 0.13 else 1.0


def agente(d, cx, cy, r, a, t, fase=0.0, badge=None, brilho=0.0, lendo=False):
    """Robozinho (bom pra falar de agentes, automações, IA): cabeça, tela com olhos que piscam, antena com luz e selo da função."""
    if r < 3 or a <= 0: return
    cy = cy + 4 * math.sin(t * 2.2 + fase * 3)       # flutua
    if brilho > 0:
        for k in range(5, 0, -1):
            rr = r * (1.05 + 0.13 * k)
            d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=rgba(DESTAQUE, 0.035 * brilho * a))
    # antena
    d.line((cx, cy - r * 0.85, cx, cy - r * 1.22), fill=rgba(DESTAQUE, a), width=max(2, int(r * 0.06)))
    luz = 0.6 + 0.4 * math.sin(t * 5 + fase)
    rb = r * 0.13
    d.ellipse((cx - rb * 1.8, cy - r * 1.3 - rb * 1.8, cx + rb * 1.8, cy - r * 1.3 + rb * 1.8), fill=rgba(DESTAQUE, 0.25 * luz * a))
    d.ellipse((cx - rb, cy - r * 1.3 - rb, cx + rb, cy - r * 1.3 + rb), fill=rgba(DESTAQUE, a))
    # cabeça
    d.rounded_rectangle((cx - r, cy - r * 0.85, cx + r, cy + r * 0.85), radius=int(r * 0.42),
                        fill=rgba(PRINCIPAL, a), outline=rgba(DESTAQUE, 0.9 * a), width=max(2, int(r * 0.05)))
    # orelhas
    for sx in (-1, 1):
        d.rounded_rectangle((cx + sx * r - r * 0.12, cy - r * 0.25, cx + sx * r + r * 0.12, cy + r * 0.25),
                            radius=int(r * 0.08), fill=rgba(SUAVE, a))
    # tela
    d.rounded_rectangle((cx - r * 0.72, cy - r * 0.52, cx + r * 0.72, cy + r * 0.52), radius=int(r * 0.3), fill=rgba(mistura(ESCURO, PRETO, 0.4), a))
    if lendo:
        for sx in (-1, 1):
            d.rounded_rectangle((cx + sx * r * 0.3 - r * 0.14, cy - r * 0.04, cx + sx * r * 0.3 + r * 0.14, cy + r * 0.04),
                                radius=int(r * 0.04), fill=rgba(DESTAQUE, a))
        yy = cy - r * 0.42 + (r * 0.84) * ((t * 1.6) % 1.0)
        d.line((cx - r * 0.62, yy, cx + r * 0.62, yy), fill=rgba(DESTAQUE, 0.55 * a), width=2)
    else:
        h = r * 0.17 * piscada(t, fase)
        for sx in (-1, 1):
            d.rounded_rectangle((cx + sx * r * 0.3 - r * 0.1, cy - h - r * 0.05, cx + sx * r * 0.3 + r * 0.1, cy + h - r * 0.05),
                                radius=int(r * 0.08), fill=rgba(DESTAQUE, a))
        d.arc((cx - r * 0.18, cy + r * 0.05, cx + r * 0.18, cy + r * 0.32), 20, 160, fill=rgba(DESTAQUE, 0.8 * a), width=max(2, int(r * 0.04)))
    # selo da função
    if badge:
        bx, by, br = cx + r * 0.78, cy + r * 0.62, r * 0.36
        d.ellipse((bx - br, by - br, bx + br, by + br), fill=rgba(TEXTO, a), outline=rgba(PRINCIPAL, a), width=2)
        c = rgba(PRINCIPAL, a)
        if badge == 'doc':
            for k in range(3): d.line((bx - br * 0.45, by - br * 0.35 + k * br * 0.35, bx + br * (0.45 if k < 2 else 0.1), by - br * 0.35 + k * br * 0.35), fill=c, width=3)
        elif badge == 'aula':
            d.polygon([(bx - br * 0.3, by - br * 0.45), (bx - br * 0.3, by + br * 0.45), (bx + br * 0.5, by)], fill=c)
        elif badge == 'todo':
            check(d, bx - br * 0.45, by + br * 0.05, a, br / 22)
            d.line([(bx - br * 0.45, by), (bx - br * 0.12, by + br * 0.35), (bx + br * 0.5, by - br * 0.4)], fill=c, width=4)


def pessoa(d, x0, y0, w, h, a, falando):
    d.rounded_rectangle((x0, y0, x0 + w, y0 + h), radius=16, fill=rgba(mistura(ESCURO, TEXTO, 0.14), a),
                        outline=rgba(DESTAQUE, (0.25 + 0.75 * falando) * a), width=3 if falando > 0.1 else 1)
    cx = x0 + w / 2
    d.ellipse((cx - 26, y0 + h * 0.22, cx + 26, y0 + h * 0.22 + 52), fill=rgba(SUAVE, a))
    d.chord((cx - 52, y0 + h * 0.62, cx + 52, y0 + h * 0.62 + 104), 180, 360, fill=rgba(SUAVE, a))


def balao(d, cx, cy, txt, a, s):
    w = F_CHIP.getlength(txt) + 36; h = 50
    w2, h2 = w * s / 2, h * s / 2
    d.rounded_rectangle((cx - w2, cy - h2, cx + w2, cy + h2), radius=int(18 * s), fill=rgba(TEXTO, a))
    d.polygon([(cx - 14 * s, cy + h2 - 1), (cx + 6 * s, cy + h2 - 1), (cx - 18 * s, cy + h2 + 16 * s)], fill=rgba(TEXTO, a))
    if s > 0.6: d.text((cx, cy), txt, font=F_CHIP, fill=rgba(PRINCIPAL, a), anchor='mm')


def doc_ic(d, x, y, a, s=1.0):
    d.rounded_rectangle((x - 20 * s, y - 26 * s, x + 20 * s, y + 26 * s), radius=6, fill=rgba(TEXTO, a))
    for k in range(4): d.line((x - 11 * s, y - 13 * s + k * 9 * s, x + (11 if k < 3 else 0) * s, y - 13 * s + k * 9 * s), fill=rgba(PRINCIPAL, a), width=2)


def bez(p0, p1, n=40, curva=0.0):
    (x0, y0), (x3, y3) = p0, p1
    x1, y1 = x0 + (x3 - x0) * 0.5, y0 - curva
    x2, y2 = x0 + (x3 - x0) * 0.5, y3 - curva
    return [((1 - s) ** 3 * x0 + 3 * (1 - s) ** 2 * s * x1 + 3 * (1 - s) * s ** 2 * x2 + s ** 3 * x3,
             (1 - s) ** 3 * y0 + 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s ** 2 * y2 + s ** 3 * y3)
            for s in (i / n for i in range(n + 1))]


def feixe(d, pts, desenho, a, t, ativo, fase=0.0):
    n = max(2, int(len(pts) * cl(desenho)))
    d.line(pts[:n], fill=rgba(DESTAQUE, (0.18 + 0.45 * ativo) * a), width=3)
    if ativo > 0.5 and desenho >= 1:
        for j in range(3):
            s = (t * 0.8 + j / 3 + fase) % 1.0
            px, py = pts[int(s * (len(pts) - 1))]
            d.ellipse((px - 7, py - 7, px + 7, py + 7), fill=rgba(DESTAQUE, a))
            d.ellipse((px - 13, py - 13, px + 13, py + 13), fill=rgba(DESTAQUE, 0.18 * a))


