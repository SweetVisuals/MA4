import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/auth-context"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}
