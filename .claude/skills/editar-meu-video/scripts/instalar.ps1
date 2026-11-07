# Instala tudo que a edição de vídeo precisa no Windows 10/11, sem senha de administrador.
# Uso (funciona no PowerShell e no Git Bash):
#   powershell -ExecutionPolicy Bypass -File "$HOME/.claude/skills/editar-meu-video/scripts/instalar.ps1"
#
# Decisões (pesquisa de 02/10/2026, ver referencias/instalacao.md):
# - O Windows NÃO vem com Python: "python" é um atalho da Microsoft Store. Instalamos o 3.13 só pro usuário
#   e chamamos sempre pelo caminho completo (não depende do PATH nem de reabrir o terminal).
# - InstallLauncherAllUsers=0 evita o pedido de administrador do lançador "py".
# - A transcrição (faster-whisper/ctranslate2) precisa do MSVCP140.dll, que pode faltar num Windows limpo.
$ErrorActionPreference = "Continue"   # conferimos cada passo com $LASTEXITCODE (o 5.1 trata aviso como erro)
$env:PYTHONUTF8 = "1"
$dir = if ($env:EDITAR_VIDEO_DIR) { $env:EDITAR_VIDEO_DIR } else { Join-Path $HOME "editar-video" }

Write-Host "== 1/5 Python 3.13 (so pro seu usuario, sem administrador)"
$py = Join-Path $env:LOCALAPPDATA "Programs\Python\Python313\python.exe"
if (-not (Test-Path $py)) {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host ">> Este Windows nao tem o winget. Instale o Python pelo site python.org (Downloads > Windows >"
    Write-Host ">> 'Python install manager'), rode 'py install 3.13' e depois rode este instalador de novo."
    exit 2
  }
  winget install -e --id Python.Python.3.13 --scope user --custom "InstallLauncherAllUsers=0" --silent `
    --accept-package-agreements --accept-source-agreements --disable-interactivity
}
if (-not (Test-Path $py)) {
  # instalado por outro caminho (ex.: Python install manager): tenta o lançador
  try { $py = (& py -3.13 -c "import sys; print(sys.executable)").Trim() } catch {}
}
if (-not (Test-Path $py)) { Write-Host ">> Nao achei o Python 3.13 depois da instalacao. Feche e abra o terminal e rode de novo."; exit 2 }
& $py --version

Write-Host "== 2/5 Pasta de Python da edicao em $dir\.venv (nao mexe no resto do computador)"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$vpy = Join-Path $dir ".venv\Scripts\python.exe"
if (-not (Test-Path $vpy)) { & $py -m venv (Join-Path $dir ".venv") }
if (-not (Test-Path $vpy)) { Write-Host ">> Nao consegui criar a pasta de Python em $dir. Mande esta mensagem no plantao."; exit 1 }
& $vpy -m pip install -q --upgrade pip

Write-Host "== 3/5 Bibliotecas e o ffmpeg empacotado (sem Homebrew/choco, sem administrador)"
& $vpy -m pip install -q numpy pillow pyyaml static-ffmpeg
if ($LASTEXITCODE -ne 0) { Write-Host ">> Falhou a instalacao das bibliotecas (internet? antivirus?). Rode de novo."; exit 1 }
& $vpy -c "import static_ffmpeg, subprocess; static_ffmpeg.add_paths(); print(subprocess.run(['ffmpeg','-version'],capture_output=True,text=True).stdout.splitlines()[0])"

Write-Host "== 4/5 Transcricao (faster-whisper, roda no processador)"
& $vpy -m pip install -q "faster-whisper>=1.1"
if ($LASTEXITCODE -ne 0) { Write-Host ">> Falhou a instalacao da transcricao. Rode de novo."; exit 1 }

Write-Host "== 5/5 Conferindo a transcricao"
& $vpy -c "import ctranslate2, faster_whisper" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Falta um arquivo do Windows (MSVCP140.dll). Tentando resolver sem administrador..."
  & $vpy -m pip install -q msvc-runtime
  $tmp = Join-Path $env:TEMP "copiar_msvcp.py"
  Set-Content -Path $tmp -Encoding UTF8 -Value @'
import glob, os, shutil, sys, importlib.util
dest = os.path.dirname(importlib.util.find_spec('ctranslate2').origin)
achou = glob.glob(os.path.join(sys.prefix, '**', 'msvcp140*.dll'), recursive=True)
for p in achou: shutil.copy2(p, dest)
print('copiado:', len(achou), 'arquivo(s)')
'@
  & $vpy $tmp
  & $vpy -c "import ctranslate2, faster_whisper" 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host ">> Ainda falta o MSVCP140.dll. Instale o 'Microsoft Visual C++ Redistributable' (x64):"
    Write-Host ">> https://aka.ms/vs/17/release/vc_redist.x64.exe  (pede a senha do computador uma vez)"
    Write-Host ">> Depois rode este instalador de novo."
    exit 3
  }
}
& $vpy -c "import numpy, PIL, yaml, faster_whisper; print('ok: bibliotecas')"
Write-Host "PRONTO. Tudo instalado em $dir\.venv"
Write-Host "Na primeira transcricao o modelo (~1,6 GB) e baixado uma vez so. No Windows a transcricao usa o processador:"
Write-Host "conte de 1 a 3 minutos por minuto de video."
