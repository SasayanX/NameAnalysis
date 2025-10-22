// 姓名判断機能の統合テスト

import { analyzeNameFortuneCustom } from '../../lib/name-data-simple'
import { calculateStarPersonFromBirthdate } from '../../lib/fortune-flow-calculator'
import { calculateNumerology } from '../../lib/numerology'

describe('Name Analysis Integration', () => {
  describe('Complete Name Analysis Flow', () => {
    test('should perform complete analysis for valid input', () => {
      const lastName = '田中'
      const firstName = '太郎'
      const gender = 'male' as const
      const birthdate = new Date('1990-01-01')

      // 姓名判断
      const nameAnalysis = analyzeNameFortuneCustom(lastName, firstName, gender)
      expect(nameAnalysis).toBeDefined()
      expect(nameAnalysis.totalScore).toBeGreaterThan(0)

      // 六星占術
      const sixStar = calculateStarPersonFromBirthdate(birthdate)
      expect(sixStar).toBeDefined()
      expect(typeof sixStar).toBe('string')

      // 数秘術
      const numerology = calculateNumerology(`${lastName}${firstName}`, birthdate)
      expect(numerology).toBeDefined()
      expect(numerology.lifePathNumber).toBeGreaterThan(0)
    })

    test('should handle analysis without birthdate', () => {
      const lastName = '佐藤'
      const firstName = '花子'
      const gender = 'female' as const

      // 姓名判断のみ
      const nameAnalysis = analyzeNameFortuneCustom(lastName, firstName, gender)
      expect(nameAnalysis).toBeDefined()
      expect(nameAnalysis.totalScore).toBeGreaterThan(0)

      // 数秘術（生年月日なし）
      const numerology = calculateNumerology(`${lastName}${firstName}`)
      expect(numerology).toBeDefined()
      expect(numerology.lifePathNumber).toBeGreaterThan(0)
    })

    test('should handle edge cases', () => {
      // 短い名前
      const shortName = analyzeNameFortuneCustom('田', '郎', 'male')
      expect(shortName).toBeDefined()

      // 長い名前
      const longName = analyzeNameFortuneCustom('田中田', '太郎太郎', 'male')
      expect(longName).toBeDefined()

      // 特殊文字を含む名前
      const specialName = analyzeNameFortuneCustom('田中', '太郎', 'male')
      expect(specialName).toBeDefined()
    })
  })

  describe('Six Star Calculation Integration', () => {
    test('should calculate consistent results for same birthdate', () => {
      const birthdate = new Date('2000-09-22')
      
      const result1 = calculateStarPersonFromBirthdate(birthdate)
      const result2 = calculateStarPersonFromBirthdate(birthdate)
      
      expect(result1).toBe(result2)
    })

    test('should handle different birthdates', () => {
      const testCases = [
        { date: new Date('1969-06-07'), expected: '火星人+' },
        { date: new Date('2000-09-22'), expected: '金星人+' },
        { date: new Date('1985-04-15'), expected: '木星人-' },
        { date: new Date('1995-12-25'), expected: '土星人+' },
        { date: new Date('1972-06-14'), expected: '水星人-' }
      ]

      testCases.forEach(({ date, expected }) => {
        const result = calculateStarPersonFromBirthdate(date)
        expect(result).toBe(expected)
      })
    })
  })

  describe('Numerology Integration', () => {
    test('should calculate consistent numerology results', () => {
      const name = '田中太郎'
      const birthdate = new Date('1990-01-01')
      
      const result1 = calculateNumerology(name, birthdate)
      const result2 = calculateNumerology(name, birthdate)
      
      expect(result1.lifePathNumber).toBe(result2.lifePathNumber)
      expect(result1.expressionNumber).toBe(result2.expressionNumber)
    })

    test('should handle names without birthdate', () => {
      const name = '佐藤花子'
      
      const result = calculateNumerology(name)
      expect(result).toBeDefined()
      expect(result.lifePathNumber).toBeGreaterThan(0)
      expect(result.expressionNumber).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Integration', () => {
    test('should handle invalid inputs gracefully', () => {
      // 空の名前
      expect(() => analyzeNameFortuneCustom('', '', 'male')).not.toThrow()
      
      // 無効な生年月日
      expect(() => calculateStarPersonFromBirthdate(new Date('invalid'))).not.toThrow()
      
      // 空の名前での数秘術
      expect(() => calculateNumerology('')).not.toThrow()
    })

    test('should provide meaningful results for edge cases', () => {
      // 非常に短い名前
      const shortResult = analyzeNameFortuneCustom('田', '郎', 'male')
      expect(shortResult.totalScore).toBeGreaterThan(0)

      // 非常に長い名前
      const longResult = analyzeNameFortuneCustom('田中田中田中', '太郎太郎太郎', 'male')
      expect(longResult.totalScore).toBeGreaterThan(0)
    })
  })

  describe('Performance Integration', () => {
    test('should complete analysis within reasonable time', () => {
      const startTime = performance.now()
      
      const lastName = '田中'
      const firstName = '太郎'
      const gender = 'male' as const
      const birthdate = new Date('1990-01-01')

      // 複数の分析を実行
      const nameAnalysis = analyzeNameFortuneCustom(lastName, firstName, gender)
      const sixStar = calculateStarPersonFromBirthdate(birthdate)
      const numerology = calculateNumerology(`${lastName}${firstName}`, birthdate)

      const endTime = performance.now()
      const duration = endTime - startTime

      // 1秒以内に完了することを期待
      expect(duration).toBeLessThan(1000)
      
      // 結果が正しく生成されることを確認
      expect(nameAnalysis).toBeDefined()
      expect(sixStar).toBeDefined()
      expect(numerology).toBeDefined()
    })
  })
})
