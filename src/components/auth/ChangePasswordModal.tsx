import { Dialog, DialogPanel, DialogTitle, Fieldset } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiX } from 'react-icons/hi'
import { useAuthStore } from '@/store'
import { FormPasswordInput } from '@/components/common/FormPasswordInput'
import { FormButton } from '@/components/common/FormButton'

/**
 * Change password form schema
 * Matches server-side validation requirements
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(6, 'New password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Change Password Modal Component
 * Allows authenticated users to change their password
 */
export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const changePassword = useAuthStore((state) => state.changePassword)
  const isLoading = useAuthStore((state) => state.isLoading)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword)
      reset()
      onClose()
    } catch {
      // Error is already handled in the store with toast
    }
  }

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isLoading) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md w-full rounded-lg bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <DialogTitle className="text-xl font-semibold text-white">
              Change Password
            </DialogTitle>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <Fieldset className="space-y-5 sm:space-y-6" disabled={isLoading}>
              {/* Current Password Field */}
              <FormPasswordInput
                {...register('currentPassword')}
                label="Current Password"
                placeholder="Enter your current password"
                autoComplete="current-password"
                error={errors.currentPassword?.message}
              />

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
              <FormButton isLoading={isLoading} loadingText="Changing password...">
                Change Password
              </FormButton>
            </Fieldset>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
