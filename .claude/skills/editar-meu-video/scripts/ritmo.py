"""A batida de uma música (pra montagem cortar no ritmo e textos entrarem na batida).

  python ritmo.py materiais/musica.mp3     -> BPM, intervalo entre batidas e as primeiras batidas
  from ritmo import batidas; bpm, ts = batidas('materiais/musica.mp3')

Regra de bolso: em montagem sem fala, cortes a cada 2 ou 4 batidas ficam naturais; textos e etiquetas entram NA batida.
É uma estimativa simples (energia do som), boa pra música com batida marcada; em música lenta ou sem percussão, confira ouvindo.
"""
import subprocess, sys
import numpy as np
import comum  # noqa: F401  (garante o ffmpeg)

SR, HOP = 22050, 512


def batidas(arquivo, inicio=0.0):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', arquivo, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    if len(x) < SR * 2: return 0.0, []
    n = (len(x) - 2048) // HOP
    quadros = np.lib.stride_tricks.sliding_window_view(x, 2048)[::HOP][:n] * np.hanning(2048)
    esp = np.log1p(np.abs(np.fft.rfft(quadros, axis=1)))
    fluxo = np.maximum(0, np.diff(esp, axis=0)).sum(axis=1)            # quanto o som "ataca" em cada instante
    fluxo = (fluxo - fluxo.mean()) / (fluxo.std() + 1e-9)
    fps = SR / HOP
    melhor = (-1e9, 0, 0.0)
    for bpm in np.arange(70, 180.5, 0.5):                               # pente: soma do ataque em cada batida
        per = 60 * fps / bpm; k = np.arange(int((len(fluxo) - per) / per))
        for fase in range(int(per)):
            idx = np.round(fase + k * per).astype(int)
            v = fluxo[idx].mean() * np.exp(-0.5 * (np.log2(bpm / 115) / 1.2) ** 2)
            if v > melhor[0]: melhor = (v, fase, bpm)
    _, f0, bpm = melhor
    per = 60 * fps / bpm
    atraso = (1024 + HOP) / SR                                             # o ataque aparece meia janela depois
    ts = [round((f0 + k * per) / fps + atraso + inicio, 3) for k in range(int((len(fluxo) - f0) / per) + 1)]
    return round(float(bpm), 1), ts


if __name__ == '__main__':
    bpm, ts = batidas(sys.argv[1])
    if not ts: sys.exit('música curta demais ou sem som')
    iv = 60 / bpm
    print(f'{bpm} BPM · uma batida a cada {iv:.2f}s · cortes a cada 2 batidas = {2 * iv:.2f}s, a cada 4 = {4 * iv:.2f}s')
    print('primeiras batidas:', ', '.join(f'{t:.2f}' for t in ts[:16]))
