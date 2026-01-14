import { Link } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { ROUTES } from '@/constants'

/**
 * Login Page
 */
export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-white/50">
            Or{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-white hover:text-white/80"
            >
              create a new account
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
