import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DMS Sports — Painel de Gestão'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://dms-sports.vercel.app/logo-dms-sports.jpg"
          alt=""
          width={120}
          height={120}
          style={{ borderRadius: 24, marginBottom: 32 }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: '#FFFFFF' }}>DMS</span>
          <span style={{ color: '#C9A84C' }}>Sports</span>
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#6B6B6B',
            marginTop: 16,
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
          }}
        >
          Painel de Gestão
        </div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
            fontSize: 16,
            color: '#4A4A4A',
          }}
        >
          <span>📦 Estoque</span>
          <span>🛒 Vendas</span>
          <span>🔔 Leads</span>
          <span>📊 Relatórios</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
