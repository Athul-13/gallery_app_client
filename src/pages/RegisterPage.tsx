import { Link } from 'react-router-dom'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ROUTES } from '@/constants'

/**
 * Register Page
 */
export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-white/50">
            Or{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-white hover:text-white/80"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
