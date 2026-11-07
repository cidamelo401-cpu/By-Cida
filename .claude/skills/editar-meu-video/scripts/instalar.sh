#!/bin/bash
# Instala tudo que a edição de vídeo precisa, sem Homebrew e sem senha.
# Uso: bash ~/.claude/skills/editar-meu-video/scripts/instalar.sh
set -e
DIR="${EDITAR_VIDEO_DIR:-$HOME/editar-video}"
echo "== 1/4 Python"
if ! python3 -c 'import sys' >/dev/null 2>&1; then
  echo "O Mac precisa das ferramentas de desenvolvedor (vem o Python junto)."
  xcode-select --install >/dev/null 2>&1 || true
  echo ">> Vai abrir uma janela: clique em INSTALAR, espere terminar e rode este instalador de novo."
  exit 2
fi
python3 --version
echo "== 2/4 Pasta de Python da edição em $DIR/.venv (não mexe no resto do computador)"
mkdir -p "$DIR"
[ -x "$DIR/.venv/bin/python" ] || python3 -m venv "$DIR/.venv"
PY="$DIR/.venv/bin/python"
"$PY" -m pip install -q --upgrade pip
echo "== 3/4 Bibliotecas (imagem, estilo e o ffmpeg empacotado)"
"$PY" -m pip install -q numpy pillow pyyaml static-ffmpeg
echo "== 4/4 Transcrição"
if [ "$(uname -m)" = "arm64" ]; then
  "$PY" -m pip install -q mlx-whisper; MOTOR=mlx_whisper
else
  "$PY" -m pip install -q faster-whisper; MOTOR=faster_whisper
fi
"$PY" - <<PYEOF
import shutil, subprocess, static_ffmpeg
if not (shutil.which('ffmpeg') and shutil.which('ffprobe')):
    static_ffmpeg.add_paths()
v = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True).stdout.splitlines()[0]
import numpy, PIL, yaml, $MOTOR
print('ok:', v)
PYEOF
echo "PRONTO. Tudo instalado em $DIR/.venv"
echo "Na primeira transcrição o modelo (~1,5 GB) é baixado uma vez só."
