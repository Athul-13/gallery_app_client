import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Fieldset } from '@headlessui/react'
import { useAuthStore } from '@/store'
import { useNavigate, Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { HiMail } from 'react-icons/hi'
import { FormInput, FormPasswordInput, FormButton } from '@/components/common'

/**
 * Login form validation schema
 * Matches server-side validation requirements
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Login Form Component
 * Uses Headless UI styling patterns with React Hook Form + Zod
 */
export const LoginForm = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password })
      navigate(ROUTES.DASHBOARD)
    } catch {
      // Error is already handled in the store with toast
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-full">
      <Fieldset className="space-y-5 sm:space-y-6 rounded-xl bg-white/5 p-5 sm:p-6 lg:p-10">
        {/* Email Field */}
        <FormInput
          {...registerField('email')}
          label="Email address"
          icon={<HiMail className="h-5 w-5 text-white/60" />}
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          error={errors.email?.message}
        />

        {/* Password Field */}
        <FormPasswordInput
          {...registerField('password')}
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          autoComplete="current-password"
        />

        {/* Submit Button */}
        <FormButton isLoading={isLoading} loadingText="Signing in...">
          Sign in
        </FormButton>

        {/* Link to Register */}
        <div className="text-center text-sm">
          <span className="text-white/50">Don't have an account? </span>
          <Link
            to={ROUTES.REGISTER}
            className="font-medium text-white hover:text-white/80 transition-colors"
          >
            Create account
          </Link>
        </div>
      </Fieldset>
    </form>
  )
}
