"""Etapa 1: junta o material, tira as fotos pro Claude olhar, acha as cenas e transcreve a fala (se houver).

Funciona com qualquer tipo de vídeo: alguém falando pra câmera, narração por cima de imagens, ou vídeo
sem fala nenhuma (paisagem, viagem, produto, receita, bastidor, evento), num arquivo só ou em vários clipes.

  python preparar.py "/caminho/do/video.mov"                 (um vídeo)
  python preparar.py "/clipe1.mov" "/clipe2.mp4" "/clipe3.mov"  (vários clipes, nesta ordem)
  python preparar.py "/pasta/com/os/clipes"                   (todos os vídeos da pasta, em ordem de nome)
  --enquadrar cortar | desfoque   como um vídeo deitado vira em pé (ou o contrário):
                                  cortar = preenche a tela cortando as laterais; desfoque = vídeo inteiro com fundo desfocado
                                  (padrão: cortar quando a orientação bate com o formato do estilo; desfoque quando não bate)

Saídas: bruto.<ext> (o vídeo, ou os clipes já juntos), audio.wav, frames/folha.jpg (fotos com o tempo),
        frames/cenas.jpg (uma foto por cena), frames/grade.jpg (régua de 160px), cortes/cenas.json,
        legendas/palavras.json, legendas/transcricao.txt e projeto.json (com o TIPO do vídeo).
"""
import json, os, platform, re, shutil, subprocess, sys, warnings
warnings.filterwarnings("ignore")   # o Python que vem no Mac avisa sobre SSL antigo; não afeta nada
import comum                          # garante o ffmpeg
from comum import medidas, enquadrar

for p in ('frames', 'legendas', 'cortes', 'output', 'materiais'): os.makedirs(p, exist_ok=True)
VIDEO = ('.mp4', '.mov', '.m4v', '.mkv', '.webm', '.avi', '.mts', '.3gp', '.ogv')


def sh(*a): return subprocess.run(a, capture_output=True, text=True)


def info_de(arq):
    d = json.loads(sh('ffprobe', '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', arq).stdout)
    v = next(s for s in d['streams'] if s['codec_type'] == 'video')
    w, h = int(v['width']), int(v['height'])
    rot = int((v.get('tags') or {}).get('rotate', 0) or 0)
    for sd in v.get('side_data_list', []) or []:
        if 'rotation' in sd: rot = int(sd['rotation'])
    if abs(rot) in (90, 270): w, h = h, w
    def fps_de(x):
        n, dd = x.split('/'); return float(n) / float(dd) if float(dd) else 0
    fr = v.get('r_frame_rate', '30/1'); av = v.get('avg_frame_rate', fr)
    return {'w': w, 'h': h, 'dur': float(d['format']['duration']), 'fps': fps_de(av),
            'variavel': abs(fps_de(fr) - fps_de(av)) > 0.5, 'audio': any(s['codec_type'] == 'audio' for s in d['streams'])}


# ── 1. o material: um arquivo, vários, ou uma pasta ──
args = sys.argv[1:]
forcar = None
if '--enquadrar' in args:
    i = args.index('--enquadrar'); forcar = args[i + 1]; del args[i:i + 2]
fontes = []
for a in args:
    a = os.path.expanduser(a)
    if os.path.isdir(a):
        fontes += sorted(os.path.join(a, f) for f in os.listdir(a) if f.lower().endswith(VIDEO) and not f.startswith('.'))
    else:
        fontes.append(a)
if not fontes: sys.exit('nenhum vídeo encontrado. Passe o arquivo, vários arquivos ou a pasta.')
W, H = medidas()


def modo_para(i):
    if forcar: return forcar
    deitado, alvo_deitado = i['w'] > i['h'], W > H
    return 'cortar' if deitado == alvo_deitado or abs(i['w'] / i['h'] - W / H) < 0.15 else 'desfoque'


infos = [info_de(f) for f in fontes]
clipes = []
if len(fontes) == 1:
    ext = os.path.splitext(fontes[0])[1].lower() or '.mp4'
    bruto = 'bruto' + ext
    if not os.path.exists(bruto): shutil.copy2(fontes[0], bruto)          # nunca mexe no original
    i = infos[0]
    enquadramento = modo_para(i)
    clipes.append({'arquivo': os.path.basename(fontes[0]), 'ini': 0.0, 'fim': i['dur'], 'enquadramento': enquadramento})
    print(f'vídeo: {i["w"]}x{i["h"]}, {i["dur"]:.1f}s, {i["fps"]:.2f} fps'
          f'{" (taxa VARIÁVEL: vira 30 fixos no corte)" if i["variavel"] else ""}')
