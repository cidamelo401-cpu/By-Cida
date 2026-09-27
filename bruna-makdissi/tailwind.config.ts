import type { Config } from 'tailwindcss';
import { color, radius, shadow } from './src/styles/tokens';

const config: Config = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        noite: color.noite,
        nevoa: color.nevoa,
        horizonte: color.horizonte,
        ouro: color.ouro,
        tinta: color.tinta,
      },
      fontFamily: {
        display: ['Newsreader', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        pill: radius.pill,
        button: radius.button,
        field: radius.field,
        card: radius.card,
      },
      boxShadow: {
        sm: shadow.sm,
        md: shadow.md,
        lg: shadow.lg,
        cover: shadow.cover,
      },
    },
  },
  plugins: [],
};

export default config;
