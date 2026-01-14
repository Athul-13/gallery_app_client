import { useState } from 'react'
import { HiEye, HiEyeOff, HiLockClosed } from 'react-icons/hi'
import { FormInput } from './FormInput'

interface FormPasswordInputProps {
  label: string
  error?: string
  placeholder?: string
  showToggle?: boolean
  autoComplete?: 'new-password' | 'current-password' | 'password'
  [key: string]: unknown // Allow all other props (from react-hook-form)
}

/**
 * Reusable password input component with show/hide toggle
 */
export const FormPasswordInput = ({
  showToggle = true,
  autoComplete = 'new-password',
  ...props
}: FormPasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)

  const toggleButton = showToggle ? (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="flex items-center"
    >
      {showPassword ? (
        <HiEyeOff className="h-5 w-5 text-white/60 hover:text-white/80" />
      ) : (
        <HiEye className="h-5 w-5 text-white/60 hover:text-white/80" />
      )}
    </button>
  ) : undefined

  return (
    <FormInput
      {...props}
      icon={<HiLockClosed className="h-5 w-5 text-white/60" />}
      type={showPassword ? 'text' : 'password'}
      autoComplete={autoComplete}
      rightElement={toggleButton}
    />
  )
}
