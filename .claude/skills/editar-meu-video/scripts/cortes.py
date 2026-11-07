"""Etapa 3: a lista de cortes (aprovação 1). Dois jeitos, conforme o TIPO do vídeo (projeto.json):

  python cortes.py --sugerir [--musica materiais/musica.mp3]
      com fala: palavra-código, frases recomeçadas e pausas longas
      sempre:   as cenas (cortes/cenas.json), com duração; com --musica, a batida pra cortar no ritmo
  python cortes.py            -> lê cortes/pedido.json, gera cortes/cortes.json + a tabela pra aprovação

cortes/pedido.json, vídeo COM FALA (o que SAI):
  {"remover": [[ini, fim, "motivo"], ...], "inicio": null, "fim": null}
  (tempos do BRUTO; "fim" = onde o vídeo termina, ex.: 1s depois da despedida; pausas acima do estilo saem sozinhas)

cortes/pedido.json, MONTAGEM (vídeo sem fala, vários clipes, ou misto): o que FICA, na ordem em que vai aparecer
  {"manter": [[ini, fim, "motivo"], ...],        tempos do BRUTO, em qualquer ordem (é a ordem do vídeo final)
   "velocidade": 1.0,                            padrão: 1.0 sem fala (acelerar paisagem é escolha, não regra)
   "aparar_pausas": false,                       true = tira as pausas de fala dentro dos trechos (vídeo misto)
   "audio": "original"}                          original | baixo (o som ambiente baixinho, pra música por cima) | sem_som
"""
import json, re, sys, wave
import numpy as np
from comum import estilo

E = estilo()
VEL = float(E['velocidade'])
PRE = float(E['respiro_corte'])
POS = PRE + 0.04                      # o fim da palavra some mais fácil que o começo: um tiquinho a mais depois
PAUSA_MAX = float(E['pausa_maxima'])
CODIGO = str(E.get('palavra_codigo') or 'corta').lower()

W = json.load(open('legendas/palavras.json'))
PROJ = json.load(open('projeto.json'))
DUR = PROJ['duracao']
TIPO = PROJ.get('tipo', 'fala')

# volume em janelas de 10 ms: é o que diz onde a fala começa e termina DE VERDADE
wf = wave.open('audio.wav'); sr = wf.getframerate()
x = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
hop = sr // 100
db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, mode='same'))[::hop] + 1e-9)
_som = db[db > -120]                     # silêncio digital (trecho mudo, junção de clipes) não entra na régua
LIM = (np.percentile(_som, 10) if len(_som) else -72) + 12
def alto(t):
    i = int(t * 100); return 0 <= i < len(db) and db[i] > LIM
def norm(w): return re.sub(r'[^\wçãõáéíóúâêô]', '', w.lower())


if '--sugerir' in sys.argv:
    print('== palavra-código ==')
    for i, (w, s, e) in enumerate(W):
        if norm(w) == CODIGO:
            j = i
            while j > 0 and W[j][1] - W[j - 1][2] < 0.6 and i - j < 25: j -= 1
            print(f'  "{CODIGO}" em {s:.2f}s -> sugestão: remover {W[j][1]:.2f} a {e + 0.05:.2f} '
                  f'("{" ".join(p[0] for p in W[j:i + 1])}")')
    print('== frases recomeçadas (mesmas 2-3 primeiras palavras em menos de 12s) ==')
    ate = -1
    for i in range(len(W) - 3):
        if W[i][1] < ate: continue
        a = [norm(p[0]) for p in W[i:i + 3]]
        for k in range(i + 2, min(len(W) - 3, i + 60)):
            if W[k][1] - W[i][1] > 12: break
            if [norm(p[0]) for p in W[k:k + 3]] == a and W[i][1] > 0:
                print(f'  {W[i][1]:7.2f}s "{" ".join(p[0] for p in W[i:i + 6])}..."  ->  {W[k][1]:7.2f}s "{" ".join(p[0] for p in W[k:k + 6])}..."')
                ate = W[k][1]; break
    print('== pausas acima de 1s (saem sozinhas, só pra você saber) ==')
    for a, b in zip(W, W[1:]):
        if b[1] - a[2] > 1.0: print(f'  {a[2]:.2f}-{b[1]:.2f} ({b[1] - a[2]:.1f}s) depois de "{a[0]}"')
    print(f'== cenas (tipo do vídeo: {TIPO}; veja frames/cenas.jpg) ==')
    import os
    if os.path.exists('cortes/cenas.json'):
        for c in json.load(open('cortes/cenas.json')):
            fala = ' '.join(w[0] for w in W if c['ini'] <= w[1] < c['fim'])
            print(f'  cena {c["n"]:2d} · clipe {c["clipe"]} · {c["ini"]:7.2f}-{c["fim"]:7.2f} ({c["fim"] - c["ini"]:4.1f}s)'
                  + (f' · fala: "{fala[:60]}"' if fala else ''))
    if '--musica' in sys.argv:
        from ritmo import batidas
        bpm, ts = batidas(sys.argv[sys.argv.index('--musica') + 1])
        if ts: print(f'== música: {bpm} BPM, batida a cada {60 / bpm:.2f}s: trechos de {2 * 60 / bpm:.2f}s (2 batidas) '
                      f'ou {4 * 60 / bpm:.2f}s (4 batidas) cortam no ritmo ==')
    if TIPO != 'fala':
        print('-> vídeo sem fala ou misto: monte o pedido com "manter" (o que fica, na ordem), escolhendo os melhores '
              'momentos de cada cena. Cena longa e parada: um pedaço só. Repetida: a melhor.')
    sys.exit()

