import { LoginForm } from '@/components/auth/LoginForm'

/**
 * Login Page
 */
export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            Sign in to continue to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
