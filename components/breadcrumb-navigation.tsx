import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbNavigation({ items }: BreadcrumbNavigationProps) {
  return (
    <nav aria-label="パンくずリスト" className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
        <span className="sr-only">ホーム</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.name}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
