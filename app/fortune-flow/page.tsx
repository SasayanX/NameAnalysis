"use client"

import FortuneFlowDisplay from "@/components/FortuneFlowDisplay"

export default function FortuneFlowPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Fortune Flow</h1>

        <p className="mt-3 text-2xl">Visualize your fortune flow.</p>

        <div className="mt-6">
          <FortuneFlowDisplay />
        </div>
      </main>
    </div>
  )
}
