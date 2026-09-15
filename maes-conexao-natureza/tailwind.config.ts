import type { Config } from 'tailwindcss';

/**
 * Paleta e escalas extraídas 1:1 do protótipo HTML.
 * NÃO trocar hexadecimais sem autorização (ver CLAUDE.md).
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F6F1E6',
        sand: '#EFE7D8',
        forest: '#1E3123',
        'forest-ink': '#142616',
        moss: '#6E8A3C',
        'moss-dark': '#5C7A2E',
        'moss-light': '#8FAE4B',
        sage: '#A8C27A',
        mint: '#E7EED6',
        'olive-deep': '#3D5424',
        terracotta: '#D5533B',
        'terracotta-dark': '#C24730',
        clay: '#7A2E1F',
        blush: '#F7E0D9',
        amber: '#EFC94C',
        'amber-dark': '#E0A03A',
        'amber-ink': '#3D2E05',
        'amber-label': '#7A5A0B'
      },
      fontFamily: {
        display: ['var(--font-baloo)', 'cursive'],
        sans: ['var(--font-quicksand)', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '22px',
        'card-lg': '26px',
        tile: '18px',
        chip: '999px'
      },
      spacing: {
        'safe-top': '60px',
        'safe-bottom': '28px'
      },
      maxWidth: {
        app: '402px'
      }
    }
  },
  plugins: []
};

export default config;
