import { Card } from "@/components/ui/card"

export function TimetableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16">
                <div className="h-6 w-8 bg-muted animate-pulse rounded mx-auto" />
                <div className="h-3 w-12 bg-muted animate-pulse rounded mx-auto mt-2" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full max-w-md bg-muted animate-pulse rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
