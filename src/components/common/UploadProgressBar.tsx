import type { UploadProgress } from '@/types'
import clsx from 'clsx'

interface UploadProgressBarProps {
  progress: UploadProgress
  className?: string
  mode?: 'upload' | 'update'
}

/**
 * Upload Progress Bar Component
 * Shows per-image upload/update progress at the top of the page
 * Matches the dark glassmorphism theme of the application
 */
export const UploadProgressBar = ({
  progress,
  className,
  mode = 'upload',
}: UploadProgressBarProps) => {
  const { currentImage, totalImages, currentImageName, percentage } = progress
  const actionText = mode === 'update' ? 'Updating' : 'Uploading'

  return (
    <div
      className={clsx(
        'fixed top-16 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-lg',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-4">
          {/* Progress Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-white truncate">
                {actionText} {currentImageName || `image ${currentImage}`}
              </p>
              <p className="text-sm text-white/60 ml-2">
                {currentImage} of {totalImages}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white/30 h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Percentage */}
          <div className="text-sm font-semibold text-white/80 min-w-12 text-right">
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
    </div>
  )
}
