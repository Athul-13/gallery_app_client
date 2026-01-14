import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Description, Field, Fieldset, Input, Label, Legend } from '@headlessui/react'
import { useAuthStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { HiMail, HiPhone, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi'
import { useState } from 'react'
import clsx from 'clsx'

/**
 * Registration form validation schema
 */
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Register Form Component
 * Uses Headless UI styling patterns with React Hook Form + Zod
 */
export const RegisterForm = () => {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data)
      navigate(ROUTES.DASHBOARD)
    } catch {
      // Error is already handled in the store with toast
    }
  }

  // Shared input classes
  const baseInputClasses = 'block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 pl-10 text-sm/6 text-white placeholder:text-white/50'
  const focusClasses = 'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
  const errorClasses = 'ring-1 ring-red-500/50 data-focus:ring-red-500 data-focus:outline-red-500/50'
  const iconContainerClasses = 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'
  const iconClasses = 'h-5 w-5 text-white/60'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
      <Fieldset className="space-y-6 rounded-xl bg-white/5 p-6 sm:p-10">
        <Legend className="text-base/7 font-semibold text-white">Create your account</Legend>
        
        {/* Email Field */}
        <Field>
          <Label className="text-sm/6 font-medium text-white">Email address</Label>
          <div className="relative mt-3">
            <div className={iconContainerClasses}>
              <HiMail className={iconClasses} />
            </div>
            <Input
              {...registerField('email')}
              type="email"
              autoComplete="email"
              className={clsx(
                baseInputClasses,
                'pr-3',
                focusClasses,
                errors.email && errorClasses
              )}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <Description className="mt-1 text-sm/6 text-red-400">
              {errors.email.message}
            </Description>
          )}
        </Field>

        {/* Phone Field */}
        <Field>
          <Label className="text-sm/6 font-medium text-white">Phone number</Label>
          <div className="relative mt-3">
            <div className={iconContainerClasses}>
              <HiPhone className={iconClasses} />
            </div>
            <Input
              {...registerField('phone')}
              type="tel"
              autoComplete="tel"
              className={clsx(
                baseInputClasses,
                'pr-3',
                focusClasses,
                errors.phone && errorClasses
              )}
              placeholder="Enter your phone"
            />
          </div>
          {errors.phone && (
            <Description className="mt-1 text-sm/6 text-red-400">
              {errors.phone.message}
            </Description>
          )}
        </Field>

        {/* Password Field */}
        <Field>
          <Label className="text-sm/6 font-medium text-white">Password</Label>
          <div className="relative mt-3">
            <div className={iconContainerClasses}>
              <HiLockClosed className={iconClasses} />
            </div>
            <Input
              {...registerField('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={clsx(
                baseInputClasses,
                'pr-10',
                focusClasses,
                errors.password && errorClasses
              )}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <HiEyeOff className="h-5 w-5 text-white/60 hover:text-white/80" />
              ) : (
                <HiEye className="h-5 w-5 text-white/60 hover:text-white/80" />
              )}
            </button>
          </div>
          {errors.password && (
            <Description className="mt-1 text-sm/6 text-red-400">
              {errors.password.message}
            </Description>
          )}
        </Field>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              'w-full rounded-lg bg-white/10 px-3 py-2 text-sm/6 font-semibold text-white shadow-sm',
              'hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/25',
              'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            )}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </Fieldset>
    </form>
  )
}
