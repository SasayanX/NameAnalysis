import { NextRequest, NextResponse } from 'next/server';
import { KanjiBulkImporter, bulkImportKanjiData } from '@/lib/kanji-bulk-import';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'bulk-import') {
      // 外部データソースから一括インポート実行
      console.log('🚀 外部データソースから一括インポート開始...');
      
      try {
        const result = await bulkImportKanjiData();
        console.log('✅ 一括インポート完了:', result);

        return NextResponse.json({
          success: true,
          result: {
            totalImported: result.totalImported,
            newKanji: result.newKanji,
            updatedKanji: result.updatedKanji,
            errors: result.errors,
            summary: {
              total: result.totalImported,
              new: result.newKanji,
              updated: result.updatedKanji,
              errorCount: result.errors.length
            }
          },
          message: '漢字データの一括インポートが完了しました'
        });
      } catch (error) {
        console.error('❌ 一括インポートエラー:', error);
        return NextResponse.json({
          success: false,
          message: '一括インポート中にエラーが発生しました',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    if (action === 'kyuujitai-import') {
      // 旧字体データの一括インポート実行
      console.log('🚀 旧字体データの一括インポート開始...');
      
      try {
        const result = await bulkImportKanjiData();
        console.log('✅ 旧字体データ一括インポート完了:', result);

        return NextResponse.json({
          success: true,
          result: {
            totalImported: result.totalImported,
            newKanji: result.newKanji,
            updatedKanji: result.updatedKanji,
            errors: result.errors,
            summary: {
              total: result.totalImported,
              new: result.newKanji,
              updated: result.updatedKanji,
              errorCount: result.errors.length
            }
          },
          message: '旧字体データの一括インポートが完了しました'
        });
      } catch (error) {
        console.error('❌ 旧字体データ一括インポートエラー:', error);
        return NextResponse.json({
          success: false,
          message: '旧字体データ一括インポート中にエラーが発生しました',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    if (action === 'get-stats') {
      // 統計情報の取得
      const importer = new KanjiBulkImporter();
      const data = importer.getImportedData();

      const stats = {
        totalKanji: data.length,
        joyoKanji: data.filter(k => k.category === 'joyo').length,
        jinmeiKanji: data.filter(k => k.category === 'jinmei').length,
        kyuujitaiKanji: data.filter(k => k.oldForm).length,
        lastUpdated: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        stats,
        message: '統計情報を取得しました'
      });
    }

    return NextResponse.json({
      success: false,
      message: '無効なアクションです'
    }, { status: 400 });

  } catch (error) {
    console.error('漢字インポートAPIエラー:', error);
    return NextResponse.json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
