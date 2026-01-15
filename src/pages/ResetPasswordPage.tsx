import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Fieldset } from '@headlessui/react'
import { useAuthStore } from '@/store'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { HiLockClosed, HiArrowLeft } from 'react-icons/hi'
import { FormPasswordInput, FormButton } from '@/components/common'

/**
 * Reset password form validation schema
 * Matches server-side validation requirements
 */
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * Reset Password Page
 * Allows users to reset their password using a token from the URL
 */
export const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetPassword = useAuthStore((state) => state.resetPassword)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [token, setToken] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      // Redirect to forgot password if no token
      navigate(ROUTES.FORGOT_PASSWORD)
      return
    }
    setToken(tokenParam)
  }, [searchParams, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    try {
      await resetPassword(token, data.newPassword)
      setIsSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 3000)
    } catch {
      // Error is already handled in the store with toast
    }
  }

  if (!token) {
    return null // Will redirect in useEffect
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-0">
        <div className="max-w-md w-full bg-white/5 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-4">
              <HiLockClosed className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-white/70 text-sm sm:text-base">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-md hover:bg-white/15 transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-0">
      <div className="max-w-md w-full">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Create new password
        </h1>

        {/* Description */}
        <p className="text-white/60 text-sm sm:text-base mb-8 leading-relaxed">
          Please enter your new password below. Make sure it's at least 6 characters long.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-full">
          <Fieldset className="space-y-5 sm:space-y-6 rounded-xl bg-white/5 p-5 sm:p-6 lg:p-10">
            {/* New Password Field */}
            <FormPasswordInput
              {...register('newPassword')}
              label="New Password"
              placeholder="Enter your new password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
            />

            {/* Confirm Password Field */}
            <FormPasswordInput
              {...register('confirmPassword')}
              label="Confirm New Password"
              placeholder="Confirm your new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
            />

            {/* Submit Button */}
            <FormButton isLoading={isLoading} loadingText="Resetting password...">
              Reset Password
            </FormButton>

            {/* Link to Login */}
            <div className="text-center text-sm">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 font-medium text-white hover:text-white/80 transition-colors"
              >
                <HiArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </Fieldset>
        </form>
      </div>
    </div>
  )
}
