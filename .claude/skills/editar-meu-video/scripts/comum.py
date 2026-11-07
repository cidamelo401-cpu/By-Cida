"""Peças comuns: estilo da pessoa, fontes, cores, curvas de animação.
Todos os scripts rodam DENTRO da pasta do vídeo (ex.: ~/editar-video/video-01/)."""
import math, os, re, sys

for _f in (sys.stdout, sys.stderr):        # console do Windows estraga acento sem isso
    try: _f.reconfigure(encoding="utf-8")
    except Exception: pass
from functools import lru_cache

AQUI = os.path.dirname(os.path.abspath(__file__))


def garantir_ffmpeg():
    """Usa o ffmpeg do computador se existir; senão, o que vem dentro do pacote static-ffmpeg
    (instalado pelo instalar.sh / instalar.ps1). Assim ninguém precisa de Homebrew nem de senha."""
    import shutil
    if shutil.which('ffmpeg') and shutil.which('ffprobe'):
        return
    try:
        import static_ffmpeg
        static_ffmpeg.add_paths()
    except ImportError:
        raise SystemExit('ffmpeg não encontrado. Rode o instalador da skill: scripts/instalar.sh (Mac) ou scripts/instalar.ps1 (Windows).')


garantir_ffmpeg()

def _corrigir_texto_transparente():
    """Algumas versões da Pillow (ex.: 12.3) ignoram a transparência do texto (fill com alfa): o texto que devia
    surgir suave aparece de uma vez, até com alfa 0. Se for o caso, desenha o texto numa máscara e cola com o alfa."""
    from PIL import Image, ImageDraw, ImageFont
    try:
        f = ImageFont.load_default(size=30)
        im = Image.new('RGB', (80, 40)); ImageDraw.Draw(im, 'RGBA').text((4, 2), 'II', font=f, fill=(255, 255, 255, 0))
        if im.getbbox() is None: return              # esta Pillow respeita o alfa: nada a fazer
    except Exception:
        return
    original = ImageDraw.ImageDraw.text

    def text(self, xy, text, fill=None, font=None, anchor=None, *args, **kw):
        if args or not (isinstance(fill, tuple) and len(fill) == 4 and fill[3] < 255) or kw.get('stroke_width'):
            return original(self, xy, text, fill, font, anchor, *args, **kw)
        if fill[3] <= 0 or not text: return
        x0, y0, x1, y1 = (int(v) for v in self.textbbox(xy, text, font=font, anchor=anchor, **kw))
        x0 -= 2; y0 -= 2; x1 += 2; y1 += 2
        if x1 <= x0 or y1 <= y0: return
        m = Image.new('L', (x1 - x0, y1 - y0))
        ImageDraw.Draw(m).text((xy[0] - x0, xy[1] - y0), text, fill=255, font=font, anchor=anchor, **kw)
        m = m.point(lambda v: v * fill[3] // 255)
        self._image.paste(fill[:3] if self._image.mode == 'RGB' else fill[:3] + (255,), (x0, y0), m)

    ImageDraw.ImageDraw.text = text


_corrigir_texto_transparente()
BASE = os.path.expanduser('~/editar-video')

WHITE = (255, 255, 255); PRETO = (0, 0, 0)

PADRAO = {
    'formato': '9x16', 'ritmo': 'medio', 'velocidade': 1.1, 'respiro_corte': 0.14, 'pausa_maxima': 0.45,
    'palavra_codigo': 'corta',
    'legenda': {'estilo': 'limpa', 'palavras_por_vez': 4, 'minusculas': True, 'tamanho': 'media', 'fonte': '',
                'fonte_arquivo': '', 'contorno': True, 'cor_texto': '#FFFFFF', 'cor_destaque': '',
                'cor_caixa': '', 'distancia_do_fundo_px': 430},
    'zoom': {'modo': 'destaques', 'intensidade': 0.15},
    'textos': {'titulo_inicio': True, 'chamada_final': '', 'arroba': ''},
    'marca': {'cores': [], 'fonte_titulos': '', 'fonte_titulos_arquivo': ''},
    'recursos': [],
    'cor': {'ajuste': 'leve'},
    'som': {'musica': False, 'arquivo_musica': '', 'volume_alvo_lufs': -14, 'reduzir_ruido': True, 'efeitos': True},
    'glossario': [], 'nunca_cortar': [],
}


def _mesclar(a, b):
    out = dict(a)
    for k, v in (b or {}).items():
        out[k] = _mesclar(a[k], v) if isinstance(v, dict) and isinstance(a.get(k), dict) else v
    return out


@lru_cache(None)
def estilo(caminho=None):
    """Lê o bloco yaml do meu-estilo.md da pessoa. Se não existir, usa o padrão (e avisa).
    EDITAR_VIDEO_ESTILO=/outro/arquivo.md usa outro estilo (ex.: testar um estilo sem mexer no seu)."""
    caminho = caminho or os.path.expanduser(os.environ.get('EDITAR_VIDEO_ESTILO') or os.path.join(BASE, 'meu-estilo.md'))
    if not os.path.exists(caminho):
        print(f'[aviso] {caminho} não existe: usando o estilo padrão')
        return PADRAO
    import yaml
    txt = open(caminho, encoding='utf-8').read()
    m = re.search(r'```yaml\n(.*?)```', txt, re.S)
    return _mesclar(PADRAO, yaml.safe_load(m.group(1)) if m else {})


def hexcor(h):
    h = h.strip().lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


FORMATOS = {'9x16': (1080, 1920), '4x5': (1080, 1350), '16x9': (1920, 1080)}


def medidas():
    return FORMATOS.get(str(estilo()['formato']), (1080, 1920))


def enquadrar(W, H, modo, saida):
    """Trecho de filtro do ffmpeg que põe a imagem no formato do vídeo final (continua uma cadeia já aberta).
    cortar   = preenche a tela, cortando o que sobra (vídeo em pé num formato em pé)
    desfoque = o vídeo inteiro no meio, com ele mesmo desfocado atrás (vídeo deitado num formato em pé, ou o contrário)
    pronto   = já está no formato (os clipes juntados pelo preparar.py)"""
    if modo == 'desfoque':
        return (f'split=2[_bg][_fg];[_bg]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},'
                f'boxblur=26:2,eq=brightness=-0.07[_bg2];[_fg]scale={W}:{H}:force_original_aspect_ratio=decrease[_fg2];'
                f'[_bg2][_fg2]overlay=(W-w)/2:(H-h)/2,setsar=1{saida}')
    if modo == 'pronto':
        return f'scale={W}:{H},setsar=1{saida}'
    return f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1{saida}'


# ── a paleta da pessoa (das cores da marca no meu-estilo.md) ──
def _lum(c):
    def ch(v):
        v /= 255; return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = c; return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def _sat(c):
    import colorsys
    return colorsys.rgb_to_hls(*(v / 255 for v in c))[2]


def mistura(a, b, p):
    """p = quanto de b (0 = só a, 1 = só b)"""
    return tuple(int(round(x + (y - x) * p)) for x, y in zip(a, b))


@lru_cache(None)
def paleta():
    """Monta a paleta das animações, letterings e etiquetas a partir de marca.cores (e da cor de destaque da legenda).
    TEXTO: a cor mais clara da marca (ou branco) · DESTAQUE: a cor viva e clara (chips, palavras em destaque)
    PRINCIPAL: a cor forte da marca (personagens, círculos) · SUAVE: bordas e detalhes · ESCURO: fundo do painel.
    Sem cores na marca: neutra (preto, branco e o destaque da legenda ou um amarelo)."""
    E = estilo()
    cores = []
    for h in (E['marca'].get('cores') or []):
        try: cores.append(hexcor(str(h)))
        except Exception: pass
    dest_leg = str(E['legenda'].get('cor_destaque') or '').strip()
    claras = [c for c in cores if _lum(c) > 0.72]
    texto = max(claras, key=_lum) if claras else WHITE
    resto = [c for c in cores if c != texto]
    if dest_leg:
        destaque = hexcor(dest_leg)
    else:
        cand = [c for c in resto if _lum(c) >= 0.15 and _sat(c) > 0.2]          # a cor viva e clara o bastante
        destaque = max(cand, key=lambda c: _sat(c) * _lum(c)) if cand else None
    escuras = [c for c in resto if c != destaque and _lum(c) < 0.35]
    vivas = [c for c in escuras if _sat(c) > 0.15]
    principal = (max(vivas, key=_sat) if vivas else min(escuras, key=_lum) if escuras
                 else mistura(destaque, PRETO, 0.5) if destaque else (43, 43, 48))
    if destaque is None:
        destaque = mistura(principal, WHITE, 0.55) if cores else (255, 232, 115)
    base_escura = min(cores, key=_lum) if cores and _lum(min(cores, key=_lum)) < 0.15 else principal
    escuro = mistura(base_escura, PRETO, 0.82)
    suave = mistura(destaque, principal, 0.45)
    return {'TEXTO': texto, 'DESTAQUE': destaque, 'PRINCIPAL': principal, 'SUAVE': suave, 'ESCURO': escuro}


_P = paleta()
TEXTO, DESTAQUE, PRINCIPAL, SUAVE, ESCURO = _P['TEXTO'], _P['DESTAQUE'], _P['PRINCIPAL'], _P['SUAVE'], _P['ESCURO']


# ── fontes: as da pessoa; quando ela não tem, a fonte padrão do computador dela (a skill não traz fonte nenhuma) ──
def _pastas_de_fontes():
    home = os.path.expanduser('~')
    return [os.path.join(BASE, 'fontes'), os.path.join(home, 'Library', 'Fonts'), '/Library/Fonts',
            '/System/Library/Fonts', '/System/Library/Fonts/Supplemental',
            os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Microsoft', 'Windows', 'Fonts'),
            os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts'),
            os.path.join(home, '.fonts'), '/usr/share/fonts']


@lru_cache(None)
def achar_fonte(nome, italico=False):
    """Procura uma fonte instalada pelo nome (ex.: "Montserrat"). Devolve o caminho do arquivo ou ''."""
    alvo = re.sub(r'[^a-z0-9]', '', (nome or '').lower())
    if not alvo: return ''
    achados = []
    for pasta in _pastas_de_fontes():
        if not pasta or not os.path.isdir(pasta): continue
        for raiz, _, arqs in os.walk(pasta):
            for a in arqs:
                if not a.lower().endswith(('.ttf', '.otf', '.ttc')): continue
                n = re.sub(r'[^a-z0-9]', '', a.lower())
                if n.startswith(alvo): achados.append(os.path.join(raiz, a))
    if not achados: return ''
    def nota(c):
        b = os.path.basename(c).lower(); it = 'italic' in b or 'oblique' in b
        return (it != italico, 'variable' not in b and '[' not in b, len(b))
    return sorted(achados, key=nota)[0]


def _irma_italica(arq):
    """Pra uma fonte de marca, acha o arquivo itálico ao lado (ex.: Marca-Italic.ttf). Sem ele, usa a normal."""
    pasta, nome = os.path.split(arq); raiz, ext = os.path.splitext(nome)
    for c in sorted(os.listdir(pasta)):
        cl_ = c.lower()
        if c != nome and ('italic' in cl_) and cl_.startswith(re.split(r'[-_\[ ]', raiz.lower())[0]):
            return os.path.join(pasta, c)
    return arq


def _carregar(arq, size, peso, otico='texto'):
    from PIL import ImageFont
    f = ImageFont.truetype(arq, size)
    try:
        eixos = f.get_variation_axes()
    except Exception:
        return f                                    # fonte estática: o peso vem do próprio arquivo
    vals = []
    for e in eixos:
        nome = e['name'].decode() if isinstance(e['name'], bytes) else str(e['name'])
        if 'eight' in nome: vals.append(max(e['minimum'], min(e['maximum'], peso)))
        elif 'ptical' in nome: vals.append(e['minimum'] if otico == 'texto' else e['maximum'])
        else: vals.append(e['default'])
    f.set_variation_by_axes(vals)
    return f


SISTEMA = [  # (arquivo normal, arquivo negrito); fontes variáveis usam o mesmo arquivo pros dois
    ('/System/Library/Fonts/SFNS.ttf', '/System/Library/Fonts/SFNS.ttf'),                      # Mac (San Francisco)
    ('/System/Library/Fonts/Helvetica.ttc', '/System/Library/Fonts/Helvetica.ttc'),
    (os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'segoeui.ttf'),
     os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'seguisb.ttf')),         # Windows (Segoe UI)
    (os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'arial.ttf'),
     os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'arialbd.ttf')),
    ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
]


