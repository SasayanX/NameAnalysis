// セキュリティユーティリティのテスト

import { RateLimiter, InputValidator, SecurityHasher } from '../lib/security-utils'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    rateLimiter = RateLimiter.getInstance()
    // テスト用にリセット
    ;(rateLimiter as any).requests.clear()
  })

  test('should allow requests within limit', () => {
    const identifier = 'test-user'
    
    // 10回のリクエストを許可
    for (let i = 0; i < 10; i++) {
      expect(rateLimiter.isAllowed(identifier)).toBe(true)
    }
  })

  test('should block requests exceeding limit', () => {
    const identifier = 'test-user'
    
    // 制限を超えるリクエスト
    for (let i = 0; i < 101; i++) {
      const allowed = rateLimiter.isAllowed(identifier)
      if (i < 100) {
        expect(allowed).toBe(true)
      } else {
        expect(allowed).toBe(false)
      }
    }
  })

  test('should return correct remaining requests', () => {
    const identifier = 'test-user'
    
    expect(rateLimiter.getRemainingRequests(identifier)).toBe(100)
    
    rateLimiter.isAllowed(identifier)
    expect(rateLimiter.getRemainingRequests(identifier)).toBe(99)
  })
})

describe('InputValidator', () => {
  describe('validateName', () => {
    test('should accept valid names', () => {
      expect(InputValidator.validateName('田中')).toEqual({ isValid: true })
      expect(InputValidator.validateName('山田太郎')).toEqual({ isValid: true })
      expect(InputValidator.validateName('佐藤花子')).toEqual({ isValid: true })
    })

    test('should reject empty names', () => {
      expect(InputValidator.validateName('')).toEqual({
        isValid: false,
        error: '名前は必須です'
      })
      expect(InputValidator.validateName('   ')).toEqual({
        isValid: false,
        error: '名前は必須です'
      })
    })

    test('should reject names that are too long', () => {
      const longName = 'あ'.repeat(11)
      expect(InputValidator.validateName(longName)).toEqual({
        isValid: false,
        error: '名前は1-10文字で入力してください'
      })
    })

    test('should reject names with dangerous characters', () => {
      expect(InputValidator.validateName('田中<script>')).toEqual({
        isValid: false,
        error: '無効な文字が含まれています'
      })
      expect(InputValidator.validateName('山田"太郎"')).toEqual({
        isValid: false,
        error: '無効な文字が含まれています'
      })
    })

    test('should reject non-string inputs', () => {
      expect(InputValidator.validateName(null as any)).toEqual({
        isValid: false,
        error: '名前は必須です'
      })
      expect(InputValidator.validateName(123 as any)).toEqual({
        isValid: false,
        error: '名前は必須です'
      })
    })
  })

  describe('validateBirthdate', () => {
    test('should accept valid birthdates', () => {
      expect(InputValidator.validateBirthdate('1990-01-01')).toEqual({ isValid: true })
      expect(InputValidator.validateBirthdate('2000-12-31')).toEqual({ isValid: true })
    })

    test('should accept empty birthdate (optional)', () => {
      expect(InputValidator.validateBirthdate('')).toEqual({ isValid: true })
    })

    test('should reject invalid dates', () => {
      expect(InputValidator.validateBirthdate('invalid-date')).toEqual({
        isValid: false,
        error: '無効な日付です'
      })
      expect(InputValidator.validateBirthdate('2025-13-01')).toEqual({
        isValid: false,
        error: '無効な日付です'
      })
    })

    test('should reject dates that are too old', () => {
      expect(InputValidator.validateBirthdate('1899-12-31')).toEqual({
        isValid: false,
        error: '1900年から昨年までの日付を入力してください'
      })
    })

    test('should reject future dates', () => {
      const nextYear = new Date().getFullYear() + 1
      expect(InputValidator.validateBirthdate(`${nextYear}-01-01`)).toEqual({
        isValid: false,
        error: '1900年から昨年までの日付を入力してください'
      })
    })
  })

  describe('sanitizeInput', () => {
    test('should sanitize dangerous characters', () => {
      expect(InputValidator.sanitizeInput('田中<script>alert("xss")</script>')).toBe('田中alert("xss")')
      expect(InputValidator.sanitizeInput('山田"太郎"')).toBe('山田太郎')
      expect(InputValidator.sanitizeInput('佐藤&花子')).toBe('佐藤花子')
    })

    test('should trim whitespace', () => {
      expect(InputValidator.sanitizeInput('  田中  ')).toBe('田中')
    })

    test('should limit length', () => {
      const longInput = 'あ'.repeat(150)
      expect(InputValidator.sanitizeInput(longInput)).toBe('あ'.repeat(100))
    })

    test('should handle empty inputs', () => {
      expect(InputValidator.sanitizeInput('')).toBe('')
      expect(InputValidator.sanitizeInput(null as any)).toBe('')
      expect(InputValidator.sanitizeInput(undefined as any)).toBe('')
    })
  })
})

describe('SecurityHasher', () => {
  test('should generate consistent hashes with same input and salt', () => {
    const input = 'test-input'
    const salt = 'test-salt'
    
    const hash1 = SecurityHasher.generateHash(input, salt)
    const hash2 = SecurityHasher.generateHash(input, salt)
    
    expect(hash1).toBe(hash2)
  })

  test('should generate different hashes with different salts', () => {
    const input = 'test-input'
    const salt1 = 'salt1'
    const salt2 = 'salt2'
    
    const hash1 = SecurityHasher.generateHash(input, salt1)
    const hash2 = SecurityHasher.generateHash(input, salt2)
    
    expect(hash1).not.toBe(hash2)
  })

  test('should verify correct hashes', () => {
    const input = 'test-input'
    const salt = 'test-salt'
    const hash = SecurityHasher.generateHash(input, salt)
    
    expect(SecurityHasher.verifyHash(input, hash, salt)).toBe(true)
  })

  test('should reject incorrect hashes', () => {
    const input = 'test-input'
    const salt = 'test-salt'
    const hash = SecurityHasher.generateHash(input, salt)
    
    expect(SecurityHasher.verifyHash('wrong-input', hash, salt)).toBe(false)
    expect(SecurityHasher.verifyHash(input, 'wrong-hash', salt)).toBe(false)
    expect(SecurityHasher.verifyHash(input, hash, 'wrong-salt')).toBe(false)
  })

  test('should generate random salt when not provided', () => {
    const input = 'test-input'
    
    const hash1 = SecurityHasher.generateHash(input)
    const hash2 = SecurityHasher.generateHash(input)
    
    // 異なるソルトが生成されるため、ハッシュも異なる
    expect(hash1).not.toBe(hash2)
  })
})
