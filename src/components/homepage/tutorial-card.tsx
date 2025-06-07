import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface TutorialCardProps {
  title: string
  description: string
  duration: string
  className?: string
}

export function TutorialCard({
  title,
  description,
  duration,
  className,
}: TutorialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
          {duration}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.div>
  )
}
