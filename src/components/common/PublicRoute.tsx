import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import type { ReactNode } from 'react'
import { ROUTES } from '@/constants'

interface PublicRouteProps {
  children: ReactNode
}

/**
 * Public Route Component
 * 
 * Wraps routes that should only be accessible to unauthenticated users.
 * Redirects to dashboard if user is already authenticated.
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <>{children}</>
}
