import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#A3A3A3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#2D2D2D',
          800: '#1F1F1F',
          900: '#141414',
        },
        accent: {
          50: '#FBF7EC',
          100: '#F5ECCC',
          200: '#EBDA9E',
          300: '#DFC56E',
          400: '#C9A84C',
          500: '#B8963A',
          600: '#9A7B2E',
          700: '#7C6325',
          800: '#5E4A1C',
          900: '#403214',
        },
        surface: '#F8F8F6',
        'surface-card': '#FFFFFF',
      },
    },
  },
  plugins: [],
};
export default config;
