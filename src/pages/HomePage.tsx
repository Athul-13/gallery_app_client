import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/constants'

export const HomePage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl shadow-xl p-8 sm:p-12 text-center">
        {/* Badge */}
        <span className="inline-block mb-4 px-4 py-1 text-sm font-medium text-white/80 bg-white/10 rounded-full">
          Image Management Made Simple
        </span>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Welcome to Galley
        </h1>

        {/* Description */}
        <p className="text-white/70 text-lg mb-10 leading-relaxed">
          Organize, store, and manage your images securely — all in one place.
        </p>

        {/* Actions */}
        {isAuthenticated ? (
          <Link
            to={ROUTES.DASHBOARD}
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-white/10 rounded-lg hover:bg-white/15 transition transform hover:-translate-y-0.5 shadow-md"
          >
            Go to Dashboard →
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ROUTES.LOGIN}
              className="px-8 py-3 text-lg font-semibold text-white bg-white/10 rounded-lg hover:bg-white/15 transition shadow-md"
            >
              Login
            </Link>

            <Link
              to={ROUTES.REGISTER}
              className="px-8 py-3 text-lg font-semibold text-white bg-white/5 rounded-lg hover:bg-white/10 transition border border-white/10"
            >
              Create Account
            </Link>
          </div>
        )}

        {/* Footer hint */}
        {!isAuthenticated && (
          <p className="mt-8 text-sm text-white/50">
            Free to get started · Secure · Fast
          </p>
        )}
      </div>
    </div>
  )
}