@lru_cache(None)
def fonte_sistema(size, wght=600):
    """A fonte padrão do computador da pessoa (Mac: San Francisco; Windows: Segoe UI). Só quando ela não tem fonte no estilo."""
    for normal, negrito in SISTEMA:
        arq = negrito if wght >= 600 else normal
        if os.path.exists(arq):
            return _carregar(arq, size, wght)
    from PIL import ImageFont
    return ImageFont.load_default(size=size)


@lru_cache(None)
def fonte_legenda(size, wght=None):
    """A fonte de texto da pessoa: legenda.fonte_arquivo; senão a fonte instalada com o nome legenda.fonte;
    senão a fonte padrão do computador.
    Fonte variável (ex.: SF Pro no Mac, /System/Library/Fonts/SFNS.ttf): usa legenda.fonte_peso e
    legenda.fonte_otico ("texto" = corte de corpo de texto, "display" = corte de título)."""
    L = estilo()['legenda']
    peso = wght or int(L.get('fonte_peso') or 600)
    arq = os.path.expanduser(L.get('fonte_arquivo') or '') or achar_fonte(L.get('fonte') or '')
    if arq and os.path.exists(arq):
        return _carregar(arq, size, peso, L.get('fonte_otico', 'texto'))
    return fonte_sistema(size, peso)


