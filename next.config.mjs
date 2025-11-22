/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA対応のためのヘッダー設定
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 画像最適化設定
  images: {
    unoptimized: true,
  },
  
  // 問題のあった実験的機能を削除
  // experimental: {
  //   optimizeCss: true, // この行を削除
  // },
  
  // @resvg/resvg-jsのネイティブバイナリを外部化（webpackがバンドルしないようにする）
  webpack: (config, { isServer }) => {
    if (isServer) {
      // config.externalsが配列でない場合は配列に変換
      const externals = Array.isArray(config.externals) 
        ? config.externals 
        : [config.externals || []].filter(Boolean);

      // @resvg/resvg-jsとそのプラットフォーム固有パッケージを外部化
      externals.push(function ({ request }, callback) {
        // パッケージルートとプラットフォーム固有のバリアントにマッチ
        if (request && /(^@resvg\/resvg-js$)|(^@resvg\/resvg-js-)/.test(request)) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      });

      config.externals = externals;
    }
    return config;
  },
}

export default nextConfig
