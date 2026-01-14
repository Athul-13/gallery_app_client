import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Fieldset } from '@headlessui/react'
import { useAuthStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { HiMail, HiPhone } from 'react-icons/hi'
import { FormInput, FormPasswordInput, FormButton } from '@/components/common'

/**
 * Registration form validation schema
 * Matches server-side validation requirements
 */
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone number must be at least 10 characters')
    .max(15, 'Phone number must be at most 15 characters')
    .regex(/^[\d\s\-+()]+$/, 'Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character'),
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

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', 
    reValidateMode: 'onChange', 
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data)
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

        {/* Phone Field */}
        <FormInput
          {...registerField('phone')}
          label="Phone number"
          icon={<HiPhone className="h-5 w-5 text-white/60" />}
          type="tel"
          autoComplete="tel"
          placeholder="Enter your phone"
          error={errors.phone?.message}
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            // Only allow digits, spaces, hyphens, plus signs, and parentheses
            const value = e.currentTarget.value
            const sanitized = value.replace(/[^\d\s\-+()]/g, '')
            if (value !== sanitized) {
              e.currentTarget.value = sanitized
            }
          }}
        />

        {/* Password Field */}
        <FormPasswordInput
          {...registerField('password')}
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
        />

        {/* Submit Button */}
        <FormButton isLoading={isLoading} loadingText="Creating account...">
          Create account
        </FormButton>
      </Fieldset>
    </form>
  )
}
