import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

export function UserProfileRedirect() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user) {
      const target = `/user/${user.user_metadata?.username || 'profile'}`
      navigate(target, { 
        replace: true,
        state: { from: location.pathname }
      })
    }
  }, [user, navigate, location])

  return null
}
