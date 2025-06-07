import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function NotFound() {
  const navigate = useNavigate()
  
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">
        User not found
      </p>
      <Button onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </div>
  )
}
