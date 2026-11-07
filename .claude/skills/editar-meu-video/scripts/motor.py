"""O motor de edição. Peças prontas que o edicao.py de cada vídeo monta:

  Lettering   texto que se escreve palavra por palavra no tempo da fala (headline, frase de impacto)
  Etiquetas   palavras que a pessoa lista aparecendo uma a uma, em pílulas
  Headline    texto parado em bloco (ex.: título nos primeiros 7s), na fonte e no espaçamento da legenda
  Legenda     os 4 estilos (limpa, caixa, destaque, karaokê), lendo o meu-estilo.md
  zoom_do_estilo()  o zoom do jeito que a pessoa escolheu (nenhum, nos destaques ou a cada corte)
  zoom_lento()  aproximação lenta e contínua ("Ken Burns"): dá vida a plano parado (paisagem, produto, foto)
  TelaDividida  metade de cima com animação (função painel) ou com vídeo/print (arquivo); o vídeo embaixo
  Imagem      PNG/print que entra com "pop" quando a pessoa fala de algo
  Sons        efeitos sonoros gerados na hora (brilho, pop, whoosh) + música de fundo com ducking
  executar()  renderiza o vídeo (ou só alguns quadros com --stills)

Cores e fontes vêm do meu-estilo.md da pessoa (paleta() e titulo()/sans() em comum.py): nada aqui é fixo.
Veja referencias/motor.md, molde/edicao.py (o esqueleto) e referencias/pecas.md (cada recurso).
"""
import json, math, os, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from comum import *                      # noqa: F401,F403 (estilo, fontes, cores, curvas)
from tempo import t as tb, palavra, cena, DURACAO, CORTES_FINAIS   # noqa: F401

E = estilo()
W, H = medidas()
FPS = 30
ESCALA = W / 1080 if W <= 1080 else H / 1080


def texto_img(txt, font, cor=WHITE):
    l, tp, r, b = font.getbbox(txt)
    im = Image.new('RGBA', (r - l + 8, b - tp + 8), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((4 - l, 4 - tp), txt, font=font, fill=cor)
    return im


def larg(font, txt, tr=0.0):
    """largura do texto com espaçamento extra entre letras (tr em px; negativo = letras mais juntas)"""
    return font.getlength(txt) + tr * max(0, len(txt) - 1)


def escrever(d, x, y, txt, font, fill, tr=0.0):
    if not tr:
        d.text((x, y), txt, font=font, fill=fill); return
    for k, ch in enumerate(txt):
        d.text((x + font.getlength(txt[:k]) + tr * k, y), ch, font=font, fill=fill)


def com_alfa(img, a):
    if a >= 0.999: return img
    im = img.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * cl(a)))); return im


def estrela(d, cx, cy, R, cor):
    pts = []
    for k in range(8):
        ang = math.pi / 4 * k - math.pi / 2; r = R if k % 2 == 0 else R * 0.24
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    d.polygon(pts, fill=cor)


