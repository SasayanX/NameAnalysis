"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, Shield, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export type DisplayNameType = "MASKED" | "NICKNAME"

interface RankingPrivacyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (displayNameType: DisplayNameType, nickname?: string) => void
  realName: string // 鑑定に使用された本名（表示用）
  isLoading?: boolean
}

export function RankingPrivacyModal({
  isOpen,
  onClose,
  onConfirm,
  realName,
  isLoading = false,
}: RankingPrivacyModalProps) {
  const [displayNameType, setDisplayNameType] = useState<DisplayNameType>("MASKED")
  const [nickname, setNickname] = useState("")
  const [nicknameError, setNicknameError] = useState("")

  const handleConfirm = () => {
    if (displayNameType === "NICKNAME") {
      // ニックネームのバリデーション
      const trimmedNickname = nickname.trim()
      if (!trimmedNickname) {
        setNicknameError("ニックネームを入力してください")
        return
      }
      if (trimmedNickname.length > 20) {
        setNicknameError("ニックネームは20文字以内で入力してください")
        return
      }
      onConfirm(displayNameType, trimmedNickname)
    } else {
      onConfirm(displayNameType)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setDisplayNameType("MASKED")
      setNickname("")
      setNicknameError("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            全国ランキングのお名前設定
          </DialogTitle>
          <DialogDescription>
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                ご安心ください。第三者に本名が公開されることはありません。
                <br />
                ご自身がログインして見た場合のみ、マスキングが解除され本名で表示されます。
              </AlertDescription>
            </Alert>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup
            value={displayNameType}
            onValueChange={(value) => {
              setDisplayNameType(value as DisplayNameType)
              setNicknameError("")
            }}
          >
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent">
              <RadioGroupItem value="MASKED" id="masked" className="mt-1" />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="masked"
                  className="flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <User className="h-4 w-4" />
                  【本名で匿名参加する】
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    システム推奨
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground pl-6">
                  鑑定に使用した本名で登録しますが、ランキングには「{realName[0]}★★★」のように
                  姓の頭文字のみが表示されます。
                  <br />
                  あなたがログインして見た場合のみ、本名（{realName}）が表示されます。
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent">
              <RadioGroupItem value="NICKNAME" id="nickname" className="mt-1" />
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor="nickname"
                  className="flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <User className="h-4 w-4" />
                  【ニックネームで参加する】
                </Label>
                <p className="text-sm text-muted-foreground pl-6">
                  ニックネームを入力してランキングに参加します。ニックネームはそのまま表示されます。
                </p>
                {displayNameType === "NICKNAME" && (
                  <div className="pl-6 space-y-2">
                    <Label htmlFor="nickname-input" className="text-sm">
                      ニックネーム（20文字以内）
                    </Label>
                    <Input
                      id="nickname-input"
                      placeholder="例: あかり、たろう、みゆき"
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value)
                        setNicknameError("")
                      }}
                      maxLength={20}
                      className={nicknameError ? "border-red-500" : ""}
                    />
                    {nicknameError && (
                      <p className="text-sm text-red-600">{nicknameError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "登録中..." : "登録する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