def sans(size, wght=600, *_):
    """Texto de letterings, etiquetas e animações: a mesma fonte da legenda da pessoa."""
    return fonte_legenda(size, wght)


@lru_cache(None)
def titulo(size, wght=700, italico=False):
    """A fonte de títulos da marca (marca.fonte_titulos_arquivo, ou instalada com o nome marca.fonte_titulos).
    Sem ela: a fonte de texto da pessoa, mais pesada. Itálico só se a marca tiver o arquivo itálico."""
    M = estilo()['marca']
    arq = os.path.expanduser(M.get('fonte_titulos_arquivo') or '')
    if arq and os.path.exists(arq):
        if italico: arq = _irma_italica(arq)
    else:
        arq = achar_fonte(M.get('fonte_titulos') or '', italico)
    if arq and os.path.exists(arq):
        return _carregar(arq, size, wght, 'display')
    return fonte_legenda(size, max(wght, 700))


# ── curvas ──
def cl(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = cl(x); return 1 - (1 - x) ** 3
def lerp(a, b, p): return a + (b - a) * p
def p_in(t, t0, d=0.35): return ease((t - t0) / d) if t >= t0 else 0.0
def sai(t, t1, d=0.35): return 1 - ease((t - t1) / d) if t >= t1 else 1.0
def rgba(c, a): return (c[0], c[1], c[2], int(255 * cl(a)))


def back(x):
    x = cl(x); c1 = 1.9; c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def pop(t, t0, d=0.45): return back((t - t0) / d) if t >= t0 else 0.0
