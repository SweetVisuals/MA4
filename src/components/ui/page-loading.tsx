import { cn } from "@/lib/utils"

export function PageLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-end gap-1.5 h-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 bg-primary-foreground rounded-full transition-all duration-300 ease-in-out",
                "animate-wave",
                i % 2 === 0 ? "h-8" : "h-12"
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-foreground rounded-full animate-progress"
            style={{
              animationDuration: "2s",
              animationTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)"
            }}
          />
        </div>
      </div>
    </div>
  )
}