P = json.load(open('cortes/pedido.json'))
INI = P.get('inicio') or 0.0
FIM = P.get('fim') or DUR

if 'manter' not in P and not W:
    sys.exit('Este vídeo não tem fala: não dá pra cortar pela transcrição. Monte o pedido com "manter" '
             '(os trechos que ficam, na ordem). Rode "cortes.py --sugerir" pra ver as cenas.')
AUDIO = P.get('audio', 'original')
if 'manter' not in P:
    mudos = [c for c in PROJ.get('clipes', []) if c.get('fala', 1) < 0.08 and c['fim'] - c['ini'] > 2]
    if mudos:
        sys.exit('Atenção: ' + ', '.join(c['arquivo'] for c in mudos) + ' não tem fala. Cortando pela fala, sairia inteiro '
                 '(sem fala = "pausa"). Monte o pedido com "manter" e "aparar_pausas": true.'),

def mmss(t): return f'{int(t // 60)}:{t % 60:05.2f}'


if 'manter' in P:                                    # ── MONTAGEM: o que fica, na ordem ──
    VEL = float(P.get('velocidade', 1.0 if TIPO == 'sem_fala' else VEL))
    aparar = P.get('aparar_pausas', TIPO != 'sem_fala')
    def quietos(a, b):
        out, ini, t = [], None, a
        while t < b:
            q = not alto(t)
            if q and ini is None: ini = t
            if (not q or t + 0.01 >= b) and ini is not None:
                if t - ini > PAUSA_MAX + PRE + POS: out.append((ini + POS, t - PRE))
                ini = None
            t += 0.01
        return out
    manter, linhas = [], []
    for item in P['manter']:
        a, b = float(item[0]), float(item[1]); motivo = item[2] if len(item) > 2 else ''
        partes = [[a, b]]
        if aparar and any(a <= w[1] < b for w in W):           # trecho com fala: tira as pausas de dentro
            for qa, qb in quietos(a, b):
                u = partes[-1]
                if qa > u[0] and qb < u[1]: partes[-1] = [u[0], qa]; partes.append([qb, u[1]])
        manter += [[round(x, 3), round(y, 3)] for x, y in partes if y - x >= 0.2]
        fala = ' '.join(w[0] for w in W if a <= w[1] < b)
        linhas.append(f'| {mmss(a)}–{mmss(b)} ({b - a:.1f}s) | {("fala: " + chr(34) + fala[:50] + chr(34)) if fala else "imagem"} | {motivo} |')
    json.dump({'velocidade': VEL, 'manter': manter, 'removidos': [], 'audio': AUDIO, 'modo': 'montagem'},
              open('cortes/cortes.json', 'w'), indent=1, ensure_ascii=False)
    total = sum(b - a for a, b in manter)
    print('| Fica (na ordem) | O quê | Por quê |\n|---|---|---|'); print('\n'.join(linhas))
    print(f'\nsom original: {AUDIO}' + (' · pausas de fala aparadas' if aparar else ''))
    print(f'bruto {DUR:.1f}s -> montagem {total:.1f}s -> com {VEL}x: {total / VEL:.1f}s ({int(total / VEL // 60)}:{total / VEL % 60:04.1f})')
    sys.exit()