# ───────────────────────── Lettering ─────────────────────────
class Lettering:
    """palavras: [(texto, fonte, cor, linha, tempo_final)]. linhas_y: centro de cada linha.
    Cada palavra se escreve da esquerda pra direita (0,26s; a primeira linha 0,42s) no tempo em que é falada."""

    def __init__(self, palavras, linhas_y, sai_em, sai_dur=0.3, estrelas=False, gap=20):
        self.itens = [(texto_img(tx, f, c), ln, t0) for tx, f, c, ln, t0 in palavras]
        self.sai_em, self.sai_dur, self.estrelas = sai_em, sai_dur, estrelas
        self.ini = min(t0 for *_, t0 in palavras)
        self.pos = [None] * len(self.itens)
        for ln, y in enumerate(linhas_y):
            idx = [i for i, (_, l, _) in enumerate(self.itens) if l == ln]
            total = sum(self.itens[i][0].width for i in idx) + gap * (len(idx) - 1)
            x = W / 2 - total / 2
            for i in idx:
                self.pos[i] = (int(x), int(y - self.itens[i][0].height / 2)); x += self.itens[i][0].width + gap
        if estrelas:
            p0, pf = self.pos[0], self.pos[-1]
            xf = pf[0] + self.itens[-1][0].width; yf = pf[1] + self.itens[-1][0].height / 2
            y0 = p0[1] + self.itens[0][0].height / 2
            self.est = [(p0[0] - 52, y0 - 40, 30), (p0[0] - 20, y0 + 22, 18), (p0[0] - 78, y0 + 32, 13),
                        (xf + 42, yf, 32), (xf + 12, yf + 62, 18), (xf + 70, yf - 40, 13)]
            self.t_est = max(t0 for *_, t0 in palavras) + 0.35
            b = Image.new('RGBA', (120, 120), (0, 0, 0, 0)); ImageDraw.Draw(b).ellipse((30, 30, 90, 90), fill=DESTAQUE + (150,))
            self.brilho = b.filter(ImageFilter.GaussianBlur(14))

    def ativo(self, t):
        """True enquanto o lettering está na tela (use pra esconder a legenda, que repetiria a frase)."""
        return self.ini - 0.05 <= t <= self.sai_em + self.sai_dur

    def desenhar(self, frame, t):
        if t < self.ini or t > self.sai_em + self.sai_dur: return
        s = sai(t, self.sai_em, self.sai_dur); dy = -14 * (1 - s)
        for (im, ln, t0), (x, y) in zip(self.itens, self.pos):
            if t < t0: continue
            p = cl((t - t0) / (0.42 if ln == 0 else 0.26))
            w = max(1, int(im.width * ease(p)))
            frame.alpha_composite(com_alfa(im.crop((0, 0, w, im.height)), min(1, p * 2.2) * s), (x, int(y + dy + 8 * (1 - ease(p)))))
        if self.estrelas and t >= self.t_est:
            d = ImageDraw.Draw(frame)
            for k, (cx, cy, R) in enumerate(self.est):
                pk = p_in(t, self.t_est + k * 0.06, 0.25)
                r = R * ease(pk) * (0.82 + 0.18 * math.sin((t - self.t_est) * 9 + k * 1.7))
                if r < 1: continue
                frame.alpha_composite(com_alfa(self.brilho, s * pk * 0.8), (int(cx - 60), int(cy + dy - 60)))
                estrela(d, cx, cy + dy, r, rgba(DESTAQUE, s))


