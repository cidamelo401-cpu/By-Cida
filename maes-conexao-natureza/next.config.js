/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Fotos do evento são servidas de /public/img. Nenhum host remoto autorizado ainda.
    remotePatterns: []
  }
};

module.exports = nextConfig;
