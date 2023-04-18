const utwm = require('unplugin-tailwindcss-mangle')
// import utwm from 'unplugin-tailwindcss-mangle'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.plugins.push(utwm.webpack())
    return config
  }
}

module.exports = nextConfig