# ───────────────────────── Headline em bloco ─────────────────────────
class Headline:
    """Texto parado na tela (título, chamada final, @, o texto que conta a história num vídeo sem fala),
    na fonte da legenda, centralizado, várias linhas. Lê em qualquer fundo do jeito da legenda da pessoa:
    legenda em caixa -> texto numa caixa da cor dela; com contorno -> sombra suave; "só a letra" -> só a letra.
    Headline('o título do seu vídeo em uma frase', ini=0, fim=3, y_centro=1367, tamanho=44)"""

    def __init__(self, texto, ini, fim, y_centro=1367, tamanho=44, largura_max=640, espacamento=None, cor=WHITE, entrada=0.25,
                 caixa=None, sombra=None):
        L = E['legenda']
        size = int(tamanho * ESCALA); f = fonte_legenda(size)
        tr = (L.get('espacamento', 0) if espacamento is None else espacamento) * size
        linhas, cur = [], ''
        for w in texto.split():
            t2 = (cur + ' ' + w).strip()
            if cur and larg(f, t2, tr) > largura_max * ESCALA: linhas.append(cur); cur = w
            else: cur = t2
        linhas.append(cur)
        lh = int(size * 1.14)
        caixa = (L.get('estilo') == 'caixa') if caixa is None else caixa
        sombra = (bool(L.get('contorno', True)) and not caixa) if sombra is None else sombra
        self.im = Image.new('RGBA', (W, lh * len(linhas) + size), (0, 0, 0, 0))
        d = ImageDraw.Draw(self.im)
        if caixa:
            cor_caixa = hexcor(L['cor_caixa']) if L.get('cor_caixa') else ESCURO
            for n, ln in enumerate(linhas):
                lw = larg(f, ln, tr); y0 = size * 0.3 + n * lh
                d.rounded_rectangle((W / 2 - lw / 2 - size * 0.42, y0 - size * 0.14, W / 2 + lw / 2 + size * 0.42, y0 + size * 1.12),
                                    radius=int(size * 0.3), fill=cor_caixa + (232,))
        if sombra:
            sb = Image.new('RGBA', self.im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sb)
            for n, ln in enumerate(linhas):
                escrever(ds, W / 2 - larg(f, ln, tr) / 2 + 2, size * 0.3 + n * lh + 4, ln, f, (0, 0, 0, 190), tr)
            self.im = Image.alpha_composite(self.im, sb.filter(ImageFilter.GaussianBlur(max(3, size // 9))))
            d = ImageDraw.Draw(self.im)
        for n, ln in enumerate(linhas):
            escrever(d, W / 2 - larg(f, ln, tr) / 2, size * 0.3 + n * lh, ln, f, cor + (255,), tr)
        self.ini, self.fim, self.y, self.entrada = ini, fim, int(y_centro - self.im.height / 2), entrada

    def desenhar(self, frame, t):
        if t < self.ini or t > self.fim + self.entrada: return
        a = p_in(t, self.ini, self.entrada) * sai(t, self.fim, self.entrada)
        frame.alpha_composite(com_alfa(self.im, a), (0, self.y + int(6 * (1 - p_in(t, self.ini, self.entrada)))))


def desfocar(arquivo, caixas, saida=None, raio=16):
    """Desfoca regiões de um print (nome, @, foto, telefone de outra pessoa) antes de ele entrar no vídeo.
    caixas: [(x0, y0, x1, y1)] em pixels do print original. Salva em materiais/_prep/ e devolve o caminho novo."""
    im = Image.open(os.path.expanduser(arquivo)); im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    for c in caixas:
        c = tuple(int(v) for v in c)
        im.paste(im.crop(c).filter(ImageFilter.GaussianBlur(raio)), c[:2])
    os.makedirs('materiais/_prep', exist_ok=True)
    saida = saida or os.path.join('materiais/_prep', os.path.basename(arquivo))
    im.save(saida); return saida


# ───────────────────────── Etiquetas ─────────────────────────
class Etiquetas:
    """Palavras que a pessoa lista aparecendo uma a uma, com "pop", em pílulas na cor de destaque da marca.
    Etiquetas([('conteúdo', t1, 0), ('vendas', t2, 0), ('dados', t3, 1)], linhas_y=[1250, 1350], sai_em=t4)
    (texto, tempo final em que ela fala, linha). Cada linha é centralizada; confira nos stills se cabe na largura."""

    def __init__(self, itens, linhas_y, sai_em, tamanho=40, sai_dur=0.3):
        self.itens, self.linhas_y, self.sai_em, self.sai_dur = itens, linhas_y, sai_em, sai_dur
        self.f = sans(int(tamanho * ESCALA), 600); self.h = int(tamanho * 0.75 * ESCALA)
        self.pos = {}
        for ln in range(len(linhas_y)):
            linha = [i for i in itens if i[2] == ln]
            ws = [self.f.getlength(i[0]) + 1.1 * tamanho * ESCALA for i in linha]
            x = W / 2 - (sum(ws) + 16 * (len(ws) - 1)) / 2
            for i, w in zip(linha, ws): self.pos[i[0]] = (x + w / 2, w); x += w + 16
        self.ini = min(i[1] for i in itens)

    def ativo(self, t): return self.ini - 0.3 <= t <= self.sai_em + self.sai_dur

    def desenhar(self, frame, t):
        if t < self.ini - 0.3 or t > self.sai_em + self.sai_dur: return
        d = ImageDraw.Draw(frame, 'RGBA'); sa = sai(t, self.sai_em, self.sai_dur)
        for txt, tk, ln in self.itens:
            s = pop(t, tk - 0.25, 0.4)
            if s <= 0.05: continue
            cx, w = self.pos[txt]; cy = self.linhas_y[ln]; a = min(1, s) * sa
            w2, h2 = w * s / 2, self.h * s
            d.rounded_rectangle((cx - w2, cy - h2, cx + w2, cy + h2), radius=int(self.h * s), fill=rgba(DESTAQUE, 0.96 * a))
            if s > 0.7: d.text((cx, cy + 2), txt, font=self.f, fill=rgba(ESCURO, a), anchor='mm')


# ───────────────────────── Legenda ─────────────────────────
class Legenda:
    TAM = {'pequena': 48, 'media': 62, 'grande': 78}

    def __init__(self, arquivo='legendas/blocos.json', tamanho_tela_dividida=None):
        self.blocos = json.load(open(arquivo))
        L = E['legenda']
        self.estilo = L.get('estilo', 'limpa')
        self.contorno = L.get('contorno', True)
        self.cor = hexcor(L.get('cor_texto') or '#FFFFFF')
        self.dest = hexcor(L['cor_destaque']) if L.get('cor_destaque') else DESTAQUE     # sem cor escolhida: a da marca
        self.caixa = hexcor(L['cor_caixa']) if L.get('cor_caixa') else ESCURO
        self.fundo_px = int(L.get('distancia_do_fundo_px', 430) * H / 1920)
        tam = L.get('tamanho', 'media')
        self.size = int((tam if isinstance(tam, (int, float)) else self.TAM.get(tam, 62)) * ESCALA)   # aceita número em px
        self.size_split = int(tamanho_tela_dividida * ESCALA) if tamanho_tela_dividida else (self.size if self.size <= 48 * ESCALA else int(self.size * 0.88))
        self.esp_em = float(L.get('espacamento', 0) or 0)   # em: -0.06 = letras 6% mais juntas
        self.cache = {}

    def _destaque(self, palavras):
        nums = [i for i, p in enumerate(palavras) if any(ch.isdigit() for ch in p[0])]
        return nums[0] if nums else max(range(len(palavras)), key=lambda i: len(palavras[i][0]))

    def _img(self, bloco, t, split):
        estilo = self.estilo
        ativa = None
        if estilo == 'karaoke':
            ativa = max([i for i, p in enumerate(bloco['palavras']) if p[1] <= t] or [0])
        chave = (bloco['ini'], split, ativa)
        if chave in self.cache: return self.cache[chave]
        size = self.size_split if split else self.size
        f = fonte_legenda(size); fd = fonte_legenda(int(size * 1.18), 800)
        pals = [p[0] for p in bloco['palavras']]
        di = self._destaque(bloco['palavras']) if estilo == 'destaque' else None
        fontes = [fd if i == di else f for i in range(len(pals))]
        maxw = (1010 if split else 900) * ESCALA
        tr = self.esp_em * size
        esp = f.getlength(' ') + tr
        linhas, cur, lw = [], [], 0
        for i, p in enumerate(pals):
            lp = larg(fontes[i], p, tr)
            if cur and lw + esp + lp > maxw: linhas.append(cur); cur, lw = [i], lp
            else: cur.append(i); lw += (esp if cur[:-1] else 0) + lp
        linhas.append(cur)
        lh = int(size * 1.24)
        im = Image.new('RGBA', (int(W), lh * len(linhas) + 30), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        sombra = Image.new('RGBA', im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sombra)
        for n, ln in enumerate(linhas):
            tot = sum(larg(fontes[i], pals[i], tr) for i in ln) + esp * (len(ln) - 1)
            x = W / 2 - tot / 2; y = 12 + n * lh
            if estilo == 'caixa':
                d.rounded_rectangle((x - size * 0.42, y - size * 0.16, x + tot + size * 0.42, y + size * 1.12),
                                    radius=int(size * 0.32), fill=self.caixa + (232,))
            for i in ln:
                p, fo = pals[i], fontes[i]; lpx = larg(fo, p, tr); yy = y - (size * 0.1 if fo is fd else 0)
                if estilo == 'karaoke' and i == ativa:
                    d.rounded_rectangle((x - 10, y - 6, x + lpx + 10, y + size * 1.12), radius=int(size * 0.22), fill=self.dest + (255,))
                    escrever(d, x, y, p, fo, ESCURO + (255,), tr)
                else:
                    cor = self.dest if (i == di) else self.cor
                    if self.contorno and estilo != 'caixa':
                        ds.text((x + 3, yy + 5), p, font=fo, fill=(0, 0, 0, 170))
                        d.text((x, yy), p, font=fo, fill=cor + (255,), stroke_width=max(2, int(size * 0.05)), stroke_fill=(10, 10, 10, 235))
                    else:
                        escrever(d, x, yy, p, fo, cor + (255,), tr)
                x += lpx + esp
        if self.contorno and estilo != 'caixa':
            im = Image.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(6)), im)
        bb = im.getbbox() or (0, 0, 1, 1)
        im = im.crop((0, 0, im.width, bb[3] + 4))
        self.cache[chave] = im
        return im

    def desenhar(self, frame, t, y_centro=None, y_fundo=None):
        """y_centro: centraliza a legenda nessa altura (use na tela dividida). Sem ele: a ~430px do fundo."""
        for b in self.blocos:
            if b['ini'] <= t < b['fim']:
                im = self._img(b, t, y_centro is not None)
                if y_centro is not None: y = int(min(y_centro - im.height / 2, (y_fundo or H) - im.height))
                else: y = int(H - self.fundo_px - im.height)
                frame.alpha_composite(im, (0, y)); return


# ───────────────────────── zoom ─────────────────────────
def zoom(base, t, intervalos, centro, z=None, rampa=0.25):
    """intervalos: [(ini, fim)] em tempo final. centro: (x, y) do rosto. z: 1.15 = 15% (padrão: o do estilo)."""
    z = z or 1 + float(E['zoom'].get('intensidade', 0.15))
    f = 1.0
    for a, b in intervalos:
        if a - rampa <= t <= b + rampa:
            f = 1 + (z - 1) * min(ease((t - a + rampa) / rampa), ease((b + rampa - t) / rampa)); break
    if f <= 1.001: return base
    cw, ch = W / f, H / f
    x0 = cl(centro[0] - cw / 2, 0, W - cw); y0 = cl(centro[1] - ch / 2, 0, H - ch)
    return base.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))


def _corte_seco(base, centro, z):
    cw, ch = W / z, H / z
    x0 = cl(centro[0] - cw / 2, 0, W - cw); y0 = cl(centro[1] - ch / 2, 0, H - ch)
    return base.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))


