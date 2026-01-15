import { RegisterForm } from '@/components/auth/RegisterForm'

/**
 * Register Page
 */
export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Create your account
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            Get started by creating a new account
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
