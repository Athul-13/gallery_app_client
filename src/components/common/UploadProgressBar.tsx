import type { UploadProgress } from '@/types'
import clsx from 'clsx'

interface UploadProgressBarProps {
  progress: UploadProgress
  className?: string
}

/**
 * Upload Progress Bar Component
 * Shows per-image upload progress at the top of the page
 */
export const UploadProgressBar = ({
  progress,
  className,
}: UploadProgressBarProps) => {
  const { currentImage, totalImages, currentImageName, percentage } = progress

  return (
    <div
      className={clsx(
        'fixed top-16 left-0 right-0 z-50 bg-blue-600 text-white shadow-lg',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-4">
          {/* Progress Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium truncate">
                Uploading {currentImageName || `image ${currentImage}`}
              </p>
              <p className="text-sm text-blue-100 ml-2">
                {currentImage} of {totalImages}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Percentage */}
          <div className="text-sm font-semibold text-blue-100 min-w-[3rem] text-right">
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
    </div>
  )
}
