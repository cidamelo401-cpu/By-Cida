# Problemas conhecidos (todos aconteceram de verdade)

| Problema | Causa | Solução (já no código ou no processo) |
|---|---|---|
| Palavra cortada no meio | o tempo da transcrição erra uns centésimos | `cortes.py` encaixa cada corte no **silêncio real** mais perto (volume em janelas de 10ms) |
| Pausa que sobra depois de um corte | o corte ficou na marcação da transcrição, não onde a fala começa | `cortes.py` aperta cada trecho até onde o volume diz que a fala começa/termina |
| A mesma palavra saiu duas vezes | a transcrição juntou duas tentativas numa palavra só | **meça o volume** no trecho antes de cortar (abaixo) e escute a descrição da pessoa |
| A palavra mantida sumiu junto com o corte | palavra que começa dentro do corte e termina fora era descartada | só sai palavra **inteira** dentro do corte |
| Final cortado no meio da despedida | o fim ficava na última palavra | `"fim"` no pedido = ~1s depois da última palavra; o último trecho fica inteiro |
| A última palavra repetida na legenda ("tchau tchau") | a transcrição duplica a última palavra e inventa "!!!!" no silêncio | `preparar.py` limpa o lixo; `legendas.py` ignora palavra repetida colada |
| Legenda junto com o headline | os dois na tela ao mesmo tempo | headline sai quando a fala seguinte começa; `legenda.json` → `esperar` |
| Nome de marca ou ferramenta escrito errado ("Cloud" no lugar de "Claude", "click -up") | fonética | glossário do estilo, aplicado na frase inteira |
| Legenda em cima da boca na tela dividida | rosto cai na altura padrão da legenda | na tela dividida a legenda vai pra faixa escura do painel (`y_centro=905`) |
| Lettering em cima da boca | posição estimada | ancore no queixo medido na `grade.jpg` |
| Cor de destaque some | cor clarinha perto do branco | use a versão forte da cor |
| Pico de áudio alto | efeitos somados à voz | limitador em -3 dB no mix final; `conferir.py` avisa |
| Vídeo do celular com taxa variável | o celular economiza quadros | tudo vira 30 quadros fixos no `cortar.py` |
| `pip install` bloqueado no Mac ("externally managed") | o Python do Homebrew protege o sistema | tudo roda na pasta própria `~/editar-video/.venv` |
| Texto que devia surgir suave aparece de uma vez (até antes da hora) | algumas versões da Pillow ignoram a transparência do texto | `comum.py` detecta e corrige sozinho (desenha o texto numa máscara) |
| `--sugerir` aponta "frase recomeçada" que não é regravação | duas frases diferentes que começam com as mesmas palavras ("o que ela...") | sugestão não é decisão: leia a transcrição antes de pôr no pedido |
| Precisa testar sem mexer no estilo da pessoa | o estilo fica sempre em `~/editar-video/meu-estilo.md` | `EDITAR_VIDEO_ESTILO=/outro/arquivo.md` antes do comando |
| A transcrição "ouviu" frases num vídeo sem fala | o Whisper inventa texto em música, vento, barulho e silêncio | `preparar.py` descarta segmentos sem cara de fala (confiança baixa, palavra esticada, frases típicas de invenção) e palavras em trecho sem som |
| Vídeo sem fala sumiu inteiro no corte | cortar pela fala trata tudo que não é fala como pausa | o `preparar.py` diz o TIPO; sem fala ou misto, o pedido é `"manter"` (montagem). O `cortes.py` trava se algum clipe sem fala ia sumir |
| Trecho da montagem sumiu (vídeo mais curto que a tabela) | cortar vários trechos de uma entrada só perde trechos quando a fila do ffmpeg enche | `cortar.py` lê cada trecho direto do ponto certo do arquivo |
| Clipe sem som ou trecho mudo bagunçava as pausas | o silêncio digital "puxava" a régua do que é silêncio | `cortes.py` mede o silêncio só onde existe som |
| Vídeo deitado num Reels em pé | 16:9 cortado pra 9:16 perde dois terços da imagem | `preparar.py` põe o vídeo inteiro com fundo desfocado (`--enquadrar cortar` se a pessoa preferir preencher) |
| Print na tela dividida cortado / legenda sumindo em cima dele | print de celular é em pé e foi cortado pra preencher; a legenda branca caía em fundo branco | `TelaDividida(arquivo=...)` mostra o print inteiro (fundo desfocado) com faixa escura embaixo |
| Música de fundo fez o volume final cair | a música entra sem ajuste | com música, a mistura final é normalizada pro volume do estilo |
| Instalar ffmpeg pede senha (Homebrew) e o Claude Code não digita senha | o Homebrew precisa de administrador | o instalador usa o `static-ffmpeg` (ffmpeg dentro do pacote Python): sem Homebrew, sem senha |

## Achar o ponto exato (quando a pessoa aponta um problema)

1. Converta o tempo que ela disse (vídeo final) pro bruto pelos trechos de `cortes/cortes.json`.
2. Liste as palavras perto: `legendas/palavras.json`.
3. **Meça o volume** a cada 10ms (é o que mostra onde a fala realmente começa e as pausas):

```python
import wave, numpy as np
wf = wave.open('audio.wav'); x = np.frombuffer(wf.readframes(wf.getnframes()), np.int16) / 32768
hop = wf.getframerate() // 100
db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, 'same'))[::hop] + 1e-9)
print(' '.join(str(int(v)) for v in db[11760:12120]))   # 117,6s a 121,2s
```
Silêncio fica perto de -65; fala, entre -15 e -35.

## A regra da música

- **Padrão: sem música.**
- **Música famosa pelo nome:** não baixe nem coloque. Baixar música de artista sem licença quebra direito autoral, e o Instagram silencia ou derruba o vídeo. **Adicione pelo próprio Instagram na hora de postar** (a biblioteca de lá é licenciada).
- **Trilha de fundo no arquivo:** só instrumental livre de direitos, que a pessoa baixa (ex.: Biblioteca de Áudio do YouTube, Pixabay Music, conferindo a licença da faixa) e coloca em `materiais/`. Use `executar(..., musica={'arquivo': ..., 'volume': 0.25})`: entra baixa, abaixa quando ela fala (ducking) e some no fim.
