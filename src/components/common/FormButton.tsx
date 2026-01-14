import type { ComponentProps } from 'react'
import clsx from 'clsx'

interface FormButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
}

/**
 * Reusable form submit button component
 */
export const FormButton = ({
  isLoading = false,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: FormButtonProps) => {
  return (
    <div className="pt-2">
      <button
        {...props}
        type="submit"
        disabled={isLoading || disabled}
        className={clsx(
          'w-full rounded-lg bg-white/10 px-4 py-3.5 sm:py-2.5 text-base sm:text-sm/6 font-semibold text-white shadow-sm',
          'hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/25',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]',
          className
        )}
      >
        {isLoading ? loadingText || 'Loading...' : children}
      </button>
    </div>
  )
}
