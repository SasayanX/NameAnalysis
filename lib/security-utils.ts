// セキュリティユーティリティ

import crypto from 'crypto'

// レート制限管理
export class RateLimiter {
  private static instance: RateLimiter
  private requests: Map<string, number[]> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // 古いリクエストを削除
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    // 新しいリクエストを追加
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

// 入力値検証
export class InputValidator {
  static validateName(name: string): { isValid: boolean; error?: string } {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: '名前は必須です' }
    }
    
    if (name.length < 1 || name.length > 10) {
      return { isValid: false, error: '名前は1-10文字で入力してください' }
    }
    
    // 危険な文字のチェック
    const dangerousChars = /[<>'"&]/g
    if (dangerousChars.test(name)) {
      return { isValid: false, error: '無効な文字が含まれています' }
    }
    
    return { isValid: true }
  }

  static validateBirthdate(birthdate: string): { isValid: boolean; error?: string } {
    if (!birthdate) {
      return { isValid: true } // 生年月日は任意
    }
    
    const date = new Date(birthdate)
    if (isNaN(date.getTime())) {
      return { isValid: false, error: '無効な日付です' }
    }
    
    const now = new Date()
    const minDate = new Date(1900, 0, 1)
    const maxDate = new Date(now.getFullYear() - 1, 11, 31)
    
    if (date < minDate || date > maxDate) {
      return { isValid: false, error: '1900年から昨年までの日付を入力してください' }
    }
    
    return { isValid: true }
  }

  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }
    
    return input
      .trim()
      .replace(/[<>'"&]/g, '') // 危険な文字を削除
      .substring(0, 100) // 長さ制限
  }
}

// セキュアなハッシュ生成
export class SecurityHasher {
  static generateHash(input: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex')
    const hash = crypto.createHash('sha256')
    hash.update(input + actualSalt)
    return hash.digest('hex')
  }

  static verifyHash(input: string, hash: string, salt: string): boolean {
    const computedHash = this.generateHash(input, salt)
    return computedHash === hash
  }
}

// CORS設定
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://seimei.app' 
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// セキュリティヘッダー
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// API レスポンスの標準化
export function createSecureResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...securityHeaders,
    },
  })
}

// エラーレスポンスの標準化
export function createErrorResponse(message: string, status = 400, code?: string) {
  return createSecureResponse({
    success: false,
    error: code || 'UNKNOWN_ERROR',
    message,
    timestamp: new Date().toISOString(),
  }, status)
}
