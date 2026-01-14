import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import type { ReactNode } from 'react'
import { ROUTES } from '@/constants'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <>{children}</>
}
