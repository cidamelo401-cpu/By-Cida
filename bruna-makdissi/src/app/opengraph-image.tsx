import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Imagem padrão de compartilhamento (og:image) do site inteiro — aplica a
 * toda página que não define a sua própria (convenção de arquivo do
 * Next.js: quem não tem opengraph-image.tsx próprio herda este).
 *
 * Antes não existia nenhuma, então WhatsApp/Facebook caíam no favicon (o
 * símbolo sozinho) como fallback — por isso o link aparecia com uma
 * imagem enorme e cortada ao compartilhar.
 */
export default function Image() {
  const logo = readFileSync(join(process.cwd(), 'public/brand/lockup-completo-escuro.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#231B38',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={560} height={141} alt="" />
      </div>
    ),
    size
  );
}
