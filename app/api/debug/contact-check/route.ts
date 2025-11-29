import { NextResponse } from 'next/server'

/**
 * お問い合わせフォームAPIの設定状態を確認するデバッグエンドポイント
 */
export async function GET() {
  const resendApiKey = process.env.RESEND_API_KEY
  const contactEmail = process.env.CONTACT_EMAIL || 'kanaukiryu@gmail.com'
  const sendAutoReply = process.env.SEND_AUTO_REPLY !== 'false'
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  const config = {
    nodeEnv: process.env.NODE_ENV,
    resend: {
      apiKeyExists: !!resendApiKey,
      apiKeyLength: resendApiKey?.length || 0,
      apiKeyPrefix: resendApiKey ? resendApiKey.substring(0, 10) + '...' : 'N/A',
    },
    email: {
      contactEmail,
      fromEmail,
      sendAutoReply,
      hasCustomFromEmail: !!process.env.RESEND_FROM_EMAIL,
    },
  }

  return NextResponse.json({
    success: true,
    config,
    message: config.resend.apiKeyExists
      ? '✅ RESEND_API_KEY が設定されています'
      : '❌ RESEND_API_KEY が設定されていません',
    recommendations: config.resend.apiKeyExists
      ? []
      : [
          'Netlify Dashboard > Site settings > Environment variables で RESEND_API_KEY を設定してください',
          '環境変数を追加した後、再デプロイが必要です（Deploys > Trigger deploy > Deploy site）',
          '環境変数のスコープが Production になっているか確認してください',
          'ResendのAPIキーは https://resend.com/api-keys で作成できます',
        ],
  })
}
