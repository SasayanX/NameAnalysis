import { NextRequest, NextResponse } from 'next/server';
import { KanjiFeedbackSystem } from '@/lib/kanji-feedback-system';

// メモリ上でのフィードバックデータ保存（本番環境ではデータベースを使用）
let feedbackSystem: KanjiFeedbackSystem | null = null;

function getFeedbackSystem(): KanjiFeedbackSystem {
  if (!feedbackSystem) {
    feedbackSystem = new KanjiFeedbackSystem();
  }
  return feedbackSystem;
}

export async function POST(request: NextRequest) {
  try {
    const { character, userInput, suggestedStrokeCount, suggestedReading, isOldForm } = await request.json();

    if (!character || !userInput) {
      return NextResponse.json({
        success: false,
        message: '文字とユーザー入力は必須です'
      }, { status: 400 });
    }

    const system = getFeedbackSystem();
    
    // フィードバックの記録
    system.recordFeedback({
      character,
      userInput,
      suggestedStrokeCount,
      suggestedReading,
      isOldForm
    });

    return NextResponse.json({
      success: true,
      message: 'フィードバックを記録しました',
      isUnsupported: system.detectUnsupportedKanji(character)
    });

  } catch (error) {
    console.error('フィードバックAPIエラー:', error);
    return NextResponse.json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const system = getFeedbackSystem();

    if (action === 'stats') {
      // 統計情報の取得
      const stats = system.getFeedbackStats();
      return NextResponse.json({
        success: true,
        stats
      });
    }

    if (action === 'frequent-unsupported') {
      // 頻出未対応漢字の取得
      const threshold = parseInt(searchParams.get('threshold') || '3');
      const frequent = system.getFrequentUnsupportedKanji(threshold);
      return NextResponse.json({
        success: true,
        frequentUnsupported: frequent
      });
    }

    if (action === 'export') {
      // データのエクスポート
      const data = system.exportFeedbackData();
      return NextResponse.json({
        success: true,
        data
      });
    }

    return NextResponse.json({
      success: false,
      message: '無効なアクションです'
    }, { status: 400 });

  } catch (error) {
    console.error('フィードバック取得APIエラー:', error);
    return NextResponse.json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
