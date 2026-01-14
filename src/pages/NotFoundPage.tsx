import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

/**
 * 404 Not Found Page
 */
export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white/80 mb-4">
          Page Not Found
        </h2>
        <p className="text-white/50 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to={ROUTES.HOME}
          className="px-6 py-3 bg-white/10 text-white rounded-md hover:bg-white/15 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
