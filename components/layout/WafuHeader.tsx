import Image from 'next/image'

export function WafuHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Image
                src="/icons/icon-192x192.png"
                alt="まいにちAI姓名判断"
                width={40}
                height={40}
                className="mr-3"
                priority
              />
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                まいにちAI姓名判断
              </h1>
            </div>
          </div>
          
          {/* ナビゲーション */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="/" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                ホーム
              </a>
              <a href="/name-analyzer" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                姓名判断
              </a>
              <a href="/compatibility" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                相性分析
              </a>
              <a href="/premium" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                プレミアム
              </a>
            </div>
          </nav>
          
          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            <button className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200">
              プレミアムにアップグレード
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
