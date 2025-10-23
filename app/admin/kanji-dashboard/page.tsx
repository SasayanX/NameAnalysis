"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface KanjiStats {
  totalKanji: number;
  joyoKanji: number;
  jinmeiKanji: number;
  kyuujitaiKanji: number;
  lastUpdated: string;
}

interface FeedbackStats {
  totalFeedback: number;
  uniqueKanji: number;
  frequentUnsupported: number;
}

interface UnsupportedKanji {
  character: string;
  firstReported: string;
  lastReported: string;
  reportCount: number;
  suggestions: Array<{
    strokeCount?: number;
    reading?: string;
    isOldForm?: boolean;
    confidence: number;
  }>;
}

export default function KanjiDashboard() {
  const [kanjiStats, setKanjiStats] = useState<KanjiStats | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [frequentUnsupported, setFrequentUnsupported] = useState<UnsupportedKanji[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 統計情報の取得
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/kanji-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-stats' })
      });
      
      const data = await response.json();
      if (data.success) {
        setKanjiStats(data.stats);
      }
    } catch (error) {
      console.error('統計情報取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // フィードバック統計の取得
  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch('/api/kanji-feedback?action=stats');
      const data = await response.json();
      if (data.success) {
        setFeedbackStats(data.stats);
      }
    } catch (error) {
      console.error('フィードバック統計取得エラー:', error);
    }
  };

  // 頻出未対応漢字の取得
  const fetchFrequentUnsupported = async () => {
    try {
      const response = await fetch('/api/kanji-feedback?action=frequent-unsupported&threshold=3');
      const data = await response.json();
      if (data.success) {
        setFrequentUnsupported(data.frequentUnsupported);
      }
    } catch (error) {
      console.error('頻出未対応漢字取得エラー:', error);
    }
  };

  // 一括インポート実行（外部データソースから）
  const handleBulkImport = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      console.log('🚀 外部データソースから一括インポート開始...');
      
      const response = await fetch('/api/admin/kanji-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-import' })
      });
      
      const data = await response.json();
      console.log('📊 API応答:', data);
      
      if (data.success) {
        const { summary } = data.result;
        setMessage(`✅ 外部データソースからの一括インポート完了！合計: ${summary.total}件 (新規: ${summary.new}件, 更新: ${summary.updated}件, エラー: ${summary.errorCount}件)`);
        await fetchStats(); // 統計情報を更新
      } else {
        setMessage(`❌ インポートエラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 旧字体データの一括インポート実行
  const handleKyuujitaiImport = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      console.log('🚀 旧字体データの一括インポート開始...');
      
      const response = await fetch('/api/admin/kanji-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'kyuujitai-import' })
      });
      
      const data = await response.json();
      console.log('📊 旧字体データAPI応答:', data);
      
      if (data.success) {
        const { summary } = data.result;
        setMessage(`✅ 旧字体データの一括インポート完了！合計: ${summary.total}件 (新規: ${summary.new}件, 更新: ${summary.updated}件, エラー: ${summary.errorCount}件)`);
        await fetchStats(); // 統計情報を更新
      } else {
        setMessage(`❌ 旧字体データインポートエラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFeedbackStats();
    fetchFrequentUnsupported();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">漢字データ管理ダッシュボード</h1>
        <p className="text-muted-foreground">漢字データの一括インポートとフィードバック管理</p>
      </div>

      {message && (
        <Alert className="mb-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="import">インポート</TabsTrigger>
          <TabsTrigger value="feedback">フィードバック</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総漢字数</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kanjiStats?.totalKanji || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  登録済み漢字
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">常用漢字</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kanjiStats?.joyoKanji || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  常用漢字表
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">人名用漢字</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kanjiStats?.jinmeiKanji || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  人名用漢字表
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">旧字体対応</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kanjiStats?.kyuujitaiKanji || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  旧字体対応済み
                </p>
              </CardContent>
            </Card>
          </div>

          {feedbackStats && (
            <Card>
              <CardHeader>
                <CardTitle>フィードバック統計</CardTitle>
                <CardDescription>ユーザーからのフィードバック情報</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{feedbackStats.totalFeedback}</div>
                    <div className="text-sm text-muted-foreground">総フィードバック数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{feedbackStats.uniqueKanji}</div>
                    <div className="text-sm text-muted-foreground">対象漢字数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{feedbackStats.frequentUnsupported}</div>
                    <div className="text-sm text-muted-foreground">頻出未対応漢字</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>漢字データ一括インポート</CardTitle>
              <CardDescription>
                常用漢字・人名用漢字の基本データと旧字体対応テーブルを一括インポートします
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  onClick={handleBulkImport} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      外部データソースからインポート中...
                    </>
                  ) : (
                    '外部データソースから一括インポート'
                  )}
                </Button>
                
                <Button 
                  onClick={handleKyuujitaiImport} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      旧字体データをインポート中...
                    </>
                  ) : (
                    '旧字体データを一括インポート'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>頻出未対応漢字</CardTitle>
              <CardDescription>
                ユーザーから3回以上報告された未対応漢字（優先度順）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frequentUnsupported.map((kanji, index) => (
                  <div key={kanji.character} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div className="text-2xl font-bold">{kanji.character}</div>
                      <div className="text-sm text-muted-foreground">
                        報告回数: {kanji.reportCount}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {kanji.suggestions.map((suggestion, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          {suggestion.strokeCount && (
                            <Badge variant="outline">{suggestion.strokeCount}画</Badge>
                          )}
                          {suggestion.reading && (
                            <Badge variant="outline">{suggestion.reading}</Badge>
                          )}
                          {suggestion.isOldForm && (
                            <Badge variant="outline">旧字体</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {frequentUnsupported.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    頻出未対応漢字はありません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
