// パフォーマンスロガーのテスト

import { PerformanceLogger } from '../lib/performance-logger'

describe('PerformanceLogger', () => {
  let performanceLogger: PerformanceLogger

  beforeEach(() => {
    performanceLogger = PerformanceLogger.getInstance()
    performanceLogger.clear()
  })

  test('should measure synchronous operations', () => {
    const result = performanceLogger.measure('test-operation', () => {
      return 'test-result'
    })

    expect(result).toBe('test-result')
    
    const stats = performanceLogger.getStats()
    expect(stats.totalOperations).toBe(1)
    expect(stats.averageDuration).toBeGreaterThan(0)
  })

  test('should measure asynchronous operations', async () => {
    const result = await performanceLogger.measureAsync('async-operation', async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return 'async-result'
    })

    expect(result).toBe('async-result')
    
    const stats = performanceLogger.getStats()
    expect(stats.totalOperations).toBe(1)
    expect(stats.averageDuration).toBeGreaterThan(10)
  })

  test('should track multiple operations', () => {
    performanceLogger.measure('operation1', () => 'result1')
    performanceLogger.measure('operation2', () => 'result2')
    performanceLogger.measure('operation1', () => 'result3')

    const stats = performanceLogger.getStats()
    expect(stats.totalOperations).toBe(3)
    expect(stats.operationBreakdown['operation1'].count).toBe(2)
    expect(stats.operationBreakdown['operation2'].count).toBe(1)
  })

  test('should handle errors in measured operations', () => {
    expect(() => {
      performanceLogger.measure('error-operation', () => {
        throw new Error('Test error')
      })
    }).toThrow('Test error')

    const stats = performanceLogger.getStats()
    expect(stats.totalOperations).toBe(1)
  })

  test('should handle async errors', async () => {
    await expect(
      performanceLogger.measureAsync('async-error', async () => {
        throw new Error('Async test error')
      })
    ).rejects.toThrow('Async test error')

    const stats = performanceLogger.getStats()
    expect(stats.totalOperations).toBe(1)
  })

  test('should identify slow operations', () => {
    performanceLogger.measure('slow-operation', () => {
      // 模擬的な遅い操作
      const start = Date.now()
      while (Date.now() - start < 5) {
        // 5ms待機
      }
      return 'slow-result'
    })

    const stats = performanceLogger.getStats()
    expect(stats.totalOperations).toBe(1)
    expect(stats.averageDuration).toBeGreaterThan(5)
  })

  test('should clear metrics', () => {
    performanceLogger.measure('test-operation', () => 'result')
    
    let stats = performanceLogger.getStats()
    expect(stats.totalOperations).toBe(1)

    performanceLogger.clear()
    
    stats = performanceLogger.getStats()
    expect(stats.totalOperations).toBe(0)
  })

  test('should provide operation breakdown', () => {
    performanceLogger.measure('operation-a', () => 'result1')
    performanceLogger.measure('operation-b', () => 'result2')
    performanceLogger.measure('operation-a', () => 'result3')

    const stats = performanceLogger.getStats()
    expect(stats.operationBreakdown['operation-a']).toEqual({
      count: 2,
      avgDuration: expect.any(Number)
    })
    expect(stats.operationBreakdown['operation-b']).toEqual({
      count: 1,
      avgDuration: expect.any(Number)
    })
  })
})
