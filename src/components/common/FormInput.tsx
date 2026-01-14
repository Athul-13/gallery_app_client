import { Description, Field, Input, Label } from '@headlessui/react'
import type { ComponentProps, ReactNode } from 'react'
import clsx from 'clsx'

interface FormInputProps {
  label: string
  icon: ReactNode
  error?: string
  rightElement?: ReactNode
  [key: string]: unknown // Allow all other props to pass through
}

/**
 * Reusable form input component with icon and error handling
 */
export const FormInput = ({
  label,
  icon,
  error,
  rightElement,
  className,
  ...props
}: FormInputProps) => {
  const baseInputClasses = 'block w-full rounded-lg border-none bg-white/5 px-3 py-3.5 sm:py-2 pl-10 text-base sm:text-sm/6 text-white placeholder:text-white/50'
  const focusClasses = 'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
  const errorClasses = 'ring-1 ring-red-500/50 data-focus:ring-red-500 data-focus:outline-red-500/50'
  const iconContainerClasses = 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'

  const hasRightElement = !!rightElement
  const paddingRight = hasRightElement ? 'pr-10' : 'pr-3'

  return (
    <Field>
      <Label className="text-base sm:text-sm/6 font-medium text-white">{label}</Label>
      <div className="relative mt-3">
        <div className={iconContainerClasses}>
          {icon}
        </div>
        <Input
          {...(props as ComponentProps<typeof Input>)}
          className={clsx(
            baseInputClasses,
            paddingRight,
            focusClasses,
            error && errorClasses,
            className as string
          )}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <Description className="mt-1 text-sm sm:text-sm/6 text-red-400">
          {error}
        </Description>
      )}
    </Field>
  )
}
