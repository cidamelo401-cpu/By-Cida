"""Etapa 4: corta (ou monta, na ordem aprovada), emenda sem estalo, acelera, põe a imagem no formato, limpa o som
e põe o volume no padrão. Serve pros dois jeitos de cortar (vídeo com fala ou montagem sem fala).
Saída: cortes/cortado.mp4 (no formato do estilo, 30 quadros fixos)."""
import json, subprocess
from comum import estilo, medidas, enquadrar

E = estilo(); W, H = medidas()
c = json.load(open('cortes/cortes.json')); V = c['velocidade']; segs = c['manter']
proj = json.load(open('projeto.json')); bruto = proj['bruto']
montagem = c.get('modo') == 'montagem'
tipo = proj.get('tipo', 'fala')
fade = 0.03 if montagem else 0.012          # na montagem o som ambiente muda de cena: emenda um pouco mais suave
# cada trecho vira uma entrada própria, lida direto do ponto certo do arquivo: funciona em qualquer ordem e com
# trechos longos ou distantes (cortar tudo de uma entrada só perde trechos quando a fila do ffmpeg enche)
por_trecho = len(segs) <= 200
em_ordem = not por_trecho
entradas = [x for a, b in segs for x in ('-ss', f'{a:.3f}', '-t', f'{b - a:.3f}', '-i', bruto)] if por_trecho else ['-i', bruto]
f, cat = [], ''
for i, (a, b) in enumerate(segs):
    d = b - a
    src, tv = (0, f'trim={a}:{b},') if em_ordem else (i, '')
    ta = f'atrim={a}:{b},' if em_ordem else ''
    f.append(f"[{src}:v]{tv}setpts=PTS-STARTPTS,fps=30[v{i}]")
    f.append(f"[{src}:a]{ta}asetpts=PTS-STARTPTS,afade=t=in:d={fade},afade=t=out:st={max(0, d - fade):.3f}:d={fade}[a{i}]")
    cat += f"[v{i}][a{i}]"
f.append(f"{cat}concat=n={len(segs)}:v=1:a=1[vc][ac]")
# cor: "leve" = um pouco mais de contraste e de cor, sem filtro (o estilo da pessoa decide); "nenhum" = como gravou
cor = {'leve': ',eq=contrast=1.05:saturation=1.07:gamma=0.98'}.get(str(E.get('cor', {}).get('ajuste', 'leve')).lower(), '')
f.append(f"[vc]setpts=PTS/{V},fps=30," + enquadrar(W, H, proj.get('enquadramento', 'cortar'), '[ve]'))
f.append(f"[ve]null{cor}[vo]")
# som: redução de ruído só onde tem fala (em vídeo sem fala, o som ambiente É o conteúdo)
ruido = 'afftdn=nr=10:nf=-50,highpass=f=70,' if E['som'].get('reduzir_ruido', True) and tipo != 'sem_fala' else ''
lufs = E['som'].get('volume_alvo_lufs', -14)
audio = c.get('audio', 'original')
depois = {'baixo': ',volume=0.3', 'sem_som': ',volume=0'}.get(audio, '')
f.append(f"[ac]atempo={V},{ruido}loudnorm=I={lufs}:TP=-1.5:LRA=11{depois},aresample=48000[ao]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *entradas, '-filter_complex', ';'.join(f), '-map', '[vo]', '-map', '[ao]',
                '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k',
                'cortes/cortado.mp4'], check=True)
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'cortes/cortado.mp4'],
                           capture_output=True, text=True).stdout)
print(f'cortes/cortado.mp4 pronto: {int(dur // 60)}:{dur % 60:04.1f}' + (f' · som original: {audio}' if audio != 'original' else ''))