def zoom_lento(base, t, ini, fim, de=1.0, ate=1.08, centro=None):
    """Aproximação lenta e contínua entre ini e fim (tempo final): de 1.0 a 1.08 = 8% no trecho todo.
    Pra plano parado sem fala (paisagem, produto, prato, foto). centro: o assunto (padrão: o meio da tela)."""
    if not (ini <= t <= fim): return base
    z = lerp(de, ate, (t - ini) / max(0.01, fim - ini))
    return _corte_seco(base, centro or (W / 2, H / 2), z) if z > 1.001 else base


def zoom_do_estilo(base, t, centro=None, destaques=()):
    """Aplica o zoom do jeito que a pessoa escolheu em zoom.modo:
       nenhum        -> nada
       destaques     -> zoom suave só nos intervalos de `destaques` [(ini, fim)] (frases de impacto, ancoradas na fala)
       a_cada_corte  -> alterna perto e longe a cada corte, em corte seco (disfarça o pulinho do jump cut)
    centro: o rosto (vídeo com fala) ou o assunto; sem centro, o meio da tela."""
    centro = centro or (W / 2, H / 2)
    modo = str(E['zoom'].get('modo', 'destaques')).lower().replace(' ', '_')
    if modo == 'nenhum': return base
    if modo == 'a_cada_corte':
        z = 1 + float(E['zoom'].get('intensidade', 0.15))
        k = sum(1 for c in CORTES_FINAIS if c <= t)
        return _corte_seco(base, centro, z) if k % 2 == 1 else base
    return zoom(base, t, list(destaques), centro)


