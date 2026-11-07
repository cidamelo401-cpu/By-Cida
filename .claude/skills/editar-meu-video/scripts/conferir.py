"""Etapa final obrigatória: confere o vídeo PRONTO (não o projeto).
  python conferir.py output/video-01-v1.mp4
Gera frames/conferencia.jpg (um quadro a cada 5s) e mede duração, volume e pico."""
import re, subprocess, sys
import comum  # noqa: F401  (garante o ffmpeg)

arq = sys.argv[1]
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq],
                           capture_output=True, text=True).stdout)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', arq, '-vf', 'fps=1/5,scale=180:-1,tile=9x4:padding=4:color=0x111111',
                '-frames:v', '1', 'frames/conferencia.jpg'])
r = subprocess.run(['ffmpeg', '-v', 'info', '-i', arq, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
resumo = r[r.rfind('Summary'):]
i = re.search(r'I:\s+(-?[\d.]+) LUFS', resumo); p = re.search(r'Peak:\s+(-?[\d.]+) dBFS', resumo)
lufs, pico = float(i.group(1)), float(p.group(1))
print(f'duração {int(dur // 60)}:{dur % 60:04.1f} | volume {lufs} LUFS (alvo -14) | pico {pico} dB (precisa ficar abaixo de -1,5)')
if abs(lufs + 14) > 1.5: print('  ATENÇÃO: volume fora do padrão')
if pico > -1.5: print('  ATENÇÃO: pico alto, pode distorcer no Instagram')
print('olhe frames/conferencia.jpg: legenda cobrindo boca? animação na hora certa? texto saindo da tela?')
