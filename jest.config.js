// Jest設定ファイル

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: './',
})

// Jestのカスタム設定
const customJestConfig = {
  // テスト環境の設定
  testEnvironment: 'jest-environment-jsdom',
  
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // モジュールパスの解決
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // カバレッジ設定
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/__tests__/**',
  ],
  
  // カバレッジ閾値
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // テストタイムアウト
  testTimeout: 10000,
  
  // モック設定
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // 環境変数
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
}

// Next.jsのJest設定とマージ
module.exports = createJestConfig(customJestConfig)
