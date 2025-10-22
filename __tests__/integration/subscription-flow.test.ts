// サブスクリプションフローの統合テスト

import { SubscriptionManager } from '../../lib/subscription-manager'
import { UsageTracker } from '../../lib/usage-tracker'

describe('Subscription Flow Integration', () => {
  let subscriptionManager: SubscriptionManager
  let usageTracker: UsageTracker

  beforeEach(() => {
    subscriptionManager = SubscriptionManager.getInstance()
    usageTracker = UsageTracker.getInstance()
    
    // テスト用にリセット
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  })

  describe('Free Plan Flow', () => {
    test('should handle free plan activation', () => {
      const plan = subscriptionManager.getCurrentPlan()
      expect(plan.id).toBe('free')
      expect(plan.price).toBe(0)
    })

    test('should track usage for free plan', () => {
      const canUse = usageTracker.canUseFeature('personalAnalysis')
      expect(canUse.allowed).toBe(true)
      expect(canUse.limit).toBe(1)

      const success = usageTracker.incrementUsage('personalAnalysis')
      expect(success).toBe(true)

      const updatedCanUse = usageTracker.canUseFeature('personalAnalysis')
      expect(updatedCanUse.allowed).toBe(false)
      expect(updatedCanUse.remaining).toBe(0)
    })
  })

  describe('Premium Plan Flow', () => {
    test('should handle premium plan activation', () => {
      // 開発環境でのプラン切り替え
      if (process.env.NODE_ENV === 'development') {
        subscriptionManager.debugSwitchPlan('premium')
        
        const plan = subscriptionManager.getCurrentPlan()
        expect(plan.id).toBe('premium')
        expect(plan.price).toBe(440)
      }
    })

    test('should allow unlimited usage for premium plan', () => {
      if (process.env.NODE_ENV === 'development') {
        subscriptionManager.debugSwitchPlan('premium')
        
        const canUse = usageTracker.canUseFeature('personalAnalysis')
        expect(canUse.allowed).toBe(true)
        expect(canUse.limit).toBe(-1) // 無制限

        // 複数回使用しても制限されない
        for (let i = 0; i < 10; i++) {
          const success = usageTracker.incrementUsage('personalAnalysis')
          expect(success).toBe(true)
        }
      }
    })
  })

  describe('Trial Flow', () => {
    test('should handle trial activation', () => {
      if (process.env.NODE_ENV === 'development') {
        subscriptionManager.debugStartTrial()
        
        const isInTrial = subscriptionManager.isInTrial()
        expect(isInTrial).toBe(true)
        
        const trialDays = subscriptionManager.getTrialDaysRemaining()
        expect(trialDays).toBeGreaterThan(0)
        expect(trialDays).toBeLessThanOrEqual(3)
      }
    })

    test('should provide premium features during trial', () => {
      if (process.env.NODE_ENV === 'development') {
        subscriptionManager.debugStartTrial()
        
        const canUse = usageTracker.canUseFeature('personalAnalysis')
        expect(canUse.allowed).toBe(true)
        expect(canUse.limit).toBe(-1) // 無制限
      }
    })
  })

  describe('Usage Tracking Integration', () => {
    test('should track multiple feature usage', () => {
      const features = ['personalAnalysis', 'companyAnalysis', 'compatibilityAnalysis'] as const
      
      features.forEach(feature => {
        const canUse = usageTracker.canUseFeature(feature)
        if (canUse.allowed) {
          const success = usageTracker.incrementUsage(feature)
          expect(success).toBe(true)
        }
      })

      const usageStatus = usageTracker.getUsageStatus()
      expect(usageStatus.todayUsage).toBeDefined()
    })

    test('should reset usage daily', () => {
      // 使用回数を増やす
      usageTracker.incrementUsage('personalAnalysis')
      
      const beforeReset = usageTracker.getTodayUsage()
      expect(beforeReset.personalAnalysis).toBeGreaterThan(0)

      // 日次リセットをシミュレート
      usageTracker.resetUsage()
      
      const afterReset = usageTracker.getTodayUsage()
      expect(afterReset.personalAnalysis).toBe(0)
    })
  })

  describe('Error Handling Integration', () => {
    test('should handle invalid plan changes gracefully', () => {
      if (process.env.NODE_ENV === 'development') {
        // 無効なプランIDでの切り替え
        expect(() => {
          (subscriptionManager as any).debugSwitchPlan('invalid-plan')
        }).not.toThrow()
      }
    })

    test('should handle usage tracking errors gracefully', () => {
      // 無効な機能名での使用回数増加
      expect(() => {
        (usageTracker as any).incrementUsage('invalid-feature')
      }).not.toThrow()
    })
  })

  describe('Performance Integration', () => {
    test('should handle rapid usage tracking efficiently', () => {
      const startTime = performance.now()
      
      // 100回の使用回数増加
      for (let i = 0; i < 100; i++) {
        usageTracker.incrementUsage('personalAnalysis')
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 100ms以内に完了することを期待
      expect(duration).toBeLessThan(100)
    })

    test('should handle concurrent usage tracking', () => {
      const promises = []
      
      // 10個の並行使用回数増加
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise(resolve => {
            const success = usageTracker.incrementUsage('personalAnalysis')
            resolve(success)
          })
        )
      }
      
      return Promise.all(promises).then(results => {
        results.forEach(result => {
          expect(result).toBeDefined()
        })
      })
    })
  })
})