def vale(t, r=0.15):
    """O silêncio de verdade mais perto do ponto pedido (nunca um vale no meio de uma palavra)."""
    i0, i1, c = max(0, int((t - r) * 100)), int((t + r) * 100), int(t * 100)
    quietos = [i for i in range(i0, i1) if db[i] <= LIM]
    if quietos: return min(quietos, key=lambda i: abs(i - c)) / 100
    return (i0 + int(np.argmin(db[i0:i1]))) / 100
REMOVER = [(vale(a), vale(b), m) for a, b, m in P['remover']]

pal = [w for w in W if INI <= w[1] < FIM and not any(a <= w[1] and w[2] <= b for a, b, _ in REMOVER)]

def encaixar_ini(t):
    s = t
    while alto(s) and s > t - 0.3: s -= 0.01
    return s
def encaixar_fim(t):
    s = t
    while alto(s) and s < t + 0.3: s += 0.01
    return s

# 1) falas contínuas  2) respiro  3) cortes pedidos  4) silêncios reais  5) aperta nas pontas  6) limpa
runs = []
for _, a, b in pal:
    if runs and a - runs[-1][1] <= PAUSA_MAX: runs[-1][1] = max(runs[-1][1], b)
    else: runs.append([a, b])
segs = []
for a, b in runs:
    a = max(INI, encaixar_ini(a) - PRE); b = min(FIM, encaixar_fim(b) + POS)
    if segs and a <= segs[-1][1]: segs[-1][1] = b
    else: segs.append([a, b])
final = []
for a, b in segs:
    partes = [[a, b]]
    for ra, rb, _ in REMOVER:
        nova = []
        for pa, pb in partes:
            if rb <= pa or ra >= pb: nova.append([pa, pb]); continue
            if pa < ra: nova.append([pa, ra])
            if rb < pb: nova.append([rb, pb])
        partes = nova
    final += [p for p in partes if p[1] - p[0] > 0.12]

def silencios(a, b):
    out, ini, t = [], None, a
    while t < b:
        q = not alto(t)
        if q and ini is None: ini = t
        if (not q or t + 0.01 >= b) and ini is not None:
            if t - ini > PAUSA_MAX + PRE + POS: out.append((ini + POS, t - PRE))
            ini = None
        t += 0.01
    return out
ref = []
for k, (a, b) in enumerate(final):
    if k == len(final) - 1 and P.get('fim'):
        ref.append([a, FIM]); continue          # o final pedido fica inteiro
    partes = [[a, b]]
    for sa, sb in silencios(a, b):
        u = partes[-1]
        if sa > u[0] and sb < u[1]: partes[-1] = [u[0], sa]; partes.append([sb, u[1]])
    ref += [p for p in partes if p[1] - p[0] > 0.12]

def primeiro_alto(a, b):
    s = a
    while s < b and not alto(s): s += 0.01
    return s
def ultimo_alto(a, b):
    s = b
    while s > a and not alto(s): s -= 0.01
    return s
apertado = []
for k, (a, b) in enumerate(ref):
    na = max(a, primeiro_alto(a, b) - PRE)
    nb = b if (k == len(ref) - 1 and P.get('fim')) else min(b, ultimo_alto(a, b) + POS)
    if nb - na > 0.12: apertado.append([na, nb])
lim = []
for a, b in apertado:
    if lim and a - lim[-1][1] < 0.10: lim[-1][1] = b
    elif b - a >= 0.20: lim.append([a, b])
manter = [[round(a, 3), round(b, 3)] for a, b in lim]

json.dump({'velocidade': VEL, 'manter': manter, 'removidos': REMOVER, 'audio': AUDIO, 'modo': 'fala'},
          open('cortes/cortes.json', 'w'), indent=1, ensure_ascii=False)
total = sum(b - a for a, b in manter)
print('| Sai | Texto | Motivo |\n|---|---|---|')
for a, b, m in REMOVER:
    txt = ' '.join(w[0] for w in W if a <= w[1] < b)
    print(f'| {int(a // 60)}:{a % 60:05.2f}–{int(b // 60)}:{b % 60:05.2f} | "{txt[:70]}" | {m} |')
print(f'\n+ pausas acima de {PAUSA_MAX}s (respiro de {PRE}s em cada corte)')
print(f'bruto {DUR:.1f}s -> cortado {total:.1f}s -> com {VEL}x: {total / VEL:.1f}s ({int(total / VEL // 60)}:{total / VEL % 60:04.1f})')
