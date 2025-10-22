import { FortuneSymbolsGuide } from "@/components/fortune-symbols-guide"

export default function FortuneSymbolsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">六星占術の運気記号</h1>
      <p className="mb-8">
        六星占術では、運気を6種類の記号で表現します。それぞれの記号には意味があり、その時期にどのように行動すべきかの指針となります。
      </p>
      <FortuneSymbolsGuide />
    </div>
  )
}
