// 統一された六星占術計算のテスト

import { UnifiedSixStarCalculator, calculateStarPersonFromBirthdate } from '../lib/six-star-calculator-unified'

describe('UnifiedSixStarCalculator', () => {
  // 包括的なテストケース
  const testCases = [
    { date: new Date(1969, 5, 7), expected: "火星人+", description: "1969年6月7日" },
    { date: new Date(2000, 8, 22), expected: "金星人+", description: "2000年9月22日" },
    { date: new Date(1972, 5, 14), expected: "水星人-", description: "1972年6月14日" },
    { date: new Date(1985, 3, 15), expected: "木星人-", description: "1985年4月15日" },
    { date: new Date(1995, 11, 25), expected: "土星人+", description: "1995年12月25日" },
    { date: new Date(1989, 6, 10), expected: "土星人-", description: "1989年7月10日" },
  ]

  describe('基本的な計算', () => {
    testCases.forEach(({ date, expected, description }) => {
      test(`should calculate ${description} correctly`, () => {
        const result = calculateStarPersonFromBirthdate(date)
        expect(result).toBe(expected)
      })
    })
  })

  describe('詳細な計算結果', () => {
    test('should provide detailed calculation for 1969年6月7日', () => {
      const date = new Date(1969, 5, 7)
      const result = UnifiedSixStarCalculator.calculate(date)
      
      expect(result.starType).toBe("火星人+")
      expect(result.details.destinyNumber).toBeGreaterThan(0)
      expect(result.details.destinyNumber).toBeLessThanOrEqual(60)
      expect(result.details.starNumber).toBeGreaterThan(0)
      expect(result.details.starNumber).toBeLessThanOrEqual(60)
      expect(result.details.destinyStar).toBe("火星")
      expect(result.details.polarity).toBe("+")
    })

    test('should provide detailed calculation for 2000年9月22日', () => {
      const date = new Date(2000, 8, 22)
      const result = UnifiedSixStarCalculator.calculate(date)
      
      expect(result.starType).toBe("金星人+")
      expect(result.details.destinyNumber).toBeGreaterThan(0)
      expect(result.details.destinyNumber).toBeLessThanOrEqual(60)
      expect(result.details.starNumber).toBeGreaterThan(0)
      expect(result.details.starNumber).toBeLessThanOrEqual(60)
      expect(result.details.destinyStar).toBe("金星")
      expect(result.details.polarity).toBe("+")
    })
  })

  describe('立春調整', () => {
    test('should adjust for Risshun (1月1日)', () => {
      const date = new Date(2000, 0, 1) // 2000年1月1日
      const result = UnifiedSixStarCalculator.calculate(date)
      
      expect(result.details.isAdjusted).toBe(true)
      expect(result.details.adjustedDate.getFullYear()).toBe(1999)
    })

    test('should adjust for Risshun (2月3日)', () => {
      const date = new Date(2000, 1, 3) // 2000年2月3日
      const result = UnifiedSixStarCalculator.calculate(date)
      
      expect(result.details.isAdjusted).toBe(true)
      expect(result.details.adjustedDate.getFullYear()).toBe(1999)
    })

    test('should not adjust for normal dates', () => {
      const date = new Date(2000, 2, 1) // 2000年3月1日
      const result = UnifiedSixStarCalculator.calculate(date)
      
      expect(result.details.isAdjusted).toBe(false)
      expect(result.details.adjustedDate.getFullYear()).toBe(2000)
    })
  })

  describe('運命数の計算', () => {
    test('should calculate destiny number within valid range', () => {
      const testDates = [
        new Date(1969, 5, 7),
        new Date(2000, 8, 22),
        new Date(1972, 5, 14),
        new Date(1985, 3, 15),
        new Date(1995, 11, 25),
      ]

      testDates.forEach(date => {
        const result = UnifiedSixStarCalculator.calculate(date)
        expect(result.details.destinyNumber).toBeGreaterThan(0)
        expect(result.details.destinyNumber).toBeLessThanOrEqual(60)
      })
    })
  })

  describe('星数の計算', () => {
    test('should calculate star number within valid range', () => {
      const testDates = [
        new Date(1969, 5, 7),
        new Date(2000, 8, 22),
        new Date(1972, 5, 14),
        new Date(1985, 3, 15),
        new Date(1995, 11, 25),
      ]

      testDates.forEach(date => {
        const result = UnifiedSixStarCalculator.calculate(date)
        expect(result.details.starNumber).toBeGreaterThan(0)
        expect(result.details.starNumber).toBeLessThanOrEqual(60)
      })
    })
  })

  describe('運命星の決定', () => {
    test('should determine correct destiny star for each range', () => {
      const testCases = [
        { starNumber: 5, expected: "土星" },
        { starNumber: 15, expected: "金星" },
        { starNumber: 25, expected: "火星" },
        { starNumber: 35, expected: "天王星" },
        { starNumber: 45, expected: "木星" },
        { starNumber: 55, expected: "水星" },
      ]

      testCases.forEach(({ starNumber, expected }) => {
        // プライベートメソッドのテストは直接できないため、
        // 実際の日付でテスト
        const date = new Date(2000, 0, starNumber) // 星数が期待値になる日付
        const result = UnifiedSixStarCalculator.calculate(date)
        expect(result.details.destinyStar).toBe(expected)
      })
    })
  })

  describe('陽陰の決定', () => {
    test('should determine correct polarity for yang years', () => {
      const yangYears = [1924, 1926, 1928, 1930, 1932, 1934] // 子、寅、辰、午、申、戌年
      
      yangYears.forEach(year => {
        const date = new Date(year, 5, 15) // 6月15日
        const result = UnifiedSixStarCalculator.calculate(date)
        expect(result.details.polarity).toBe("+")
      })
    })

    test('should determine correct polarity for yin years', () => {
      const yinYears = [1925, 1927, 1929, 1931, 1933, 1935] // 丑、卯、巳、未、酉、亥年
      
      yinYears.forEach(year => {
        const date = new Date(year, 5, 15) // 6月15日
        const result = UnifiedSixStarCalculator.calculate(date)
        expect(result.details.polarity).toBe("-")
      })
    })
  })

  describe('計算の一貫性', () => {
    test('should produce consistent results for same input', () => {
      const date = new Date(2000, 8, 22)
      
      const result1 = calculateStarPersonFromBirthdate(date)
      const result2 = calculateStarPersonFromBirthdate(date)
      const result3 = calculateStarPersonFromBirthdate(date)
      
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
    })

    test('should produce consistent detailed results for same input', () => {
      const date = new Date(2000, 8, 22)
      
      const result1 = UnifiedSixStarCalculator.calculate(date)
      const result2 = UnifiedSixStarCalculator.calculate(date)
      
      expect(result1.starType).toBe(result2.starType)
      expect(result1.details.destinyNumber).toBe(result2.details.destinyNumber)
      expect(result1.details.starNumber).toBe(result2.details.starNumber)
      expect(result1.details.destinyStar).toBe(result2.details.destinyStar)
      expect(result1.details.polarity).toBe(result2.details.polarity)
    })
  })

  describe('エラーハンドリング', () => {
    test('should handle edge cases gracefully', () => {
      const edgeCases = [
        new Date(1900, 0, 1), // 古い年
        new Date(2100, 11, 31), // 未来の年
        new Date(2000, 0, 1), // 1月1日（立春調整）
        new Date(2000, 1, 29), // うるう年の2月29日
      ]

      edgeCases.forEach(date => {
        expect(() => {
          const result = calculateStarPersonFromBirthdate(date)
          expect(result).toBeDefined()
          expect(typeof result).toBe('string')
        }).not.toThrow()
      })
    })
  })

  describe('計算過程の検証', () => {
    test('should provide detailed calculation steps', () => {
      const date = new Date(2000, 8, 22)
      const result = UnifiedSixStarCalculator.calculate(date)
      
      expect(result.details.calculation).toBeDefined()
      expect(Array.isArray(result.details.calculation)).toBe(true)
      expect(result.details.calculation.length).toBeGreaterThan(0)
      
      // 計算過程に必要な要素が含まれているかチェック
      const calculationText = result.details.calculation.join(' ')
      expect(calculationText).toContain('生年月日')
      expect(calculationText).toContain('運命数')
      expect(calculationText).toContain('星数')
      expect(calculationText).toContain('運命星')
      expect(calculationText).toContain('陽陰')
      expect(calculationText).toContain('結果')
    })
  })
})
