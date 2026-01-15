import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute, PublicRoute } from '@/components/common'
import { ROUTES } from '@/constants'
import { useAuthStore } from '@/store'

// Lazy load page components for code splitting
const HomePage = lazy(() => import('@/pages').then(module => ({ default: module.HomePage })))
const LoginPage = lazy(() => import('@/pages').then(module => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('@/pages').then(module => ({ default: module.RegisterPage })))
const DashboardPage = lazy(() => import('@/pages').then(module => ({ default: module.DashboardPage })))
const NotFoundPage = lazy(() => import('@/pages').then(module => ({ default: module.NotFoundPage })))

/**
 * Loading fallback component for Suspense
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      <p className="mt-4 text-white/60">Loading...</p>
    </div>
  </div>
)

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  // Check authentication status on app initialization
  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - checkAuth is stable from Zustand

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 - Must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App