else:
    # vários clipes: cada um vai pro formato do estilo (30 quadros, som em 48 kHz; sem som ganha silêncio) e eles são juntados
    os.makedirs('clipes', exist_ok=True)
    lista, ini = [], 0.0
    for k, (f, i) in enumerate(zip(fontes, infos)):
        modo = modo_para(i); saida = f'clipes/{k + 1:02d}.mp4'
        ent = ['-i', f] if i['audio'] else ['-i', f, '-f', 'lavfi', '-t', f'{i["dur"]:.3f}', '-i', 'anullsrc=r=48000:cl=stereo']
        fc = f'[0:v]fps=30,' + enquadrar(W, H, modo, '[vv]')
        aud = '0:a' if i['audio'] else '1:a'
        if not os.path.exists(saida):
            r = subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', fc, '-map', '[vv]', '-map', aud,
                                '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p',
                                '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-shortest', saida])
            if r.returncode: sys.exit(f'não consegui preparar o clipe {f}')
        d = info_de(saida)['dur']
        clipes.append({'arquivo': os.path.basename(f), 'ini': round(ini, 3), 'fim': round(ini + d, 3), 'enquadramento': modo})
        print(f'clipe {k + 1}: {os.path.basename(f)} ({i["w"]}x{i["h"]}, {d:.1f}s, {"com som" if i["audio"] else "SEM som"}, {modo})')
        lista.append(f"file '{os.path.abspath(saida)}'"); ini += d
    open('clipes/lista.txt', 'w').write('\n'.join(lista) + '\n')
    bruto = 'bruto.mp4'
    sh('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'clipes/lista.txt', '-c', 'copy', bruto)
    enquadramento = 'pronto'                          # os clipes já estão no formato
info = info_de(bruto); dur = info['dur']; w, h = info['w'], info['h']

sh('ffmpeg', '-v', 'error', '-y', '-i', bruto, '-vn', '-ac', '1', '-ar', '16000', 'audio.wav')

# ── 2. as fotos: uma folha com o tempo em cada foto (mais fotos em vídeo curto) ──
from PIL import Image, ImageDraw
F = comum.fonte_sistema(15, 600)


def folha(tempos, saida, rotulo, cols=6, largura=200):
    ims = []
    for k, t in enumerate(tempos):
        p = f'frames/_f{k:03d}.jpg'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', bruto, '-frames:v', '1',
                        '-vf', f'scale={largura}:-2', p])
        if os.path.exists(p):
            im = Image.open(p).convert('RGB'); os.remove(p)
            d = ImageDraw.Draw(im); txt = rotulo(k, t)
            d.rectangle((0, im.height - 24, im.width, im.height), fill=(10, 10, 10))
            d.text((6, im.height - 21), txt, font=F, fill=(255, 255, 255)); ims.append(im)
    if not ims: return
    tw, th = ims[0].size; rows = (len(ims) + cols - 1) // cols
    m = Image.new('RGB', (cols * (tw + 6), rows * (th + 6)), (10, 10, 10))
    for k, im in enumerate(ims): m.paste(im, ((k % cols) * (tw + 6), (k // cols) * (th + 6)))
    m.save(saida, quality=85)


def mmss(t): return f'{int(t // 60)}:{t % 60:04.1f}'


n = int(max(12, min(36, dur / 2.5)))
folha([dur * (k + 0.5) / n for k in range(n)], 'frames/folha.jpg', lambda k, t: mmss(t))

# ── 3. as cenas: onde a imagem muda de verdade (troca de plano, de clipe, de lugar) ──
r = sh('ffmpeg', '-i', bruto, '-vf', "scale=320:-2,select='gt(scene,0.32)',showinfo", '-an', '-f', 'null', '-')
cortes_img = [float(m) for m in re.findall(r'pts_time:([\d.]+)', r.stderr)]
cortes_img = sorted(set([round(c['ini'], 2) for c in clipes[1:]] + [round(c, 2) for c in cortes_img]))
bordas, ult = [0.0], 0.0
for c in cortes_img:
    if c - ult >= 0.6 and dur - c >= 0.6: bordas.append(c); ult = c
bordas.append(dur)
cenas = []
for k in range(len(bordas) - 1):
    a, b = bordas[k], bordas[k + 1]
    meio = (a + b) / 2
    clipe = next((j + 1 for j, c in enumerate(clipes) if c['ini'] <= meio < c['fim']), 1)
    cenas.append({'n': k + 1, 'ini': round(a, 2), 'fim': round(b, 2), 'clipe': clipe})
json.dump(cenas, open('cortes/cenas.json', 'w'), indent=1)
folha([c['ini'] + min(0.5, (c['fim'] - c['ini']) / 2) for c in cenas[:48]], 'frames/cenas.jpg',
      lambda k, t: f'cena {cenas[k]["n"]} · {mmss(cenas[k]["ini"])} · {cenas[k]["fim"] - cenas[k]["ini"]:.1f}s')

# ── 4. a grade: 4 quadros com régua a cada 160px (onde está a pessoa ou o assunto, onde tem espaço livre) ──
quadros = []
for k in range(4):
    p = f'frames/q{k}.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{dur * (k + 1) / 5:.2f}', '-i', bruto, '-frames:v', '1', p])
    im = Image.open(p).convert('RGB'); d = ImageDraw.Draw(im)
    for y in range(0, im.height, 160):
        d.line((0, y, im.width, y), fill=(255, 0, 0), width=3); d.text((8, y + 4), str(y), fill=(255, 0, 0))
    quadros.append(im.resize((im.width // 3, im.height // 3)))
g = Image.new('RGB', (sum(q.width for q in quadros), quadros[0].height))
x = 0
for q in quadros: g.paste(q, (x, 0)); x += q.width
g.save('frames/grade.jpg', quality=85)

# ── 5. a fala (se houver), com o tempo de cada palavra ──
# O Whisper às vezes "ouve" frases em música, vento ou barulho de rua. Segmentos sem cara de fala são descartados.
INVENTADAS = re.compile(r'amara\.org|legendas? (pela|por)|obrigad[oa] por assistir|inscreva-se|deixe seu like|'
                        r'tradução|subtitles|thanks for watching', re.I)


def segmento_ok(texto, no_speech, logprob, compressao, ini=0.0, fim=0.0, n_palavras=1):
    if INVENTADAS.search(texto or ''): return False
    if fim - ini > 5 and n_palavras / (fim - ini) < 0.5: return False       # 2 palavras "esticadas" em 30s: inventado
    if compressao is not None and compressao > 2.4: return False             # repetição em loop
    if no_speech is not None and logprob is not None and no_speech > 0.5 and logprob < -0.6: return False
    if logprob is not None and logprob < -1.15: return False
    return True


palavras = []
mac_m = platform.system() == 'Darwin' and platform.machine() == 'arm64'
try:
    if mac_m:
        import mlx_whisper
        res = mlx_whisper.transcribe('audio.wav', path_or_hf_repo='mlx-community/whisper-large-v3-turbo',
                                     language='pt', word_timestamps=True, condition_on_previous_text=False)
        for s in res['segments']:
            if not segmento_ok(s.get('text'), s.get('no_speech_prob'), s.get('avg_logprob'), s.get('compression_ratio'),
                               s.get('start', 0), s.get('end', 0), len(s.get('words', []))): continue
            for wd in s.get('words', []): palavras.append([wd['word'].strip(), round(wd['start'], 3), round(wd['end'], 3)])
    else:
        from faster_whisper import WhisperModel
        nome = os.environ.get('EDITAR_VIDEO_MODELO', 'large-v3-turbo')   # computador fraco: EDITAR_VIDEO_MODELO=small
        print(f'transcrevendo no processador com o modelo {nome} (pode levar de 1 a 3 min por minuto de vídeo)...', flush=True)
        modelo = WhisperModel(nome, device='cpu', compute_type='int8')
        segs, _ = modelo.transcribe('audio.wav', language='pt', word_timestamps=True, vad_filter=True,
                                    condition_on_previous_text=False)
        for s in segs:
            if not segmento_ok(s.text, s.no_speech_prob, s.avg_logprob, s.compression_ratio, s.start, s.end, len(s.words or [])): continue
            for wd in (s.words or []): palavras.append([wd.word.strip(), round(wd.start, 3), round(wd.end, 3)])
except ImportError as e:
    sys.exit(f'falta a biblioteca de transcrição ({e}). Rode a instalação da skill de novo.')

# palavra "ouvida" onde quase não tem som (trecho mudo, silêncio) é invenção da transcrição: sai
import wave
import numpy as np
_wf = wave.open('audio.wav'); _x = np.frombuffer(_wf.readframes(_wf.getnframes()), np.int16).astype(np.float32) / 32768
_hop = _wf.getframerate() // 100
_db = 20 * np.log10(np.sqrt(np.convolve(_x ** 2, np.ones(_hop) / _hop, 'same'))[::_hop] + 1e-9)
_piso = min(-38, max(-50, np.percentile(_db, 10) + 6))   # nunca alto demais: fala em lugar barulhento fica
palavras = [p for p in palavras if _db[int(p[1] * 100):max(int(p[1] * 100) + 1, int(p[2] * 100))].max(initial=-200) > _piso]

limpas = []
for p in palavras:            # limpa o lixo do silêncio do fim ("!!!!", palavra vazia, palavra de duração zero)
    t = p[0].strip()
    if not t or set(t) <= set('!?.…,') or p[2] - p[1] < 0.02: continue
    limpas.append([t, p[1], p[2]])
json.dump(limpas, open('legendas/palavras.json', 'w'), ensure_ascii=False)

with open('legendas/transcricao.txt', 'w', encoding='utf-8') as f:
    if not limpas: f.write('(sem fala: nenhuma voz detectada no vídeo)\n')
    linha, ini = [], None
    for t, s, e in limpas:
        if ini is None: ini = s
        linha.append(t)
        if t[-1] in '.?!' or len(linha) >= 14:
            f.write(f'{ini:7.2f}-{e:7.2f}  {" ".join(linha)}\n'); linha, ini = [], None
    if linha: f.write(f'{ini:7.2f}-{limpas[-1][2]:7.2f}  {" ".join(linha)}\n')


# ── 6. que tipo de vídeo é (por clipe e no total): muda o jeito de cortar ──
def fala_em(a, b):
    tot, ult = 0.0, None
    for _, s, e in limpas:
        if e <= a or s >= b: continue
        s, e = max(s, a), min(e, b)
        if ult and s - ult[1] < 0.5: ult[1] = max(ult[1], e)
        else:
            if ult: tot += ult[1] - ult[0]
            ult = [s, e]
    return tot + (ult[1] - ult[0] if ult else 0)


for c in clipes:
    c['fala'] = round(fala_em(c['ini'], c['fim']) / max(0.1, c['fim'] - c['ini']), 2)
proporcao = fala_em(0, dur) / max(0.1, dur)
tipo = 'fala' if proporcao >= 0.35 else 'sem_fala' if proporcao < 0.08 or len(limpas) < 8 else 'misto'
if tipo == 'fala' and any(c['fala'] < 0.08 and c['fim'] - c['ini'] > 2 for c in clipes):
    tipo = 'misto'                    # tem clipe sem fala (paisagem, produto): no corte por fala ele sumiria

json.dump({'bruto': bruto, 'largura': w, 'altura': h, 'duracao': dur, 'fps_variavel': info['variavel'],
           'enquadramento': enquadramento, 'clipes': clipes, 'cenas': len(cenas),
           'fala_proporcao': round(proporcao, 2), 'tipo': tipo}, open('projeto.json', 'w'), indent=1, ensure_ascii=False)

EXPLICA = {'fala': 'tem fala o tempo quase todo: corte guiado pela transcrição (o que sai: erros, repetições, pausas)',
           'misto': 'parte com fala, parte sem: falas pela transcrição, o resto pelas cenas',
           'sem_fala': 'quase sem fala: montagem guiada pelas CENAS (o que fica, em que ordem), não pela transcrição'}
print(f'duração total: {mmss(dur)} · {len(clipes)} clipe(s) · {len(cenas)} cena(s) -> frames/cenas.jpg e cortes/cenas.json')
print(f'fala: {len(limpas)} palavras ({proporcao:.0%} do tempo) -> legendas/transcricao.txt')
print(f'TIPO: {tipo}: {EXPLICA[tipo]}')
if enquadramento == 'desfoque': print('enquadramento: vídeo deitado num formato em pé (ou o contrário): vai inteiro, com fundo desfocado')
print('fotos: frames/folha.jpg (com o tempo) e frames/grade.jpg (régua de 160px)')
