// API エンドポイントのテスト

import { NextRequest } from 'next/server'
import { POST } from '../../app/api/create-subscription/route'

// モック設定
jest.mock('../../lib/security-utils', () => ({
  RateLimiter: {
    getInstance: () => ({
      isAllowed: jest.fn(() => true)
    })
  },
  InputValidator: {
    validateName: jest.fn(() => ({ isValid: true })),
    validateBirthdate: jest.fn(() => ({ isValid: true }))
  },
  createSecureResponse: jest.fn((data, status = 200) => 
    new Response(JSON.stringify(data), { status })
  ),
  createErrorResponse: jest.fn((message, status = 400, code) => 
    new Response(JSON.stringify({ success: false, error: code, message }), { status })
  )
}))

describe('/api/create-subscription', () => {
  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/create-subscription', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  test('should create free subscription successfully', async () => {
    const request = createMockRequest({
      planId: 'free',
      billingCycle: 'monthly'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.subscription.planId).toBe('free')
    expect(data.subscription.amount).toBe(0)
  })

  test('should create basic subscription with mock response', async () => {
    const request = createMockRequest({
      planId: 'basic',
      billingCycle: 'monthly'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.subscription.planId).toBe('basic')
    expect(data.subscription.amount).toBe(220)
  })

  test('should create premium subscription with yearly billing', async () => {
    const request = createMockRequest({
      planId: 'premium',
      billingCycle: 'yearly'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.subscription.planId).toBe('premium')
    expect(data.subscription.amount).toBe(3960)
  })

  test('should reject invalid plan ID', async () => {
    const request = createMockRequest({
      planId: 'invalid-plan',
      billingCycle: 'monthly'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('INVALID_PLAN_ID')
  })

  test('should reject missing parameters', async () => {
    const request = createMockRequest({
      planId: 'basic'
      // billingCycle missing
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('MISSING_PARAMETERS')
  })

  test('should handle rate limiting', async () => {
    const { RateLimiter } = require('../../lib/security-utils')
    const mockRateLimiter = RateLimiter.getInstance()
    mockRateLimiter.isAllowed.mockReturnValue(false)

    const request = createMockRequest({
      planId: 'basic',
      billingCycle: 'monthly'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error).toBe('RATE_LIMIT_EXCEEDED')
  })

  test('should handle JSON parsing errors', async () => {
    const request = new NextRequest('http://localhost:3000/api/create-subscription', {
      method: 'POST',
      body: 'invalid-json',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('SUBSCRIPTION_CREATION_FAILED')
  })
})
