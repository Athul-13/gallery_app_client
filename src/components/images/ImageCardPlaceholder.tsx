import { HiPhotograph, HiPlus } from 'react-icons/hi'
import clsx from 'clsx'

interface ImageCardPlaceholderProps {
  onClick: () => void
  className?: string
}

/**
 * Image Card Placeholder Component
 * Placeholder for uploading new images
 */
export const ImageCardPlaceholder = ({
  onClick,
  className,
}: ImageCardPlaceholderProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative aspect-square flex flex-col items-center justify-center rounded-lg bg-white/5 border-2 border-dashed border-white/20 hover:border-white/40 transition-all hover:bg-white/10',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/25',
        className
      )}
      aria-label="Upload images"
    >
      <div className="flex flex-col items-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
        <div className="relative">
          <HiPhotograph className="h-12 w-12" />
          <HiPlus className="h-6 w-6 absolute -top-1 -right-1 bg-white/10 rounded-full p-1" />
        </div>
        <span className="text-sm font-medium">Upload Images</span>
      </div>
    </button>
  )
}
