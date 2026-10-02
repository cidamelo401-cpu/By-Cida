import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * og:image específica desta página — foto de atendimento (pêndulo + mesa)
 * em vez do logo genérico, pra remeter visualmente ao mapeamento energético
 * quando o link é compartilhado no WhatsApp/Instagram.
 */
export default function Image() {
  const photo = readFileSync(join(process.cwd(), 'public/bruna/bruna-atendimento-mesa-radionica-01.jpg'));
  const photoSrc = `data:image/jpeg;base64,${photo.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', backgroundColor: '#F9F2F1' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
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
            background: 'linear-gradient(0deg, rgba(35,27,56,.88) 0%, rgba(35,27,56,.25) 48%, rgba(35,27,56,0) 75%)',
          }}
        />
        <div style={{ position: 'absolute', left: 64, bottom: 56, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, color: '#E4C48D' }}>VALE-PRESENTE</div>
          <div style={{ display: 'flex', fontSize: 58, color: '#FFFFFF', marginTop: 10 }}>Mapeamento Energético</div>
          <div style={{ display: 'flex', fontSize: 26, color: '#E9E5F0', marginTop: 12 }}>Bruna Makdissi</div>
        </div>
      </div>
    ),
    size
  );
}
