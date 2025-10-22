// 入力値検証の統一
import { ValidationError } from "./error-handling"
import type { NameAnalysisInput } from "@/types/core"

export function validateNameInput(input: Partial<NameAnalysisInput>): NameAnalysisInput {
  const errors: string[] = []

  // 姓の検証
  if (!input.lastName || typeof input.lastName !== "string") {
    errors.push("姓が入力されていません")
  } else if (input.lastName.trim().length === 0) {
    errors.push("姓を入力してください")
  } else if (input.lastName.trim().length > 10) {
    errors.push("姓は10文字以内で入力してください")
  }

  // 名の検証
  if (!input.firstName || typeof input.firstName !== "string") {
    errors.push("名が入力されていません")
  } else if (input.firstName.trim().length === 0) {
    errors.push("名を入力してください")
  } else if (input.firstName.trim().length > 10) {
    errors.push("名は10文字以内で入力してください")
  }

  // 性別の検証
  if (!input.gender || !["male", "female"].includes(input.gender)) {
    errors.push("性別を選択してください")
  }

  // 生年月日の検証（オプション）
  if (input.birthdate) {
    const date = new Date(input.birthdate)
    if (isNaN(date.getTime())) {
      errors.push("正しい生年月日を入力してください")
    } else {
      const now = new Date()
      const minDate = new Date(1900, 0, 1)
      if (date > now) {
        errors.push("生年月日は現在より前の日付を入力してください")
      } else if (date < minDate) {
        errors.push("生年月日は1900年以降を入力してください")
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "))
  }

  return {
    lastName: input.lastName!.trim(),
    firstName: input.firstName!.trim(),
    gender: input.gender as "male" | "female",
    birthdate: input.birthdate,
  }
}

export function validateStrokeCount(strokes: number, context: string): number {
  if (!Number.isInteger(strokes) || strokes < 0) {
    throw new ValidationError(`${context}の画数が不正です: ${strokes}`)
  }
  if (strokes > 100) {
    throw new ValidationError(`${context}の画数が異常に大きいです: ${strokes}`)
  }
  return strokes
}

export function validateFortuneData(data: any): boolean {
  if (!data || typeof data !== "object") {
    return false
  }

  // 必須フィールドの確認
  const requiredFields = ["運勢", "説明"]
  return requiredFields.every((field) => field in data && typeof data[field] === "string")
}
