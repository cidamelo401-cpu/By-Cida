"""Etapa 4: monta os blocos de legenda no tempo do vídeo final, com o glossário do estilo.

cortes/legenda.json (opcional):
  {"esperar": [[ini, fim]],        tempo FINAL: legenda espera (ex.: enquanto o headline está na tela)
   "esconder": [[ini, fim]],       tempo FINAL: sem legenda (ex.: lettering que já diz a frase)
   "correcoes": [["E,", 119.52, 119.62]],   palavras que a transcrição perdeu (tempo BRUTO)
   "apagar": [["o", 118.78]]}      palavras que a transcrição inventou (texto, início BRUTO)
Saída: legendas/blocos.json  [{ini, fim, texto, palavras:[[txt, ini, fim]]}]
Vídeo sem fala: sai uma lista vazia (sem legenda); os textos na tela entram pelo mapa de recursos.
"""
import json, os, re
from comum import estilo
from tempo import PALAVRAS, t

E = estilo(); L = E['legenda']
MAX = int(L.get('palavras_por_vez', 4))
CFG = json.load(open('cortes/legenda.json')) if os.path.exists('cortes/legenda.json') else {}
GLOS = {g['errado'].lower(): g['certo'] for g in E.get('glossario', []) if g.get('errado')}
for g in E.get('glossario', []):
    if g.get('certo'): GLOS.setdefault(g['certo'].lower(), g['certo'])
GLOS.setdefault('ia', 'IA')
FUNCAO = {'a', 'o', 'as', 'os', 'de', 'da', 'do', 'e', 'que', 'em', 'no', 'na', 'um', 'uma', 'pra', 'para', 'se', 'com', 'por'}

pal = [w for w in PALAVRAS if not any(w[0] == a and abs(w[1] - s) < 0.02 for a, s in CFG.get('apagar', []))]
pal = sorted(pal + [tuple(c) for c in CFG.get('correcoes', [])], key=lambda w: w[1])


def limpa(w):
    base = re.sub(r'[.,!?…;:"]+', '', w.strip())
    chave = base.lower()
    if chave in GLOS: return GLOS[chave]
    return chave if L.get('minusculas', True) else base


blocos, atual, ant = [], [], None
for w, s, e in pal:
    norm = re.sub(r'[^\w]', '', w.lower())
    if ant and norm == ant[0] and s - ant[1] < 0.6: continue        # a transcrição repetiu a palavra
    ant = (norm, e)
    fs, fe = t(s), t(e)
    if any(a <= fs < b for a, b in CFG.get('esconder', [])): continue
    if atual and (len(atual) >= MAX or fs - atual[-1][2] > 0.35):
        if len(atual) >= MAX and atual[-1][0] in FUNCAO and len(atual) > 2:
            sobra = atual.pop(); blocos.append(atual); atual = [sobra]
        else:
            blocos.append(atual); atual = []
    atual.append((limpa(w), fs, fe))
    if re.search(r'[.!?…]$', w.strip()): blocos.append(atual); atual = []
if atual: blocos.append(atual)

saida = []
for k, b in enumerate(blocos):
    ini, fim = b[0][1], b[-1][2] + 0.25
    for a, z in CFG.get('esperar', []):
        if a <= ini < z: ini = z
    if k + 1 < len(blocos): fim = min(fim, blocos[k + 1][0][1])
    if fim - ini < 0.12: continue
    texto = ' '.join(p for p, _, _ in b if p).replace(' -', '-')
    for g in E.get('glossario', []):                       # glossário também na frase inteira ("click -up" -> "ClickUp")
        if g.get('errado'):
            padrao = r'(?<!\w)' + r'[\s-]*'.join(map(re.escape, re.split(r'[\s-]+', g['errado']))) + r'(?!\w)'
            texto = re.sub(padrao, g['certo'], texto, flags=re.I)
    toks = texto.split()
    if len(toks) == len(b): pals = [[tk, a, z] for tk, (_, a, z) in zip(toks, b)]
    else:                                                   # o glossário juntou palavras: redistribui o tempo
        a0, z0 = b[0][1], b[-1][2]; passo = (z0 - a0) / len(toks)
        pals = [[tk, a0 + i * passo, a0 + (i + 1) * passo] for i, tk in enumerate(toks)]
    saida.append({'ini': round(ini, 3), 'fim': round(fim, 3), 'texto': texto,
                  'palavras': [[p, round(a, 3), round(z, 3)] for p, a, z in pals]})
json.dump(saida, open('legendas/blocos.json', 'w'), ensure_ascii=False, indent=1)
print(f'{len(saida)} blocos de legenda -> legendas/blocos.json' if saida else
      'sem fala no trecho mantido: sem legenda (os textos na tela entram pelo mapa de recursos)')
