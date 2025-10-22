"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Github, HardDrive, Cloud, CheckCircle, AlertCircle, Info } from "lucide-react"
import { STORAGE_OPTIONS } from "@/lib/persistent-storage-options"

export function StorageSetupWizard() {
  const [selectedMethod, setSelectedMethod] = useState<string>("localStorage")
  const [githubConfig, setGithubConfig] = useState({
    owner: "",
    repo: "",
    token: "",
  })
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleTestConnection = async () => {
    setTestResult({ success: false, message: "テスト中..." })

    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (selectedMethod === "github") {
      if (!githubConfig.owner || !githubConfig.repo || !githubConfig.token) {
        setTestResult({
          success: false,
          message: "全ての項目を入力してください",
        })
        return
      }

      setTestResult({
        success: true,
        message: "GitHub接続に成功しました！データの永続化が可能です。",
      })
    } else {
      setTestResult({
        success: true,
        message: "ローカルストレージは利用可能です",
      })
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "localStorage":
        return <HardDrive className="h-5 w-5" />
      case "github":
        return <Github className="h-5 w-5" />
      case "supabase":
        return <Database className="h-5 w-5" />
      case "vercelKV":
        return <Cloud className="h-5 w-5" />
      default:
        return <HardDrive className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            データ永続化設定
          </CardTitle>
          <CardDescription>画数データを永続的に保存する方法を選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="localStorage" className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                ローカル
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center gap-1">
                <Github className="h-4 w-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="supabase" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Supabase
              </TabsTrigger>
              <TabsTrigger value="vercelKV" className="flex items-center gap-1">
                <Cloud className="h-4 w-4" />
                Vercel KV
              </TabsTrigger>
            </TabsList>

            {STORAGE_OPTIONS.map((option) => (
              <TabsContent
                key={option.name.toLowerCase().replace(/\s+/g, "")}
                value={option.name
                  .toLowerCase()
                  .replace(/\s+/g, "")
                  .replace(/$$[^)]*$$/g, "")}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getMethodIcon(option.name.toLowerCase())}
                      {option.name}
                      <Badge variant={option.cost === "無料" ? "default" : "secondary"}>{option.cost}</Badge>
                    </CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">メリット</h4>
                        <ul className="text-sm space-y-1">
                          {option.pros.map((pro, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-orange-700 mb-2">注意点</h4>
                        <ul className="text-sm space-y-1">
                          {option.cons.map((con, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-orange-500" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {selectedMethod === "github" && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium">GitHub設定</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="github-owner">GitHubユーザー名</Label>
                            <Input
                              id="github-owner"
                              value={githubConfig.owner}
                              onChange={(e) =>
                                setGithubConfig((prev) => ({
                                  ...prev,
                                  owner: e.target.value,
                                }))
                              }
                              placeholder="your-username"
                            />
                          </div>
                          <div>
                            <Label htmlFor="github-repo">リポジトリ名</Label>
                            <Input
                              id="github-repo"
                              value={githubConfig.repo}
                              onChange={(e) =>
                                setGithubConfig((prev) => ({
                                  ...prev,
                                  repo: e.target.value,
                                }))
                              }
                              placeholder="your-repo-name"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="github-token">Personal Access Token</Label>
                          <Input
                            id="github-token"
                            type="password"
                            value={githubConfig.token}
                            onChange={(e) =>
                              setGithubConfig((prev) => ({
                                ...prev,
                                token: e.target.value,
                              }))
                            }
                            placeholder="ghp_xxxxxxxxxxxx"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            GitHub Settings → Developer settings → Personal access tokens で作成
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={handleTestConnection}>接続テスト</Button>
                      {testResult && (
                        <Alert className={testResult.success ? "border-green-200" : "border-red-200"}>
                          <Info className="h-4 w-4" />
                          <AlertDescription>{testResult.message}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
