import { NextResponse } from 'next/server'

export async function GET() {
  // Android App Links の Digital Asset Links JSON
  const assetLinks = [
    {
      relation: [
        'delegate_permission/common.handle_all_urls',
        'delegate_permission/common.get_login_creds'
      ],
      target: {
        namespace: 'android_app',
        package_name: 'com.nameanalysis.ai',
        sha256_cert_fingerprints: [
          'B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9',
          'AB6EFC1CC4B1BBB376B4D4F614BAE07AFECC87AFCF64C4FCDFAED2732579AA54'
        ]
      }
    }
  ]

  return NextResponse.json(assetLinks, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

