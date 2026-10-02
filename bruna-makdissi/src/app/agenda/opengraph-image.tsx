import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * og:image específica da Agenda — mesma foto usada no hero da página, com
 * texto do mês, pra remeter ao conteúdo real quando o link é compartilhado.
 * Precisa ser atualizada todo mês junto com o resto da página (MES em
 * page.tsx).
 *
 * Nota técnica: o gerador de imagem (Satori, por trás do next/og) não
 * suporta o atalho CSS "inset" — usa top/left/width/height explícitos em
 * todo elemento absolutamente posicionado, senão ele não desenha nada
 * (falha calada, sem erro).
 */
export default function Image() {
  const photo = readFileSync(join(process.cwd(), 'public/bruna/bruna-sozinha-look-bege-01.jpg'));
  const photoSrc = `data:image/jpeg;base64,${photo.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', backgroundColor: '#F9F2F1' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
          }}
          alt=""
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            background: 'linear-gradient(90deg, rgba(35,27,56,.95) 0%, rgba(35,27,56,.6) 50%, rgba(35,27,56,0) 85%)',
          }}
        />
        <div style={{ position: 'absolute', left: 64, top: 64, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, color: '#E4C48D' }}>BRUNA MAKDISSI</div>
          <div style={{ display: 'flex', fontSize: 72, color: '#FFFFFF', marginTop: 12, lineHeight: 1 }}>Agenda</div>
          <div style={{ display: 'flex', fontSize: 72, color: '#E08B63', fontStyle: 'italic', lineHeight: 1 }}>Outubro</div>
        </div>
        <div style={{ position: 'absolute', left: 64, bottom: 56, display: 'flex', maxWidth: 480 }}>
          <div style={{ display: 'flex', fontSize: 26, color: '#E9E5F0' }}>
            O que eu abro para caminhar com você este mês.
          </div>
        </div>
      </div>
    ),
    size
  );
}
