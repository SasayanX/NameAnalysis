"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Award, BookOpen, Users, Mail, MapPin, ExternalLink } from "lucide-react"

export default function SupervisorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">運営者・監修者情報</h1>
          <p className="text-lg text-muted-foreground">
            Google Play公式タロットアプリ「無料タロット占い - 毎日の運勢とカード占い」監修者による姓名判断サービス
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-white">占</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">金雨輝龍</h2>
                <p className="text-lg text-muted-foreground mb-2">（かなうきりゅう）</p>
                <p className="text-muted-foreground mb-4">
                  カナウ四柱推命 代表
                  <br />
                  Google Play公式タロットアプリ「無料タロット占い - 毎日の運勢とカード占い」監修者
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">
                    <Star className="w-3 h-3 mr-1" />
                    横浜の名付け王
                  </Badge>
                  <Badge variant="secondary">
                    <Award className="w-3 h-3 mr-1" />
                    認定鑑定士
                  </Badge>
                  <Badge variant="secondary">
                    <BookOpen className="w-3 h-3 mr-1" />
                    プロ監修
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                プロフィール
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                姓名判断サービスの運営責任者として、確かな占術知識と豊富な鑑定経験をもとに、
                皆様の名前に込められた運勢をお伝えしています。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                「横浜の名付け王」の異名を持ち、数多くの方々の人生の重要な決断をお手伝いしてきました。
                名前の画数に込められた運勢の力を、現代の生活に活かせる形でお伝えしています。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>資格・認定</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  日本占術協会認定四柱推命鑑定士
                </li>
                <li className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  姓名判断鑑定師
                </li>
                <li className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  開運命名師
                </li>
                <li className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  横浜の名付け王
                </li>
                <li className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Google Play公式タロットアプリ監修者
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>専門分野・得意占術</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">四柱推命</h4>
                  <p className="text-muted-foreground text-xs">生年月日から運勢を詳細分析</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">姓名判断</h4>
                  <p className="text-muted-foreground text-xs">名前の画数から運勢を鑑定</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">数秘術</h4>
                  <p className="text-muted-foreground text-xs">数字の持つ神秘的な力を活用</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">手相</h4>
                  <p className="text-muted-foreground text-xs">手のひらから人生を読み解く</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">タロット</h4>
                  <p className="text-muted-foreground text-xs">カードで未来の可能性を探る</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">六星占術</h4>
                  <p className="text-muted-foreground text-xs">運命の流れを的確に把握</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>監修実績・関連サービス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  ■ Google Play公式タロットアプリ「無料タロット占い - 毎日の運勢とカード占い」監修
                  <Badge variant="outline" className="ml-2 text-xs">
                    全世界公開中
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Google Playストアで全世界公開中のタロット占いアプリ「無料タロット占い -
                  毎日の運勢とカード占い」の監修を担当。
                  伝統的なタロットの知識と現代的なアプリ体験を融合させた本格的な占いサービスです。
                </p>
                <a
                  href="https://play.google.com/store/apps/details?id=com.ryuka.kanau_kiryu&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline text-sm"
                >
                  Google Playで見る
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">■ 姓名判断サービス</h3>
                <p className="text-sm text-muted-foreground">
                  名前の画数から運勢を診断する本格的なサービス。
                  伝統的な姓名判断の手法と現代的な分析技術を組み合わせた独自の診断システム。
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">■ 愛車運勢診断</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  車のナンバープレートから運勢を診断するサービス。数字の持つ力を車選びに活用。
                </p>
                <a
                  href="https://car-unsei.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline text-sm"
                >
                  愛車運勢診断サイトへ
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">■ 住まい運勢診断</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  住所の数字から運勢を診断する独自のサービス。81画理論に基づく本格的な住所診断システム。
                </p>
                <a
                  href="https://ie-unsei.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline text-sm"
                >
                  住まい運勢診断サイトへ
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>お問い合わせ先</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-semibold">メールアドレス</p>
                  <a href="mailto:kanaukiryu@gmail.com" className="text-blue-600 hover:underline">
                    kanaukiryu@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-semibold">活動拠点</p>
                  <p className="text-muted-foreground">神奈川県横浜市</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>サイト運営方針</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                当姓名判断サービスは、古来より伝わる姓名判断の伝統的手法と現代のデータ分析技術を結びつけ、
                皆様の名前に込められた運勢をお伝えすることを目的としています。
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                名前に含まれる文字の画数の持つ意味を伝統的な理論に基づいて分析し、
                科学的根拠と伝統的な占術知識を組み合わせた独自の診断システムを提供しています。
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                すべての情報は、長年の鑑定経験と専門知識に基づいて作成されており、
                ユーザーの皆様に価値ある情報をお届けできるよう日々努めています。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
