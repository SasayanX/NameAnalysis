/**
 * Firestoreクライアントの初期化とヘルパー関数
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let firestoreInstance: Firestore | null = null
let firebaseApp: App | null = null

/**
 * Firestoreクライアントを取得
 * 環境変数からサービスアカウントキーを読み込む
 */
export function getFirestoreClient(): Firestore | null {
  if (firestoreInstance) {
    return firestoreInstance
  }

  // 環境変数の確認
  const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH
  const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON

  if (!serviceAccountKeyPath && !serviceAccountKeyJson) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Firebase Service Account Keyが設定されていません。Firestore機能は無効化されます。')
      console.warn('   設定するには: FIREBASE_SERVICE_ACCOUNT_KEY_PATH または FIREBASE_SERVICE_ACCOUNT_KEY_JSON を .env.local に追加してください')
    }
    return null
  }

  try {
    // 既に初期化されている場合は再利用
    const existingApps = getApps()
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0]
      firestoreInstance = getFirestore(firebaseApp)
      return firestoreInstance
    }

    // サービスアカウントキーを読み込む
    let serviceAccount: any
    if (serviceAccountKeyJson) {
      // JSON文字列から直接読み込む
      serviceAccount = JSON.parse(serviceAccountKeyJson)
    } else if (serviceAccountKeyPath) {
      // ファイルパスから読み込む
      const fs = require('fs')
      const path = require('path')
      const keyPath = path.resolve(process.cwd(), serviceAccountKeyPath)
      const keyFile = fs.readFileSync(keyPath, 'utf8')
      serviceAccount = JSON.parse(keyFile)
    } else {
      return null
    }

    // Firebase Admin SDKを初期化
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
    })

    firestoreInstance = getFirestore(firebaseApp)
    return firestoreInstance
  } catch (error) {
    console.error('❌ Firestore初期化エラー:', error)
    return null
  }
}

/**
 * kotodamaコレクションからデータを取得
 */
export async function getKotodamaData(element?: string): Promise<any[]> {
  const db = getFirestoreClient()
  if (!db) {
    throw new Error('Firestoreクライアントが初期化されていません')
  }

  try {
    let query = db.collection('kotodama')
    
    // 要素でフィルタリング（指定されている場合）
    if (element) {
      query = query.where('element', '==', element) as any
    }
    
    // priorityでソート
    query = query.orderBy('priority', 'desc') as any
    
    const snapshot = await query.get()
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('❌ kotodamaデータ取得エラー:', error)
    throw error
  }
}

/**
 * kotodamaコレクションに新しいデータを追加
 */
export async function createKotodamaData(data: {
  phrase_jp: string
  advice_text: string
  element: '水' | '木' | '火' | '土' | '金'
  priority?: number
}): Promise<string> {
  const db = getFirestoreClient()
  if (!db) {
    throw new Error('Firestoreクライアントが初期化されていません')
  }

  try {
    // 必須フィールドの検証
    if (!data.phrase_jp || !data.advice_text || !data.element) {
      throw new Error('必須フィールドが不足しています: phrase_jp, advice_text, element は必須です')
    }

    // 五行要素の検証
    const validElements = ['水', '木', '火', '土', '金']
    if (!validElements.includes(data.element)) {
      throw new Error(`無効な五行要素です: ${data.element}。有効な値: ${validElements.join(', ')}`)
    }

    // priorityが指定されていない場合は0を設定
    const priority = data.priority !== undefined ? data.priority : 0

    // Firestoreに追加
    const docRef = await db.collection('kotodama').add({
      phrase_jp: data.phrase_jp,
      advice_text: data.advice_text,
      element: data.element,
      priority: priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    console.log(`✅ kotodamaデータを追加しました: ID=${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error('❌ kotodamaデータ作成エラー:', error)
    throw error
  }
}