# ───────────────────────── Tela dividida ─────────────────────────
class TelaDividida:
    """Metade de cima: painel(t) -> imagem W x H/2, OU arquivo (print .png/.jpg ou vídeo .mp4/.mov).
    Metade de baixo: o vídeo, recortado a partir de recorte_y (no quadro cheio): a pessoa, o produto, a paisagem.
    Com arquivo: encaixe='inteiro' (padrão) mostra o print/vídeo INTEIRO, com ele mesmo desfocado no fundo
    (print de celular é em pé e cortaria o topo e o pé); encaixe='preencher' preenche cortando as bordas.
    Sempre com uma faixa escura embaixo, onde a legenda fica legível (y_centro=905)."""
    FAIXA = 120

    def __init__(self, ini, fim, painel=None, arquivo=None, recorte_y=480, transicao=0.45, encaixe='inteiro'):
        self.ini, self.fim, self.painel, self.recorte_y, self.tr = ini, fim, painel, recorte_y, transicao
        self.HP = H // 2
        self.img = self.proc = None; self.encaixe = encaixe
        if arquivo:
            arquivo = os.path.expanduser(arquivo)
            if arquivo.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                self.img = self._faixa(self._encaixar(Image.open(arquivo).convert('RGB')))
            else:
                self.arquivo = arquivo; self.ult = None

    def _encaixar(self, im):
        esc = max(W / im.width, self.HP / im.height)
        cheio = im.resize((int(im.width * esc), int(im.height * esc)))
        cheio = cheio.crop(((cheio.width - W) // 2, (cheio.height - self.HP) // 2, (cheio.width - W) // 2 + W, (cheio.height - self.HP) // 2 + self.HP))
        if self.encaixe == 'preencher': return cheio
        fundo = cheio.filter(ImageFilter.GaussianBlur(28)).point(lambda v: int(v * 0.45))
        caixa_w, caixa_h = W - 60, self.HP - self.FAIXA - 40
        e = min(caixa_w / im.width, caixa_h / im.height)
        fg = im.resize((max(1, int(im.width * e)), max(1, int(im.height * e))), Image.LANCZOS)
        x, y = (W - fg.width) // 2, 24 + (caixa_h - fg.height) // 2
        sombra = Image.new('L', fundo.size, 0); ImageDraw.Draw(sombra).rectangle((x + 6, y + 10, x + fg.width + 6, y + fg.height + 10), fill=150)
        fundo.paste((0, 0, 0), (0, 0), sombra.filter(ImageFilter.GaussianBlur(16)))
        fundo.paste(fg, (x, y))
        return fundo

    def _faixa(self, im):
        """escurece a parte de baixo do painel pra legenda ler em cima de print claro"""
        g = Image.new('L', (1, self.HP), 0)
        for y in range(self.HP):
            a = cl((y - (self.HP - self.FAIXA - 50)) / 50) * 0.82
            g.putpixel((0, y), int(255 * a))
        im = im.copy(); im.paste((10, 10, 10), (0, 0), g.resize((W, self.HP)))
        return im

    def fator(self, t):
        if t < self.ini or t > self.fim + self.tr: return 0.0
        return ease((t - self.ini) / self.tr) if t < self.ini + self.tr else 1 - ease((t - self.fim) / self.tr)

    def _topo(self, t):
        if self.painel: return self.painel(t)
        if self.img is not None: return self.img
        if self.proc is None:
            modo = 'cortar' if self.encaixe == 'preencher' else 'desfoque'
            self.proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', self.arquivo, '-vf', 'fps=30,' + enquadrar(W, self.HP, modo, ''),
                                          '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
        raw = self.proc.stdout.read(W * self.HP * 3)
        if len(raw) == W * self.HP * 3: self.ult = self._faixa(Image.frombytes('RGB', (W, self.HP), raw))
        return self.ult or Image.new('RGB', (W, self.HP), ESCURO)

    def compor(self, base, t):
        s = self.fator(t)
        if s <= 0: return base.convert('RGBA'), False
        top = int(round(self.HP * s)); src = int(round(self.recorte_y * s))
        out = Image.new('RGB', (W, H))
        out.paste(base.crop((0, src, W, src + H - top)), (0, top))
        if top > 0: out.paste(self._topo(t).crop((0, self.HP - top, W, self.HP)), (0, 0))
        return out.convert('RGBA'), s > 0.5


# ───────────────────────── Imagem na tela (PNG / print) ─────────────────────────
class Imagem:
    def __init__(self, arquivo, ini, fim, centro=(540, 700), largura=300, sombra=True):
        im = Image.open(os.path.expanduser(arquivo)).convert('RGBA')
        esc = largura * ESCALA / im.width
        self.im = im.resize((int(im.width * esc), int(im.height * esc)), Image.LANCZOS)
        self.ini, self.fim, self.centro = ini, fim, centro
        if sombra:
            s = Image.new('RGBA', (self.im.width + 60, self.im.height + 60), (0, 0, 0, 0))
            s.paste((0, 0, 0, 110), (30, 36), self.im.getchannel('A'))
            self.sombra = s.filter(ImageFilter.GaussianBlur(14))
        else: self.sombra = None

    def desenhar(self, frame, t):
        if t < self.ini or t > self.fim + 0.25: return
        sc = pop(t, self.ini, 0.4); a = min(1, sc) * sai(t, self.fim, 0.25)
        if sc <= 0.05: return
        im = self.im.resize((max(1, int(self.im.width * sc)), max(1, int(self.im.height * sc))))
        x, y = int(self.centro[0] - im.width / 2), int(self.centro[1] - im.height / 2)
        if self.sombra is not None and sc > 0.9: frame.alpha_composite(com_alfa(self.sombra, a), (x - 30, y - 30))
        frame.alpha_composite(com_alfa(im, a), (x, y))


# ───────────────────────── Sons ─────────────────────────
SR = 48000


class Sons:
    """Efeitos discretos. Se o estilo da pessoa tiver som.efeitos: false, ficam mudos sozinhos."""
    def __init__(self):
        self.y = np.zeros(int(SR * (DURACAO + 2)), np.float32)
        self.ligado = bool(E['som'].get('efeitos', True))

    def _put(self, s, t0):
        if not self.ligado: return
        i0 = int(SR * max(0, t0)); n = len(self.y)
        if i0 < n: self.y[i0:i0 + len(s)] += s[:n - i0]

    def _sino(self, freqs, dur, passo, decai, ganho):
        y = np.zeros(int(SR * (dur + passo * len(freqs))), np.float32)
        tt = np.arange(int(SR * dur)) / SR
        env = np.minimum(1, tt / 0.004) * np.exp(-decai * tt)
        for i, f in enumerate(freqs):
            tom = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.01 * tt)
            i0 = int(SR * passo * i); y[i0:i0 + len(tt)] += (tom * env * ganho).astype(np.float32)
        return y

    def brilho(self, t0):
        """o 'somzinho' de lettering aparecendo"""
        self._put(self._sino([1318.5, 1760, 2349.3, 2637, 3136, 3520], 1.1, 0.07, 5.0, 0.07), t0)

    def ting(self, t0): self._put(self._sino([2637, 3520, 4186], 0.7, 0.05, 7.0, 0.06), t0)
    def sino(self, t0): self._put(self._sino([1046.5, 1568, 2093], 1.0, 0.08, 4.0, 0.06), t0)

    def pop(self, t0, ganho=0.10):
        tt = np.arange(int(SR * 0.09)) / SR; f = 480 + 520 * tt / 0.09
        self._put((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-38 * tt) * ganho).astype(np.float32), t0)

    def whoosh(self, t0, dur=0.45, ganho=0.05):
        n = int(SR * dur); r = np.random.default_rng(1).standard_normal(n).astype(np.float32)
        r = np.convolve(r, np.ones(40) / 40, mode='same'); self._put(r * np.sin(np.linspace(0, np.pi, n)) ** 2 * ganho * 4, t0)

    def salvar(self, caminho='cortes/sfx.wav'):
        st = np.stack([self.y, self.y], 1)
        with wave.open(caminho, 'wb') as wf:
            wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
            wf.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())


