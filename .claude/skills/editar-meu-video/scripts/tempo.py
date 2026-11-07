"""Converte tempo do BRUTO -> tempo do vídeo FINAL (cortado e acelerado).
Regra de ouro: nunca estimar tempo no olho. Com fala, ancore numa palavra real com palavra();
sem fala, ancore no começo de uma cena com cena(n) ou numa batida da música (ritmo.batidas)."""
import json, re

C = json.load(open('cortes/cortes.json'))
V = C['velocidade']
_SEGS, _acc = [], 0.0
for a, b in C['manter']:
    _SEGS.append((a, b, _acc)); _acc += b - a
DURACAO = _acc / V
CORTES_FINAIS = [off / V for _, _, off in _SEGS[1:]]   # onde cada corte acontece no vídeo final


def t(orig):
    """Tempo no bruto -> tempo final. Se cair num trecho cortado, vai pro começo do trecho mais perto depois dele.
    Funciona também na montagem, em que os trechos podem estar em outra ordem."""
    for a, b, off in _SEGS:
        if a <= orig <= b: return (off + orig - a) / V
    depois = [(a - orig, off) for a, b, off in _SEGS if a > orig]
    return min(depois)[1] / V if depois else DURACAO


PALAVRAS = [w for w in json.load(open('legendas/palavras.json'))
            if any(w[1] < b and w[2] > a + 0.03 for a, b, _ in _SEGS)]


def _n(w): return re.sub(r'[^\wçãõáéíóúâêô-]', '', w.lower())


def palavra(texto, depois=0.0):
    """Tempo FINAL da primeira palavra que começa com `texto`, a partir do tempo BRUTO `depois`.
    Ex.: palavra('método', 30) -> segundo do vídeo final em que a pessoa fala "método"."""
    alvo = texto.lower()
    for w, s, e in PALAVRAS:
        if s >= depois and _n(w).startswith(alvo):
            return t(s)
    raise ValueError(f'palavra não encontrada: "{texto}" depois de {depois}s (confira em legendas/transcricao.txt)')


def cena(n, depois=0.0):
    """Tempo FINAL em que a cena n (de cortes/cenas.json) aparece no vídeo, mais `depois` segundos do bruto.
    Ex.: cena(3) -> quando a cena 3 entra. Dá erro se a cena não foi mantida na montagem."""
    c = next((c for c in json.load(open('cortes/cenas.json')) if c['n'] == n), None)
    if c is None: raise ValueError(f'cena {n} não existe (veja cortes/cenas.json)')
    for a, b, off in _SEGS:
        x = max(a, c['ini'] + depois)
        if x < b and x < c['fim']: return (off + x - a) / V
    raise ValueError(f'a cena {n} não está na montagem aprovada')
