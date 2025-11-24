/**
 * お問い合わせフォームAPI
 * Resendを使用してメール送信
 */
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, category, message } = body

    console.log('📧 お問い合わせ受信:', { name, email, subject, category })

    // バリデーション
    if (!name || !email || !subject || !message) {
      console.warn('⚠️ バリデーションエラー: 必須項目が不足しています', { name, email, subject, message })
      return NextResponse.json(
        { success: false, error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // メール送信先（管理者）
    // ⚠️ 重要: Resendの未認証ドメインでは、Resendアカウントのメールアドレスにのみ送信可能
    // ドメイン認証が完了していない場合は、CONTACT_EMAILをResendアカウントのメールアドレスに設定してください
    // 現状の運用: ドメイン認証を待たずに運用するため、管理者通知のみ送信を試みます
    const adminEmail = process.env.CONTACT_EMAIL || 'kanaukiryu@gmail.com'
    
    // ドメイン認証が失敗している場合は、Resendのデフォルトアドレスを使用
    // 独自ドメイン（seimei.app）が認証済みの場合は、RESEND_FROM_EMAIL に設定されたアドレスを使用
    // 現状の運用: ドメイン認証が完了していないため、onboarding@resend.devを使用
    const fromEmail = 'onboarding@resend.dev'
    
    console.log('📧 メール送信設定:', { 
      fromEmail, 
      adminEmail, 
      hasResendApiKey: !!process.env.RESEND_API_KEY,
      hasCustomFromEmail: !!process.env.RESEND_FROM_EMAIL 
    })

    // Resendが設定されていない場合は、フォームデータをログに記録
    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 お問い合わせ（Resend未設定）:', {
        name,
        email,
        phone,
        subject,
        category,
        message,
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json({
        success: true,
        message: 'お問い合わせを受け付けました（開発モード: メール送信はスキップされました）',
      })
    }

    console.log('📧 Resendを使用してメール送信を開始:', { fromEmail, adminEmail })

    // 管理者への通知メール
    const emailSubject = `【お問い合わせ】${subject} - ${category || '一般的なお問い合わせ'}`
    const emailBody = `
以下のお問い合わせを受け付けました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【お問い合わせ種別】
${getCategoryLabel(category)}

【件名】
${subject}

【お名前】
${name}

【メールアドレス】
${email}

【電話番号】
${phone || '未入力'}

【お問い合わせ内容】
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
受信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
`

    // 管理者へのメール送信
    // ⚠️ 現状の運用: ドメイン認証が完了していないため、管理者通知のみ送信を試みます
    // 送信に失敗しても、フォームデータをログに記録してフォーム送信は成功として扱います
    let adminNotifySuccess = false
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: emailSubject,
        text: emailBody,
      })

      if (error) {
        console.error('❌ Resendメール送信エラー:', JSON.stringify(error, null, 2))
        console.warn('⚠️ 管理者への通知メール送信に失敗しましたが、フォームデータをログに記録して処理を継続します')
      } else {
        adminNotifySuccess = true
        console.log('✅ 管理者へのメール送信成功:', data)
      }
    } catch (sendError: any) {
      console.error('❌ Resendメール送信例外:', sendError)
      console.warn('⚠️ 管理者への通知メール送信に失敗しましたが、フォームデータをログに記録して処理を継続します')
    }

    // フォームデータを必ずログに記録（管理者通知が失敗した場合のバックアップ）
    console.log('📧 お問い合わせデータ（ログ記録）:', {
      name,
      email,
      phone,
      subject,
      category,
      message,
      timestamp: new Date().toISOString(),
      adminNotifySuccess,
    })

    // ユーザーへの自動返信メール
    // ⚠️ 現状の運用: ドメイン認証が完了していないため、未認証ドメインからはユーザーへの自動返信は送信不可
    // エラーを出さずに静かにスキップします
    // ユーザーには「お問い合わせを受け付けました」というメッセージを表示します
    if (process.env.SEND_AUTO_REPLY !== 'false') {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: '【まいにち姓名判断】お問い合わせを受け付けました',
          text: `
${name} 様

この度は、まいにち姓名判断にお問い合わせいただき、誠にありがとうございます。

以下の内容でお問い合わせを受け付けました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【件名】
${subject}

【お問い合わせ内容】
${message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3営業日以内にご返信いたします。
しばらくお待ちください。

※このメールは自動返信です。ご返信はできません。
ご不明な点がございましたら、改めてお問い合わせください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
まいにち姓名判断
https://seimei.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
        })
        console.log('✅ ユーザーへの自動返信メール送信成功')
      } catch (autoReplyError: any) {
        // 未認証ドメインでは、ユーザーへの自動返信は送信不可
        // これは想定内の動作なので、エラーを出さずにログに記録するだけ
        console.log('ℹ️ 自動返信メールの送信をスキップしました（ドメイン認証未完了のため）:', autoReplyError.message)
        // フォーム送信自体は成功として扱う（管理者通知は成功している可能性がある）
      }
    }

    // フォーム送信は常に成功として扱います
    // 管理者通知が成功したかどうかは、ログで確認できます
    return NextResponse.json({
      success: true,
      message: 'お問い合わせを受け付けました。3営業日以内にご返信いたします。',
      // 開発環境でのみ、管理者通知の成功/失敗を返す
      ...(process.env.NODE_ENV === 'development' && {
        adminNotifySuccess,
      }),
    })
  } catch (error: any) {
    console.error('❌ お問い合わせ処理エラー:', error)
    console.error('❌ エラー詳細:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'お問い合わせの処理に失敗しました。',
        details: process.env.NODE_ENV === 'development' ? { 
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : undefined
      },
      { status: 500 }
    )
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    general: '一般的なお問い合わせ',
    technical: '技術的な問題',
    billing: '料金・課金について',
    refund: '返金・解約について',
    feature: '機能追加の要望',
    bug: 'バグ報告',
    other: 'その他',
  }
  return labels[category] || category || '未選択'
}