# ───────────────────────── execução ─────────────────────────
def _quadro(seg):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(seg), '-i', 'cortes/cortado.mp4', '-frames:v', '1',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return Image.frombytes('RGB', (W, H), raw[:W * H * 3])


def executar(compor, sons=None, musica=None):
    """python edicao.py --stills 2 15.5 40  -> confere quadros em frames/stills.jpg
       python edicao.py v1                  -> renderiza output/<pasta>-v1.mp4 e a versão -instagram"""
    if '--stills' in sys.argv:
        ts = [float(x) for x in sys.argv[sys.argv.index('--stills') + 1:]]
        ims = [compor(_quadro(s), s).convert('RGB') for s in ts]
        for s, f in zip(ts, ims): f.save(f'frames/still_{s:06.2f}.jpg', quality=88)
        cols = min(4, len(ims)); rows = math.ceil(len(ims) / cols); tw = 360; th = int(tw * H / W)
        m = Image.new('RGB', (cols * tw, rows * th), (20, 20, 20))
        for i, f in enumerate(ims): m.paste(f.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
        m.save('frames/stills.jpg', quality=85); print('frames/stills.jpg'); return

    nome = next((a for a in sys.argv[1:] if not a.startswith('-')), 'v1')
    if musica is None and E['som'].get('musica') and E['som'].get('arquivo_musica'):
        arq = os.path.expanduser(E['som']['arquivo_musica'])          # a trilha do estilo da pessoa (livre de direitos)
        if os.path.exists(arq): musica = {'arquivo': arq, 'volume': 0.25}
        else: print(f'[aviso] a música do estilo não foi encontrada: {arq} (seguindo sem música)')
    pasta = os.path.basename(os.getcwd())
    (sons or Sons()).salvar()
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', 'cortes/cortado.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                            '-i', '-', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                            'cortes/video_sem_audio.mp4'], stdin=subprocess.PIPE)
    i, tam = 0, W * H * 3
    while True:
        raw = dec.stdout.read(tam)
        if len(raw) < tam: break
        enc.stdin.write(compor(Image.frombytes('RGB', (W, H), raw), i / FPS).convert('RGB').tobytes())
        i += 1
        if i % 300 == 0: print(f'  {i / FPS:6.1f}s / {DURACAO:.1f}s', flush=True)
    enc.stdin.close(); enc.wait(); dec.wait()

    saida = f'output/{pasta}-{nome}.mp4'
    ent = ['-i', 'cortes/video_sem_audio.mp4', '-i', 'cortes/cortado.mp4', '-i', 'cortes/sfx.wav']
    st = 'aformat=sample_rates=48000:channel_layouts=stereo'
    if musica:
        ent += ['-stream_loop', '-1', '-i', os.path.expanduser(musica['arquivo'])]
        vol = musica.get('volume', 0.25)
        fc = (f'[1:a]{st},asplit=2[voz][chave];[3:a]{st},volume={vol},atrim=0:{DURACAO:.2f},'
              f'afade=t=out:st={DURACAO - 2:.2f}:d=2[m];[m][chave]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[mus];'
              f'[2:a]{st}[fx];[voz][mus][fx]amix=inputs=3:normalize=0:duration=first,'
              f'loudnorm=I={E["som"].get("volume_alvo_lufs", -14)}:TP=-2:LRA=11,alimiter=limit=0.70:level=disabled,aresample=48000[a]')   # com música: a mistura toda no volume padrão
    else:
        fc = f'[1:a]{st}[voz];[2:a]{st}[fx];[voz][fx]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.70:level=disabled[a]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', saida], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', saida, '-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                    '-c:a', 'copy', '-movflags', '+faststart', saida.replace('.mp4', '-instagram.mp4')], check=True)
    print('pronto:', saida, '|', saida.replace('.mp4', '-instagram.mp4'))
