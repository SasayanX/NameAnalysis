// 遅延読み込みによる最適化
export class LazyLoader {
  private static loadedModules = new Set<string>()
  private static loadingPromises = new Map<string, Promise<any>>()

  // 動的インポートのメモ化
  static async loadModule<T>(modulePath: string, loader: () => Promise<T>): Promise<T> {
    if (this.loadedModules.has(modulePath)) {
      return loader()
    }

    if (this.loadingPromises.has(modulePath)) {
      return this.loadingPromises.get(modulePath)!
    }

    const loadingPromise = loader()
      .then((module) => {
        this.loadedModules.add(modulePath)
        this.loadingPromises.delete(modulePath)
        return module
      })
      .catch((error) => {
        this.loadingPromises.delete(modulePath)
        throw error
      })

    this.loadingPromises.set(modulePath, loadingPromise)
    return loadingPromise
  }

  // 重いコンポーネントの遅延読み込み
  static async loadHeavyComponent(componentName: string) {
    switch (componentName) {
      case "CompatibilityRadarChart":
        return this.loadModule("compatibility-radar-chart", () => import("@/components/compatibility-radar-chart"))
      case "FortuneFlowDisplay":
        return this.loadModule("fortune-flow-display", () => import("@/components/fortune-flow-display"))
      case "PDFExportButton":
        return this.loadModule("pdf-export-button", () => import("@/components/pdf-export-button"))
      default:
        throw new Error(`Unknown component: ${componentName}`)
    }
  }

  // データの遅延読み込み
  static async loadData(dataType: string) {
    switch (dataType) {
      case "strokeData":
        return this.loadModule("stroke-data", () => import("@/lib/stroke-data/csv-imported-data"))
      case "fortuneData":
        return this.loadModule("fortune-data", () => import("@/lib/fortune-data-custom"))
      default:
        throw new Error(`Unknown data type: ${dataType}`)
    }
  }
}
