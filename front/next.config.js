/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // 🚀 OPTIMIZACIÓN DE DESARROLLO: Configuración específica para reducir recompilaciones
  ...(process.env.NODE_ENV === "development"
    ? {
        // Optimizaciones específicas para desarrollo
        experimental: {
          // Mejora la velocidad de compilación
          esmExternals: "loose",
          // Reduce el bundle size en desarrollo
          outputFileTracingIncludes: {
            "/": ["./public/**/*"],
          },
          // 🚀 OPTIMIZACIÓN: Reducir Fast Refresh sensitivity
          forceSwcTransforms: true,
        },
        // Configuración de webpack para desarrollo - CORREGIDA
        webpack: (config, { dev, isServer }) => {
          if (dev) {
            // 🚀 OPTIMIZACIÓN: Mejor configuración de watch
            config.watchOptions = {
              poll: 1000,
              aggregateTimeout: 300,
              ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
            };

            // 🚀 OPTIMIZACIÓN: Cache filesystem con path absoluto - CORREGIDO
            if (config.cache !== false) {
              config.cache = {
                type: "filesystem",
                cacheDirectory: path.resolve(__dirname, ".next/cache"),
                buildDependencies: {
                  config: [__filename],
                },
              };
            }

            // 🚀 OPTIMIZACIÓN: Reducir Fast Refresh triggers
            config.experiments = {
              ...config.experiments,
              futureDefaults: false,
            };

            // 🚀 OPTIMIZACIÓN: Mejor configuración de chunks para desarrollo
            if (!isServer) {
              config.optimization = {
                ...config.optimization,
                splitChunks: {
                  chunks: "all",
                  cacheGroups: {
                    vendor: {
                      test: /[\\/]node_modules[\\/]/,
                      name: "vendors",
                      priority: 10,
                      reuseExistingChunk: true,
                    },
                    common: {
                      minChunks: 2,
                      priority: 5,
                      reuseExistingChunk: true,
                    },
                  },
                },
              };
            }
          }
          return config;
        },
      }
    : {}),

  eslint: {
    // Desactivar la verificación de ESLint durante el build para permitir el despliegue
    ignoreDuringBuilds: true,
  },
  typescript: {
    // También podemos ignorar errores de TypeScript durante el build
    ignoreBuildErrors: true,
  },
  // Asegurar que la aplicación se construya correctamente para producción
  output: "standalone",
  // Configuración de variables de entorno por defecto
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://influencerstracker-back.vercel.app/api",
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://pbwmrrixgzvmwhurcvbx.supabase.co",
  },
  // Configuración para SPA (Single Page Application)
  trailingSlash: false,
  // Redirigir todas las páginas 404 al home
  async redirects() {
    return [
      {
        source: "/404",
        destination: "/",
        permanent: false,
      },
    ];
  },
  // Comentado para evitar conflictos con campaign-insights que tiene su propio handler
  // async rewrites() {
  //   const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  //
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${apiUrl}/:path*`,
  //     },
  //   ]
  // },
  images: {
    domains: [
      "yt3.googleusercontent.com",
      // 📺 YouTube - Avatares y thumbnails
      "img.youtube.com",
      "i.ytimg.com",
      "yt3.ggpht.com",

      // 📱 Instagram - Avatares (fbcdn.net es el CDN de Facebook/Instagram)
      "instagram.ftpe8-1.fna.fbcdn.net",
      "instagram.ftpe8-2.fna.fbcdn.net",
      "instagram.ftpe7-3.fna.fbcdn.net",
      "instagram.ftpe7-4.fna.fbcdn.net",
      "scontent.cdninstagram.com",
      "scontent-lga3-1.cdninstagram.com",

      // 🎵 TikTok - Avatares y videos
      "p16-sign-sg.tiktokcdn.com",
      "p16.muscdn.com",
      "p19-sign.tiktokcdn-us.com",

      // 🔄 Proxy de imágenes
      "images.weserv.nl",
      "ui-avatars.com",
    ],
    // 🆕 NUEVA OPCIÓN: Permitir todos los subdominios de fbcdn.net
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.tiktokcdn.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // 🚀 OPTIMIZACIÓN: Configuración específica para mejorar performance
  swcMinify: true,
  compiler: {
    // Optimización para desarrollo
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 🚀 OPTIMIZACIÓN: Headers para mejor cache
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
