/**
 * Firestore kotodamaコレクションに言霊データを一括投入するスクリプト
 * 
 * 実行方法:
 * 1. Firebase Service Account Keyを環境変数に設定
 * 2. npx tsx scripts/seed-kotodama.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'

// .env.localファイルを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// 投入する言霊データ
const KOTODAMA_DATA = [
  // 木の要素 (3件)
  {
    phrase_jp: "天に昇る龍の如く",
    advice_text: "迷わず目標を定め、垂直に伸びる大木のように、一途に前進しましょう。周囲との協調も忘れないように。",
    element: "木",
    priority: 10,
  },
  {
    phrase_jp: "新緑の息吹",
    advice_text: "新しい知識や出会いを積極的に求め、自分を刷新する時間を持ちましょう。思考を柔軟に保つことが開運の鍵です。",
    element: "木",
    priority: 9,
  },
  {
    phrase_jp: "生命の根を張る",
    advice_text: "目に見えない場所でこそ、努力を積み重ねるときです。長期的な計画と忍耐が、揺るぎない土台を築きます。",
    element: "木",
    priority: 8,
  },

  // 火の要素 (3件)
  {
    phrase_jp: "太陽の如き輝き",
    advice_text: "あなたの内に秘めた情熱を恐れず外に出し、周囲を温める光となりましょう。笑顔と明るい挨拶が運気を高めます。",
    element: "火",
    priority: 10,
  },
  {
    phrase_jp: "瞬発の閃光",
    advice_text: "直感とインスピレーションを信じ、ためらわずに最初の一歩を踏み出しましょう。速やかな行動がチャンスを掴みます。",
    element: "火",
    priority: 9,
  },
  {
    phrase_jp: "祭りの灯",
    advice_text: "人との交流の場に積極的に参加し、喜びを分かち合いましょう。社交性が、あなたのエネルギーをさらに燃え上がらせます。",
    element: "火",
    priority: 8,
  },

  // 土の要素 (3件)
  {
    phrase_jp: "大地の懐",
    advice_text: "焦らず、足元を固めることを優先しましょう。計画的な貯蓄や、身近な人への感謝を伝えることが安定に繋がります。",
    element: "土",
    priority: 10,
  },
  {
    phrase_jp: "信頼の岩戸",
    advice_text: "周囲の意見を広く受け入れ、人々の中心となりましょう。信頼を積み重ねることで、大きな助けを得ることができます。",
    element: "土",
    priority: 9,
  },
  {
    phrase_jp: "豊穣の恵み",
    advice_text: "蒔いた種は必ず実を結びます。地道な努力を続け、結果が出るまで粘り強く取り組みましょう。地道さが幸運を呼びます。",
    element: "土",
    priority: 8,
  },

  // 金の要素 (3件)
  {
    phrase_jp: "研ぎ澄まされた剣",
    advice_text: "曖昧さを捨て、あなたの信念に基づいて鋭い決断を下しましょう。目標を明確にすることが、成功への最短ルートです。",
    element: "金",
    priority: 10,
  },
  {
    phrase_jp: "財の循環",
    advice_text: "物質的な豊かさだけでなく、心の豊かさも大切に。得たものを他者と分かち合うことで、より大きな富が循環します。",
    element: "金",
    priority: 9,
  },
  {
    phrase_jp: "至高の芸術",
    advice_text: "仕事や趣味において、質の高い仕上がりを目指しましょう。細部にまでこだわる美意識が、あなたに名誉をもたらします。",
    element: "金",
    priority: 8,
  },

  // 水の要素 (3件追加)
  {
    phrase_jp: "流水不腐",
    advice_text: "常に流れ動き続けることで、清らかさを保ち、停滞を避けることができます。今日は新しい変化を恐れず、柔軟に対応しましょう。",
    element: "水",
    priority: 10,
  },
  {
    phrase_jp: "上善如水",
    advice_text: "最高の善は水のようなもの。争わず、低いところに身を置き、すべてを潤します。謙虚な姿勢で人と接しましょう。",
    element: "水",
    priority: 9,
  },
  {
    phrase_jp: "水滴石穿",
    advice_text: "水滴も繰り返せば石を穿ちます。小さな努力の積み重ねが、やがて大きな成果を生み出します。焦らず続けてください。",
    element: "水",
    priority: 8,
  },
]

/**
 * Firestoreクライアントを初期化
 */
function initializeFirestore() {
  const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON
  const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH

  if (!serviceAccountKeyJson && !serviceAccountKeyPath) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY_JSON または FIREBASE_SERVICE_ACCOUNT_KEY_PATH が設定されていません'
    )
  }

  // 既に初期化されている場合は再利用
  const existingApps = getApps()
  if (existingApps.length > 0) {
    return getFirestore(existingApps[0])
  }

  // サービスアカウントキーを読み込む
  let serviceAccount: any
  if (serviceAccountKeyJson) {
    serviceAccount = JSON.parse(serviceAccountKeyJson)
  } else if (serviceAccountKeyPath) {
    const fs = require('fs')
    const keyPath = path.resolve(process.cwd(), serviceAccountKeyPath)
    const keyFile = fs.readFileSync(keyPath, 'utf8')
    serviceAccount = JSON.parse(keyFile)
  }

  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id, // プロジェクトIDを明示的に指定
  })

  // Firestoreインスタンスを取得
  // databaseIdを指定しない場合は "(default)" データベースを使用
  const db = getFirestore(app)
  
  console.log(`✅ Firestore初期化成功: プロジェクト=${serviceAccount.project_id}`)

  return db
}

/**
 * 言霊データを一括投入
 */
async function seedKotodamaData() {
  console.log('🔥 Firestore kotodamaコレクションへのデータ投入を開始します...\n')

  try {
    const db = initializeFirestore()
    const collection = db.collection('kotodama')

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const data of KOTODAMA_DATA) {
      try {
        // データを追加（重複チェックなし - 初回投入用）
        const docRef = await collection.add({
          phrase_jp: data.phrase_jp,
          advice_text: data.advice_text,
          element: data.element,
          priority: data.priority,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        console.log(`✅ 追加成功: "${data.phrase_jp}" (ID: ${docRef.id}, 要素: ${data.element})`)
        successCount++
      } catch (error: any) {
        console.error(`❌ 追加失敗: "${data.phrase_jp}"`)
        console.error(`   エラーコード: ${error.code}`)
        console.error(`   エラーメッセージ: ${error.message}`)
        if (error.code === 5) {
          console.error(`   → データベースが見つかりません。Firebase Consoleでデータベースが正しく作成されているか確認してください。`)
        }
        errorCount++
      }
    }

    console.log('\n📊 投入結果:')
    console.log(`   ✅ 成功: ${successCount} 件`)
    console.log(`   ⏭️  スキップ: ${skipCount} 件`)
    console.log(`   ❌ 失敗: ${errorCount} 件`)
    console.log(`   📝 合計: ${KOTODAMA_DATA.length} 件`)

    // 要素別の件数を確認
    console.log('\n🔍 要素別データ件数:')
    for (const element of ['木', '火', '土', '金', '水']) {
      const snapshot = await collection.where('element', '==', element).get()
      console.log(`   ${element}: ${snapshot.size} 件`)
    }

    console.log('\n🎉 データ投入が完了しました！')
  } catch (error: any) {
    console.error('❌ データ投入中にエラーが発生しました:', error.message)
    process.exit(1)
  }
}

// スクリプトを実行
seedKotodamaData()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 予期しないエラー:', error)
    process.exit(1)
  })

