import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Fieldset } from '@headlessui/react'
import { useAuthStore } from '@/store'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { HiMail, HiArrowLeft } from 'react-icons/hi'
import { FormInput, FormButton } from '@/components/common'

/**
 * Request password reset form validation schema
 * Matches server-side validation requirements
 */
const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
})

type RequestPasswordResetFormData = z.infer<typeof requestPasswordResetSchema>

/**
 * Forgot Password Page
 * Allows users to request a password reset
 */
export const ForgotPasswordPage = () => {
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (data: RequestPasswordResetFormData) => {
    try {
      await requestPasswordReset(data.email)
      setIsSubmitted(true)
    } catch {
      // Error is already handled in the store with toast
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-0">
        <div className="max-w-md w-full bg-white/5 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-4">
              <HiMail className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Check your email
            </h1>
            <p className="text-white/70 text-sm sm:text-base">
              If an account exists with that email, we've sent you a password reset link.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-md hover:bg-white/15 transition-colors"
            >
              <HiArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-0">
      <div className="max-w-md w-full">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Forgot your password?
        </h1>

        {/* Description */}
        <p className="text-white/60 text-sm sm:text-base mb-8 leading-relaxed">
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-full">
          <Fieldset className="space-y-5 sm:space-y-6 rounded-xl bg-white/5 p-5 sm:p-6 lg:p-10">
            {/* Email Field */}
            <FormInput
              {...register('email')}
              label="Email address"
              icon={<HiMail className="h-5 w-5 text-white/60" />}
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              error={errors.email?.message}
            />

            {/* Submit Button */}
            <FormButton isLoading={isLoading} loadingText="Sending reset link...">
              Send reset link
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
