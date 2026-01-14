import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

/**
 * 404 Not Found Page
 */
export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-white/80 mb-4">
          Page Not Found
        </h2>
        <p className="text-sm sm:text-base text-white/50 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to={ROUTES.HOME}
          className="inline-block px-6 py-3.5 sm:py-3 text-base sm:text-base bg-white/10 text-white rounded-md hover:bg-white/15 active:bg-white/20 transition-colors min-h-[44px] touch-manipulation"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
