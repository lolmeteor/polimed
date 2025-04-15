let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  env: {
    // Публичные переменные для клиентских компонентов
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
    NEXT_PUBLIC_MIS_WSDL_URL: process.env.NEXT_PUBLIC_MIS_WSDL_URL || process.env.MIS_WSDL_URL,
    NEXT_PUBLIC_MIS_TOKEN_URL: process.env.NEXT_PUBLIC_MIS_TOKEN_URL || process.env.MIS_TOKEN_URL,
    NEXT_PUBLIC_MIS_GUID: process.env.NEXT_PUBLIC_MIS_GUID || process.env.MIS_GUID,
    NEXT_PUBLIC_MIS_DEFAULT_LPU_ID: process.env.NEXT_PUBLIC_MIS_DEFAULT_LPU_ID || process.env.MIS_DEFAULT_LPU_ID,
    
    // Переменные для серверной части
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    MIS_WSDL_URL: process.env.MIS_WSDL_URL,
    MIS_TOKEN_URL: process.env.MIS_TOKEN_URL,
    MIS_GUID: process.env.MIS_GUID,
    MIS_DEFAULT_LPU_ID: process.env.MIS_DEFAULT_LPU_ID,
  },
  serverRuntimeConfig: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        events: false
      };
      
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:crypto': 'crypto',
        'node:fs': false,
        'node:fs/promises': false,
        'node:events': false,
        'node:os': false,
        'node:stream': false,
        'node:buffer': false,
        'node:util': false,
        'node:path': false,
        'node:url': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:querystring': false,
        'node:string_decoder': false,
        'node:punycode': false,
        'node:process': false,
        'node:timers': false,
        'node:child_process': false
      };
    }
    
    return config;
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
