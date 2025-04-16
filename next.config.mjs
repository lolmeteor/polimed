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
    // Telegram Bot
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
    
    // HubService API
    GUID: process.env.GUID,
    WSDL_URL: process.env.WSDL_URL,
    TOKEN_URL: process.env.TOKEN_URL,
    DEFAULT_LPU_ID: process.env.DEFAULT_LPU_ID,
    
    // Отладка
    DEBUG_SECRET_KEY: process.env.DEBUG_SECRET_KEY,
    
    // SSH
    SSH_HOST: process.env.SSH_HOST,
    SSH_USER: process.env.SSH_USER,
  },
  serverRuntimeConfig: {
    // Telegram Bot
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
    
    // HubService API
    GUID: process.env.GUID,
    WSDL_URL: process.env.WSDL_URL,
    TOKEN_URL: process.env.TOKEN_URL,
    DEFAULT_LPU_ID: process.env.DEFAULT_LPU_ID,
    
    // Отладка
    DEBUG_SECRET_KEY: process.env.DEBUG_SECRET_KEY,
    
    // SSH
    SSH_HOST: process.env.SSH_HOST,
    SSH_USER: process.env.SSH_USER,
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
