# Instalação (uma vez só, sem Homebrew e sem senha)

Tudo fica numa pasta própria: `~/editar-video/.venv` (Windows: `$HOME/editar-video/.venv`, ou seja `C:\Users\<nome>\editar-video\.venv`). Nada do resto do computador muda. **Rode você mesmo** (o Claude Code roda comandos); a pessoa só clica quando o instalador pedir.

## Um comando

**Mac:**
```bash
bash ~/.claude/skills/editar-meu-video/scripts/instalar.sh
```

**Windows** (funciona no Git Bash e no PowerShell, que são os dois terminais que o Claude Code usa no Windows):
```
powershell -ExecutionPolicy Bypass -File "$HOME/.claude/skills/editar-meu-video/scripts/instalar.ps1"
```

| Código de saída | O que significa | O que fazer |
|---|---|---|
| 0 | PRONTO | seguir |
| 2 | precisa de um clique | Mac: janela "ferramentas de desenvolvedor" → Instalar → rodar de novo. Windows sem winget: instalar o "Python install manager" pelo python.org, `py install 3.13`, rodar de novo |
| 3 | (Windows) falta o Visual C++ do Windows | mandar o link que o instalador mostrou (`https://aka.ms/vs/17/release/vc_redist.x64.exe`); pede a senha do computador uma vez; rodar de novo |
| 1 | falhou baixar | conferir internet, antivírus; rodar de novo |

## O que o instalador faz

**Mac** (`instalar.sh`): usa o Python que já vem no Mac (se faltar, abre a janela das ferramentas de desenvolvedor) → cria a pasta de Python → instala `numpy pillow pyyaml static-ffmpeg` → transcrição `mlx-whisper` (Mac com chip M) ou `faster-whisper` (Mac Intel).

**Windows** (`instalar.ps1`):
1. **O Windows não vem com Python.** Digitar `python` num Windows novo abre a Microsoft Store (é um atalho falso, o "alias de execução"). O instalador instala o **Python 3.13 só pro usuário** com o `winget` (`--scope user --custom "InstallLauncherAllUsers=0"`, sem administrador) e chama o Python **pelo caminho completo** (`%LOCALAPPDATA%\Programs\Python\Python313\python.exe`): não depende do PATH nem de reabrir o terminal.
2. Cria a pasta de Python da edição e instala `numpy pillow pyyaml static-ffmpeg` (o `static-ffmpeg` baixa o ffmpeg.exe e o ffprobe.exe pra dentro da pasta).
3. Instala a transcrição `faster-whisper` (roda no processador).
4. Confere se a transcrição carrega. Se faltar o `MSVCP140.dll` (acontece em Windows limpo), tenta resolver sem administrador (pacote `msvc-runtime`); se não der, pede o Visual C++ Redistributable (código 3).

## Por que essas escolhas (pesquisa de 02/10/2026)

- **Python 3.13 no Windows:** as bibliotecas atuais têm versão pronta pra 3.12 em diante (numpy 2.5 e o leitor de vídeo do faster-whisper pedem 3.12+). O 3.13 é o mais testado e o winget tem instalador por usuário. O instalador clássico do python.org foi marcado como obsoleto no 3.14; o caminho novo oficial é o "Python install manager" (`py`), que usamos como plano B. Fontes: docs.python.org/3/using/windows.html, manifestos do winget-pkgs.
- **winget:** vem no Windows 11 e no Windows 10 1809+ (App Installer). Pode faltar em PC corporativo, Windows LTSC ou com a Store bloqueada.
- **static-ffmpeg:** funciona no Windows x64; os bugs antigos de caminho com espaço foram corrigidos (versões 2.1 e 2.2). Fonte: github.com/zackees/static_ffmpeg.
- **faster-whisper:** roda só com processador; aceita o modelo `large-v3-turbo` desde a 1.1.0. O `ctranslate2` (motor dele) precisa do `MSVCP140.dll`, que não vem no pacote. Fonte: github.com/SYSTRAN/faster-whisper, issue CTranslate2 #551.
- **Acento ou espaço no nome do usuário** (ex.: `C:\Users\Maria Conceição`): os bugs antigos de pip/venv/ctranslate2 com isso foram corrigidos. Os scripts da skill passam caminhos sempre como lista (nunca montando texto pro terminal) e escrevem em UTF-8.

## Números

- **Mac (testado, M5, ambiente limpo, sem Homebrew):** instalação 1min44s com o Python 3.9 do Mac; 25s de vídeo transcritos em ~11s.
- **Windows (não testado em máquina real):** transcrição no processador. Com o modelo `small`, o benchmark oficial é 13 min de áudio em 1m42s num i7-12700K; o `large-v3-turbo` (padrão, melhor em português) é bem mais lento: conte de 1 a 3 minutos por minuto de vídeo num notebook comum. Em computador fraco, use `EDITAR_VIDEO_MODELO=small` antes do `preparar.py`.
- **Primeira transcrição:** baixa o modelo uma vez (~1,5 a 1,6 GB do Hugging Face). O ffmpeg baixa do GitHub. Firewall de empresa pode bloquear os dois.

## Riscos honestos (Windows)

1. Nada disso foi testado num Windows de verdade: saiu de documentação oficial, dos manifestos do winget e da inspeção dos pacotes.
2. Falta do `MSVCP140.dll` num Windows limpo: o conserto oficial pede a senha uma vez.
3. winget ausente ou bloqueado (PC de empresa).
4. Antivírus pode colocar o `ffmpeg.exe` em quarentena (falso positivo já visto com builds estáticos de ffmpeg).
5. O pedido de senha pode aparecer se o Windows ignorar a opção de instalar só pro usuário.

Se algo falhar: leia a última mensagem do instalador com a pessoa e resolva só aquele passo. Peça pra trazer a mensagem no plantão se não resolver.

## Se a pessoa já tem ffmpeg

Os scripts usam o ffmpeg do computador primeiro e só caem no empacotado se não houver.
